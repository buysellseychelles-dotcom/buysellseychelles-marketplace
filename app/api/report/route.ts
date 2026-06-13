import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIP, tooManyRequests } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  // 5 signalements max par heure par IP
  const ip = getClientIP(req)
  const rl = rateLimit(`report:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) return tooManyRequests(rl.resetAt)

  try {
    const { listingId, reportedUserId, reason, userId } = await req.json()

    if (!reason || (!listingId && !reportedUserId)) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
    }

    await supabase.from('reports').insert({
      listing_id: listingId ?? null,
      reported_user_id: reportedUserId ?? null,
      reason,
      user_id: userId ?? null,
      resolved: false,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
