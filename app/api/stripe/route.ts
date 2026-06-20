import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {

  const body = await req.json()

  const listingId = body.listingId

  const session = await stripe.checkout.sessions.create({

    payment_method_types: ['card'],

    line_items: [
      {
        price_data: {
          currency: 'scr',

          product_data: {
            name: body.title || 'Listing boost',
          },

          unit_amount: body.amount || 7500,
        },

        quantity: 1,
      },
    ],

    mode: 'payment',

    metadata: {
      listingId
    },

    success_url: `http://localhost:3000/success?listing=${listingId}`,

    cancel_url: 'http://localhost:3000/cancel',
  })

  return Response.json({
    url: session.url,
  })
}