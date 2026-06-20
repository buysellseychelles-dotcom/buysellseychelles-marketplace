import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Days per boost plan
const BOOST_DAYS: Record<string, number> = {
  boost_basic:    7,
  boost_featured: 14,
  boost_premium:  30,
  // Legacy plan names (backward compat)
  standard: 1,
  premium:  3,
  ultra:    7,
}

// Days per banner plan
const BANNER_DAYS: Record<string, number> = {
  banner_7:  7,
  banner_14: 14,
  banner_30: 30,
}

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const sig  = req.headers.get('stripe-signature')

    if (!sig) return new NextResponse('Missing stripe-signature', { status: 400 })

    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)

    // ── Paiement réussi ───────────────────────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // ── Abonnement PRO (mode subscription) ────────────────────────
      if (session.mode === 'subscription') {
        const userId     = session.metadata?.userId
        const customerId = session.customer as string
        if (userId) {
          await supabaseAdmin.from('profiles').update({
            is_pro: true,
            stripe_customer_id: customerId,
          }).eq('id', userId)
        }
        return NextResponse.json({ received: true })
      }

      const product    = session.metadata?.product ?? ''
      const userId     = session.metadata?.user_id  ?? ''
      const listingId  = session.metadata?.listing_id ?? ''

      // ── Boost listing ──────────────────────────────────────────────
      if (product.startsWith('boost_') || BOOST_DAYS[product] !== undefined) {
        const days = BOOST_DAYS[product] ?? 7
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
        const boostType = product.replace('boost_', '') // 'basic' | 'featured' | 'premium'

        const targetId = listingId || session.metadata?.listingId

        if (targetId) {
          await supabaseAdmin.from('listings').update({
            boosted:          true,
            boost_type:       boostType,
            boosted_at:       new Date().toISOString(),
            boost_expires_at: expiresAt,
            boost_score:      1000,
          }).eq('id', targetId)
        }
        return NextResponse.json({ received: true })
      }

      // ── Photo pack ────────────────────────────────────────────────
      if (product === 'photo_pack') {
        const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        await supabaseAdmin.from('user_purchases').upsert({
          user_id:           userId,
          product_type:      'photo_pack',
          listing_id:        listingId || null,
          stripe_session_id: session.id,
          amount_cents:      session.amount_total,
          currency:          session.currency,
          expires_at:        expiresAt,
        }, { onConflict: 'stripe_session_id', ignoreDuplicates: true })
        return NextResponse.json({ received: true })
      }

      // ── Banner ad ─────────────────────────────────────────────────
      if (product.startsWith('banner_') || BANNER_DAYS[product] !== undefined) {
        const days = BANNER_DAYS[product] ?? 7
        const now = new Date()
        const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()

        // Record the purchase (idempotent)
        await supabaseAdmin.from('user_purchases').upsert({
          user_id:           userId,
          product_type:      product,
          stripe_session_id: session.id,
          amount_cents:      session.amount_total,
          currency:          session.currency,
          expires_at:        expiresAt,
        }, { onConflict: 'stripe_session_id', ignoreDuplicates: true })

        // Self-serve banner: the image + link were uploaded before payment.
        // Now that payment is confirmed, publish the banner automatically.
        const bannerImage = session.metadata?.banner_image
        const bannerLink  = session.metadata?.banner_link
        if (bannerImage && bannerLink) {
          // Don't create a duplicate if this webhook is retried
          const { data: existing } = await supabaseAdmin
            .from('sponsored_banners')
            .select('id')
            .eq('stripe_session_id', session.id)
            .maybeSingle()

          if (!existing) {
            // Best-effort guard: keep at most 5 active client banners
            const { count } = await supabaseAdmin
              .from('sponsored_banners')
              .select('id', { count: 'exact', head: true })
              .eq('source', 'client_paid')
              .eq('active', true)
              .or(`ends_at.is.null,ends_at.gte.${now.toISOString()}`)

            await supabaseAdmin.from('sponsored_banners').insert({
              user_id:           userId || null,
              source:            'client_paid',
              title:             session.metadata?.banner_title || 'Featured business',
              subtitle:          null,
              business_name:     session.metadata?.banner_name || null,
              image_url:         bannerImage,
              link_url:          bannerLink,
              link_label:        'Learn more',
              // If all 5 slots are already taken, store inactive so an admin
              // can rotate it in — the buyer still paid, nothing is lost.
              active:            (count ?? 0) < 5,
              starts_at:         now.toISOString(),
              ends_at:           expiresAt,
              stripe_session_id: session.id,
            })
          }
        }
        return NextResponse.json({ received: true })
      }

      // ── Fallback : generic one-time boost (legacy checkout routes) ─
      const legacyListingId = session.metadata?.listingId
      const legacyType      = session.metadata?.type
      if (legacyListingId) {
        const days = BOOST_DAYS[legacyType ?? ''] ?? 7
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
        await supabaseAdmin.from('listings').update({
          boosted:          true,
          boosted_at:       new Date().toISOString(),
          boost_expires_at: expiresAt,
          boost_score:      1000,
        }).eq('id', legacyListingId)
      }
    }

    // ── Résiliation abonnement PRO ───────────────────────────────────
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()
      if (profile) {
        await supabaseAdmin.from('profiles').update({ is_pro: false }).eq('id', profile.id)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[stripe/webhook]', error?.message)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
