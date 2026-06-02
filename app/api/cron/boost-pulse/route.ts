import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const now = new Date()
  const limit = new Date(now.getTime() - 3 * 60 * 60 * 1000) // toutes les 3h

  const { data, error } = await supabase
    .from('listings')
    .select('id, boost_last_pulse')
    .eq('boosted', true)

  if (error) {
    console.error(error)
    return NextResponse.json({ ok: false })
  }

  const toUpdate = (data || []).filter((item: any) => {
    if (!item.boost_last_pulse) return true
    return new Date(item.boost_last_pulse) < limit
  })

  for (const item of toUpdate) {
    await supabase
      .from('listings')
      .update({
        boosted_at: now.toISOString(),
        boost_last_pulse: now.toISOString(),
      })
      .eq('id', item.id)
  }

  return NextResponse.json({ ok: true, updated: toUpdate.length })
}