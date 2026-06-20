import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const revalidate = 60

export default async function AnalyticsPage() {
  const [
    { count: totalUsers },
    { count: totalListings },
    { count: totalMessages },
    { count: totalReports },
    { data: listings },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('listings').select('id', { count: 'exact', head: true }),
    supabase.from('messages').select('id', { count: 'exact', head: true }),
    supabase.from('reports').select('id', { count: 'exact', head: true }),
    supabase.from('listings').select('id, boosted, boost_expires_at, views_count, clicks_count, status, created_at, category'),
    supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  const now = new Date()
  const activeBoosts = (listings ?? []).filter((l: any) =>
    l.boosted && l.boost_expires_at && new Date(l.boost_expires_at) > now
  ).length

  const totalViews = (listings ?? []).reduce((s: number, l: any) => s + (l.views_count || 0), 0)
  const totalClicks = (listings ?? []).reduce((s: number, l: any) => s + (l.clicks_count || 0), 0)
  const soldCount = (listings ?? []).filter((l: any) => l.status === 'sold').length

  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const newListings30 = (listings ?? []).filter((l: any) => new Date(l.created_at) > last30).length

  // Catégories les plus populaires
  const catCount: Record<string, number> = {}
  for (const l of listings ?? []) {
    if (l.category) catCount[l.category] = (catCount[l.category] || 0) + 1
  }
  const topCats = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const stats = [
    { label: 'Users', value: totalUsers ?? 0, icon: '👥', color: 'bg-blue-50 text-blue-700' },
    { label: 'Listings', value: totalListings ?? 0, icon: '📋', color: 'bg-gray-50 text-gray-700' },
    { label: 'Messages', value: totalMessages ?? 0, icon: '💬', color: 'bg-green-50 text-green-700' },
    { label: 'Reports', value: totalReports ?? 0, icon: '🚨', color: 'bg-red-50 text-red-700' },
    { label: 'Active boosts', value: activeBoosts, icon: '🚀', color: 'bg-orange-50 text-orange-700' },
    { label: 'Total views', value: totalViews.toLocaleString(), icon: '👁', color: 'bg-purple-50 text-purple-700' },
    { label: 'Contacts', value: totalClicks.toLocaleString(), icon: '📱', color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Sold', value: soldCount, icon: '✅', color: 'bg-emerald-50 text-emerald-700' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

      {/* Nav admin */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-black">← Admin</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-lg font-bold text-gray-900">Analytics</h1>
      </div>

      {/* Grille stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Annonces 30 derniers jours */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <h2 className="font-bold text-sm text-gray-700 mb-1">New listings (30d)</h2>
        <p className="text-3xl font-bold text-gray-900">{newListings30}</p>
        <p className="text-xs text-gray-400 mt-0.5">out of {totalListings ?? 0} total</p>
        <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all"
            style={{ width: `${totalListings ? Math.min(100, (newListings30 / (totalListings ?? 1)) * 100) : 0}%` }}
          />
        </div>
      </div>

      {/* Top catégories */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <h2 className="font-bold text-sm text-gray-700 mb-3">Top categories</h2>
        <div className="space-y-2.5">
          {topCats.map(([cat, count], i) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-4">{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">{cat}</span>
                  <span className="text-gray-400">{count}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full"
                    style={{ width: `${topCats[0] ? (count / topCats[0][1]) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Derniers inscrits */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="font-bold text-sm text-gray-700 mb-3">Recent sign-ups</h2>
        <div className="space-y-2">
          {(recentUsers ?? []).map((u: any) => (
            <div key={u.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                {(u.full_name || u.id)[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{u.full_name || 'No name'}</p>
                <p className="text-[11px] text-gray-400">{new Date(u.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
