import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {

  const { data: listings } = await supabase
    .from('listings')
    .select('id, views_count, clicks_count, boosted, created_at')

  const now = Date.now()

  for (const item of listings || []) {

    const ageHours =
      (now - new Date(item.created_at).getTime()) / (1000 * 60 * 60)

    const boostScore = item.boosted ? 50 : 0

    const score =
      (item.views_count || 0) * 1 +
      (item.clicks_count || 0) * 5 +
      boostScore -
      ageHours * 0.2

    await supabase
      .from('listings')
      .update({ rank_score: Math.floor(score) })
      .eq('id', item.id)
  }

  return NextResponse.json({ ok: true })
}