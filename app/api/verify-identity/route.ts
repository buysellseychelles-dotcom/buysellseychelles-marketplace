import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    await supabase.from('identity_verifications').upsert(
      { user_id: userId, document_url: documentUrl, status: 'pending', reviewed_at: null, notes: null },
      { onConflict: 'user_id' }
    )

    // Notify admins that a new ID document is awaiting review.
    if (RESEND_KEY) {
      // Pull name + email for context (best-effort; email still sends without them).
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle()
      const { data: target } = await supabase.auth.admin.getUserById(userId)
      const fullName = profile?.full_name ?? '—'
      const email = target?.user?.email ?? '—'

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
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
                <a href="${documentUrl}" style="display:inline-block;background:#003F87;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;margin-right:8px">View document →</a>
                <a href="https://buysellseychelles.com/admin/verifications" style="display:inline-block;background:#BE0027;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600">Review in admin →</a>
                <p style="font-size:11px;color:#9ca3af;margin-top:16px">This submission is pending review in your admin dashboard.</p>
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