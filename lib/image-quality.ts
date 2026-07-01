// Helpers de transformation d'images Supabase Storage.
// Convertit une URL publique Supabase (/storage/v1/object/public/...) en variante
// transformée (largeur + qualité) via l'endpoint /storage/v1/render/image/public/...
// Nécessite la transformation d'images activée sur le projet Supabase (plan Pro+).
// Toute URL non-Supabase (ou vide) est renvoyée inchangée.

const PUBLIC_SEGMENT = '/storage/v1/object/public/'
const RENDER_SEGMENT = '/storage/v1/render/image/public/'

export interface TransformOpts {
  /** Largeur cible en pixels (le ratio est préservé). */
  width?: number
  /** Qualité JPEG/WebP, de 20 (légère) à 100 (max). */
  quality?: number
}

export function transformImageUrl(url: string, { width, quality }: TransformOpts): string {
  if (!url || !url.includes(PUBLIC_SEGMENT)) return url

  const rendered = url.replace(PUBLIC_SEGMENT, RENDER_SEGMENT)
  const params = new URLSearchParams()
  if (width) params.set('width', String(width))
  if (quality) params.set('quality', String(quality))

  if (!params.toString()) return rendered
  const sep = rendered.includes('?') ? '&' : '?'
  return `${rendered}${sep}${params.toString()}`
}

/**
 * Variante basse résolution pour les réseaux faibles / l'économie de données.
 * @param width largeur cible (480px par défaut, suffisant pour le mobile).
 */
export function lowResUrl(url: string, width = 480): string {
  return transformImageUrl(url, { width, quality: 35 })
}

/**
 * Vrai si l'URL correspond à un host autorisé dans next.config.mjs (remotePatterns),
 * donc optimisable/cachable par Next-Image. Sert à décider `unoptimized` pour les champs
 * libres (ex: image_url des bannières admin) qui peuvent pointer vers n'importe quel host.
 */
export function isOptimizableUrl(url: string): boolean {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    return hostname.endsWith('.supabase.co') || hostname === 'images.unsplash.com'
  } catch {
    return false
  }
}
