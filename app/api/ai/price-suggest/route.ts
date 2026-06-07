import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

type Listing = { price: number }

export async function POST(req: Request) {
  const { category } = await req.json()

  const { data } = await supabaseAdmin
    .from('listings')
    .select('price')
    .eq('category', category)

  const listings = (data ?? []) as Listing[]

  if (listings.length === 0) {
    return NextResponse.json({ suggested_price: 100 })
  }

  const avg =
    listings.reduce((s, l) => s + l.price, 0) / listings.length

  return NextResponse.json({
    suggested_price: Math.round(avg * 0.95),
  })
}