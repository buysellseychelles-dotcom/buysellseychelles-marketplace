'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import CategoryFields, { type ExtraFields } from '@/components/category-fields'
import { compressImages } from '@/lib/compress-image'
import { fileTooLarge, fileExceedsRaw } from '@/lib/upload-limits'
import { storagePathFromUrl, LISTINGS_BUCKET } from '@/lib/storage-cleanup'
import { districtsFor, ALL_DISTRICTS } from '@/lib/districts'

const CATEGORIES = [
  { value: 'voiture',      label: '🚗 Vehicles' },
  { value: 'immobilier',   label: '🏡 Real Estate' },
  { value: 'electronique', label: '📱 Electronics' },
  { value: 'emploi',       label: '💼 Jobs' },
  { value: 'services',     label: '🔧 Services' },
  { value: 'bateau',       label: '⛵ Boats' },
  { value: 'tourisme',     label: '🌴 Tourism' },
  { value: 'mode',         label: '👗 Fashion' },
  { value: 'maison',       label: '🛋️ Home & Garden' },
  { value: 'loisirs',      label: '⚽ Sports & Leisure' },
  { value: 'animaux',      label: '🐾 Pets & Animals' },
  { value: 'dons',         label: '🎁 Free & Exchange' },
  { value: 'pro',          label: '🏭 Pro Equipment' },
  { value: 'autre',        label: '📦 Other' },
]

