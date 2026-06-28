import './globals.css'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import AppHeader from '@/components/app-header'
import MobileNav from '@/components/mobile-nav'
import SiteFooter from '@/components/site-footer'
import OnlineTracker from '@/components/online-tracker'
import PushInit from '@/components/push-init'
import CookieBanner from '@/components/cookie-banner'
import InstallPrompt from '@/components/install-prompt'
import { LangProvider } from '@/lib/lang-context'
import { SITE_URL, SITE_NAME } from '@/lib/site'

const GA_ID = 'G-CZ9881KKHG'

// Splash screens iOS : { fichier, largeur CSS, hauteur CSS, device-pixel-ratio }
const APPLE_SPLASH = [
  { file: 'apple-splash-750x1334.png',  w: 375,  h: 667,  r: 2 }, // SE, 6/7/8
  { file: 'apple-splash-828x1792.png',  w: 414,  h: 896,  r: 2 }, // XR, 11
  { file: 'apple-splash-1125x2436.png', w: 375,  h: 812,  r: 3 }, // X, XS, 11 Pro
  { file: 'apple-splash-1242x2688.png', w: 414,  h: 896,  r: 3 }, // XS Max, 11 Pro Max
  { file: 'apple-splash-1170x2532.png', w: 390,  h: 844,  r: 3 }, // 12, 13, 14
  { file: 'apple-splash-1284x2778.png', w: 428,  h: 926,  r: 3 }, // 12/13 Pro Max, 14 Plus
  { file: 'apple-splash-1179x2556.png', w: 393,  h: 852,  r: 3 }, // 14 Pro, 15, 15 Pro, 16
  { file: 'apple-splash-1290x2796.png', w: 430,  h: 932,  r: 3 }, // 14 Pro Max, 15 Pro Max, 16 Plus
  { file: 'apple-splash-1488x2266.png', w: 744,  h: 1133, r: 2 }, // iPad mini 6
  { file: 'apple-splash-1640x2360.png', w: 820,  h: 1180, r: 2 }, // iPad Air 11"
  { file: 'apple-splash-2048x2732.png', w: 1024, h: 1366, r: 2 }, // iPad Pro 12.9"
]

export const viewport: Viewport = {
  themeColor: '#0b3d91',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: 'RMzmAe_riaAMhcg5nMZo8ne04M4keyi_qslUeq51b_M',
  },
  title: 'BuySellSeychelles – The Seychelles Marketplace',
  description: 'Buy and sell easily in the Seychelles. Cars, real estate, electronics, services and more across Mahé, Praslin and La Digue.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BuySell',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'BuySellSeychelles',
    description: 'The Seychelles marketplace',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_SC',
    type: 'website',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: 'BuySellSeychelles' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuySellSeychelles',
    description: 'The Seychelles marketplace',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* iOS PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BuySell" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />

        {/* Splash screens iOS — une image par appareil via media queries */}
        {APPLE_SPLASH.map((s) => (
          <link
            key={s.file}
            rel="apple-touch-startup-image"
            href={`/splash/${s.file}`}
            media={`(device-width: ${s.w}px) and (device-height: ${s.h}px) and (-webkit-device-pixel-ratio: ${s.r}) and (orientation: portrait)`}
          />
        ))}

        {/* Capture l'événement d'installation PWA dès le chargement (Chrome le
            déclenche souvent avant le montage de React → sinon il est perdu) */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('beforeinstallprompt', function(e) {
              e.preventDefault();
              window.__bipEvent = e;
              window.dispatchEvent(new Event('bip-available'));
            });
            window.addEventListener('appinstalled', function() {
              window.__bipEvent = null;
              window.dispatchEvent(new Event('bip-installed'));
            });
          `
        }} />

        {/* Service Worker */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .catch(function(err) { console.log('SW error:', err); });
              });
            }
          `
        }} />
      </head>
      <body className="bg-gray-50 pb-[60px] md:pb-0">
        {/* Données structurées globales : identité du site + recherche (rich results Google) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
            logo: `${SITE_URL}/icon-512.png`,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
            potentialAction: {
              '@type': 'SearchAction',
              target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?q={search_term_string}` },
              'query-input': 'required name=search_term_string',
            },
          },
        ]) }} />
        {/* GA chargé uniquement si consentement accepté (géré par cookie-banner.tsx) */}
        <Script id="ga-consent-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          if (localStorage.getItem('cookie_consent') === 'accepted') {
            var s = document.createElement('script');
            s.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_ID}';
            s.async = true;
            document.head.appendChild(s);
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
            window.gaLoaded = true;
          }
        `}} />
        <LangProvider>
          <OnlineTracker />
          <PushInit />
          <AppHeader />
          {children}
          <SiteFooter />
          <MobileNav />
          <CookieBanner />
          <InstallPrompt />
        </LangProvider>
      </body>
    </html>
  )
}
