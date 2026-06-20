import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { listingId } = await req.json()
  if (!listingId) return NextResponse.json({ ok: false }, { status: 400 })

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  // 1 vue par IP par annonce par 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: existing } = await supabase
    .from('listing_views')
    .select('id')
    .eq('listing_id', listingId)
    .eq('ip', ip)
    .gte('created_at', since)
    .maybeSingle()

  if (existing) return NextResponse.json({ ok: true, counted: false })

  await supabase.from('listing_views').insert({ listing_id: listingId, ip })
  await supabase.rpc('increment_views', { row_id: listingId })

  return NextResponse.json({ ok: true, counted: true })
}
