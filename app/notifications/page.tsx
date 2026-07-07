'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'
import { markAllNotificationsRead } from '@/lib/mark-notifs-read'

type Notif = { id: string; title: string; body: string; read: boolean; created_at: string; link?: string }

export default function NotificationsPage() {
  const router = useRouter()
  const { lang } = useLang()
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('notifications').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(50)

      setNotifs(data ?? [])
      setLoading(false)

      if (data && data.length > 0) {
        await markAllNotificationsRead(user.id)
      }
    }
    load()
  }, [router])

  const unread = notifs.filter(n => !n.read).length

  if (loading) return (
    <div className="max-w-2xl mx-auto p-4 space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto pb-4">
      <div className="bg-black text-white px-4 py-5">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-400 mb-3 hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
          Back
        </button>
        <h1 className="text-xl font-bold">🔔 {t(lang, 'notif_title')}</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {unread > 0 ? `${unread} ${t(lang, 'notif_unread')}` : t(lang, 'notif_all_read')}
        </p>
      </div>

      <div className="px-4 pt-4">
        {notifs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-gray-500 text-sm">{t(lang, 'no_notifs')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map(n => {
              const content = (
                <div className={`bg-white rounded-2xl border p-4 transition-colors ${!n.read ? 'border-black/20 bg-gray-50' : 'border-gray-100'}`}>
                  <div className="flex gap-3 items-start">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-black' : 'bg-gray-200'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                      {n.body && <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>}
                      <p className="text-xs text-gray-400 mt-1.5">
                        {new Date(n.created_at).toLocaleDateString('en', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              )
              return n.link ? <Link key={n.id} href={n.link}>{content}</Link> : <div key={n.id}>{content}</div>
            })}
          </div>
        )}
      </div>
    </div>
  )
}
