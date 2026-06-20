'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const FLAG = 'linear-gradient(135deg, #003F87 0%, #003F87 20%, #FCD116 40%, #BE0027 55%, #FFFFFF 72%, #007A3D 88%, #007A3D 100%)'

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const hashParams  = new URLSearchParams(window.location.hash.replace('#', ''))
    const code        = searchParams.get('code')
    const errorParam  = searchParams.get('error') || hashParams.get('error')

    if (errorParam) { setStatus('error'); return }

    // Écoute les changements d'état (flux hash implicit)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        setHasSession(true)
        setStatus('success')
      }
    })

    const handle = async () => {
      if (code) {
        // Flux PKCE — on tente l'échange
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        // L'email est confirmé côté Supabase même si l'échange échoue (autre navigateur)
        // On montre toujours la page de bienvenue
        if (!error && data.session) {
          setHasSession(true)
        }
        setStatus('success')
        return
      }

      // Flux hash — laisser onAuthStateChange gérer, puis vérifier après 2s
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setHasSession(true)
          setStatus('success')
        } else {
          // Pas de session mais peut-être flux hash en cours
          const hasToken = hashParams.get('access_token')
          setStatus(hasToken ? 'success' : 'error')
        }
      }, 2000)
    }

    handle()
    return () => subscription.unsubscribe()
  }, [])

  /* ── Loading ── */
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f4f8' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-700 animate-spin mx-auto mb-4" />
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
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Invalid link</h1>
            <p className="text-gray-500 text-sm mb-6">
              This confirmation link has expired or has already been used.<br />
              Try signing in directly — your email may already be confirmed.
            </p>
            <Link href="/login"
              className="block w-full text-center text-white font-semibold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#003F87' }}>
              Go to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ── Success ── */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: '#f0f4f8' }}>
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">

        {/* Bandeau drapeau */}
        <div className="relative px-8 py-10 text-center" style={{ background: FLAG }}>
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative z-10 text-white">
            <div className="text-5xl mb-2">🌴</div>
            <h1 className="text-2xl font-bold">BuySellSeychelles</h1>
            <p className="text-sm mt-1 opacity-80">The Seychelles marketplace</p>
          </div>
        </div>

        <div className="px-8 py-8 text-center">

          {/* Icône succès */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: '#003F87' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email confirmed!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {hasSession
              ? 'Welcome to BuySellSeychelles! Your account is active and you are now signed in.'
              : 'Your email address has been confirmed. You can now sign in to your account.'}
          </p>

          <div className="space-y-3">
            {hasSession ? (
              <>
                <Link href="/"
                  className="block w-full text-center text-white font-semibold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#003F87' }}>
                  🏝️ Go to the marketplace →
                </Link>
              </>
            ) : (
              <>
                <Link href="/login"
                  className="block w-full text-center text-white font-semibold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#003F87' }}>
                  Sign in to my account →
                </Link>
                <Link href="/"
                  className="block w-full text-center text-gray-500 text-sm py-2 hover:text-gray-800">
                  Browse listings without signing in
                </Link>
              </>
            )}
          </div>

          {/* Steps */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-left space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Get started</p>
            {[
              { num: 1, color: '#003F87', text: 'Complete your profile to get the Verified badge' },
              { num: 2, color: '#FCD116', dark: true, text: 'Post your first listing — it\'s free' },
              { num: 3, color: '#007A3D', text: 'Save searches to get notified of new listings' },
            ].map(step => (
              <div key={step.num} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ backgroundColor: step.color, color: step.dark ? '#1a1a1a' : '#fff' }}>
                  {step.num}
                </span>
                <p className="text-sm text-gray-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400">© 2025 BuySellSeychelles · buysellseychelles.com</p>
    </div>
  )
}
