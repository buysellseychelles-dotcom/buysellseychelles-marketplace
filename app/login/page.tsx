'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/lang-context'
import { t } from '@/lib/i18n'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}

type View = 'form' | 'checkEmail' | 'forgotPassword' | 'forgotSent'

function validatePassword(pwd: string) {
  return {
    length: pwd.length >= 8,
    upper:  /[A-Z]/.test(pwd),
    digit:  /[0-9]/.test(pwd),
    symbol: /[^A-Za-z0-9]/.test(pwd),
  }
}

function PasswordStrength({ password, show }: { password: string; show: boolean }) {
  if (!show || password.length === 0) return null
  const checks = validatePassword(password)
  const rules: [keyof typeof checks, string][] = [
    ['length', 'At least 8 characters'],
    ['upper',  '1 uppercase letter (A-Z)'],
    ['digit',  '1 number (0-9)'],
    ['symbol', '1 special character (!@#$%…)'],
  ]
  return (
    <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 space-y-1">
      {rules.map(([key, label]) => (
        <div key={key} className="flex items-center gap-2 text-xs">
          <span className={checks[key] ? 'text-green-500' : 'text-gray-400'}>
            {checks[key] ? '✓' : '○'}
          </span>
          <span className={checks[key] ? 'text-green-700 font-medium' : 'text-gray-500'}>{label}</span>
        </div>
      ))}
    </div>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useLang()
  const confirmed = searchParams.get('confirmed')
  const redirectTo = searchParams.get('redirect') || '/'

  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [view, setView] = useState<View>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push(redirectTo)
    })
  }, [router, redirectTo])

  const handleGoogle = async () => {
    setError('')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleLogin = async () => {
    if (loading) return
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email first — check your inbox (and spam folder).')
      } else {
        setError(t(lang, 'invalid_credentials'))
      }
      return
    }
    router.push('/')
  }

  const handleSignup = async () => {
    if (loading) return
    setError('')

    const checks = validatePassword(password)
    if (!checks.length) { setError('Password must be at least 8 characters.'); return }
    if (!checks.upper)  { setError('Password must include at least 1 uppercase letter (A-Z).'); return }
    if (!checks.digit)  { setError('Password must include at least 1 number (0-9).'); return }
    if (!checks.symbol) { setError('Password must include at least 1 special character (e.g. !@#$%).'); return }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: 'https://buysellseychelles.com/auth/callback' }
    })
    setLoading(false)

    if (error) {
      if (
        error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('user already exists') ||
        error.message.toLowerCase().includes('already been registered')
      ) {
        setError('This email address is already linked to an account.')
      } else {
        setError(error.message)
      }
      return
    }

    // Supabase returns user with empty identities when email is already taken
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('This email address is already linked to an account.')
      return
    }

    setResendSent(false)
    setView('checkEmail')
  }

  const handleForgotPassword = async () => {
    if (loading) return
    setError('')
    if (!email) { setError(t(lang, 'enter_email_first')); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://buysellseychelles.com/auth/reset-password'
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setView('forgotSent')
  }

  const handleResend = async () => {
    if (resendLoading || resendSent) return
    setResendLoading(true)
    await supabase.auth.resend({ type: 'signup', email })
    setResendLoading(false)
    setResendSent(true)
  }

  if (view === 'checkEmail') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t(lang, 'check_email_title')}</h1>
        <p className="text-gray-500 mb-4">
          {t(lang, 'check_email_body')} <strong>{email}</strong>. {t(lang, 'check_email_body2')}
        </p>

        {/* Spam advice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left mb-5">
          <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
            <span>💡</span> Not seeing the email?
          </p>
          <ul className="text-xs text-amber-700 mt-1 space-y-0.5 list-disc list-inside">
            <li>Check your <strong>spam</strong> or <strong>junk</strong> folder</li>
            <li>Check your <strong>Promotions</strong> tab (Gmail)</li>
            <li>Make sure you typed your email correctly</li>
          </ul>
        </div>

        <div className="space-y-3">
          {resendSent ? (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3">
              ✅ Confirmation email resent! Check your inbox and spam folder.
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full border border-gray-300 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors">
              {resendLoading ? 'Sending…' : '↩ Resend confirmation email'}
            </button>
          )}

          <button
            onClick={() => { setView('form'); setError('') }}
            className="w-full border border-gray-300 px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            {t(lang, 'back_to_login')}
          </button>
        </div>
      </div>
    </div>
  )

  if (view === 'forgotSent') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t(lang, 'reset_sent_title')}</h1>
        <p className="text-gray-500 mb-6">{t(lang, 'reset_sent_body')} <strong>{email}</strong>.</p>
        <button onClick={() => { setView('form'); setError('') }} className="border border-gray-300 px-6 py-2 rounded-lg text-sm hover:bg-gray-50">
          {t(lang, 'back_to_login')}
        </button>
      </div>
    </div>
  )

  if (view === 'forgotPassword') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">{t(lang, 'forgot_title')}</h1>
        <p className="text-gray-500 text-sm mb-6">{t(lang, 'forgot_desc')}</p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-black" />
        <button onClick={handleForgotPassword} disabled={loading}
          className="w-full text-white rounded-lg py-3 text-sm font-medium disabled:opacity-50 mb-3 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#003F87' }}>
          {loading ? t(lang, 'sending') : t(lang, 'send_link')}
        </button>
        <button onClick={() => { setView('form'); setError('') }} className="w-full text-sm text-gray-500 hover:text-gray-800">
          ← {t(lang, 'back_to_login')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
      <Link href="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 text-sm font-medium px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </Link>
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="px-8 py-7 text-center" style={{ background: 'linear-gradient(135deg, #003F87 0%, #003F87 20%, #FCD116 40%, #BE0027 55%, #FFFFFF 72%, #007A3D 88%, #007A3D 100%)' }}>
          <p className="text-3xl mb-1">🌴</p>
          <h1 className="text-white text-2xl font-bold">BuySellSeychelles</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.72)' }}>{t(lang, 'marketplace_tagline')}</p>
        </div>

        <div className="p-8">
          {confirmed && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-5 text-center">
              {t(lang, 'email_confirmed')}
            </div>
          )}

          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button onClick={() => { setTab('login'); setError('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'login' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>
              {t(lang, 'sign_in_tab')}
            </button>
            <button onClick={() => { setTab('signup'); setError('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'signup' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>
              {t(lang, 'sign_up_tab')}
            </button>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

          <div className="space-y-3">
            <input type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? handleLogin() : handleSignup())}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            <div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? handleLogin() : handleSignup())}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <PasswordStrength password={password} show={tab === 'signup'} />
            </div>
          </div>

          {tab === 'login' && (
            <div className="text-right mt-2 mb-4">
              <button onClick={() => { setView('forgotPassword'); setError('') }} className="text-xs text-gray-500 hover:text-black">
                {t(lang, 'forgot_password')}
              </button>
            </div>
          )}

          <button onClick={tab === 'login' ? handleLogin : handleSignup} disabled={loading}
            className="w-full text-white rounded-lg py-3 text-sm font-medium disabled:opacity-50 mt-4 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#003F87' }}>
            {loading ? t(lang, 'loading') : tab === 'login' ? t(lang, 'sign_in_btn') : t(lang, 'create_account_btn')}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">{t(lang, 'or')}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button onClick={handleGoogle} type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19.1 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.5 35.7 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C37 38.3 44 33 44 24c0-1.3-.1-2.6-.4-3.9z"/>
            </svg>
            {t(lang, 'continue_google')}
          </button>
        </div>
      </div>
    </div>
  )
}
