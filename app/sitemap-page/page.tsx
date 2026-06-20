import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Site Map – BuySellSeychelles',
  description: 'All pages of BuySellSeychelles marketplace.',
}

const SECTIONS = [
  {
    title: 'Browse & Search',
    icon: '🔍',
    links: [
      { label: 'Home – All listings', href: '/' },
      { label: 'Vehicles', href: '/?category=vehicles' },
      { label: 'Electronics', href: '/?category=electronics' },
      { label: 'Real Estate', href: '/?category=real-estate' },
      { label: 'Fashion & Clothing', href: '/?category=fashion' },
      { label: 'Home & Garden', href: '/?category=home-garden' },
      { label: 'Jobs & Services', href: '/?category=services' },
      { label: 'Sport & Leisure', href: '/?category=sport' },
      { label: 'Other', href: '/?category=other' },
    ],
  },
  {
    title: 'My Account',
    icon: '👤',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My listings', href: '/my-listings' },
      { label: 'Post an ad', href: '/post-ad' },
      { label: 'Favourites', href: '/favorites' },
      { label: 'Messages', href: '/conversations' },
      { label: 'Notifications', href: '/notifications' },
      { label: 'My alerts', href: '/alerts' },
      { label: 'Go Pro', href: '/subscription' },
    ],
  },
  {
    title: 'Help & Safety',
    icon: '🛡️',
    links: [
      { label: 'Help Centre', href: '/help' },
      { label: 'Safety Tips', href: '/safety' },
      { label: 'About BuySellSeychelles', href: '/about' },
    ],
  },
  {
    title: 'Legal',
    icon: '📄',
    links: [
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Terms of Sale', href: '/cgv' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Site Map', href: '/sitemap-page' },
    ],
  },
]

export default function SitemapPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Site Map</h1>
      <p className="text-gray-500 text-sm mb-8">All pages of BuySellSeychelles at a glance.</p>

      <div className="space-y-8">
        {SECTIONS.map(section => (
          <div key={section.title}>
            <h2 className="flex items-center gap-2 font-semibold text-base mb-3">
              <span>{section.icon}</span>
              {section.title}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {section.links.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-black hover:underline py-1"
                  >
                    <span className="text-gray-300">→</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  )
}
