import Link from 'next/link'
import CookieSettingsButton from '@/components/cookie-settings-button'

export default function SiteFooter() {
  return (
    <footer className="bg-[#1E2028] mt-4">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">

          {/* Logo + tagline */}
          <div className="shrink-0">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#003F87' }}>
                <span className="text-white font-extrabold text-xs">BS</span>
              </div>
              <span className="font-extrabold text-white text-sm">BuySellSeychelles</span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
              Free classifieds for Seychelles.<br />
              Buy and sell locally.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              { href: '/help',         label: 'Help' },
              { href: '/safety',       label: 'Safety' },
              { href: '/about',        label: 'About' },
              { href: '/terms',        label: 'Terms' },
              { href: '/cgv',          label: 'Terms of Sale' },
              { href: '/privacy',      label: 'Privacy' },
              { href: '/legal',        label: 'Legal' },
              { href: '/sitemap-page', label: 'Site Map' },
            ].map(link => (
              <Link key={link.href} href={link.href}
                className="text-xs text-gray-400 hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
            <Link href="/contact"
              className="text-xs text-gray-400 hover:text-white transition-colors">
              Contact
            </Link>
            <CookieSettingsButton />
          </nav>
        </div>

        <div className="mt-8 pt-5 border-t border-white/10">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} BuySellSeychelles — All rights reserved
          </p>
        </div>
      </div>
    </footer>
  )
}
