import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { listingId } = await req.json()
    if (!listingId) return NextResponse.json({ ok: false }, { status: 400 })

    const { data: listing } = await supabase
      .from('listings')
      .select('title, user_id')
      .eq('id', listingId)
      .maybeSingle()

    if (!listing) return NextResponse.json({ ok: false })

    const { data: seller } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', listing.user_id)
      .maybeSingle()

    const sellerName = seller?.full_name?.trim() || 'A seller'

    // Followers of this seller
    const { data: follows } = await supabase
      .from('seller_follows')
      .select('follower_id')
      .eq('seller_id', listing.user_id)

    if (!follows || follows.length === 0) return NextResponse.json({ ok: true, notified: 0 })

    await supabase.from('notifications').insert(
      follows.map((f: any) => ({
        user_id: f.follower_id,
        title: `🆕 ${sellerName} published a new listing`,
        body: listing.title,
        link: `/listing/${listingId}`,
      }))
    )

    return NextResponse.json({ ok: true, notified: follows.length })
  } catch (err) {
    console.error('[notify/new-listing]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
