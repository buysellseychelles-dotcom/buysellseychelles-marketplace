'use client'

import { useLang } from '@/lib/lang-context'

export default function CookieSettingsButton() {
  const { lang } = useLang()

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))}
      className="text-xs text-gray-400 hover:text-white transition-colors">
      {lang === 'kr' ? 'Zere cookies' : 'Manage cookies'}
    </button>
  )
}
