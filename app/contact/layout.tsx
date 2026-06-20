import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: `Contact us | ${SITE_NAME}`,
  description: `Get in touch with the ${SITE_NAME} team. Questions, support or partnership requests for the Seychelles marketplace.`,
  alternates: { canonical: `${SITE_URL}/contact` },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
