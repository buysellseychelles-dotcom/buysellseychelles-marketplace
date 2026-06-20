// Configuration Sentry côté navigateur (App Router, Next.js 15+/16).
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    enabled: process.env.NODE_ENV === 'production',
    tracesSampleRate: 0.1,
    // Session Replay désactivé par défaut pour préserver le quota gratuit.
    // Passez ces valeurs à >0 (ex: 0.1) si vous voulez rejouer les sessions avec erreur.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  })
}

// Permet à Sentry de suivre les navigations côté client (App Router).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
