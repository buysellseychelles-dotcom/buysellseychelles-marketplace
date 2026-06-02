import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap() {

  const { data } = await supabase
    .from('listings')
    .select('id, created_at')

  return (data || []).map((item: any) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/listing/${item.id}`,
    lastModified: item.created_at,
  }))
}