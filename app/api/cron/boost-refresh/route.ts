import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const now = new Date().toISOString()

  // 🚀 désactive les boosts expirés
  const { error } = await supabase
    .from('listings')
    .update({
      boosted: false
    })
    .lt('boost_expires_at', now)

  if (error) {
    console.error(error)
    return NextResponse.json({ ok: false })
  }

  return NextResponse.json({ ok: true })
}