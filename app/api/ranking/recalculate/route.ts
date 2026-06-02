import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id,
      created_at,
      boost_level,
      boost_start
    `)

  if (!listings) {
    return Response.json({ error: 'no listings' })
  }

  const now = Date.now()

  for (const listing of listings) {

    // 👁 VUES
    const { count: views } = await supabase
      .from('listing_views')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listing.id)

    // ❤️ FAVORIS
    const { count: favs } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listing.id)

    // ⏱ RÉCENCE
    const daysOld =
      (now - new Date(listing.created_at).getTime()) /
      (1000 * 60 * 60 * 24)

    // 🚀 BOOST DÉCROISSANT (7 jours)
    let boostScore = 0

    if (listing.boost_level && listing.boost_start) {

      const boostAge =
        (now - new Date(listing.boost_start).getTime()) /
        (1000 * 60 * 60 * 24)

      const boostDuration = 7 // jours

      const boostDecay = Math.max(
        0,
        1 - boostAge / boostDuration
      )

      boostScore = listing.boost_level * 1000 * boostDecay
    }

    // 💥 SCORE FINAL (ALGO MARKETPLACE)
    const score =
      boostScore +
      (views || 0) * 2 +
      (favs || 0) * 5 -
      daysOld * 2

    // 💾 UPDATE
    await supabase
      .from('listings')
      .update({ score })
      .eq('id', listing.id)
  }

  return Response.json({
    success: true,
    total: listings.length
  })
}