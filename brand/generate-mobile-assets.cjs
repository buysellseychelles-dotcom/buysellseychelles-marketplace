/*
 * Generate Expo/React Native mobile app assets from brand/logo.svg.
 *
 * Usage (from the web project root):
 *   node brand/generate-mobile-assets.cjs
 *
 * Outputs to ../../mobile/assets/ (relative to this script).
 *
 * Assets produced:
 *   icon.png           – 1024x1024 transparent bg, used by iOS + Android icon
 *   adaptive-icon.png  – 1024x1024 transparent bg, Android adaptive foreground
 *   splash.png         – 1284x2778 hero-gradient bg + centered logo (portrait)
 *   favicon.png        – 48x48 for Expo web
 */
const fs = require('fs')
const path = require('path')
const sharp = require(path.join(__dirname, '..', 'node_modules', 'sharp'))

const BRAND_DIR = __dirname
const MOBILE_ASSETS = path.join(__dirname, '..', '..', 'mobile', 'assets')
const LOGO_SVG = path.join(BRAND_DIR, 'logo.svg')
const svg = fs.readFileSync(LOGO_SVG)

// Official Seychelles brand palette
const BRAND = { blue: '#003F87', yellow: '#FCD116', red: '#BE0027', white: '#FFFFFF', green: '#007A3D' }

// Hero gradient (135deg) — same as web splash screens
const HERO_STOPS = `
  <stop offset="0%"   stop-color="${BRAND.blue}"/>
  <stop offset="22%"  stop-color="${BRAND.blue}"/>
  <stop offset="44%"  stop-color="${BRAND.yellow}"/>
  <stop offset="66%"  stop-color="${BRAND.red}"/>
  <stop offset="88%"  stop-color="${BRAND.green}"/>
  <stop offset="100%" stop-color="${BRAND.green}"/>`

// Render SVG at given square size with transparent background
const render = (size) =>
  sharp(svg, { density: 384 }).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(MOBILE_ASSETS, { recursive: true })

  // 1. icon.png — 1024x1024, transparent background
  //    Used as the main app icon (iOS applies its own rounded-rect mask)
  await render(1024).png().toFile(path.join(MOBILE_ASSETS, 'icon.png'))
  console.log('wrote mobile/assets/icon.png 1024x1024')

  // 2. adaptive-icon.png — 1024x1024, transparent background
  //    Android adaptive icon foreground; background color = #003F87 (set in app.json)
  //    Logo is centered within the 72% safe zone via the full 1024 canvas
  await render(1024).png().toFile(path.join(MOBILE_ASSETS, 'adaptive-icon.png'))
  console.log('wrote mobile/assets/adaptive-icon.png 1024x1024')

  // 3. splash.png — 1284x2778 (iPhone Pro Max @3x portrait)
  //    Seychelles hero gradient + centered BS logo at 30% of width
  //    expo-splash-screen resizeMode="cover" will scale to fill any device
  {
    const W = 1284
    const H = 2778
    const logoSize = Math.round(W * 0.42) // 42% of width ≈ nice focal point
    const logoBuf = await render(logoSize).png().toBuffer()

    const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">${HERO_STOPS}</linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
      <rect width="${W}" height="${H}" fill="rgba(0,0,0,0.18)"/>
    </svg>`)

    // Position logo at visual center (slightly above true center for optical balance)
    const logoLeft = Math.round((W - logoSize) / 2)
    const logoTop = Math.round(H * 0.35 - logoSize / 2)

    await sharp(bg)
      .composite([{ input: logoBuf, left: logoLeft, top: logoTop }])
      .png()
      .toFile(path.join(MOBILE_ASSETS, 'splash.png'))
    console.log(`wrote mobile/assets/splash.png ${W}x${H}`)
  }

  // 4. favicon.png — 48x48 for Expo web target
  await render(48).png().toFile(path.join(MOBILE_ASSETS, 'favicon.png'))
  console.log('wrote mobile/assets/favicon.png 48x48')

  console.log('\nAll mobile assets generated in mobile/assets/')
}

main().then(() => console.log('Done.')).catch((e) => { console.error(e); process.exit(1) })
