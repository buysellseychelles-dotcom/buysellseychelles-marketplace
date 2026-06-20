import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getUser(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

// Créer une alerte
export async function POST(req: Request) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { label, keywords, category, island, max_price } = await req.json()
  if (!label) return NextResponse.json({ error: 'Label required' }, { status: 400 })

  const { data, error } = await supabase.from('search_alerts').insert({
    user_id: user.id, label, keywords: keywords || null,
    category: category || null, island: island || null,
    max_price: max_price || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ alert: data })
}

// Supprimer une alerte
export async function DELETE(req: Request) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { id } = await req.json()
  await supabase.from('search_alerts').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
