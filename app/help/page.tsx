'use client'

import { useState } from 'react'
import Link from 'next/link'

const SECTIONS = [
  {
    icon: '📋',
    title: 'Posting an ad',
    items: [
      {
        q: 'How do I post an ad?',
        a: 'Tap the + button at the top of any page or in the bottom bar. Fill in the title, category, price and photos, then tap "Publish". Your ad will be visible immediately.',
      },
      {
        q: 'Is it free to post an ad?',
        a: 'Yes, posting an ad on BuySellSeychelles is completely free. You can post as many ads as you like at no cost.',
      },
      {
        q: 'How many photos can I add?',
        a: 'You can add up to 3 photos per listing. Good photos increase your chances of selling quickly — use natural light and show the item from several angles.',
      },
      {
        q: 'How long does my ad stay online?',
        a: 'Ads stay active for 60 days. You will receive an email reminder 3 days before expiry, and you can renew from your dashboard with one click.',
      },
      {
        q: 'Can I edit my ad after publishing?',
        a: 'Yes. Go to My Dashboard → your listings, tap Edit. You can update photos, price, description and all other details at any time.',
      },
      {
        q: 'What is the Urgent badge?',
        a: 'The Urgent badge (🔴) appears on your listing in search results to signal to buyers that you want to sell quickly. It\'s free.',
      },
      {
        q: 'What does "Price negotiable" mean?',
        a: 'If you enable this option, your price will show as "Negotiable" instead of a fixed amount. Buyers can contact you to discuss the price.',
      },
    ],
  },
  {
    icon: '💬',
    title: 'Messaging & contact',
    items: [
      {
        q: 'How do I contact a seller?',
        a: 'Open the listing and tap "Send message". You\'ll need an account to send messages. The seller receives a notification and can reply directly.',
      },
      {
        q: 'Can I share my phone number?',
        a: 'Yes. Sellers can add a contact phone number to their listing. Buyers can then call or WhatsApp them directly — no account needed.',
      },
      {
        q: 'How do I know if the seller has read my message?',
        a: 'A single tick (✓) means your message was sent. Double tick (✓✓) means it was read by the seller.',
      },
      {
        q: 'Can I mark my listing as sold?',
        a: 'Yes — either from your dashboard (Mark as sold) or directly from a conversation by tapping the ✓ Sold button in the chat header.',
      },
    ],
  },
  {
    icon: '🔒',
    title: 'Safety & trust',
    items: [
      {
        q: 'How do I get the Verified badge?',
        a: 'Complete 100% of your profile (photo, name, WhatsApp number and island). The ✓ Verified badge appears automatically on your profile and listings.',
      },
      {
        q: 'How do I report a suspicious listing?',
        a: 'Open the listing and tap the Report button. Choose a reason (scam, prohibited item, etc.). Our team reviews all reports within 24 hours.',
      },
      {
        q: 'How do I report a suspicious user?',
        a: 'Go to the seller\'s profile page and scroll to the bottom. Tap "Report this seller" and choose the reason.',
      },
      {
        q: 'What should I do if I think it\'s a scam?',
        a: 'Never send money in advance. Always meet in a public place. Check our Safety page for full advice on transacting safely.',
      },
    ],
  },
  {
    icon: '👤',
    title: 'My account',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Tap Login at the top of the page, then Sign up. Enter your email and a password. You\'ll receive a confirmation email — click the link to activate your account.',
      },
      {
        q: 'I forgot my password.',
        a: 'On the login page, tap "Forgot your password?" and enter your email. We\'ll send you a link to reset it.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Use our contact form (link in the footer) to send a deletion request. We will delete your account and all associated data within 7 days.',
      },
      {
        q: 'What is PRO?',
        a: 'PRO is a paid subscription for frequent sellers. It gives you a ⭐ PRO badge, priority placement in search results and advanced statistics. See the Subscription page for details.',
      },
    ],
  },
  {
    icon: '💰',
    title: 'Tax & selling rules',
    items: [
      {
        q: 'Do I need to declare income from my sales?',
        a: 'Occasional private sales (second-hand items you own personally) are generally not taxable in the Seychelles. However, if you sell regularly or run a business, you may be required to register with the Seychelles Revenue Commission (SRC) and declare your income. When in doubt, consult the SRC or a local accountant.',
      },
      {
        q: 'When does selling become a business activity?',
        a: 'Indicators include: selling items you bought specifically to resell, selling in high volume or frequency, or generating a significant and regular income. In these cases, you may be considered a trader and subject to business tax rules.',
      },
      {
        q: 'Do I need a business licence to sell on BuySellSeychelles?',
        a: 'Selling personal second-hand goods does not require a licence. However, if you sell new goods, offer services professionally, or operate as a business, you should hold the appropriate licence from the Seychelles Licensing Authority.',
      },
      {
        q: 'What taxes apply to professional sellers in the Seychelles?',
        a: 'Professional sellers may be subject to Business Tax and Value Added Tax (VAT) if their turnover exceeds the VAT registration threshold. Contact the Seychelles Revenue Commission (src.gov.sc) for up-to-date thresholds and requirements.',
      },
      {
        q: 'Where can I get official tax guidance?',
        a: 'Visit the Seychelles Revenue Commission website at src.gov.sc or call their helpline. BuySellSeychelles does not provide tax advice — always consult an official source or qualified professional.',
      },
    ],
  },
  {
    icon: '🔔',
    title: 'Alerts & notifications',
    items: [
      {
        q: 'How do I save a search alert?',
        a: 'Search for what you\'re looking for and tap the 🔔 Save button that appears in results. Give it a name and you\'ll be notified by email and push notification when a new matching listing is posted.',
      },
      {
        q: 'How do I manage my alerts?',
        a: 'Go to Dashboard → My Alerts, or tap the 📡 icon. You can delete alerts you no longer need.',
      },
      {
        q: 'Why am I not receiving push notifications?',
        a: 'Make sure you have accepted notifications in your browser or on your phone. On iOS, you need to add the site to your home screen first (tap Share → Add to Home Screen).',
      },
    ],
  },
]

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 py-4 text-left"
      >
        <span className="text-sm font-medium text-gray-800">{q}</span>
        <span className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <p className="text-sm text-gray-500 leading-relaxed pb-4 pr-6">{a}</p>
      )}
    </div>
  )
}

