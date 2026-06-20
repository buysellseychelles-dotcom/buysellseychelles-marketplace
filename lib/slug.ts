// Génération et lecture des URLs lisibles d'annonces.
//
// Format : /listing/<texte-lisible>-<uuid>
//   ex: /listing/toyota-corolla-2015-mahe-3f9a2b1c-1d2e-4f5a-8b9c-0d1e2f3a4b5c
//
// L'UUID complet est conservé en fin de slug : on l'extrait par regex pour
// retrouver l'annonce, ce qui rend le texte lisible totalement « cosmétique »
// (il peut changer sans casser le lien tant que l'UUID est présent).

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // (accents retirés via NFD)
    .replace(/[^a-z0-9]+/g, '-') // tout le reste → tirets
    .replace(/^-+|-+$/g, '') // pas de tiret en début/fin
    .slice(0, 70) // limite la longueur du texte
    .replace(/-+$/g, '')
}

type ListingLike = {
  id: string
  title?: string | null
  location?: string | null
  make?: string | null
  model?: string | null
  year?: number | string | null
}

/** Construit le slug lisible complet (texte + uuid) pour une annonce. */
export function buildListingSlug(listing: ListingLike): string {
  const parts = [
    listing.title,
    !listing.title ? [listing.make, listing.model, listing.year].filter(Boolean).join(' ') : null,
    listing.location,
  ].filter(Boolean) as string[]

  const text = slugify(parts.join(' '))
  return text ? `${text}-${listing.id}` : listing.id
}

/** Chemin complet vers la page annonce. */
export function listingHref(listing: ListingLike): string {
  return `/listing/${buildListingSlug(listing)}`
}

/** Extrait l'UUID d'un paramètre d'URL (slug lisible OU ancien UUID nu). */
export function extractListingId(param: string): string | null {
  const match = param.match(UUID_RE)
  return match ? match[0] : null
}

/** Vrai si le paramètre est déjà un UUID nu (ancien format à rediriger). */
export function isBareUuid(param: string): boolean {
  return new RegExp(`^${UUID_RE.source}$`, 'i').test(param)
}
