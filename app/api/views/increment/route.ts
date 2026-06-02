import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { listingId } = await req.json()

    if (!listingId) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // ➕ incrémente les vues
    const { data, error } = await supabase
      .rpc('increment_views', {
        row_id: listingId
      })

    if (error) {
      console.error(error)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    return NextResponse.json({ ok: true })

  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}