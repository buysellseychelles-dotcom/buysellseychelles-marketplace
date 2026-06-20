import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIP, tooManyRequests } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESEND_KEY = process.env.RESEND_API_KEY

// Auto-block an account once this many DISTINCT users have reported it.
const AUTO_BLOCK_THRESHOLD = 5

// Counts distinct reporters against an account (direct user reports + reports on
// any of its listings) and bans the account once the threshold is reached.
async function maybeAutoBlock(ownerId: string) {
  // Gather the owner's listing ids so listing reports count toward the owner.
  const { data: ownerListings } = await supabase
    .from('listings')
    .select('id')
    .eq('user_id', ownerId)
  const listingIds = (ownerListings ?? []).map(l => l.id)

  // Pull every report targeting this owner, directly or via their listings.
  const orParts = [`reported_user_id.eq.${ownerId}`]
  if (listingIds.length) orParts.push(`listing_id.in.(${listingIds.join(',')})`)
  const { data: reports } = await supabase
    .from('reports')
    .select('user_id')
    .or(orParts.join(','))

  // Distinct, non-anonymous reporters only (prevents one person mass-reporting,
  // and anonymous reports cannot be deduped so they don't trigger the ban).
  const reporters = new Set(
    (reports ?? []).map(r => r.user_id).filter((id): id is string => !!id)
  )
  if (reporters.size < AUTO_BLOCK_THRESHOLD) return

  // Skip if the account is already banned (keeps this idempotent).
  const { data: target } = await supabase.auth.admin.getUserById(ownerId)
  const bannedUntil = (target?.user as { banned_until?: string } | undefined)?.banned_until
  if (bannedUntil && new Date(bannedUntil).getTime() > Date.now()) return

  // Ban access + hide active listings (same mechanism as the admin panel).
  await supabase.auth.admin.updateUserById(ownerId, { ban_duration: '876000h' })
  await supabase.from('listings').update({ status: 'expired' }).eq('user_id', ownerId).not('status', 'eq', 'sold')

  const email = target?.user?.email ?? '—'
  if (RESEND_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BuySellSeychelles <noreply@buysellseychelles.com>',
        to: ['reportbuysellseychelles@gmail.com'],
        subject: `[Auto-block] Account banned after ${reporters.size} reports`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;color:#1a1a1a">
            <div style="background:linear-gradient(135deg,#BE0027 0%,#7f0018 100%);padding:20px 24px;border-radius:12px 12px 0 0">
              <h2 style="color:#fff;margin:0;font-size:18px">🚫 Account auto-blocked — BuySellSeychelles</h2>
            </div>
            <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
              <p style="font-size:14px;margin:0 0 12px">An account was automatically blocked after reaching <strong>${reporters.size}</strong> distinct reports (threshold: ${AUTO_BLOCK_THRESHOLD}).</p>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px">User ID</td><td style="padding:6px 0;font-size:13px;font-family:monospace">${ownerId}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td><td style="padding:6px 0;font-size:13px">${email}</td></tr>
                <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Distinct reports</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#BE0027">${reporters.size}</td></tr>
              </table>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
              <a href="https://buysellseychelles.com/admin" style="display:inline-block;background:#003F87;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600">Review in admin →</a>
              <p style="font-size:11px;color:#9ca3af;margin-top:16px">You can unban this account from the admin user panel if this was a mistake.</p>
            </div>
          </div>
        `,
      }),
    }).catch(err => console.error('[report] auto-block email error:', err))
  }
}

export async function POST(req: Request) {
  const ip = getClientIP(req)
  const rl = rateLimit(`report:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) return tooManyRequests(rl.resetAt)

  try {
    const { listingId, reportedUserId, reason, userId } = await req.json()

    if (!reason || (!listingId && !reportedUserId)) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
    }

    await supabase.from('reports').insert({
      listing_id: listingId ?? null,
      reported_user_id: reportedUserId ?? null,
      reason,
      user_id: userId ?? null,
      resolved: false,
      created_at: new Date().toISOString(),
    })

    // Fetch listing title + owner for email context and auto-block resolution.
    let listingTitle = listingId ?? '—'
    let ownerId: string | null = reportedUserId ?? null
    if (listingId) {
      const { data: listing } = await supabase
        .from('listings')
        .select('title, user_id')
        .eq('id', listingId)
        .maybeSingle()
      if (listing?.title) listingTitle = listing.title
      if (!ownerId && listing?.user_id) ownerId = listing.user_id
    }

    if (RESEND_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'BuySellSeychelles <noreply@buysellseychelles.com>',
          to: ['reportbuysellseychelles@gmail.com'],
          subject: `[Report] ${reason} — ${listingTitle}`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;color:#1a1a1a">
              <div style="background:linear-gradient(135deg,#BE0027 0%,#7f0018 100%);padding:20px 24px;border-radius:12px 12px 0 0">
                <h2 style="color:#fff;margin:0;font-size:18px">⚠️ New listing report — BuySellSeychelles</h2>
              </div>
              <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
                <table style="width:100%;border-collapse:collapse">
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px">Reason</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#BE0027">${reason}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Listing</td><td style="padding:6px 0;font-size:13px">${listingTitle}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Listing ID</td><td style="padding:6px 0;font-size:13px;font-family:monospace">${listingId ?? '—'}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Reported user</td><td style="padding:6px 0;font-size:13px;font-family:monospace">${reportedUserId ?? '—'}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Reported by</td><td style="padding:6px 0;font-size:13px;font-family:monospace">${userId ?? 'Anonymous'}</td></tr>
                </table>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
                ${listingId ? `<a href="https://buysellseychelles.com/listing/${listingId}" style="display:inline-block;background:#003F87;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600">View listing →</a>` : ''}
                <p style="font-size:11px;color:#9ca3af;margin-top:16px">This report has been saved in your admin dashboard.</p>
              </div>
            </div>
          `,
        }),
      }).catch(err => console.error('[report] email error:', err))
    }

    // Auto-block the reported account if it crossed the reports threshold.
    if (ownerId) {
      await maybeAutoBlock(ownerId).catch(err => console.error('[report] auto-block error:', err))
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
