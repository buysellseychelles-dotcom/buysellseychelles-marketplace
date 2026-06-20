import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sellerId = searchParams.get('sellerId')
  const followerId = searchParams.get('followerId')
  if (!sellerId || !followerId) return NextResponse.json({ following: false })

  const { data } = await supabase
    .from('seller_follows')
    .select('id')
    .eq('seller_id', sellerId)
    .eq('follower_id', followerId)
    .maybeSingle()

  return NextResponse.json({ following: !!data })
}

export async function POST(req: Request) {
  try {
    const { sellerId, followerId } = await req.json()
    if (!sellerId || !followerId) return NextResponse.json({ ok: false }, { status: 400 })
    if (sellerId === followerId) return NextResponse.json({ ok: false, error: 'Cannot follow yourself' }, { status: 400 })

    const { data: existing } = await supabase
      .from('seller_follows')
      .select('id')
      .eq('seller_id', sellerId)
      .eq('follower_id', followerId)
      .maybeSingle()

    if (existing) {
      await supabase.from('seller_follows').delete().eq('id', existing.id)
      return NextResponse.json({ following: false })
    } else {
      await supabase.from('seller_follows').insert({ seller_id: sellerId, follower_id: followerId })
      return NextResponse.json({ following: true })
    }
  } catch (err) {
    console.error('[seller/follow]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
