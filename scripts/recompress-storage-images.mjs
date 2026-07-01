/**
 * recompress-storage-images.mjs
 *
 * Recompresse en place les images déjà présentes dans Supabase Storage
 * (buckets 'listings', 'avatars', 'banners') pour réduire la bande passante
 * consommée à chaque fois qu'elles sont servies.
 *
 * - Redimensionne à une largeur max (1200px pour listings/banners, 500px pour
 *   avatars/id-docs) et réencode en JPEG qualité 82, comme lib/compress-image.ts
 *   côté client pour les nouveaux uploads.
 * - Écrase le fichier au MÊME chemin (upsert) : les URLs publiques déjà stockées
 *   en base ne changent pas.
 * - Ignore les fichiers déjà petits (< 150 KB) ou si la version recompressée
 *   n'est pas plus légère que l'originale.
 *
 * Usage :
 *   node scripts/recompress-storage-images.mjs           (dry-run : affiche les gains sans écrire)
 *   node scripts/recompress-storage-images.mjs --apply    (applique réellement les ré-uploads)
 */

import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APPLY = process.argv.includes('--apply')

const envRaw = readFileSync(join(__dirname, '..', '.env.local'), 'utf8')
for (const line of envRaw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) {
    process.env[m[1]] = m[2].replace(/^"|"$/g, '').trim()
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SKIP_BELOW_BYTES = 150 * 1024
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i

const BUCKETS = [
  { name: 'listings', maxWidth: 1200 },
  { name: 'banners', maxWidth: 1200 },
  { name: 'avatars', maxWidth: 500 },
]

// Liste récursivement tous les fichiers d'un bucket (les buckets ont des sous-dossiers :
// avatars/{userId}/, avatars/id-docs/{userId}/, listings/chat/{convId}-...).
async function listAllFiles(bucket, prefix = '') {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 })
  if (error) {
    console.error(`  ✗ list(${bucket}/${prefix}) : ${error.message}`)
    return []
  }
  const files = []
  for (const entry of data) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name
    // Un "dossier" chez Supabase Storage est une entrée sans id/metadata.
    if (entry.id === null) {
      files.push(...await listAllFiles(bucket, path))
    } else {
      files.push(path)
    }
  }
  return files
}

async function processFile(bucket, path, maxWidth) {
  if (!IMAGE_EXT.test(path)) return null

  const { data: blob, error: dlError } = await supabase.storage.from(bucket).download(path)
  if (dlError || !blob) {
    console.error(`  ✗ download ${bucket}/${path} : ${dlError?.message}`)
    return null
  }

  const original = Buffer.from(await blob.arrayBuffer())
  if (original.length < SKIP_BELOW_BYTES) return null

  let compressed
  try {
    compressed = await sharp(original)
      .rotate() // auto-orient selon l'EXIF avant de perdre les métadonnées
      .resize({ width: maxWidth, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer()
  } catch (err) {
    console.error(`  ✗ sharp ${bucket}/${path} : ${err.message}`)
    return null
  }

  if (compressed.length >= original.length) return null

  const saved = original.length - compressed.length
  console.log(
    `  ${APPLY ? '✓' : '·'} ${bucket}/${path} : ${(original.length / 1024).toFixed(0)} KB → ` +
    `${(compressed.length / 1024).toFixed(0)} KB (−${(saved / 1024).toFixed(0)} KB)`
  )

  if (APPLY) {
    const { error: upError } = await supabase.storage.from(bucket).update(path, compressed, {
      contentType: 'image/jpeg',
      cacheControl: '31536000',
      upsert: true,
    })
    if (upError) {
      console.error(`  ✗ upload ${bucket}/${path} : ${upError.message}`)
      return null
    }
  }

  return saved
}

;(async () => {
  console.log(`BuySellSeychelles — Recompression Storage ${APPLY ? '(APPLY)' : '(dry-run, utiliser --apply pour écrire)'}\n`)

  let totalSaved = 0
  let totalFiles = 0

  for (const { name, maxWidth } of BUCKETS) {
    console.log(`Bucket: ${name}`)
    const paths = await listAllFiles(name)
    console.log(`  ${paths.length} fichier(s) trouvé(s)`)

    for (const path of paths) {
      const saved = await processFile(name, path, maxWidth)
      if (saved) {
        totalSaved += saved
        totalFiles += 1
      }
    }
  }

  console.log(`\n${APPLY ? 'Terminé' : 'Simulation terminée'} — ${totalFiles} image(s) compressée(s), ${(totalSaved / 1024 / 1024).toFixed(1)} MB économisés par vue.`)
  if (!APPLY) console.log('Relancer avec --apply pour appliquer réellement ces changements.')
})()
