'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const REASONS = [
  'Fraudulent listing',
  'Already sold',
  'Abusive price',
  'Inappropriate content',
  'Duplicate',
  'Other',
]

export default function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!reason) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, reason, userId: user?.id }),
    })

    setLoading(false)
    setSent(true)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-orange-600 border border-orange-200 bg-orange-50 rounded-full px-3 py-1.5 hover:bg-orange-100 hover:border-orange-400 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
        </svg>
        Report listing
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 pb-20 sm:pb-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">

            {sent ? (
              <>
                <div className="text-center py-2">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="font-semibold">Report sent</p>
                  <p className="text-sm text-gray-500 mt-1">Thank you, we will review this listing.</p>
                </div>
                <button onClick={() => { setOpen(false); setSent(false); setReason('') }}
                  className="w-full border border-gray-300 rounded-xl py-3 text-sm font-medium">
                  Close
                </button>
              </>
            ) : (
              <>
                <h3 className="font-bold text-center">Report listing</h3>
                <p className="text-sm text-gray-500 text-center">Why are you reporting this listing?</p>

                <div className="space-y-2">
                  {REASONS.map(r => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`w-full text-left text-sm px-4 py-2.5 rounded-xl border transition-colors ${
                        reason === r ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => { setOpen(false); setReason('') }}
                    className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium">
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    disabled={!reason || loading}
                    className="flex-1 bg-black text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40">
                    {loading ? 'Sending...' : 'Report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
