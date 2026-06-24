// Reasons an identity document can be rejected for. Shared between the admin
// reject page (checkboxes) and the server route (validation + seller email).
// Kept in its own module with no Node imports so it is safe to import from
// client components.
export const REJECT_REASONS = [
  'Document unreadable',
  'Wrong type of ID',
  'Document expired',
  'Poor photo quality',
] as const

export type RejectReason = (typeof REJECT_REASONS)[number]