import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sellerId = searchParams.get('sellerId')
  if (!sellerId) return NextResponse.json({ stats: null })

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .eq('seller_id', sellerId)
    .limit(50)

  if (!conversations || conversations.length === 0) return NextResponse.json({ stats: null })

  let replied = 0
  const responseTimes: number[] = []

  await Promise.all(
    conversations.map(async (conv) => {
      const { data: msgs } = await supabase
        .from('messages')
        .select('sender_id, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true })
        .limit(20)

      if (!msgs || msgs.length === 0) return

      const firstBuyerMsg = msgs.find((m: any) => m.sender_id !== sellerId)
      if (!firstBuyerMsg) return

      const firstReply = msgs.find(
        (m: any) => m.sender_id === sellerId && m.created_at > firstBuyerMsg.created_at
      )

      if (firstReply) {
        replied++
        const diffMs = new Date(firstReply.created_at).getTime() - new Date(firstBuyerMsg.created_at).getTime()
        responseTimes.push(diffMs / 3600000)
      }
    })
  )

  const rate = Math.round((replied / conversations.length) * 100)
  const avgHours = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : null

  return NextResponse.json({ stats: { rate, avgHours } })
}
