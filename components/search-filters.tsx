'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'
import { t, CATEGORIES, ISLANDS_LIST } from '@/lib/i18n'
import { districtsFor } from '@/lib/districts'

const CATEGORY_FILTERS: Record<string, { param: string; label_key: string; options: ({ value: string; key: string } | string)[] }[]> = {
  voiture: [
    { param: 'fuel',      label_key: 'filter_fuel',      options: [{ value: 'Petrol', key: 'opt_petrol' }, { value: 'Diesel', key: 'opt_diesel' }, { value: 'Electric', key: 'opt_electric' }, { value: 'Hybrid', key: 'opt_hybrid' }] },
    { param: 'gearbox',   label_key: 'filter_gearbox',   options: [{ value: 'Manual', key: 'opt_manual' }, { value: 'Automatic', key: 'opt_automatic' }] },
    { param: 'condition', label_key: 'filter_condition',  options: [{ value: 'New', key: 'opt_new' }, { value: 'Like new', key: 'opt_like_new' }, { value: 'Good', key: 'opt_good' }, { value: 'Fair', key: 'opt_fair' }] },
  ],
  immobilier: [
    { param: 'prop_type', label_key: 'filter_type',     options: [{ value: 'House', key: 'opt_house' }, { value: 'Apartment', key: 'opt_apartment' }, { value: 'Villa', key: 'opt_villa' }, { value: 'Land', key: 'opt_land' }, { value: 'Commercial', key: 'opt_commercial' }] },
    { param: 'min_beds',  label_key: 'filter_bedrooms', options: ['1+', '2+', '3+', '4+'] },
    { param: 'tenure',    label_key: 'filter_tenure',   options: [{ value: 'Freehold', key: 'opt_freehold' }, { value: 'Leasehold', key: 'opt_leasehold' }] },
  ],
  bateau: [
    { param: 'boat_type', label_key: 'filter_boat_type', options: [{ value: 'Sailing', key: 'opt_sailing' }, { value: 'Motor', key: 'opt_motor' }, { value: 'Fishing', key: 'opt_fishing' }, { value: 'Speedboat', key: 'opt_speedboat' }, { value: 'Catamaran', key: 'opt_catamaran' }] },
    { param: 'condition', label_key: 'filter_condition',  options: [{ value: 'New', key: 'opt_new' }, { value: 'Like new', key: 'opt_like_new' }, { value: 'Good', key: 'opt_good' }, { value: 'Fair', key: 'opt_fair' }] },
  ],
  emploi: [
    { param: 'contract', label_key: 'filter_contract', options: [{ value: 'Full-time', key: 'opt_fulltime' }, { value: 'Part-time', key: 'opt_parttime' }, { value: 'Freelance', key: 'opt_freelance' }, { value: 'Internship', key: 'opt_internship' }] },
  ],
  electronique: [
    { param: 'condition', label_key: 'filter_condition', options: [{ value: 'New', key: 'opt_new' }, { value: 'Like new', key: 'opt_like_new' }, { value: 'Good', key: 'opt_good' }, { value: 'Fair', key: 'opt_fair' }] },
  ],
  mode: [
    { param: 'condition', label_key: 'filter_condition', options: [{ value: 'New', key: 'opt_new' }, { value: 'Like new', key: 'opt_like_new' }, { value: 'Good', key: 'opt_good' }] },
  ],
  maison: [
    { param: 'condition', label_key: 'filter_condition', options: [{ value: 'New', key: 'opt_new' }, { value: 'Like new', key: 'opt_like_new' }, { value: 'Good', key: 'opt_good' }, { value: 'Fair', key: 'opt_fair' }] },
  ],
}

const SORT_OPTIONS_KEYS = [
  { value: 'recent',     key: 'sort_recent' as const },
  { value: 'price_asc',  key: 'sort_price_asc' as const },
  { value: 'price_desc', key: 'sort_price_desc' as const },
  { value: 'popular',    key: 'sort_popular' as const },
]

