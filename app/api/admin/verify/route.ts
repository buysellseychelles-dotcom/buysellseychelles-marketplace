import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { applyVerificationDecision } from '@/lib/identity-verification'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: Request) {
  try {
    const { verificationId, userId, action, notes } = await req.json()
    if (!verificationId || !userId || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    await applyVerificationDecision(supabase, { verificationId, userId, action, notes })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}