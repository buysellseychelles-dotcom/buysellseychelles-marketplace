'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'

export default function ContactButton({
  listingId,
  sellerId,
}: {
  listingId: string
  sellerId: string
}) {
  const router = useRouter()
  const { lang } = useLang()
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
      .maybeSingle()

    if (existing) {
      router.push(`/conversations/${existing.id}`)
      return
    }

    // Pas de conversation existante : on ouvre l'écran de rédaction SANS rien
    // créer en base. La conversation ne sera insérée qu'à l'envoi du 1er message.
    router.push(`/conversations/new?listing=${listingId}&seller=${sellerId}`)
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
        <>💬 {lang === 'kr' ? 'Anvoy en mesaz' : 'Send a message'}</>
      )}
    </button>
  )
}
