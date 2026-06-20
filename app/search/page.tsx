'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'
import { CATEGORY_META } from '@/lib/subcategories'

const HISTORY_KEY = 'bss_search_history'
const MAX_HISTORY = 10

export default function SearchPage() {
  const router = useRouter()
  const { lang } = useLang()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery]       = useState('')
  const [history, setHistory]   = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY)
    if (stored) setHistory(JSON.parse(stored))
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const saveAndGo = (q: string) => {
    if (!q.trim()) return
    const next = [q.trim(), ...history.filter(h => h !== q.trim())].slice(0, MAX_HISTORY)
    setHistory(next)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
    router.push(`/?q=${encodeURIComponent(q.trim())}`)
  }

  const removeHistory = (item: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = history.filter(h => h !== item)
    setHistory(next)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  }

  const clearAll = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  const categories = Object.entries(CATEGORY_META)

  return (
    <div className="min-h-screen bg-white pb-4">

      {/* Header avec back + barre recherche */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-3 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <form className="flex-1 flex items-center gap-2" onSubmit={e => { e.preventDefault(); saveAndGo(query) }}>
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-4 h-11">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="22" y2="22" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t(lang, 'search_home')}
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          {query && (
            <button type="submit" className="text-sm font-bold px-3 py-2 rounded-xl text-white shrink-0" style={{ backgroundColor: '#003F87' }}>
              {t(lang, 'search_btn')}
            </button>
          )}
        </form>
      </div>

      <div className="max-w-2xl mx-auto px-4">

        {/* Historique des recherches */}
        {history.length > 0 && !query && (
          <section className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-800">
                {t(lang, 'search_recent')}
              </p>
              <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500">
                {t(lang, 'search_clear_all')}
              </button>
            </div>
            <div className="space-y-1">
              {history.map(item => (
                <button key={item} onClick={() => saveAndGo(item)}
                  className="w-full flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors group">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.5" y1="16.5" x2="22" y2="22" />
                  </svg>
                  <span className="flex-1 text-sm text-gray-700 text-left">{item}</span>
                  <button onClick={e => removeHistory(item, e)}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-600 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Suggestions de recherche live */}
        {query.length >= 2 && (
          <section className="mt-4">
            <button onClick={() => saveAndGo(query)}
              className="w-full flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-gray-50 border border-gray-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#003F87" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
              <span className="flex-1 text-sm text-left">
                {t(lang, 'search_for')} &ldquo;<span className="font-bold text-gray-900">{query}</span>&rdquo;
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </section>
        )}

        {/* Séparateur + Browse by category */}
        {!query && (
          <>
            <div className="flex items-center gap-3 mt-6 mb-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {t(lang, 'browse_categories')}
              </span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {categories.map(([slug, meta]) => (
                <Link key={slug} href={`/category/${slug}`}
                  className="flex flex-col items-center gap-2.5 py-5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm active:scale-95 transition-all bg-white">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{
                      backgroundColor: `${meta.bg}15`,
                      border: meta.border ? `1.5px solid ${meta.border}` : 'none',
                    }}>
                    {slug === 'voiture' ? '🚗' : slug === 'immobilier' ? '🏠' : slug === 'electronique' ? '📱' :
                     slug === 'bateau' ? '⛵' : slug === 'emploi' ? '💼' : slug === 'services' ? '🔧' :
                     slug === 'tourisme' ? '🌴' : slug === 'mode' ? '👗' : slug === 'maison' ? '🛋️' :
                     slug === 'loisirs' ? '⚽' : slug === 'animaux' ? '🐾' : slug === 'dons' ? '🎁' :
                     slug === 'pro' ? '🏭' : '📦'}
                  </div>
                  <span className="text-[12px] font-bold text-gray-700 text-center leading-tight px-1">
                    {lang === 'kr' ? meta.label_kr : meta.label_en}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
