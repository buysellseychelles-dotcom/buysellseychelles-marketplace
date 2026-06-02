import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BoostButton from '@/components/boost-button'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ListingPage({
  params,
}: {
  params: { id: string }
}) {

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!listing) return notFound()

  const { data: images } = await supabase
    .from('listing_images')
    .select('*')
    .eq('listing_id', params.id)

  const isBoostActive =
    listing.boosted &&
    listing.boost_expires_at &&
    new Date(listing.boost_expires_at) > new Date()

  const whatsappMessage = encodeURIComponent(
    `Bonjour, je suis intéressé par votre annonce : ${listing.title}`
  )

  const whatsappLink = listing.whatsapp
    ? `https://wa.me/${listing.whatsapp}?text=${whatsappMessage}`
    : null

  return (
    <div className="max-w-xl mx-auto p-3">

      {/* 🚀 TRACK VIEWS (IMPORTANT POUR RANKING) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            fetch('/api/track/view', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ listingId: '${listing.id}' })
            })
          `,
        }}
      />

      {/* 🚀 BOOST BADGE */}
      {isBoostActive && (
        <div className="bg-green-100 text-green-700 text-center p-2 rounded mb-3 text-sm">
          🚀 Annonce Boostée
        </div>
      )}

      {/* 🚀 BOOST BUTTON */}
      <BoostButton listingId={listing.id} />

      {/* TITRE */}
      <h1 className="text-lg font-bold mb-2">
        {listing.title}
      </h1>

      {/* PRIX */}
      <p className="text-xl font-bold text-green-600 mb-3">
        {listing.price} €
      </p>

      {/* IMAGES */}
      <div className="grid grid-cols-2 gap-2 mb-3">

        {(images || []).map((img: any) => (
          <div key={img.id} className="relative h-32 w-full">
            <Image
              src={img.image_url}
              alt="photo"
              fill
              className="object-cover rounded"
            />
          </div>
        ))}

      </div>

      {/* DESCRIPTION */}
      <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">
        {listing.description || 'Aucune description'}
      </p>

      {/* LOCALISATION */}
      <p className="text-xs text-gray-500 mb-4">
        📍 {listing.location}
      </p>

      {/* WHATSAPP + TRACK CLICK */}
      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          onClick={() => {
            fetch('/api/track/click', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ listingId: listing.id }),
            })
          }}
          className="block bg-green-500 text-white text-center p-3 rounded mb-3"
        >
          💬 Contacter sur WhatsApp
        </a>
      )}

      {/* RETOUR */}
      <Link href="/" className="text-blue-500 text-sm">
        ← Retour aux annonces
      </Link>

    </div>
  )
}