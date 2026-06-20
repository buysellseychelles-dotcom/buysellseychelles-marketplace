'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ContactButton({
  listingId,
  sellerId,
}: {
  listingId: string
  sellerId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleContact = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/login?redirect=/listing/${listingId}`)
      return
    }

    // Ne pas contacter sa propre annonce
    if (user.id === sellerId) {
      router.push('/my-listings')
      return
    }

    // Chercher une conversation existante
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .eq('user_id', user.id)
      .eq('seller_id', sellerId)
      .single()

    if (existing) {
      router.push(`/conversations/${existing.id}`)
      return
    }

    // Créer une nouvelle conversation
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        listing_id: listingId,
        user_id: user.id,
        seller_id: sellerId,
        last_message: '',
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (newConv) {
      router.push(`/conversations/${newConv.id}`)
    } else {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleContact}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-black text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
    >
      {loading ? (
        <span>Loading...</span>
      ) : (
        <>💬 Send a message</>
      )}
    </button>
  )
}
