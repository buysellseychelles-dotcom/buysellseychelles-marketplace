import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: `Advertise with us | ${SITE_NAME}`,
  description: `Promote your business to thousands of buyers in the Seychelles. Banner ads and featured placement on ${SITE_NAME}.`,
  alternates: { canonical: `${SITE_URL}/advertise` },
}

export default function AdvertiseLayout({ children }: { children: React.ReactNode }) {
  return children
}
