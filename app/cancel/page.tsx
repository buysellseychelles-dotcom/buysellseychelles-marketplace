'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function CancelContent() {
  const params = useSearchParams()
  const listingId = params.get('listingId')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">

        {/* Icône */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Payment cancelled
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          No amount was charged.<br />You can try again anytime.
        </p>

        {/* Rappel des avantages */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Why boost?
          </p>
          <ul className="space-y-3">
            {[
              { icon: '🚀', title: 'More visibility', desc: 'Appears at the top of results' },
              { icon: '🔥', title: 'More contacts', desc: 'Buyers see you first' },
              { icon: '⚡', title: 'Sell faster', desc: 'From 150 SCR for 24h' },
            ].map(item => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Boutons */}
        <div className="space-y-3">
          {listingId && (
            <Link
              href={`/listing/${listingId}`}
              className="block w-full bg-black text-white text-sm font-semibold py-3.5 rounded-2xl text-center hover:bg-gray-800 transition-colors"
            >
              Try boost again
            </Link>
          )}
          <Link
            href="/"
            className="block w-full border border-gray-200 text-gray-700 text-sm font-medium py-3.5 rounded-2xl text-center hover:bg-gray-50 transition-colors"
          >
            Back to home
          </Link>
        </div>

      </div>
    </div>
  )
}

export default function CancelPage() {
  return (
    <Suspense>
      <CancelContent />
    </Suspense>
  )
}
