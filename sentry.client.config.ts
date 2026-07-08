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
      // Bruit spécifique aux navigateurs intégrés Facebook / Instagram / Twitter (in-app browser) :
      // erreurs de leur propre code injecté, pas du site.
      "undefined is not an object (evaluating 'window.webkit.messageHandlers')",
      'Error invoking postMessage: Java object is gone',
      'Error invoking enableButtonsClickedMetaDataLogging: Java object is gone',
      'Error invoking enableDidUserTypeOnKeyboardLogging: Java object is gone',
      'Connection closed.',
      /Invalid or unexpected token/,
      // Safari (parseur natif de données structurées pour Siri/Spotlight) parcourt
      // récursivement nos blocs JSON-LD et appelle .toLowerCase() sur "@context" même
      // sur des sous-objets imbriqués (Offer, Person, ListItem...) qui n'en ont pas,
      // conformément à la spec schema.org. Notre JSON-LD est correct, c'est un bug
      // du parseur tiers, pas du site.
      /undefined is not an object \(evaluating '.*@context.*\.toLowerCase'\)/,
    ],
    beforeSend(event) {
      // Filtre global : toute erreur détectée comme provenant du navigateur
      // intégré Facebook/Instagram/Twitter est ignorée, même les variantes
      // futures non listées explicitement ci-dessus.
      const browserName = event.contexts?.browser?.name || ''
      if (/facebook|instagram|twitter/i.test(browserName)) {
        return null
      }

      // "Invalid or unexpected token" provenant spécifiquement du script
      // browser_declutter injecté par ces navigateurs intégrés.
      const message = event.exception?.values?.[0]?.value || event.message || ''
      const frames = event.exception?.values?.flatMap((v) => v.stacktrace?.frames || []) || []
      const fromBrowserDeclutter = frames.some((f) => f.filename?.includes('browser_declutter'))
      if (fromBrowserDeclutter && /Invalid or unexpected token/i.test(message)) {
        return null
      }

      return event
    },
  })
}