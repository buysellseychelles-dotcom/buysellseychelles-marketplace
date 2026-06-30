import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Client service_role : bypasse la RLS sur listing_images pour garantir
// que le DELETE supprime vraiment toutes les lignes avant le réinsertion.
// Sans cela, la RLS peut silencieusement ignorer le DELETE (0 lignes, pas d'erreur)
// et les INSERT s'accumulent par-dessus les anciennes lignes → doublons.
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FREE_LIMIT = 3
const PACK_LIMIT = 10

export async function POST(req: Request) {
  try {
    // 1. Auth
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await adminSupabase.auth.getUser(token)
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = userData.user.id

    // 2. Corps de la requête
    const body = await req.json() as { listing_id: string; urls: string[] }
    const { listing_id, urls } = body
    if (!listing_id || !Array.isArray(urls)) {
      return NextResponse.json({ error: 'Missing listing_id or urls' }, { status: 400 })
    }

    // 3. Vérification propriété de l'annonce
    const { data: listing } = await adminSupabase
      .from('listings')
      .select('id, user_id')
      .eq('id', listing_id)
      .single()
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    if (listing.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 4. Limite photos côté serveur
    const { data: pack } = await adminSupabase
      .from('user_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('product_type', 'photo_pack')
      .gte('expires_at', new Date().toISOString())
      .limit(1)
    const hasPhotoPack = (pack?.length ?? 0) > 0
    const limit = hasPhotoPack ? PACK_LIMIT : FREE_LIMIT
    if (urls.length > limit) {
      return NextResponse.json(
        { error: `Photo limit is ${limit} for this account.` },
        { status: 422 }
      )
    }

    // 5. DELETE puis INSERT atomique — via service_role, la RLS est bypassée
    const { error: deleteError } = await adminSupabase
      .from('listing_images')
      .delete()
      .eq('listing_id', listing_id)
    if (deleteError) {
      return NextResponse.json({ error: 'Failed to clear photos: ' + deleteError.message }, { status: 500 })
    }

    for (const url of urls) {
      const { error: insertError } = await adminSupabase
        .from('listing_images')
        .insert({ listing_id, image_url: url })
      if (insertError) {
        return NextResponse.json({ error: 'Failed to save photo: ' + insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true, count: urls.length })
  } catch (err) {
    console.error('[photos] unexpected error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
