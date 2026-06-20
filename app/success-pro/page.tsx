'use client'

import Link from 'next/link'

export default function SuccessProPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">

        {/* Icône */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-yellow-50 flex items-center justify-center text-5xl">
            ⭐
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Welcome to PRO!
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Your subscription is active. Enjoy all the PRO features.
        </p>

        {/* Récap */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            What's now active
          </p>
          <ul className="space-y-2.5">
            {[
              { icon: '⭐', txt: 'Gold PRO badge on your profile and listings' },
              { icon: '🚀', txt: '1 free Standard boost this month' },
              { icon: '🔝', txt: 'Priority in search results' },
              { icon: '📊', txt: 'Advanced statistics per listing' },
            ].map(item => (
              <li key={item.txt} className="flex items-start gap-2.5">
                <span className="text-lg shrink-0">{item.icon}</span>
                <span className="text-sm text-gray-700">{item.txt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Boutons */}
        <div className="space-y-3">
          <Link
            href="/post-ad"
            className="block w-full bg-black text-white text-sm font-semibold py-3.5 rounded-2xl text-center hover:bg-gray-800 transition-colors"
          >
            Post a PRO listing →
          </Link>
          <Link
            href="/dashboard"
            className="block w-full border border-gray-200 text-gray-700 text-sm font-medium py-3.5 rounded-2xl text-center hover:bg-gray-50 transition-colors"
          >
            View my dashboard
          </Link>
        </div>

      </div>
    </div>
  )
}
