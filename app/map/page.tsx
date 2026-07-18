import { createClient } from '@supabase/supabase-js'
import { Metadata } from 'next'
import Link from 'next/link'
import MapWrapper from '@/components/map-wrapper'

export const metadata: Metadata = {
  title: 'Map – BuySellSeychelles',
  description: 'Browse listings on a map of the Seychelles islands.',
}

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function MapPage() {
  const { data } = await supabase
    .from('listings')
    .select('id, title, price, currency, location, category, listing_images(image_url)')
    .not('status', 'in', '("sold","expired")')
    .order('created_at', { ascending: false })
    .limit(200)

  const listings = (data ?? []).map((l: any) => ({
    id: l.id,
    title: l.title,
    price: l.price,
    currency: l.currency,
    location: l.location,
    category: l.category,
    image_url: l.listing_images?.[0]?.image_url ?? null,
  }))

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] pb-4 md:pb-0">

      {/* Header */}
      <div className="bg-black text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-base font-bold">🗺️ Map view</h1>
          <p className="text-gray-400 text-xs">{listings.length} listings across the Seychelles</p>
        </div>
        <Link href="/" className="text-xs text-gray-400 hover:text-white border border-white/20 px-3 py-1.5 rounded-full">
          ← List view
        </Link>
      </div>

      {/* Map full height */}
      <div className="flex-1 p-2">
        <MapWrapper listings={listings} />
      </div>

    </div>
  )
}
