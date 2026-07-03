'use client'

import { useEffect, useState } from 'react'

export default function InAppBrowserBanner() {
  const [visible, setVisible] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent || ''
    const isInApp = /FBAN|FBAV|Instagram/.test(ua)
    if (!isInApp || sessionStorage.getItem('inapp_banner_dismissed')) return
    setIsAndroid(/Android/.test(ua))
    setIsIOS(/iPhone|iPad|iPod/.test(ua))
    setVisible(true)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem('inapp_banner_dismissed', '1')
    setVisible(false)
  }

  const openInChrome = () => {
    // Le navigateur intégré Facebook/Instagram n'expose ni window.open ni
    // les liens standards : seul un intent Android permet de forcer Chrome.
    const withoutScheme = window.location.href.replace(/^https?:\/\//, '')
    window.location.href = `intent://${withoutScheme}#Intent;scheme=https;package=com.android.chrome;end`
  }

  if (!visible) return null

  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 flex items-center gap-3">
      <span className="flex-1 leading-snug">
        For the best experience, open this page in your browser.
        {isIOS && (
          <span className="block text-gray-300 mt-0.5">
            Tap ··· at the bottom and select "Open in Safari".
          </span>
        )}
      </span>
      {isAndroid && (
        <button
          onClick={openInChrome}
          className="shrink-0 bg-white text-gray-900 font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap"
        >
          Open in Browser
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Close"
        className="shrink-0 text-gray-300 hover:text-white text-base leading-none px-1"
      >
        ✕
      </button>
    </div>
  )
}