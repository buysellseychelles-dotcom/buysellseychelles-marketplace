import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { deleteListingPhotos, deleteListingNotifications } from '@/lib/storage-cleanup'
import { isAdminUser } from '@/lib/admin-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await req.formData()
  const listingId = form.get('listingId') as string
  const reportId  = form.get('reportId')  as string

  if (!listingId) return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })

  // Supprime les photos du Storage + les lignes listing_images (anti-orphelins)
  await deleteListingPhotos(supabase, [listingId])
  // Efface les notifications liées à l'annonce (évite les liens 404)
  await deleteListingNotifications(supabase, [listingId])
  await supabase.from('listings').delete().eq('id', listingId)
  if (reportId) await supabase.from('reports').update({ resolved: true }).eq('id', reportId)

  return NextResponse.redirect(new URL('/admin/reports', req.url))
}
