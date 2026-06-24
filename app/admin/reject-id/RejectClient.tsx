'use client'

import { useState } from 'react'
import Link from 'next/link'
import { REJECT_REASONS } from '@/lib/verify-reasons'

export default function RejectClient({
  vid,
  uid,
  token,
  doc,
}: {
  vid: string
  uid: string
  token: string
  doc: string
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const toggle = (reason: string) =>
    setSelected(prev => (prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]))

  const submit = async () => {
    setStatus('sending')
    try {
      const res = await fetch('/api/admin/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vid, uid, token, action: 'reject', reasons: selected, notes }),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h1 className="font-bold text-lg mb-2">Rejection sent</h1>
        <p className="text-sm text-gray-500 mb-5">The seller has been notified by email and invited to submit a new document.</p>
        <Link href="/admin/verifications" className="inline-block bg-[#003F87] text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
          Open admin verifications →
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white border border-red-200 rounded-2xl p-6 space-y-4">
      <div>
        <h1 className="font-bold text-lg">✗ Reject identity document</h1>
        <p className="text-sm text-gray-500 mt-1">Select the reason(s) for rejection. The seller will receive them by email.</p>
      </div>

      {doc && (
        <a href={doc} target="_blank" rel="noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={doc} alt="Submitted ID document" className="w-full rounded-xl border border-gray-200 object-contain max-h-64" />
          <span className="block text-center text-xs text-[#003F87] mt-2">Open in full size →</span>
        </a>
      )}

      <div className="space-y-2">
        {REJECT_REASONS.map(reason => (
          <label key={reason} className="flex items-center gap-3 border border-gray-200 rounded-xl px-3.5 py-3 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={selected.includes(reason)}
              onChange={() => toggle(reason)}
              className="w-4 h-4 accent-[#BE0027]"
            />
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

      {status === 'error' && (
        <p className="text-sm text-red-600">Could not send. Please try again or use the admin panel.</p>
      )}

      <button
        onClick={submit}
        disabled={status === 'sending' || selected.length === 0 || (selected.includes('Other') && !notes.trim())}
        className="w-full bg-[#BE0027] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#9e0020] disabled:opacity-40"
      >
        {status === 'sending' ? 'Sending…' : 'Reject & notify seller'}
      </button>
      <p className="text-[11px] text-gray-400 text-center">Pick at least one reason to enable sending.</p>
    </div>
  )
}
