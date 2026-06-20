'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const confirmed = searchParams.get('confirmed')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [view, setView] = useState<'form' | 'checkEmail'>('form')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/dashboard')
    })
  }, [router])

  const handleSubmit = async () => {
    if (loading) return
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (err) { setError(err.message); return }
      router.push('/dashboard')
    } else {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      setLoading(false)
      if (err) { setError(err.message); return }
      setView('checkEmail')
    }
  }

  if (view === 'checkEmail') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
          <p className="text-5xl mb-4">📬</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <button onClick={() => setView('form')}
            className="w-full border border-gray-300 rounded-xl py-3 text-sm font-medium hover:border-black transition-colors">
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3" style={{ background: 'linear-gradient(135deg, #003F87, #007A3D)' }}>
            <span className="text-2xl">🌴</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">BuySellSeychelles</h1>
          <p className="text-gray-500 text-sm mt-1">The marketplace of the islands</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {confirmed && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4 text-center font-medium">
              ✓ Email confirmed — you can now log in
            </div>
          )}

          {/* Toggle login / signup */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  mode === m ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full text-white rounded-xl py-3.5 text-sm font-semibold mt-5 disabled:opacity-50 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#003F87' }}>
            {loading ? '...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>

          {mode === 'login' && (
            <p className="text-center mt-4">
              <a href="/auth/reset-password" className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
                Forgot your password?
              </a>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing you agree to our{' '}
          <a href="/terms" className="underline hover:text-gray-600">Terms</a>
          {' '}and{' '}
          <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
