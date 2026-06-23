import type { SupabaseClient } from '@supabase/supabase-js'

/** Bucket où sont stockées les photos d'annonces. */
export const LISTINGS_BUCKET = 'listings'

const PUBLIC_MARKER = '/storage/v1/object/public/'

/**
 * Extrait le chemin interne au bucket à partir d'une URL publique Supabase.
 * Renvoie `null` si l'URL ne correspond pas au bucket attendu.
 * Ex: ".../object/public/listings/abc-123.jpg?t=1" -> "abc-123.jpg"
 */
export function storagePathFromUrl(url: string, bucket = LISTINGS_BUCKET): string | null {
  if (!url) return null
  const marker = `${PUBLIC_MARKER}${bucket}/`
  const i = url.indexOf(marker)
  if (i === -1) return null
  // Retire un éventuel query string (cache-busting ?t=...)
  return decodeURIComponent(url.slice(i + marker.length).split('?')[0])
}

/**
 * Supprime du Storage toutes les photos appartenant aux annonces fournies,
 * ainsi que leurs lignes `listing_images`.
 * À appeler AVANT de supprimer les annonces elles-mêmes.
 * Renvoie le nombre de fichiers retirés du Storage.
 *
 * Nécessite un client Supabase admin (service role) pour ignorer la RLS.
 */
export async function deleteListingPhotos(
  supabase: SupabaseClient,
  listingIds: string[],
): Promise<number> {
  if (!listingIds || listingIds.length === 0) return 0

  const { data: images } = await supabase
    .from('listing_images')
    .select('image_url')
    .in('listing_id', listingIds)

  const paths = (images ?? [])
    .map((img) => storagePathFromUrl(img.image_url as string))
    .filter((p): p is string => !!p)

  if (paths.length > 0) {
    await supabase.storage.from(LISTINGS_BUCKET).remove(paths)
  }

  // Retire aussi les lignes en base (défensif — un FK cascade peut déjà le faire).
  await supabase.from('listing_images').delete().in('listing_id', listingIds)

  return paths.length
}

/**
 * Supprime les notifications qui pointent vers les annonces fournies.
 * Les notifications n'ont pas de colonne `listing_id` : le rattachement à une
 * annonce est encodé dans le champ `link` sous la forme `/listing/<id>`
 * (voir app/api/notify/*). On supprime donc par lien afin qu'aucune
 * notification orpheline (cliquable → 404) ne subsiste après la suppression.
 * À appeler lors de la suppression d'annonces.
 *
 * Nécessite un client Supabase admin (service role) pour ignorer la RLS.
 */
export async function deleteListingNotifications(
  supabase: SupabaseClient,
  listingIds: string[],
): Promise<void> {
  if (!listingIds || listingIds.length === 0) return
  const links = listingIds.map((id) => `/listing/${id}`)
  await supabase.from('notifications').delete().in('link', links)
}
