import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyCronSecret } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SITE_URL = 'https://buysellseychelles.com'
const RESEND_KEY = process.env.RESEND_API_KEY

async function sendRenewalEmail(email: string, listingTitle: string, listingId: string, daysLeft: number) {
  if (!RESEND_KEY) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'BuySellSeychelles <noreply@buysellseychelles.com>',
      to: [email],
      subject: `⏳ Your listing expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}: ${listingTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
          <div style="background:#000;padding:20px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:20px">BuySellSeychelles</h1>
          </div>
          <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee">
            <p style="font-size:16px;font-weight:600;color:#111;margin-top:0">
              ⏳ Your listing expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}
            </p>
            <p style="color:#555;font-size:14px">
              Your listing <strong>"${listingTitle}"</strong> will expire in ${daysLeft} day${daysLeft > 1 ? 's' : ''} and will no longer be visible to buyers.
            </p>
            <p style="color:#555;font-size:14px">Renew it in one click to keep it active for another 60 days.</p>
            <a href="${SITE_URL}/dashboard"
              style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;margin-top:8px">
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
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  // 1. Expire listings past their expiry date
  const { data: toExpire } = await supabase
    .from('listings')
    .select('id')
    .lt('expires_at', now.toISOString())
    .not('status', 'in', '("sold","expired")')

  if (toExpire && toExpire.length > 0) {
    await supabase
      .from('listings')
      .update({ status: 'expired' })
      .in('id', toExpire.map(l => l.id))
  }

  // 2. Send warning emails for listings expiring in ≤ 3 days
  const { data: expiringSoon } = await supabase
    .from('listings')
    .select('id, title, expires_at, user_id')
    .gte('expires_at', now.toISOString())
    .lte('expires_at', in3Days.toISOString())
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

  return NextResponse.json({
    ok: true,
    expired: toExpire?.length ?? 0,
    emailsSent,
  })
}
