'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
  listingId: string
  disabled?: boolean
  defaultType?: 'standard' | 'premium' | 'ultra'
}

export default function BoostButton({
  listingId,
  disabled = false,
  defaultType = 'premium',
}: Props) {
  const [loading, setLoading] = useState(false)
  const [boostType, setBoostType] = useState(defaultType)

  const boost = async () => {
    if (disabled || loading) return

    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) {
      alert('Connexion requise')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/stripe/boost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          boostType,
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
        return
      }

      alert('Erreur paiement')
    } catch (error) {
      console.error(error)
      alert('Erreur serveur')
    }

    setLoading(false)
  }

  const isDisabled = disabled || loading

  return (
    <div className="flex gap-2 items-center mb-3">

      {/* SELECT BOOST TYPE */}
      <select
        value={boostType}
        onChange={(e) =>
          setBoostType(e.target.value as 'standard' | 'premium' | 'ultra')
        }
        disabled={isDisabled}
        className="border p-2 rounded text-sm"
      >
        <option value="standard">Standard 24h - 5€</option>
        <option value="premium">Premium x2 - 10€</option>
        <option value="ultra">Ultra x3 - 20€</option>
      </select>

      {/* BUTTON */}
      <button
        onClick={boost}
        disabled={isDisabled}
        className={`px-4 py-2 rounded text-white text-sm ${
          disabled
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600'
        }`}
      >
        {disabled
          ? '🚀 Boost actif'
          : loading
          ? 'Chargement...'
          : '🚀 Booster'}
      </button>
    </div>
  )
}