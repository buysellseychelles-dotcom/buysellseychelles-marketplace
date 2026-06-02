import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function MyListingsPage() {

  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user) return notFound()

  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, price, location, boosted, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-md mx-auto p-3 pb-20">

      {/* TITRE SIMPLE */}
      <h1 className="text-lg font-bold mb-3">
        📦 Mes annonces
      </h1>

      {/* LISTE */}
      <div className="space-y-2">

        {listings?.length === 0 && (
          <p className="text-sm text-gray-500">
            Aucune annonce pour le moment
          </p>
        )}

        {listings?.map((item: any) => (
          <div
            key={item.id}
            className="border rounded p-3"
          >

            <Link href={`/listing/${item.id}`}>
              <p className="font-medium text-sm">
                {item.title}
              </p>

              <p className="text-xs text-gray-500">
                📍 {item.location || 'Seychelles'}
              </p>

              <p className="text-green-600 font-bold text-sm mt-1">
                {item.price} €
              </p>
            </Link>

            {/* BADGE BOOST */}
            {item.boosted && (
              <p className="text-xs text-green-500 mt-1">
                🚀 Boost actif
              </p>
            )}

            {/* ACTIONS */}
            <div className="flex gap-3 mt-2 text-xs">

              <Link
                href={`/listing/${item.id}`}
                className="text-blue-500"
              >
                Voir
              </Link>

              <form action={`/api/listings/delete`} method="POST">
                <input type="hidden" name="id" value={item.id} />
                <button className="text-red-500">
                  Supprimer
                </button>
              </form>

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}