import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Safety Tips – BuySellSeychelles',
  description: 'How to buy and sell safely on BuySellSeychelles. Tips to avoid scams and protect yourself.',
}

const TIPS = [
  {
    icon: '🤝',
    title: 'Meet in a public place',
    body: 'Always meet the buyer or seller in a busy public location — a shopping centre, a market, or a café. Never meet at your home or a secluded place, especially for high-value items.',
    color: 'bg-blue-50 border-blue-100',
    iconBg: 'bg-blue-100',
  },
  {
    icon: '🚫',
    title: 'Never pay in advance',
    body: 'Never transfer money before seeing and checking the item in person. Scammers often invent urgent reasons to get payment before delivery. If someone insists on advance payment, it\'s a red flag.',
    color: 'bg-red-50 border-red-100',
    iconBg: 'bg-red-100',
  },
  {
    icon: '🔍',
    title: 'Check the item carefully',
    body: 'Inspect the item before paying. Test electronics, check documents for vehicles, verify the condition matches the photos. Don\'t be rushed — a serious seller will have no problem waiting.',
    color: 'bg-yellow-50 border-yellow-100',
    iconBg: 'bg-yellow-100',
  },
  {
    icon: '💬',
    title: 'Use the in-app messaging',
    body: 'Keep your conversations in BuySellSeychelles. Avoid moving to WhatsApp or SMS too quickly — our messaging keeps a record and allows us to help in case of a dispute.',
    color: 'bg-green-50 border-green-100',
    iconBg: 'bg-green-100',
  },
  {
    icon: '🔒',
    title: 'Protect your personal information',
    body: 'Never share your ID, bank account details, or passwords with anyone you meet on the platform. A legitimate buyer or seller will never ask for this information.',
    color: 'bg-purple-50 border-purple-100',
    iconBg: 'bg-purple-100',
  },
  {
    icon: '✓',
    title: 'Prefer Verified sellers',
    body: 'Sellers with the ✓ Verified badge have completed their profile (photo, name, WhatsApp number and island). This adds a layer of accountability. Check their reviews and response rate too.',
    color: 'bg-gray-50 border-gray-100',
    iconBg: 'bg-gray-200',
  },
]

const RED_FLAGS = [
  'Asks for payment before meeting',
  'Price that seems too good to be true',
  'Refuses to meet in person',
  'Asks to move conversation off the platform',
  'Rushes you to decide quickly',
  'Cannot provide additional photos or details',
  'Account created very recently with no reviews',
]

const FLAG_GRADIENT = 'linear-gradient(135deg, #007A3D 0%, #007A3D 30%, #003F87 65%, #003F87 100%)'

export default function SafetyPage() {
  return (
    <div className="max-w-3xl mx-auto pb-4 md:pb-10">

      {/* Hero — vert et bleu Seychelles */}
      <div className="relative overflow-hidden text-white px-4 py-12 text-center"
        style={{ background: FLAG_GRADIENT }}>
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative z-10">
          <p className="text-5xl mb-3">🔒</p>
          <h1 className="text-2xl font-bold mb-2">Buy &amp; Sell Safely</h1>
          <p className="text-white/80 text-sm max-w-xs mx-auto">
            BuySellSeychelles connects honest people. Follow these tips to stay safe.
          </p>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-3">
        {TIPS.map(tip => (
          <div key={tip.title} className={`rounded-2xl border p-4 ${tip.color}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${tip.iconBg}`}>
                {tip.icon}
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 mb-1">{tip.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{tip.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Red flags */}
      <div className="mx-4 mt-5 bg-red-50 border border-red-200 rounded-2xl p-5">
        <h2 className="font-bold text-red-700 mb-3 flex items-center gap-2">
          🚨 Warning signs — beware if the seller/buyer…
        </h2>
        <ul className="space-y-2">
          {RED_FLAGS.map(flag => (
            <li key={flag} className="flex items-start gap-2 text-sm text-red-700">
              <span className="mt-0.5 shrink-0">⚠️</span>
              {flag}
            </li>
          ))}
        </ul>
      </div>

      {/* Report */}
      <div className="mx-4 mt-4 bg-white border border-gray-200 rounded-2xl p-5 text-center">
        <p className="text-sm font-bold text-gray-800 mb-1">Spotted a suspicious listing?</p>
        <p className="text-xs text-gray-500 mb-3">Report it — our team reviews every report within 24 hours.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link href="/"
            className="text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#003F87' }}>
            Browse listings
          </Link>
          <a href="/contact"
            className="border border-gray-300 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl hover:border-black transition-colors">
            Contact us
          </a>
        </div>
      </div>

      <div className="text-center mt-4">
        <Link href="/help" className="text-sm text-gray-500 hover:underline">
          ← Back to Help Centre
        </Link>
      </div>
    </div>
  )
}
