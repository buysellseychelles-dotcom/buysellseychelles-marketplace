'use client'

import { useEffect, useState } from 'react'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'

const KEY = 'bss_prices'

export default function PriceDropBadge({ listingId, currentPrice }: { listingId: string; currentPrice: number | null }) {
  const { lang } = useLang()
  const [dropped, setDropped] = useState(false)

  useEffect(() => {
    if (!currentPrice) return
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) ?? '{}')
      const prev = stored[listingId]
      if (typeof prev === 'number' && prev > currentPrice) {
        setDropped(true)
      }
      localStorage.setItem(KEY, JSON.stringify({ ...stored, [listingId]: currentPrice }))
    } catch {}
  }, [listingId, currentPrice])

  if (!dropped) return null

  return (
    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
      {t(lang, 'price_drop')}
    </span>
  )
}
