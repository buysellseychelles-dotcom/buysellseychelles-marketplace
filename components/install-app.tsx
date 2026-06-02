'use client'

import { useEffect, useState } from 'react'

export default function InstallApp() {

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {

    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)

  }, [])

  const install = async () => {

    if (!deferredPrompt) return

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShow(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-black text-white p-3 rounded flex justify-between items-center">

      <p className="text-sm">
        Installer l’app 📲
      </p>

      <button
        onClick={install}
        className="bg-white text-black px-3 py-1 rounded"
      >
        Installer
      </button>

    </div>
  )
}