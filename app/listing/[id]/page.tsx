import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import Image from 'next/image'
import SafeImage from '@/components/safe-image'
import BackButton from '@/components/back-button'
import { CATEGORY_LABELS } from '@/lib/i18n'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import BoostButton from '@/components/boost-button'
import { RecentlyViewedTracker } from '@/components/recently-viewed'
import PhoneReveal from '@/components/phone-reveal'
import PriceDropBadge from '@/components/price-tracker'
import ContactButton from '@/components/contact-button'
import FavoriteButton from '@/components/favorite-button'
import TimeAgo from '@/components/time-ago'
import ReportButton from '@/components/report-button'
import PhotoSwipe from '@/components/photo-swipe'
import ShareButtons from '@/components/share-buttons'
import SellerResponseBadge from '@/components/seller-response-badge'
import { formatPrice } from '@/lib/utils'
import { t, tOption, type Lang } from '@/lib/i18n'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://v0-buysellseychelles-marketplace-ma.vercel.app'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const { data: listing } = await supabase
    .from('listings')
    .select('title, description, price, location, category')
    .eq('id', id)
    .single()

  if (!listing) return { title: 'Listing not found – BuySellSeychelles' }

  const { data: images } = await supabase
    .from('listing_images')
    .select('image_url')
    .eq('listing_id', id)
    .limit(1)

  const image = images?.[0]?.image_url
  const price = listing.price ? `${Number(listing.price).toLocaleString()} SCR` : 'Price negotiable'
  const description = listing.description
    ? `${listing.description.slice(0, 150)}...`
    : `${listing.title} – ${price} – ${listing.location ?? 'Seychelles'}`

  const url = `${SITE_URL}/listing/${id}`

  return {
    title: `${listing.title} – ${price} | BuySellSeychelles`,
    description,
    openGraph: {
      title: `${listing.title} – ${price}`,
      description,
      url,
      siteName: 'BuySellSeychelles',
      images: image ? [{ url: image, width: 800, height: 600, alt: listing.title }] : [],
      locale: 'en_SC',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${listing.title} – ${price}`,
      description,
      images: image ? [image] : [],
    },
    alternates: { canonical: url },
  }
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const lang = (cookieStore.get('bss_lang')?.value ?? 'en') as Lang

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (!listing) return notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, island, verified, is_pro, avatar_url, whatsapp, online')
    .eq('id', listing.user_id)
    .maybeSingle()

  const { data: images } = await supabase
    .from('listing_images')
    .select('image_url')
    .eq('listing_id', id)

  const { count: favCount } = await supabase
    .from('favorites')
    .select('id', { count: 'exact', head: true })
    .eq('listing_id', id)

  const { data: similar } = await supabase
    .from('listings')
    .select('id, title, price, location, listing_images(image_url)')
    .eq('category', listing.category)
    .neq('id', listing.id)
    .neq('status', 'sold')
    .order('created_at', { ascending: false })
    .limit(4)

  const isBoostActive =
    listing.boosted &&
    listing.boost_expires_at &&
    new Date(listing.boost_expires_at) > new Date()

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in your listing: ${listing.title}`
  )
  const sellerWhatsapp = profile?.whatsapp
  const whatsappLink = sellerWhatsapp
    ? `https://wa.me/${sellerWhatsapp.replace(/\D/g, '')}?text=${whatsappMessage}`
    : null

  const shareUrl = `${SITE_URL}/listing/${listing.id}`
  const priceLabel = formatPrice(listing.price, listing.currency)
  const contactPhone = listing.phone || profile?.whatsapp || null
  const cleanPhone = contactPhone ? contactPhone.replace(/\D/g, '') : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description ?? undefined,
    image: images?.map((img: any) => img.image_url) ?? [],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'SCR',
      price: listing.price ?? '0',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/listing/${listing.id}`,
      seller: { '@type': 'Person', name: listing.location ?? 'Seychelles' },
    },
  }

  /* ── Bloc réutilisable : spécifications ── */
  const specs: { label: string; value: string }[] = []
  if (listing.category === 'voiture') {
    if (listing.make)      specs.push({ label: t(lang, 'spec_brand'),    value: listing.make })
    if (listing.model)     specs.push({ label: t(lang, 'spec_model'),    value: listing.model })
    if (listing.year)      specs.push({ label: t(lang, 'spec_year'),     value: String(listing.year) })
    if (listing.mileage)   specs.push({ label: t(lang, 'spec_mileage'),  value: `${Number(listing.mileage).toLocaleString()} km` })
    if (listing.fuel_type) specs.push({ label: t(lang, 'spec_fuel'),     value: tOption(lang, listing.fuel_type) })
    if (listing.gearbox)   specs.push({ label: t(lang, 'spec_gearbox'),  value: tOption(lang, listing.gearbox) })
    if (listing.condition) specs.push({ label: t(lang, 'spec_condition'),value: tOption(lang, listing.condition) })
  } else if (listing.category === 'immobilier') {
    if (listing.property_type) specs.push({ label: t(lang, 'filter_type'),    value: tOption(lang, listing.property_type) })
    if (listing.area_sqm)      specs.push({ label: t(lang, 'spec_area'),      value: `${listing.area_sqm} m²` })
    if (listing.bedrooms)      specs.push({ label: t(lang, 'spec_bedrooms'),  value: String(listing.bedrooms) })
    if (listing.bathrooms)     specs.push({ label: t(lang, 'spec_bathrooms'), value: String(listing.bathrooms) })
    if (listing.furnished != null) specs.push({ label: t(lang, 'spec_furnished'), value: listing.furnished ? t(lang, 'yes') : t(lang, 'no') })
    if (listing.tenure)        specs.push({ label: t(lang, 'spec_tenure'),    value: tOption(lang, listing.tenure) })
  } else if (listing.category === 'bateau') {
    if (listing.boat_type) specs.push({ label: t(lang, 'filter_type'),    value: tOption(lang, listing.boat_type) })
    if (listing.make)      specs.push({ label: t(lang, 'spec_brand'),     value: listing.make })
    if (listing.year)      specs.push({ label: t(lang, 'spec_year'),      value: String(listing.year) })
    if (listing.condition) specs.push({ label: t(lang, 'spec_condition'), value: tOption(lang, listing.condition) })
  } else if (listing.category === 'emploi') {
    if (listing.contract_type) specs.push({ label: t(lang, 'spec_contract'), value: tOption(lang, listing.contract_type) })
    if (listing.salary)        specs.push({ label: t(lang, 'spec_salary'),   value: listing.salary })
  } else if (listing.category === 'electronique') {
    if (listing.condition) specs.push({ label: t(lang, 'spec_condition'), value: tOption(lang, listing.condition) })
  }

  /* ── Composants réutilisables ── */
  const SellerCard = (
    <Link href={`/seller/${listing.user_id}`}
      className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
      <div className="w-10 h-10 rounded-full bg-black overflow-hidden flex items-center justify-center text-white font-bold text-sm shrink-0 relative">
        {profile?.avatar_url
          ? <Image src={profile.avatar_url} alt="" fill className="object-cover" unoptimized />
          : (profile?.full_name || '?')[0]?.toUpperCase()
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold text-gray-800">{profile?.full_name || t(lang, 'seller')}</p>
          {profile?.is_pro && <span className="bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">⭐ PRO</span>}
          {profile?.verified && <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">✓</span>}
        </div>
        {profile?.island && <p className="text-xs text-gray-500">📍 {profile.island}</p>}
        {profile?.online && (
          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse" />
            {t(lang, 'online_now')}
          </p>
        )}
      </div>
      <span className="text-xs text-gray-400">{t(lang, 'see_profile')}</span>
    </Link>
  )

  const ContactBlock = (
    <div className="space-y-2.5">
      {contactPhone && cleanPhone && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-2">{t(lang, 'contact_direct')}</p>
          <PhoneReveal phone={contactPhone} cleanPhone={cleanPhone} title={listing.title} />
        </div>
      )}
      {listing.user_id && <ContactButton listingId={listing.id} sellerId={listing.user_id} />}
      <FavoriteButton listingId={listing.id} />
      {!contactPhone && whatsappLink && (
        <a href={whatsappLink} target="_blank"
          onClick={() => fetch('/api/track/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: listing.id }) })}
          className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-xl hover:bg-green-600 transition-colors text-sm">
          {t(lang, 'whatsapp_contact')}
        </a>
      )}
    </div>
  )

  const BadgesRow = (
    <div className="flex gap-2 flex-wrap items-center">
      {listing.status === 'sold' && <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">✓ {t(lang, 'sold_badge')}</span>}
      {listing.status === 'reserved' && <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">🔒 {t(lang, 'reserved')}</span>}
      {isBoostActive && <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">🚀 {t(lang, 'boosted')}</span>}
      {listing.urgent && <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">{t(lang, 'urgent_badge_full')}</span>}
      {listing.price_negotiable && <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">💬 {t(lang, 'negotiable')}</span>}
      {listing.delivery && <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">🚚 {t(lang, 'delivery')}</span>}
      <PriceDropBadge listingId={listing.id} currentPrice={listing.price} />
    </div>
  )

  return (
    <div className="pb-24 md:pb-0">

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script dangerouslySetInnerHTML={{ __html: `fetch('/api/track/view',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({listingId:'${listing.id}'})})` }} />

      {/* ── Layout desktop 2 colonnes ── */}
      <div className="lg:max-w-7xl lg:mx-auto lg:px-8 lg:pt-6 lg:grid lg:grid-cols-[1fr_380px] lg:gap-8 lg:items-start">

        {/* ══ COLONNE GAUCHE ══ */}
        <div className="min-w-0">

          {/* Photos */}
          <div className="relative lg:rounded-2xl lg:overflow-hidden">
            <BackButton />
            <PhotoSwipe images={images ?? []} title={listing.title} />
          </div>

          <div className="px-4 pt-4 space-y-4 lg:px-0 lg:pt-5">
            <RecentlyViewedTracker id={listing.id} />

            {/* Badges - mobile only (desktop : dans sidebar) */}
            <div className="lg:hidden">{BadgesRow}</div>

            {/* Views/favs — mobile */}
            <div className="flex items-center gap-3 text-xs text-gray-400 lg:hidden">
              {listing.views_count > 0 && <span>👁 {listing.views_count} {t(lang, 'views_label')}</span>}
              {favCount && favCount > 0 ? <span>❤️ {favCount} {t(lang, 'saved_label')}</span> : null}
            </div>

            {/* Titre & Prix — mobile only */}
            <div className="lg:hidden">
              <h1 className="text-xl font-bold text-gray-900">{listing.title}</h1>
              <p className="text-2xl font-bold text-black mt-1">{priceLabel}</p>
            </div>

            {/* Localisation & Catégorie */}
            <div className="flex gap-3 text-sm text-gray-500">
              {listing.location && <span>📍 {listing.location}</span>}
              {listing.category && <span>• {CATEGORY_LABELS[listing.category]?.[lang] ?? listing.category}</span>}
            </div>

            {/* Vendeur — mobile only */}
            {listing.user_id && <div className="lg:hidden">{SellerCard}</div>}
            {listing.user_id && <div className="lg:hidden"><SellerResponseBadge sellerId={listing.user_id} /></div>}

            {/* Contact — mobile only */}
            <div className="lg:hidden">{ContactBlock}</div>

            {/* Spécifications */}
            {specs.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <h2 className="font-semibold text-gray-800 mb-3">{t(lang, 'details')}</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {specs.map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{s.label}</p>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="border-t border-gray-100 pt-4">
              <h2 className="font-semibold text-gray-800 mb-2">{t(lang, 'description')}</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.description || t(lang, 'no_description')}
              </p>
            </div>

            {/* Boost — mobile only */}
            <div className="border-t border-gray-100 pt-4 lg:hidden">
              <BoostButton listingId={listing.id} />
            </div>

            {/* Share — mobile only */}
            <div className="border-t border-gray-100 pt-4 lg:hidden">
              <ShareButtons url={shareUrl} title={listing.title} price={priceLabel} />
            </div>

            {/* Date */}
            <p className="text-xs text-gray-400 pt-2">
              {t(lang, 'published')} <TimeAgo date={listing.created_at} />
            </p>

            {/* Annonces similaires */}
            {similar && similar.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <h2 className="font-semibold text-gray-800 mb-3">{t(lang, 'similar')}</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {similar.map((s: any) => {
                    const img = s.listing_images?.[0]?.image_url
                    return (
                      <Link key={s.id} href={`/listing/${s.id}`}
                        className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-sm transition-shadow">
                        <div className="relative w-full aspect-square bg-gray-100">
                          {img
                            ? <SafeImage src={img} alt={s.title} fill className="object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">📷</div>
                          }
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium line-clamp-2 text-gray-800">{s.title}</p>
                          <p className="text-xs font-bold text-black mt-0.5">
                            {s.price ? `${Number(s.price).toLocaleString()} SCR` : t(lang, 'negotiable')}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-center pt-2 pb-4">
              <ReportButton listingId={listing.id} />
            </div>
            <Link href="/" className="block text-center text-sm text-gray-500 hover:text-black pb-6">
              {t(lang, 'back_home')}
            </Link>
          </div>
        </div>

        {/* ══ COLONNE DROITE — sidebar sticky (desktop only) ══ */}
        <div className="hidden lg:block">
          <div className="sticky top-20 space-y-4">

            {/* Prix + titre */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h1 className="text-lg font-bold text-gray-900 leading-snug">{listing.title}</h1>
              <p className="text-3xl font-extrabold mt-2" style={{ color: '#003F87' }}>{priceLabel}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                {listing.views_count > 0 && <span>👁 {listing.views_count} {t(lang, 'views_label')}</span>}
                {favCount && favCount > 0 ? <span>❤️ {favCount} {t(lang, 'saved_label')}</span> : null}
              </div>
              <div className="mt-3">{BadgesRow}</div>
            </div>

            {/* Contact */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              {ContactBlock}
            </div>

            {/* Vendeur */}
            {listing.user_id && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4">{SellerCard}</div>
                <div className="border-t border-gray-100 px-4 py-3">
                  <SellerResponseBadge sellerId={listing.user_id} />
                </div>
              </div>
            )}

            {/* Boost */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <BoostButton listingId={listing.id} />
            </div>

            {/* Share */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <ShareButtons url={shareUrl} title={listing.title} price={priceLabel} />
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
