'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ReviewForm from './review-form'
import ReviewStars from './review-stars'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'

type Review = { id: string; rating: number; comment: string | null; created_at: string; reviewer_id: string; reviewer_role?: string | null; verified_transaction?: boolean | null }

export default function SellerReviewSection({
  sellerId,
  reviews: initialReviews,
  avgRating: initialAvg,
}: {
  sellerId: string
  reviews: Review[]
  avgRating: number | null
}) {
  const { lang } = useLang()
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      setAlreadyReviewed(reviews.some(r => r.reviewer_id === user.id))
    })
  }, [reviews])

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null

  const handleDone = async () => {
    setShowForm(false)
    const { data } = await supabase.from('reviews').select('id, rating, comment, created_at, reviewer_id, reviewer_role, verified_transaction').eq('seller_id', sellerId).order('created_at', { ascending: false })
    if (data) { setReviews(data); setAlreadyReviewed(true) }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-gray-800">{t(lang, 'reviews_count')} ({reviews.length})</h2>
          {avg !== null && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <ReviewStars rating={avg} size="sm" />
              <span className="text-xs text-gray-500">{avg.toFixed(1)}/5</span>
            </div>
          )}
        </div>
        {userId && userId !== sellerId && !alreadyReviewed && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="text-xs font-medium border border-gray-300 rounded-full px-3 py-1.5 hover:border-black transition-colors">
            {t(lang, 'leave_review')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4">
          <ReviewForm sellerId={sellerId} onDone={handleDone} />
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
          <p className="text-2xl mb-2">⭐</p>
          <p className="text-gray-500 text-sm">{t(lang, 'no_reviews')}</p>
          {userId && userId !== sellerId && !alreadyReviewed && !showForm && (
            <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-black underline">
              {t(lang, 'be_first_review')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <ReviewStars rating={r.rating} size="sm" />
                  {r.verified_transaction && (
                    <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-1.5 py-0.5">
                      ✓ Verified transaction
                    </span>
                  )}
                  {r.reviewer_role === 'seller' && (
                    <span className="text-[10px] font-medium text-gray-500 bg-gray-100 rounded-full px-1.5 py-0.5">
                      As a buyer
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(r.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {r.comment && <p className="text-sm text-gray-700 leading-relaxed">"{r.comment}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
