import { rateLimit, getClientIP, tooManyRequests } from '@/lib/rate-limit'

export async function POST(req: Request) {
  // 20 appels IA max par heure par IP
  const ip = getClientIP(req)
  const rl = rateLimit(`ai-quality:${ip}`, 20, 60 * 60 * 1000)
  if (!rl.allowed) return tooManyRequests(rl.resetAt)

  const body = await req.json()

  const { title, description, price } = body

  // 🧠 LOGIQUE SIMPLE (IA simulée)
  let score = 50

  if (title.length > 10) score += 10
  if (description.length > 30) score += 20
  if (price > 0) score += 10

  if (title.toLowerCase().includes('urgent')) score += 10
  if (title.toLowerCase().includes('new')) score += 10

  if (score > 100) score = 100

  return Response.json({
    quality_score: score,
    tips: [
      score < 70 ? "Add more details" : "Good listing",
      "Add photos for +30% more sales",
      "Use 'urgent' to boost visibility"
    ]
  })
}