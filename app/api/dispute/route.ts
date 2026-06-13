import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIP, tooManyRequests } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const RESEND_KEY = process.env.RESEND_API_KEY

export async function POST(req: Request) {
  // 3 litiges max par heure par IP
  const ip = getClientIP(req)
  const rl = rateLimit(`dispute:${ip}`, 3, 60 * 60 * 1000)
  if (!rl.allowed) return tooManyRequests(rl.resetAt)

  try {
    const { conversationId, listingId, reporterId, reportedId, reason, description } = await req.json()
    if (!conversationId || !reporterId || !reason) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
    }

    await supabase.from('disputes').insert({
      conversation_id: conversationId,
      listing_id: listingId ?? null,
      reporter_id: reporterId,
      reported_id: reportedId ?? null,
      reason,
      description: description ?? null,
      resolved: false,
    })

    // Email admin
    if (RESEND_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'BuySellSeychelles <noreply@buysellseychelles.com>',
          to: ['contact@buysellseychelles.com'],
          subject: `⚠️ New dispute: ${reason}`,
          html: `<p>A dispute has been submitted.</p><p><strong>Reason:</strong> ${reason}</p><p><strong>Details:</strong> ${description ?? 'None'}</p><p><strong>Conversation:</strong> ${conversationId}</p>`,
        }),
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
