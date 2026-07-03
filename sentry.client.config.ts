// Configuration Sentry côté client (navigateur).
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    enabled: process.env.NODE_ENV === 'production',
    tracesSampleRate: 0.1,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
    // Réduit le bruit : ignore les erreurs réseau bénignes côté client.
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Bruit spécifique aux navigateurs intégrés Facebook / Instagram (in-app browser)
      'Error invoking enableButtonsClickedMetaDataLogging: Java object is gone',
      "undefined is not an object (evaluating 'window.webkit.messageHandlers')",
    ],
  })
}