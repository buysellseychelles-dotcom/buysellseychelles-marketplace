'use client'

import { useEffect, useRef } from 'react'
import { geocode, SEYCHELLES_BOUNDS } from '@/lib/geocode'
import { formatPrice } from '@/lib/utils'
import { listingHref } from '@/lib/slug'

type Listing = {
  id: string
  title: string
  price: number | null
  currency: string | null
  location: string | null
  category: string | null
  image_url?: string
}

type Props = { listings: Listing[] }

export default function ListingsMap({ listings }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamic import to avoid SSR issues
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css' as any),
    ]).then(([L]) => {
      const Leaflet = L.default

      // Fix default marker icons
      delete (Leaflet.Icon.Default.prototype as any)._getIconUrl
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = Leaflet.map(mapRef.current!, {
        center: [SEYCHELLES_BOUNDS.center.lat, SEYCHELLES_BOUNDS.center.lng],
        zoom: SEYCHELLES_BOUNDS.zoom,
        zoomControl: true,
      })

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map)

      mapInstanceRef.current = map

      // Add markers
      const withCoords = listings
        .map(l => ({ listing: l, coords: geocode(l.location) }))
        .filter(x => x.coords !== null)

      withCoords.forEach(({ listing, coords }) => {
        const price = formatPrice(listing.price, listing.currency)
        const popup = `
          <a href="${listingHref(listing)}" style="text-decoration:none;color:inherit;display:block;min-width:160px">
            ${listing.image_url ? `<img src="${listing.image_url}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:6px" />` : ''}
            <p style="font-weight:600;font-size:13px;margin:0 0 2px;color:#111;line-height:1.3">${listing.title}</p>
            <p style="font-weight:700;font-size:14px;margin:0;color:#000">${price}</p>
            ${listing.location ? `<p style="font-size:11px;color:#888;margin:3px 0 0">📍 ${listing.location}</p>` : ''}
            <p style="font-size:11px;color:#555;margin:6px 0 0;text-decoration:underline">View listing →</p>
          </a>
        `
        Leaflet.marker([coords!.lat, coords!.lng])
          .addTo(map)
          .bindPopup(popup, { maxWidth: 200 })
      })

      // If no listings with coords, show all Seychelles
      if (withCoords.length === 0) {
        map.setView([-4.620, 55.452], 10)
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [listings])

  return (
    <div ref={mapRef} className="w-full h-full rounded-xl" />
  )
}
