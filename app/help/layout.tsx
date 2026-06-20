import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: `Help & FAQ | ${SITE_NAME}`,
  description: `Find answers about buying, selling, posting ads and staying safe on ${SITE_NAME}, the Seychelles marketplace.`,
  alternates: { canonical: `${SITE_URL}/help` },
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children
}
