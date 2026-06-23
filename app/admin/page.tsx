import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { deleteListingNotifications } from '@/lib/storage-cleanup'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAdminUser() {
  const cookieStore = await cookies()
  const projectRef = 'sywutvsmoccbmylbocex'
  const tokenCookie =
    cookieStore.get(`sb-${projectRef}-auth-token`)?.value ||
    cookieStore.get(`sb-${projectRef}-auth-token.0`)?.value
  if (!tokenCookie) return null
  try {
    const { access_token } = JSON.parse(tokenCookie)
    const { data: { user } } = await supabase.auth.getUser(access_token)
    return user
  } catch { return null }
}

export default async function AdminPage() {
  const user = await getAdminUser()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || user.email !== adminEmail) redirect('/')

  const [{ data: listings }, { data: users }, { data: profiles }, { data: reports }] = await Promise.all([
    supabase.from('listings').select('id,title,price,boosted,boost_expires_at,status,created_at,category,user_id').order('created_at', { ascending: false }).limit(100),
    supabase.auth.admin.listUsers(),
    supabase.from('profiles').select('id,full_name,verified').order('created_at', { ascending: false }),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('resolved', false),
  ])

  const now = new Date()
  const activeBoosts = (listings ?? []).filter((l: any) =>
    l.boosted && l.boost_expires_at && new Date(l.boost_expires_at) > now
  )
  const pendingReports = (reports as any)?.length ?? 0

  const deleteListing = async (id: string) => {
    'use server'
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await client.from('listing_images').delete().eq('listing_id', id)
    await deleteListingNotifications(client, [id])
    await client.from('listings').delete().eq('id', id)
  }

  const toggleVerified = async (id: string, current: boolean) => {
    'use server'
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await client.from('profiles').update({ verified: !current }).eq('id', id)
  }

  const banUser = async (id: string) => {
    'use server'
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    // Bannir l'accès auth + masquer les annonces
    await client.auth.admin.updateUserById(id, { ban_duration: '876000h' })
    await client.from('listings').update({ status: 'expired' }).eq('user_id', id).not('status', 'eq', 'sold')
  }

  const unbanUser = async (id: string) => {
    'use server'
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await client.auth.admin.updateUserById(id, { ban_duration: 'none' })
  }

  const deleteUser = async (id: string) => {
    'use server'
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    // 1. Get user's listing IDs
    const { data: userListings } = await client.from('listings').select('id').eq('user_id', id)
    const listingIds = (userListings ?? []).map((l: any) => l.id)
    // 2. Get user's conversation IDs
    const { data: userConvs } = await client.from('conversations').select('id').or(`user_id.eq.${id},seller_id.eq.${id}`)
    const convIds = (userConvs ?? []).map((c: any) => c.id)
    // 3. Clean up related data in dependency order
    if (listingIds.length > 0) {
      await client.from('listing_images').delete().in('listing_id', listingIds)
    }
    if (convIds.length > 0) {
      await client.from('messages').delete().in('conversation_id', convIds)
    }
    await client.from('conversations').delete().or(`user_id.eq.${id},seller_id.eq.${id}`)
    await client.from('favorites').delete().eq('user_id', id)
    if (listingIds.length > 0) {
      await client.from('favorites').delete().in('listing_id', listingIds)
    }
    await client.from('notifications').delete().eq('user_id', id)
    // Notifications reçues par d'AUTRES utilisateurs à propos des annonces supprimées
    if (listingIds.length > 0) {
      await deleteListingNotifications(client, listingIds)
    }
    await client.from('reports').delete().eq('reporter_id', id)
    await client.from('alerts').delete().eq('user_id', id)
    await client.from('listings').delete().eq('user_id', id)
    await client.from('profiles').delete().eq('id', id)
    // 4. Delete auth user
    await client.auth.admin.deleteUser(id)
  }

  const activateBoost = async (formData: FormData) => {
    'use server'
    const listingId = formData.get('listingId') as string
    const hours = Number(formData.get('hours') ?? 24)
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const expires = new Date(Date.now() + hours * 60 * 60 * 1000)
    await client.from('listings').update({
      boosted: true,
      boosted_at: new Date().toISOString(),
      boost_expires_at: expires.toISOString(),
    }).eq('id', listingId)
  }

  const deactivateBoost = async (formData: FormData) => {
    'use server'
    const listingId = formData.get('listingId') as string
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await client.from('listings').update({ boosted: false, boost_expires_at: null }).eq('id', listingId)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">🛠 Administration</h1>
        <span className="text-xs text-gray-400">{user.email}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Listings', value: listings?.length ?? 0, icon: '📋', dark: true },
          { label: 'Users', value: users?.users?.length ?? 0, icon: '👥', dark: false },
          { label: 'Active boosts', value: activeBoosts.length, icon: '🚀', dark: false },
          { label: 'Reports', value: pendingReports, icon: '🚨', dark: pendingReports > 0 },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.dark ? 'bg-black text-white' : 'bg-gray-100'}`}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className={`text-xs ${s.dark ? 'text-gray-400' : 'text-gray-500'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Liens rapides */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <Link href="/admin/analytics" className="bg-white border border-gray-200 rounded-xl py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
          📊 Analytics
        </Link>
        <Link href="/admin/reports" className="relative bg-white border border-gray-200 rounded-xl py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
          🚨 Reports
          {pendingReports > 0 && (
            <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingReports}
            </span>
          )}
        </Link>
        <Link href="/admin/verifications" className="bg-white border border-gray-200 rounded-xl py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
          🪪 Verifications
        </Link>
        <Link href="/admin/banners" className="bg-white border border-gray-200 rounded-xl py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
          📣 Banners
        </Link>
        <Link href="#users" className="bg-white border border-gray-200 rounded-xl py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
          👥 Users
        </Link>
      </div>

      {/* ── BOOSTS MANUELS ────────────────────────────── */}
      <div className="mb-6">
        <h2 className="font-bold text-gray-800 mb-3">🚀 Manual boosts</h2>

        {/* Boosts actifs */}
        {activeBoosts.length > 0 && (
          <div className="space-y-2 mb-3">
            <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Active ({activeBoosts.length})</p>
            {activeBoosts.map((item: any) => {
              const expires = new Date(item.boost_expires_at)
              const hoursLeft = Math.max(0, Math.round((expires.getTime() - now.getTime()) / 3600000))
              return (
                <div key={item.id} className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-xl">🚀</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-orange-600">Expires in {hoursLeft}h</p>
                  </div>
                  <form action={deactivateBoost}>
                    <input type="hidden" name="listingId" value={item.id} />
                    <button className="text-xs text-red-500 font-medium border border-red-200 rounded-lg px-2.5 py-1.5 hover:bg-red-50">
                      Deactivate
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        )}

        {/* Activer un boost sur n'importe quelle annonce */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-3">Manually activate a boost:</p>
          <div className="space-y-2">
            {(listings ?? []).filter((l: any) => !l.boosted || !l.boost_expires_at || new Date(l.boost_expires_at) <= now).slice(0, 20).map((item: any) => (
              <div key={item.id} className="flex items-center gap-2">
                <p className="flex-1 text-xs text-gray-700 truncate">{item.title}</p>
                <form action={activateBoost} className="flex items-center gap-1 shrink-0">
                  <input type="hidden" name="listingId" value={item.id} />
                  <select name="hours" className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none">
                    <option value="24">24h</option>
                    <option value="72">3d</option>
                    <option value="168">7d</option>
                  </select>
                  <button className="text-xs text-orange-600 font-semibold border border-orange-200 rounded-lg px-2.5 py-1.5 hover:bg-orange-50">
                    🚀 Boost
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── UTILISATEURS ──────────────────────────────── */}
      {profiles && profiles.length > 0 && (
        <div className="mb-6" id="users">
          <h2 className="font-bold text-gray-800 mb-3">👥 Users ({profiles.length})</h2>
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-50">
              {profiles.map((p: any) => {
                const authUser = users?.users?.find((u: any) => u.id === p.id)
                const isBanned = authUser?.banned_until && new Date(authUser.banned_until) > new Date()
                const isAdmin = authUser?.email === process.env.ADMIN_EMAIL
                return (
                  <div key={p.id} className={`px-4 py-3 hover:bg-gray-50 ${isBanned ? 'bg-red-50/50' : ''}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium flex items-center gap-1.5 flex-wrap">
                          {p.full_name || authUser?.email || 'Anonymous'}
                          {p.verified && <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">✓ Verified</span>}
                          {isBanned && <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">🚫 Banned</span>}
                          {isAdmin && <span className="bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Admin</span>}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{authUser?.email}</p>
                      </div>
                      {!isAdmin && (
                        <div className="flex gap-1.5 shrink-0">
                          <form action={toggleVerified.bind(null, p.id, p.verified)}>
                            <button className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg border ${p.verified ? 'border-gray-200 text-gray-400 hover:bg-gray-50' : 'border-blue-200 text-blue-500 hover:bg-blue-50'}`}>
                              {p.verified ? 'Unverify' : '✓ Verify'}
                            </button>
                          </form>
                          {isBanned ? (
                            <form action={unbanUser.bind(null, p.id)}>
                              <button className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50">
                                ✓ Unban
                              </button>
                            </form>
                          ) : (
                            <form action={banUser.bind(null, p.id)}>
                              <button className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
                                🚫 Ban
                              </button>
                            </form>
                          )}
                          <form action={deleteUser.bind(null, p.id)} onSubmit={(e) => { if (!confirm(`Delete ${authUser?.email ?? p.full_name} permanently?`)) e.preventDefault() }}>
                            <button className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100">
                              🗑 Delete
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Joined {new Date(authUser?.created_at ?? '').toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ANNONCES ──────────────────────────────────── */}
      <div>
        <h2 className="font-bold text-gray-800 mb-3">📋 Recent listings</h2>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-50">
            {(listings ?? []).map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-gray-400">
                    {item.category} · {Number(item.price).toLocaleString()} SCR
                    {item.boosted && <span className="ml-1 text-orange-500">🚀</span>}
                    {item.status === 'sold' && <span className="ml-1 text-red-500">● Sold</span>}
                  </p>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                  <Link href={`/listing/${item.id}`} className="text-xs text-blue-500 font-medium hover:underline">
                    View
                  </Link>
                  <form action={deleteListing.bind(null, item.id)}>
                    <button className="text-xs text-red-500 font-medium hover:underline">
                      Del.
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
