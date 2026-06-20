'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { compressImage } from '@/lib/compress-image'
import { fileTooLarge, fileExceedsRaw } from '@/lib/upload-limits'
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react'

// ── Image spec — must match the home banner (full width, ~3:1 crop) ──────────
const REQUIRED_W = 1200
const REQUIRED_H = 400
const TARGET_RATIO = REQUIRED_W / REQUIRED_H // 3.0
const RATIO_TOLERANCE = 0.05                 // ±5%
const MIN_WIDTH = 1200

const PLANS = [
  { product: 'banner_7',  days: 7,  price: '150 SCR', amount: 150, color: '#003F87', icon: '📢' },
  { product: 'banner_14', days: 14, price: '300 SCR', amount: 300, color: '#007A3D', icon: '⭐', popular: true },
  { product: 'banner_30', days: 30, price: '450 SCR', amount: 450, color: '#BE0027', icon: '🏆' },
]

const BENEFITS = [
  ['👀', 'Seen by every visitor', 'Your banner rotates at the top of the home page, in front of thousands of buyers across the Seychelles.'],
  ['🔁', 'Always in rotation', 'Up to 5 businesses share the carousel — your banner loops automatically, no scrolling needed to be seen.'],
  ['🔗', 'Drives real traffic', 'One tap takes visitors straight to your website, listing or social page.'],
  ['⚡', 'Live the moment you pay', 'No waiting, no back-and-forth — your banner goes live automatically right after payment.'],
]

type ImgState = { file: File; preview: string; w: number; h: number }

