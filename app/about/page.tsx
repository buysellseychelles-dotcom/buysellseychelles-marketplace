import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About – BuySellSeychelles',
  description: 'BuySellSeychelles is the free classifieds marketplace for the Seychelles islands.',
}

const FLAG_GRADIENT = 'linear-gradient(135deg, #003F87 0%, #003F87 22%, #FCD116 44%, #BE0027 66%, #007A3D 88%, #007A3D 100%)'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto pb-4 md:pb-10">

      {/* Hero — drapeau des Seychelles */}
      <div className="relative overflow-hidden text-white px-4 py-12 text-center"
        style={{ background: FLAG_GRADIENT }}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10">
          <p className="text-5xl mb-3">🌴</p>
          <h1 className="text-2xl font-bold mb-2">About BuySellSeychelles</h1>
          <p className="text-white/80 text-sm">The marketplace made for the islands</p>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-5 text-sm text-gray-700 leading-relaxed">

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs shrink-0" style={{ backgroundColor: '#003F87' }}>🎯</span>
            Our mission
          </h2>
          <p>
            BuySellSeychelles is a free online classifieds platform created specifically for the people of Mahé, Praslin, La Digue and all the Seychelles islands.
          </p>
          <p className="mt-3">
            Our goal is simple: make it easy for anyone in Seychelles to buy and sell locally — whether you&apos;re clearing out your home, looking for a second-hand car, searching for a job, or renting a property.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs shrink-0" style={{ backgroundColor: '#FCD116' }}>🌟</span>
            What we offer
          </h2>
          <ul className="space-y-2.5">
            {[
              ['📋', 'Free listings', 'Post as many ads as you want, at no cost.'],
              ['🔍', 'Smart search', 'Search by category, island, price range and more.'],
              ['💬', 'Direct messaging', 'Chat with buyers and sellers securely in the app.'],
              ['🗺️', 'Map view', 'Browse listings near you on an interactive map.'],
              ['🔔', 'Search alerts', 'Get notified the moment a listing matching your search is posted.'],
              ['✓', 'Verified profiles', 'A trust badge for sellers who complete their profile.'],
            ].map(([icon, title, desc]) => (
              <li key={title as string} className="flex items-start gap-3">
                <span className="text-base mt-0.5">{icon}</span>
                <div>
                  <span className="font-semibold text-gray-800">{title}</span>
                  <span className="text-gray-500"> — {desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs shrink-0" style={{ backgroundColor: '#BE0027' }}>🤝</span>
            Our values
          </h2>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[
              ['🆓', 'Free',  '#003F87', 'Always free for individuals'],
              ['🔒', 'Safe',  '#007A3D', 'Verified sellers, easy reporting'],
              ['🌴', 'Local', '#BE0027', 'Built for Seychelles, by Seychelles'],
            ].map(([icon, title, color, desc]) => (
              <div key={title as string} className="text-center rounded-xl p-3 border"
                style={{ borderColor: color as string + '30', backgroundColor: color as string + '08' }}>
                <p className="text-2xl mb-1">{icon}</p>
                <p className="font-bold text-xs text-gray-800">{title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs shrink-0" style={{ backgroundColor: '#007A3D' }}>📬</span>
            Contact us
          </h2>
          <p className="text-gray-500">
            Questions, suggestions, or a problem to report? We read every message.
          </p>
          <Link href="/contact"
            className="inline-block mt-3 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#003F87' }}>
            Send us a message →
          </Link>
        </div>

      </div>

      <div className="flex justify-center gap-4 mt-6 text-xs text-gray-400">
        <Link href="/help" className="hover:text-black">Help Centre</Link>
        <Link href="/safety" className="hover:text-black">Safety Tips</Link>
        <Link href="/terms" className="hover:text-black">Terms</Link>
        <Link href="/privacy" className="hover:text-black">Privacy</Link>
      </div>
    </div>
  )
}
