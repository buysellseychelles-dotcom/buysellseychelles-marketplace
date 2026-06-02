import { NextResponse } from 'next/server'

export function middleware(req: Request) {

  const url = new URL(req.url)

  if (url.pathname.startsWith('/admin')) {

    const isAdmin = req.headers.get('x-admin')

    if (isAdmin !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}