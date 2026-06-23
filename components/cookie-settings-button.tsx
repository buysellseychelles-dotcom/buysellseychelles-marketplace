'use client'

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))}
      className="text-xs text-gray-400 hover:text-white transition-colors">
      Manage cookies
    </button>
  )
}
