import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'scr',
            product_data: {
              name: 'PRO Subscription — BuySellSeychelles',
              description: 'PRO badge + monthly boost + priority in search results',
            },
            unit_amount: 23000, // 230 SCR/mois (SCR = devise à 2 décimales)
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/success-pro`,
      cancel_url: `${siteUrl}/subscription`,
      metadata: { userId: user.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Stripe error' }, { status: 500 })
  }
}
