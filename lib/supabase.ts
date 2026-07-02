import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
}

// The Supabase browser client stores sessions in localStorage by default, which
// is invisible to Next.js Server Components. This adapter mirrors the session
// cookie so that the /admin server page can verify the admin user server-side.
const SESSION_KEY = `sb-sywutvsmoccbmylbocex-auth-token`
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days — matches Supabase refresh window

const cookieSyncStorage = {
  getItem: (key: string): string | null => localStorage.getItem(key),
  setItem: (key: string, value: string): void => {
    localStorage.setItem(key, value)
    if (key === SESSION_KEY) {
      const secure = location.protocol === 'https:' ? ';Secure' : ''
      // Share the cookie between the apex domain and `www` so a session
      // started on one is recognized on the other — without this, a cookie
      // set on www.buysellseychelles.com is host-only and never sent to
      // buysellseychelles.com (and vice versa).
      const domain = location.hostname.endsWith('buysellseychelles.com') ? ';Domain=.buysellseychelles.com' : ''
      document.cookie = `${SESSION_KEY}=${encodeURIComponent(value)};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax${domain}${secure}`
    }
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key)
    if (key === SESSION_KEY) {
      const domain = location.hostname.endsWith('buysellseychelles.com') ? ';Domain=.buysellseychelles.com' : ''
      document.cookie = `${SESSION_KEY}=;path=/;max-age=0;SameSite=Lax${domain}`
    }
  },
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  typeof window !== 'undefined' ? { auth: { storage: cookieSyncStorage } } : undefined
)