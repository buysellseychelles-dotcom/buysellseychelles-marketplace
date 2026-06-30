import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // Le SW doit toujours être revalidé : pas de mise en cache CDN.
        // Service-Worker-Allowed: / autorise explicitement le scope racine.
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        // Le manifest doit être servi avec le bon Content-Type et sans cache long.
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          // Empêche l'affichage dans des iframes (clickjacking)
          { key: 'X-Frame-Options',           value: 'DENY' },
          // Empêche le MIME sniffing
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          // Contrôle les informations de référence envoyées
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          // Limite les fonctionnalités du navigateur
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          // Protection XSS pour les vieux navigateurs
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          // Force HTTPS (HSTS) — activé, le domaine est en HTTPS stable
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        // API routes : pas de mise en cache des données sensibles
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },
    ]
  },
}

// Wrappe la config avec Sentry. L'upload des source maps ne se fait que si
// SENTRY_AUTH_TOKEN / SENTRY_ORG / SENTRY_PROJECT sont définis (sinon ignoré sans erreur).
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Réduit les logs pendant le build, sauf en CI.
  silent: !process.env.CI,
  // Améliore la lisibilité des stack traces côté navigateur.
  widenClientFileUpload: true,
  // Retire les logs de debug Sentry du bundle de production (préserve le quota et allège le bundle).
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },
  // Masque les requêtes Sentry derrière une route de votre domaine (contourne les ad-blockers).
  tunnelRoute: '/monitoring',
})
