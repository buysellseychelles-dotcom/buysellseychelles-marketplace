'use client'

import { useEffect } from 'react'

export default function PushInit() {

  useEffect(() => {

    const init = async () => {

      if (typeof window === 'undefined') return

      const OneSignal = (await import('react-onesignal')).default

      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        allowLocalhostAsSecureOrigin: true,
      })

    }

    init()

  }, [])

  return null
}