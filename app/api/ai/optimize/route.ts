import { rateLimit, getClientIP, tooManyRequests } from '@/lib/rate-limit'

export async function POST(req: Request) {
  // 20 appels IA max par heure par IP
  const ip = getClientIP(req)
  const rl = rateLimit(`ai-optimize:${ip}`, 20, 60 * 60 * 1000)
  if (!rl.allowed) return tooManyRequests(rl.resetAt)

  const body = await req.json()

  const { title, description, price } = body

  // 👉 VERSION SIMPLE (sans OpenAI pour éviter complexité)
  const optimizedTitle = `🔥 ${title} - Great deal`
  const optimizedDescription =
    `${description}\n\n✔ Verified product\n✔ Price negotiable\n✔ Available immediately`

  const suggestedPrice = Math.round(price * 0.95)

  return Response.json({
    ai_title: optimizedTitle,
    ai_description: optimizedDescription,
    suggested_price: suggestedPrice
  })
}