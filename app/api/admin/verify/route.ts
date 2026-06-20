import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
