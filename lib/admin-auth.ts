import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Supabase project ref — used to locate the auth cookie. Mirrors the inline
// logic that already guards app/admin/page.tsx.
const PROJECT_REF = 'sywutvsmoccbmylbocex'

// Resolves the currently logged-in Supabase user from the auth cookie, or null.
export async function getAdminUser() {
  const cookieStore = await cookies()
  const tokenCookie =
    cookieStore.get(`sb-${PROJECT_REF}-auth-token`)?.value ||
    cookieStore.get(`sb-${PROJECT_REF}-auth-token.0`)?.value
  if (!tokenCookie) return null
  try {
    const { access_token } = JSON.parse(tokenCookie)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(access_token)
    return user
  } catch {
    return null
  }
}

// True only when the request is authenticated as the configured admin account.
export async function isAdminUser(): Promise<boolean> {
  const user = await getAdminUser()
  return !!(user && user.email === process.env.ADMIN_EMAIL)
}
