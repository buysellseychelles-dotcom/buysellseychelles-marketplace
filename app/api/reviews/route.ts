import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPushToUser } from '@/lib/push'
import { rateLimit, getClientIP, tooManyRequests } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  // 3 avis max par heure par IP
  const ip = getClientIP(req)
  const rl = rateLimit(`reviews:${ip}`, 3, 60 * 60 * 1000)
  if (!rl.allowed) return tooManyRequests(rl.resetAt)

  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { sellerId, listingId, rating, comment } = await req.json()
  if (!sellerId || !rating) return NextResponse.json({ error: 'Missing data' }, { status: 400 })
  if (sellerId === user.id) return NextResponse.json({ error: 'You cannot rate yourself' }, { status: 403 })
  if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })

  // Détermine le rôle du correspondant et si l'avis provient d'une transaction réelle.
  // `seller_id` = l'utilisateur noté (peut être un acheteur quand c'est le vendeur qui note).
  let reviewerRole: 'buyer' | 'seller' = 'buyer'
  let verifiedTransaction = false
  if (listingId) {
    const { data: listing } = await supabase
      .from('listings')
      .select('user_id, buyer_id, status')
      .eq('id', listingId)
      .single()
    if (listing) {
      const sold = listing.status === 'sold'
      if (user.id === listing.user_id) {
        // L'auteur de l'avis est le vendeur → il note l'acheteur.
        reviewerRole = 'seller'
        verifiedTransaction = sold && listing.buyer_id === sellerId
      } else {
        // L'auteur est l'acheteur → il note le vendeur.
        reviewerRole = 'buyer'
        verifiedTransaction = sold && listing.user_id === sellerId && listing.buyer_id === user.id
      }
    }
  }

  const { data, error } = await supabase.from('reviews').insert({
    reviewer_id: user.id,
    seller_id: sellerId,
    listing_id: listingId ?? null,
    rating,
    comment: comment?.trim() || null,
    reviewer_role: reviewerRole,
    verified_transaction: verifiedTransaction,
  }).select().single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'You have already left a review for this listing' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Notification in-app — formulée selon le rôle de l'auteur de l'avis.
  const reviewTitle = reviewerRole === 'seller'
    ? `⭐ A seller rated you as a buyer (${rating}/5)`
    : `⭐ You received a new review (${rating}/5)`
  await supabase.from('notifications').insert({
    user_id: sellerId,
    title: reviewTitle,
    body: comment?.trim() ? `"${comment.trim().slice(0, 100)}"` : null,
    link: `/seller/${sellerId}`,
  })

  // Notification push
  await sendPushToUser(sellerId, {
    title: `⭐ New review – ${rating}/5`,
    body: comment?.trim() ? `"${comment.trim().slice(0, 80)}"` : 'You received a new review',
    url: `/seller/${sellerId}`,
  })

  return NextResponse.json({ review: data })
}
