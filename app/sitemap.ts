import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { buildListingSlug } from '@/lib/slug'
import { CATEGORY_META } from '@/lib/subcategories'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  { url: `${SITE_URL}/trending`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  { url: `${SITE_URL}/map`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  { url: `${SITE_URL}/advertise`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/help`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  { url: `${SITE_URL}/post-ad`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
]

const CATEGORY_PAGES: MetadataRoute.Sitemap = Object.keys(CATEGORY_META).map(slug => ({
  url: `${SITE_URL}/category/${slug}`,
  lastModified: new Date(),
  changeFrequency: 'daily',
  priority: 0.7,
}))

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await supabase
    .from('listings')
    .select('id, title, location, make, model, year, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(5000)

  const listings: MetadataRoute.Sitemap = (data ?? []).map((item: any) => ({
    url: `${SITE_URL}/listing/${buildListingSlug(item)}`,
    lastModified: item.updated_at ?? item.created_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...STATIC_PAGES, ...CATEGORY_PAGES, ...listings]
}
