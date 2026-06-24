import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkVerifyToken } from '@/lib/identity-verification'
import { isAdminAccessToken } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Returns the submitted document + current status for the /verify-id pages.
// Authorized by the admin's access token and the signed link token.
export async function POST(req: Request) {
  try {
    const { vid, uid, token, accessToken } = await req.json()

    if (!(await isAdminAccessToken(accessToken))) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!checkVerifyToken(vid ?? '', uid ?? '', token ?? '')) {
      return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 403 })
    }

    const { data: row } = await supabase
      .from('identity_verifications')
      .select('document_url, status')
      .eq('id', vid)
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      documentUrl: row?.document_url ?? '',
      status: row?.status ?? null,
    })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}