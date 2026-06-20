import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function SponsoredSlot() {
  const now = new Date().toISOString()

  const { data } = await supabase
    .from('sponsored_banners')
    .select('*')
    .eq('active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return null

  return (
    <a
      href={data.link_url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="block mx-0 mb-3 rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow relative"
      aria-label={`Sponsored: ${data.title}`}
    >
      <span className="absolute top-1.5 left-2 text-[10px] font-medium text-gray-400 bg-white/80 px-1.5 py-0.5 rounded z-10">
        Sponsored
      </span>

      {data.image_url ? (
        <div className="relative w-full h-24 sm:h-28 bg-gray-100">
          <Image
            src={data.image_url}
            alt={data.title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-4">
            <p className="text-white font-bold text-base leading-tight">{data.title}</p>
            {data.subtitle && <p className="text-white/80 text-xs mt-0.5">{data.subtitle}</p>}
            {data.link_label && (
              <span className="mt-2 inline-block bg-white text-black text-xs font-semibold px-3 py-1 rounded-full w-fit">
                {data.link_label}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-black text-white px-4 py-4 flex items-center justify-between gap-3">
          <div>
            {data.business_name && <p className="text-xs text-gray-400 mb-0.5">{data.business_name}</p>}
            <p className="font-bold text-base leading-tight">{data.title}</p>
            {data.subtitle && <p className="text-gray-300 text-xs mt-0.5">{data.subtitle}</p>}
          </div>
          {data.link_label && (
            <span className="shrink-0 bg-white text-black text-xs font-semibold px-3 py-1.5 rounded-full">
              {data.link_label}
            </span>
          )}
        </div>
      )}
    </a>
  )
}
