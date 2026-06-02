import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default async function TrendingPage() {

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .order('score', { ascending: false })
    .limit(20)

  return (
    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        🔥 Tendances du moment
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {listings?.map((listing) => (
          <Link
            key={listing.id}
            href={`/listing/${listing.id}`}
            className="border rounded p-4 hover:shadow"
          >

            {listing.boosted && (
              <div className="mb-2 text-green-600 font-semibold">
                🚀 Boosté
              </div>
            )}

            <h2 className="font-bold text-lg">
              {listing.title}
            </h2>

            <p className="text-gray-600">
              💰 {listing.dynamic_price || listing.price} €
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Score : {listing.score || 0}
            </p>

          </Link>
        ))}

      </div>

    </div>
  )
}