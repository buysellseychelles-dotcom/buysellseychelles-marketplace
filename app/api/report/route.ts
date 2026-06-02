import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const listingId = formData.get('listingId')

    if (!listingId) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    await supabase.from('reports').insert({
      listing_id: listingId,
      created_at: new Date().toISOString(),
    })

    return NextResponse.redirect(new URL('/', req.url))

  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}