const ISLANDS = ['Mahé', 'Praslin', 'La Digue', 'Silhouette', 'Other islands']

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [originalPrice, setOriginalPrice] = useState<number | null>(null)

  const [title, setTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneHidden, setPhoneHidden] = useState(false)
  const [currency, setCurrency] = useState<'SCR' | 'EUR'>('SCR')
  const [urgent, setUrgent] = useState(false)
  const [priceNegotiable, setPriceNegotiable] = useState(false)
  const [delivery, setDelivery] = useState(false)
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [island, setIsland] = useState('')
  const [quartier, setQuartier] = useState('')
  const [category, setCategory] = useState('')
  const [extra, setExtra] = useState<ExtraFields>({})
  // Catégories sans prix : Jobs (emploi/emploi_demande) et Free & Exchange (dons/troc)
  const hidePrice = ['emploi', 'emploi_demande', 'dons', 'troc'].includes(category)
  const [existingImages, setExistingImages] = useState<{ id?: string; image_url: string }[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [qualityScore, setQualityScore] = useState<number | null>(null)
  const [qualityTips, setQualityTips] = useState<string[]>([])
  const [qualityLoading, setQualityLoading] = useState(false)
  const [hasPhotoPack, setHasPhotoPack] = useState(false)

  // Check photo pack
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
      } catch {}
    })
  }, [])

  const PHOTO_LIMIT = hasPhotoPack ? 10 : 3

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: listing } = await supabase
        .from('listings')
        .select('*, listing_images(id, image_url)')
        .eq('id', params.id)
        .single()

      if (!listing || listing.user_id !== user.id) {
        router.push('/dashboard')
        return
      }

      setTitle(listing.title ?? '')
      setDescription(listing.description ?? '')
      setPrice(listing.price ? String(listing.price) : '')
      setOriginalPrice(listing.price ? Number(listing.price) : null)
      setPhone(listing.phone ?? '')
      setPhoneHidden(listing.phone_hidden ?? false)
      setCurrency((listing.currency as 'SCR' | 'EUR') ?? 'SCR')
      setUrgent(listing.urgent ?? false)
      setPriceNegotiable(listing.price_negotiable ?? false)
      setDelivery(listing.delivery ?? false)
      setCategory(listing.category ?? '')

      // Extraire île et quartier depuis la location
      const loc = listing.location ?? ''
      const foundIsland = ISLANDS.find(i => loc.includes(i))
      if (foundIsland) {
        setIsland(foundIsland)
        const foundQuartier = ALL_DISTRICTS.find(q => loc.includes(q))
        if (foundQuartier) setQuartier(foundQuartier)
      }

      setExistingImages(listing.listing_images ?? [])

      setExtra({
        make: listing.make ?? '',
        model: listing.model ?? '',
        year: listing.year ? String(listing.year) : '',
        mileage: listing.mileage ? String(listing.mileage) : '',
        fuel_type: listing.fuel_type ?? '',
        gearbox: listing.gearbox ?? '',
        condition: listing.condition ?? '',
        property_type: listing.property_type ?? '',
        bedrooms: listing.bedrooms ? String(listing.bedrooms) : '',
        bathrooms: listing.bathrooms ? String(listing.bathrooms) : '',
        area_sqm: listing.area_sqm ? String(listing.area_sqm) : '',
        furnished: listing.furnished ?? undefined,
        tenure: listing.tenure ?? '',
        contract_type: listing.contract_type ?? '',
        salary: listing.salary ?? '',
        boat_type: listing.boat_type ?? '',
      })

      setLoading(false)
    }
    load()
  }, [params.id, router])

  const handleNewImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentTotal = existingImages.length + newFiles.length
    const remaining = PHOTO_LIMIT - currentTotal
    if (remaining <= 0) { e.target.value = ''; return }
    const picked = Array.from(e.target.files ?? []).slice(0, remaining)
    e.target.value = ''
    if (picked.length === 0) return
    // Garde-fou sur l'original (évite de décoder une image démesurée sur mobile)
    const raw = picked.find(f => fileExceedsRaw(f))
    if (raw) { setError(fileExceedsRaw(raw)!); return }
    // Compression, puis contrôle de la limite 5 MB sur le fichier réellement uploadé
    const compressed = await compressImages(picked)
    const tooBig = compressed.find(f => fileTooLarge(f))
    if (tooBig) { setError(fileTooLarge(tooBig)!); return }
    setNewPreviews(prev => [...prev, ...compressed.map(f => URL.createObjectURL(f))])
    setNewFiles(prev => [...prev, ...compressed])
  }

  const removeExistingImage = async (index: number) => {
    const img = existingImages[index]
    if (img.id) {
      await supabase.from('listing_images').delete().eq('id', img.id)
      // Retire aussi le fichier du Storage (évite les orphelins)
      const path = storagePathFromUrl(img.image_url)
      if (path) await supabase.storage.from(LISTINGS_BUCKET).remove([path])
    }
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setError('')
    if (!title.trim()) { setError('Title is required.'); return }
    if (!category) { setError('Please choose a category.'); return }
    if (!island) { setError('Please choose an island.'); return }

    setSaving(true)

    const location = quartier ? `${quartier}, ${island}` : island

    const { error: updateError } = await supabase
      .from('listings')
      .update({
        title: title.trim(),
        description: description.trim(),
        price: hidePrice ? null : (priceNegotiable ? null : (price ? Number(price) : null)),
        price_negotiable: hidePrice ? false : priceNegotiable,
        urgent,
        delivery,
        location,
        category,
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
      .eq('id', params.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    // Si le prix a changé : notif spécifique prix uniquement
    // Sinon : notif générique "annonce modifiée"
    const newPriceNum = price ? Number(price) : null
    const priceChanged = !!(newPriceNum && originalPrice && newPriceNum !== originalPrice)

    if (priceChanged) {
      fetch('/api/notify/price-drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: params.id, oldPrice: originalPrice, newPrice: newPriceNum, title }),
      }).catch(() => {})
    } else {
      fetch('/api/notify/listing-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: params.id }),
      }).catch(() => {})
    }

    // Upload nouvelles photos
    for (const file of newFiles) {
      const fileName = `${params.id}-${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('listings').upload(fileName, file)
      if (!uploadError) {
        const { data } = supabase.storage.from('listings').getPublicUrl(fileName)
        await supabase.from('listing_images').insert({ listing_id: params.id, image_url: data.publicUrl })
      }
    }

    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-4 space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    )
  }

  const totalImages = existingImages.length + newPreviews.length

  return (
    <div className="max-w-xl mx-auto pb-4">

      <div className="bg-black text-white px-4 py-5">
        <h1 className="text-xl font-bold">Edit listing</h1>
        <p className="text-gray-400 text-sm mt-0.5">Update your listing details</p>
      </div>

      <div className="px-4 pt-5 space-y-5">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>
        )}

        {/* Photos */}
        <div>
          <label className="text-sm font-semibold text-gray-800 block mb-2">
            Photos <span className="text-gray-400 font-normal">({totalImages}/{PHOTO_LIMIT})</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {/* Images existantes */}
            {existingImages.map((img, i) => (
              <div key={i}
                draggable
                onDragStart={e => e.dataTransfer.setData('text/plain', String(i))}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault()
                  const from = Number(e.dataTransfer.getData('text/plain'))
                  if (from === i) return
                  const next = [...existingImages]
                  next.splice(i, 0, next.splice(from, 1)[0])
                  setExistingImages(next)
                }}
                className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing">
                <Image src={img.image_url} alt="" fill className="object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] font-bold text-center py-0.5">Main</span>
                )}
                <button
                  onClick={() => removeExistingImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >×</button>
              </div>
            ))}
            {/* Nouvelles images */}
            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                <Image src={src} alt="" fill className="object-cover" />
                <button
                  onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >×</button>
              </div>
            ))}
            {totalImages < PHOTO_LIMIT && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400"
              >
                <span className="text-2xl leading-none">+</span>
                <span className="text-xs mt-1">Photo</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleNewImages} />

          {/* Upsell photo pack */}
          {!hasPhotoPack && totalImages >= 3 && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
              <span className="text-amber-500 text-base shrink-0">📸</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-800">Limit of 3 photos reached</p>
                <p className="text-xs text-amber-700 mt-0.5">Unlock up to 10 photos for this listing — 30 SCR one-time.</p>
                <button
                  type="button"
                  onClick={async () => {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) { router.push('/login'); return }
                    const res = await fetch('/api/stripe/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ product: 'photo_pack', user_id: user.id, listing_id: params.id, next: `/edit-listing/${params.id}` }),
                    })
                    const { url } = await res.json()
                    if (url) window.location.href = url
                  }}
                  className="mt-1.5 text-xs font-semibold text-amber-900 underline underline-offset-2"
                >
                  Unlock 10 photos — 30 SCR →
                </button>
              </div>
            </div>
          )}
          {hasPhotoPack && (
            <p className="text-xs text-green-600 font-medium mt-1.5 flex items-center gap-1">
              <span>✓</span> Photo pack active — up to 10 photos
            </p>
          )}
        </div>

        {/* Titre */}
        <div>
          <label className="text-sm font-semibold text-gray-800 block mb-1.5">Title <span className="text-red-500">*</span></label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
        </div>

        {/* Catégorie */}
        <div>
          <label className="text-sm font-semibold text-gray-800 block mb-2">Category <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCategory(c.value)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-colors text-left ${category === c.value ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category-specific fields */}
        <CategoryFields category={category} fields={extra} onChange={setExtra} />

        {/* Prix — masqué pour les catégories Jobs et Free & Exchange */}
        {!hidePrice && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-gray-800">Price</label>
            <button type="button" onClick={() => setPriceNegotiable(p => !p)}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${priceNegotiable ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}>
              <span>{priceNegotiable ? '✓' : '○'}</span> Negotiable
            </button>
          </div>
          {!priceNegotiable && (
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-black">
              <input
                value={price}
                onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                inputMode="numeric"
                className="flex-1 px-4 py-3 text-sm focus:outline-none"
              />
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
        </div>
        )}

        {/* Île */}
        <div>
          <label className="text-sm font-semibold text-gray-800 block mb-2">Island <span className="text-red-500">*</span></label>
          <div className="flex flex-wrap gap-2">
            {ISLANDS.map(ile => (
              <button key={ile} onClick={() => { setIsland(ile); setQuartier('') }}
                className={`py-2 px-4 rounded-full text-sm font-medium border transition-colors ${island === ile ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>
                {ile}
              </button>
            ))}
          </div>
        </div>

        {districtsFor(island).length > 0 && (
          <div>
            <label className="text-sm font-semibold text-gray-800 block mb-2">District <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="flex flex-wrap gap-2">
              {districtsFor(island).map(q => (
                <button key={q} onClick={() => setQuartier(quartier === q ? '' : q)}
                  className={`py-1.5 px-3 rounded-full text-xs font-medium border transition-colors ${quartier === q ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-gray-800">Description</label>
            <button
              type="button"
              disabled={qualityLoading}
              onClick={async () => {
                setQualityLoading(true)
                try {
                  const res = await fetch('/api/ai/quality', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, description, price: price ? Number(price) : 0 }),
                  })
                  const data = await res.json()
                  setQualityScore(data.quality_score ?? null)
                  setQualityTips(data.tips ?? [])
                } finally {
                  setQualityLoading(false)
                }
              }}
              className="text-xs font-medium text-purple-600 hover:text-purple-800 disabled:opacity-50 flex items-center gap-1"
            >
              {qualityLoading ? '⏳' : '✨'} {qualityLoading ? 'Checking...' : 'Check quality'}
            </button>
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            maxLength={1000}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/1000</p>
          {qualityScore !== null && (
            <div className="mt-2 bg-purple-50 border border-purple-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-700">Quality score</span>
                <span className={`text-xs font-bold ${qualityScore >= 80 ? 'text-green-600' : qualityScore >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                  {qualityScore}/100
                </span>
              </div>
              <div className="w-full bg-purple-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${qualityScore >= 80 ? 'bg-green-500' : qualityScore >= 60 ? 'bg-orange-400' : 'bg-red-400'}`}
                  style={{ width: `${qualityScore}%` }}
                />
              </div>
              <ul className="space-y-1">
                {qualityTips.map((tip, i) => (
                  <li key={i} className="text-xs text-purple-700 flex items-start gap-1.5">
                    <span className="shrink-0 mt-0.5">💡</span>{tip}
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

        {/* Options */}
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

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-black text-white rounded-xl py-4 font-semibold text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : '✓ Save changes'}
        </button>

        <button onClick={() => router.push('/dashboard')}
          className="w-full text-sm text-gray-500 hover:text-black text-center pb-2">
          Cancel
        </button>

      </div>
    </div>
  )
}
