'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'
import { formatPrice } from '@/lib/utils'
import { fileTooLarge, fileExceedsRaw } from '@/lib/upload-limits'
import { compressImage } from '@/lib/compress-image'

type Profile = {
  full_name: string
  whatsapp: string
  bio: string
  island: string
  avatar_url: string
  show_avatar_in_listings: boolean
  phone_hidden: boolean
}

type Listing = {
  id: string
  title: string
  price: string
  location: string
  boosted: boolean
  status: string
  views_count: number
  clicks_count: number
  created_at: string
  expires_at: string | null
  listing_images: { image_url: string }[]
}

const ISLANDS = ['Mahé', 'Praslin', 'La Digue', 'Silhouette', 'Other islands']

export default function DashboardPage() {
  const router = useRouter()
  const { lang } = useLang()
  const fileRef = useRef<HTMLInputElement>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [profile, setProfile] = useState<Profile>({ full_name: '', whatsapp: '', bio: '', island: '', avatar_url: '', show_avatar_in_listings: true, phone_hidden: false })
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [statsId, setStatsId] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [favCounts, setFavCounts] = useState<Record<string, number>>({})
  const [convCounts, setConvCounts] = useState<Record<string, number>>({})
  const [unreadMsgsDash, setUnreadMsgsDash] = useState(0)
  const [verifyStatus, setVerifyStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none')
  const [verifyUploading, setVerifyUploading] = useState(false)
  const verifyRef = useRef<HTMLInputElement>(null)
  // Synchronous in-flight lock: prevents a double submission (e.g. the file
  // input firing change twice) from sending two admin emails for one upload.
  const verifySubmittingRef = useRef(false)
  const [quickEdit, setQuickEdit] = useState<{ id: string; title: string; price: string } | null>(null)
  const [quickEditSaving, setQuickEditSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserId(user.id)
      setEmail(user.email ?? '')
      setCreatedAt(user.created_at)

      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, whatsapp, bio, island, avatar_url, show_avatar_in_listings, phone_hidden')
        .eq('id', user.id)
        .single()

      if (prof) setProfile({ full_name: prof.full_name ?? '', whatsapp: prof.whatsapp ?? '', bio: prof.bio ?? '', island: prof.island ?? '', avatar_url: prof.avatar_url ?? '', show_avatar_in_listings: prof.show_avatar_in_listings ?? true, phone_hidden: prof.phone_hidden ?? false })

      const { data: lst } = await supabase
        .from('listings')
        .select('id, title, price, location, boosted, status, views_count, clicks_count, created_at, expires_at, listing_images(image_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setListings(lst ?? [])

      const ids = (lst ?? []).map(l => l.id)
      if (ids.length > 0) {
        const [{ data: favs }, { data: convs }] = await Promise.all([
          supabase.from('favorites').select('listing_id').in('listing_id', ids),
          supabase.from('conversations').select('id, listing_id').in('listing_id', ids).eq('seller_id', user.id),
        ])
        const fc: Record<string, number> = {}
        for (const f of favs ?? []) fc[f.listing_id] = (fc[f.listing_id] || 0) + 1
        setFavCounts(fc)
        const cc: Record<string, number> = {}
        for (const c of convs ?? []) cc[c.listing_id] = (cc[c.listing_id] || 0) + 1
        setConvCounts(cc)

        // Compteur de messages non lus (conversations où je suis vendeur)
        const sellConvIds = (convs ?? []).map((c: any) => c.id)
        if (sellConvIds.length > 0) {
          const { count: unread } = await supabase.from('messages')
            .select('id', { count: 'exact', head: true })
            .in('conversation_id', sellConvIds)
            .neq('sender_id', user.id)
            .eq('read', false)
          setUnreadMsgsDash(unread ?? 0)
        }
      }

      // Read via service-role API so the status persists across reloads
      // (a direct anon-key read is blocked by RLS and returns null).
      try {
        const res = await fetch(`/api/verify-identity?userId=${user.id}`, { cache: 'no-store' })
        const { status } = await res.json()
        setVerifyStatus((status ?? 'none') as any)
      } catch {
        setVerifyStatus('none')
      }

      setLoading(false)
    }
    init()
  }, [router])

  const uploadAvatar = async (file: File) => {
    if (!userId) return
    const rawErr = fileExceedsRaw(file, lang)
    if (rawErr) { setAvatarError(rawErr); return }
    setUploadingAvatar(true)
    setAvatarError('')
    try {
      // Compression, puis contrôle de la limite 5 MB sur le fichier réellement uploadé
      const compressed = await compressImage(file)
      const sizeErr = fileTooLarge(compressed, lang)
      if (sizeErr) { setAvatarError(sizeErr); setUploadingAvatar(false); return }
      const ext = compressed.name.split('.').pop()
      const form = new FormData()
      form.append('file', compressed)
      form.append('path', `${userId}/avatar.${ext}`)
      form.append('bucket', 'avatars')
      const res = await fetch('/api/storage/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Upload failed')
      const url = `${json.url}?t=${Date.now()}`
      await supabase.from('profiles').upsert({ id: userId, avatar_url: url }, { onConflict: 'id' })
      setProfile(p => ({ ...p, avatar_url: url }))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setAvatarError(msg)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const submitVerification = async (file: File) => {
    if (!userId || verifySubmittingRef.current) return
    verifySubmittingRef.current = true
    setVerifyUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const form = new FormData()
      form.append('file', file)
      form.append('path', `id-docs/${userId}/id.${ext}`)
      form.append('bucket', 'avatars')
      const res = await fetch('/api/storage/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      await fetch('/api/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, documentUrl: json.url }),
      })
      setVerifyStatus('pending')
    } catch (err) {
      console.error('Verification upload error:', err)
    } finally {
      setVerifyUploading(false)
      verifySubmittingRef.current = false
      // Reset the input so re-selecting the same file fires change again.
      if (verifyRef.current) verifyRef.current.value = ''
    }
  }

  const saveProfile = async () => {
    if (!userId) return
    setSaving(true)
    const isComplete = !!(profile.avatar_url && profile.full_name && profile.whatsapp && profile.island)
    await supabase.from('profiles').upsert({ id: userId, ...profile, verified: isComplete }, { onConflict: 'id' })
    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const toggleStatus = async (id: string, current: string) => {
    const next = current === 'sold' ? 'available' : 'sold'
    await supabase.from('listings').update({ status: next }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: next } : l))
  }

  const saveQuickEdit = async () => {
    if (!quickEdit || quickEditSaving) return
    setQuickEditSaving(true)
    await supabase.from('listings').update({
      title: quickEdit.title.trim(),
      price: quickEdit.price ? Number(quickEdit.price) : null,
    }).eq('id', quickEdit.id)
    setListings(prev => prev.map(l =>
      l.id === quickEdit.id ? { ...l, title: quickEdit.title.trim(), price: quickEdit.price } : l
    ))
    setQuickEditSaving(false)
    setQuickEdit(null)
  }

  const renewListing = async (id: string) => {
    if (!userId) return
    const res = await fetch('/api/listings/renew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: id, userId }),
    })
    const { ok, expires_at } = await res.json()
    if (ok) {
      setListings(prev => prev.map(l => l.id === id
        ? { ...l, expires_at, status: l.status === 'expired' ? 'available' : l.status }
        : l
      ))
    }
  }

  const deleteListing = async (id: string) => {
    // Passe par l'API service-role : supprime aussi les photos du Storage et les
    // notifications liées (sur les comptes d'AUTRES utilisateurs — abonnés / favoris),
    // ce que le client anon ne peut pas faire à cause de la RLS.
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const fd = new FormData()
    fd.append('id', id)
    const res = await fetch('/api/listings/delete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: fd,
    })
    if (res.ok) {
      setListings(prev => prev.filter(l => l.id !== id))
    }
    setDeleteId(null)
  }

  const totalViews = listings.reduce((s, l) => s + (l.views_count || 0), 0)
  const totalFavs = Object.values(favCounts).reduce((s, n) => s + n, 0)
  const totalConvs = Object.values(convCounts).reduce((s, n) => s + n, 0)
  const boostedCount = listings.filter(l => l.boosted).length
  const initials = (profile.full_name || email)?.[0]?.toUpperCase() ?? '?'
  const memberSince = createdAt ? new Date(createdAt).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : ''

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-4 md:pb-8">

      {/* En-tête profil */}
      <div className="relative px-4 pt-7 pb-6" style={{ background: 'linear-gradient(160deg, #EBF3FF 0%, #F4FFF9 100%)' }}>
        {/* Bande drapeau fine en haut */}
        <div className="absolute top-0 left-0 right-0 h-[4px]" style={{ background: 'linear-gradient(90deg, #003F87 0%, #FCD116 35%, #BE0027 55%, #ffffff 70%, #007A3D 100%)' }} />

        <div className="flex items-center gap-4">

          {/* Avatar cliquable */}
          <div className="relative shrink-0">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative w-16 h-16 rounded-full overflow-hidden focus:outline-none group border-2 border-white shadow"
              title="Change photo"
            >
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: '#003F87' }}>
                  {initials}
                </div>
              )}
              {/* Overlay au hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadingAvatar
                  ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <span className="text-white text-sm">📷</span>
                }
              </div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f) }}
            />
            {avatarError && <p className="text-red-500 text-[10px] mt-1 text-center max-w-[70px] leading-tight">{avatarError}</p>}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-lg text-gray-900 truncate">{profile.full_name || <span className="text-gray-400 font-normal text-base">Add your name →</span>}</p>
              {!!(profile.avatar_url && profile.full_name && profile.whatsapp && profile.island) && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 text-white" style={{ backgroundColor: '#003F87' }}>✓ Verified</span>
              )}
            </div>
            <p className="text-gray-500 text-sm truncate">{email}</p>
            <p className="text-gray-400 text-xs mt-0.5">{t(lang, 'member_since')} {memberSince}</p>
          </div>

          <div className="flex items-center gap-2">
            {email === 'buysellseychelles@gmail.com' && (
              <Link
                href="/admin"
                title="Admin panel"
                className="border border-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded-full hover:bg-gray-100 bg-white"
              >
                🛠 Admin
              </Link>
            )}
            <button
              onClick={() => setEditing(!editing)}
              className="border border-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded-full hover:bg-gray-100 bg-white"
            >
              {editing ? t(lang, 'cancel') : t(lang, 'edit_profile')}
            </button>
            <button
              onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
              className="border border-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded-full hover:bg-gray-100 bg-white"
              title="Log out"
            >
              {t(lang, 'logout')}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-5">
          {[
            { label: t(lang, 'listings_count'), value: listings.length },
            { label: t(lang, 'views'), value: totalViews },
            { label: lang === 'kr' ? 'Anrezistre' : 'Saves', value: totalFavs },
            { label: t(lang, 'messages'), value: unreadMsgsDash },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-2 text-center shadow-sm">
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-gray-500 text-[10px] leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulaire d'édition */}
      {editing && (
        <div className="mx-4 -mt-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 space-y-3">
          <h2 className="font-semibold text-sm text-gray-700">{t(lang, 'edit_profile')}</h2>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t(lang, 'display_name')}</label>
            <input
              value={profile.full_name}
              onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
              placeholder={t(lang, 'name_placeholder')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t(lang, 'whatsapp_label')}</label>
            <input
              value={profile.whatsapp}
              onChange={e => setProfile(p => ({ ...p, whatsapp: e.target.value }))}
              placeholder={t(lang, 'whatsapp_placeholder')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t(lang, 'island_label_profile')}</label>
            <select
              value={profile.island}
              onChange={e => setProfile(p => ({ ...p, island: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">{t(lang, 'select_island')}</option>
              {ISLANDS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">{t(lang, 'bio_label')}</label>
            <textarea
              value={profile.bio}
              onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              placeholder={t(lang, 'bio_placeholder')}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Show my photo on listings</p>
            </div>
            <button
              type="button"
              onClick={() => setProfile(p => ({ ...p, show_avatar_in_listings: !p.show_avatar_in_listings }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${profile.show_avatar_in_listings ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${profile.show_avatar_in_listings ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">Show my number on my listings</p>
            </div>
            <button
              type="button"
              onClick={() => setProfile(p => ({ ...p, phone_hidden: !p.phone_hidden }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${profile.phone_hidden ? 'bg-gray-300' : 'bg-blue-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${profile.phone_hidden ? 'translate-x-1' : 'translate-x-6'}`} />
            </button>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: '#003F87' }}
          >
            {saving ? t(lang, 'saving') : t(lang, 'save')}
          </button>
        </div>
      )}

      {saved && (
        <div className="mx-4 mt-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 text-center">
          {t(lang, 'profile_updated')}
        </div>
      )}

      {/* Bannière complétion profil */}
      {(() => {
        const steps = [
          { key: 'avatar', done: !!profile.avatar_url, label: 'Add a photo' },
          { key: 'name',   done: !!profile.full_name,  label: 'Add your name' },
          { key: 'whatsapp', done: !!profile.whatsapp, label: 'Add WhatsApp number' },
          { key: 'island', done: !!profile.island,     label: 'Select your island' },
        ]
        const done = steps.filter(s => s.done).length
        const pct = Math.round((done / steps.length) * 100)
        if (pct === 100) return null
        return (
          <div className="mx-4 mt-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800">Complete your profile</p>
              <span className="text-xs font-bold text-gray-500">{pct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #003F87, #007A3D)' }} />
            </div>
            <div className="space-y-1.5 mb-3">
              {steps.filter(s => !s.done).map(s => (
                <div key={s.key} className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center shrink-0">○</span>
                  {s.label}
                </div>
              ))}
            </div>
            <button onClick={() => setEditing(true)}
              className="w-full bg-black text-white text-xs font-medium py-2.5 rounded-xl">
              Complete my profile →
            </button>
          </div>
        )
      })()}

      {/* Liens rapides */}
      <div className="grid grid-cols-4 gap-2 mx-4 mt-4">
        {[
          { href: '/conversations', icon: '💬', label: t(lang, 'messages') },
          { href: '/favorites', icon: '❤️', label: t(lang, 'favorites') },
          { href: '/notifications', icon: '🔔', label: t(lang, 'notifications') },
          { href: '/tenant-profile', icon: '🏠', label: lang === 'kr' ? 'Mon dosye' : 'My Dossier' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="bg-white border border-gray-100 rounded-xl p-3 text-center hover:shadow-sm transition-shadow">
            <p className="text-2xl">{item.icon}</p>
            <p className="text-xs text-gray-600 mt-1 font-medium">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* Mes annonces */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">{t(lang, 'my_listings_title')} ({listings.length})</h2>
          {boostedCount > 0 && (
            <span className="text-xs text-orange-500 font-medium">🚀 {boostedCount} {t(lang, 'boosted')}</span>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-gray-500 text-sm mb-3">{t(lang, 'no_listings_yet')}</p>
            <Link href="/post-ad" className="bg-black text-white text-sm px-5 py-2.5 rounded-full font-medium">
              {t(lang, 'post_first')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((item) => {
              const image = item.listing_images?.[0]?.image_url
              return (
                <div key={item.id} className={`bg-white rounded-2xl border overflow-hidden ${
                  item.status === 'expired' ? 'border-red-200 opacity-80' :
                  item.status === 'sold' ? 'border-gray-200 opacity-75' :
                  item.status === 'reserved' ? 'border-amber-200' : 'border-gray-100'
                }`}>
                  <div className="flex gap-3 p-3">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative">
                      {image
                        ? <Image src={image} alt={item.title} fill className="object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl text-gray-300">📷</div>
                      }
                      {item.status === 'sold' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                          <span className="text-white text-[10px] font-bold">{t(lang, 'sold').toUpperCase()}</span>
                        </div>
                      )}
                      {item.status === 'reserved' && (
                        <div className="absolute inset-0 bg-amber-500/60 flex items-center justify-center rounded-xl">
                          <span className="text-white text-[10px] font-bold">🔒 {t(lang, 'reserved').toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm truncate">{item.title}</p>
                        <button onClick={() => setQuickEdit({ id: item.id, title: item.title, price: item.price ?? '' })}
                          className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm font-bold text-black">{formatPrice(Number(item.price) || null, (item as any).currency)}</p>
                      <div className="flex gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                        <span title="Views">👁 {item.views_count || 0}</span>
                        <span title="Saves">❤️ {favCounts[item.id] || 0}</span>
                        <span title="Messages">💬 {convCounts[item.id] || 0}</span>
                        {item.boosted && <span className="text-orange-500 font-medium">🚀 {t(lang, 'boosted')}</span>}
                        {item.status === 'sold' && <span className="text-red-500 font-medium">● {t(lang, 'sold')}</span>}
                        {item.status === 'reserved' && <span className="text-amber-600 font-medium">🔒 {t(lang, 'reserved')}</span>}
                        {item.status === 'expired' && <span className="text-red-600 font-semibold">⚠️ Expired</span>}
                        {item.status !== 'sold' && item.status !== 'expired' && item.expires_at && (() => {
                          const days = Math.ceil((new Date(item.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                          if (days <= 7) return <span className={`font-medium ${days <= 3 ? 'text-orange-500' : 'text-gray-400'}`}>⏳ {days}d left</span>
                          return null
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="flex border-t border-gray-100 flex-wrap">
                    <Link href={`/listing/${item.id}`}
                      className="flex-1 py-2.5 text-center text-xs text-gray-600 font-medium hover:bg-gray-50 min-w-[60px]">
                      {t(lang, 'view_btn')}
                    </Link>
                    <div className="w-px bg-gray-100" />
                    <button onClick={() => setStatsId(item.id)}
                      className="flex-1 py-2.5 text-center text-xs text-purple-600 font-medium hover:bg-purple-50 min-w-[60px]">
                      📊 Stats
                    </button>
                    <div className="w-px bg-gray-100" />
                    <Link href={`/edit-listing/${item.id}`}
                      className="flex-1 py-2.5 text-center text-xs text-blue-500 font-medium hover:bg-blue-50 min-w-[60px]">
                      {t(lang, 'edit_btn')}
                    </Link>
                    <div className="w-px bg-gray-100" />
                    {item.status === 'expired' || (item.expires_at && Math.ceil((new Date(item.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7) ? (
                      <>
                        <button
                          onClick={() => renewListing(item.id)}
                          className="flex-1 py-2.5 text-center text-xs text-green-600 font-semibold hover:bg-green-50 min-w-[60px]">
                          🔄 Renew
                        </button>
                        <div className="w-px bg-gray-100" />
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleStatus(item.id, item.status)}
                          className={`flex-1 py-2.5 text-center text-xs font-medium min-w-[60px] ${
                            item.status === 'sold' ? 'text-green-600 hover:bg-green-50' :
                            item.status === 'reserved' ? 'text-red-500 hover:bg-red-50' :
                            'text-amber-600 hover:bg-amber-50'
                          }`}>
                          {item.status === 'sold' ? t(lang, 'mark_available') : t(lang, 'mark_sold')}
                        </button>
                        <div className="w-px bg-gray-100" />
                      </>
                    )}
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="flex-1 py-2.5 text-center text-xs text-red-500 font-medium hover:bg-red-50 min-w-[60px]">
                      {t(lang, 'delete_btn')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Vérification identité — section discrète en bas de page (optionnelle) */}
      <div className="mx-4 mt-8 mb-2">
        {verifyStatus !== 'approved' ? (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base opacity-70">🪪</span>
              <p className="text-xs font-medium text-gray-500">Identity Verification</p>
              <span className="text-[10px] text-gray-400 border border-gray-200 rounded-full px-1.5 py-0.5">Optional</span>
              {verifyStatus === 'pending' && (
                <span className="ml-auto text-[10px] bg-yellow-100 text-yellow-700 font-medium px-2 py-0.5 rounded-full">Under review</span>
              )}
            </div>
            {verifyStatus === 'none' || verifyStatus === 'rejected' ? (
              <>
                <p className="text-[11px] text-gray-400 mb-2.5">
                  Optionally submit a photo of your national ID or passport to get the 🪪 Verified ID badge on your profile.
                </p>
                <input ref={verifyRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) submitVerification(f) }} />
                <button onClick={() => verifyRef.current?.click()} disabled={verifyUploading}
                  className="w-full border border-gray-200 rounded-lg py-2 text-xs font-medium text-gray-500 hover:bg-white disabled:opacity-50">
                  {verifyUploading ? 'Uploading…' : '📤 Upload ID document'}
                </button>
              </>
            ) : verifyStatus === 'pending' ? (
              <p className="text-[11px] text-gray-400">Your document is being reviewed. This usually takes 24–48 hours.</p>
            ) : null}
          </div>
        ) : (
          <div className="bg-green-50/60 border border-green-100 rounded-xl p-3 flex items-center gap-2.5">
            <span className="text-base">🪪</span>
            <div>
              <p className="text-xs font-medium text-green-700">ID Accepted</p>
              <p className="text-[11px] text-green-600">Your ID has been verified. The badge appears on your profile.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal statistiques */}
      {statsId && (() => {
        const item = listings.find(l => l.id === statsId)
        if (!item) return null
        const fav = favCounts[item.id] || 0
        const conv = convCounts[item.id] || 0
        const views = item.views_count || 0
        const clicks = item.clicks_count || 0
        const daysOnline = Math.max(1, Math.ceil((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24)))
        const stats = [
          { icon: '👁', label: 'Views', value: views, sub: `${(views / daysOnline).toFixed(1)}/day`, color: 'text-blue-600' },
          { icon: '🖱️', label: 'Clicks', value: clicks, sub: views > 0 ? `${Math.round((clicks / views) * 100)}% CTR` : '—', color: 'text-indigo-600' },
          { icon: '❤️', label: 'Saves', value: fav, sub: fav > 0 ? 'people watching' : 'no saves yet', color: 'text-red-500' },
          { icon: '💬', label: 'Messages', value: conv, sub: conv > 0 ? 'interested buyers' : 'no messages yet', color: 'text-green-600' },
        ]
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pb-20 sm:pb-4" onClick={() => setStatsId(null)}>
            <div className="bg-white rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 truncate pr-2">📊 {item.title}</h3>
                <button onClick={() => setStatsId(null)} className="text-gray-400 hover:text-gray-600 text-xl shrink-0">×</button>
              </div>
              <p className="text-xs text-gray-400 mb-4">Active for {daysOnline} day{daysOnline !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-2 gap-3">
                {stats.map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>{s.icon}</span>
                      <span className="text-xs text-gray-500 font-medium">{s.label}</span>
                    </div>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
              {item.status === 'expired' && (
                <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-600 font-medium text-center">
                  ⚠️ This listing has expired — renew it to get more views
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Modal Quick Edit */}
      {quickEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pb-20 sm:pb-4" onClick={() => setQuickEdit(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800">✏️ {lang === 'kr' ? 'Modifye vit' : 'Quick edit'}</h3>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                {lang === 'kr' ? 'Tit' : 'Title'}
              </label>
              <input value={quickEdit.title} onChange={e => setQuickEdit(q => q ? { ...q, title: e.target.value } : null)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                maxLength={100} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                {lang === 'kr' ? 'Pri (SCR)' : 'Price (SCR)'}
              </label>
              <input value={quickEdit.price} onChange={e => setQuickEdit(q => q ? { ...q, price: e.target.value.replace(/[^0-9]/g, '') } : null)}
                inputMode="numeric" placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setQuickEdit(null)}
                className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium">
                {lang === 'kr' ? 'Kennsel' : 'Cancel'}
              </button>
              <button onClick={saveQuickEdit} disabled={quickEditSaving || !quickEdit.title.trim()}
                className="flex-1 bg-black text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-50">
                {quickEditSaving ? '...' : lang === 'kr' ? 'Anrezistre' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pb-20 sm:pb-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="font-bold text-center">{t(lang, 'delete_confirm')}</h3>
            <p className="text-sm text-gray-500 text-center">{t(lang, 'delete_warning')}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium">
                {t(lang, 'delete_cancel')}
              </button>
              <button onClick={() => deleteListing(deleteId)}
                className="flex-1 bg-red-500 text-white rounded-xl py-3 text-sm font-medium">
                {t(lang, 'delete_confirm_btn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
