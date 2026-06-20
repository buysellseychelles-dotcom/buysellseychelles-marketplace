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

    // Prix en centimes de SCR (SCR = devise à 2 décimales : 75 SCR = 7500)
    let price = 7500
    if (boostType === 'premium') price = 15000
    if (boostType === 'ultra') price = 30000

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
            currency: 'scr',
            product_data: {
              name: `Listing boost (${boostType})`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/success?listingId=${listingId}&boostType=${boostType}`,
      cancel_url: `${siteUrl}/cancel?listingId=${listingId}`,
      metadata: { listingId, type: boostType },
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Stripe error' }, { status: 500 })
  }
}