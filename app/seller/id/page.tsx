import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function SellerPage({
  params
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params

  const { data: seller } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('seller_id', id)
    .order('created_at', { ascending: false })

  const average =
    reviews?.length
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0)
          / reviews.length
        ).toFixed(1)
      : '0'

  return (
    <div className="max-w-3xl mx-auto p-6">

      {/* SELLER */}
      <div className="border p-4 rounded mb-6">

        <h1 className="text-3xl font-bold">
          {seller?.full_name || 'Vendeur'}
        </h1>

        <p className="text-yellow-500 text-xl mt-2">
          ⭐ {average}/5
        </p>

        <p className="text-sm text-gray-500">
          {reviews?.length || 0} avis
        </p>

      </div>

      {/* REVIEWS */}
      <div className="space-y-4">

        {reviews?.map((review) => (
          <div
            key={review.id}
            className="border p-4 rounded"
          >

            <p className="text-yellow-500">
              {'⭐'.repeat(review.rating)}
            </p>

            <p className="mt-2">
              {review.comment}
            </p>

          </div>
        ))}

      </div>

    </div>
  )
}