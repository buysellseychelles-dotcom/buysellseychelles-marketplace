import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function AnalyticsPage() {

  const { data: listings } = await supabase
    .from('listings')
    .select('id,boosted,boost_expires_at,views_count,clicks_count')

  const { data: reports } = await supabase
    .from('reports')
    .select('id')

  const totalListings = listings?.length || 0

  const activeBoosts = (listings || []).filter((l: any) =>
    l.boosted && l.boost_expires_at && new Date(l.boost_expires_at) > new Date()
  ).length

  const totalViews = (listings || []).reduce(
    (sum: number, l: any) => sum + (l.views_count || 0),
    0
  )

  const totalClicks = (listings || []).reduce(
    (sum: number, l: any) => sum + (l.clicks_count || 0),
    0
  )

  return (
    <div className="max-w-4xl mx-auto p-4">

      <h1 className="text-2xl font-bold mb-6">
        📊 Analytics Global
      </h1>

      <div className="grid grid-cols-2 gap-4">

        <div className="border p-4 rounded">
          <p className="text-gray-500">Annonces</p>
          <p className="text-2xl font-bold">{totalListings}</p>
        </div>

        <div className="border p-4 rounded">
          <p className="text-gray-500">Boost actifs</p>
          <p className="text-2xl font-bold">{activeBoosts}</p>
        </div>

        <div className="border p-4 rounded">
          <p className="text-gray-500">Vues totales</p>
          <p className="text-2xl font-bold">{totalViews}</p>
        </div>

        <div className="border p-4 rounded">
          <p className="text-gray-500">Clics totaux</p>
          <p className="text-2xl font-bold">{totalClicks}</p>
        </div>

        <div className="border p-4 rounded col-span-2">
          <p className="text-gray-500">Signalements</p>
          <p className="text-2xl font-bold">{reports?.length || 0}</p>
        </div>

      </div>

    </div>
  )
}