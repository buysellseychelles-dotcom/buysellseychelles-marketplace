/*
 * Generate Expo/React Native mobile app assets from brand/logo.svg.
 *
 * Usage (from the web project root):
 *   node brand/generate-mobile-assets.cjs
 *
 * Outputs to ../../mobile/assets/ (relative to this script).
 *
 * Assets produced:
 *   icon.png           – 1024x1024, full-bleed Seychelles flag mark, unmodified logo.svg
 *   adaptive-icon.png  – 1024x1024, same full-bleed mark (Android adaptive foreground)
 *   splash.png         – 1024x1024, white bg + centered logo (square, works with resizeMode="contain")
 *   favicon.png        – 48x48 for Expo web
 *
 * Note on the app icon: two things were tried and reverted here, kept as history
 * for whoever touches this next —
 *   1. Transparent padding around a shrunk mark → created a visible double-frame
 *      against Android's solid adaptiveIcon.backgroundColor (two different rounded
 *      shapes stacked: the SVG's own rx-rounded corners + Android's own mask).
 *   2. Shrinking just the "BS" text's font-size via regex, keeping the original
 *      x/y baseline → threw off the hand-tuned centering (baseline offset was
 *      calibrated for font-size 230, not the smaller size).
 *   3. Padding with solid #003F87 (matching the mark's own background) instead of
 *      transparent → the mark's own blue field merges into the padding on the
 *      sides that are still blue before the flag diagonal starts, producing a
 *      lopsided blob instead of a clean square.
 * Full-bleed, completely unmodified logo.svg (this file) avoids all three: the
 * mark's own rx-rounded corners are the only "frame", and the "BS" text keeps its
 * original, correctly-centered position.
 */
const fs = require('fs')
const path = require('path')
const sharp = require(path.join(__dirname, '..', 'node_modules', 'sharp'))

const BRAND_DIR = __dirname
const MOBILE_ASSETS = path.join(__dirname, '..', '..', 'mobile', 'assets')
const LOGO_SVG = path.join(BRAND_DIR, 'logo.svg')
const svg = fs.readFileSync(LOGO_SVG)

// Render SVG at given square size, full-bleed, transparent background.
const render = (source, size) =>
  sharp(source, { density: 384 }).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(MOBILE_ASSETS, { recursive: true })

  // 1. icon.png — 1024x1024, full-bleed. iOS applies its own rounded-rect mask on top.
  await render(svg, 1024).png().toFile(path.join(MOBILE_ASSETS, 'icon.png'))
  console.log('wrote mobile/assets/icon.png 1024x1024')

  // 2. adaptive-icon.png — 1024x1024, full-bleed. Android adaptive icon foreground;
  //    app.json's adaptiveIcon.backgroundColor (#003F87) never actually shows since
  //    this covers the whole canvas — kept only as a safety fallback.
  await render(svg, 1024).png().toFile(path.join(MOBILE_ASSETS, 'adaptive-icon.png'))
  console.log('wrote mobile/assets/adaptive-icon.png 1024x1024')

  // 3. splash.png — 1024x1024, plain white background + centered logo, large and
  //    bold (72% of canvas width — matches the size other apps use for a splash
  //    mark, e.g. Play Console's own splash). Square + resizeMode:"contain"
  //    (app.json) means it scales identically, centered, on any device aspect
  //    ratio without cropping or letterboxing surprises.
  {
    const SIZE = 1024
    const logoSize = Math.round(SIZE * 0.72)
    const logoBuf = await render(svg, logoSize).png().toBuffer()
    const offset = Math.round((SIZE - logoSize) / 2)

    await sharp({
      create: { width: SIZE, height: SIZE, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
    })
      .composite([{ input: logoBuf, left: offset, top: offset }])
      .png()
      .toFile(path.join(MOBILE_ASSETS, 'splash.png'))
    console.log(`wrote mobile/assets/splash.png ${SIZE}x${SIZE}`)
  }

  // 4. favicon.png — 48x48 for Expo web target
  await render(svg, 48).png().toFile(path.join(MOBILE_ASSETS, 'favicon.png'))
  console.log('wrote mobile/assets/favicon.png 48x48')

  console.log('\nAll mobile assets generated in mobile/assets/')
}

main().then(() => console.log('Done.')).catch((e) => { console.error(e); process.exit(1) })
