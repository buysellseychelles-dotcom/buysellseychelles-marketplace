import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  try {

    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    if (!sig) {
      return new NextResponse('Missing signature', { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type !== 'checkout.session.completed') {
      return NextResponse.json({ received: true })
    }

    const session = event.data.object as Stripe.Checkout.Session

    const listingId = session.metadata?.listingId
    const type = session.metadata?.type

    if (!listingId) {
      return NextResponse.json({ ok: true })
    }

    const now = new Date()

    // 🚀 BOOST CLASSIQUE 24H
    if (type === 'boost') {

      const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      await supabase
        .from('listings')
        .update({
          boosted: true,
          boost_level: session.metadata?.boostLevel || 'standard',
          boost_multiplier: Number(session.metadata?.boostMultiplier || 1),

          boosted_at: now.toISOString(),
          boost_expires_at: expires.toISOString(),

          boost_last_used_at: now.toISOString(),
        })
        .eq('id', listingId)
    }

    // 💰 BOOST ABONNEMENT 30 JOURS
    if (type === 'boost_subscription') {

      const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      await supabase
        .from('listings')
        .update({
          boosted: true,
          boost_subscription: true,
          boost_subscription_end: end.toISOString(),
          boosted_at: now.toISOString(),
        })
        .eq('id', listingId)
    }

    return NextResponse.json({ received: true })

  } catch (error) {

    console.error('Webhook error:', error)

    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 500 }
    )
  }
}