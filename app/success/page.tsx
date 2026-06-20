'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type ProductMeta = {
  icon: string
  title: string
  subtitle: string
  highlights: string[]
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
}

function getProductMeta(product: string, listingId?: string | null, next?: string | null): ProductMeta {
  const listingHref = listingId ? `/listing/${listingId}` : '/dashboard'

  if (product === 'boost_basic') return {
    icon: '🚀', title: 'Basic Boost activated!', subtitle: 'Your listing is now highlighted for 7 days.',
    highlights: ['Highlighted in search results', 'Up to 5× more views', 'Active for 7 days'],
    primaryLabel: 'View my listing →', primaryHref: listingHref,
    secondaryLabel: 'Back to dashboard', secondaryHref: '/dashboard',
  }
  if (product === 'boost_featured') return {
    icon: '⭐', title: 'Featured Boost activated!', subtitle: 'Your listing is at the top for 14 days.',
    highlights: ['Top position in your category', 'Featured badge visible', 'Up to 12× more views'],
    primaryLabel: 'View my listing →', primaryHref: listingHref,
    secondaryLabel: 'Back to dashboard', secondaryHref: '/dashboard',
  }
  if (product === 'boost_premium') return {
    icon: '🏆', title: 'Premium Boost activated!', subtitle: 'Maximum visibility for 30 days.',
    highlights: ['Top position in category', 'Homepage banner slot', 'Priority in all searches'],
    primaryLabel: 'View my listing →', primaryHref: listingHref,
    secondaryLabel: 'Back to dashboard', secondaryHref: '/dashboard',
  }
  if (product === 'photo_pack') return {
    icon: '📸', title: 'Photo pack unlocked!', subtitle: 'You can now add up to 10 photos to your listing.',
    highlights: ['10 photos per listing (instead of 3)', 'Valid for 1 year', 'Already applied to your account'],
    primaryLabel: next ? 'Continue posting my ad →' : 'Post a new listing →', primaryHref: next ?? '/post-ad',
    secondaryLabel: 'Back to home', secondaryHref: '/',
  }
  if (product.startsWith('banner_')) {
    const days = product.replace('banner_', '')
    return {
      icon: '📢', title: 'Your banner is live!', subtitle: `It's now rotating on the home page for the next ${days} days.`,
      highlights: [`${days}-day homepage banner`, 'Live right now — no waiting', 'Seen by every visitor'],
      primaryLabel: 'See it on the home page →', primaryHref: '/',
      secondaryLabel: 'Advertise another business', secondaryHref: '/advertise',
    }
  }
  // Legacy / generic
  return {
    icon: '✅', title: 'Payment successful!', subtitle: 'Your purchase has been activated.',
    highlights: ['Thank you for your purchase'],
    primaryLabel: listingId ? 'View my listing →' : 'Back to dashboard', primaryHref: listingId ? listingHref : '/dashboard',
  }
}

function SuccessContent() {
  const params     = useSearchParams()
  const product    = params.get('product') ?? params.get('boostType') ?? 'standard'
  const listingId  = params.get('listing_id') ?? params.get('listingId')
  const next       = params.get('next')
  const [title, setTitle] = useState<string | null>(null)

  useEffect(() => {
    if (!listingId) return
    supabase.from('listings').select('title').eq('id', listingId).single()
      .then(({ data }) => { if (data) setTitle(data.title) })
  }, [listingId])

  const meta = getProductMeta(product, listingId, next)
  const isBoost = product.startsWith('boost_') || ['standard','premium','ultra'].includes(product)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-sm w-full">

        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-5xl">
            {meta.icon}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">{meta.title}</h1>
        <p className="text-center text-gray-500 text-sm mb-6">{meta.subtitle}</p>

        {/* Details card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          {title && isBoost && (
            <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-3">
              <p className="text-xs text-gray-400 mb-0.5">Listing</p>
              <p className="text-sm font-medium text-gray-800 line-clamp-2">{title}</p>
            </div>
          )}
          <ul className="space-y-2">
            {meta.highlights.map(h => (
              <li key={h} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Badge */}
        <div className="bg-green-50 rounded-2xl p-3 mb-6 text-center">
          <p className="text-xs font-semibold text-green-700">
            🔒 Payment processed securely via Stripe
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link href={meta.primaryHref}
            className="block w-full bg-black text-white text-sm font-semibold py-3.5 rounded-2xl text-center hover:bg-gray-800 transition-colors">
            {meta.primaryLabel}
          </Link>
          {meta.secondaryLabel && (
            <Link href={meta.secondaryHref!}
              className="block w-full border border-gray-200 text-gray-700 text-sm font-medium py-3.5 rounded-2xl text-center hover:bg-gray-50 transition-colors">
              {meta.secondaryLabel}
            </Link>
          )}
        </div>

      </div>
    </div>
  )
}

export default function SuccessPage() {
  return <Suspense><SuccessContent /></Suspense>
}
