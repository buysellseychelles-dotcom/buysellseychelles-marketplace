'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BoostButton from '@/components/boost-button'
import { formatPrice } from '@/lib/utils'

export default function ListingDetail({
  listingId,
}: {
  listingId: string
}) {

  const [listing, setListing] = useState<any>(null)
  const [images, setImages] = useState<any[]>([])
  const [views, setViews] = useState(0)
  const [isFav, setIsFav] = useState(false)

  useEffect(() => {

    const load = async () => {

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      const { data: listingData } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single()

      if (!listingData) {
        setListing(false)
        return
      }

      setListing(listingData)

      const { data: imgs } = await supabase
        .from('listing_images')
        .select('*')
        .eq('listing_id', listingId)

      setImages(imgs || [])

      if (user) {
        const { data: fav } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .eq('listing_id', listingId)
          .maybeSingle()

        setIsFav(!!fav)
      }

      const { count } = await supabase
        .from('listing_views')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', listingId)

      setViews(count || 0)
    }

    load()
  }, [listingId])

  // 🔥 BOOST ACTIF (AUTO EXPIRATION)
  const isBoostActive =
    listing?.boosted &&
    listing?.boost_expires_at &&
    new Date(listing.boost_expires_at) > new Date()

  const toggleFavorite = async () => {

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user || !listing) return

    if (isFav) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId)

      setIsFav(false)
    } else {
      await supabase.from('favorites').insert({
        user_id: user.id,
        listing_id: listingId
      })

      setIsFav(true)
    }
  }

  if (listing === null) return <div className="p-10">Loading...</div>
  if (listing === false) return <div className="p-10">Listing not found</div>

  return (
    <div className="max-w-4xl mx-auto p-6">

      <h1 className="text-3xl font-bold">{listing.title}</h1>

      <p className="text-2xl font-semibold mb-2">
        💰 {formatPrice(listing.price, listing.currency)}
      </p>

      {/* 🔥 BOOST STATUS */}
      {isBoostActive ? (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          🚀 Boost active (2x/3x visibility)
        </div>
      ) : (
        <div className="mb-4 text-gray-400">
          Standard listing
        </div>
      )}

      {/* 🔥 BOOST BUTTON */}
      <div className="mb-4">
        <BoostButton
          listingId={listing.id}
          ownerId={listing.user_id}
        />
      </div>

      <p className="text-sm text-gray-500 mb-4">
        👁 {views} views
      </p>

      <button
        onClick={toggleFavorite}
        className={`px-4 py-2 rounded mb-4 ${
          isFav ? 'bg-red-500 text-white' : 'bg-gray-200'
        }`}
      >
        {isFav ? '❤️ Favourite' : '🤍 Add to favourites'}
      </button>

      <div className="grid grid-cols-2 gap-3">
        {images.map((img) => (
          <img
            key={img.id}
            src={img.image_url}
            className="h-60 w-full object-cover rounded"
          />
        ))}
      </div>

    </div>
  )
}