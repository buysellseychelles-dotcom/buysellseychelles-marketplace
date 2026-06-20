import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://buysellseychelles.com'

// Max paid client banners that can run on the home page at the same time
const MAX_CLIENT_BANNERS = 5

// All paid products — prices in SCR cents (SCR is a 2-decimal currency, so 75 SCR = 7500).
// SCR is natively supported by Stripe as a presentment currency for card payments.
export const STRIPE_PRODUCTS: Record<string, {
  name: string; description: string; amount: number; currency: string
}> = {
  boost_basic: {
    name: '🚀 Basic Boost — 7 days',
    description: 'Your listing highlighted in search results for 7 days (up to 5× more views)',
    amount: 7500, currency: 'scr',
  },
  boost_featured: {
    name: '⭐ Featured Boost — 14 days',
    description: 'Top position in your category + Featured badge for 14 days',
    amount: 15000, currency: 'scr',
  },
  boost_premium: {
    name: '🏆 Premium Boost — 30 days',
    description: 'Homepage banner + top position in category for 30 days',
    amount: 30000, currency: 'scr',
  },
  photo_pack: {
    name: '📸 Extra Photos Pack',
    description: 'Add up to 10 photos to your listing (instead of 3 free)',
    amount: 3000, currency: 'scr',
  },
  banner_7: {
    name: '📢 Homepage Banner — 7 days',
    description: 'Your custom banner in the home page carousel for 7 days',
    amount: 15000, currency: 'scr',
  },
  banner_14: {
    name: '📢 Homepage Banner — 14 days',
    description: 'Your custom banner in the home page carousel for 14 days',
    amount: 30000, currency: 'scr',
  },
  banner_30: {
    name: '📢 Homepage Banner — 30 days',
    description: 'Your custom banner in the home page carousel for 30 days',
    amount: 45000, currency: 'scr',
  },
}

export async function POST(req: Request) {
  try {
    const { product, user_id, listing_id, next, banner } = await req.json()

    if (!product || !user_id) {
      return NextResponse.json({ error: 'Missing product or user_id' }, { status: 400 })
    }

    const config = STRIPE_PRODUCTS[product]
    if (!config) {
      return NextResponse.json({ error: `Unknown product: ${product}` }, { status: 400 })
    }

    // Verify user
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user_id)
    if (!userData?.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // ── Self-serve banner ad (image + link uploaded on /advertise) ──────
    const isSelfServeBanner = product.startsWith('banner_') && banner?.image_url
    if (isSelfServeBanner) {
      if (!banner.link_url) {
        return NextResponse.json({ error: 'Missing banner link URL' }, { status: 400 })
      }
      // Enforce max 5 active client banners simultaneously
      const nowIso = new Date().toISOString()
      const { count } = await supabaseAdmin
        .from('sponsored_banners')
        .select('id', { count: 'exact', head: true })
        .eq('source', 'client_paid')
        .eq('active', true)
        .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
      if ((count ?? 0) >= MAX_CLIENT_BANNERS) {
        return NextResponse.json({
          error: 'All banner slots are currently taken. Please try again in a few days.',
          slots_full: true,
        }, { status: 409 })
      }
    }

    const successUrl = `${SITE_URL}/success?product=${product}${listing_id ? `&listing_id=${listing_id}` : ''}${next ? `&next=${encodeURIComponent(next)}` : ''}`
    const cancelUrl  = `${SITE_URL}/cancel${listing_id ? `?listing_id=${listing_id}` : ''}`

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: userData.user.email,
      line_items: [{
        price_data: {
          currency: config.currency,
          product_data: { name: config.name, description: config.description },
          unit_amount: config.amount,
        },
        quantity: 1,
      }],
      metadata: {
        product,
        user_id,
        listing_id: listing_id ?? '',
        // Banner content — read back by the webhook once payment is confirmed.
        // Stripe caps each metadata value at 500 chars.
        ...(isSelfServeBanner ? {
          banner_image: String(banner.image_url).slice(0, 500),
          banner_link:  String(banner.link_url).slice(0, 500),
          banner_name:  String(banner.business_name ?? '').slice(0, 200),
          banner_title: String(banner.title ?? '').slice(0, 200),
        } : {}),
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[stripe/checkout]', err?.message)
    return NextResponse.json({ error: 'Stripe error' }, { status: 500 })
  }
}
