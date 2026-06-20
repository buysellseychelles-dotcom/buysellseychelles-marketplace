'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function FavoriteButton({
  listingId,
  initialCount = 0,
  viewsCount = 0,
}: {
  listingId: string
  initialCount?: number
  viewsCount?: number
}) {
  const router = useRouter()
  const [isFav, setIsFav] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .maybeSingle()

      setIsFav(!!data)
      setLoading(false)
    }
    init()
  }, [listingId])

  const toggle = async () => {
    if (!userId) { router.push('/login'); return }

    if (isFav) {
      await supabase.from('favorites').delete()
        .eq('user_id', userId).eq('listing_id', listingId)
      setIsFav(false)
      setCount(c => Math.max(0, c - 1))
    } else {
      await supabase.from('favorites').insert({ user_id: userId, listing_id: listingId })
      setIsFav(true)
      setCount(c => c + 1)
    }
  }

  if (loading) return null

  return (
    <button
      onClick={toggle}
      aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
      className={`flex items-center justify-center gap-2 w-full border rounded-xl py-3 text-sm font-medium transition-colors ${
        isFav
          ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
      }`}
    >
      <svg
        width="17" height="17" viewBox="0 0 24 24"
        fill={isFav ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{isFav ? 'Saved' : 'Save'}</span>
      {count > 0 && (
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${isFav ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
          {count}
        </span>
      )}
      {viewsCount > 0 && (
        <span className="text-xs text-gray-400 font-normal">· {viewsCount} vue{viewsCount > 1 ? 's' : ''}</span>
      )}
    </button>
  )
}
