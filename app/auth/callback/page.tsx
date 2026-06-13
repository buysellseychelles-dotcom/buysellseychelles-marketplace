'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const FLAG = 'linear-gradient(135deg, #003F87 0%, #003F87 20%, #FCD116 40%, #BE0027 55%, #FFFFFF 72%, #007A3D 88%, #007A3D 100%)'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    // Écoute les changements d'état Supabase (SIGNED_IN déclenché après vérification du token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        setStatus('success')
        // Envoi email de bienvenue (une seule fois)
        fetch('/api/auth/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id }),
        }).catch(() => {})
      }
    })

    const handle = async () => {
      // Flux PKCE : Supabase envoie ?code=xxx
      const searchParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
      const code = searchParams.get('code')
      const errorParam = searchParams.get('error') || hashParams.get('error')

      if (errorParam) {
        setStatus('error')
        return
      }

      if (code) {
        // Échangeons le code contre une session
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) { setStatus('error'); return }
        // onAuthStateChange va déclencher setStatus('success')
        return
      }

      // Flux hash : #access_token=xxx (ancienne méthode Supabase)
      if (hashParams.get('access_token')) {
        // Le client Supabase traite automatiquement le hash
        // onAuthStateChange va déclencher setStatus('success')
        return
      }

      // Vérification session existante (si déjà connecté)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setStatus('success')
      } else {
        // Attendre un peu que Supabase traite le hash
        setTimeout(async () => {
          const { data: { session: s } } = await supabase.auth.getSession()
          if (!s) setStatus('error')
        }, 3000)
      }
    }

    handle()
    return () => subscription.unsubscribe()
  }, [])

  /* ── Loading ── */
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f4f8' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Confirming your email...</p>
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f0f4f8' }}>
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">
          <div className="h-2" style={{ background: FLAG }} />
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Invalid link</h1>
            <p className="text-gray-500 text-sm mb-6">This confirmation link has expired or has already been used.</p>
            <Link href="/login"
              className="block w-full text-center text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
              style={{ background: FLAG }}>
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ── Success — page de bienvenue ── */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: '#f0f4f8' }}>

      {/* Carte principale */}
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Bandeau drapeau */}
        <div className="relative px-8 py-10 text-center text-white" style={{ background: FLAG }}>
          {/* Overlay pour lisibilité */}
          <div className="absolute inset-0 bg-black/20 rounded-t-3xl" />
          <div className="relative z-10">
            <div className="text-5xl mb-2">🌴</div>
            <h1 className="text-2xl font-bold tracking-tight">BuySellSeychelles</h1>
            <p className="text-sm mt-1 opacity-80">The Seychelles marketplace</p>
          </div>
        </div>

        {/* Contenu */}
        <div className="px-8 py-8 text-center">

          {/* Badge succès */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #003F87, #007A3D)' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email confirmed!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Welcome to BuySellSeychelles. Your account is now active and you can start buying and selling across Mahé, Praslin, La Digue and the other islands.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/"
              className="block w-full text-center text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
              style={{ background: FLAG }}>
              🏝️ Browse listings
            </Link>
            <Link href="/post-ad"
              className="block w-full text-center font-semibold py-3.5 rounded-xl border-2 text-sm transition-colors hover:bg-gray-50"
              style={{ borderColor: '#003F87', color: '#003F87' }}>
              + Post my first ad
            </Link>
          </div>

          {/* Étapes rapides */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-left space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Get started</p>
            {[
              { icon: '✓', color: '#003F87', text: 'Complete your profile to get the Verified badge' },
              { icon: '📸', color: '#FCD116', text: 'Post your first listing — it\'s free' },
              { icon: '🔔', color: '#007A3D', text: 'Save searches to be notified of new listings' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: step.color, color: step.color === '#FCD116' ? '#1a1a1a' : '#fff' }}>
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <p className="mt-6 text-xs text-gray-400">
        © 2025 BuySellSeychelles · buysellseychelles.com
      </p>
    </div>
  )
}
