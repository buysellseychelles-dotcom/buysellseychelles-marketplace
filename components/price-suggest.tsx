'use client'

import { useState } from 'react'

export default function PriceSuggest({
  category,
  onApply
}: {
  category: string
  onApply: (price: number) => void
}) {

  const [loading, setLoading] = useState(false)

  const suggest = async () => {

    setLoading(true)

    const res = await fetch('/api/price-suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category
      })
    })

    const data = await res.json()

    onApply(data.suggested_price)

    setLoading(false)
  }

  return (
    <button
      onClick={suggest}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      {loading ? 'Analyse...' : '💰 Prix recommandé'}
    </button>
  )
}