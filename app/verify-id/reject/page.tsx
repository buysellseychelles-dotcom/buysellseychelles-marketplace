import { Suspense } from 'react'
import VerifyIdClient from '../VerifyIdClient'

export const dynamic = 'force-dynamic'

export default function RejectPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-10 text-center text-gray-400">Loading…</div>}>
      <VerifyIdClient mode="reject" />
    </Suspense>
  )
}