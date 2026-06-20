'use client'

import dynamic from 'next/dynamic'

type Listing = {
  id: string
  title: string
  price: number | null
  currency: string | null
  location: string | null
  category: string | null
  image_url?: string
}

const ListingsMap = dynamic(() => import('@/components/listings-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading map…</p>
    </div>
  ),
})

export default function MapWrapper({ listings }: { listings: Listing[] }) {
  return <ListingsMap listings={listings} />
}
