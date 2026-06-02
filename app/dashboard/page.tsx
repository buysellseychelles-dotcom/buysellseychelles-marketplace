import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function DashboardPage() {

  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user) {
    return <div className="p-4">Connexion requise</div>
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('id,title,price,boosted,views_count,clicks_count,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-4">

      <h1 className="text-2xl font-bold mb-4">
        📊 Mon dashboard
      </h1>

      <div className="grid gap-3">

        {listings?.map((item: any) => (
          <div key={item.id} className="border p-3 rounded">

            <Link href={`/listing/${item.id}`}>
              <h2 className="font-semibold">{item.title}</h2>
            </Link>

            <p className="text-sm text-gray-500">
              💰 {item.price} €
            </p>

            <div className="flex gap-4 text-sm mt-2">

              <span>👁 {item.views_count || 0}</span>
              <span>🖱 {item.clicks_count || 0}</span>

              {item.boosted && (
                <span className="text-green-600">
                  🚀 Boost actif
                </span>
              )}

            </div>

          </div>
        ))}

      </div>

    </div>
  )
}