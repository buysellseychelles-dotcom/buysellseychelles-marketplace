'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function FollowSellerButton({
  sellerId,
  variant = 'dark',
}: {
  sellerId: string
  variant?: 'dark' | 'light'
}) {
  const [myId, setMyId] = useState<string | null>(null)
  const [isOwn, setIsOwn] = useState(false)
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id === sellerId) { setIsOwn(true); setLoading(false); return }
      setMyId(user?.id ?? null)
      if (user) {
        const res = await fetch(`/api/seller/follow?sellerId=${sellerId}&followerId=${user.id}`)
        const data = await res.json()
        setFollowing(data.following ?? false)
      }
      setLoading(false)
    }
    init()
  }, [sellerId])

  const toggle = async () => {
    if (!myId) { window.location.href = '/login'; return }
    setToggling(true)
    const res = await fetch('/api/seller/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId, followerId: myId }),
    })
    const data = await res.json()
    setFollowing(data.following ?? !following)
    setToggling(false)
  }

  if (isOwn) return null

  if (loading) {
    if (variant === 'light') return <div className="flex-1 min-h-[44px] bg-gray-50 animate-pulse" />
    return <div className="h-9 w-28 bg-white/20 animate-pulse rounded-full" />
  }

  if (variant === 'light') {
    return (
      <button
        onClick={toggle}
        disabled={toggling}
        className={`flex-1 text-sm font-semibold py-3 transition-colors disabled:opacity-60 ${
          following
            ? 'text-gray-500 bg-gray-50 hover:bg-gray-100'
            : 'text-[#003F87] hover:bg-blue-50'
        }`}
      >
        {following ? '✓ Following' : '+ Follow'}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={toggling}
      className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-60 ${
        following
          ? 'bg-white/20 text-white hover:bg-white/30'
          : 'bg-white text-gray-800 hover:bg-gray-100'
      }`}
    >
      {following ? '✓ Following' : '+ Follow'}
    </button>
  )
}
