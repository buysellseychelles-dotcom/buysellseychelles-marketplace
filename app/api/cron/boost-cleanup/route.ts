import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

  const now = new Date().toISOString()

  // 🚨 1. désactiver boosts expirés
  const { error: updateError } = await supabase
    .from('listings')
    .update({
      boosted: false,
    })
    .lt('boost_expires_at', now)

  if (updateError) {
    return NextResponse.json({
      success: false,
      error: updateError.message,
    })
  }

  // 🚀 2. reset boost score (optionnel propre ranking)
  await supabase
    .from('listings')
    .update({
      boost_score: 0,
    })
    .lt('boost_expires_at', now)

  return NextResponse.json({
    success: true,
    message: 'Boost cleanup done',
    time: now,
  })
}