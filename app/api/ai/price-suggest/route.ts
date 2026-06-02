import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  const body = await req.json()

  const { title, category } = body

  // 🔍 on récupère annonces similaires
  const { data: listings } = await supabase
    .from('listings')
    .select('price')
    .eq('category', category)

  if (!listings || listings.length === 0) {
    return Response.json({
      suggested_price: 100
    })
  }

  const avg =
    listings.reduce((sum, l) => sum + l.price, 0) / listings.length

  // 🔥 optimisation IA simple
  const suggested_price = Math.round(avg * 0.95)

  return Response.json({
    suggested_price
  })
}