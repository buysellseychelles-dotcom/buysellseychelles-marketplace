import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null | undefined, currency?: string | null): string {
  if (!price) return 'Price negotiable'
  const cur = currency || 'SCR'
  if (cur === 'EUR') return `€${Number(price).toLocaleString('fr-FR')}`
  return `${Number(price).toLocaleString()} SCR`
}

export function timeAgo(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60)
    return `${m} min ago`
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600)
    return `${h}h ago`
  }
  if (seconds < 86400 * 7) {
    const d = Math.floor(seconds / 86400)
    return `${d} day${d > 1 ? 's' : ''} ago`
  }
  if (seconds < 86400 * 30) {
    const w = Math.floor(seconds / (86400 * 7))
    return `${w} week${w > 1 ? 's' : ''} ago`
  }
  if (seconds < 86400 * 365) {
    const mo = Math.floor(seconds / (86400 * 30))
    return `${mo} month${mo > 1 ? 's' : ''} ago`
  }
  const y = Math.floor(seconds / (86400 * 365))
  return `${y} year${y > 1 ? 's' : ''} ago`
}
