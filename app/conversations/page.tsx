import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ConversationsPage() {

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id,
      listing_id,
      user_id,
      seller_id,
      last_message,
      updated_at
    `)
    .order('updated_at', { ascending: false })

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')

  const getUser = (id: string) => {
    return profiles?.find(p => p.id === id)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Messages
      </h1>

      <div className="space-y-3">

        {conversations?.map((conv) => {

          const user = getUser(conv.user_id)

          return (
            <Link
              key={conv.id}
              href={`/listing/${conv.listing_id}`}
              className="flex items-center gap-3 border p-3 rounded hover:shadow"
            >

              {/* AVATAR */}
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <span>👤</span>
                )}
              </div>

              {/* INFOS */}
              <div className="flex-1">

                <p className="font-bold">
                  {user?.full_name || "Utilisateur"}
                </p>

                <p className="text-sm text-gray-600 truncate">
                  {conv.last_message || "Nouveau message"}
                </p>

              </div>

              <div className="text-xs text-gray-400">
                {new Date(conv.updated_at).toLocaleDateString()}
              </div>

            </Link>
          )
        })}

      </div>

    </div>
  )
}