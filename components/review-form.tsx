'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ReviewForm({
  sellerId
}: {
  sellerId: string
}) {

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const submitReview = async () => {

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) return

    await supabase.from('reviews').insert({
      seller_id: sellerId,
      user_id: user.id,
      rating,
      comment
    })

    alert('Avis ajouté ⭐')

    setComment('')
  }

  return (
    <div className="border p-4 rounded mb-6">

      <h2 className="font-bold mb-3">
        Laisser un avis
      </h2>

      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="border p-2 mb-3 w-full"
      >
        <option value={5}>5 étoiles</option>
        <option value={4}>4 étoiles</option>
        <option value={3}>3 étoiles</option>
        <option value={2}>2 étoiles</option>
        <option value={1}>1 étoile</option>
      </select>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Votre avis..."
        className="border p-2 w-full mb-3"
      />

      <button
        onClick={submitReview}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Envoyer
      </button>

    </div>
  )
}