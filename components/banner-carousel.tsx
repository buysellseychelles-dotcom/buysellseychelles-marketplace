'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'

type Slide = {
  id: string
  title: string
  subtitle?: string | null
  image_url?: string | null
  link_url: string
  link_label?: string | null
  bg?: string
}

// Mock d'une annonce publicitaire — rendu pur CSS/JSX (slide "advertise")
function MockAdVisual() {
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
      {/* Carte annonce simulée */}
      <div className="w-[90px] bg-white rounded-xl shadow-2xl overflow-hidden border border-white/40">
        {/* Photo produit simulée */}
        <div className="w-full h-[52px] relative overflow-hidden flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FCD116 0%, #BE0027 60%, #003F87 100%)' }}>
          {/* Silhouette maison */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white" opacity="0.9">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
            <path d="M9 21V12h6v9" fill="white" />
          </svg>
          {/* Badge VOTRE PUB */}
          <div className="absolute top-1 left-1 bg-black/50 rounded-sm px-1 py-0.5">
            <span className="text-white text-[7px] font-bold tracking-wide">YOUR AD</span>
          </div>
        </div>
        {/* Infos listing simulées */}
        <div className="p-1.5 space-y-1">
          <div className="h-1.5 bg-gray-200 rounded-full w-full" />
          <div className="h-1.5 bg-gray-100 rounded-full w-3/4" />
          <div className="flex items-center justify-between mt-1">
            <div className="h-2 bg-[#003F87] rounded-full w-2/3" style={{ opacity: 0.8 }} />
            <div className="h-2 bg-gray-100 rounded-full w-1/5" />
          </div>
        </div>
      </div>

      {/* Deuxième carte décalée en arrière */}
      <div className="w-[78px] bg-white/25 rounded-xl h-[72px] -mt-3 border border-white/30 ml-4" />
    </div>
  )
}

// `banners` = bannières clients payées (max 5), affichées en premier.
// Le slide "Advertise your business here" est toujours ajouté à la fin.
export default function BannerCarousel({ banners = [] }: { banners?: Slide[] }) {
  const { lang } = useLang()
  const [current, setCurrent] = useState(0)

  const advertiseSlide: Slide = {
    id: 'advertise',
    title: t(lang, 'banner_ad_title'),
    subtitle: t(lang, 'banner_ad_desc'),
    link_url: '/advertise',
    link_label: t(lang, 'banner_ad_cta'),
    bg: '#007A3D',
  }

  // Bannières clients (au plus 5) + l'image d'origine = max 6 au total
  const clientSlides = banners.slice(0, 5)
  const slides: Slide[] = [...clientSlides, advertiseSlide]

  // Défilement automatique en boucle entre toutes les images
  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 4500)
    return () => clearInterval(timer)
  }, [slides.length])

  // Garde-fou si le nombre de slides change (ex: bannière expirée)
  const safeIndex = current % slides.length
  const s = slides[safeIndex]
  const isAdvertise = s.id === 'advertise' && !s.image_url
  const isClient = safeIndex < clientSlides.length

  return (
    <div className="mx-3 mb-3">
      <div className="relative rounded-2xl overflow-hidden h-[110px] cursor-pointer"
        onClick={() => {
          if (s.link_url.startsWith('http')) window.open(s.link_url, '_blank')
          else window.location.href = s.link_url
        }}>

        {s.image_url ? (
          <>
            <Image src={s.image_url} alt={s.title} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-black/10" />
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ backgroundColor: s.bg ?? '#003F87' }} />
            {/* Décoration géométrique de fond */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-[-20px] right-[-20px] w-40 h-40 rounded-full bg-white" />
              <div className="absolute bottom-[-30px] right-[60px] w-28 h-28 rounded-full bg-white" />
            </div>
          </>
        )}

        {/* Texte à gauche — réservé pour ne pas chevaucher le visuel pub */}
        <div className={`absolute inset-0 flex flex-col justify-center pl-5 ${isAdvertise ? 'pr-[108px]' : 'pr-5'}`}>
          <p className="text-white font-bold text-[15px] leading-snug">{s.title}</p>
          {s.subtitle && (
            <p className="text-white/80 text-[11px] mt-0.5 leading-snug line-clamp-2">{s.subtitle}</p>
          )}
          {s.link_label && (
            <span className="mt-2 inline-block bg-white text-black text-xs font-bold px-3 py-1 rounded-full w-fit">
              {s.link_label}
            </span>
          )}
        </div>

        {/* Visuel pub exemple — seulement sur la slide "advertise" sans image */}
        {isAdvertise && <MockAdVisual />}

        {/* Pastille Sponsored sur les bannières clients payées */}
        {isClient && (
          <span className="absolute top-2 right-2 text-[10px] text-white/70 bg-black/30 px-1.5 py-0.5 rounded">
            {t(lang, 'sponsored')}
          </span>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className="rounded-full transition-all"
              style={{
                width: i === safeIndex ? '16px' : '6px',
                height: '6px',
                backgroundColor: i === safeIndex ? '#003F87' : '#d1d5db',
              }} />
          ))}
        </div>
      )}
    </div>
  )
}
