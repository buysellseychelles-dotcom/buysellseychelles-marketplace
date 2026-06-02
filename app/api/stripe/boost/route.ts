import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {

  try {
    const { listingId, boostType } = await req.json()

    if (!listingId) {
      return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })
    }

    let price = 500 // standard 5€

    if (boostType === 'premium') price = 1000
    if (boostType === 'ultra') price = 2000

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

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/listing/${listingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/listing/${listingId}`,

      metadata: {
        listingId,
        type: boostType,
      },
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Stripe error' }, { status: 500 })
  }
}