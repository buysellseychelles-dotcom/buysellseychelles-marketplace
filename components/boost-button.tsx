'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const PLANS = [
  {
    id: 'boost_basic',
    name: 'Basic',
    duration: '7 days',
    price: '75 SCR',
    icon: '🚀',
    color: '#003F87',
    features: ['Highlighted in results', 'Up to 5× more views'],
  },
  {
    id: 'boost_featured',
    name: 'Featured',
    duration: '14 days',
    price: '150 SCR',
    icon: '⭐',
    color: '#007A3D',
    popular: true,
    features: ['Top position in category', 'Featured badge', 'Up to 12× more views'],
  },
  {
    id: 'boost_premium',
    name: 'Premium',
    duration: '30 days',
    price: '300 SCR',
    icon: '🏆',
    color: '#BE0027',
    features: ['Everything in Featured', 'Homepage banner slot', 'Priority placement'],
  },
]

function TimeLeft({ expiresAt }: { expiresAt: string }) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return <span className="text-red-500">Expired</span>
  const days  = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  return <span className="text-green-600 font-semibold">{days > 0 ? `${days}d ${hours}h` : `${hours}h`} remaining</span>
}

export default function BoostButton({ listingId, ownerId }: { listingId: string; ownerId: string }) {
  const [isOwner,   setIsOwner]   = useState(false)
  const [userId,    setUserId]    = useState<string | null>(null)
  const [boosted,   setBoosted]   = useState(false)
  const [boostType, setBoostType] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [paying,    setPaying]    = useState<string | null>(null)
  const [showPlans, setShowPlans] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.id !== ownerId) { setLoading(false); return }
      setIsOwner(true)
      setUserId(user.id)

      const { data: listing } = await supabase
        .from('listings')
        .select('boosted, boost_type, boost_expires_at')
        .eq('id', listingId)
        .single()

      if (listing) {
        const active = listing.boosted && listing.boost_expires_at && new Date(listing.boost_expires_at) > new Date()
        setBoosted(!!active)
        setBoostType(listing.boost_type ?? null)
        setExpiresAt(listing.boost_expires_at ?? null)
      }
      setLoading(false)
    }
    init()
  }, [listingId, ownerId])

  const startCheckout = async (productId: string) => {
    if (!userId || paying) return
    setPaying(productId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: productId, user_id: userId, listing_id: listingId }),
      })
      const { url, error } = await res.json()
      if (error) { alert('Error: ' + error); setPaying(null); return }
      window.location.href = url
    } catch {
      alert('Connection error. Please try again.')
      setPaying(null)
    }
  }

  if (loading || !isOwner) return null

  // ── Active boost ──────────────────────────────────────────────────
  if (boosted && expiresAt && new Date(expiresAt) > new Date()) {
    const plan = PLANS.find(p => p.id === `boost_${boostType}`) ?? PLANS[0]
    return (
      <div className="rounded-2xl border-2 p-4" style={{ borderColor: plan.color + '40', backgroundColor: plan.color + '08' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
              {plan.icon} {plan.name} boost active
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              <TimeLeft expiresAt={expiresAt} />
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white shrink-0"
            style={{ backgroundColor: plan.color }}>
            LIVE
          </span>
        </div>
        <button
          onClick={() => setShowPlans(true)}
          className="mt-3 w-full text-xs font-semibold border rounded-xl py-2 hover:bg-white transition-colors"
          style={{ borderColor: plan.color + '50', color: plan.color }}>
          Upgrade or extend →
        </button>
        {showPlans && <PlanModal plans={PLANS} paying={paying} onSelect={startCheckout} onClose={() => setShowPlans(false)} />}
      </div>
    )
  }

  // ── No boost ──────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <p className="text-2xl mb-2">🚀</p>
        <p className="font-semibold text-sm text-gray-800 mb-1">Boost this listing</p>
        <p className="text-xs text-gray-500 mb-3">
          Get more visibility and sell faster.<br />Starting from 75 SCR for 7 days.
        </p>
        <button
          onClick={() => setShowPlans(true)}
          className="w-full text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#003F87' }}>
          See boost options
        </button>
      </div>
      {showPlans && <PlanModal plans={PLANS} paying={paying} onSelect={startCheckout} onClose={() => setShowPlans(false)} />}
    </>
  )
}

function PlanModal({ plans, paying, onSelect, onClose }: {
  plans: typeof PLANS
  paying: string | null
  onSelect: (id: string) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
        <div className="text-white px-5 pt-5 pb-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #003F87, #007A3D)' }}>
          <div>
            <p className="font-bold">🚀 Boost your listing</p>
            <p className="text-xs text-white/80 mt-0.5">Reach more buyers faster</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-4 space-y-3">
          {plans.map(plan => (
            <button
              key={plan.id}
              onClick={() => onSelect(plan.id)}
              disabled={!!paying}
              className="w-full text-left rounded-xl border-2 p-3.5 transition-all hover:shadow-md disabled:opacity-50 relative"
              style={{ borderColor: paying === plan.id ? plan.color : plan.color + '30' }}>

              {plan.popular && (
                <span className="absolute -top-2.5 right-3 text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: plan.color }}>
                  ⭐ Most popular
                </span>
              )}

              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-sm text-gray-900">{plan.icon} {plan.name} — {plan.duration}</p>
                  <ul className="mt-1.5 space-y-0.5">
                    {plan.features.map(f => (
                      <li key={f} className="text-xs text-gray-500 flex items-center gap-1">
                        <span style={{ color: plan.color }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-extrabold text-base" style={{ color: plan.color }}>{plan.price}</p>
                  <p className="text-[10px] text-gray-400">one-time</p>
                  {paying === plan.id && (
                    <p className="text-[10px] text-gray-500 mt-1">Redirecting…</p>
                  )}
                </div>
              </div>
            </button>
          ))}

          <p className="text-[11px] text-gray-400 text-center pt-1">
            🔒 Secure payment via Stripe · Prices in SCR
          </p>
        </div>
      </div>
    </div>
  )
}
