import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { listingHref } from '@/lib/slug'
import { SITE_URL, SITE_NAME } from '@/lib/site'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const metadata: Metadata = {
  title: `Trending listings | ${SITE_NAME}`,
  description: 'The most popular and most viewed listings right now in the Seychelles.',
  alternates: { canonical: `${SITE_URL}/trending` },
}

export const dynamic = 'force-dynamic'

export default async function TrendingPage() {
  const { data } = await supabase
    .from('listings')
    .select('id, title, price, location, category, boosted, boost_expires_at, rank_score, views_count, listing_images(image_url)')
    .order('rank_score', { ascending: false })
    .limit(30)

  const now = new Date()
  const listings = data ?? []

  return (
    <div className="max-w-2xl mx-auto pb-4">

      {/* Header */}
      <div className="bg-black text-white px-4 py-5">
        <h1 className="text-xl font-bold">🔥 Trending</h1>
        <p className="text-gray-400 text-sm mt-0.5">The most popular listings right now</p>
      </div>

      <div className="px-3 pt-4">
        {listings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔥</p>
            <p className="text-gray-500 text-sm">No trending listings right now.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-black underline">
              View all listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {listings.map((item: any, index: number) => {
              const image = item.listing_images?.[0]?.image_url
              const isBoosted = item.boosted && item.boost_expires_at && new Date(item.boost_expires_at) > now

              return (
                <Link
                  key={item.id}
                  href={listingHref(item)}
                  className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow active:scale-95"
                >
                  {/* Image */}
                  <div className="relative w-full aspect-square bg-gray-100">
                    {image ? (
                      <Image src={image} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">📷</div>
                    )}

                    {/* Rang */}
                    <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      #{index + 1}
                    </span>

                    {isBoosted && (
                      <span className="absolute top-1.5 right-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        🚀 TOP
                      </span>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="p-2.5">
                    <p className="text-sm font-medium line-clamp-2 text-gray-800 leading-snug">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">📍 {item.location || 'Seychelles'}</p>
                    <p className="text-sm font-bold text-black mt-1">
                      {item.price ? `${Number(item.price).toLocaleString()} SCR` : 'Price negotiable'}
                    </p>
                    {item.views_count > 0 && (
                      <p className="text-xs text-gray-400 mt-1">👁 {item.views_count} views</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
