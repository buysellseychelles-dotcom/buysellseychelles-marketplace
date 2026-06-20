import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { listingId, userId } = await req.json()
    if (!listingId || !userId) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

    const { data: listing } = await supabase
      .from('listings')
      .select('id, user_id, status')
      .eq('id', listingId)
      .single()

    if (!listing || listing.user_id !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const newExpiry = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()

    await supabase
      .from('listings')
      .update({
        expires_at: newExpiry,
        renewal_email_sent: false,
        final_notice_sent: false,
        status: listing.status === 'expired' ? 'available' : listing.status,
      })
      .eq('id', listingId)

    return NextResponse.json({ ok: true, expires_at: newExpiry })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