const FLAG_GRADIENT = 'linear-gradient(135deg, #003F87 0%, #003F87 30%, #FCD116 60%, #007A3D 100%)'

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  return (
    <div className="max-w-3xl mx-auto pb-4 md:pb-10">

      {/* Hero — bleu et jaune Seychelles */}
      <div className="relative overflow-hidden text-white px-4 py-12 text-center"
        style={{ background: FLAG_GRADIENT }}>
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative z-10">
          <p className="text-5xl mb-3">💬</p>
          <h1 className="text-2xl font-bold mb-2">Help Centre</h1>
          <p className="text-white/80 text-sm">Answers to your questions about BuySellSeychelles</p>
        </div>
      </div>

      {/* Raccourcis catégories */}
      <div className="flex gap-2 overflow-x-auto px-4 py-4 scrollbar-hide">
        {SECTIONS.map(s => (
          <button key={s.title}
            onClick={() => setActiveSection(activeSection === s.title ? null : s.title)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
              activeSection === s.title ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
            style={activeSection === s.title ? { backgroundColor: '#003F87' } : {}}>
            {s.icon} {s.title}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-4">
        {SECTIONS.filter(s => !activeSection || s.title === activeSection).map(section => (
          <div key={section.title} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <span>{section.icon}</span>
              <h2 className="font-bold text-sm text-gray-800">{section.title}</h2>
            </div>
            <div className="px-4">
              {section.items.map(item => (
                <AccordionItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="mx-4 mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
        <p className="text-sm font-semibold text-gray-800 mb-1">Can't find your answer?</p>
        <p className="text-xs text-gray-500 mb-3">Our team is here to help.</p>
        <a href="/contact"
          className="inline-block text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#003F87' }}>
          Contact us
        </a>
      </div>

      <div className="text-center mt-4">
        <Link href="/safety" className="text-sm text-blue-600 hover:underline">
          🔒 Read our safety tips →
        </Link>
      </div>
    </div>
  )
}
