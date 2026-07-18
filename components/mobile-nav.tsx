'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'

const BLUE = '#003F87'

function IcoSearch() {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="22" y2="22" />
    </svg>
  )
}
function IcoHeart({ filled }: { filled: boolean }) {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
function IcoChat({ filled }: { filled: boolean }) {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
function IcoUser({ filled }: { filled: boolean }) {
  return (
    <svg width="27" height="27" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function IcoPlus() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  )
}

export default function MobileNav() {
  const pathname = usePathname()
  const { lang } = useLang()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [unreadMsgs, setUnreadMsgs] = useState(0)

  // Mise à jour immédiate quand des messages sont lus ailleurs (conversations/[id])
  useEffect(() => {
    const refresh = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: convs } = await supabase.from('conversations')
        .select('id').or(`user_id.eq.${user.id},seller_id.eq.${user.id}`)
      const ids = (convs ?? []).map((c: any) => c.id)
      if (ids.length === 0) { setUnreadMsgs(0); return }
      const { count } = await supabase.from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', ids)
        .neq('sender_id', user.id)
        .eq('read', false)
      setUnreadMsgs(count ?? 0)
    }
    window.addEventListener('bss-messages-read', refresh)
    return () => window.removeEventListener('bss-messages-read', refresh)
  }, [])

  useEffect(() => {
    // Un seul canal Realtime à la fois. On garde une référence pour pouvoir le
    // retirer avant d'en recréer un : sans ça, chaque SIGNED_IN (refresh de
    // token, retour d'onglet, navigation…) recréait 'unread-nav' et rajoutait
    // des callbacks .on(postgres_changes) sur un canal DÉJÀ souscrit →
    // "cannot add postgres_changes callbacks for realtime:unread-nav after subscribe()".
    let channel: ReturnType<typeof supabase.channel> | null = null
    // Conversations de l'utilisateur courant, pour filtrer les events du canal
    // Realtime côté client sans requêter la DB à chaque message envoyé par
    // n'importe qui sur le site (voir plus bas).
    let myConvIds = new Set<string>()

    const fetchMsgCount = async (userId: string) => {
      const { data: convs } = await supabase.from('conversations')
        .select('id').or(`user_id.eq.${userId},seller_id.eq.${userId}`)
      myConvIds = new Set((convs ?? []).map((c: any) => c.id))
      if (myConvIds.size === 0) return 0
      const { count } = await supabase.from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', [...myConvIds])
        .neq('sender_id', userId)
        .eq('read', false)
      return count ?? 0
    }

    const teardownChannel = () => {
      // Retire le canal suivi + tout résidu portant le même topic (remount, StrictMode…).
      if (channel) { supabase.removeChannel(channel); channel = null }
      supabase.getChannels()
        .filter(c => c.topic === 'realtime:unread-nav')
        .forEach(c => supabase.removeChannel(c))
    }

    const setup = async (userId: string) => {
      setUnreadMsgs(await fetchMsgCount(userId))

      // On repart toujours d'un canal propre avant de souscrire.
      teardownChannel()
      // Le plan Supabase gratuit n'a que 15 connexions simultanées : avant,
      // CHAQUE message créé par N'IMPORTE QUEL utilisateur du site déclenchait
      // une re-requête DB pour TOUS les clients connectés (canal 'messages'
      // sans filtre). On incrémente désormais le compteur localement (le
      // message est déjà là dans le payload) — la décrémentation se fait via
      // l'event 'bss-messages-read' (déclenché par mes propres actions de lecture).
      channel = supabase.channel('unread-nav')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const msg = payload.new as { conversation_id: string; sender_id: string }
          if (msg.sender_id !== userId && myConvIds.has(msg.conversation_id)) {
            setUnreadMsgs(n => n + 1)
          }
        })
        .subscribe()
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setIsLoggedIn(!!u)
      if (!u) { setUnreadMsgs(0); teardownChannel(); return }
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') setup(u.id)
    })

    return () => { subscription.unsubscribe(); teardownChannel() }
  }, [])

  if (pathname?.startsWith('/auth') || pathname === '/login') return null

  const isHome    = pathname === '/'
  const isSaved   = pathname?.startsWith('/favorites')
  const isChat    = pathname?.startsWith('/conversations')
  const isMe      = pathname?.startsWith('/dashboard') || pathname?.startsWith('/my-listings')

  const NavItem = ({ active, children, label, href, badge }: {
    active: boolean; children: React.ReactNode; label: string; href: string; badge?: number
  }) => (
    <Link href={href} className="relative flex flex-col items-center justify-center gap-1.5 flex-1 py-2.5"
      style={{ color: active ? BLUE : '#9ca3af' }}>
      <div className="relative">
        {children}
        {badge && badge > 0 ? (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center leading-none">
            {badge > 9 ? '9+' : badge}
          </span>
        ) : null}
      </div>
      <span className="text-[13px] font-semibold leading-none">{label}</span>
      {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ backgroundColor: BLUE }} />}
    </Link>
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center md:hidden z-50"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))', minHeight: '74px' }}>

      <NavItem href="/" active={isHome} label={t(lang, 'nav_home')}>
        <IcoSearch />
      </NavItem>

      <NavItem href={isLoggedIn ? '/favorites' : '/login'} active={isSaved} label={t(lang, 'nav_saved')}>
        <IcoHeart filled={isSaved} />
      </NavItem>

      {/* Post — central elevated */}
      <Link href="/post-ad" className="flex flex-col items-center justify-center flex-shrink-0 mx-2">
        <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg -mt-5"
          style={{ backgroundColor: BLUE }}>
          <IcoPlus />
        </div>
      </Link>

      <NavItem href={isLoggedIn ? '/conversations' : '/login'} active={isChat} label={t(lang, 'messages')} badge={unreadMsgs}>
        <IcoChat filled={isChat} />
      </NavItem>

      <NavItem href={isLoggedIn ? '/dashboard' : '/login'} active={isMe} label={t(lang, 'nav_me')}>
        <IcoUser filled={isMe} />
      </NavItem>

    </nav>
  )
}
