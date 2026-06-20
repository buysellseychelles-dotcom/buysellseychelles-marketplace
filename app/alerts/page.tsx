'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLang } from '@/lib/lang-context'
import { t, CATEGORIES, ISLANDS_LIST } from '@/lib/i18n'

type Alert = {
  id: string
  label: string
  keywords: string | null
  category: string | null
  island: string | null
  max_price: number | null
  created_at: string
}

export default function AlertsPage() {
  return (
    <Suspense>
      <AlertsContent />
    </Suspense>
  )
}

function AlertsContent() {
  const { lang } = useLang()
  const searchParams = useSearchParams()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [keywords, setKeywords] = useState('')
  const [category, setCategory] = useState('')
  const [island, setIsland] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Pré-remplir depuis l'URL (?keywords=...&category=...&island=...)
  useEffect(() => {
    const kw = searchParams.get('keywords')
    const cat = searchParams.get('category')
    const isl = searchParams.get('island')
    const max = searchParams.get('max_price')
    if (kw || cat || isl || max) {
      if (kw) setKeywords(kw)
      if (cat) setCategory(cat)
      if (isl) setIsland(isl)
      if (max) setMaxPrice(max)
      if (kw) setLabel(kw)
      else if (cat) setLabel(cat)
      setShowForm(true)
    }
  }, [searchParams])

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    const { data } = await supabase.from('search_alerts').select('*').order('created_at', { ascending: false })
    setAlerts(data ?? [])
    setLoading(false)
  }

  async function createAlert() {
    if (!label.trim()) { setError(t(lang, 'alert_label_required')); return }
    setSaving(true)
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        label: label.trim(),
        keywords: keywords.trim() || null,
        category: category || null,
        island: island || null,
        max_price: maxPrice ? Number(maxPrice) : null,
      }),
    })
    if (res.ok) {
      setLabel(''); setKeywords(''); setCategory(''); setIsland(''); setMaxPrice('')
      setShowForm(false)
      load()
    } else {
      const d = await res.json()
      setError(d.error || 'Error')
    }
    setSaving(false)
  }

  async function deleteAlert(id: string) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch('/api/alerts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ id }),
    })
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const categoryOptions = CATEGORIES[lang]
  const islandOptions = ISLANDS_LIST[lang]

  return (
    <div className="max-w-lg mx-auto px-4 pb-4">
      <div className="pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl">{t(lang, 'alerts_title')}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{t(lang, 'alerts_subtitle')}</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="bg-black text-white text-sm font-medium px-4 py-2 rounded-full">
          {t(lang, 'new_alert_btn')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
          <h2 className="font-semibold text-sm mb-4">{t(lang, 'create_alert_title')}</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t(lang, 'alert_label_field')}</label>
              <input value={label} onChange={e => setLabel(e.target.value)}
                placeholder={t(lang, 'alert_label_placeholder')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t(lang, 'keywords_label')}</label>
              <input value={keywords} onChange={e => setKeywords(e.target.value)}
                placeholder={t(lang, 'keywords_placeholder')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t(lang, 'category_filter')}</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                  {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t(lang, 'island_filter')}</label>
                <select value={island} onChange={e => setIsland(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                  {islandOptions.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{t(lang, 'max_price_label')}</label>
              <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                type="number" placeholder={t(lang, 'max_price_placeholder')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
          </div>
          {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">
              {t(lang, 'cancel')}
            </button>
            <button onClick={createAlert} disabled={saving}
              className="flex-1 bg-black text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-40">
              {saving ? t(lang, 'saving') : t(lang, 'create_btn')}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🔔</p>
          <p className="font-semibold text-gray-800 mb-1">{t(lang, 'no_alerts')}</p>
          <p className="text-sm text-gray-500 mb-4">{t(lang, 'no_alerts_desc')}</p>
          <button onClick={() => setShowForm(true)}
            className="bg-black text-white text-sm font-medium px-5 py-2.5 rounded-full">
            {t(lang, 'create_alert_title')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800">🔔 {alert.label}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {alert.keywords && (
                      <span className="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-full">"{alert.keywords}"</span>
                    )}
                    {alert.category && (
                      <span className="bg-blue-50 text-blue-700 text-[11px] px-2 py-0.5 rounded-full">
                        {categoryOptions.find(c => c.value === alert.category)?.label ?? alert.category}
                      </span>
                    )}
                    {alert.island && (
                      <span className="bg-green-50 text-green-700 text-[11px] px-2 py-0.5 rounded-full">📍 {alert.island}</span>
                    )}
                    {alert.max_price && (
                      <span className="bg-orange-50 text-orange-700 text-[11px] px-2 py-0.5 rounded-full">
                        Max {Number(alert.max_price).toLocaleString()} SCR
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    {t(lang, 'created_on')} {new Date(alert.created_at).toLocaleDateString('en', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <button onClick={() => deleteAlert(alert.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center mt-6 text-xs text-gray-400">
        {t(lang, 'save_from_search')}{' '}
        <Link href="/" className="text-black underline">{t(lang, 'home_page')}</Link>.
      </p>
    </div>
  )
}
