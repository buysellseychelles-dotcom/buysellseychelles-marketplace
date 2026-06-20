'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const REASONS = [
  'Fake profile / scam',
  'Inappropriate content',
  'Harassment or abuse',
  'Spam',
  'Other',
]

export default function ReportUserButton({ sellerId }: { sellerId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    if (!reason) return
    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportedUserId: sellerId, reason, userId: user?.id ?? null }),
    })
    setSending(false)
    setDone(true)
    setOpen(false)
  }

  if (done) return (
    <p className="text-center text-xs text-gray-400 py-4">✓ Report submitted. Thank you.</p>
  )

  return (
    <>
      <div className="text-center py-4">
        <button onClick={() => setOpen(true)}
          className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
          Report this seller
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="font-bold text-center">Report this seller</h3>
            <div className="space-y-2">
              {REASONS.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-colors ${
                    reason === r ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setOpen(false)}
                className="flex-1 border border-gray-300 rounded-xl py-3 text-sm font-medium">
                Cancel
              </button>
              <button onClick={submit} disabled={!reason || sending}
                className="flex-1 bg-red-500 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40">
                {sending ? '...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
