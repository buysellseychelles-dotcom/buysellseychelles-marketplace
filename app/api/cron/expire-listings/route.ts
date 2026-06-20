import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyCronSecret } from '@/lib/rate-limit'
import { deleteListingPhotos } from '@/lib/storage-cleanup'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SITE_URL = 'https://buysellseychelles.com'
const RESEND_KEY = process.env.RESEND_API_KEY

// daysLeft <= 0 → l'annonce expire aujourd'hui même (avis « jour J »).
async function sendRenewalEmail(email: string, listingTitle: string, listingId: string, daysLeft: number) {
  if (!RESEND_KEY) return
  const isFinal = daysLeft <= 0
  const when = isFinal
    ? 'today'
    : `in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`
  const subject = isFinal
    ? `⏳ Last chance — your listing expires today: ${listingTitle}`
    : `⏳ Your listing expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}: ${listingTitle}`
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'BuySellSeychelles <noreply@buysellseychelles.com>',
      to: [email],
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
          <div style="background:linear-gradient(135deg,#003F87 0%,#003F87 40%,#007A3D 100%);padding:20px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:20px">BuySellSeychelles</h1>
          </div>
          <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee">
            <p style="font-size:16px;font-weight:600;color:#111;margin-top:0">
              ${isFinal ? '⏳ Your listing expires today' : `⏳ Your listing expires ${when}`}
            </p>
            <p style="color:#555;font-size:14px">
              Your listing <strong>"${listingTitle}"</strong> ${isFinal ? 'expires today' : `will expire ${when}`} and will no longer be visible to buyers.
            </p>
            <p style="color:#555;font-size:14px">Renew it in one click to keep it active for another 60 days.</p>
            <a href="${SITE_URL}/dashboard"
              style="display:inline-block;background:#003F87;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;margin-top:8px">
              Renew my listing →
            </a>
            <p style="color:#999;font-size:12px;margin-top:20px">
              You are receiving this email because you have an active listing on BuySellSeychelles.
            </p>
          </div>
        </div>
      `,
    }),
  })
}

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) {
    return new Response('Unauthorized', { status: 401 })
  }
  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
  // Délai de grâce : une annonce expirée reste renouvelable pendant 30 jours.
  // Au-delà, ses photos sont purgées du Storage pour éviter l'accumulation
  // de fichiers orphelins. La fenêtre basse (90 j) borne le travail du cron :
  // les annonces expirées depuis plus longtemps ont déjà été purgées.
  const purgeUpper = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const purgeLower = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  // 1. Handle listings past their expiry date.
  //    PRO sellers get their listings auto-renewed for another 60 days;
  //    everyone else's listing is marked expired.
  const { data: toExpire } = await supabase
    .from('listings')
    .select('id, user_id')
    .lt('expires_at', now.toISOString())
    .not('status', 'in', '("sold","expired")')

  let proRenewed = 0
  if (toExpire && toExpire.length > 0) {
    const ownerIds = [...new Set(toExpire.map(l => l.user_id).filter(Boolean))]
    let proOwners = new Set<string>()
    if (ownerIds.length > 0) {
      const { data: pros } = await supabase
        .from('profiles').select('id').eq('is_pro', true).in('id', ownerIds)
      proOwners = new Set((pros ?? []).map((p: any) => p.id))
    }

    const proIds    = toExpire.filter(l => proOwners.has(l.user_id)).map(l => l.id)
    const expireIds = toExpire.filter(l => !proOwners.has(l.user_id)).map(l => l.id)

    if (proIds.length > 0) {
      const renewedUntil = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
      await supabase
        .from('listings')
        .update({ expires_at: renewedUntil, renewal_email_sent: false, final_notice_sent: false })
        .in('id', proIds)
      proRenewed = proIds.length
    }

    if (expireIds.length > 0) {
      await supabase
        .from('listings')
        .update({ status: 'expired' })
        .in('id', expireIds)
    }
  }

  // 2. Avertissement « 7 jours avant » — une seule fois par cycle (renewal_email_sent)
  const { data: expiringSoon } = await supabase
    .from('listings')
    .select('id, title, expires_at, user_id')
    .gte('expires_at', now.toISOString())
    .lte('expires_at', in7Days.toISOString())
    .eq('renewal_email_sent', false)
    .not('status', 'in', '("sold","expired")')

  let emailsSent = 0
  for (const listing of expiringSoon ?? []) {
    const { data: userRecord } = await supabase.auth.admin.getUserById(listing.user_id)
    const email = userRecord?.user?.email
    if (!email) continue

    const expiresAt = new Date(listing.expires_at)
    const daysLeft = Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    await sendRenewalEmail(email, listing.title, listing.id, daysLeft)
    await supabase.from('listings').update({ renewal_email_sent: true }).eq('id', listing.id)

    // In-app notification
    await supabase.from('notifications').insert({
      user_id: listing.user_id,
      title: `⏳ Your listing expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
      body: `"${listing.title}" will expire soon. Renew it to keep it visible.`,
      link: '/dashboard',
    })

    emailsSent++
  }

  // 2b. Avis « jour J » — l'annonce expire dans ≤ 24 h (final_notice_sent)
  const { data: expiringToday } = await supabase
    .from('listings')
    .select('id, title, expires_at, user_id')
    .gte('expires_at', now.toISOString())
    .lte('expires_at', in1Day.toISOString())
    .eq('final_notice_sent', false)
    .not('status', 'in', '("sold","expired")')

  let finalNoticesSent = 0
  for (const listing of expiringToday ?? []) {
    const { data: userRecord } = await supabase.auth.admin.getUserById(listing.user_id)
    const email = userRecord?.user?.email

    if (email) {
      // daysLeft = 0 → email « expires today »
      await sendRenewalEmail(email, listing.title, listing.id, 0)
    }
    await supabase.from('listings').update({ final_notice_sent: true }).eq('id', listing.id)

    await supabase.from('notifications').insert({
      user_id: listing.user_id,
      title: `⏳ Last chance — "${listing.title}" expires today`,
      body: 'Renew it now in one click to keep it visible to buyers.',
      link: '/dashboard',
    })

    finalNoticesSent++
  }

  // 3. Purge des photos des annonces expirées au-delà du délai de grâce
  const { data: toPurge } = await supabase
    .from('listings')
    .select('id')
    .eq('status', 'expired')
    .lt('expires_at', purgeUpper.toISOString())
    .gte('expires_at', purgeLower.toISOString())

  let photosPurged = 0
  if (toPurge && toPurge.length > 0) {
    photosPurged = await deleteListingPhotos(supabase, toPurge.map(l => l.id))
  }

  return NextResponse.json({
    ok: true,
    expired: (toExpire?.length ?? 0) - proRenewed,
    proRenewed,
    emailsSent,
    finalNoticesSent,
    photosPurged,
  })
}
