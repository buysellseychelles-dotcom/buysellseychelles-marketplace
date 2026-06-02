export async function POST(req: Request) {

  const body = await req.json()

  const { title, description, price } = body

  // 👉 VERSION SIMPLE (sans OpenAI pour éviter complexité)
  const optimizedTitle = `🔥 ${title} - Bonne affaire`
  const optimizedDescription =
    `${description}\n\n✔ Produit vérifié\n✔ Prix négociable\n✔ Disponible immédiatement`

  const suggestedPrice = Math.round(price * 0.95)

  return Response.json({
    ai_title: optimizedTitle,
    ai_description: optimizedDescription,
    suggested_price: suggestedPrice
  })
}