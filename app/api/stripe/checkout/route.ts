import Stripe from 'stripe'
import { NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export async function POST(req: Request) {
  try {
    const { listingId } = await req.json()

    if (!listingId) {
      return NextResponse.json(
        { error: 'Missing listingId' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],

      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Boost annonce ⭐ (7 jours)',
              description: 'Mise en avant premium',
            },
            unit_amount: 500,
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/listing/${listingId}?boost=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/listing/${listingId}?boost=canceled`,

      metadata: {
        listingId,
        type: 'boost',
      },
    })

    return NextResponse.json({ url: session.url })

  } catch (err) {
    console.error(err)

    return NextResponse.json(
      { error: 'Stripe error' },
      { status: 500 }
    )
  }
}