'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmForm() {
  const params = useSearchParams()
  const vid = params.get('vid') ?? ''
  const uid = params.get('uid') ?? ''
  const token = params.get('token') ?? ''
  const doc = params.get('doc') ?? ''

  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const submit = async () => {
    if (!vid || !uid || !token) { setStatus('error'); return }
    setStatus('sending')
    try {
      const res = await fetch('/api/admin/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vid, uid, token, action: 'approve' }),
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
        <h1 className="font-bold text-lg mb-2">Identity confirmed</h1>
        <p className="text-sm text-gray-500 mb-5">The seller is now ID Verified — the badge is visible on their profile and they have been notified by email.</p>
        <Link href="/admin/verifications" className="inline-block bg-[#003F87] text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
          Open admin verifications →
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white border border-green-200 rounded-2xl p-6 space-y-4">
      <div>
        <h1 className="font-bold text-lg">✓ Confirm identity document</h1>
        <p className="text-sm text-gray-500 mt-1">Review the submitted document, then confirm to activate the ID Verified badge.</p>
      </div>

      {doc && (
        <a href={doc} target="_blank" rel="noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={doc} alt="Submitted ID document" className="w-full rounded-xl border border-gray-200 object-contain max-h-80" />
          <span className="block text-center text-xs text-[#003F87] mt-2">Open in full size →</span>
        </a>
      )}

      {status === 'error' && (
        <p className="text-sm text-red-600">Could not confirm. The link may have expired — use the admin panel instead.</p>
      )}

      <button
        onClick={submit}
        disabled={status === 'sending'}
        className="w-full bg-[#007A3D] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#005c2e] disabled:opacity-40"
      >
        {status === 'sending' ? 'Confirming…' : 'Confirm & activate ID Verified badge'}
      </button>
    </div>
  )
}

export default function ConfirmIdPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <Suspense fallback={<div className="text-center text-gray-400">Loading…</div>}>
        <ConfirmForm />
      </Suspense>
    </div>
  )
}