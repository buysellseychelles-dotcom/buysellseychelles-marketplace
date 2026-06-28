'use client'

import { useEffect, useState } from 'react'

export default function OfflinePage() {
  const [online, setOnline] = useState(false)

  // Suit l'état de la connexion en temps réel
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  // Dès que la connexion revient, on recharge automatiquement la page
  useEffect(() => {
    if (!online) return
    const t = setTimeout(() => window.location.reload(), 1200)
    return () => clearTimeout(t)
  }, [online])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {/* Logo du site (mis en cache par le service worker → visible hors-ligne) */}
        <img
          src="/logo.svg"
          alt="BuySellSeychelles"
          width={72}
          height={72}
          className="mx-auto mb-6 rounded-2xl shadow-sm"
        />

        {/* Indicateur d'état de la connexion */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${
            online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              online ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          {online ? 'Back online' : 'Offline'}
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {online ? 'Connection restored' : 'No connection'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {online
            ? 'Reloading the page…'
            : 'Check your internet connection. The page will reload automatically once you’re back online.'}
        </p>

        <button
          onClick={() => window.location.reload()}
          className={`px-6 py-3 rounded-full text-sm font-medium text-white transition-colors ${
            online ? 'bg-green-600 hover:bg-green-700' : 'bg-black hover:bg-gray-800'
          }`}
        >
          {online ? 'Reload now' : 'Try again'}
        </button>

        {/* Pages disponibles hors-ligne (mises en cache par le service worker) */}
        <p className="mt-8 text-xs text-gray-400">
          Available offline:{' '}
          <a href="/" className="underline hover:text-gray-600">Home</a>
          {' · '}
          <a href="/login" className="underline hover:text-gray-600">Login</a>
          {' · '}
          <a href="/dashboard" className="underline hover:text-gray-600">Dashboard</a>
        </p>
      </div>
    </div>
  )
}