export default function AdvertisePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [businessName, setBusinessName] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [img, setImg] = useState<ImgState | null>(null)
  const [imgError, setImgError] = useState<string | null>(null)
  const [plan, setPlan] = useState('banner_14')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleFile = (file: File | null) => {
    setImgError(null)
    setImg(null)
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImgError('This file is not an image. Use a JPG or PNG.')
      return
    }

    const sizeErr = fileExceedsRaw(file)
    if (sizeErr) { setImgError(sizeErr); return }

    const url = URL.createObjectURL(file)
    const probe = new window.Image()
    probe.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = probe
      const ratio = w / h
      const ratioOk = Math.abs(ratio - TARGET_RATIO) <= TARGET_RATIO * RATIO_TOLERANCE
      const widthOk = w >= MIN_WIDTH

      if (!ratioOk || !widthOk) {
        URL.revokeObjectURL(url)
        setImgError(
          `Wrong image size. Required: ${REQUIRED_W} × ${REQUIRED_H} px (ratio 3:1). ` +
          `Your image is ${w} × ${h} px${!widthOk ? ` (too narrow — min width ${MIN_WIDTH} px)` : ` (ratio ${ratio.toFixed(2)}:1)`}. ` +
          `Please resize/crop it to ${REQUIRED_W} × ${REQUIRED_H} px and upload again.`
        )
        return
      }
      setImg({ file, preview: url, w, h })
    }
    probe.onerror = () => {
      URL.revokeObjectURL(url)
      setImgError('Could not read this image. Try another file.')
    }
    probe.src = url
  }

  const normalizeLink = (raw: string) => {
    const v = raw.trim()
    if (!v) return ''
    if (/^https?:\/\//i.test(v)) return v
    return `https://${v}`
  }

  const startCheckout = async () => {
    setError(null)

    if (!img) { setError('Please upload your banner image first.'); return }
    const link = normalizeLink(linkUrl)
    if (!link) { setError('Please enter the link your banner should open.'); return }
    try { new URL(link) } catch { setError('That link does not look valid.'); return }

    setBusy(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/advertise'); return }

      // 1. Upload the (compressed) image to storage
      const compressed = await compressImage(img.file, REQUIRED_W, 0.85)
      const sizeErr = fileTooLarge(compressed)
      if (sizeErr) { setError(sizeErr); setBusy(false); return }
      const fd = new FormData()
      fd.append('file', compressed)
      fd.append('bucket', 'banners')
      fd.append('path', `${user.id}-${Date.now()}.jpg`)
      const upRes = await fetch('/api/storage/upload', { method: 'POST', body: fd })
      const up = await upRes.json()
      if (!upRes.ok || !up.url) { setError('Image upload failed. Please try again.'); setBusy(false); return }

      // 2. Create the Stripe checkout session (banner published after payment)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: plan,
          user_id: user.id,
          banner: {
            image_url: up.url,
            link_url: link,
            business_name: businessName.trim(),
            title: businessName.trim() || 'Featured business',
          },
        }),
      })
      const data = await res.json()
      if (res.status === 409 && data.slots_full) {
        setError('All 5 banner slots are currently taken. Please come back in a few days — slots free up as ads expire.')
        setBusy(false)
        return
      }
      if (!res.ok || !data.url) { setError(data.error ?? 'Could not start payment.'); setBusy(false); return }

      window.location.href = data.url
    } catch {
      setError('Connection error. Please try again.')
      setBusy(false)
    }
  }

  const selectedPlan = PLANS.find(p => p.product === plan)!

  return (
    <div className="max-w-2xl mx-auto pb-10">

      {/* Hero */}
      <div className="text-white px-4 pt-8 pb-12 text-center"
        style={{ background: 'linear-gradient(135deg, #003F87 0%, #003F87 30%, #007A3D 70%, #007A3D 100%)' }}>
        <p className="text-4xl mb-3">📢</p>
        <h1 className="text-2xl font-bold">Advertise on the home banner</h1>
        <p className="text-white/80 text-sm mt-1">Your business, front and center — seen by thousands of buyers across the Seychelles.</p>
      </div>

      <div className="px-4 -mt-5 space-y-4">

        {/* Benefits */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-3">Why advertise here?</h2>
          <div className="space-y-3">
            {BENEFITS.map(([icon, title, desc]) => (
              <div key={title} className="flex items-start gap-3">
                <span className="text-xl shrink-0">{icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 — Image */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-1">1. Your banner image</h2>
          <p className="text-xs text-gray-500 mb-3">
            Required size: <strong>{REQUIRED_W} × {REQUIRED_H} px</strong> (ratio 3:1, landscape).
            JPG or PNG. The image fills the full banner width.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0] ?? null)}
          />

          {!img ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-8 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-gray-400 transition-colors">
              <Upload className="w-6 h-6" />
              <span className="text-sm font-medium">Upload your banner</span>
              <span className="text-xs text-gray-400">{REQUIRED_W} × {REQUIRED_H} px</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="relative w-full rounded-xl overflow-hidden border border-gray-200" style={{ aspectRatio: '3 / 1' }}>
                <Image src={img.preview} alt="Banner preview" fill className="object-cover" unoptimized />
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> {img.w} × {img.h} px — looks good
                </span>
                <button onClick={() => fileRef.current?.click()} className="text-xs text-blue-600 font-medium hover:underline">
                  Change image
                </button>
              </div>
            </div>
          )}

          {imgError && (
            <div className="flex items-start gap-2 text-red-600 text-xs mt-3 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{imgError}</span>
            </div>
          )}
        </div>

        {/* Step 2 — Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="font-bold text-gray-900">2. Your details</h2>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Business name (optional)</label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)}
              placeholder="e.g. Grand Anse Beach Hotel"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Link to open when tapped *</label>
            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
              placeholder="https://your-website.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
        </div>

        {/* Step 3 — Duration */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-1">3. Choose your duration</h2>
          <p className="text-xs text-gray-500 mb-3">One-time payment · the longer the run, the better the value.</p>
          <div className="grid grid-cols-3 gap-2">
            {PLANS.map(p => {
              const active = p.product === plan
              return (
                <button key={p.product} onClick={() => setPlan(p.product)}
                  className={`relative rounded-xl border-2 p-3 text-center transition-all ${active ? 'shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                  style={active ? { borderColor: p.color } : {}}>
                  {p.popular && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ backgroundColor: p.color }}>
                      BEST VALUE
                    </span>
                  )}
                  <p className="text-lg">{p.icon}</p>
                  <p className="text-sm font-bold text-gray-900">{p.days} days</p>
                  <p className="text-base font-extrabold mt-0.5" style={{ color: p.color }}>{p.price}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Pay */}
        <button
          onClick={startCheckout}
          disabled={busy}
          className="w-full text-white text-sm font-semibold py-3.5 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ backgroundColor: selectedPlan.color }}>
          {busy ? 'Redirecting to payment…' : `Pay ${selectedPlan.price} — ${selectedPlan.days} days`}
        </button>
        <p className="text-[11px] text-gray-400 text-center">
          🔒 Secure payment via Stripe. Your banner goes live automatically once payment is confirmed.
        </p>

        {/* Boost note */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <p className="text-2xl mb-2">🚀</p>
          <p className="font-bold text-gray-900 mb-1">Want to boost a single listing instead?</p>
          <p className="text-sm text-gray-500 mb-4">
            Use the <strong>Boost</strong> button on your listing page — from <strong>75 SCR</strong>.
          </p>
          <Link href="/dashboard"
            className="inline-block border-2 border-black text-black text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-black hover:text-white transition-colors">
            Go to my listings →
          </Link>
        </div>

      </div>
    </div>
  )
}
