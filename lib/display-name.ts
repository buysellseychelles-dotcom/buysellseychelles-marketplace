export function getDisplayName(fullName?: string | null, fallback: string = "Member"): string {
  const trimmed = fullName?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : fallback
}