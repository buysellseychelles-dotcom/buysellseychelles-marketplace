import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { applyVerificationDecision, checkVerifyToken } from '@/lib/identity-verification'
import { REJECT_REASONS } from '@/lib/verify-reasons'
import { isAdminAccessToken } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Handles the "Confirm ID" and "Reject ID" actions from the /verify-id pages.
// POST-only on purpose: a GET with side effects could be auto-triggered by
// email link scanners. Authorization is via the admin's Supabase access token
// (the browser session is in localStorage, not cookies) plus the signed token.
export async function POST(req: Request) {
  try {
    const { vid, uid, token, action, reasons, notes, accessToken } = await req.json()

    // Admin session required (validated from the access token, not a cookie).
    if (!(await isAdminAccessToken(accessToken))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!checkVerifyToken(vid ?? '', uid ?? '', token ?? '')) {
      return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 403 })
    }

    if (action === 'approve') {
      await applyVerificationDecision(supabase, { verificationId: vid, userId: uid, action: 'approved' })
      return NextResponse.json({ ok: true })
    }

    if (action === 'reject') {
      // Only accept reasons from the known list.
      const validReasons: string[] = Array.isArray(reasons)
        ? reasons.filter((r: string) => (REJECT_REASONS as readonly string[]).includes(r))
        : []

      await applyVerificationDecision(supabase, {
        verificationId: vid,
        userId: uid,
        action: 'rejected',
        reasons: validReasons,
        notes: typeof notes === 'string' && notes.trim() ? notes.trim() : null,
      })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}