import Stripe from 'stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY

    if (!stripeKey) {
      throw new Error('Missing STRIPE_SECRET_KEY')
    }

    const stripe = new Stripe(stripeKey)

    const { listingId, boostType } = await req.json()

    if (!listingId) {
      return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })
    }

    let price = 500
    if (boostType === 'premium') price = 1000
    if (boostType === 'ultra') price = 2000

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!siteUrl) {
      throw new Error('Missing NEXT_PUBLIC_SITE_URL')
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Boost annonce (${boostType})`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/listing/${listingId}`,
      cancel_url: `${siteUrl}/listing/${listingId}`,
      metadata: { listingId, type: boostType },
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Stripe error' }, { status: 500 })
  }
}