import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { rateLimit, getClientIP, tooManyRequests } from '@/lib/rate-limit'

type Listing = { price: number }

export async function POST(req: Request) {
  // 20 appels IA max par heure par IP
  const ip = getClientIP(req)
  const rl = rateLimit(`ai-price:${ip}`, 20, 60 * 60 * 1000)
  if (!rl.allowed) return tooManyRequests(rl.resetAt)

  const { category } = await req.json()

  const { data } = await supabase
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