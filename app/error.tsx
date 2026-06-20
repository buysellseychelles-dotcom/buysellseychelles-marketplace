'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-7xl mb-6">⚠️</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-500 text-sm mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={reset}
            className="bg-black text-white rounded-xl py-3 px-6 text-sm font-semibold hover:bg-gray-800 transition-colors">
            Try again
          </button>
          <Link href="/"
            className="border border-gray-300 text-gray-700 rounded-xl py-3 px-6 text-sm font-medium hover:border-black transition-colors">
            Back to listings
          </Link>
        </div>
      </div>
    </div>
  )
}
