import Link from 'next/link'
import Image from 'next/image'
import SafeImage from '@/components/safe-image'
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { SearchFilters } from '@/components/search-filters'
import CategoryNav from '@/components/category-nav'
import BannerCarousel from '@/components/banner-carousel'
import TimeAgo from '@/components/time-ago'
import { formatPrice } from '@/lib/utils'
import { listingHref } from '@/lib/slug'
import { t, CATEGORY_LABELS, type Lang } from '@/lib/i18n'
import { RecentlyViewedSection } from '@/components/recently-viewed'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Annonces sans prix — Community (Wanted / Lost & Found) et Jobs (Job Offers /
// Job Wanted) : pas de prix → on affiche le libellé de la sous-catégorie à la
// place. Renvoie null pour toute autre annonce.
const NO_PRICE_CATS = ['wanted', 'lost_found', 'emploi', 'emploi_demande']
const noPriceLabel = (item: any, lang: Lang): string | null =>
  NO_PRICE_CATS.includes(item.category)
    ? (CATEGORY_LABELS[item.category]?.[lang] ?? item.category)
    : null

type SearchParams = {
  page?: string; category?: string; q?: string; island?: string
  quartier?: string; sort?: string; min?: string; max?: string
  fuel?: string; gearbox?: string; condition?: string; prop_type?: string
  min_beds?: string; tenure?: string; boat_type?: string; contract?: string
}

// Libellés créoles alignés sur CATEGORY_TREE (page de création d'annonce).
const HOME_SECTIONS = [
  { value: 'voiture',      label_en: '🚗 Vehicles',        label_kr: '🚗 Transpor' },
  { value: 'immobilier',   label_en: '🏡 Real Estate',      label_kr: '🏡 Imobilye' },
  { value: 'electronique', label_en: '📱 Electronics',      label_kr: '📱 Elektronik' },
  { value: 'bateau',       label_en: '⛵ Boats',            label_kr: '⛵ Bato' },
  { value: 'loisirs',      label_en: '⚽ Sports & Leisure', label_kr: '⚽ Spor & Lwazir' },
  { value: 'animaux',      label_en: '🐾 Pets & Animals',  label_kr: '🐾 Zanimo' },
  { value: 'dons',         label_en: '🎁 Free & Exchange',  label_kr: '🎁 Gratwit e Esanz' },
  { value: 'emploi',       label_en: '💼 Jobs',             label_kr: '💼 Travay' },
  { value: 'services',     label_en: '🔧 Services',         label_kr: '🔧 Servis' },
  { value: 'tourisme',     label_en: '🌴 Tourism',          label_kr: '🌴 Tourizm & Aktivite' },
  { value: 'mode',         label_en: '👗 Fashion',          label_kr: '👗 Lanmod' },
  { value: 'maison',       label_en: '🛋️ Home & Garden',    label_kr: '🛋️ Lakaz & Zarden'},
  { value: 'family',       label_en: '🧸 Family',           label_kr: '🧸 Fanmiy' },
  { value: 'pro',          label_en: '🏭 Pro Equipment',    label_kr: '🏭 Lekipaman Pro' },
  { value: 'community',    label_en: '🤝 Community',        label_kr: '🤝 Kominote' },
  { value: 'autre',        label_en: '📦 Other',            label_kr: '📦 Lezot' },
]

const CATEGORY_GROUP_MAP: Record<string, string[]> = {
  voiture:     ['voiture', 'moto', 'velos', 'utilitaire', 'pieces_auto'],
  immobilier:  ['immobilier', 'location', 'location_vacances', 'terrain', 'commercial'],
  electronique:['electronique', 'telephone', 'informatique', 'tv_audio', 'photo_video', 'jeux_video'],
  bateau:      ['bateau'],
  loisirs:     ['loisirs', 'musique', 'livres', 'jeux_jouets', 'collection'],
  animaux:     ['animaux', 'chiens', 'chats', 'oiseaux', 'poissons', 'autres_animaux'],
  dons:        ['dons', 'troc'],
  emploi:      ['emploi', 'emploi_demande'],
  services:    ['services', 'cours', 'beaute', 'transport_service', 'services_pro', 'evenements'],
  tourisme:    ['tourisme', 'hebergement', 'activites'],
  mode:        ['mode', 'mode_femme', 'mode_homme', 'mode_enfant', 'chaussures', 'bijoux'],
  maison:      ['maison', 'ameublement', 'electromenager', 'decoration', 'bricolage', 'jardin'],
  family:      ['baby_equipment', 'kids_furniture', 'baby_clothing', 'kids_clothing', 'maternity_wear', 'kids_shoes', 'kids_jewelry', 'kids_accessories', 'kids_toys', 'babysitting'],
  pro:         ['pro'],
  community:   ['wanted', 'lost_found'],
  // Catch-all : toute catégorie sans section dédiée.
  // ⚠️ Toute nouvelle catégorie de premier niveau doit être rattachée ici ou à
  // une section ci-dessus, sinon ses annonces n'apparaîtront pas sur la home.
  autre:       ['autre'],
}

// Données de la page d'accueil (bannières + sections + vendeurs PRO).
// Identiques pour tous les visiteurs (indépendantes de la langue / des filtres),
// donc mises en cache 60 s : les visites répétées sur Home évitent les
// ~16 allers-retours Supabase et deviennent quasi instantanées côté serveur.
const getHomeData = unstable_cache(
  async () => {
    const nowIso = new Date().toISOString()

    // Jusqu'à 5 bannières clients actives (paiement confirmé, non expirées)
    const { data: bannerData } = await supabase
      .from('sponsored_banners').select('*').eq('active', true)
      .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
      .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
      .order('created_at', { ascending: false }).limit(5)

    const sectionResults = await Promise.all(
      HOME_SECTIONS.map(s => {
        const cats = CATEGORY_GROUP_MAP[s.value] ?? [s.value]
        const q = supabase.from('listings')
          .select('id,title,price,currency,location,category,status,created_at,user_id,boosted,boost_expires_at,listing_images(image_url)')
          .not('status', 'in', '("sold","expired")')
          .order('boosted', { ascending: false })  // featured listings first
          .order('created_at', { ascending: false })
          .limit(6)
        return cats.length > 1 ? q.in('category', cats) : q.eq('category', cats[0])
      })
    )
    const sectionData = sectionResults.map(r => r.data ?? [])

    // Which sellers are PRO? (single lookup → gold badge on their cards)
    const sellerIds = [...new Set(
      sectionData.flatMap(rows => rows.map((l: any) => l.user_id)).filter(Boolean)
    )]
    let proSellerIds: string[] = []
    if (sellerIds.length) {
      const { data: pros } = await supabase
        .from('profiles').select('id').eq('is_pro', true).in('id', sellerIds)
      proSellerIds = (pros ?? []).map((p: any) => p.id)
    }

    return { bannerData: bannerData ?? [], sectionData, proSellerIds }
  },
  ['home-data'],
  { revalidate: 60 },
)

export default async function HomePage({ searchParams }: { searchParams?: SearchParams }) {
  const params   = await searchParams
  const cookieStore = await cookies()
  const lang = (cookieStore.get('bss_lang')?.value ?? 'en') as Lang

  const page      = Math.max(1, Number(params?.page ?? 1))
  const limit     = 12
  const from      = (page - 1) * limit
  const to        = from + limit - 1
  const category  = params?.category ?? ''
  const query     = params?.q ?? ''
  const island    = params?.island ?? ''
  const quartier  = params?.quartier ?? ''
  const sort      = params?.sort ?? 'recent'
  const minPrice  = params?.min ? Number(params.min) : null
  const maxPrice  = params?.max ? Number(params.max) : null
  const fuel      = params?.fuel ?? ''
  const gearbox   = params?.gearbox ?? ''
  const condition = params?.condition ?? ''
  const propType  = params?.prop_type ?? ''
  const minBeds   = params?.min_beds ? parseInt(params.min_beds) : null
  const tenure    = params?.tenure ?? ''
  const boatType  = params?.boat_type ?? ''
  const contract  = params?.contract ?? ''

  const hasFilters = category || query || island || quartier || minPrice || maxPrice ||
    fuel || gearbox || condition || propType || minBeds || tenure || boatType || contract

  const now = new Date()

  // ── Mode recherche / filtre ──────────────────────────────────────────────
  if (hasFilters) {
    let dbQuery = supabase
      .from('listings')
      .select('id,title,price,currency,location,category,boosted,boost_expires_at,rank_score,status,created_at,urgent,price_negotiable,user_id,listing_images(image_url)')
      .not('status', 'in', '("sold","expired")')

    if (category) {
      const cats = CATEGORY_GROUP_MAP[category]
      if (cats && cats.length > 1) dbQuery = dbQuery.in('category', cats)
      else dbQuery = dbQuery.eq('category', category)
    }
    if (query)       dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    if (quartier)    dbQuery = dbQuery.ilike('location', `%${quartier}%`)
    else if (island) dbQuery = dbQuery.ilike('location', `%${island}%`)
    if (minPrice !== null) dbQuery = dbQuery.gte('price', minPrice)
    if (maxPrice !== null) dbQuery = dbQuery.lte('price', maxPrice)
    if (fuel)        dbQuery = dbQuery.eq('fuel_type', fuel)
    if (gearbox)     dbQuery = dbQuery.eq('gearbox', gearbox)
    if (condition)   dbQuery = dbQuery.eq('condition', condition)
    if (propType)    dbQuery = dbQuery.eq('property_type', propType)
    if (minBeds !== null) dbQuery = dbQuery.gte('bedrooms', minBeds)
    if (tenure)      dbQuery = dbQuery.eq('tenure', tenure)
    if (boatType)    dbQuery = dbQuery.eq('boat_type', boatType)
    if (contract)    dbQuery = dbQuery.eq('contract_type', contract)

    // Featured ("à la une") listings appear first — except when the user
    // explicitly sorts by price, where strict price order takes precedence.
    if (sort === 'price_asc')       dbQuery = dbQuery.order('price', { ascending: true })
    else if (sort === 'price_desc') dbQuery = dbQuery.order('price', { ascending: false })
    else if (sort === 'popular')    dbQuery = dbQuery.order('boosted', { ascending: false }).order('rank_score', { ascending: false })
    else dbQuery = dbQuery.order('boosted', { ascending: false }).order('rank_score', { ascending: false }).order('created_at', { ascending: false })

    dbQuery = dbQuery.range(from, to)
    const { data } = await dbQuery
    const listings = (data ?? []).filter((item: any) =>
      !item.boosted || !item.boost_expires_at || new Date(item.boost_expires_at) > now
    )

    // Which sellers are PRO? (single lookup → gold badge on their cards)
    const sellerIds = [...new Set(listings.map((l: any) => l.user_id).filter(Boolean))]
    let proSellers = new Set<string>()
    if (sellerIds.length) {
      const { data: pros } = await supabase
        .from('profiles').select('id').eq('is_pro', true).in('id', sellerIds)
      proSellers = new Set((pros ?? []).map((p: any) => p.id))
    }

    const count = listings.length
    const countLabel = count === 0
      ? t(lang, 'no_listings')
      : `${count}${count === limit ? '+' : ''} ${count > 1 ? t(lang, 'results_many') : t(lang, 'results_one')}`

    return (
      <div className="min-h-screen bg-gray-50 pb-4 md:pb-0">
        <Suspense><SearchFilters compact /></Suspense>
        <div className="bg-white border-b border-gray-100">
          <Suspense><CategoryNav /></Suspense>
        </div>

        <div className="max-w-2xl lg:max-w-7xl mx-auto px-3 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">
              {countLabel}
              {query && <span className="font-medium text-black"> {t(lang, 'for_query')} &ldquo;{query}&rdquo;</span>}
            </p>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xs text-red-500 hover:underline">{t(lang, 'clear')}</Link>
              <Link href="/map" className="flex items-center gap-1 text-xs font-medium border border-gray-300 px-2.5 py-1.5 rounded-full hover:border-black transition-colors text-gray-600">
                🗺️ {t(lang, 'map')}
              </Link>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500 text-sm">{t(lang, 'no_results')}</p>
              <Link href="/" className="mt-4 inline-block text-sm text-black underline">{t(lang, 'view_all')}</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {listings.map((item: any) => (
                <ListingCard key={item.id} item={item} now={now} lang={lang} sellerPro={proSellers.has(item.user_id)} />
              ))}
            </div>
          )}

          {listings.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              {page > 1 ? (
                <Link href={`/?${buildParams(params, { page: String(page - 1) })}`}
                  className="text-sm font-medium border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100">
                  {t(lang, 'prev_page')}
                </Link>
              ) : <span />}
              <span className="text-sm text-gray-500">{t(lang, 'page_n')} {page}</span>
              {listings.length === limit && (
                <Link href={`/?${buildParams(params, { page: String(page + 1) })}`}
                  className="text-sm font-medium border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100">
                  {t(lang, 'next_page')}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Page d'accueil ────────────────────────────────────────────────────────

  const { bannerData, sectionData, proSellerIds } = await getHomeData()
  const proSellers = new Set(proSellerIds)

  const sections = HOME_SECTIONS.map((s, i) => ({
    ...s,
    label: lang === 'kr' ? s.label_kr : s.label_en,
    listings: sectionData[i] ?? [],
  })).filter(s => s.listings.length > 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-4 md:pb-0">

      {/* Barre de recherche — tap-target mobile uniquement (desktop : barre dans le header) */}
      <div className="sticky top-14 z-40 bg-white border-b border-gray-100 px-3 py-3 lg:hidden">
        <div className="max-w-6xl mx-auto">
          <Link href="/search"
            className="flex items-center gap-3 bg-gray-100 rounded-2xl px-5 h-14 text-gray-400 hover:bg-gray-200 transition-colors active:scale-[0.98]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="22" y2="22" />
            </svg>
            <span className="text-base">{t(lang, 'search_home')}</span>
          </Link>
        </div>
      </div>

      {/* Catégories */}
      <div className="bg-white border-b border-gray-100">
        <Suspense>
          <CategoryNav />
        </Suspense>
      </div>

      {/* Carrousel bannières */}
      <div className="pt-3 lg:max-w-7xl lg:mx-auto lg:px-8">
        <BannerCarousel banners={(bannerData ?? []).map((b: any) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          image_url: b.image_url,
          link_url: b.link_url,
          link_label: b.link_label,
        }))} />
      </div>

      {/* Récemment vus */}
      <RecentlyViewedSection />

      {/* Sections par catégorie */}
      {sections.map(section => (
        <div key={section.value} className="mb-5 lg:max-w-7xl lg:mx-auto lg:px-8">
          <div className="flex items-center justify-between px-4 lg:px-0 mb-3">
            <h2 className="font-bold text-base text-gray-900">{section.label}</h2>
            <Link href={`/?category=${section.value}`}
              className="text-xs font-semibold"
              style={{ color: '#003F87' }}>
              {t(lang, 'see_all')}
            </Link>
          </div>
          <div className="flex gap-3 px-4 lg:px-0 overflow-x-auto scrollbar-hide pb-1 lg:grid lg:grid-cols-6 lg:overflow-visible">
            {section.listings.map((item: any) => {
              const imgCount = item.listing_images?.length ?? 0
              const isBoosted = item.boosted && item.boost_expires_at && new Date(item.boost_expires_at) > now
              const sellerPro = proSellers.has(item.user_id)
              return (
              <Link key={item.id} href={listingHref(item)}
                className="shrink-0 w-40 lg:w-auto bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow active:scale-95">
                <div className="relative w-40 lg:w-full bg-gray-100 aspect-[4/3]">
                  {item.listing_images?.[0]?.image_url ? (
                    <SafeImage src={item.listing_images[0].image_url} alt={item.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-200">📷</div>
                  )}
                  {sellerPro && (
                    <span className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#FCD116', color: '#000' }}>
                      ⭐ PRO
                    </span>
                  )}
                  {isBoosted && (
                    <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#FCD116', color: '#000' }}>
                      🚀 TOP
                    </span>
                  )}
                  {item.status === 'reserved' && !isBoosted && (
                    <span className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      🔒
                    </span>
                  )}
                  {imgCount > 1 && (
                    <span className="absolute bottom-1.5 right-1.5 bg-black/55 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                      📷 {imgCount}
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{item.title}</p>
                  <p className="text-sm font-bold mt-1" style={{ color: '#003F87' }}>
                    {noPriceLabel(item, lang) ?? formatPrice(item.price, item.currency)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5"><TimeAgo date={item.created_at} /></p>
                </div>
              </Link>
              )
            })}
          </div>
        </div>
      ))}

    </div>
  )
}

function ListingCard({ item, now, lang, sellerPro = false }: { item: any; now: Date; lang: Lang; sellerPro?: boolean }) {
  const image      = item.listing_images?.[0]?.image_url
  const photoCount = (item.listing_images?.length ?? 0) as number
  const isBoosted  = item.boosted && item.boost_expires_at && new Date(item.boost_expires_at) > now
  return (
    <Link href={listingHref(item)}
      className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow active:scale-95">
      <div className="relative w-full aspect-[4/3] bg-gray-100">
        {image
          ? <SafeImage src={image} alt={item.title} fill className="object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">📷</div>
        }
        {sellerPro && (
          <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#FCD116', color: '#000' }}>
            ⭐ PRO
          </span>
        )}
        {isBoosted && (
          <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#FCD116', color: '#000' }}>
            🚀 TOP
          </span>
        )}
        {item.status === 'reserved' && !isBoosted && (
          <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            🔒 {t(lang, 'reserved')}
          </span>
        )}
        {item.urgent && !isBoosted && item.status !== 'reserved' && (
          <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {t(lang, 'urgent_badge_full')}
          </span>
        )}
        {photoCount > 1 && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/55 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
            📷 {photoCount}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-sm font-medium line-clamp-2 text-gray-800 leading-snug">{item.title}</p>
        <p className="text-xs text-gray-400 mt-1 line-clamp-1">📍 {item.location || 'Seychelles'}</p>
        <p className="text-sm font-bold mt-1" style={{ color: '#003F87' }}>
          {noPriceLabel(item, lang)
            ?? (item.price_negotiable
              ? <span className="text-orange-600">{t(lang, 'negotiable')}</span>
              : formatPrice(item.price, item.currency))}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5"><TimeAgo date={item.created_at} /></p>
      </div>
    </Link>
  )
}

function buildParams(current: SearchParams = {}, overrides: Record<string, string>) {
  const p = new URLSearchParams()
  const merged = { ...current, ...overrides }
  Object.entries(merged).forEach(([k, v]) => { if (v) p.set(k, v) })
  return p.toString()
}
