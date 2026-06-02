import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function MessagesPage() {

  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      id,
      message,
      created_at,
      listing_id,
      sender_id
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.log(error)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Messages
      </h1>

      <div className="space-y-3">

        {messages?.length === 0 && (
          <p>Aucun message</p>
        )}

        {messages?.map((msg) => (
          <Link
            key={msg.id}
            href={`/listing/${msg.listing_id}`}
            className="border p-3 rounded block hover:shadow"
          >

            <p className="text-sm text-gray-500">
              📅 {new Date(msg.created_at).toLocaleString()}
            </p>

            <p className="font-bold">
              Message :
            </p>

            <p className="text-gray-700">
              {msg.message}
            </p>

          </Link>
        ))}

      </div>

    </div>
  )
}