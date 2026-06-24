import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/lib/site'
import { makeVerifyToken } from '@/lib/identity-verification'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESEND_KEY = process.env.RESEND_API_KEY

export async function POST(req: Request) {
  try {
    const { userId, documentUrl } = await req.json()
    if (!userId || !documentUrl) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
    }

    // Upsert and read back the row id so we can build signed action links.
    const { data: row } = await supabase
      .from('identity_verifications')
      .upsert(
        { user_id: userId, document_url: documentUrl, status: 'pending', reviewed_at: null, notes: null },
        { onConflict: 'user_id' }
      )
      .select('id')
      .maybeSingle()

    const verificationId = row?.id

    // Notify admins that a new ID document is awaiting review.
    if (RESEND_KEY && verificationId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle()
      const { data: target } = await supabase.auth.admin.getUserById(userId)
      const fullName = profile?.full_name ?? '—'
      const email = target?.user?.email ?? '—'

      const token = makeVerifyToken(verificationId, userId)
      const q = `vid=${encodeURIComponent(verificationId)}&uid=${encodeURIComponent(userId)}&token=${token}`
      const confirmUrl = `${SITE_URL}/admin/confirm-id?${q}&doc=${encodeURIComponent(documentUrl)}`
      const rejectUrl = `${SITE_URL}/admin/reject-id?${q}`

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'BuySellSeychelles <noreply@buysellseychelles.com>',
          to: ['buysellseychelles@gmail.com'],
          subject: `[Identity] New verification from ${fullName}`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;color:#1a1a1a">
              <div style="background:linear-gradient(135deg,#003F87 0%,#00264f 100%);padding:20px 24px;border-radius:12px 12px 0 0">
                <h2 style="color:#fff;margin:0;font-size:18px">🪪 New identity verification — BuySellSeychelles</h2>
              </div>
              <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
                <p style="font-size:14px;margin:0 0 12px">A user submitted an ID document for verification.</p>
                <table style="width:100%;border-collapse:collapse">
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px">Name</td><td style="padding:6px 0;font-size:13px;font-weight:600">${fullName}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td><td style="padding:6px 0;font-size:13px">${email}</td></tr>
                  <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">User ID</td><td style="padding:6px 0;font-size:13px;font-family:monospace">${userId}</td></tr>
                </table>

                <!-- Submitted document preview (also linked below in case images are blocked) -->
                <p style="font-size:12px;color:#6b7280;margin:18px 0 8px;text-transform:uppercase;letter-spacing:0.5px;font-weight:700">Submitted document</p>
                <a href="${documentUrl}" target="_blank" style="display:block;text-decoration:none">
                  <img src="${documentUrl}" alt="Submitted ID document" style="display:block;max-width:100%;border:1px solid #e5e7eb;border-radius:10px" />
                </a>
                <p style="margin:8px 0 0"><a href="${documentUrl}" target="_blank" style="font-size:12px;color:#003F87">Open document in full size →</a></p>

                <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>

                <!-- One-click decision buttons -->
                <table cellpadding="0" cellspacing="0"><tr>
                  <td style="padding-right:10px">
                    <a href="${confirmUrl}" style="display:inline-block;background:#007A3D;color:#fff;text-decoration:none;padding:11px 22px;border-radius:8px;font-size:13px;font-weight:700">✓ Confirm ID</a>
                  </td>
                  <td>
                    <a href="${rejectUrl}" style="display:inline-block;background:#BE0027;color:#fff;text-decoration:none;padding:11px 22px;border-radius:8px;font-size:13px;font-weight:700">✗ Reject ID</a>
                  </td>
                </tr></table>
                <p style="font-size:11px;color:#9ca3af;margin-top:16px"><strong>Confirm ID</strong> opens a page to review the document and activate the badge. <strong>Reject ID</strong> opens a page to pick the reason(s) before notifying the seller.</p>
              </div>
            </div>
          `,
        }),
      }).catch(err => console.error('[verify-identity] email error:', err))
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}