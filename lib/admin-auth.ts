import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Supabase project ref — used to locate the auth cookie.
const PROJECT_REF = 'sywutvsmoccbmylbocex'

// Resolves the currently logged-in Supabase user from the auth cookie, or null.
export async function getAdminUser() {
  const cookieStore = await cookies()
  const tokenCookie =
    cookieStore.get(`sb-${PROJECT_REF}-auth-token`)?.value ||
    cookieStore.get(`sb-${PROJECT_REF}-auth-token.0`)?.value
  if (!tokenCookie) return null
  try {
    const { access_token, refresh_token } = JSON.parse(decodeURIComponent(tokenCookie))
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(access_token)
    if (user) return user

    // Access token expired (e.g. hard navigation before the browser client had
    // a chance to auto-refresh it) — fall back to the refresh token stored in
    // the same cookie so a still-valid session isn't treated as logged out.
    if (!refresh_token) return null
    const { data: refreshed } = await supabase.auth.refreshSession({ refresh_token })
    return refreshed.user ?? null
  } catch {
    return null
  }
}

// True only when the request is authenticated as the configured admin account.
export async function isAdminUser(): Promise<boolean> {
  const user = await getAdminUser()
  return !!(user && user.email === process.env.ADMIN_EMAIL)
}

// Cookie-independent admin check: validates a Supabase access token (JWT) sent
// by the browser and confirms it belongs to the configured admin account.
// The browser session lives in localStorage (not cookies), so server routes
// triggered from email links must authorize via the access token, not cookies.
export async function isAdminAccessToken(accessToken?: string | null): Promise<boolean> {
  if (!accessToken) return false
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(accessToken)
  return !!(user && user.email === process.env.ADMIN_EMAIL)
}
