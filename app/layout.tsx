import './globals.css'
import OnlineTracker from '@/components/online-tracker'
import PushInit from '@/components/push-init'
import MobileNav from '@/components/mobile-nav'

export const metadata = {
  title: 'Marketplace Seychelles',
  description: 'Acheter et vendre facilement aux Seychelles',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="pb-16">
        <OnlineTracker />
        <PushInit />

        {children}

        <MobileNav />
      </body>
    </html>
  )
}