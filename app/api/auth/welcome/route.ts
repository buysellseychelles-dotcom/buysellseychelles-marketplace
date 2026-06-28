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
    const { userId } = await req.json()
    if (!userId || !RESEND_KEY) return NextResponse.json({ ok: false })

    const { data: userRecord } = await supabase.auth.admin.getUserById(userId)
    const email = userRecord?.user?.email
    if (!email) return NextResponse.json({ ok: false })

    // Éviter les doublons : marquer welcome_sent dans profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('welcome_sent')
      .eq('id', userId)
      .single()

    if (profile?.welcome_sent) return NextResponse.json({ ok: true, skipped: true })

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'BuySellSeychelles <noreply@buysellseychelles.com>',
        to: [email],
        subject: '🌴 Welcome to BuySellSeychelles!',
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;padding:20px;background:#f0f4f8">

            <!-- Header flag gradient -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:14px 14px 0 0;overflow:hidden">
              <tr>
                <td style="background:linear-gradient(135deg,#003F87 0%,#003F87 20%,#FCD116 40%,#BE0027 55%,#ffffff 72%,#007A3D 88%,#007A3D 100%);padding:0">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:rgba(0,0,0,0.22);padding:32px 24px;text-align:center">
                        <img src="${SITE_URL}/logo-email.png" width="56" height="56" alt="BuySellSeychelles" style="display:block;margin:0 auto 10px;border-radius:14px" />
                        <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700">BuySellSeychelles</h1>
                        <p style="color:rgba(255,255,255,0.82);margin:6px 0 0;font-size:13px">The Seychelles marketplace</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Body -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 14px 14px">
              <tr>
                <td style="padding:28px 28px 32px">
                  <p style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px">Welcome aboard! 👋</p>
                  <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 24px">
                    Your account is now active. Start buying and selling on BuySellSeychelles — the easiest way to buy and sell on Mahé, Praslin, La Digue and the other islands.
                  </p>

                  <!-- Get started steps — table layout for email compatibility -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;margin-bottom:24px">
                    <tr>
                      <td style="padding:18px 18px 10px">
                        <p style="font-size:12px;font-weight:700;color:#374151;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.5px">Get started in 3 steps</p>

                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
                          <tr>
                            <td style="width:28px;vertical-align:top;padding-top:1px">
                              <span style="display:inline-block;background-color:#003F87;color:#ffffff;border-radius:50%;width:22px;height:22px;text-align:center;font-size:11px;font-weight:700;line-height:22px">1</span>
                            </td>
                            <td style="padding-left:10px">
                              <p style="margin:0;color:#555;font-size:13px;line-height:1.5">Complete your profile to get the <strong style="color:#111">✓ Verified</strong> badge</p>
                            </td>
                          </tr>
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
                          <tr>
                            <td style="width:28px;vertical-align:top;padding-top:1px">
                              <span style="display:inline-block;background-color:#FCD116;color:#1a1a1a;border-radius:50%;width:22px;height:22px;text-align:center;font-size:11px;font-weight:700;line-height:22px">2</span>
                            </td>
                            <td style="padding-left:10px">
                              <p style="margin:0;color:#555;font-size:13px;line-height:1.5">Post your first listing — it's <strong style="color:#111">free</strong></p>
                            </td>
                          </tr>
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px">
                          <tr>
                            <td style="width:28px;vertical-align:top;padding-top:1px">
                              <span style="display:inline-block;background-color:#007A3D;color:#ffffff;border-radius:50%;width:22px;height:22px;text-align:center;font-size:11px;font-weight:700;line-height:22px">3</span>
                            </td>
                            <td style="padding-left:10px">
                              <p style="margin:0;color:#555;font-size:13px;line-height:1.5">Save searches to get notified of new listings</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding-bottom:24px">
                        <a href="${SITE_URL}/post-ad"
                          style="display:inline-block;background-color:#003F87;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:14px;font-weight:700;font-family:Arial,sans-serif">
                          Post my first listing →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="color:#d1d5db;font-size:11px;text-align:center;margin:0">
                    © 2025 BuySellSeychelles ·
                    <a href="${SITE_URL}" style="color:#d1d5db;text-decoration:none">buysellseychelles.com</a>
                  </p>
                </td>
              </tr>
            </table>
          </div>
        `,
      }),
    })

    await supabase.from('profiles').upsert({ id: userId, welcome_sent: true })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
