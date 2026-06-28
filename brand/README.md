# BuySellSeychelles — Brand assets

Single source of truth for the BuySellSeychelles logo, shared by the **web app**
and the **future mobile app**.

## Files

| File | Use |
|------|-----|
| `logo.svg` | **Master** vector logo. Edit this one; everything else is generated from it. |
| `logo-1024.png` | High-res raster master (1024×1024, transparent corners). Import into the mobile app (React Native / Expo / iOS / Android) and let the build tooling downscale. |
| `generate-icons.cjs` | Regenerates every raster asset from `logo.svg`. |

## Logo specs

- Rounded square (`rx = 110 / 500 ≈ 22%`), blue field `#0b3d91`.
- Seychelles flag diagonal fan: `#fcd116` / `#d62828` / `#ffffff` / `#0a7d3e`.
- "BS" wordmark in white with a black outline (Arial Black / Impact, weight 900).

## Regenerating assets

From the repo root:

```bash
node brand/generate-icons.cjs
```

This writes to `../public/`:

- `icon-192.png`, `icon-512.png` — PWA icons + push-notification icon
- `apple-icon.png` (180) — iOS home-screen icon
- `icon-light-32x32.png`, `icon-dark-32x32.png`, `favicon-32.png` — favicons
- `icon.svg`, `logo.svg`, `brand/logo.svg` — SVG copies served by the web app
- `og-image.png` (1200×630) — social share image (Open Graph / Twitter)
- `logo-email.png` (240) — logo embedded in transactional emails (PNG because
  email clients like Gmail do not render SVG)

…and `logo-1024.png` next to this README.

## Where the logo is used on the web

- Header: `components/app-header.tsx` (+ legacy `components/header.tsx`)
- Footer: `components/site-footer.tsx` (+ legacy `components/footer.tsx`)
- Reusable component: `components/brand-logo.tsx` → renders `/brand/logo.svg`
- Auth pages: `app/login/page.tsx`, `app/auth/callback/page.tsx`, `app/not-found.tsx`
- Emails: `app/api/auth/welcome`, `app/api/notify/message`, `app/api/verify-identity`,
  `lib/identity-verification.ts`, `supabase-email-template-confirmation.html`
- Favicon / PWA / OG: `app/layout.tsx` metadata + `public/manifest.json`

## Mobile app

Use `logo.svg` (vector) or `logo-1024.png` (raster) directly. For app icons,
feed `logo-1024.png` to the platform icon generator (e.g. `expo` `app.json`
`icon`, or Xcode / Android `mipmap`). Keep this folder as the canonical source —
do not fork the logo into the mobile repo.
