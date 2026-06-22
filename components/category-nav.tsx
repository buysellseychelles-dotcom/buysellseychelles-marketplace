'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'
import { Suspense } from 'react'

type FlagColor = { bg: string; icon: string; inactiveBg: string; border?: string }

const FLAG: Record<string, FlagColor> = {
  blue:   { bg: '#003F87', icon: '#fff',    inactiveBg: '#003F8715' },
  yellow: { bg: '#FCD116', icon: '#1a1a1a', inactiveBg: '#FCD11620' },
  red:    { bg: '#BE0027', icon: '#fff',    inactiveBg: '#BE002715' },
  white:  { bg: '#FFFFFF', icon: '#333',    inactiveBg: '#F3F4F6', border: '#d1d5db' },
  green:  { bg: '#007A3D', icon: '#fff',    inactiveBg: '#007A3D15' },
}

type IcoFn = (c: string, size?: number) => React.ReactElement

const IcoVehicles: IcoFn = (c, s = 36) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 11l1.5-4.5h11L19 11" />
    <rect x="2" y="11" width="20" height="7" rx="2" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
)
const IcoHome: IcoFn = (c, s = 36) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
)
const IcoPhone: IcoFn = (c, s = 36) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <circle cx="12" cy="17" r="1" fill={c} />
    <line x1="8" y1="6" x2="16" y2="6" />
  </svg>
)
const IcoBoat: IcoFn = (c, s = 36) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20c2 1 4 1 6 0s4-1 6 0 4 1 6 0" />
    <path d="M5 13l2-7h10l2 7" />
    <line x1="12" y1="6" x2="12" y2="2" />
    <path d="M9 2h6" />
  </svg>
)
const IcoBriefcase: IcoFn = (c, s = 28) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="10" y1="14" x2="14" y2="14" />
  </svg>
)
const IcoWrench: IcoFn = (c, s = 28) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
)
const IcoCompass: IcoFn = (c, s = 28) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
  </svg>
)
const IcoShirt: IcoFn = (c, s = 28) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
  </svg>
)
const IcoSofa: IcoFn = (c, s = 28) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
    <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0z" />
    <path d="M4 18v2M20 18v2" />
  </svg>
)
const IcoBox: IcoFn = (c, s = 28) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
  </svg>
)
const IcoDots: IcoFn = (c, s = 28) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" strokeLinecap="round">
    <circle cx="5"  cy="12" r="1.8" fill={c} />
    <circle cx="12" cy="12" r="1.8" fill={c} />
    <circle cx="19" cy="12" r="1.8" fill={c} />
  </svg>
)
const IcoSport: IcoFn = (c, s = 28) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M4.93 4.93c4.5 4.5 9.14 5.86 14.14 4.14M4.93 19.07c4.5-4.5 5.86-9.14 4.14-14.14M19.07 19.07c-4.5-4.5-9.14-5.86-14.14-4.14" />
  </svg>
)
const IcoPaw: IcoFn = (c, s = 28) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="4" r="2" />
    <circle cx="18" cy="8" r="2" />
    <circle cx="6" cy="8" r="2" />
    <circle cx="4.5" cy="14.5" r="2" />
    <circle cx="18.5" cy="14.5" r="2" />
    <path d="M12 17c-4 0-7 2-7 4h14c0-2-3-4-7-4z" />
  </svg>
)
const IcoGift: IcoFn = (c, s = 28) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="8" width="20" height="4" rx="1" />
    <path d="M4 12v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8" />
    <path d="M12 2a3 3 0 0 0-3 3c0 2 3 3 3 3s3-1 3-3a3 3 0 0 0-3-3z" />
    <line x1="12" y1="8" x2="12" y2="21" />
  </svg>
)
const IcoFamily: IcoFn = (c, s = 28) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="6" r="2.5" />
    <circle cx="16" cy="6" r="2.5" />
    <path d="M3 21v-3a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v3" />
    <path d="M14 21v-2a4 4 0 0 1 4-4 3 3 0 0 1 3 3v3" />
  </svg>
)
const IcoFactory: IcoFn = (c, s = 28) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20M4 20V10l6-4v4l6-4v4l4-2v12" />
    <rect x="8" y="14" width="3" height="6" />
    <rect x="13" y="14" width="3" height="6" />
  </svg>
)

