import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { conversationId, userId } = await req.json()
    if (!conversationId || !userId) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Vérifie que l'utilisateur est bien un participant de la conversation.
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('id, user_id, seller_id, hidden_by_user, hidden_by_seller')
      .eq('id', conversationId)
      .single()

    if (!conv) return NextResponse.json({ ok: false }, { status: 404 })

    const isUser = conv.user_id === userId
    const isSeller = conv.seller_id === userId
    if (!isUser && !isSeller) {
      return NextResponse.json({ ok: false }, { status: 403 })
    }

    // Si l'autre participant l'a déjà masquée, plus personne ne la voit :
    // on supprime définitivement la conversation et ses messages.
    const otherAlreadyHid = isUser ? conv.hidden_by_seller : conv.hidden_by_user
    if (otherAlreadyHid) {
      await supabaseAdmin.from('messages').delete().eq('conversation_id', conversationId)
      const { error } = await supabaseAdmin.from('conversations').delete().eq('id', conversationId)
      if (error) return NextResponse.json({ ok: false }, { status: 500 })
      return NextResponse.json({ ok: true, deleted: true })
    }

    // Sinon : masquage de SON côté uniquement.
    const { error } = await supabaseAdmin
      .from('conversations')
      .update(isUser ? { hidden_by_user: true } : { hidden_by_seller: true })
      .eq('id', conversationId)
    if (error) return NextResponse.json({ ok: false }, { status: 500 })

    // Marque les messages reçus comme lus pour que les pastilles « non lu »
    // disparaissent (la conversation a été retirée de sa liste).
    await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false)

    return NextResponse.json({ ok: true, deleted: false })
  } catch (err) {
    console.error('[conversations/delete]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
