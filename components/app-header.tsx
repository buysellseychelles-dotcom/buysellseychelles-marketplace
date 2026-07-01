'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'
import BrandLogo from '@/components/brand-logo'

const GRADIENT = 'linear-gradient(90deg, #003F87 0%, #003F87 15%, #FCD116 42%, #BE0027 68%, #007A3D 100%)'

export default function AppHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { lang, setLang } = useLang()
  const [user, setUser]             = useState<User | null>(null)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [unread, setUnread]         = useState(0)
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [avatarUrl, setAvatarUrl]   = useState<string | null>(null)
  const [isPro, setIsPro]           = useState(false)
  const [initials, setInitials]     = useState('?')
  const [headerSearch, setHeaderSearch] = useState('')

  useEffect(() => {
    const loadProfile = async (u: { id: string; email?: string }) => {
      setInitials(u.email?.[0]?.toUpperCase() ?? '?')
      const { data: prof } = await supabase.from('profiles')
        .select('avatar_url,is_pro,full_name').eq('id', u.id).single()
      if (prof) {
        if (prof.avatar_url) setAvatarUrl(prof.avatar_url)
        if (prof.is_pro) setIsPro(true)
        if (prof.full_name) setInitials(prof.full_name[0].toUpperCase())
      }
      const { data: myConvs } = await supabase.from('conversations')
        .select('id').or(`user_id.eq.${u.id},seller_id.eq.${u.id}`)
      const convIds = (myConvs ?? []).map((c: any) => c.id)
      let msgCount = 0
      if (convIds.length > 0) {
        const { count } = await supabase.from('messages')
          .select('id', { count: 'exact', head: true })
          .in('conversation_id', convIds)
          .neq('sender_id', u.id)
          .eq('read', false)
        msgCount = count ?? 0
      }
      setUnread(msgCount)
      const { count: notifs } = await supabase.from('notifications')
        .select('id', { count: 'exact', head: true }).eq('user_id', u.id).eq('read', false)
      setUnreadNotifs(notifs ?? 0)

      // Mise à jour date dernière activité (fire-and-forget)
      supabase.from('profiles').update({ last_active_at: new Date().toISOString() }).eq('id', u.id).then(() => {})
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u) { setUnread(0); setUnreadNotifs(0); setAvatarUrl(null); setIsPro(false); return }
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') loadProfile(u)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Remet à zéro le badge notifications quand la page /notifications est ouverte
  useEffect(() => {
    const clear = () => setUnreadNotifs(0)
    window.addEventListener('bss-notifs-read', clear)
    return () => window.removeEventListener('bss-notifs-read', clear)
  }, [])

  // Rafraîchit le badge desktop quand des messages sont marqués comme lus
  useEffect(() => {
    const refresh = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) return
      const { data: convs } = await supabase.from('conversations')
        .select('id').or(`user_id.eq.${u.id},seller_id.eq.${u.id}`)
      const ids = (convs ?? []).map((c: any) => c.id)
      if (ids.length === 0) { setUnread(0); return }
      const { count } = await supabase.from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', ids)
        .neq('sender_id', u.id)
        .eq('read', false)
      setUnread(count ?? 0)
    }
    window.addEventListener('bss-messages-read', refresh)
    return () => window.removeEventListener('bss-messages-read', refresh)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setHeaderSearch(params.get('q') ?? '')
    }
  }, [pathname])

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = headerSearch.trim()
    router.push(q ? `/?q=${encodeURIComponent(q)}` : '/')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
  }

  if (pathname?.startsWith('/auth') || pathname === '/login') return null

  /* ── Logo commun ── */
  const Logo = (
    <Link href="/" className="flex items-center gap-2">
      <BrandLogo className="w-8 h-8 rounded-xl shrink-0 shadow-sm" />
      <span className="font-extrabold text-base sm:text-lg leading-tight py-0.5 hidden sm:inline"
        style={{ background: GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        BuySellSeychelles
      </span>
      {/* Texte affiché centré sur mobile dans le layout grid */}
      <span className="font-extrabold text-base leading-tight py-0.5 sm:hidden"
        style={{ background: GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        BuySellSeychelles
      </span>
    </Link>
  )

  /* ── Cloche — toujours visible, redirige vers /login si non connecté ── */
  const Bell = (
    <Link href={user ? '/notifications' : '/login'}
      className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      {unreadNotifs > 0 && (
        <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
          {unreadNotifs > 9 ? '9+' : unreadNotifs}
        </span>
      )}
    </Link>
  )

  /* ── Toggle langue ── */
  const LangToggle = (
    <button onClick={() => setLang(lang === 'en' ? 'kr' : 'en')}
      className="flex items-center gap-1.5 border-2 border-gray-200 px-2.5 py-1.5 rounded-full hover:border-gray-400 transition-colors">
      {/* Mobile : emoji (fonctionne sur iOS/Android) */}
      <span className="sm:hidden text-xl leading-none">{lang === 'en' ? '🇸🇨' : '🇬🇧'}</span>
      {/* Desktop : badge texte + libellé — aucun emoji, fonctionne partout */}
      <span className="hidden sm:flex items-center gap-1.5">
        <span className="text-[10px] font-extrabold text-white px-1.5 py-0.5 rounded"
          style={{ backgroundColor: '#003F87', letterSpacing: '0.05em' }}>
          {lang === 'en' ? 'SC' : 'EN'}
        </span>
        <span className="text-sm font-semibold text-gray-700">
          {lang === 'en' ? 'Kreol' : 'English'}
        </span>
      </span>
    </button>
  )

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">

      {/* ── Mobile : cloche | LOGO centré | lang ── */}
      <div className="sm:hidden h-14 flex items-center px-3 max-w-2xl mx-auto">
        <div className="w-11 shrink-0">{Bell}</div>
        <div className="flex-1 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo className="w-9 h-9 rounded-xl shrink-0 shadow-sm" />
            <span className="font-extrabold text-lg leading-tight py-0.5"
              style={{ background: GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              BuySellSeychelles
            </span>
          </Link>
        </div>
        <div className="w-11 shrink-0 flex justify-end">{LangToggle}</div>
      </div>

      {/* ── Desktop : logo | spacer | actions ── */}
      <div className="hidden sm:flex h-16 items-center px-6 max-w-7xl mx-auto gap-4 w-full">

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <BrandLogo className="w-8 h-8 rounded-xl shrink-0 shadow-sm" />
          <span className="font-extrabold text-lg leading-tight py-0.5"
            style={{ background: GRADIENT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            BuySellSeychelles
          </span>
        </Link>

        {/* Barre de recherche desktop */}
        <form onSubmit={handleHeaderSearch} className="flex-1 mx-4 max-w-2xl">
          <div className="flex items-center h-11 border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 hover:border-gray-300 focus-within:border-[#003F87] focus-within:ring-2 focus-within:ring-[#003F8720] transition-all">
            <svg className="ml-3.5 shrink-0 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="22" y2="22" />
            </svg>
            <input
              type="text"
              value={headerSearch}
              onChange={e => setHeaderSearch(e.target.value)}
              placeholder={t(lang, 'search_placeholder')}
              className="flex-1 px-3 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
            />
            {headerSearch && (
              <button type="button" onClick={() => setHeaderSearch('')}
                className="px-2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button type="submit"
              className="h-full px-5 text-white text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
              style={{ backgroundColor: '#003F87' }}>
              Search
            </button>
          </div>
        </form>

        {Bell}
        {LangToggle}

        <Link href="/post-ad"
          className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-colors"
          style={{ backgroundColor: '#003F87' }}>
          <span className="text-base leading-none">+</span>
          {t(lang, 'publish')}
        </Link>

        {user ? (
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="relative w-9 h-9 rounded-full overflow-hidden bg-black text-white text-sm font-bold flex items-center justify-center hover:ring-2 hover:ring-gray-300 transition-all">
              {avatarUrl
                ? <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                : <span>{initials}</span>
              }
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {unreadNotifs > 9 ? '9+' : unreadNotifs}
                </span>
              )}
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-11 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-black text-white text-xs font-bold flex items-center justify-center shrink-0 relative">
                      {avatarUrl
                        ? <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                        : <span>{initials}</span>
                      }
                    </div>
                    <div className="min-w-0">
                      {isPro && <p className="text-[10px] text-yellow-600 font-bold">⭐ PRO</p>}
                      <p className="text-xs font-medium text-gray-800 truncate">{user.email}</p>
                    </div>
                  </div>
                  <nav className="py-1">
                    {[
                      { href: '/dashboard',      color: '#003F87', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, label: t(lang, 'dashboard') },
                      { href: '/my-listings',    color: '#007A3D', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, label: t(lang, 'my_listings') },
                      { href: '/alerts',         color: '#FCD116', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, label: t(lang, 'my_alerts') },
                      { href: '/favorites',      color: '#BE0027', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, label: t(lang, 'favorites') },
                      { href: '/tenant-profile', color: '#003F87', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label: t(lang, 'tenant_dossier') },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <span style={{ color: item.color }} className="shrink-0">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                    <Link href="/conversations" onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <span className="flex items-center gap-3">
                        <span style={{ color: '#007A3D' }} className="shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </span>
                        {t(lang, 'messages')}
                      </span>
                      {unread > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread > 9 ? '9+' : unread}</span>}
                    </Link>
                    {!isPro && (
                      <Link href="/subscription" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-yellow-50"
                        style={{ color: '#B8860B' }}>
                        <span style={{ color: '#FCD116' }} className="shrink-0">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </span>
                        {t(lang, 'go_pro')}
                      </Link>
                    )}
                  </nav>
                  <div className="border-t border-gray-100 py-1">
                    {[
                      { href: '/help',   color: '#003F87', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, label: t(lang, 'help_centre') },
                      { href: '/safety', color: '#007A3D', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: t(lang, 'safety_tips') },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <span style={{ color: item.color }} className="shrink-0">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-red-50"
                      style={{ color: '#BE0027' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      {t(lang, 'logout')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link href="/login"
            className="text-sm font-bold text-white px-5 py-2.5 rounded-full transition-colors hover:opacity-90"
            style={{ backgroundColor: '#003F87' }}>
            {t(lang, 'login')}
          </Link>
        )}
      </div>
    </header>
  )
}
