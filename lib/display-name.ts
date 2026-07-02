import type { SupabaseClient } from '@supabase/supabase-js'

export function getDisplayName(fullName?: string | null, fallback: string = "Member"): string {
  const trimmed = fullName?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : fallback
}

export function generateDefaultDisplayName(): string {
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `User${suffix}`
}

// Guards against a new account's profile.full_name defaulting to the user's
// email address — some Supabase signup paths copy the email in at creation.
// Assigns a generic "User1234" name instead, only when no real name was set.
export async function ensureDisplayName(
  supabase: SupabaseClient,
  userId: string,
  email?: string | null
): Promise<string> {
  const { data: prof } = await supabase.from('profiles').select('full_name').eq('id', userId).single()
  const current = prof?.full_name?.trim()

  if (current && current.toLowerCase() !== (email ?? '').toLowerCase()) {
    return current
  }

  const generated = generateDefaultDisplayName()
  await supabase.from('profiles').upsert({ id: userId, full_name: generated }, { onConflict: 'id' })
  return generated
}