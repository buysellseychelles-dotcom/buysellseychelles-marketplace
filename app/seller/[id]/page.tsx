import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import BackButton from '@/components/back-button'
import TimeAgo from '@/components/time-ago'
import ReviewStars from '@/components/review-stars'
import SellerReviewSection from '@/components/seller-review-section'
import ReportUserButton from '@/components/report-user-button'
import FollowSellerButton from '@/components/follow-seller-button'
import { listingHref } from '@/lib/slug'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const { data } = await supabaseAdmin.from('profiles').select('full_name').eq('id', id).single()
  const name = data?.full_name?.trim() || 'Seller'
  return {
    title: `${name} – Seller Profile | BuySellSeychelles`,
    description: `See all listings by ${name} on BuySellSeychelles.`,
  }
}

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ data: seller }, { data: listings }, { data: reviews }, { data: conversations }] = await Promise.all([
    supabaseAdmin.from('profiles').select('id, full_name, bio, island, created_at, last_active_at, verified, id_verified, avatar_url, is_pro').eq('id', id).single(),
    supabase.from('listings').select('id, title, price, location, status, created_at, listing_images(image_url)').eq('user_id', id).order('created_at', { ascending: false }).limit(50),
    supabase.from('reviews').select('id, rating, comment, created_at, reviewer_id, reviewer_role, verified_transaction').eq('seller_id', id).order('created_at', { ascending: false }),
    supabase.from('conversations').select('id, user_id').eq('seller_id', id).limit(100),
  ])

  const active = (listings ?? []).filter((l: any) => l.status !== 'sold')
  const sold = (listings ?? []).filter((l: any) => l.status === 'sold')

  // Profil générique si aucun profil trouvé
  const profile = seller ?? { full_name: null, island: null, bio: null, verified: false, id_verified: false, avatar_url: null, is_pro: false, created_at: new Date().toISOString() }

  // Fallback name from auth email only if full_name is truly empty
  let displayName = profile.full_name?.trim() || null
  if (!displayName) {
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(id)
    const email = authData?.user?.email
    if (email) displayName = email.split('@')[0]
  }
  displayName = displayName || 'User'

  const initials = displayName[0]?.toUpperCase() ?? '?'
  const memberSince = new Date(profile.created_at).toLocaleDateString('en', { month: 'long', year: 'numeric' })
  const lastActiveDays = (profile as any).last_active_at
    ? Math.floor((Date.now() - new Date((profile as any).last_active_at).getTime()) / 86400000)
    : null
  const lastActiveLabel = lastActiveDays === null ? null
    : lastActiveDays === 0 ? 'Active today'
    : lastActiveDays === 1 ? 'Active yesterday'
    : `Active ${lastActiveDays} days ago`

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
    : null

  // Calcul taux de réponse
  const responseStats = await calcResponseStats(id, conversations ?? [])

  return (
    <div className="max-w-2xl mx-auto pb-4 md:pb-8">

      {/* Header profil */}
      <div className="text-white px-4 pt-6 pb-8" style={{ background: 'linear-gradient(135deg, #003F87 0%, #003F87 40%, #007A3D 100%)' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 overflow-hidden flex items-center justify-center text-2xl font-bold shrink-0 relative">
            {profile.avatar_url
              ? <Image src={profile.avatar_url} alt={displayName} fill className="object-cover" />
              : initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-xl">{displayName}</h1>
              {profile.is_pro && <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">⭐ PRO</span>}
              {profile.verified && <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">✓ Verified</span>}
              {(profile as any).id_verified && <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">🪪 ID Verified</span>}
            </div>
            {profile.island && <p className="text-gray-400 text-sm">📍 {profile.island}</p>}
            <p className="text-gray-400 text-xs mt-0.5">Member since {memberSince}</p>
            {lastActiveLabel && (
              <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${lastActiveDays === 0 ? 'bg-green-400' : 'bg-gray-400'}`} />
                {lastActiveLabel}
              </p>
            )}
            {avgRating !== null && (
              <div className="flex items-center gap-1.5 mt-1">
                <ReviewStars rating={avgRating} size="sm" />
                <span className="text-gray-400 text-xs">{avgRating.toFixed(1)} ({reviews!.length} reviews)</span>
              </div>
            )}
          </div>
        </div>

        {profile.bio && <p className="text-gray-300 text-sm mt-4 leading-relaxed">{profile.bio}</p>}

        {/* Taux de réponse */}
        {responseStats && (
          <div className="flex items-center gap-4 mt-4 bg-white/10 rounded-xl px-4 py-3">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{responseStats.rate}%</p>
              <p className="text-gray-400 text-[10px]">Response rate</p>
            </div>
            {responseStats.avgHours !== null && (
              <>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{formatResponseTime(responseStats.avgHours)}</p>
                  <p className="text-gray-400 text-[10px]">Avg. response</p>
                </div>
              </>
            )}
            <div className="ml-auto">
              <ResponseBar rate={responseStats.rate} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: 'Listings', value: listings?.length ?? 0 },
            { label: 'Active', value: active.length },
            { label: 'Sold', value: sold.length },
            { label: 'Reviews', value: reviews?.length ?? 0 },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-gray-400 text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <FollowSellerButton sellerId={id} />
        </div>
      </div>

      {/* Annonces disponibles */}
      <div className="px-4 mt-5">
        <h2 className="font-bold text-gray-800 mb-3">Active listings ({active.length})</h2>
        {active.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-gray-500 text-sm">No listings available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {active.map((item: any) => {
              const image = item.listing_images?.[0]?.image_url
              return (
                <Link key={item.id} href={listingHref(item)} className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="relative w-full aspect-square bg-gray-100">
                    {image ? <Image src={image} alt={item.title} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">📷</div>}
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-medium line-clamp-2 text-gray-800 leading-snug">{item.title}</p>
                    <p className="text-sm font-bold text-black mt-1">{item.price ? `${Number(item.price).toLocaleString()} SCR` : 'Price negotiable'}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5"><TimeAgo date={item.created_at} /></p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Vendus */}
        {sold.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold text-gray-400 mb-3 text-sm">Sold ({sold.length})</h2>
            <div className="grid grid-cols-2 gap-3">
              {sold.map((item: any) => {
                const image = item.listing_images?.[0]?.image_url
                return (
                  <Link key={item.id} href={listingHref(item)} className="bg-white rounded-xl overflow-hidden border border-gray-100 opacity-60">
                    <div className="relative w-full aspect-square bg-gray-100">
                      {image ? <Image src={image} alt={item.title} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">📷</div>}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">SOLD</span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-sm font-medium line-clamp-2 text-gray-800 leading-snug">{item.title}</p>
                      <p className="text-sm font-bold text-black mt-1">{item.price ? `${Number(item.price).toLocaleString()} SCR` : 'Price negotiable'}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Section avis */}
        <SellerReviewSection
          sellerId={id}
          reviews={reviews ?? []}
          avgRating={avgRating}
        />

        <ReportUserButton sellerId={id} />

        <div className="relative h-14 mt-2">
          <BackButton />
        </div>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────

async function calcResponseStats(sellerId: string, conversations: { id: string; user_id: string }[]) {
  if (conversations.length === 0) return null

  let replied = 0
  const responseTimes: number[] = []

  await Promise.all(
    conversations.map(async (conv) => {
      const { data: msgs } = await supabase
        .from('messages')
        .select('sender_id, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true })
        .limit(20)

      if (!msgs || msgs.length === 0) return

      const firstBuyerMsg = msgs.find((m: any) => m.sender_id !== sellerId)
      if (!firstBuyerMsg) return

      const firstSellerReply = msgs.find(
        (m: any) => m.sender_id === sellerId && m.created_at > firstBuyerMsg.created_at
      )

      if (firstSellerReply) {
        replied++
        const diffMs = new Date(firstSellerReply.created_at).getTime() - new Date(firstBuyerMsg.created_at).getTime()
        responseTimes.push(diffMs / 3600000)
      }
    })
  )

  const rate = Math.round((replied / conversations.length) * 100)
  const avgHours = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : null

  return { rate, avgHours }
}

function formatResponseTime(hours: number): string {
  if (hours < 1) return '< 1h'
  if (hours < 24) return `~${Math.round(hours)}h`
  return `~${Math.round(hours / 24)}d`
}

function ResponseBar({ rate }: { rate: number }) {
  const color = rate >= 80 ? 'bg-green-400' : rate >= 50 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <p className="text-[10px] text-gray-400">
        {rate >= 80 ? '🟢 Very responsive' : rate >= 50 ? '🟡 Responsive' : '🔴 Low response'}
      </p>
    </div>
  )
}
