import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyCronSecret } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  if (!verifyCronSecret(req)) return new Response('Unauthorized', { status: 401 })
  const now = new Date().toISOString()

  // ❌ Désactive les abonnements expirés
  await supabase
    .from('listings')
    .update({
      boosted: false,
      boost_subscription: false,
    })
    .lt('boost_subscription_end', now)
    .eq('boost_subscription', true)

  return NextResponse.json({ ok: true })
}