'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/lang-context'
import { supabase } from '@/lib/supabase'

const FEATURES = [
  { icon: '⭐', en: 'Gold PRO badge on all your listings', kr: 'Badge PRO lor tou ou anons' },
  { icon: '📸', en: 'Up to 10 photos per listing', kr: 'Ziska 10 foto par anons' },
  { icon: '🔁', en: 'Listings auto-renewed every month', kr: 'Anons renouvle otomatik tou le mwa' },
  { icon: '🚀', en: '1 free boost per month', kr: '1 boost gratis par mwa' },
  { icon: '🔝', en: 'Priority placement in search results', kr: 'Priorite dan rezilta rechersh' },
  { icon: '♾️', en: 'Unlimited listings (no daily limit)', kr: 'Anons san limit (pa limit par zour)' },
  { icon: '✅', en: 'Verified PRO seller badge', kr: 'Badge vanndèr PRO verifye' },
  { icon: '📞', en: 'Priority customer support', kr: 'Sipor klient prioriter' },
]

export default function SubscriptionPage() {
  const { lang } = useLang()
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isPro, setIsPro]       = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [paying, setPaying]     = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setChecking(false); return }
      setLoggedIn(true)
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', user.id)
        .maybeSingle()
      setIsPro(!!profile?.is_pro)
      setChecking(false)
    })
  }, [])

  const handleSubscribe = async () => {
    if (paying) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login?redirect=/subscription'); return }
    setPaying(true)
    try {
      const res = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const { url, error } = await res.json()
      if (error || !url) {
        alert(lang === 'kr' ? 'Erer. Sey ankor.' : 'Error. Please try again.')
        setPaying(false)
        return
      }
      window.location.href = url
    } catch {
      alert(lang === 'kr' ? 'Erer koneksyon.' : 'Connection error. Please try again.')
      setPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4">

      {/* Hero */}
      <div className="bg-black text-white px-4 pt-8 pb-10 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-3xl mx-auto mb-4">
          ⭐
        </div>
        <h1 className="text-2xl font-bold mb-1">
          {lang === 'kr' ? 'Kont PRO' : 'PRO Account'}
        </h1>
        <p className="text-gray-400 text-sm">
          {lang === 'kr'
            ? 'Vann pli vit, grandi ou biznes lo Sesel'
            : 'Sell faster, grow your business in Seychelles'}
        </p>
        <div className="mt-5 inline-block bg-white/10 rounded-2xl px-8 py-4">
          <p className="text-4xl font-bold text-yellow-400">230 SCR</p>
          <p className="text-gray-400 text-sm">{lang === 'kr' ? 'par mwa' : '/ month'}</p>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 -mt-4">

        {/* Features */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">
            {lang === 'kr' ? 'Sa ki ou gagne' : "What's included"}
          </p>
          <ul className="space-y-3.5">
            {FEATURES.map(f => (
              <li key={f.en} className="flex items-center gap-3">
                <span className="text-xl w-7 text-center shrink-0">{f.icon}</span>
                <span className="text-sm text-gray-700">{lang === 'kr' ? f.kr : f.en}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Call to action */}
        {checking ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center text-sm text-gray-400">
            …
          </div>
        ) : isPro ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl mx-auto">✅</div>
            <p className="font-bold text-green-800">
              {lang === 'kr' ? 'Ou deza PRO !' : "You're already PRO!"}
            </p>
            <p className="text-sm text-green-700">
              {lang === 'kr'
                ? 'Mersi pou ou sipor. Tou ou avantaz PRO i aktif.'
                : 'Thanks for your support. All your PRO benefits are active.'}
            </p>
          </div>
        ) : (
          <>
            <button
              onClick={handleSubscribe}
              disabled={paying}
              className="w-full bg-yellow-400 text-black font-bold text-base py-4 rounded-2xl hover:bg-yellow-300 transition-colors active:scale-[0.98] disabled:opacity-60">
              {paying
                ? (lang === 'kr' ? 'Redireksyon…' : 'Redirecting…')
                : (lang === 'kr' ? '⭐ Vin PRO — 230 SCR/mwa' : '⭐ Become PRO — 230 SCR/month')}
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-3">
              {lang === 'kr'
                ? '🔒 Peman sekirize via Stripe · Anile ninport ki ler'
                : '🔒 Secure payment via Stripe · Cancel anytime'}
            </p>
            {!loggedIn && (
              <p className="text-[11px] text-gray-400 text-center mt-1">
                {lang === 'kr' ? 'Ou pou bezwen konekte avan' : 'You\'ll need to sign in first'}
              </p>
            )}
          </>
        )}

      </div>
    </div>
  )
}
