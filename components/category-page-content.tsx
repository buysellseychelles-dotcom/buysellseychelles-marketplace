'use client'

import Link from 'next/link'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'
import type { Subcat } from '@/lib/subcategories'

type Meta = { label_en: string; label_kr: string; textColor: string; bg: string; border?: string }
type Sub  = Subcat

export default function CategoryPageContent({
  meta, subs, slug,
}: { meta: Meta; subs: Sub[]; slug: string }) {
  const { lang } = useLang()
  const label = lang === 'kr' ? meta.label_kr : meta.label_en
  const isDark = meta.textColor === '#fff' || meta.textColor === '#ffffff'

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Header coloré */}
      <div className="sticky top-0 z-40" style={{ backgroundColor: meta.bg }}>
        <div className="max-w-2xl mx-auto px-3 h-14 flex items-center gap-3"
          style={{ borderBottom: meta.border ? `1px solid ${meta.border}` : 'none' }}>
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke={meta.textColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="flex-1 text-center font-extrabold text-lg" style={{ color: meta.textColor }}>
            {label}
          </h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">

        <p className="text-sm text-gray-500 mb-4">
          {t(lang, 'cat_what_looking')} {label} ?
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {subs.map((sub, i) => (
            <Link key={i} href={`/?category=${sub.value}`}
              className="flex flex-col items-center gap-2.5 py-5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm active:scale-95 transition-all">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  backgroundColor: `${meta.bg}15`,
                  border: meta.border ? `1.5px solid ${meta.border}` : 'none',
                }}>
                {sub.emoji}
              </div>
              <span className="text-[12px] font-bold text-gray-700 text-center leading-tight px-1">
                {/* Les sous-catégories restent TOUJOURS en anglais, quelle que soit la langue. */}
                {sub.label_en}
              </span>
            </Link>
          ))}
        </div>

        <Link href={`/?category=${slug}`}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-sm"
          style={{ backgroundColor: meta.bg, color: meta.textColor }}>
          <span>{t(lang, 'cat_see_all')} {label} →</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={meta.textColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

      </div>
    </div>
  )
}
