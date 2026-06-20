import type { Lang } from './i18n'

/** Taille maximale autorisée par fichier uploadé (photo annonce, profil, bannière). */
export const MAX_UPLOAD_MB = 5
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

/**
 * Garde-fou sur le fichier ORIGINAL (avant compression) : empêche de décoder
 * une image démesurée qui ferait planter le canvas sur mobile. La vraie limite
 * de 5 MB s'applique ensuite sur le fichier compressé réellement uploadé.
 */
export const MAX_ORIGINAL_MB = 30
export const MAX_ORIGINAL_BYTES = MAX_ORIGINAL_MB * 1024 * 1024

/**
 * Vérifie le garde-fou sur le fichier original.
 * Renvoie un message d'erreur localisé si trop gros, sinon `null`.
 */
export function fileExceedsRaw(file: File, lang: Lang = 'en'): string | null {
  if (file.size <= MAX_ORIGINAL_BYTES) return null
  const mb = (file.size / (1024 * 1024)).toFixed(1)
  return lang === 'kr'
    ? `Foto-la tro gro (${mb} MB). Maksimòm ${MAX_ORIGINAL_MB} MB.`
    : `Image too large (${mb} MB). Maximum ${MAX_ORIGINAL_MB} MB.`
}

/**
 * Vérifie qu'un fichier ne dépasse pas la limite de taille.
 * Renvoie un message d'erreur localisé si trop gros, sinon `null`.
 */
export function fileTooLarge(file: File, lang: Lang = 'en'): string | null {
  if (file.size <= MAX_UPLOAD_BYTES) return null
  const mb = (file.size / (1024 * 1024)).toFixed(1)
  return lang === 'kr'
    ? `Foto-la tro gro (${mb} MB). Maksimòm ${MAX_UPLOAD_MB} MB par foto.`
    : `Image too large (${mb} MB). Maximum ${MAX_UPLOAD_MB} MB per photo.`
}

/**
 * Filtre une liste de fichiers : renvoie ceux qui respectent la limite et,
 * le cas échéant, le premier message d'erreur rencontré.
 */
export function partitionBySize(files: File[], lang: Lang = 'en'): { ok: File[]; error: string | null } {
  const ok: File[] = []
  let error: string | null = null
  for (const f of files) {
    const err = fileTooLarge(f, lang)
    if (err) { if (!error) error = err }
    else ok.push(f)
  }
  return { ok, error }
}
