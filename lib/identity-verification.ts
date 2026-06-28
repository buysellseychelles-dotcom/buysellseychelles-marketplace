import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SITE_URL } from './site'

// HMAC secret for one-click email actions. The service-role key is server-only
// and never shipped to the client, so it makes a safe signing secret.
const TOKEN_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dev-secret'
const RESEND_KEY = process.env.RESEND_API_KEY

// Signs a verification id + user id so the approve/reject links embedded in the
// admin email cannot be forged or replayed against another submission.
export function makeVerifyToken(verificationId: string, userId: string): string {
  return crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`${verificationId}:${userId}`)
    .digest('hex')
    .slice(0, 32)
}

export function checkVerifyToken(verificationId: string, userId: string, token: string): boolean {
  if (!token) return false
  const expected = makeVerifyToken(verificationId, userId)
  if (token.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
}

type Decision = {
  verificationId: string
  userId: string
  action: 'approved' | 'rejected'
  reasons?: string[]
  notes?: string | null
}

// Applies an approve/reject decision: updates the verification row + profile
// badge, then emails the seller the outcome. Shared by the in-app admin panel
// and the one-click email actions so both stay in sync.
export async function applyVerificationDecision(
  supabase: SupabaseClient,
  { verificationId, userId, action, reasons, notes }: Decision,
): Promise<void> {
  const approved = action === 'approved'

  // Combine selected reasons + free-text note into the stored notes column.
  const combinedNotes = [...(reasons ?? []), notes].filter(Boolean).join(' — ') || null

  await supabase
    .from('identity_verifications')
    .update({ status: action, notes: combinedNotes, reviewed_at: new Date().toISOString() })
    .eq('id', verificationId)

  await supabase.from('profiles').update({ id_verified: approved }).eq('id', userId)

  // Notify the seller of the outcome (best-effort).
  if (!RESEND_KEY) return
  const { data: target } = await supabase.auth.admin.getUserById(userId)
  const email = target?.user?.email
  if (!email) return

  const reasonsList = (reasons ?? []).filter(Boolean)
  const rejectBody = `
    <p style="font-size:14px;line-height:1.7;margin:0 0 16px">We reviewed your identity document but could not approve it at this time${reasonsList.length ? ' for the following reason(s):' : '.'}</p>
    ${reasonsList.length ? `<ul style="margin:0 0 16px;padding-left:18px;color:#7f0018;font-size:13px;line-height:1.8">${reasonsList.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}
    ${notes ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 14px;margin:0 0 16px"><p style="font-size:13px;color:#7f0018;margin:0">${notes}</p></div>` : ''}
    <p style="font-size:14px;line-height:1.7;margin:0 0 16px">Please submit a new, valid document from your dashboard and we'll review it again.</p>
  `

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
            <p style="margin:0 0 10px">
              <img src="https://buysellseychelles.com/logo-email.png" width="26" height="26" alt="" style="display:inline-block;vertical-align:middle;border-radius:7px;margin-right:6px" />
              <span style="color:rgba(255,255,255,0.92);font-size:13px;font-weight:600;vertical-align:middle">BuySellSeychelles</span>
            </p>
            <h2 style="color:#fff;margin:0;font-size:18px">${approved ? '✓ Identity verified' : '🪪 Identity verification update'}</h2>
          </div>
          <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
            ${approved
              ? `<p style="font-size:14px;line-height:1.7;margin:0 0 16px">Good news! Your identity document has been reviewed and <strong style="color:#007A3D">approved</strong>. The <strong>ID Verified</strong> badge is now visible on your profile.</p>`
              : rejectBody
            }
            <a href="${SITE_URL}/dashboard" style="display:inline-block;background:#003F87;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600">Go to dashboard →</a>
            <p style="font-size:11px;color:#9ca3af;margin-top:16px">© 2025 BuySellSeychelles · buysellseychelles.com</p>
          </div>
        </div>
      `,
    }),
  }).catch(err => console.error('[identity] seller email error:', err))
}