/**
 * Rate limiter en mémoire — protection par IP contre spam/brute-force.
 * Fonctionne par instance serverless (suffisant pour protéger contre les attaques basiques).
 */

type Record = { count: number; resetAt: number }

const store = new Map<string, Record>()
let checkCount = 0

function cleanup() {
  if (++checkCount < 500) return
  checkCount = 0
  const now = Date.now()
  for (const [key, rec] of store.entries()) {
    if (now > rec.resetAt) store.delete(key)
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  cleanup()
  const now = Date.now()
  const rec = store.get(key)

  if (!rec || now > rec.resetAt) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  if (rec.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: rec.resetAt }
  }

  rec.count++
  return { allowed: true, remaining: limit - rec.count, resetAt: rec.resetAt }
}

export function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function tooManyRequests(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please wait and try again.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
      },
    }
  )
}

/**
 * Vérifie que la requête cron vient bien de Vercel (ou d'un appel interne autorisé).
 * Définir CRON_SECRET dans les variables d'environnement Vercel.
 * Si CRON_SECRET n'est pas défini, la vérification est ignorée (dev local).
 */
export function verifyCronSecret(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // désactivé en local sans variable
  const authHeader = req.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

/** Sanitise une chaîne pour éviter XSS et injections */
export function sanitize(value: string): string {
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
    .slice(0, 10000)
}

/** Vérifie qu'une chaîne ne contient pas de patterns SQL suspects */
export function hasSQLInjection(value: string): boolean {
  const SQL_PATTERNS = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bEXEC\b|\bEXECUTE\b)/i,
    /(--|\bOR\b\s+\d+=\d+|\bAND\b\s+\d+=\d+)/i,
    /('\s*OR\s*'1'\s*=\s*'1)/i,
  ]
  return SQL_PATTERNS.some(p => p.test(value))
}
