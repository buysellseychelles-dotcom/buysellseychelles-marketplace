import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { deleteListingPhotos, deleteListingNotifications } from '@/lib/storage-cleanup'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const id = formData.get('id') as string

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    // 🔐 récup user (important)
    const authHeader = req.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = userData.user

    // 🔥 vérifie propriété annonce
    const { data: listing } = await supabase
      .from('listings')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (!listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (listing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 🧹 supprime d'abord les photos du Storage (évite les fichiers orphelins)
    await deleteListingPhotos(supabase, [id])

    // 🔔 efface les notifications liées à cette annonce (sinon elles pointent vers une page 404)
    await deleteListingNotifications(supabase, [id])

    // 🗑 delete sécurisé
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}