import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

  const now = new Date()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')

  if (!listings) {
    return NextResponse.json({ error: 'no data' })
  }

  for (const item of listings) {

    let score = item.score || 0

    // 🚀 BOOST
    if (item.boosted && item.boosted_at) {

      const boostDate = new Date(item.boosted_at)
      const hours = (now.getTime() - boostDate.getTime()) / 3600000

      const decay = Math.max(0, 24 - hours)

      const boostPower =
        item.boost_level === 'ultra'
          ? 300
          : item.boost_level === 'premium'
            ? 200
            : 100

      score += decay * 10 + boostPower
    }

    // 👁 VIEWS
    score += (item.views_count || 0) * 0.5

    // 🖱 CLICKS
    score += (item.clicks_count || 0) * 2

    // ⚡ VELOCITY
    score += item.boost_velocity || 0

    await supabase
      .from('listings')
      .update({
        rank_score: score,
      })
      .eq('id', item.id)
  }

  return NextResponse.json({
    success: true,
    updated: listings.length,
  })
}