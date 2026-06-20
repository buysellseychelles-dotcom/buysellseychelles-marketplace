'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import { useLowData } from '@/hooks/use-low-data'
import { lowResUrl } from '@/lib/image-quality'

type Props = {
  images: { image_url: string }[]
  title: string
}

export default function PhotoSwipe({ images, title }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const lowData = useLowData()
  const [hd, setHd] = useState(false)

  // On affiche la basse résolution tant que le réseau est faible ET que
  // l'utilisateur n'a pas demandé le HD.
  const useLow = lowData && !hd
  const srcOf = (url: string) => (useLow ? lowResUrl(url) : url)

  // Sécurité : si la variante basse résolution échoue (transformation Supabase
  // non activée, par ex.), on bascule en pleine qualité plutôt qu'image cassée.
  const onLowResError = () => {
    if (useLow) setHd(true)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onScroll = () => {
      const index = Math.round(el.scrollLeft / el.offsetWidth)
      setCurrent(index)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  if (images.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-5xl text-gray-300">
        📷
      </div>
    )
  }

  // Bouton "Voir en HD" — visible uniquement quand on sert de la basse résolution.
  const HdButton = useLow ? (
    <button
      type="button"
      onClick={() => setHd(true)}
      className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 bg-black/60 hover:bg-black/75 text-white text-xs font-medium px-2.5 py-1.5 rounded-full backdrop-blur-sm transition-colors"
    >
      <Sparkles className="h-3.5 w-3.5" />
      Voir en HD
    </button>
  ) : null

  if (images.length === 1) {
    return (
      <div className="relative w-full aspect-video bg-gray-100">
        <Image src={srcOf(images[0].image_url)} alt={title} fill className="object-cover" priority onError={onLowResError} />
        {HdButton}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Carrousel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((img, i) => (
          <div key={i} className="relative w-full aspect-video shrink-0 snap-start bg-gray-100">
            <Image
              src={srcOf(img.image_url)}
              alt={`${title} ${i + 1}`}
              fill
              className="object-cover"
              priority={i === 0}
              onError={onLowResError}
            />
          </div>
        ))}
      </div>

      {/* Compteur */}
      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-full">
        {current + 1}/{images.length}
      </div>

      {/* Voir en HD */}
      {HdButton}

      {/* Points */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all ${i === current ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  )
}
