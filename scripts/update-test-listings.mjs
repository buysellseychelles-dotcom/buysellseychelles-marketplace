/**
 * update-test-listings.mjs
 * Met à jour les 7 annonces de test : titre, description, prix,
 * supprime les anciennes images du Storage et de listing_images,
 * puis uploade les nouvelles images depuis scripts/images/.
 *
 * Usage :
 *   node scripts/update-test-listings.mjs
 *
 * Pré-requis : placer les 7 images dans scripts/images/ avec les noms
 * indiqués dans IMAGE_FILES ci-dessous avant de lancer le script.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Charger .env.local manuellement (compatible toutes versions Node)
const envRaw = readFileSync(join(__dirname, '..', '.env.local'), 'utf8')
for (const line of envRaw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) {
    process.env[m[1]] = m[2].replace(/^"|"$/g, '').trim()
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET       = 'listings'

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local')
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ---------------------------------------------------------------------------
// Données des 7 annonces
// ---------------------------------------------------------------------------
const UPDATES = [
  {
    id: 'ab855678-c80c-4e29-b792-470e6a452b12',
    title: 'Professional Music Lessons — Guitar & Piano — All Levels — TEST VERSION',
    description: '[TEST LISTING — Site currently in beta] Experienced music teacher offering private guitar and piano lessons for all ages and levels, from complete beginners to advanced students. 10 years of teaching experience. Lessons available at your home or online via video call. Flexible scheduling including evenings and weekends. First trial lesson free. Instruments not required for the first lesson. Based in Mont Fleuri, Mahé, available island-wide.',
    price: 500,
    currency: 'SCR',
    imageFile: '1-music-lessons.jpg',
  },
  {
    id: '13f1f604-d748-43b6-bc1a-18ba4ce00b33',
    title: 'Looking to Buy — Second Hand Road Bicycle — Budget 4,000 SCR — TEST VERSION',
    description: '[TEST LISTING — Site currently in beta] Looking to buy a second hand road bicycle in good working condition. Budget up to 4,000 SCR. Preferred brands: Trek, Giant, Specialized or similar. Frame size 54-56cm (height 175-180cm). Must have working gears and brakes. Prefer models from 2018 onwards. Happy to consider any island but prefer Mahé for collection. Please send photos and asking price by message. Serious sellers only.',
    price: null,
    currency: 'SCR',
    imageFile: '2-bicycle.jpg',
  },
  {
    id: '86a68766-fc2d-4a2d-875d-8f0ed7ea4474',
    title: 'Full Day Island Hopping Tour — Mahé, Praslin & La Digue — TEST VERSION',
    description: '[TEST LISTING — Site currently in beta] Experience the best of the Seychelles with our full day island hopping tour visiting Mahé, Praslin and La Digue. Includes snorkelling at Anse Lazio, visit to Vallée de Mai Nature Reserve, and cycling on La Digue. All equipment, boat transfers, and a traditional Creole lunch included. Maximum 8 guests per tour for a personalised experience. Departures from Eden Island Marina every Tuesday and Friday at 7:30am. Booking required 48h in advance.',
    price: 3800,
    currency: 'SCR',
    imageFile: '3-island-tour.jpg',
  },
  {
    id: '0b0d875b-1165-4682-9207-f15f410da4a5',
    title: 'Experienced Chef Required — Restaurant Victoria — Full Time — TEST VERSION',
    description: '[TEST LISTING — Site currently in beta] We are looking for an experienced chef to join our team at a busy restaurant in Victoria, Mahé. Requirements: minimum 3 years experience in a professional kitchen, knowledge of Creole and international cuisine, ability to work under pressure, team player. Full time position with competitive salary, meals included, and possibility of accommodation assistance. Please send your CV and references by message. Immediate start available.',
    price: null,
    currency: 'SCR',
    imageFile: '4-chef.jpg',
  },
  {
    id: '7880241c-1855-47e7-a13e-f9b720524769',
    title: "Free — Children's Books Collection (20+ Books) — TEST VERSION",
    description: '[TEST LISTING — Site currently in beta] Giving away a collection of over 20 children\'s books in good condition. Ages 3 to 10 years. Titles include Roald Dahl classics, Dr. Seuss, and various educational books. Some light wear on covers but all pages intact and readable. Perfect for a school, library or family with young children. Collection only from Takamaka, Mahé. First come, first served — please message before coming.',
    price: 0,
    currency: 'SCR',
    imageFile: '5-books.jpg',
  },
  {
    id: '08c37c02-4e1e-45c6-be40-16d13983901d',
    title: 'Golden Retriever Puppies — 8 Weeks Old — Vaccinated — TEST VERSION',
    description: '[TEST LISTING — Site currently in beta] Beautiful Golden Retriever puppies available to loving homes. 8 weeks old, fully vaccinated and dewormed. Both parents are healthy, friendly and on site for viewing. Puppies are well socialised and have been raised in a family home environment. Microchipped and health checked by a local vet. Suitable for families, couples and individuals. Serious inquiries only — we want the best homes for our puppies. Located in Anse Etoile, Mahé.',
    price: 5500,
    currency: 'SCR',
    imageFile: '6-puppy.jpg',
  },
  {
    id: '5b3063b0-d551-4fd2-9f26-a88379e3f03c',
    title: 'Stunning Beachfront Villa — 3 Bedrooms — Beau Vallon — TEST VERSION',
    description: '[TEST LISTING — Site currently in beta] Beautiful fully furnished 3-bedroom beachfront villa available for short and long-term rental in Beau Vallon, Mahé. Features include private pool, fully equipped kitchen, air conditioning in all rooms, outdoor terrace with direct beach access, and secure parking. Perfect for families or couples seeking a luxury Seychelles experience. WiFi included. Minimum stay 7 nights. Rates negotiable for long-term stays.',
    price: 12000,
    currency: 'SCR',
    imageFile: '7-villa.jpg',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const PUBLIC_MARKER = '/storage/v1/object/public/'

function storagePathFromUrl(url) {
  if (!url) return null
  const marker = `${PUBLIC_MARKER}${BUCKET}/`
  const i = url.indexOf(marker)
  if (i === -1) return null
  return decodeURIComponent(url.slice(i + marker.length).split('?')[0])
}

function mimeType(filename) {
  if (filename.endsWith('.png'))  return 'image/png'
  if (filename.endsWith('.webp')) return 'image/webp'
  return 'image/jpeg'
}

// ---------------------------------------------------------------------------
// Étape 1 — Mettre à jour title / description / price
// ---------------------------------------------------------------------------
async function updateListingsText() {
  console.log('\n=== Étape 1 : Mise à jour du texte des annonces ===')
  for (const item of UPDATES) {
    const { error } = await supabase
      .from('listings')
      .update({ title: item.title, description: item.description, price: item.price, currency: item.currency })
      .eq('id', item.id)
    if (error) {
      console.error(`  ✗ ${item.id} — ${error.message}`)
    } else {
      console.log(`  ✓ ${item.id.slice(0, 8)}… — "${item.title.slice(0, 50)}…"`)
    }
  }
}

// ---------------------------------------------------------------------------
// Étape 2 — Supprimer anciennes images (Storage + listing_images)
// ---------------------------------------------------------------------------
async function deleteOldImages() {
  console.log('\n=== Étape 2 : Suppression des anciennes images ===')
  const listingIds = UPDATES.map(u => u.id)

  // Récupérer les URLs existantes
  const { data: images, error: fetchErr } = await supabase
    .from('listing_images')
    .select('image_url, listing_id')
    .in('listing_id', listingIds)

  if (fetchErr) {
    console.error('  ✗ Impossible de lire listing_images :', fetchErr.message)
    return
  }

  console.log(`  → ${images?.length ?? 0} image(s) trouvée(s) en base`)

  // Extraire les chemins Storage (uniquement les URLs Supabase, pas Unsplash)
  const paths = (images ?? [])
    .map(img => storagePathFromUrl(img.image_url))
    .filter(Boolean)

  if (paths.length > 0) {
    const { error: storageErr } = await supabase.storage.from(BUCKET).remove(paths)
    if (storageErr) {
      console.error('  ✗ Erreur suppression Storage :', storageErr.message)
    } else {
      console.log(`  ✓ ${paths.length} fichier(s) supprimé(s) du Storage`)
    }
  } else {
    console.log('  → Aucun fichier Storage à supprimer (images Unsplash ou listing vierge)')
  }

  // Supprimer les lignes listing_images
  const { error: deleteErr } = await supabase
    .from('listing_images')
    .delete()
    .in('listing_id', listingIds)

  if (deleteErr) {
    console.error('  ✗ Erreur suppression listing_images :', deleteErr.message)
  } else {
    console.log(`  ✓ Lignes listing_images supprimées pour les ${listingIds.length} annonces`)
  }
}

// ---------------------------------------------------------------------------
// Étape 3 — Uploader nouvelles images et insérer dans listing_images
// ---------------------------------------------------------------------------
async function uploadNewImages() {
  console.log('\n=== Étape 3 : Upload des nouvelles images ===')
  const imagesDir = join(__dirname, 'images')

  for (const item of UPDATES) {
    const localPath = join(imagesDir, item.imageFile)
    if (!existsSync(localPath)) {
      console.warn(`  ⚠ Fichier manquant, image ignorée : ${localPath}`)
      continue
    }

    const fileData = readFileSync(localPath)
    const storagePath = `${item.id}/${item.imageFile}`
    const mime = mimeType(item.imageFile)

    // Upload dans Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileData, { contentType: mime, upsert: true })

    if (uploadErr) {
      console.error(`  ✗ Upload Storage [${item.imageFile}] : ${uploadErr.message}`)
      continue
    }

    // Obtenir l'URL publique
    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath)
    const publicUrl = publicData?.publicUrl

    // Insérer dans listing_images
    const { error: insertErr } = await supabase
      .from('listing_images')
      .insert({ listing_id: item.id, image_url: publicUrl })

    if (insertErr) {
      console.error(`  ✗ Insert listing_images [${item.id.slice(0, 8)}…] : ${insertErr.message}`)
    } else {
      console.log(`  ✓ ${item.imageFile} → ${publicUrl.slice(0, 80)}…`)
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
;(async () => {
  console.log('BuySellSeychelles — Mise à jour des 7 annonces de test')
  console.log(`Supabase : ${SUPABASE_URL}`)

  await updateListingsText()
  await deleteOldImages()
  await uploadNewImages()

  console.log('\n=== Terminé ===')
})()