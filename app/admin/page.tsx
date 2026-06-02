import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function AdminPage() {

  const { data: listings } = await supabase
    .from('listings')
    .select('id,title,price,boosted,created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const deleteListing = async (id: string) => {
    'use server'

    await supabase
      .from('listings')
      .delete()
      .eq('id', id)
  }

  return (
    <div className="max-w-5xl mx-auto p-4">

      <h1 className="text-2xl font-bold mb-4">
        🛠 Admin - Modération annonces
      </h1>

      <div className="space-y-3">

        {listings?.map((item: any) => (
          <div
            key={item.id}
            className="border p-3 rounded flex justify-between items-center"
          >

            <div>
              <p className="font-semibold">{item.title}</p>

              <p className="text-sm text-gray-500">
                💰 {item.price} € • {item.boosted ? '🚀 Boosté' : 'Normal'}
              </p>
            </div>

            <div className="flex gap-3">

              <Link
                href={`/listing/${item.id}`}
                className="text-blue-500 text-sm"
              >
                Voir
              </Link>

              <form action={deleteListing.bind(null, item.id)}>
                <button className="text-red-500 text-sm">
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