// 4 catégories principales — couleurs du drapeau seychellois
// Libellés créoles alignés sur CATEGORY_TREE (page de création d'annonce).
const MAIN_CATS = [
  { value: 'voiture',      en: 'Vehicles',    kr: 'Transpor',  flag: FLAG.blue,   icon: IcoVehicles, emoji: '🚗' },
  { value: 'immobilier',   en: 'Real Estate', kr: 'Imobilye',  flag: FLAG.yellow, icon: IcoHome,     emoji: '🏠' },
  { value: 'electronique', en: 'Electronics', kr: 'Elektronik',flag: FLAG.red,    icon: IcoPhone,    emoji: '📱' },
  { value: 'bateau',       en: 'Boats',       kr: 'Bato',      flag: FLAG.white,  icon: IcoBoat,     emoji: '⛵' },
]

// Catégories du tiroir — couleurs du drapeau seychellois uniquement
// Libellés créoles alignés sur CATEGORY_TREE (page de création d'annonce).
const MORE_CATS = [
  { value: 'emploi',   en: 'Jobs',     kr: 'Travay',             color: FLAG.blue.bg,   inactiveBg: FLAG.blue.inactiveBg,   icon: IcoBriefcase, emoji: '💼' },
  { value: 'services', en: 'Services', kr: 'Servis',             color: FLAG.green.bg,  inactiveBg: FLAG.green.inactiveBg,  icon: IcoWrench,    emoji: '🔧' },
  { value: 'tourisme', en: 'Tourism',  kr: 'Tourizm & Aktivite', color: FLAG.yellow.bg, inactiveBg: FLAG.yellow.inactiveBg, icon: IcoCompass,   emoji: '🌴' },
  { value: 'mode',     en: 'Fashion',  kr: 'Lanmod',             color: FLAG.red.bg,    inactiveBg: FLAG.red.inactiveBg,    icon: IcoShirt,     emoji: '👗' },
  { value: 'maison',   en: 'Home',     kr: 'Lakaz & Zarden',     color: FLAG.blue.bg,   inactiveBg: FLAG.blue.inactiveBg,   icon: IcoSofa,      emoji: '🛋️' },
  { value: 'family',   en: 'Family',   kr: 'Fanmiy',             color: FLAG.green.bg,  inactiveBg: FLAG.green.inactiveBg,  icon: IcoFamily,    emoji: '🧸' },
  { value: 'loisirs',  en: 'Sports',   kr: 'Spor & Lwazir',      color: FLAG.green.bg,  inactiveBg: FLAG.green.inactiveBg,  icon: IcoSport,     emoji: '⚽' },
  { value: 'animaux',  en: 'Pets',     kr: 'Zanimo',             color: FLAG.yellow.bg, inactiveBg: FLAG.yellow.inactiveBg, icon: IcoPaw,       emoji: '🐾' },
  { value: 'dons',     en: 'Free',     kr: 'Gratwit e Esanz',    color: FLAG.green.bg,  inactiveBg: FLAG.green.inactiveBg,  icon: IcoGift,      emoji: '🎁' },
  { value: 'pro',      en: 'Pro',      kr: 'Lekipaman Pro',      color: FLAG.blue.bg,   inactiveBg: FLAG.blue.inactiveBg,   icon: IcoFactory,   emoji: '🏭' },
  { value: 'autre',    en: 'Other',    kr: 'Lezot',              color: FLAG.red.bg,    inactiveBg: FLAG.red.inactiveBg,    icon: IcoBox,       emoji: '📦' },
]

function CategoryNavInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useLang()
  const [showMore, setShowMore] = useState(false)

  const active = searchParams.get('category') ?? ''

  const go = (val: string) => {
    setShowMore(false)
    if (val) router.push(`/category/${val}`)
    else router.push('/')
  }

  return (
    <>
      {/* ── Desktop : chips horizontaux ── */}
      <div className="hidden lg:flex items-center gap-1 px-6 py-2.5 overflow-x-auto scrollbar-hide max-w-7xl mx-auto w-full">
        <button
          onClick={() => go('')}
          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold transition-colors flex-shrink-0 ${active === '' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          {t(lang, 'all_cats_title')}
        </button>
        {[...MAIN_CATS, ...MORE_CATS].map(cat => {
          const isMain  = 'flag' in cat
          const color   = isMain ? (cat as typeof MAIN_CATS[0]).flag.bg : (cat as typeof MORE_CATS[0]).color
          const isActive = active === cat.value
          const icoFn   = isMain ? (cat as typeof MAIN_CATS[0]).icon : (cat as typeof MORE_CATS[0]).icon
          return (
            <button key={cat.value} onClick={() => go(cat.value)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-semibold transition-colors flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              style={isActive ? { backgroundColor: color } : {}}>
              {icoFn(isActive ? '#fff' : color, 15)}
              {lang === 'kr' ? cat.kr : cat.en}
            </button>
          )
        })}
      </div>

      {/* ── Mobile : icônes en colonnes ── */}
      <div className="lg:hidden">
      {/* Barre principale — 5 colonnes pleine largeur */}
      <div className="flex w-full items-start px-2 py-2">
        {MAIN_CATS.map(cat => {
          const isActive = active === cat.value
          const f = cat.flag
          return (
            <button key={cat.value} onClick={() => go(cat.value)}
              className="flex flex-col items-center gap-2.5 flex-1 active:scale-95 transition-transform">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  backgroundColor: isActive ? f.bg : `${f.bg}15`,
                  boxShadow: isActive ? `0 3px 10px ${f.bg}50` : 'none',
                  border: f === FLAG.white ? `1.5px solid ${f.border}` : 'none',
                }}>
                {cat.emoji}
              </div>
              <span className="text-[12px] font-bold leading-tight text-center w-full px-1"
                style={{ color: isActive ? f.bg : '#374151' }}>
                {lang === 'kr' ? cat.kr : cat.en}
              </span>
            </button>
          )
        })}

        {/* Bouton More */}
        <button onClick={() => setShowMore(true)}
          className="flex flex-col items-center gap-1 flex-1 active:scale-95 transition-transform">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: FLAG.green.inactiveBg }}>
            {IcoDots(FLAG.green.bg, 22)}
          </div>
          <span className="text-[10px] font-bold leading-tight text-center"
            style={{ color: FLAG.green.bg }}>
            {t(lang, 'more')}
          </span>
        </button>
      </div>

      {/* Tiroir toutes les catégories */}
      {showMore && (
        <>
          <div className="fixed inset-0 z-[55] bg-black/40" onClick={() => setShowMore(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-3xl shadow-2xl"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>

            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
            <p className="font-bold text-base px-5 mb-4">
              {t(lang, 'all_cats_title')}
            </p>

            {/* Grille 4 colonnes — icônes légèrement plus petites pour toutes tenir */}
            <div className="grid grid-cols-4 gap-y-4 gap-x-3 px-4 pb-4">
              {[...MAIN_CATS, ...MORE_CATS].map(cat => {
                const isMain   = 'flag' in cat
                const isActive = active === cat.value
                const f        = isMain ? (cat as typeof MAIN_CATS[0]).flag : null
                const color    = isMain ? f!.bg : (cat as typeof MORE_CATS[0]).color
                const emoji    = (cat as any).emoji as string

                return (
                  <button key={cat.value} onClick={() => go(cat.value)}
                    className="flex flex-col items-center gap-2.5 active:scale-95 transition-transform">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                      style={{
                        backgroundColor: isActive ? color : `${color}15`,
                        boxShadow: isActive ? `0 3px 10px ${color}50` : 'none',
                        border: f === FLAG.white ? `1.5px solid ${f!.border}` : 'none',
                      }}>
                      {emoji}
                    </div>
                    <span className="text-[12px] font-bold text-center leading-tight w-full px-1"
                      style={{ color: isActive ? color : '#374151' }}>
                      {lang === 'kr' ? cat.kr : cat.en}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
      </div>{/* fin lg:hidden */}
    </>
  )
}

export default function CategoryNav() {
  return (
    <Suspense>
      <CategoryNavInner />
    </Suspense>
  )
}
