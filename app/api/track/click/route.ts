import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  const { listingId } = await req.json()

  if (!listingId) {
    return NextResponse.json({ error: 'missing id' }, { status: 400 })
  }

  await supabase.rpc('increment_clicks', {
    row_id: listingId,
  })

  return NextResponse.json({ success: true })
}