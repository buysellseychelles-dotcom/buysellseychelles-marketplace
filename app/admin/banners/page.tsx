'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Banner = {
  id: string
  title: string
  subtitle: string | null
  business_name: string | null
  image_url: string | null
  link_url: string
  link_label: string | null
  active: boolean
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

const EMPTY: Omit<Banner, 'id' | 'created_at'> = {
  title: '',
  subtitle: '',
  business_name: '',
  image_url: '',
  link_url: '',
  link_label: 'Learn more',
  active: false,
  starts_at: '',
  ends_at: '',
}

export default function BannersPage() {
  const router = useRouter()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<typeof EMPTY | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('sponsored_banners').select('*').order('created_at', { ascending: false })
      setBanners(data ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  const save = async () => {
    if (!form || !form.title || !form.link_url) return
    setSaving(true)
    const payload = {
      ...form,
      subtitle: form.subtitle || null,
      business_name: form.business_name || null,
      image_url: form.image_url || null,
      link_label: form.link_label || 'Learn more',
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    }
    if (editId) {
      await supabase.from('sponsored_banners').update(payload).eq('id', editId)
      setBanners(prev => prev.map(b => b.id === editId ? { ...b, ...payload } : b))
    } else {
      const { data } = await supabase.from('sponsored_banners').insert(payload).select().single()
      if (data) setBanners(prev => [data, ...prev])
    }
    setForm(null)
    setEditId(null)
    setSaving(false)
  }

  const toggleActive = async (b: Banner) => {
    await supabase.from('sponsored_banners').update({ active: !b.active }).eq('id', b.id)
    setBanners(prev => prev.map(x => x.id === b.id ? { ...x, active: !b.active } : x))
  }

  const remove = async (id: string) => {
    await supabase.from('sponsored_banners').delete().eq('id', id)
    setBanners(prev => prev.filter(b => b.id !== id))
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-black">← Admin</Link>
        <h1 className="font-bold text-lg">📣 Sponsored Banners</h1>
        <button
          onClick={() => { setForm({ ...EMPTY }); setEditId(null) }}
          className="ml-auto bg-black text-white text-sm font-medium px-4 py-2 rounded-xl">
          + New banner
        </button>
      </div>

      {/* Formulaire création/édition */}
      {form && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 space-y-3">
          <h2 className="font-semibold text-sm">{editId ? 'Edit banner' : 'New banner'}</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Business name</label>
              <input value={form.business_name ?? ''} onChange={e => setForm(f => f && ({ ...f, business_name: e.target.value }))}
                placeholder="e.g. Grand Anse Beach Hotel"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Title *</label>
              <input value={form.title} onChange={e => setForm(f => f && ({ ...f, title: e.target.value }))}
                placeholder="Short headline"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Subtitle</label>
              <input value={form.subtitle ?? ''} onChange={e => setForm(f => f && ({ ...f, subtitle: e.target.value }))}
                placeholder="Optional tagline"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Image URL (optional)</label>
              <input value={form.image_url ?? ''} onChange={e => setForm(f => f && ({ ...f, image_url: e.target.value }))}
                placeholder="https://…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Destination URL *</label>
              <input value={form.link_url} onChange={e => setForm(f => f && ({ ...f, link_url: e.target.value }))}
                placeholder="https://…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Button label</label>
              <input value={form.link_label ?? ''} onChange={e => setForm(f => f && ({ ...f, link_label: e.target.value }))}
                placeholder="Learn more"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <label className="text-xs text-gray-500">Active now</label>
              <button onClick={() => setForm(f => f && ({ ...f, active: !f.active }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.active ? 'bg-black' : 'bg-gray-200'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Start date (optional)</label>
              <input type="date" value={form.starts_at?.split('T')[0] ?? ''} onChange={e => setForm(f => f && ({ ...f, starts_at: e.target.value || null }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">End date (optional)</label>
              <input type="date" value={form.ends_at?.split('T')[0] ?? ''} onChange={e => setForm(f => f && ({ ...f, ends_at: e.target.value || null }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={() => { setForm(null); setEditId(null) }}
              className="flex-1 border border-gray-300 rounded-xl py-2.5 text-sm font-medium">
              Cancel
            </button>
            <button onClick={save} disabled={saving || !form.title || !form.link_url}
              className="flex-1 bg-black text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-40">
              {saving ? '…' : editId ? 'Save changes' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Liste des bannières */}
      {banners.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No banners yet.</div>
      ) : (
        <div className="space-y-3">
          {banners.map(b => (
            <div key={b.id} className={`bg-white border rounded-2xl p-4 ${b.active ? 'border-green-200' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {b.business_name && <p className="text-xs text-gray-400">{b.business_name}</p>}
                  <p className="font-semibold text-sm truncate">{b.title}</p>
                  {b.subtitle && <p className="text-xs text-gray-500 truncate">{b.subtitle}</p>}
                  <p className="text-xs text-blue-600 truncate mt-0.5">{b.link_url}</p>
                  {(b.starts_at || b.ends_at) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {b.starts_at ? `From ${new Date(b.starts_at).toLocaleDateString()}` : ''}
                      {b.ends_at ? ` · Until ${new Date(b.ends_at).toLocaleDateString()}` : ''}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button onClick={() => toggleActive(b)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${b.active ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${b.active ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                  <span className={`text-[10px] font-bold ${b.active ? 'text-green-600' : 'text-gray-400'}`}>
                    {b.active ? 'LIVE' : 'OFF'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => { setForm({ title: b.title, subtitle: b.subtitle, business_name: b.business_name, image_url: b.image_url, link_url: b.link_url, link_label: b.link_label, active: b.active, starts_at: b.starts_at, ends_at: b.ends_at }); setEditId(b.id) }}
                  className="flex-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg py-1.5 font-medium">
                  Edit
                </button>
                <button onClick={() => remove(b.id)}
                  className="flex-1 text-xs text-red-500 hover:bg-red-50 rounded-lg py-1.5 font-medium">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
