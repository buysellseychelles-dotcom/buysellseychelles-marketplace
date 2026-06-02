import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('listings')
    .update({
      boosted: false,
      boost_level: null,
      boost_multiplier: 1,
    })
    .lt('boost_expires_at', now)
    .eq('boosted', true)

  if (error) {
    console.error('CRON ERROR:', error)
    return NextResponse.json({ ok: false })
  }

  return NextResponse.json({ ok: true })
}