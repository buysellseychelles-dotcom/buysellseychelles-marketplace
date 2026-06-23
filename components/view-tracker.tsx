'use client'

import { useEffect } from 'react'

// Déclenche le comptage d'une vue côté client.
// IMPORTANT : utiliser un composant client (useEffect) et NON un <script>
// inline dans le Server Component — un script inline ne s'exécute que lors
// d'un chargement complet de page, jamais lors de la navigation client-side
// de Next.js (le cas normal quand on clique une annonce depuis l'accueil).
//
// On appelle /api/track/view qui : dé-doublonne par IP (1 vue / IP / 24h),
// enregistre la ligne dans listing_views (utile au classement) puis
// incrémente listings.views_count via la RPC increment_views.
export default function ViewTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    if (!listingId) return
    fetch('/api/track/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId }),
      keepalive: true,
    }).catch(() => {})
  }, [listingId])

  return null
}