import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ReportsPage() {

  const { data: reports } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-4">

      <h1 className="text-2xl font-bold mb-4">
        🚨 Signalements
      </h1>

      <div className="space-y-3">

        {reports?.map((r: any) => (
          <div key={r.id} className="border p-3 rounded">

            <p>Listing ID: {r.listing_id}</p>
            <p>Motif: {r.reason}</p>
            <p className="text-sm text-gray-500">
              {new Date(r.created_at).toLocaleString()}
            </p>

            <Link
              href={`/listing/${r.listing_id}`}
              className="text-blue-500 text-sm"
            >
              Voir annonce
            </Link>

          </div>
        ))}

      </div>

    </div>
  )
}