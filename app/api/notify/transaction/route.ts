import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPushToUser } from '@/lib/push'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Appelé quand le vendeur marque une annonce « Sold » dans le chat.
// Invite les deux parties à s'évaluer mutuellement (note + commentaire).
export async function POST(req: Request) {
  try {
    const { conversationId } = await req.json()
    if (!conversationId) return NextResponse.json({ ok: false }, { status: 400 })

    const { data: conv } = await supabase
      .from('conversations')
      .select('user_id, seller_id, listings(title)')
      .eq('id', conversationId)
      .single()

    if (!conv) return NextResponse.json({ ok: false }, { status: 404 })

    const buyerId = conv.user_id
    const sellerId = conv.seller_id
    const title = (conv.listings as any)?.title || 'the listing'
    const link = `/conversations/${conversationId}`

    // Notifications in-app
    await supabase.from('notifications').insert([
      {
        user_id: buyerId,
        title: '✓ Sale completed — rate the seller',
        body: `How was your purchase of "${title}"? Leave a rating.`,
        link,
      },
      {
        user_id: sellerId,
        title: '✓ Sale completed — rate the buyer',
        body: `How was your sale of "${title}"? Leave a rating.`,
        link,
      },
    ])

    // Notifications push
    await Promise.all([
      sendPushToUser(buyerId, {
        title: '✓ Sale completed',
        body: `Rate the seller of "${title}"`,
        url: link,
      }),
      sendPushToUser(sellerId, {
        title: '✓ Sale completed',
        body: `Rate the buyer of "${title}"`,
        url: link,
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Transaction notify error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
