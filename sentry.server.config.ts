// Configuration Sentry côté serveur (Node.js runtime).
// Ce fichier est chargé via instrumentation.ts au démarrage du serveur.
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

// On n'initialise Sentry que si un DSN est fourni ET en production,
// pour ne pas polluer le quota gratuit avec les erreurs de développement.
if (dsn) {
  Sentry.init({
    dsn,
    enabled: process.env.NODE_ENV === 'production',
    // Surveillance des performances : 10 % des transactions (économise le quota gratuit).
    tracesSampleRate: 0.1,
    // Renseigne l'environnement pour distinguer prod / preview dans Sentry.
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  })
}
