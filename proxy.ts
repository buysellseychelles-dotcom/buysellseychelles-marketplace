import { NextRequest, NextResponse } from 'next/server'

// ── Routes protégées (authentification requise) ─────────────────────────────
const PROTECTED_ROUTES = [
  '/post-ad',
  '/dashboard',
  '/my-listings',
  '/favorites',
  '/messages',
  '/conversations',
  '/notifications',
]

const ADMIN_ROUTES = ['/admin']

// ── Outils d'attaque connus ──────────────────────────────────────────────────
const BLOCKED_UA = [
  /sqlmap/i,
  /nikto/i,
  /masscan/i,
  /zgrab/i,
  /nessus/i,
  /burpsuite/i,
  /dirbuster/i,
  /dirb\b/i,
  /gobuster/i,
  /hydra/i,
  /medusa/i,
  /wfuzz/i,
  /nuclei\//i,
  /acunetix/i,
  /netsparker/i,
]

// ── Chemins d'attaque typiques ────────────────────────────────────────────────
const BLOCKED_PATHS = [
  '/wp-admin',
  '/wp-login',
  '/wp-content',
  '/wp-includes',
  '/phpmyadmin',
  '/.env',
  '/.git/',
  '/.htaccess',
  '/xmlrpc.php',
  '/config.php',
  '/setup.php',
  '/install.php',
  '/admin.php',
  '/web.config',
  '/server-status',
  '/dump.sql',
  '/shell',
  '/cgi-bin',
]

// ── Patterns suspects dans les query strings ──────────────────────────────────
const SUSPICIOUS_QS = [
  /(<script|javascript:|on\w+=|eval\()/i,
  /(\bUNION\b.{0,30}\bSELECT\b|\bDROP\b.{0,10}\bTABLE\b)/i,
  /(\/\.\.\/|%2e%2e%2f|%252e%252e)/i,
]

function getSessionFromCookies(request: NextRequest): { email?: string } | null {
  const projectRef = 'sywutvsmoccbmylbocex'

  const cookieValue =
    request.cookies.get(`sb-${projectRef}-auth-token`)?.value ||
    request.cookies.get(`sb-${projectRef}-auth-token.0`)?.value

  if (!cookieValue) return null

  try {
    const parsed = JSON.parse(cookieValue)
    const accessToken = parsed.access_token
    if (!accessToken) return null

    const payload = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64').toString('utf-8')
    )

    return { email: payload.email }
  } catch {
    return null
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ua = request.headers.get('user-agent') ?? ''

  // 1. Bloquer les outils d'attaque
  if (BLOCKED_UA.some(p => p.test(ua))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // 2. Bloquer les chemins suspects
  const pathLower = pathname.toLowerCase()
  if (BLOCKED_PATHS.some(prefix => pathLower.startsWith(prefix))) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // 3. Bloquer les query strings suspects sur les API
  if (pathname.startsWith('/api/')) {
    const qs = request.nextUrl.search
    if (qs) {
      let decoded = qs
      try { decoded = decodeURIComponent(qs) } catch { /* laisser tel quel */ }
      if (SUSPICIOUS_QS.some(p => p.test(qs) || p.test(decoded))) {
        return new NextResponse('Bad Request', { status: 400 })
      }
    }
  }

  const session = getSessionFromCookies(request)

  // 4. Protéger les routes utilisateur
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 5. Protéger les routes admin
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    const adminEmail = process.env.ADMIN_EMAIL
    if (!session || session.email !== adminEmail) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Tout sauf les assets statiques Next.js
    '/((?!_next/static|_next/image|favicon\\.ico|icon-|apple-icon|manifest\\.json|sw\\.js|workbox-).*)',
  ],
}
