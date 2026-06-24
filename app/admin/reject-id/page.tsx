import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { isAdminUser } from '@/lib/admin-auth'
import { checkVerifyToken } from '@/lib/identity-verification'
import RejectClient from './RejectClient'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function RejectIdPage({
  searchParams,
}: {
  searchParams: Promise<{ vid?: string; uid?: string; token?: string }>
}) {
  // Admin-only: anyone else (or not logged in) is sent to login.
  if (!(await isAdminUser())) redirect('/login')

  const { vid = '', uid = '', token = '' } = await searchParams

  if (!checkVerifyToken(vid, uid, token)) {
    return (
      <div className="max-w-md mx-auto px-4 py-10">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="font-bold text-lg mb-2">Invalid or expired link</h1>
          <p className="text-sm text-gray-500 mb-5">This rejection link could not be verified. Please use the admin panel instead.</p>
          <Link href="/admin/verifications" className="inline-block bg-[#003F87] text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
            Open admin verifications →
          </Link>
        </div>
      </div>
    )
  }

  const { data: row } = await supabase
    .from('identity_verifications')
    .select('document_url')
    .eq('id', vid)
    .maybeSingle()

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <RejectClient vid={vid} uid={uid} token={token} doc={row?.document_url ?? ''} />
    </div>
  )
}
