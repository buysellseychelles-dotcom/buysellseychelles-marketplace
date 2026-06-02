import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { title } = await req.json()

    // 🔔 récupérer tous les abonnés push
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')

    if (!subs || subs.length === 0) {
      return NextResponse.json({ ok: true })
    }

    const payload = JSON.stringify({
      title: 'Nouvelle annonce',
      body: title,
    })

    // ⚡ envoi simple (sans dépendance complexe)
    await Promise.all(
      subs.map(async (sub: any) => {
        try {
          await fetch(sub.subscription.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: payload,
          })
        } catch (e) {
          // ignore erreurs push
        }
      })
    )

    return NextResponse.json({ ok: true })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'push failed' }, { status: 500 })
  }
}