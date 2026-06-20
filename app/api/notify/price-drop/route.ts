import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SITE_URL = 'https://buysellseychelles.com'
const RESEND_KEY = process.env.RESEND_API_KEY

export async function POST(req: Request) {
  try {
    const { listingId, oldPrice, newPrice, title } = await req.json()
    if (!listingId || oldPrice == null || newPrice == null) {
      return NextResponse.json({ ok: false })
    }

    const oldP = Number(oldPrice)
    const newP = Number(newPrice)
    if (oldP === newP) return NextResponse.json({ ok: false })

    const isIncrease = newP > oldP
    const changePercent = Math.round(Math.abs(((newP - oldP) / oldP) * 100))
    const icon = isIncrease ? '📈' : '📉'
    const direction = isIncrease ? 'increased' : 'dropped'
    const notifTitle = isIncrease
      ? `📈 Price increase on a saved listing`
      : `📉 Price drop on a saved listing`
    const notifBody = `"${title}" ${direction} by ${changePercent}% — now ${newP.toLocaleString()} SCR`
    const emailSubject = `${icon} Price ${isIncrease ? 'increase' : 'drop'}: ${title}`
    const newColor = isIncrease ? '#dc2626' : '#16a34a'

    // Trouver tous les utilisateurs qui ont sauvegardé cette annonce
    const { data: favs } = await supabase
      .from('favorites')
      .select('user_id')
      .eq('listing_id', listingId)

    if (!favs || favs.length === 0) return NextResponse.json({ ok: true, notified: 0 })

    let notified = 0
    for (const fav of favs) {
      // Notification in-app
      const { error: insertError } = await supabase.from('notifications').insert({
        user_id: fav.user_id,
        title: notifTitle,
        body: notifBody,
        link: `/listing/${listingId}`,
        read: false,
      })
      if (insertError) console.error('[notify/price-drop] insert error:', insertError.message)

      // Email
      if (RESEND_KEY) {
        const { data: userRecord } = await supabase.auth.admin.getUserById(fav.user_id)
        const email = userRecord?.user?.email
        if (email) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'BuySellSeychelles <noreply@buysellseychelles.com>',
              to: [email],
              subject: emailSubject,
              html: `
                <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
                  <div style="background:#000;padding:20px;border-radius:12px 12px 0 0;text-align:center">
                    <h1 style="color:#fff;margin:0;font-size:20px">BuySellSeychelles</h1>
                  </div>
                  <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee">
                    <p style="font-size:16px;font-weight:600;color:#111;margin-top:0">
                      ${icon} Price ${isIncrease ? 'increase' : 'drop'} on a listing you saved!
                    </p>
                    <p style="color:#555;font-size:14px">
                      <strong>"${title}"</strong> just ${direction} by <strong>${changePercent}%</strong>.
                    </p>
                    <div style="background:#fff;border:1px solid #e5e5e5;border-radius:8px;padding:16px;margin:16px 0;display:flex;justify-content:space-between;align-items:center">
                      <div>
                        <p style="color:#999;font-size:12px;margin:0">Was</p>
                        <p style="color:#999;font-size:18px;font-weight:600;margin:4px 0;text-decoration:line-through">${oldP.toLocaleString()} SCR</p>
                      </div>
                      <p style="font-size:24px;margin:0">→</p>
                      <div>
                        <p style="color:${newColor};font-size:12px;margin:0">Now</p>
                        <p style="color:${newColor};font-size:22px;font-weight:700;margin:4px 0">${newP.toLocaleString()} SCR</p>
                      </div>
                    </div>
                    <a href="${SITE_URL}/listing/${listingId}"
                      style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
                      View listing →
                    </a>
                    <p style="color:#999;font-size:12px;margin-top:20px">
                      You saved this listing on BuySellSeychelles. <a href="${SITE_URL}/favorites" style="color:#999">Manage your saves</a>
                    </p>
                  </div>
                </div>
              `,
            }),
          })
        }
      }

      notified++
    }

    return NextResponse.json({ ok: true, notified })
  } catch (err) {
    console.error('[notify/price-drop] error:', err)
    return NextResponse.json({ ok: false })
  }
}
