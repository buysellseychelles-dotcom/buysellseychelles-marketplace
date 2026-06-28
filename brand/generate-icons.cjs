/*
 * Generate all raster brand assets from brand/logo.svg.
 *
 * Usage:  node brand/generate-icons.cjs
 *
 * Outputs into ../public (web) and ./ (mobile-reusable master PNG).
 * Re-run whenever brand/logo.svg changes.
 */
const fs = require('fs')
const path = require('path')
const sharp = require(path.join(__dirname, '..', 'node_modules', 'sharp'))

const BRAND_DIR = __dirname
const PUBLIC_DIR = path.join(__dirname, '..', 'public')
const SPLASH_DIR = path.join(PUBLIC_DIR, 'splash')
const LOGO_SVG = path.join(BRAND_DIR, 'logo.svg')
const svg = fs.readFileSync(LOGO_SVG)

// Official Seychelles brand palette (see memory/design-system.md)
const BRAND = { blue: '#003F87', yellow: '#FCD116', red: '#BE0027', white: '#FFFFFF', green: '#007A3D' }

// "Seychelles hero" gradient (135deg) — used for splash screens & OG image
const HERO_STOPS = `
  <stop offset="0%"   stop-color="${BRAND.blue}"/>
  <stop offset="22%"  stop-color="${BRAND.blue}"/>
  <stop offset="44%"  stop-color="${BRAND.yellow}"/>
  <stop offset="66%"  stop-color="${BRAND.red}"/>
  <stop offset="88%"  stop-color="${BRAND.green}"/>
  <stop offset="100%" stop-color="${BRAND.green}"/>`

// density bumps SVG raster quality for small sizes
const render = (size) =>
  sharp(svg, { density: 384 }).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })

// iOS launch images: { file, CSS width, CSS height, device-pixel-ratio }
// physical px = w*r × h*r (must match the filename). Keep in sync with app/layout.tsx.
const APPLE_SPLASH = [
  { file: 'apple-splash-750x1334.png',  w: 375,  h: 667,  r: 2 },
  { file: 'apple-splash-828x1792.png',  w: 414,  h: 896,  r: 2 },
  { file: 'apple-splash-1125x2436.png', w: 375,  h: 812,  r: 3 },
  { file: 'apple-splash-1242x2688.png', w: 414,  h: 896,  r: 3 },
  { file: 'apple-splash-1170x2532.png', w: 390,  h: 844,  r: 3 },
  { file: 'apple-splash-1284x2778.png', w: 428,  h: 926,  r: 3 },
  { file: 'apple-splash-1179x2556.png', w: 393,  h: 852,  r: 3 },
  { file: 'apple-splash-1290x2796.png', w: 430,  h: 932,  r: 3 },
  { file: 'apple-splash-1488x2266.png', w: 744,  h: 1133, r: 2 },
  { file: 'apple-splash-1640x2360.png', w: 820,  h: 1180, r: 2 },
  { file: 'apple-splash-2048x2732.png', w: 1024, h: 1366, r: 2 },
]

async function main() {
  const square = [
    [path.join(PUBLIC_DIR, 'icon-192.png'), 192],
    [path.join(PUBLIC_DIR, 'icon-512.png'), 512],
    [path.join(PUBLIC_DIR, 'apple-icon.png'), 180],
    [path.join(PUBLIC_DIR, 'icon-light-32x32.png'), 32],
    [path.join(PUBLIC_DIR, 'icon-dark-32x32.png'), 32],
    [path.join(PUBLIC_DIR, 'placeholder-logo.png'), 512],
    [path.join(BRAND_DIR, 'logo-1024.png'), 1024],
  ]
  for (const [out, size] of square) {
    await render(size).png().toFile(out)
    console.log('wrote', path.relative(path.join(__dirname, '..'), out), `${size}x${size}`)
  }

  // favicon.ico (32px) for legacy browsers / tabs
  await render(32).toFormat('png').toFile(path.join(PUBLIC_DIR, 'favicon-32.png'))

  // Maskable 512: solid brand-blue full-bleed square with the logo inside the
  // ~80% Android safe zone (so adaptive icon masks never clip the logo).
  {
    const M = 512
    const inner = Math.round(M * 0.72) // logo occupies 72% → comfortable safe zone
    const logoInner = await render(inner).png().toBuffer()
    const maskBg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${M}" height="${M}"><rect width="${M}" height="${M}" fill="${BRAND.blue}"/></svg>`,
    )
    await sharp(maskBg)
      .composite([{ input: logoInner, gravity: 'center' }])
      .png()
      .toFile(path.join(PUBLIC_DIR, 'icon-maskable-512.png'))
    console.log('wrote public/icon-maskable-512.png 512x512 (maskable)')
  }

  // iOS splash screens: Seychelles hero gradient (135deg) + centered logo.
  for (const s of APPLE_SPLASH) {
    const W = s.w * s.r
    const H = s.h * s.r
    const logoSize = Math.round(Math.min(W, H) * 0.3)
    const logoBuf = await render(logoSize).png().toBuffer()
    const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">${HERO_STOPS}</linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
    </svg>`)
    await sharp(bg)
      .composite([{ input: logoBuf, gravity: 'center' }])
      .png()
      .toFile(path.join(SPLASH_DIR, s.file))
    console.log(`wrote public/splash/${s.file} ${W}x${H}`)
  }

  // Open Graph image 1200x630: hero gradient bg + centered logo + wordmark
  const W = 1200, H = 630
  const ogBg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">${HERO_STOPS}</linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect width="${W}" height="${H}" fill="rgba(0,0,0,0.34)"/>
    <text x="600" y="540" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="62" fill="#ffffff">BuySellSeychelles</text>
    <text x="600" y="585" text-anchor="middle" font-family="Arial, sans-serif" font-weight="400" font-size="28" fill="rgba(255,255,255,0.88)">The Seychelles marketplace</text>
  </svg>`)
  const logo320 = await render(300).png().toBuffer()
  await sharp(ogBg)
    .composite([{ input: logo320, top: 90, left: Math.round(W / 2 - 150) }])
    .png()
    .toFile(path.join(PUBLIC_DIR, 'og-image.png'))
  console.log('wrote public/og-image.png 1200x630')

  // email logo: white-padded PNG on transparent, 240px (crisp in email clients)
  await render(240).png().toFile(path.join(PUBLIC_DIR, 'logo-email.png'))
  console.log('wrote public/logo-email.png 240x240')

  // web-served copy of the master SVG
  fs.copyFileSync(LOGO_SVG, path.join(PUBLIC_DIR, 'brand', 'logo.svg'))
  fs.copyFileSync(LOGO_SVG, path.join(PUBLIC_DIR, 'icon.svg'))
  fs.copyFileSync(LOGO_SVG, path.join(PUBLIC_DIR, 'logo.svg'))
  console.log('copied SVG to public/brand/logo.svg, public/icon.svg, public/logo.svg')
}

main().then(() => console.log('done')).catch((e) => { console.error(e); process.exit(1) })
