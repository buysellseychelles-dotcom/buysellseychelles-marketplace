'use client'

import { useEffect, useState } from 'react'

// Détecte un réseau faible afin de servir des images basse résolution :
//  - mode "économie de données" activé par l'utilisateur (Save-Data), ou
//  - connexion lente (2G / 3G)
// via la Network Information API.
//
// SSR-safe : renvoie false côté serveur et au premier rendu (évite les
// erreurs d'hydratation), puis se met à jour côté client.

const SLOW_TYPES = ['slow-2g', '2g', '3g']

type Connection = {
  saveData?: boolean
  effectiveType?: string
  addEventListener?: (type: string, cb: () => void) => void
  removeEventListener?: (type: string, cb: () => void) => void
}

function getConnection(): Connection | undefined {
  if (typeof navigator === 'undefined') return undefined
  const nav = navigator as Navigator & {
    connection?: Connection
    mozConnection?: Connection
    webkitConnection?: Connection
  }
  return nav.connection || nav.mozConnection || nav.webkitConnection
}

function computeLowData(): boolean {
  const c = getConnection()
  if (!c) return false
  if (c.saveData) return true
  if (c.effectiveType && SLOW_TYPES.includes(c.effectiveType)) return true
  return false
}

export function useLowData(): boolean {
  const [lowData, setLowData] = useState(false)

  useEffect(() => {
    const update = () => setLowData(computeLowData())
    update()

    const c = getConnection()
    if (c?.addEventListener) {
      c.addEventListener('change', update)
      return () => c.removeEventListener?.('change', update)
    }
  }, [])

  return lowData
}
