import './globals.css'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import AppHeader from '@/components/app-header'
import MobileNav from '@/components/mobile-nav'
import SiteFooter from '@/components/site-footer'
import OnlineTracker from '@/components/online-tracker'
import PushInit from '@/components/push-init'
import CookieBanner from '@/components/cookie-banner'
import { LangProvider } from '@/lib/lang-context'
import { SITE_URL, SITE_NAME } from '@/lib/site'

const GA_ID = 'G-CZ9881KKHG'

export const viewport: Viewport = {
  themeColor: '#000000',
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BuySellSeychelles',
    description: 'The Seychelles marketplace',
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

        {/* Splash screens iOS (optionnel mais propre) */}
        <link rel="apple-touch-startup-image" href="/icon-512.png" />

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
        </LangProvider>
      </body>
    </html>
  )
}
