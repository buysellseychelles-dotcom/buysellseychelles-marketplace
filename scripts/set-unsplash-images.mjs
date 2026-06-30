/**
 * set-unsplash-images.mjs
 * Insère des photos Unsplash assorties dans listing_images pour les 7 annonces de test.
 * Les anciennes images ont déjà été supprimées par update-test-listings.mjs.
 *
 * Usage : node scripts/set-unsplash-images.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

// ---------------------------------------------------------------------------
// Photos Unsplash assorties au contenu de chaque annonce
// ---------------------------------------------------------------------------
const IMAGES = [
  {
    id: 'ab855678-c80c-4e29-b792-470e6a452b12',
    label: 'Music Lessons — Guitar & Piano',
    urls: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
      'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800&q=80',
    ],
  },
  {
    id: '13f1f604-d748-43b6-bc1a-18ba4ce00b33',
    label: 'Road Bicycle Wanted',
    urls: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
    ],
  },
  {
    id: '86a68766-fc2d-4a2d-875d-8f0ed7ea4474',
    label: 'Island Hopping Tour',
    urls: [
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    ],
  },
  {
    id: '0b0d875b-1165-4682-9207-f15f410da4a5',
    label: 'Chef Required',
    urls: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
      'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=800&q=80',
    ],
  },
  {
    id: '7880241c-1855-47e7-a13e-f9b720524769',
    label: "Children's Books",
    urls: [
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
    ],
  },
  {
    id: '08c37c02-4e1e-45c6-be40-16d13983901d',
    label: 'Golden Retriever Puppies',
    urls: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=80',
    ],
  },
  {
    id: '5b3063b0-d551-4fd2-9f26-a88379e3f03c',
    label: 'Beachfront Villa',
    urls: [
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    ],
  },
]

// ---------------------------------------------------------------------------
// Vider d'abord listing_images (au cas où le script serait relancé)
// ---------------------------------------------------------------------------
async function clearExisting() {
  const ids = IMAGES.map(i => i.id)
  const { error } = await supabase
    .from('listing_images')
    .delete()
    .in('listing_id', ids)
  if (error) console.warn('  ⚠ Clear listing_images :', error.message)
}

// ---------------------------------------------------------------------------
// Insérer les nouvelles URLs
// ---------------------------------------------------------------------------
async function insertImages() {
  for (const item of IMAGES) {
    for (const url of item.urls) {
      const { error } = await supabase
        .from('listing_images')
        .insert({ listing_id: item.id, image_url: url })
      if (error) {
        console.error(`  ✗ [${item.label}] ${url.slice(0, 60)}… — ${error.message}`)
      } else {
        console.log(`  ✓ [${item.label}] ${url.slice(47, 80)}…`)
      }
    }
  }
}

;(async () => {
  console.log('BuySellSeychelles — Insertion photos Unsplash\n')
  await clearExisting()
  await insertImages()
  console.log('\n✓ Terminé — 14 photos insérées pour 7 annonces')
})()