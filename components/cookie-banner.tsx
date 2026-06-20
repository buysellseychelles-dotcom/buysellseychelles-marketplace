'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/lang-context'

const GA_ID = 'G-CZ9881KKHG'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  // Current stored choice: 'accepted' | 'declined' | null (re-opened from settings)
  const [choice, setChoice] = useState<string | null>(null)
  const { lang } = useLang()

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) {
      setVisible(true)
    }
    // Allow re-opening the banner from anywhere (e.g. footer "Manage cookies")
    const open = () => {
      setChoice(localStorage.getItem('cookie_consent'))
      setVisible(true)
    }
    window.addEventListener('open-cookie-settings', open)
    return () => window.removeEventListener('open-cookie-settings', open)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted')
    setChoice('accepted')
    setVisible(false)
    // Re-enable GA and load it if not already loaded
    ;(window as any)[`ga-disable-${GA_ID}`] = false
    if (typeof window !== 'undefined' && !(window as any).gaLoaded) {
      const s = document.createElement('script')
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
      s.async = true
      document.head.appendChild(s)
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).gtag = function () { (window as any).dataLayer.push(arguments) }
      ;(window as any).gtag('js', new Date())
      ;(window as any).gtag('config', GA_ID)
      ;(window as any).gaLoaded = true
    }
  }

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined')
    setChoice('declined')
    setVisible(false)
    // Withdraw consent: disable GA tracking for the current session and future loads
    ;(window as any)[`ga-disable-${GA_ID}`] = true
  }

  if (!visible) return null

  const reopened = choice !== null

  return (
    <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-50 px-3 max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl shrink-0">🍪</span>
          <div className="text-xs text-gray-600 leading-relaxed">
            <p>
              {lang === 'kr'
                ? <>Nou servi cookies pou amelyor ou eksperyans. <Link href="/privacy" className="underline">An savoir plis</Link></>
                : <>We use cookies to improve your experience and analytics. <Link href="/privacy" className="underline hover:text-black">Learn more</Link></>
              }
            </p>
            {reopened && (
              <p className="mt-1 text-gray-400">
                {lang === 'kr'
                  ? <>Ou swa aktyel : <strong>{choice === 'accepted' ? 'Asepte' : 'Refiz'}</strong></>
                  : <>Your current choice: <strong>{choice === 'accepted' ? 'Accepted' : 'Declined'}</strong></>
                }
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={decline}
            className="flex-1 border border-gray-300 text-gray-600 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            {lang === 'kr' ? 'Refiz' : 'Decline'}
          </button>
          <button onClick={accept}
            className="flex-1 bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
            {lang === 'kr' ? 'Asepte' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  )
}
