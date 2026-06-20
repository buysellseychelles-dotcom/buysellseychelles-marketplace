import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, documentUrl } = await req.json()
    if (!userId || !documentUrl) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
    }

    await supabase.from('identity_verifications').upsert(
      { user_id: userId, document_url: documentUrl, status: 'pending', reviewed_at: null, notes: null },
      { onConflict: 'user_id' }
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
