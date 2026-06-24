import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { applyVerificationDecision, checkVerifyToken } from '@/lib/identity-verification'
import { REJECT_REASONS } from '@/lib/verify-reasons'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Handles both the "Confirm ID" and "Reject ID" actions submitted from the
// /admin/confirm-id and /admin/reject-id pages. POST-only on purpose: a GET
// with side effects could be auto-triggered by email link scanners.
export async function POST(req: Request) {
  try {
    const { vid, uid, token, action, reasons, notes } = await req.json()

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