'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Verification = {
  id: string
  user_id: string
  document_url: string
  status: 'pending' | 'approved' | 'rejected'
  notes: string | null
  created_at: string
  reviewed_at: string | null
  profiles: { full_name: string | null; avatar_url: string | null } | null
}

export default function VerificationsClient() {
  const router = useRouter()
  const [items, setItems] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/admin/verifications')
      if (!res.ok) { router.push('/'); return }
      const { items } = await res.json()
      setItems((items as Verification[]) ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  const handle = async (v: Verification, action: 'approved' | 'rejected') => {
    setProcessing(v.id)
    await fetch('/api/admin/verify', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationId: v.id, userId: v.user_id, action, notes: notes[v.id] ?? null }),
    })
    setItems(prev => prev.map(i => i.id === v.id ? { ...i, status: action } : i))
    setProcessing(null)
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading…</div>

  const pending = items.filter(i => i.status === 'pending')
  const reviewed = items.filter(i => i.status !== 'pending')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-black">← Admin</Link>
        <h1 className="font-bold text-lg">🪪 Identity Verifications</h1>
      </div>

      {pending.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center text-sm text-green-700 mb-6">
          ✓ No pending verifications
        </div>
      )}

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Pending ({pending.length})</h2>
          <div className="space-y-4">
            {pending.map(v => (
              <VerificationCard
                key={v.id}
                v={v}
                note={notes[v.id] ?? ''}
                onNoteChange={val => setNotes(n => ({ ...n, [v.id]: val }))}
                onApprove={() => handle(v, 'approved')}
                onReject={() => handle(v, 'rejected')}
                processing={processing === v.id}
                onPreview={() => setPreview(v.document_url)}
              />
            ))}
          </div>
        </div>
      )}

      {reviewed.length > 0 && (
        <div>
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Reviewed ({reviewed.length})</h2>
          <div className="space-y-3">
            {reviewed.map(v => (
              <div key={v.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative shrink-0">
                  {v.profiles?.avatar_url
                    ? <Image src={v.profiles.avatar_url} alt="" fill className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-bold">
                        {v.profiles?.full_name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{v.profiles?.full_name ?? v.user_id}</p>
                  <p className="text-xs text-gray-400">{new Date(v.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  v.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {v.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <Image src={preview} alt="ID document" width={400} height={300} className="rounded-xl object-contain w-full" />
            <button onClick={() => setPreview(null)} className="absolute top-2 right-2 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg">×</button>
          </div>
        </div>
      )}
    </div>
  )
}

function VerificationCard({ v, note, onNoteChange, onApprove, onReject, processing, onPreview }: {
  v: Verification
  note: string
  onNoteChange: (val: string) => void
  onApprove: () => void
  onReject: () => void
  processing: boolean
  onPreview: () => void
}) {
  return (
    <div className="bg-white border border-orange-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative shrink-0">
          {v.profiles?.avatar_url
            ? <Image src={v.profiles.avatar_url} alt="" fill className="object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-bold">
                {v.profiles?.full_name?.[0]?.toUpperCase() ?? '?'}
              </div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{v.profiles?.full_name ?? v.user_id}</p>
          <p className="text-xs text-gray-400">{new Date(v.created_at).toLocaleDateString()}</p>
        </div>
        <Link href={`/seller/${v.user_id}`} target="_blank" className="text-xs text-blue-600 hover:underline shrink-0">
          View profile →
        </Link>
      </div>

      <button onClick={onPreview}
        className="w-full relative h-32 rounded-xl bg-gray-100 overflow-hidden hover:opacity-90 transition-opacity">
        <Image src={v.document_url} alt="ID document" fill className="object-contain" />
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">Click to enlarge</span>
        </div>
      </button>

      <textarea
        value={note}
        onChange={e => onNoteChange(e.target.value)}
        placeholder="Notes (optional — shown to user on rejection)"
        rows={2}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
      />

      <div className="flex gap-3">
        <button onClick={onReject} disabled={processing}
          className="flex-1 border border-red-300 text-red-600 rounded-xl py-2.5 text-sm font-medium hover:bg-red-50 disabled:opacity-40">
          ✗ Reject
        </button>
        <button onClick={onApprove} disabled={processing}
          className="flex-1 bg-green-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-green-700 disabled:opacity-40">
          {processing ? '…' : '✓ Approve'}
        </button>
      </div>
    </div>
  )
}