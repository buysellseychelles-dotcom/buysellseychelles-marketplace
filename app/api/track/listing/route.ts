import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { listingId, type } = await req.json()

    const ip =
      req.headers.get('x-forwarded-for') ||
      'unknown'

    if (!listingId) {
      return NextResponse.json({ ok: false })
    }

    // 🚫 ANTI SPAM (1 vue / IP / 10 min)
    const { data: lastView } = await supabase
      .from('listing_views')
      .select('*')
      .eq('listing_id', listingId)
      .eq('ip', ip)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastView) {
      const diff =
        new Date().getTime() -
        new Date(lastView.created_at).getTime()

      if (diff < 10 * 60 * 1000) {
        return NextResponse.json({ ok: true, ignored: true })
      }
    }

    // 📊 INSERT VIEW SAFE
    if (type === 'view') {
      await supabase.from('listing_views').insert({
        listing_id: listingId,
        ip,
      })

      await supabase.rpc('increment_views', {
        row_id: listingId,
      })
    }

    // 🖱 CLICK TRACK SAFE
    if (type === 'click') {
      await supabase.rpc('increment_clicks', {
        row_id: listingId,
      })
    }

    return NextResponse.json({ ok: true })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ ok: false })
  }
}