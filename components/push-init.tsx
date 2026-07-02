'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function PushInit() {
  useEffect(() => {
    const init = async () => {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        // Déjà refusé → ne pas redemander
        if (Notification.permission === 'denied') return

        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const reg = await navigator.serviceWorker.ready

        let sub = await reg.pushManager.getSubscription()
        if (!sub) {
          try {
            sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
              ),
            })
          } catch {
            // Push non supporté ou refusé par le service du navigateur (ex: AbortError sur
            // Android Chrome quand le push service est indisponible) → abandon silencieux
            return
          }
        }

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ subscription: sub.toJSON() }),
        })
      } catch {
        // Ne jamais laisser une erreur d'enregistrement push remonter à Sentry
      }
    }

    init()
  }, [])

  return null
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}
