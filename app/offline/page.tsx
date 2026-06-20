'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl mx-auto mb-6">
          📡
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">No connection</h1>
        <p className="text-gray-500 text-sm mb-6">
          Check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
