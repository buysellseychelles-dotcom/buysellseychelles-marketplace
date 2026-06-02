'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function NotificationsPage() {

  const [notifs, setNotifs] = useState<any[]>([])

  useEffect(() => {

    const load = async () => {

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setNotifs(data || [])
    }

    load()

  }, [])

  return (
    <div className="max-w-2xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-4">
        🔔 Notifications
      </h1>

      <div className="space-y-3">

        {notifs.map((n) => (
          <div
            key={n.id}
            className="border p-3 rounded"
          >
            <p className="font-bold">{n.title}</p>
            <p className="text-sm text-gray-500">{n.body}</p>
          </div>
        ))}

      </div>

    </div>
  )
}