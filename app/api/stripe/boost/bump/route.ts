import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    const now = new Date()

    // ⏱ toutes les annonces boostées
    const { data: listings } = await supabase
      .from('listings')
      .select('*')
      .eq('boosted', true)

    if (!listings) {
      return NextResponse.json({ ok: true })
    }

    for (const item of listings) {
      const last = item.boost_last_bump_at
        ? new Date(item.boost_last_bump_at)
        : null

      const hours = item.boost_bump_interval_hours || 6

      const shouldBump =
        !last ||
        now.getTime() - last.getTime() > hours * 60 * 60 * 1000

      if (!shouldBump) continue

      // 🚀 SCORE BOOST DYNAMIQUE
      const engagementScore =
        (item.boost_clicks || 0) * 2 +
        (item.boost_impressions || 0) * 0.2

      await supabase
        .from('listings')
        .update({
          boosted_at: now.toISOString(), // 🔥 REMONTE EN HAUT
          boost_last_bump_at: now.toISOString(),
          boost_score: engagementScore + 100,
        })
        .eq('id', item.id)
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'bump error' },
      { status: 500 }
    )
  }
}