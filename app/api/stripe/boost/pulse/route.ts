import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    const now = new Date()
    const pulseLimit = new Date(now.getTime() - 6 * 60 * 60 * 1000) // ⏱ toutes les 6h

    // 🚀 On récupère les listings boostés éligibles
    const { data: listings } = await supabase
      .from('listings')
      .select('id, boosted_at, boost_expires_at, boost_last_pulse')
      .eq('boosted', true)

    if (!listings) {
      return NextResponse.json({ ok: true, updated: 0 })
    }

    let updated = 0

    for (const item of listings) {
      if (!item.boost_expires_at) continue

      const expired = new Date(item.boost_expires_at) < now
      if (expired) continue

      const lastPulse = item.boost_last_pulse
        ? new Date(item.boost_last_pulse)
        : null

      // ⛔ pas encore le droit de repulse (cooldown 6h)
      if (lastPulse && lastPulse > pulseLimit) continue

      // 🚀 REMONTER LE BOOST (update ranking timestamp)
      const { error } = await supabase
        .from('listings')
        .update({
          boosted_at: now.toISOString(),
          boost_last_pulse: now.toISOString(),
        })
        .eq('id', item.id)

      if (!error) updated++
    }

    return NextResponse.json({
      ok: true,
      updated,
    })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Pulse error' },
      { status: 500 }
    )
  }
}