import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      <div className="mb-8 inline-flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.svg" alt="BuySellSeychelles" className="w-9 h-9 rounded-lg" />
        <span className="font-bold text-lg" style={{ color: '#003F87' }}>BuySellSeychelles</span>
      </div>

      <div className="text-center max-w-sm">
        <p className="text-7xl mb-4">🔍</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Page not found</h1>
        <p className="text-sm text-gray-400 mb-2">Paj pa existe</p>
        <p className="text-gray-500 text-sm mb-8">
          This page doesn&apos;t exist or has been removed.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/"
            className="text-white rounded-xl py-3 px-6 text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#003F87' }}>
            Browse listings →
          </Link>
          <Link href="/post-ad"
            className="border border-gray-300 text-gray-700 rounded-xl py-3 px-6 text-sm font-medium hover:border-black transition-colors">
            Post an ad
          </Link>
        </div>
      </div>

    </div>
  )
}
