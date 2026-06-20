'use client'

import { useEffect, useState } from 'react'

type Stats = { rate: number; avgHours: number | null } | null

export default function SellerResponseBadge({ sellerId }: { sellerId: string }) {
  const [stats, setStats] = useState<Stats>(undefined as any)

  useEffect(() => {
    fetch(`/api/seller/response-stats?sellerId=${sellerId}`)
      .then(r => r.json())
      .then(d => setStats(d.stats))
      .catch(() => setStats(null))
  }, [sellerId])

  if (!stats) return null

  const color = stats.rate >= 80 ? 'text-green-600' : stats.rate >= 50 ? 'text-yellow-600' : 'text-gray-500'
  const dot = stats.rate >= 80 ? '🟢' : stats.rate >= 50 ? '🟡' : '🔴'

  return (
    <div className={`flex items-center gap-1.5 text-xs ${color} bg-gray-50 rounded-xl px-3 py-2`}>
      <span>{dot}</span>
      <span className="font-medium">Replies to {stats.rate}% of messages</span>
      {stats.avgHours !== null && (
        <span className="text-gray-400">
          · usually in {stats.avgHours < 1 ? '< 1h' : stats.avgHours < 24 ? `~${Math.round(stats.avgHours)}h` : `~${Math.round(stats.avgHours / 24)}d`}
        </span>
      )}
    </div>
  )
}
