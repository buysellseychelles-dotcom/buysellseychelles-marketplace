import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_ANON_KEY!
)

export default async function FavoritesPage() {

  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user) {
    return <div className="p-10">Connecte-toi</div>
  }

  const { data: favs } = await supabase
    .from('favorites')
    .select(`
      listing_id,
      listings (
        id,
        title,
        price
      )
    `)
    .eq('user_id', user.id)

  return (
    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Mes favoris
      </h1>

      <div className="space-y-3">

        {favs?.map((fav: any) => (
          <Link
            key={fav.listing_id}
            href={`/listing/${fav.listing_id}`}
            className="border p-3 rounded block hover:shadow"
          >
            <p className="font-bold">
              {fav.listings?.title}
            </p>

            <p className="text-gray-600">
              {fav.listings?.price} €
            </p>

          </Link>
        ))}

      </div>

    </div>
  )
}