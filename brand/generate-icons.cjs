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
const LOGO_SVG = path.join(BRAND_DIR, 'logo.svg')
const svg = fs.readFileSync(LOGO_SVG)

// density bumps SVG raster quality for small sizes
const render = (size) =>
  sharp(svg, { density: 384 }).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })

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

  // Open Graph image 1200x630: flag gradient bg + centered logo + wordmark
  const W = 1200, H = 630
  const ogBg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"  stop-color="#0b3d91"/>
        <stop offset="22%" stop-color="#0b3d91"/>
        <stop offset="40%" stop-color="#fcd116"/>
        <stop offset="55%" stop-color="#d62828"/>
        <stop offset="72%" stop-color="#ffffff"/>
        <stop offset="88%" stop-color="#0a7d3e"/>
        <stop offset="100%" stop-color="#0a7d3e"/>
      </linearGradient>
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
