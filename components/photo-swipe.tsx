'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Sparkles, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { useLowData } from '@/hooks/use-low-data'
import { lowResUrl } from '@/lib/image-quality'

type Props = {
  images: { image_url: string }[]
  title: string
}

export default function PhotoSwipe({ images, title }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const lowData = useLowData()
  const [hd, setHd] = useState(false)

  const useLow = lowData && !hd
  const srcOf = (url: string) => (useLow ? lowResUrl(url) : url)
  const onLowResError = () => { if (useLow) setHd(true) }

  // Sync carousel scroll → current index
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

  const scrollTo = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: index * el.offsetWidth, behavior: 'smooth' })
    setCurrent(index)
  }

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation()
    scrollTo(Math.max(0, current - 1))
  }
  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation()
    scrollTo(Math.min(images.length - 1, current + 1))
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }
  const closeLightbox = () => setLightboxOpen(false)

  const lbPrev = useCallback(() => setLightboxIndex(i => Math.max(0, i - 1)), [])
  const lbNext = useCallback(() => setLightboxIndex(i => Math.min(images.length - 1, i + 1)), [images.length])

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') lbPrev()
      if (e.key === 'ArrowRight') lbNext()
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, lbPrev, lbNext])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  if (images.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-100 flex items-center justify-center text-5xl text-gray-300">
        📷
      </div>
    )
  }

  const HdButton = useLow ? (
    <button
      type="button"
      onClick={() => setHd(true)}
      className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-medium px-2.5 py-1.5 rounded-full backdrop-blur-sm transition-colors"
    >
      <Sparkles className="h-3.5 w-3.5" />
      View in HD
    </button>
  ) : null

  // Single image
  if (images.length === 1) {
    return (
      <div
        className="relative w-full aspect-video bg-gray-100 cursor-zoom-in group"
        onClick={() => openLightbox(0)}
      >
        <Image src={srcOf(images[0].image_url)} alt={title} fill className="object-cover" priority onError={onLowResError} />
        <div className="absolute top-3 right-3 z-10 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-4 w-4" />
        </div>
        {HdButton}
        {lightboxOpen && (
          <Lightbox images={images} index={lightboxIndex} onClose={closeLightbox} onPrev={lbPrev} onNext={lbNext} onSelect={setLightboxIndex} title={title} />
        )}
      </div>
    )
  }

  return (
    <>
      <div className="relative group">
        {/* ── Carousel strip ── */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory cursor-zoom-in"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onClick={() => openLightbox(current)}
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

        {/* ── Left arrow ── */}
        {current > 0 && (
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* ── Right arrow ── */}
        {current < images.length - 1 && (
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next photo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* ── Counter ── */}
        <div className="absolute top-3 right-3 z-10 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full pointer-events-none">
          {current + 1} / {images.length}
        </div>

        {/* ── Zoom hint ── */}
        <div className="absolute top-3 left-3 z-10 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn className="h-4 w-4" />
        </div>

        {/* ── HD button ── */}
        {HdButton}

        {/* ── Dot indicators ── */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
          {images.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${i === current ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* ── Thumbnail strip (desktop only, max 6) ── */}
      {images.length > 1 && (
        <div className="hidden lg:flex gap-2 px-0 pt-2 pb-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {images.slice(0, 8).map((img, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? 'border-[#003F87] opacity-100' : 'border-transparent opacity-60 hover:opacity-90'
              }`}
              aria-label={`Go to photo ${i + 1}`}
            >
              <Image src={img.image_url} alt="" fill className="object-cover" />
            </button>
          ))}
          {images.length > 8 && (
            <button
              onClick={() => openLightbox(8)}
              className="shrink-0 w-16 h-12 rounded-lg border-2 border-gray-200 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-gray-200 transition-colors"
            >
              +{images.length - 8}
            </button>
          )}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={lbPrev}
          onNext={lbNext}
          onSelect={setLightboxIndex}
          title={title}
        />
      )}
    </>
  )
}

// ── Lightbox Component ─────────────────────────────────────────────────────

type LightboxProps = {
  images: { image_url: string }[]
  index: number
  title: string
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onSelect: (i: number) => void
}

function Lightbox({ images, index, title, onClose, onPrev, onNext, onSelect }: LightboxProps) {
  const thumbRef = useRef<HTMLDivElement>(null)

  // Scroll active thumbnail into view
  useEffect(() => {
    const el = thumbRef.current?.children[index] as HTMLElement
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [index])

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={e => e.stopPropagation()}>
        <p className="text-white/70 text-sm truncate max-w-[70%]">{title}</p>
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-sm">{index + 1} / {images.length}</span>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main image */}
      <div
        className="flex-1 flex items-center justify-center relative min-h-0 px-12"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          <Image
            src={images[index].image_url}
            alt={`${title} ${index + 1}`}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Prev arrow */}
        {index > 0 && (
          <button
            onClick={onPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-3 transition-all"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Next arrow */}
        {index < images.length - 1 && (
          <button
            onClick={onNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-3 transition-all"
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          ref={thumbRef}
          className="flex gap-2 overflow-x-auto px-4 py-3 shrink-0"
          style={{ scrollbarWidth: 'none' }}
          onClick={e => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`relative shrink-0 w-14 h-10 rounded-md overflow-hidden border-2 transition-all ${
                i === index ? 'border-white opacity-100 scale-105' : 'border-transparent opacity-40 hover:opacity-70'
              }`}
              aria-label={`Go to photo ${i + 1}`}
            >
              <Image src={img.image_url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}