'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const RECAPTCHA_SITE_KEY = '6LdbhSYtAAAAANm-ccvO82W_5r1JnGDO6QUn4dFB'

const SUBJECTS = [
  'General question',
  'Report a problem',
  'Advertise with us',
  'Account issue',
  'Safety concern',
  'Other',
]

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (document.querySelector('script[src*="recaptcha"]')) return
    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }, [])

  const submit = async () => {
    if (!name || !email || !subject || !message) {
      setError('Please fill in all fields.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    const recaptchaToken = (window as any).grecaptcha?.getResponse()
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, recaptchaToken }),
      })
      if (res.status === 429) {
        setError('Too many messages sent. Please wait before trying again.')
        ;(window as any).grecaptcha?.reset()
        return
      }
      if (!res.ok) throw new Error('Failed')
      setSent(true)
    } catch {
      setError('Failed to send your message. Please try again.')
      ;(window as any).grecaptcha?.reset()
    }
    setLoading(false)
  }

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Message sent!</h1>
        <p className="text-gray-500 mb-6">
          Thank you <strong>{name}</strong>. We have received your message and will get back to you within 24–48 hours.
        </p>
        <Link href="/"
          className="inline-block bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
          Back to home
        </Link>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto pb-10">

      {/* Header */}
      <div className="text-white px-4 pt-8 pb-10 text-center"
        style={{ background: 'linear-gradient(135deg, #003F87 0%, #003F87 25%, #FCD116 50%, #BE0027 75%, #007A3D 100%)' }}>
        <p className="text-4xl mb-3">📬</p>
        <h1 className="text-2xl font-bold">Contact us</h1>
        <p className="text-white/80 text-sm mt-1">We read every message and reply within 48h</p>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jean-Claude Dupont"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subject *</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
            >
              <option value="">Select a subject…</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message *</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe your question or issue in detail…"
              rows={6}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          {/* reCAPTCHA widget */}
          <div className="g-recaptcha" data-sitekey={RECAPTCHA_SITE_KEY} />

          <button
            onClick={submit}
            disabled={loading}
            className="w-full text-white rounded-xl py-3.5 text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#003F87' }}>
            {loading ? 'Sending…' : 'Send message'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Your email is only used to reply to your request and is never shared or published.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { icon: '⏱', title: 'Response time', desc: 'Within 24–48 hours' },
            { icon: '🔒', title: 'Privacy', desc: 'Your data is protected' },
          ].map(c => (
            <div key={c.title} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <p className="text-2xl mb-1">{c.icon}</p>
              <p className="text-xs font-bold text-gray-800">{c.title}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-5 text-xs text-gray-400">
          <Link href="/help" className="hover:text-black">Help Centre</Link>
          <Link href="/safety" className="hover:text-black">Safety Tips</Link>
          <Link href="/terms" className="hover:text-black">Terms</Link>
        </div>
      </div>
    </div>
  )
}
