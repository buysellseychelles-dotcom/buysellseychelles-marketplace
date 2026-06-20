'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

type Fav = {
  listing_id: string
  listings: {
    id: string
    title: string
    price: number | null
    location: string | null
    listing_images: { image_url: string }[]
  } | null
}

export default function FavoritesPage() {
  const router = useRouter()
  const [favs, setFavs] = useState<Fav[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('favorites')
        .select(`listing_id, listings(id, title, price, location, listing_images(image_url))`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setFavs((data as any) ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  const removeFav = async (listingId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('favorites').delete()
      .eq('user_id', user.id).eq('listing_id', listingId)
    setFavs(prev => prev.filter(f => f.listing_id !== listingId))
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-4">

      {/* Header */}
      <div className="bg-black text-white px-4 py-5">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-400 mb-3 hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
          Back
        </button>
        <h1 className="text-xl font-bold">❤️ My Favourites</h1>
        <p className="text-gray-400 text-sm mt-0.5">{favs.length} saved listing{favs.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-4 pt-4">
        {favs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 mt-2">
            <p className="text-4xl mb-3">🤍</p>
            <p className="text-gray-500 text-sm mb-4">No favourites yet.<br />Tap the heart on a listing to save it.</p>
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 bg-black text-white text-sm px-5 py-2.5 rounded-full font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
              Back
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {favs.map(fav => {
              const listing = fav.listings
              if (!listing) return null
              const image = listing.listing_images?.[0]?.image_url

              return (
                <div key={fav.listing_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex gap-3 p-3">
                  {/* Image */}
                  <Link href={`/listing/${listing.id}`} className="relative w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    {image
                      ? <Image src={image} alt={listing.title} fill className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">📷</div>
                    }
                  </Link>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/listing/${listing.id}`}>
                      <p className="font-semibold text-sm line-clamp-2 text-gray-800">{listing.title}</p>
                    </Link>
                    <p className="text-sm font-bold text-black mt-1">
                      {listing.price ? `${Number(listing.price).toLocaleString()} SCR` : 'Price negotiable'}
                    </p>
                    {listing.location && (
                      <p className="text-xs text-gray-400 mt-0.5">📍 {listing.location}</p>
                    )}
                  </div>

                  {/* Supprimer favori */}
                  <button
                    onClick={() => removeFav(fav.listing_id)}
                    className="text-red-400 hover:text-red-600 text-xl shrink-0 self-start mt-1"
                    aria-label="Remove from favourites"
                  >
                    ❤️
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
