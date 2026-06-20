'use client'

import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Déjà installé ou déjà refusé → ne pas afficher
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      sessionStorage.getItem('install-dismissed')
    ) return

    // iOS : pas d'événement beforeinstallprompt, on affiche une instruction manuelle
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window.navigator as any).standalone
    if (ios) {
      setIsIOS(true)
      setShow(true)
      return
    }

    // Android / Chrome
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem('install-dismissed', '1')
    setShow(false)
  }

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setShow(false)
    else dismiss()
  }

  if (!show) return null

  return (
    <div className="fixed bottom-16 md:bottom-4 left-3 right-3 z-40 max-w-sm mx-auto">
      <div className="bg-black text-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
        <img src="/icon-192.png" alt="" className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">BuySellSeychelles</p>
          {isIOS ? (
            <p className="text-xs text-gray-400 mt-0.5 leading-snug">
              In Safari: tap{' '}
              <span className="inline-block bg-gray-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded align-middle">
                ⬆ Share
              </span>{' '}
              → <span className="text-white font-medium">Add to Home Screen</span>
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">Install the app — works offline</p>
          )}
        </div>
        {!isIOS && (
          <button
            onClick={install}
            className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-xl shrink-0"
          >
            Install
          </button>
        )}
        <button onClick={dismiss} className="text-gray-500 hover:text-white text-lg leading-none shrink-0">
          ×
        </button>
      </div>
    </div>
  )
}
