import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SITE_URL = 'https://buysellseychelles.com'
const RESEND_KEY = process.env.RESEND_API_KEY

export async function PATCH(req: Request) {
  try {
    const { verificationId, userId, action, notes } = await req.json()
    if (!verificationId || !userId || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    await supabase.from('identity_verifications').update({
      status: action,
      notes: notes ?? null,
      reviewed_at: new Date().toISOString(),
    }).eq('id', verificationId)

    if (action === 'approved') {
      await supabase.from('profiles').update({ id_verified: true }).eq('id', userId)
    } else {
      await supabase.from('profiles').update({ id_verified: false }).eq('id', userId)
    }

    // Notify the user of the review outcome (best-effort).
    if (RESEND_KEY) {
      const { data: target } = await supabase.auth.admin.getUserById(userId)
      const email = target?.user?.email
      if (email) {
        const approved = action === 'approved'
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'BuySellSeychelles <noreply@buysellseychelles.com>',
            to: [email],
            subject: approved
              ? '✓ Your identity has been verified — BuySellSeychelles'
              : 'Identity verification update — BuySellSeychelles',
            html: `
              <div style="font-family:sans-serif;max-width:520px;color:#1a1a1a">
                <div style="background:${approved ? 'linear-gradient(135deg,#007A3D 0%,#005c2e 100%)' : 'linear-gradient(135deg,#BE0027 0%,#7f0018 100%)'};padding:20px 24px;border-radius:12px 12px 0 0">
                  <h2 style="color:#fff;margin:0;font-size:18px">${approved ? '✓ Identity verified' : '🪪 Identity verification update'}</h2>
                </div>
                <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
                  ${approved
                    ? `<p style="font-size:14px;line-height:1.7;margin:0 0 16px">Good news! Your identity document has been reviewed and <strong style="color:#007A3D">approved</strong>. You now have the verified badge on your profile.</p>`
                    : `<p style="font-size:14px;line-height:1.7;margin:0 0 16px">We reviewed your identity document but could not approve it at this time.</p>
                       ${notes ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 14px;margin:0 0 16px"><p style="font-size:13px;color:#7f0018;margin:0"><strong>Reason:</strong> ${notes}</p></div>` : ''}
                       <p style="font-size:14px;line-height:1.7;margin:0 0 16px">You can submit a new document from your dashboard.</p>`
                  }
                  <a href="${SITE_URL}/dashboard" style="display:inline-block;background:#003F87;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600">Go to dashboard →</a>
                  <p style="font-size:11px;color:#9ca3af;margin-top:16px">© 2025 BuySellSeychelles · buysellseychelles.com</p>
                </div>
              </div>
            `,
          }),
        }).catch(err => console.error('[admin/verify] email error:', err))
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
