import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

// ⚠️ Client Supabase (server-safe)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { page?: string; category?: string }
}) {
  const page = Number(searchParams?.page ?? 1)
  const limit = 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  const category = searchParams?.category ?? ''
  const now = new Date()

  let query = supabase
    .from('listings')
    .select(`
      id,
      title,
      price,
      location,
      boosted,
      boost_expires_at,
      rank_score,
      created_at,
      listing_images(image_url)
    `)
    .order('rank_score', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('Supabase error:', error)
  }

  const listings = (data ?? []).filter((item: any) => {
    if (!item.boosted) return true
    if (!item.boost_expires_at) return true
    return new Date(item.boost_expires_at) > now
  })

  return (
    <div className="max-w-md mx-auto p-2 pb-20">

      <h1 className="text-lg font-bold mb-3">
        🛒 Annonces Seychelles
      </h1>

      {/* FILTRE */}
      <form className="mb-3" method="GET">
        <select
          name="category"
          defaultValue={category}
          className="border p-2 w-full rounded text-sm"
        >
          <option value="">Toutes catégories</option>
          <option value="voiture">Voitures</option>
          <option value="immobilier">Immobilier</option>
          <option value="electronique">Électronique</option>
          <option value="autre">Autre</option>
        </select>

        <button
          type="submit"
          className="mt-2 w-full bg-black text-white p-2 rounded text-sm"
        >
          Filtrer
        </button>
      </form>

      {/* LISTE */}
      <div className="space-y-1">

        {listings.length === 0 && (
          <p className="text-sm text-gray-500">
            Aucune annonce disponible
          </p>
        )}

        {listings.map((item: any) => {
          const image = item.listing_images?.[0]?.image_url

          return (
            <Link
              key={item.id}
              href={`/listing/${item.id}`}
              className="flex gap-3 border-b p-3 active:bg-gray-50"
            >

              {/* IMAGE */}
              <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                {image ? (
                  <Image
                    src={image}
                    alt="photo"
                    width={60}
                    height={60}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-xs text-gray-400">📷</span>
                )}
              </div>

              {/* TEXTE */}
              <div className="flex-1">
                <p className="text-sm font-medium line-clamp-1">
                  {item.title}
                </p>

                <p className="text-xs text-gray-500">
                  📍 {item.location || 'Seychelles'}
                </p>
              </div>

              {/* PRIX */}
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">
                  {item.price} €
                </p>

                {item.boosted && (
                  <p className="text-[10px] text-green-500">
                    🚀
                  </p>
                )}
              </div>

            </Link>
          )
        })}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between mt-4 text-sm">

        {page > 1 ? (
          <Link href={`/?page=${page - 1}&category=${category}`}>
            ← Précédent
          </Link>
        ) : (
          <span />
        )}

        <Link href={`/?page=${page + 1}&category=${category}`}>
          Suivant →
        </Link>

      </div>

    </div>
  )
}