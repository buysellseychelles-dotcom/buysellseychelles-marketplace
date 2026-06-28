'use client'

import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [ready, setReady] = useState(false) // un événement d'install est dispo (Android/Chrome)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Déjà installé ou déjà refusé → ne pas afficher
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      sessionStorage.getItem('install-dismissed')
    ) return

    // iOS : pas d'événement beforeinstallprompt, on affiche une instruction manuelle
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window.navigator as any).standalone
    if (ios) {
      setIsIOS(true)
      setShow(true)
      return
    }

    // Android / Chrome : l'événement a peut-être déjà été capté par le script du
    // <head> avant le montage de ce composant → on le récupère immédiatement.
    if ((window as any).__bipEvent) {
      setReady(true)
      setShow(true)
    }

    // …et on réagit à ceux qui arrivent après le montage.
    const onAvailable = () => {
      if (sessionStorage.getItem('install-dismissed')) return
      setReady(true)
      setShow(true)
    }
    const onInstalled = () => setShow(false)
    window.addEventListener('bip-available', onAvailable)
    window.addEventListener('bip-installed', onInstalled)
    return () => {
      window.removeEventListener('bip-available', onAvailable)
      window.removeEventListener('bip-installed', onInstalled)
    }
  }, [])

  const dismiss = () => {
    sessionStorage.setItem('install-dismissed', '1')
    setShow(false)
  }

  const install = async () => {
    const evt = (window as any).__bipEvent
    if (!evt) {
      // Plus d'événement disponible (déjà consommé / non installable) → on referme proprement.
      dismiss()
      return
    }
    evt.prompt()
    try {
      const { outcome } = await evt.userChoice
      if (outcome === 'accepted') setShow(false)
      else dismiss()
    } finally {
      // L'événement ne peut servir qu'une fois.
      ;(window as any).__bipEvent = null
      setReady(false)
    }
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
        {!isIOS && ready && (
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