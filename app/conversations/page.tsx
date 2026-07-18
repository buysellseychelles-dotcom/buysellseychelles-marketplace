'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'
import { markAllNotificationsRead } from '@/lib/mark-notifs-read'

type Conversation = {
  id: string
  listing_id: string
  user_id: string
  seller_id: string
  last_message: string
  updated_at: string
  listing?: { title: string } | null
  other_id?: string
}

export default function ConversationsPage() {
  const router = useRouter()
  const { lang } = useLang()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [unreadByConv, setUnreadByConv] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  // Mes ids de conversation connus, pour filtrer côté client les events du
  // canal Realtime 'messages' (non filtrable côté serveur par participant)
  // sans requêter la DB pour les messages d'autres conversations.
  const convIdsRef = useRef<Set<string>>(new Set())

  const loadAll = async (uid: string) => {
    const { data } = await supabase
      .from('conversations')
      .select('id, listing_id, user_id, seller_id, last_message, updated_at, hidden_by_user, hidden_by_seller')
      .or(`user_id.eq.${uid},seller_id.eq.${uid}`)
      .order('updated_at', { ascending: false })

    if (!data) { setLoading(false); return }

    // Exclut les conversations que CET utilisateur a masquées de sa liste.
    const visible = data.filter((conv: any) =>
      conv.user_id === uid ? !conv.hidden_by_user : !conv.hidden_by_seller
    )

    // Un seul aller-retour pour tous les titres d'annonces (au lieu d'une
    // requête par conversation) — le plan gratuit Supabase n'a que 15
    // connexions simultanées, une conversation par requête les épuisait vite.
    const listingIds = [...new Set(visible.map((c: any) => c.listing_id))]
    const { data: listings } = listingIds.length
      ? await supabase.from('listings').select('id, title').in('id', listingIds)
      : { data: [] as { id: string; title: string }[] }
    const titleById = new Map((listings ?? []).map((l: any) => [l.id, l.title]))

    setConversations(visible.map((conv: any) => ({
      ...conv,
      listing: titleById.has(conv.listing_id) ? { title: titleById.get(conv.listing_id) } : null,
      other_id: conv.user_id === uid ? conv.seller_id : conv.user_id,
    })))

    // Unread count per conversation — restreint à MES conversations (avant,
    // la requête sans filtre conversation_id ramenait les messages non lus
    // de tout le site).
    const convIds = visible.map((c: any) => c.id)
    convIdsRef.current = new Set(convIds)
    const { data: unread } = convIds.length
      ? await supabase.from('messages').select('conversation_id').in('conversation_id', convIds).neq('sender_id', uid).eq('read', false)
      : { data: [] as { conversation_id: string }[] }

    const counts: Record<string, number> = {}
    for (const msg of unread ?? []) {
      counts[msg.conversation_id] = (counts[msg.conversation_id] || 0) + 1
    }
    setUnreadByConv(counts)
    setLoading(false)
  }

  useEffect(() => {
    let uid: string | null = null

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      uid = user.id
      setUserId(user.id)
      await loadAll(user.id)
      // Visiter la liste des conversations vaut visite de /notifications :
      // la pastille de la cloche disparaît (mais pas celle des messages).
      await markAllNotificationsRead(user.id)

      // Le plan Supabase gratuit n'a que 15 connexions simultanées : avant,
      // une conversation ou un message créé par N'IMPORTE QUI sur le site
      // déclenchait un loadAll() complet pour TOUS les clients ayant cette
      // page ouverte (canaux sans filtre). 'conversations' se filtre
      // côté serveur (participant = moi) ; 'messages' n'a pas de colonne
      // participant, donc on filtre côté client via mes ids de conversation
      // déjà connus (convIdsRef), sans requêter la DB pour le reste.
      const channel = supabase
        .channel('conversations-list')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `user_id=eq.${user.id}` }, () => uid && loadAll(uid))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `seller_id=eq.${user.id}` }, () => uid && loadAll(uid))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
          const convId = (payload.new as any)?.conversation_id ?? (payload.old as any)?.conversation_id
          if (uid && convId && convIdsRef.current.has(convId)) loadAll(uid)
        })
        .subscribe()

      const onRead = (e: Event) => {
        // Efface immédiatement la pastille de la conversation lue (sans attendre
        // l'aller-retour serveur), puis recharge pour rester exact.
        const convId = (e as CustomEvent).detail?.conversationId
        if (convId) {
          setUnreadByConv(prev => {
            if (!prev[convId]) return prev
            const next = { ...prev }
            delete next[convId]
            return next
          })
        }
        if (uid) loadAll(uid)
      }
      window.addEventListener('bss-messages-read', onRead)

      return () => {
        supabase.removeChannel(channel)
        window.removeEventListener('bss-messages-read', onRead)
      }
    }

    const cleanup = init()
    return () => { cleanup.then(fn => fn?.()) }
  }, [router])

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!userId || deletingId) return
    if (!window.confirm(t(lang, 'delete_conversation_confirm'))) return

    setDeletingId(convId)
    const res = await fetch('/api/conversations/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: convId, userId }),
    }).catch(() => null)

    if (res?.ok) {
      setConversations(prev => prev.filter(c => c.id !== convId))
      setUnreadByConv(prev => {
        const next = { ...prev }
        delete next[convId]
        return next
      })
      // Met à jour les pastilles du header / nav.
      window.dispatchEvent(new CustomEvent('bss-messages-read', { detail: { conversationId: convId } }))
    } else {
      alert(lang === 'kr' ? 'Pa kapab efase. Eseye ankor.' : 'Could not delete. Please try again.')
    }
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-4">
      <div className="px-4 py-4 border-b border-gray-100 bg-white sticky top-14 z-10 flex items-center gap-2">
        <h1 className="text-lg font-bold">{lang === 'kr' ? 'Mesaz' : 'Messages'}</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20 px-4">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-gray-500 font-medium">No conversations yet</p>
          <p className="text-gray-400 text-sm mt-1">Contact a seller from a listing to get started</p>
          <button onClick={() => router.back()} className="mt-4 inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
            Back
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {conversations.map((conv) => {
            const unread = unreadByConv[conv.id] ?? 0
            const isRecent = new Date(conv.updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            const initials = (conv.other_id ?? '?')[0].toUpperCase()

            return (
              <div key={conv.id} className="flex items-center bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <Link
                  href={`/conversations/${conv.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 flex-1 min-w-0"
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shrink-0 relative">
                    {initials}
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                      {conv.listing?.title ?? 'Listing deleted'}
                    </p>
                    {/* "New message" seulement si non lu ; sinon aperçu du dernier message. */}
                    {unread > 0 ? (
                      <p className="text-sm truncate font-semibold" style={{ color: '#003F87' }}>
                        {t(lang, 'new_message')}
                      </p>
                    ) : conv.last_message ? (
                      <p className="text-sm truncate text-gray-500">{conv.last_message}</p>
                    ) : null}
                  </div>

                  {/* Heure + badge */}
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="text-xs text-gray-400">
                      {isRecent
                        ? new Date(conv.updated_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
                        : new Date(conv.updated_at).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                    </p>
                    {unread > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Suppression manuelle de la conversation */}
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  disabled={deletingId === conv.id}
                  aria-label={t(lang, 'delete_conversation')}
                  title={t(lang, 'delete_conversation')}
                  className="shrink-0 mr-2 w-9 h-9 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deletingId === conv.id ? (
                    <span className="text-xs">…</span>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
