'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { REJECT_REASONS } from '@/lib/verify-reasons'

type Phase = 'loading' | 'denied' | 'invalid' | 'ready' | 'sending' | 'done' | 'error'

export default function VerifyIdClient({ mode }: { mode: 'confirm' | 'reject' }) {
  const params = useSearchParams()
  const vid = params.get('vid') ?? ''
  const uid = params.get('uid') ?? ''
  const token = params.get('token') ?? ''

  const [phase, setPhase] = useState<Phase>('loading')
  const [doc, setDoc] = useState('')
  const [currentStatus, setCurrentStatus] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const accessTokenRef = useRef<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        const here = window.location.pathname + window.location.search
        window.location.href = `/login?redirect=${encodeURIComponent(here)}`
        return
      }
      accessTokenRef.current = session.access_token

      const res = await fetch('/api/admin/verification-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vid, uid, token, accessToken: session.access_token }),
      })
      if (res.status === 401) { setPhase('denied'); return }
      if (!res.ok) { setPhase('invalid'); return }
      const data = await res.json()
      setDoc(data.documentUrl ?? '')
      setCurrentStatus(data.status ?? null)
      setPhase('ready')
    }
    load().catch(() => setPhase('error'))
  }, [vid, uid, token])

  const toggle = (reason: string) =>
    setSelected(prev => (prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]))

  const submit = async () => {
    setPhase('sending')
    try {
      const res = await fetch('/api/admin/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vid, uid, token,
          accessToken: accessTokenRef.current,
          action: mode === 'confirm' ? 'approve' : 'reject',
          reasons: selected,
          notes,
        }),
      })
      if (!res.ok) throw new Error()
      setPhase('done')
    } catch {
      setPhase('error')
    }
  }

  // ── States ────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return <Shell><p className="text-center text-gray-400 text-sm py-6">Loading…</p></Shell>
  }

  if (phase === 'denied') {
    return (
      <Shell>
        <Centered icon="🔒" title="Admins only" accent="#BE0027"
          message="You must be signed in as the administrator to review identity documents." />
      </Shell>
    )
  }

  if (phase === 'invalid') {
    return (
      <Shell>
        <Centered icon="⚠️" title="Invalid or expired link" accent="#BE0027"
          message="This link could not be verified. Please use the admin panel instead." />
      </Shell>
    )
  }

  if (phase === 'done') {
    return (
      <Shell>
        <Centered icon="✅" title={mode === 'confirm' ? 'Identity confirmed' : 'Rejection sent'} accent="#007A3D"
          message={mode === 'confirm'
            ? 'The seller is now ID Verified — the badge is visible on their profile and they have been notified by email.'
            : 'The seller has been notified by email and invited to submit a new document.'} />
      </Shell>
    )
  }

  // confirm already approved
  if (mode === 'confirm' && currentStatus === 'approved') {
    return (
      <Shell>
        <Centered icon="✅" title="Already verified" accent="#007A3D"
          message="This seller's identity has already been approved." />
      </Shell>
    )
  }

  // ── Ready / sending / error → the action form ───────────────────────────────
  const isConfirm = mode === 'confirm'
  const sending = phase === 'sending'
  const disableSubmit =
    sending || (!isConfirm && (selected.length === 0 || (selected.includes('Other') && !notes.trim())))

  return (
    <Shell>
      <div className={`bg-white border ${isConfirm ? 'border-green-200' : 'border-red-200'} rounded-2xl p-6 space-y-4`}>
        <div>
          <h1 className="font-bold text-lg">{isConfirm ? '✓ Confirm identity document' : '✗ Reject identity document'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isConfirm
              ? 'Review the submitted document, then confirm to activate the ID Verified badge.'
              : 'Select the reason(s) for rejection. The seller will receive them by email.'}
          </p>
        </div>

        {doc ? (
          <a href={doc} target="_blank" rel="noreferrer" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={doc} alt="Submitted ID document" className="w-full rounded-xl border border-gray-200 object-contain max-h-80" />
            <span className="block text-center text-xs text-[#003F87] mt-2">Open in full size →</span>
          </a>
        ) : (
          <p className="text-sm text-gray-400">Document preview unavailable.</p>
        )}

        {!isConfirm && (
          <>
            <div className="space-y-2">
              {REJECT_REASONS.map(reason => (
                <label key={reason} className="flex items-center gap-3 border border-gray-200 rounded-xl px-3.5 py-3 cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={selected.includes(reason)} onChange={() => toggle(reason)} className="w-4 h-4 accent-[#BE0027]" />
                  <span className="text-sm">{reason}</span>
                </label>
              ))}
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={selected.includes('Other') ? 'Please describe the reason (shown to the seller)' : 'Additional note (optional — shown to the seller)'}
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#BE0027]"
            />
          </>
        )}

        {phase === 'error' && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}

        <button
          onClick={submit}
          disabled={disableSubmit}
          className={`w-full text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 ${isConfirm ? 'bg-[#007A3D] hover:bg-[#005c2e]' : 'bg-[#BE0027] hover:bg-[#9e0020]'}`}
        >
          {sending ? (isConfirm ? 'Confirming…' : 'Sending…') : (isConfirm ? 'Confirmer et activer le badge' : 'Reject & notify seller')}
        </button>
        {!isConfirm && <p className="text-[11px] text-gray-400 text-center">Pick at least one reason to enable sending.</p>}
      </div>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="max-w-md mx-auto px-4 py-10">{children}</div>
}

function Centered({ icon, title, message, accent }: { icon: string; title: string; message: string; accent: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h1 className="font-bold text-lg mb-2" style={{ color: accent }}>{title}</h1>
      <p className="text-sm text-gray-500 mb-5">{message}</p>
      <Link href="/admin/verifications" className="inline-block bg-[#003F87] text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
        Open admin verifications →
      </Link>
    </div>
  )
}