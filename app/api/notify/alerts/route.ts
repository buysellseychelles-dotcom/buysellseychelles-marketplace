import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPushToUser } from '@/lib/push'
import { verifyCronSecret } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  if (!verifyCronSecret(req)) return new Response('Unauthorized', { status: 401 })

  try {
    const { listingId } = await req.json()
    if (!listingId) return NextResponse.json({ ok: false })

    const { data: listing } = await supabase
      .from('listings')
      .select('id, title, price, category, location, description')
      .eq('id', listingId)
      .single()

    if (!listing) return NextResponse.json({ ok: false })

    const { data: alerts } = await supabase.from('search_alerts').select('*')
    if (!alerts || alerts.length === 0) return NextResponse.json({ ok: true, sent: 0 })

    const matches = alerts.filter((alert: any) => {
      const titleDesc = `${listing.title} ${listing.description ?? ''}`.toLowerCase()
      if (alert.keywords && !alert.keywords.toLowerCase().split(' ').some((kw: string) => titleDesc.includes(kw))) return false
      if (alert.category && listing.category !== alert.category) return false
      if (alert.island && !listing.location?.toLowerCase().includes(alert.island.toLowerCase())) return false
      if (alert.max_price && listing.price > alert.max_price) return false
      return true
    })

    if (matches.length === 0) return NextResponse.json({ ok: true, sent: 0 })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
    let sent = 0

    for (const alert of matches) {
      const { data: { user } } = await supabase.auth.admin.getUserById(alert.user_id)
      if (!user?.email) continue

      // Notification in-app
      await supabase.from('notifications').insert({
        user_id: alert.user_id,
        title: `🔔 New listing: ${listing.title}`,
        body: listing.price ? `${Number(listing.price).toLocaleString()} SCR${listing.location ? ` · ${listing.location}` : ''}` : listing.location ?? null,
        link: `/listing/${listing.id}`,
      })

      // Notification push
      await sendPushToUser(alert.user_id, {
        title: `🔔 ${listing.title}`,
        body: listing.price ? `${Number(listing.price).toLocaleString()} SCR${listing.location ? ` · ${listing.location}` : ''}` : 'New matching listing',
        url: `/listing/${listing.id}`,
      })

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'BuySellSeychelles <noreply@buysellseychelles.com>',
          to: user.email,
          subject: `🔔 New listing: ${listing.title}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
              <div style="background:linear-gradient(135deg,#003F87 0%,#003F87 50%,#007A3D 100%);color:#fff;padding:24px;border-radius:12px 12px 0 0">
                <h2 style="margin:0;font-size:18px">🔔 New listing matching your alert</h2>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.72);font-size:13px">Alert: <strong>${alert.label}</strong></p>
              </div>
              <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px">
                <h3 style="margin:0 0 8px;font-size:16px">${listing.title}</h3>
                ${listing.price ? `<p style="font-size:18px;font-weight:bold;margin:0 0 8px">${Number(listing.price).toLocaleString()} SCR</p>` : ''}
                ${listing.location ? `<p style="color:#666;font-size:13px;margin:0 0 16px">📍 ${listing.location}</p>` : ''}
                <a href="${siteUrl}/listing/${listing.id}"
                  style="display:inline-block;background:#003F87;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px">
                  View listing →
                </a>
                <p style="margin:16px 0 0;font-size:12px;color:#999">
                  To stop receiving these alerts, go to your
                  <a href="${siteUrl}/alerts" style="color:#000">My alerts</a> page
                  or <a href="${siteUrl}/dashboard" style="color:#999;text-decoration:underline">manage email preferences</a>.
                </p>
              </div>
            </div>
          `,
        }),
      })
      sent++
    }

    return NextResponse.json({ ok: true, sent })
  } catch (err) {
    console.error('Alert notify error:', err)
    return NextResponse.json({ ok: false })
  }
}
