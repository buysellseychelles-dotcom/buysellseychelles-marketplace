import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { deleteListingPhotos } from '@/lib/storage-cleanup'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const form = await req.formData()
  const listingId = form.get('listingId') as string
  const reportId  = form.get('reportId')  as string

  if (!listingId) return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })

  // Supprime les photos du Storage + les lignes listing_images (anti-orphelins)
  await deleteListingPhotos(supabase, [listingId])
  await supabase.from('listings').delete().eq('id', listingId)
  if (reportId) await supabase.from('reports').update({ resolved: true }).eq('id', reportId)

  return NextResponse.redirect(new URL('/admin/reports', req.url))
}
