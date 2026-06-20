'use client'

import { useState } from 'react'

export default function AIQualityScore({
  title,
  description,
  price,
  onResult
}: {
  title: string
  description: string
  price: number
  onResult: (data: any) => void
}) {

  const [loading, setLoading] = useState(false)

  const analyze = async () => {

    setLoading(true)

    const res = await fetch('/api/ai-quality', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        description,
        price
      })
    })

    const data = await res.json()

    onResult(data)

    setLoading(false)
  }

  return (
    <button
      onClick={analyze}
      className="bg-purple-600 text-white px-4 py-2 rounded"
    >
      {loading ? 'Analysing...' : '🤖 Quality score'}
    </button>
  )
}