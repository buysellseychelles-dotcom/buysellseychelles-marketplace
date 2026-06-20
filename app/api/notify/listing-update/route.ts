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

    // Users who favorited this listing, excluding the seller
    const { data: favs } = await supabase
      .from('favorites')
      .select('user_id')
      .eq('listing_id', listingId)
      .neq('user_id', listing.user_id)

    if (!favs || favs.length === 0) return NextResponse.json({ ok: true, notified: 0 })

    await supabase.from('notifications').insert(
      favs.map((f: any) => ({
        user_id: f.user_id,
        title: '✏️ An ad you saved has been updated',
        body: listing.title,
        link: `/listing/${listingId}`,
      }))
    )

    return NextResponse.json({ ok: true, notified: favs.length })
  } catch (err) {
    console.error('[notify/listing-update]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
