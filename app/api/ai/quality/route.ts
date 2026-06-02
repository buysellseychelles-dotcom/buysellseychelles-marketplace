export async function POST(req: Request) {

  const body = await req.json()

  const { title, description, price } = body

  // 🧠 LOGIQUE SIMPLE (IA simulée)
  let score = 50

  if (title.length > 10) score += 10
  if (description.length > 30) score += 20
  if (price > 0) score += 10

  if (title.toLowerCase().includes('urgent')) score += 10
  if (title.toLowerCase().includes('neuf')) score += 10

  if (score > 100) score = 100

  return Response.json({
    quality_score: score,
    tips: [
      score < 70 ? "Ajoute plus de détails" : "Bonne annonce",
      "Ajoute des photos pour +30% de ventes",
      "Utilise 'urgent' pour booster la visibilité"
    ]
  })
}