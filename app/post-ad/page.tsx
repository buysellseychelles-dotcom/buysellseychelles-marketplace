'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'
import { CATEGORY_TREE, getCatLabel, getTopCatForValue } from '@/lib/category-tree'
import { districtsFor } from '@/lib/districts'
import CategoryFields, { type ExtraFields } from '@/components/category-fields'
import { compressImages } from '@/lib/compress-image'
import { fileTooLarge, fileExceedsRaw } from '@/lib/upload-limits'

const ISLANDS = ['Mahé', 'Praslin', 'La Digue', 'Silhouette', 'Other islands']

export default function PostAdPage() {
  const router = useRouter()
  const { lang } = useLang()
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Compte propriétaire du brouillon courant. `undefined` = pas encore résolu.
  const userIdRef = useRef<string | null | undefined>(undefined)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [island, setIsland] = useState('')
  const [quartier, setQuartier] = useState('')
  const [category, setCategory] = useState('')
  const [topCatId, setTopCatId] = useState<string | null>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [extra, setExtra] = useState<ExtraFields>({})
  const [phone, setPhone] = useState('')
  const [phoneHidden, setPhoneHidden] = useState(false)
  const [currency, setCurrency] = useState<'SCR' | 'EUR'>('SCR')
  const [urgent, setUrgent] = useState(false)
  const [priceNegotiable, setPriceNegotiable] = useState(false)
  const [delivery, setDelivery] = useState(false)
  const [priceSuggestion, setPriceSuggestion] = useState<number | null>(null)
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)
  // Catégories sans prix : Jobs (emploi/emploi_demande) et Free & Exchange (dons/troc)
  const hidePrice = ['emploi', 'emploi_demande', 'dons', 'troc'].includes(category)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)
  const [qualityScore, setQualityScore] = useState<number | null>(null)
  const [qualityTips, setQualityTips] = useState<string[]>([])
  const [qualityLoading, setQualityLoading] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [hasPhotoPack, setHasPhotoPack] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [limitReached, setLimitReached] = useState(false)

  const DRAFT_KEY = 'bss_post_draft'
  // Free accounts can publish up to 3 listings per day. PRO accounts are unlimited.
  const FREE_DAILY_LIMIT = 3
  // PRO subscribers and one-time photo-pack buyers both get the extended limit.
  const PHOTO_LIMIT = hasPhotoPack || isPro ? 10 : 3

  // Check photo pack purchase + PRO status on mount
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      try {
        const { data } = await supabase
          .from('user_purchases')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_type', 'photo_pack')
          .gte('expires_at', new Date().toISOString())
          .limit(1)
        setHasPhotoPack((data?.length ?? 0) > 0)
      } catch { /* table may not exist yet */ }
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_pro')
          .eq('id', user.id)
          .maybeSingle()
        setIsPro(!!profile?.is_pro)
      } catch { /* ignore */ }
    })
  }, [])

  // Vide complètement le formulaire (champs + photos + brouillon mémorisé).
  const resetForm = () => {
    setTitle(''); setDescription(''); setPrice(''); setIsland(''); setQuartier('')
    setCategory(''); setTopCatId(null); setPhone(''); setPhoneHidden(false)
    setCurrency('SCR'); setUrgent(false); setPriceNegotiable(false); setDelivery(false)
    setExtra({}); setFiles([]); setPreviews([]); setDraftSavedAt(null)
    setErrors([]); setPriceSuggestion(null); setQualityScore(null); setQualityTips([])
  }

  // Le brouillon est lié au compte qui l'a créé. On suit l'état d'auth :
  //  - première émission (INITIAL_SESSION) → on restaure le brouillon s'il
  //    appartient bien à l'utilisateur courant ;
  //  - changement de compte ou déconnexion → on jette tout brouillon non publié
  //    pour repartir d'un formulaire vierge.
  useEffect(() => {
    const restore = (userId: string | null) => {
      try {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (!saved) return
        const d = JSON.parse(saved)
        // Brouillon d'un autre compte (ou anonyme) → on l'efface.
        if ((d.userId ?? null) !== userId) { localStorage.removeItem(DRAFT_KEY); return }
        if (d.title) setTitle(d.title)
        if (d.description) setDescription(d.description)
        if (d.price) setPrice(d.price)
        if (d.island) setIsland(d.island)
        if (d.quartier) setQuartier(d.quartier)
        if (d.category) setCategory(d.category)
        if (d.phone) setPhone(d.phone)
        if (d.phoneHidden !== undefined) setPhoneHidden(d.phoneHidden)
        if (d.currency) setCurrency(d.currency)
        if (d.urgent !== undefined) setUrgent(d.urgent)
        if (d.priceNegotiable !== undefined) setPriceNegotiable(d.priceNegotiable)
        if (d.delivery !== undefined) setDelivery(d.delivery)
        if (d.extra) setExtra(d.extra)
        if (d.savedAt) setDraftSavedAt(d.savedAt)
      } catch {}
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUserId = session?.user?.id ?? null
      const prev = userIdRef.current
      userIdRef.current = newUserId
      if (prev === undefined) {
        restore(newUserId)
      } else if (prev !== newUserId) {
        localStorage.removeItem(DRAFT_KEY)
        resetForm()
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Auto-save draft with 1.5s debounce
  useEffect(() => {
    if (!title && !description && !category) return
    const timer = setTimeout(() => {
      const savedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        userId: userIdRef.current ?? null,
        title, description, price, island, quartier, category, phone, phoneHidden,
        currency, urgent, priceNegotiable, delivery, extra, savedAt,
      }))
      setDraftSavedAt(savedAt)
    }, 1500)
    return () => clearTimeout(timer)
  }, [title, description, price, island, quartier, category, phone, phoneHidden, currency, urgent, priceNegotiable, delivery, extra])

  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const remaining = PHOTO_LIMIT - files.length
    if (remaining <= 0) { e.target.value = ''; return }
    const selected = Array.from(e.target.files ?? []).slice(0, remaining)
    e.target.value = ''
    if (selected.length === 0) return
    // Garde-fou sur l'original (évite de décoder une image démesurée sur mobile)
    const raw = selected.find(f => fileExceedsRaw(f, lang))
    if (raw) { setErrors([fileExceedsRaw(raw, lang)!]); return }
    // Compression, puis contrôle de la limite 5 MB sur le fichier réellement uploadé
    const compressed = await compressImages(selected)
    const tooBig = compressed.find(f => fileTooLarge(f, lang))
    if (tooBig) { setErrors([fileTooLarge(tooBig, lang)!]); return }
    setErrors([])
    setPreviews(prev => [...prev, ...compressed.map(f => URL.createObjectURL(f))])
    setFiles(prev => [...prev, ...compressed])
  }

  const removeImage = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    const errs: string[] = []
    if (!title.trim()) errs.push(t(lang, 'err_title'))
    if (!category) errs.push(t(lang, 'err_category'))
    if (!island) errs.push(t(lang, 'err_island'))
    if (files.length === 0) errs.push(lang === 'kr' ? 'Ou bezwen omwen 1 portre' : 'At least 1 photo is required')
    if (!description.trim()) errs.push(lang === 'kr' ? 'Description obligatwar' : 'Description is required')
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    setLimitReached(false)
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Daily free-listing limit — PRO accounts are exempt (unlimited).
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.is_pro) {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      const { count } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString())
      if ((count ?? 0) >= FREE_DAILY_LIMIT) {
        setLimitReached(true)
        setLoading(false)
        return
      }
    }

    const { data: listing, error: insertError } = await supabase
      .from('listings')
      .insert({
        title: title.trim(),
        description: description.trim(),
        price: hidePrice ? null : (priceNegotiable ? null : (price ? Number(price) : null)),
        price_negotiable: hidePrice ? false : priceNegotiable,
        urgent,
        delivery,
        location: quartier ? `${quartier}, ${island}` : island,
        category,
        user_id: user.id,
        boosted: false,
        // L'annonce expire automatiquement après 60 jours (renouvelable).
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        phone: phone.trim() || null,
        phone_hidden: phoneHidden,
        currency,
        make: extra.make || null,
        model: extra.model || null,
        year: extra.year ? Number(extra.year) : null,
        mileage: extra.mileage ? Number(extra.mileage) : null,
        fuel_type: extra.fuel_type || null,
        gearbox: extra.gearbox || null,
        condition: extra.condition || null,
        property_type: extra.property_type || null,
        bedrooms: extra.bedrooms ? Number(extra.bedrooms) : null,
        bathrooms: extra.bathrooms ? Number(extra.bathrooms) : null,
        area_sqm: extra.area_sqm ? Number(extra.area_sqm) : null,
        furnished: extra.furnished ?? null,
        tenure: extra.tenure || null,
        contract_type: extra.contract_type || null,
        salary: extra.salary || null,
        boat_type: extra.boat_type || null,
      })
      .select()
      .single()

    if (insertError || !listing) {
      // The DB trigger raises this when the daily free limit is exceeded.
      if (insertError?.message?.includes('DAILY_LISTING_LIMIT')) {
        setLimitReached(true)
        setLoading(false)
        return
      }
      setErrors([insertError?.message ?? 'Error publishing listing.'])
      setLoading(false)
      return
    }

    for (const file of files) {
      const fileName = `${listing.id}-${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('listings').upload(fileName, file)
      if (!uploadError) {
        const { data } = supabase.storage.from('listings').getPublicUrl(fileName)
        await supabase.from('listing_images').insert({ listing_id: listing.id, image_url: data.publicUrl })
      }
    }

    fetch('/api/notify/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: listing.id }),
    }).catch(() => {})

    // Notifier les abonnés du vendeur
    fetch('/api/notify/new-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: listing.id }),
    }).catch(() => {})

    localStorage.removeItem(DRAFT_KEY)
    router.push('/dashboard')
  }

  return (
    <div className="max-w-xl mx-auto pb-4">

      <div className="bg-black text-white px-4 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{t(lang, 'post_ad_title')}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{t(lang, 'post_ad_subtitle')}</p>
          </div>
          {draftSavedAt && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[11px] text-gray-400">{t(lang, 'draft_saved')} {draftSavedAt}</p>
              <button
                onClick={() => { localStorage.removeItem(DRAFT_KEY); resetForm() }}
                className="text-[11px] text-red-400 hover:text-red-300 underline">
                {t(lang, 'draft_clear')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-5">


        {/* Photos */}
        <div>
          <label className="text-sm font-semibold text-gray-800 block mb-2">
            {t(lang, 'photos_label')} <span className="text-gray-400 font-normal">{t(lang, 'photos_max')}</span>
          </label>
          {previews.length > 1 && (
            <p className="text-[11px] text-gray-400 mb-2">☰ {lang === 'kr' ? 'Trasinn pou reodone' : 'Drag to reorder'}</p>
          )}
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={e => {
                  e.preventDefault()
                  if (dragIndex === null || dragIndex === i) return
                  const newPreviews = [...previews]
                  const newFiles = [...files]
                  newPreviews.splice(i, 0, newPreviews.splice(dragIndex, 1)[0])
                  newFiles.splice(i, 0, newFiles.splice(dragIndex, 1)[0])
                  setPreviews(newPreviews)
                  setFiles(newFiles)
                  setDragIndex(i)
                }}
                onDragEnd={() => setDragIndex(null)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing transition-opacity ${dragIndex === i ? 'opacity-50' : 'opacity-100'}`}>
                <Image src={src} alt="" fill className="object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] font-bold text-center py-0.5">
                    Main
                  </span>
                )}
                <button onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none">
                  ×
                </button>
              </div>
            ))}
            {previews.length < PHOTO_LIMIT && (
              <button onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 transition-colors">
                <span className="text-2xl leading-none">+</span>
                <span className="text-xs mt-1">Photo</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />

          {/* Photo pack upsell — only shown when free limit reached (PRO already has 10) */}
          {!hasPhotoPack && !isPro && previews.length >= 3 && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
              <span className="text-amber-500 text-base shrink-0">📸</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-800">
                  {lang === 'kr' ? 'Limit 3 portre' : 'Limit of 3 photos reached'}
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {lang === 'kr'
                    ? 'Ou kapab azout ziska 10 portre — 30 SCR en sel fwa.'
                    : 'Unlock up to 10 photos for this listing — 30 SCR one-time.'}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) { router.push('/login'); return }
                    const res = await fetch('/api/stripe/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ product: 'photo_pack', user_id: user.id, next: '/post-ad' }),
                    })
                    const { url } = await res.json()
                    if (url) window.location.href = url
                  }}
                  className="mt-1.5 text-xs font-semibold text-amber-900 underline underline-offset-2"
                >
                  {lang === 'kr' ? 'Deklouver 10 portre →' : 'Unlock 10 photos — 30 SCR →'}
                </button>
              </div>
            </div>
          )}

          {/* Photo pack / PRO active badge */}
          {(hasPhotoPack || isPro) && (
            <p className="text-xs text-green-600 font-medium mt-1.5 flex items-center gap-1">
              <span>{isPro ? '⭐' : '✓'}</span>
              {isPro
                ? (lang === 'kr' ? 'PRO — ziska 10 portre' : 'PRO — up to 10 photos')
                : 'Photo pack active — up to 10 photos'}
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-semibold text-gray-800 block mb-1.5">
            {t(lang, 'title_label')} <span className="text-red-500">{t(lang, 'title_required')}</span>
          </label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder={t(lang, 'title_placeholder')} maxLength={100}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
        </div>

        {/* Category — sélecteur hiérarchique */}
        <div>
          <label className="text-sm font-semibold text-gray-800 block mb-2">
            {t(lang, 'category_label')} <span className="text-red-500">*</span>
          </label>

          {/* Catégorie déjà choisie → puce avec bouton changer */}
          {category && (
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 bg-black text-white text-sm font-medium px-3 py-1.5 rounded-full">
                {getTopCatForValue(category) && `${getTopCatForValue(category)!.icon} `}
                {getCatLabel(category, lang)}
              </span>
              <button
                type="button"
                onClick={() => { setCategory(''); setTopCatId(null); setExtra({}) }}
                className="text-xs text-gray-500 underline hover:text-gray-800"
              >
                {lang === 'kr' ? 'Sanze' : 'Change'}
              </button>
            </div>
          )}

          {/* Sélecteur visible uniquement si pas encore choisi */}
          {!category && (
            <>
              {/* Niveau 1 : catégories principales */}
              {!topCatId && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORY_TREE.map(top => (
                    <button
                      key={top.id}
                      type="button"
                      onClick={() => {
                        if (top.subs.length === 1) {
                          setCategory(top.subs[0].value)
                        } else {
                          setTopCatId(top.id)
                        }
                      }}
                      className="flex items-center gap-2 py-3 px-3 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-gray-800 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="text-xl leading-none shrink-0">{top.icon}</span>
                      <span className="leading-tight">{lang === 'kr' ? top.kr : top.en}</span>
                      {top.subs.length > 1 && <span className="ml-auto text-gray-400 text-xs">›</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* Niveau 2 : sous-catégories */}
              {topCatId && (() => {
                const top = CATEGORY_TREE.find(t => t.id === topCatId)!
                return (
                  <div>
                    <button
                      type="button"
                      onClick={() => setTopCatId(null)}
                      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-3 font-medium"
                    >
                      ← {lang === 'kr' ? top.kr : top.en}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      {top.subs.map(sub => (
                        <button
                          key={sub.value}
                          type="button"
                          onClick={() => { setCategory(sub.value); setTopCatId(null) }}
                          className="py-3 px-3 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-gray-800 hover:bg-gray-50 transition-colors text-left"
                        >
                          {lang === 'kr' ? sub.kr : sub.en}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </>
          )}
        </div>

        {/* Category-specific fields */}
        <CategoryFields category={category} fields={extra} onChange={setExtra} />

        {/* Price — masqué pour les catégories Jobs et Free & Exchange */}
        {!hidePrice && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-800">{t(lang, 'price_label')}</label>
              {category && (
                <button type="button" disabled={loadingSuggestion}
                  onClick={async () => {
                    setLoadingSuggestion(true)
                    try {
                      const res = await fetch('/api/ai/price-suggest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category }) })
                      if (!res.ok) return
                      const d = await res.json()
                      if (d.suggested_price) { setPriceSuggestion(d.suggested_price); setPrice(String(d.suggested_price)) }
                    } catch {
                      // Échec réseau (mobile/iOS « Load failed ») : on ignore la suggestion silencieusement.
                    } finally {
                      setLoadingSuggestion(false)
                    }
                  }}
                  className="text-[11px] text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full hover:bg-blue-50 disabled:opacity-40">
                  {loadingSuggestion ? '...' : '💡 Suggest'}
                </button>
              )}
            </div>
            <button type="button" onClick={() => setPriceNegotiable(p => !p)}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${priceNegotiable ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}>
              <span>{priceNegotiable ? '✓' : '○'}</span> Negotiable
            </button>
          </div>
          {!priceNegotiable && (
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-black">
              <input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder={t(lang, 'price_placeholder')} inputMode="numeric"
                className="flex-1 px-4 py-3 text-sm focus:outline-none" />
              {['immobilier', 'bateau', 'tourisme'].includes(category) ? (
                <div className="flex border-l border-gray-300 shrink-0">
                  {(['SCR', 'EUR'] as const).map(c => (
                    <button key={c} type="button" onClick={() => setCurrency(c)}
                      className={`px-3 py-3 text-sm font-semibold transition-colors ${currency === c ? 'bg-black text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="bg-gray-50 border-l border-gray-300 px-4 py-3 text-sm text-gray-500 font-medium">SCR</span>
              )}
            </div>
          )}
          {priceNegotiable && (
            <div className="border border-orange-200 bg-orange-50 rounded-xl px-4 py-3 text-sm text-orange-700 font-medium">
              Price negotiable — buyers will contact you to discuss
            </div>
          )}
          {priceSuggestion && !priceNegotiable && (
            <p className="text-xs text-blue-600 mt-1">💡 Suggested based on {priceSuggestion.toLocaleString()} SCR avg in this category</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{t(lang, 'price_hint')}</p>
        </div>
        )}

        {/* Island */}
        <div>
          <label className="text-sm font-semibold text-gray-800 block mb-2">
            {t(lang, 'island_label')} <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ISLANDS.map(ile => (
              <button key={ile} onClick={() => { setIsland(ile); setQuartier('') }}
                className={`py-2 px-4 rounded-full text-sm font-medium border transition-colors ${
                  island === ile ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}>
                {ile}
              </button>
            ))}
          </div>
        </div>

        {/* Districts */}
        {districtsFor(island).length > 0 && (
          <div>
            <label className="text-sm font-semibold text-gray-800 block mb-2">
              {t(lang, 'district_label')} <span className="text-gray-400 font-normal">{t(lang, 'district_optional')}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {districtsFor(island).map(q => (
                <button key={q} onClick={() => setQuartier(quartier === q ? '' : q)}
                  className={`py-1.5 px-3 rounded-full text-xs font-medium border transition-colors ${
                    quartier === q ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-gray-800">{t(lang, 'description_label')}</label>
            <button type="button" disabled={qualityLoading || !title}
              onClick={async () => {
                setQualityLoading(true)
                try {
                  const res = await fetch('/api/ai/quality', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, description, price: price ? Number(price) : 0 }),
                  })
                  if (!res.ok) return
                  const d = await res.json()
                  setQualityScore(d.quality_score ?? null)
                  setQualityTips(d.tips ?? [])
                } catch {
                  // Échec réseau (mobile/iOS « Load failed ») : pas de score, on ne crashe pas.
                } finally {
                  setQualityLoading(false)
                }
              }}
              className="text-[11px] text-purple-600 border border-purple-200 px-2.5 py-1 rounded-full hover:bg-purple-50 disabled:opacity-40 transition-colors">
              {qualityLoading ? '...' : '✨ Check quality'}
            </button>
          </div>
          <textarea value={description} onChange={e => { setDescription(e.target.value); setQualityScore(null) }}
            placeholder={t(lang, 'description_placeholder')} rows={4} maxLength={1000}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none" />
          <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/1000</p>

          {/* Quality score */}
          {qualityScore !== null && (
            <div className={`mt-3 rounded-xl p-4 border ${
              qualityScore >= 80 ? 'bg-green-50 border-green-200' :
              qualityScore >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-800">
                  {qualityScore >= 80 ? '🟢' : qualityScore >= 60 ? '🟡' : '🔴'} Quality score
                </p>
                <p className={`text-lg font-bold ${
                  qualityScore >= 80 ? 'text-green-600' : qualityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>{qualityScore}/100</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                <div className={`h-1.5 rounded-full transition-all ${
                  qualityScore >= 80 ? 'bg-green-500' : qualityScore >= 60 ? 'bg-yellow-400' : 'bg-red-500'
                }`} style={{ width: `${qualityScore}%` }} />
              </div>
              <ul className="space-y-1">
                {qualityTips.map((tip, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="shrink-0 mt-0.5">💡</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-semibold text-gray-800 block mb-1.5">
            📞 Contact phone <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+248 2 XX XX XX"
            inputMode="tel"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="flex items-center justify-between mt-2.5 px-1">
            <div>
              <p className="text-xs font-medium text-gray-700">Show number on listing</p>
              <p className="text-[11px] text-gray-400">{phoneHidden ? 'Hidden — buyers contact via messages only' : 'Visible — buyers can call or WhatsApp directly'}</p>
            </div>
            <button type="button" onClick={() => setPhoneHidden(h => !h)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${!phoneHidden ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${!phoneHidden ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Options supplémentaires */}
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setDelivery(d => !d)}
            className={`flex items-center justify-between px-3 py-3 rounded-xl border-2 transition-colors ${delivery ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <div className="flex items-center gap-2 text-left">
              <span>🚚</span>
              <div>
                <p className="text-xs font-semibold text-gray-800">Delivery</p>
                <p className="text-[10px] text-gray-400">I can deliver</p>
              </div>
            </div>
            <div className={`w-9 h-5 rounded-full transition-colors shrink-0 ${delivery ? 'bg-blue-500' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${delivery ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </button>

          <button type="button" onClick={() => setUrgent(u => !u)}
            className={`flex items-center justify-between px-3 py-3 rounded-xl border-2 transition-colors ${urgent ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <div className="flex items-center gap-2 text-left">
              <span>🔴</span>
              <div>
                <p className="text-xs font-semibold text-gray-800">Urgent</p>
                <p className="text-[10px] text-gray-400">Sell quickly</p>
              </div>
            </div>
            <div className={`w-9 h-5 rounded-full transition-colors shrink-0 ${urgent ? 'bg-red-500' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${urgent ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </button>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-black text-white rounded-xl py-4 font-semibold text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors">
          {loading ? t(lang, 'publishing') : t(lang, 'publish_btn')}
        </button>

        {limitReached && (
          <div className="bg-gradient-to-br from-[#003F87] to-[#002a5c] rounded-2xl p-5 text-white shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🚦</span>
              <p className="font-bold text-base">
                {lang === 'kr' ? 'Limit zournalye atenn' : 'Daily limit reached'}
              </p>
            </div>
            <p className="text-sm text-white/85 leading-relaxed mb-4">
              {lang === 'kr'
                ? `Ou'n ariv ou limit pou ozordi. Ou'n pibliy ${FREE_DAILY_LIMIT} Lanons Gratwit ozordi. Reesey demen, oubyen pas PRO pou pibliy san limit.`
                : `You've published your ${FREE_DAILY_LIMIT} free listings for today. Come back tomorrow, or go PRO to publish without limits.`}
            </p>
            <Link href="/subscription"
              className="inline-flex items-center gap-1.5 bg-yellow-400 text-black rounded-xl px-4 py-2.5 font-semibold text-sm hover:bg-yellow-300 transition-colors">
              ⭐ {lang === 'kr' ? 'Pas PRO' : 'Upgrade to PRO'}
            </Link>
          </div>
        )}

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1.5">
            <p className="text-xs font-semibold text-red-700 mb-1">
              {lang === 'kr' ? 'Korize avan ou kontinie :' : 'Please fix the following:'}
            </p>
            {errors.map((e, i) => (
              <p key={i} className="text-sm text-red-700 flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5">•</span><span>{e}</span>
              </p>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
