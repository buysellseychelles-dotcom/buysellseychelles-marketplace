import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminUser } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// identity_verifications has RLS enabled with no policies, so the anon-key
// client always reads back nothing — this route reads it with the
// service-role key instead, gated on isAdminUser().
export async function GET() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('identity_verifications')
    .select('*, profiles(full_name, avatar_url)')
    .order('created_at', { ascending: false })

  return NextResponse.json({ items: data ?? [] })
}