// URL publique canonique du site, utilisée pour le SEO : balises canonical,
// Open Graph, sitemap, robots, données structurées (JSON-LD).
//
// On n'utilise NEXT_PUBLIC_SITE_URL que s'il pointe vers un vrai domaine.
// En dev (localhost) ou si la variable est absente, on retombe sur le domaine
// de production pour que les URLs canonical/OG restent toujours correctes.
const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()

export const SITE_URL =
  raw && !raw.includes('localhost') && !raw.startsWith('http://127.')
    ? raw.replace(/\/$/, '')
    : 'https://buysellseychelles.com'

export const SITE_NAME = 'BuySellSeychelles'
