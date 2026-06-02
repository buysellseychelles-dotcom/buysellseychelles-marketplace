import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {

  const session = await stripe.checkout.sessions.create({

    payment_method_types: ['card'],

    line_items: [
      {
        price_data: {
          currency: 'eur',

          product_data: {
            name: 'Abonnement PRO Marketplace',
          },

          unit_amount: 999, // 9,99€
          recurring: {
            interval: 'month'
          }
        },

        quantity: 1,
      },
    ],

    mode: 'subscription',

    success_url: 'http://localhost:3000/success-pro',
    cancel_url: 'http://localhost:3000/cancel',
  })

  return Response.json({
    url: session.url,
  })
}