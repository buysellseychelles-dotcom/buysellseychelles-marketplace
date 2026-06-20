'use client'

import { timeAgo } from '@/lib/utils'

export default function TimeAgo({ date }: { date: string }) {
  return <span>{timeAgo(date)}</span>
}
