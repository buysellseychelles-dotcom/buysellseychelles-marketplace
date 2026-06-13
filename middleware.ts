import { NextResponse, type NextRequest } from 'next/server'

// Outils d'attaque connus — bloqués à la frontière edge
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
  /python-httpx\/0\.[0-3]/i,
]

// Chemins typiques d'attaques et de scans (WordPress, PHP, configs exposées…)
const BLOCKED_PATH_PREFIXES = [
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
  '/server-info',
  '/.well-known/security',
  '/dump.sql',
  '/backup',
  '/shell',
  '/cgi-bin',
  '/etc/passwd',
  '/proc/self',
]

// Patterns suspects dans les query strings (XSS, SQLi, path traversal)
const SUSPICIOUS_QS = [
  /(<script|javascript:|on\w+=|eval\(|alert\()/i,
  /(\bUNION\b.{0,30}\bSELECT\b|\bDROP\b.{0,10}\bTABLE\b)/i,
  /(\/\.\.\/|\.\.\\|%2e%2e%2f|%252e%252e)/i,
  /(\bORDER\b\s+\bBY\b\s+\d+--)/i,
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ua = request.headers.get('user-agent') ?? ''

  // 1. Bloquer les outils d'attaque identifiés par leur User-Agent
  if (BLOCKED_UA.some(p => p.test(ua))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // 2. Bloquer les chemins suspects
  const pathLower = pathname.toLowerCase()
  if (BLOCKED_PATH_PREFIXES.some(prefix => pathLower.startsWith(prefix))) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // 3. Bloquer les query strings suspects (ne s'applique qu'aux routes API)
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

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Tout sauf les assets statiques Next.js et les images optimisées
    '/((?!_next/static|_next/image|favicon\\.ico|icon-|apple-icon|manifest\\.json|sw\\.js|workbox-).*)',
  ],
}
