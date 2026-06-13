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

export default nextConfig
