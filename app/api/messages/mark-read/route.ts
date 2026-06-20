import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { conversationId, userId } = await req.json()
    if (!conversationId || !userId) return NextResponse.json({ ok: false }, { status: 400 })

    await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[mark-read]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
