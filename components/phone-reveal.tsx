'use client'

import { useState } from 'react'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'

interface Props {
  phone: string
  cleanPhone: string
  title: string
}

export default function PhoneReveal({ phone, cleanPhone, title }: Props) {
  const { lang } = useLang()
  const [revealed, setRevealed] = useState(false)

  if (!revealed) {
    return (
      <button
        onClick={() => setRevealed(true)}
        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-black transition-colors text-sm">
        📞 {t(lang, 'reveal_phone')}
      </button>
    )
  }

  const waText = encodeURIComponent(`Hi, I'm interested in your listing: ${title}`)

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl py-3 px-4">
        <p className="text-xl font-bold text-gray-900 tracking-wider">{phone}</p>
      </div>
      <div className="flex gap-2">
        <a
          href={`tel:${cleanPhone}`}
          className="flex-1 flex items-center justify-center gap-2 bg-black text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors text-sm">
          📞 {t(lang, 'call_btn')}
        </a>
        <a
          href={`https://wa.me/${cleanPhone}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-3 rounded-xl hover:bg-green-600 transition-colors text-sm">
          💬 WhatsApp
        </a>
      </div>
    </div>
  )
}
