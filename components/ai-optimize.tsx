'use client'

import { useState } from 'react'

export default function AIOptimize({
  onApply
}: {
  onApply: (data: any) => void
}) {

  const [loading, setLoading] = useState(false)

  const optimize = async () => {

    setLoading(true)

    const res = await fetch('/api/ai-optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Produit exemple',
        description: 'Description exemple',
        price: 100
      })
    })

    const data = await res.json()

    onApply(data)

    setLoading(false)
  }

  return (
    <button
      onClick={optimize}
      className="bg-black text-white px-4 py-2 rounded"
    >
      {loading ? 'Optimisation...' : '🤖 Optimiser avec IA'}
    </button>
  )
}