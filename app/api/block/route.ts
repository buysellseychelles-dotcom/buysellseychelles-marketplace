import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { blockerId, blockedId } = await req.json()
    if (!blockerId || !blockedId || blockerId === blockedId) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    await supabase.from('blocks').upsert({ blocker_id: blockerId, blocked_id: blockedId }, { onConflict: 'blocker_id,blocked_id' })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { blockerId, blockedId } = await req.json()
    if (!blockerId || !blockedId) return NextResponse.json({ ok: false }, { status: 400 })
    await supabase.from('blocks').delete().eq('blocker_id', blockerId).eq('blocked_id', blockedId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