export function SearchFilters({ compact }: { compact?: boolean } = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const { lang } = useLang()

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [showPanel, setShowPanel] = useState(false)
  const [showSaveAlert, setShowSaveAlert] = useState(false)
  const [alertLabel, setAlertLabel] = useState('')
  const [savingAlert, setSavingAlert] = useState(false)
  const [alertSaved, setAlertSaved] = useState(false)

  const currentCategory = searchParams.get('category') ?? ''
  const currentIsland   = searchParams.get('island') ?? ''
  const currentQuartier = searchParams.get('quartier') ?? ''
  const currentSort     = searchParams.get('sort') ?? 'recent'
  const currentMinPrice = searchParams.get('min') ?? ''
  const currentMaxPrice = searchParams.get('max') ?? ''

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, val]) => {
      if (val) params.set(key, val)
      else params.delete(key)
    })
    params.delete('page')
    startTransition(() => router.push(`/?${params.toString()}`))
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams({ q: search })
  }

  const catFilters = ['fuel', 'gearbox', 'condition', 'prop_type', 'min_beds', 'tenure', 'boat_type', 'contract']
    .map(p => searchParams.get(p) ?? '').filter(Boolean)

  const activeFiltersCount = [currentIsland, currentQuartier, currentMinPrice, currentMaxPrice, ...catFilters].filter(Boolean).length

  const hasSearch = !!(search.trim() || currentCategory || currentIsland || currentMinPrice || currentMaxPrice)

  async function saveAlert() {
    if (!alertLabel.trim()) return
    setSavingAlert(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        label: alertLabel.trim(),
        keywords: search.trim() || null,
        category: currentCategory || null,
        island: currentIsland || null,
        max_price: currentMaxPrice ? Number(currentMaxPrice) : null,
      }),
    })
    setSavingAlert(false)
    setAlertLabel('')
    setShowSaveAlert(false)
    setAlertSaved(true)
    setTimeout(() => setAlertSaved(false), 3000)
  }

  const categories = CATEGORIES[lang]
  const islands = ISLANDS_LIST[lang]
  const catSpecificFilters = currentCategory ? (CATEGORY_FILTERS[currentCategory] ?? []) : []

  return (
    <>
      <div className="bg-white border-b sticky top-14 lg:top-16 z-40 shadow-sm">

        {/* ── Mobile : champ de recherche + bouton filtres ── */}
        <div className="lg:hidden max-w-2xl mx-auto px-3 py-2.5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder={t(lang, 'search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-gray-50"
              style={{ '--tw-ring-color': '#003F87' } as any}
            />
            <button
              type="submit"
              disabled={isPending}
              className="text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
              style={{ backgroundColor: '#003F87' }}
            >
              {isPending ? '...' : '🔍'}
            </button>
            <button
              type="button"
              onClick={() => setShowPanel(true)}
              className={`flex items-center gap-1.5 border px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeFiltersCount > 0 ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black text-gray-700'}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="9" cy="6" r="2.5" fill="currentColor" stroke="none" />
                <circle cx="15" cy="12" r="2.5" fill="currentColor" stroke="none" />
                <circle cx="9" cy="18" r="2.5" fill="currentColor" stroke="none" />
              </svg>
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            {hasSearch && !showSaveAlert && !alertSaved && (
              <button
                type="button"
                onClick={() => { setShowSaveAlert(true); setAlertLabel(search.trim() || '') }}
                className="border border-gray-300 px-3 py-2.5 rounded-xl text-sm hover:border-black transition-colors"
                title={t(lang, 'save_search')}
              >🔔</button>
            )}
          </form>
        </div>

        {/* ── Desktop : barre filtres (recherche dans le header) ── */}
        <div className="hidden lg:flex items-center justify-between max-w-7xl mx-auto px-6 py-2 gap-4">
          <div className="flex items-center gap-2 flex-wrap">

            {/* Bouton filtres */}
            <button
              type="button"
              onClick={() => setShowPanel(true)}
              className={`flex items-center gap-1.5 border px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors ${activeFiltersCount > 0 ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black text-gray-700'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="9" cy="6" r="2.5" fill="currentColor" stroke="none" />
                <circle cx="15" cy="12" r="2.5" fill="currentColor" stroke="none" />
                <circle cx="9" cy="18" r="2.5" fill="currentColor" stroke="none" />
              </svg>
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold ml-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Chips filtres actifs */}
            {currentIsland && (
              <button
                onClick={() => updateParams({ island: '', quartier: '' })}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                📍 {currentIsland}{currentQuartier ? ` · ${currentQuartier}` : ''}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            {(currentMinPrice || currentMaxPrice) && (
              <button
                onClick={() => updateParams({ min: '', max: '' })}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                {currentMinPrice ? `≥${Number(currentMinPrice).toLocaleString()}` : ''}{currentMinPrice && currentMaxPrice ? '–' : ''}{currentMaxPrice ? `≤${Number(currentMaxPrice).toLocaleString()}` : ''} SCR
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}

            {/* Sauvegarder l'alerte */}
            {hasSearch && !alertSaved && !showSaveAlert && (
              <button
                type="button"
                onClick={() => { setShowSaveAlert(true); setAlertLabel(search.trim() || '') }}
                className="flex items-center gap-1.5 border border-gray-300 px-3 py-1.5 rounded-xl text-xs text-gray-600 hover:border-black transition-colors"
              >
                🔔 {t(lang, 'save_search')}
              </button>
            )}
          </div>

          {/* Tri rapide — côté droit */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-gray-400 mr-0.5">{t(lang, 'filter_sort')}:</span>
            {SORT_OPTIONS_KEYS.map(s => (
              <button
                key={s.value}
                onClick={() => updateParams({ sort: s.value })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${currentSort === s.value ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
              >
                {t(lang, s.key)}
              </button>
            ))}
          </div>
        </div>

        {/* Panneaux alerte — visibles sur tous les écrans */}
        {alertSaved && (
          <div className="max-w-2xl lg:max-w-7xl mx-auto px-3 pb-2">
            <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-2 rounded-xl text-center">
              {t(lang, 'alert_created')}
            </div>
          </div>
        )}
        {showSaveAlert && (
          <div className="max-w-2xl lg:max-w-7xl mx-auto px-3 pb-2">
            <div className="bg-white border border-gray-200 rounded-xl p-3 flex gap-2 items-center">
              <input
                value={alertLabel}
                onChange={e => setAlertLabel(e.target.value)}
                placeholder={t(lang, 'alert_name_placeholder')}
                onKeyDown={e => e.key === 'Enter' && saveAlert()}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                autoFocus
              />
              <button onClick={() => setShowSaveAlert(false)} className="text-gray-400 text-sm px-1">✕</button>
              <button onClick={saveAlert} disabled={savingAlert || !alertLabel.trim()}
                className="bg-black text-white text-xs font-medium px-3 py-2 rounded-lg disabled:opacity-40 whitespace-nowrap">
                {savingAlert ? '...' : 'OK'}
              </button>
            </div>
          </div>
        )}

        {/* Chips catégories — mode non-compact (mobile uniquement sur desktop, car CategoryNav le gère) */}
        {!compact && (
          <div className="flex gap-2 px-3 pb-2 overflow-x-auto scrollbar-hide max-w-2xl lg:max-w-7xl mx-auto lg:hidden">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => updateParams({ category: cat.value, fuel: '', gearbox: '', condition: '', prop_type: '', min_beds: '', tenure: '', boat_type: '', contract: '' })}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                  currentCategory === cat.value ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Panel filtres — overlay + bottom sheet */}
      {showPanel && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-50 transition-opacity"
            onClick={() => setShowPanel(false)}
          />

          {/* Mobile: bottom sheet — Desktop: modal centré */}
          <div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:right-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-[560px] md:max-w-[90vw] z-50 bg-white rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[85vh] md:max-h-[80vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-base">Filters</h2>
              <button onClick={() => setShowPanel(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">✕</button>
            </div>

            <div className="px-4 py-4 space-y-5 pb-8">

              {/* Sort */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t(lang, 'filter_sort')}</p>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS_KEYS.map(s => (
                    <button
                      key={s.value}
                      onClick={() => updateParams({ sort: s.value })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${currentSort === s.value ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}
                    >
                      {t(lang, s.key)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Island */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t(lang, 'filter_island')}</p>
                <div className="flex flex-wrap gap-2">
                  {islands.map(i => (
                    <button
                      key={i.value}
                      onClick={() => updateParams({ island: i.value, quartier: '' })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${currentIsland === i.value ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Districts */}
              {districtsFor(currentIsland).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t(lang, 'filter_district')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {districtsFor(currentIsland).map(q => (
                      <button
                        key={q}
                        onClick={() => updateParams({ quartier: currentQuartier === q ? '' : q })}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${currentQuartier === q ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price range */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price (SCR)</p>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder={t(lang, 'filter_min_price')}
                    defaultValue={currentMinPrice}
                    onBlur={(e) => updateParams({ min: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="number"
                    placeholder={t(lang, 'filter_max_price')}
                    defaultValue={currentMaxPrice}
                    onBlur={(e) => updateParams({ max: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Category-specific filters */}
              {catSpecificFilters.map(group => {
                const current = searchParams.get(group.param) ?? ''
                return (
                  <div key={group.param}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t(lang, group.label_key as any)}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map(opt => {
                        const val   = typeof opt === 'string' ? opt : opt.value
                        const label = typeof opt === 'string' ? opt : t(lang, opt.key as any)
                        return (
                          <button
                            key={val}
                            onClick={() => updateParams({ [group.param]: current === val ? '' : val })}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${current === val ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Clear + Apply */}
              <div className="flex gap-3 pt-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => {
                      setSearch('')
                      startTransition(() => router.push('/'))
                      setShowPanel(false)
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-xl text-sm hover:border-black transition-colors"
                  >
                    {t(lang, 'clear_filters')}
                  </button>
                )}
                <button
                  onClick={() => setShowPanel(false)}
                  className="flex-1 text-white font-semibold py-3 rounded-xl text-sm"
                  style={{ backgroundColor: '#003F87' }}
                >
                  Show results
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
