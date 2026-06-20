'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'
import { formatPrice } from '@/lib/utils'
import { listingHref } from '@/lib/slug'

const KEY = 'bss_recently_viewed'
const MAX = 10

export function RecentlyViewedTracker({ id }: { id: string }) {
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
    const updated = [id, ...stored.filter(x => x !== id)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(updated))
  }, [id])
  return null
}

export function RecentlyViewedSection() {
  const { lang } = useLang()
  const [listings, setListings] = useState<any[]>([])

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
    if (ids.length === 0) return
    supabase
      .from('listings')
      .select('id,title,price,currency,listing_images(image_url)')
      .in('id', ids)
      .not('status', 'in', '("sold","expired")')
      .then(({ data }) => {
        if (!data || data.length === 0) return
        const ordered = ids
          .map(id => data.find((d: any) => d.id === id))
          .filter(Boolean)
        setListings(ordered)
      })
  }, [])

  if (listings.length === 0) return null

  return (
    <div className="mb-5 lg:max-w-7xl lg:mx-auto lg:px-8">
      <div className="flex items-center px-4 lg:px-0 mb-3">
        <h2 className="font-bold text-base text-gray-900">{t(lang, 'recently_viewed')}</h2>
      </div>
      <div className="flex gap-3 px-4 lg:px-0 overflow-x-auto scrollbar-hide pb-1">
        {listings.map((item: any) => (
          <Link key={item.id} href={listingHref(item)}
            className="shrink-0 w-36 bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow active:scale-95">
            <div className="relative w-36 h-28 bg-gray-100">
              {item.listing_images?.[0]?.image_url ? (
                <Image src={item.listing_images[0].image_url} alt={item.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl text-gray-200">📷</div>
              )}
            </div>
            <div className="p-2">
              <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{item.title}</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: '#003F87' }}>
                {formatPrice(item.price, item.currency)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
