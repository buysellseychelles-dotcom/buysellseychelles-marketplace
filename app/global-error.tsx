'use client'

// Capture les erreurs critiques de rendu React (qui plantent toute la page)
// et les envoie à Sentry, puis affiche un écran de secours.
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: 24, margin: 0, background: '#f9fafb' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: '#6b7280', marginBottom: 20 }}>
            Our team has been notified automatically. You can try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
          >
            Reload the page
          </button>
        </div>
      </body>
    </html>
  )
}
