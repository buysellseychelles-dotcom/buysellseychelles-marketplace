'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'

export default function HeroBanner() {
  const [show, setShow] = useState(false)
  const { lang } = useLang()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setShow(!data.user)
    })
  }, [])

  if (!show) return null

  return (
    <div className="bg-black text-white px-4 py-8 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs font-medium mb-4">
          {t(lang, 'hero_badge')}
        </div>
        <h1 className="text-2xl font-bold leading-tight mb-2">
          {lang === 'kr' ? 'Aste e vann Sesel' : 'Buy and sell\nin the Seychelles'}
        </h1>
        <p className="text-gray-400 text-sm mb-6 whitespace-pre-line">
          {t(lang, 'hero_desc')}
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/post-ad"
            className="bg-white text-black font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-gray-100 transition-colors"
          >
            {t(lang, 'hero_post')}
          </Link>
          <Link
            href="/login"
            className="border border-white/30 text-white font-medium px-5 py-2.5 rounded-full text-sm hover:bg-white/10 transition-colors"
          >
            {t(lang, 'hero_login')}
          </Link>
        </div>
        <div className="flex justify-center gap-6 mt-6 text-xs text-gray-500">
          <span>{t(lang, 'hero_free')}</span>
          <span>{t(lang, 'hero_simple')}</span>
          <span>{t(lang, 'hero_local')}</span>
        </div>
      </div>
    </div>
  )
}
