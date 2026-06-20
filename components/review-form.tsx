'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'

export default function ReviewForm({
  sellerId,
  listingId,
  onDone,
  asBuyer = true,
}: {
  sellerId: string
  listingId?: string
  onDone: () => void
  /** true = on note un vendeur (par défaut) ; false = un vendeur note son acheteur */
  asBuyer?: boolean
}) {
  const { lang } = useLang()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ratingLabels = [
    '', t(lang, 'rating_1'), t(lang, 'rating_2'), t(lang, 'rating_3'), t(lang, 'rating_4'), t(lang, 'rating_5'),
  ]

  const submit = async () => {
    if (!rating) { setError(t(lang, 'review_error_rating')); return }
    setLoading(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError(t(lang, 'review_error_auth')); setLoading(false); return }

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ sellerId, listingId, rating, comment }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Error'); setLoading(false); return }
    onDone()
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="font-semibold text-sm text-gray-800 mb-4">{t(lang, asBuyer ? 'review_label' : 'review_label_buyer')}</h3>

      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} type="button"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(i)}
            className="text-3xl leading-none transition-transform hover:scale-110"
          >
            <span className={(hovered || rating) >= i ? 'text-yellow-400' : 'text-gray-200'}>★</span>
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-gray-500 self-center">{ratingLabels[rating]}</span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder={t(lang, asBuyer ? 'review_placeholder' : 'review_placeholder_buyer')}
        rows={3}
        maxLength={500}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black mb-3"
      />

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      <button onClick={submit} disabled={loading || !rating}
        className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium disabled:opacity-40">
        {loading ? t(lang, 'review_submitting') : t(lang, 'publish_review')}
      </button>
    </div>
  )
}
