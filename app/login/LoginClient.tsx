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

  const [view, setView] = useState<'form' | 'checkEmail'>('form')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        router.push('/post-ad')
      }
    }

    checkUser()
  }, [router])

  const login = async () => {
    if (loading) return

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    router.push('/post-ad')
  }

  const signup = async () => {
    if (loading) return

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?confirmed=true`
      }
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    setView('checkEmail')
  }

  return (
    <div className="max-w-md mx-auto p-6">

      <h1 className="text-2xl font-bold mb-4">
        Login
      </h1>

      {confirmed && (
        <div className="bg-green-100 p-3 mb-3">
          Email confirmé ✔
        </div>
      )}

      {view === 'form' && (
        <>
          <input
            placeholder="Email"
            className="border p-2 w-full mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            placeholder="Password"
            type="password"
            className="border p-2 w-full mb-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            disabled={loading}
            className="bg-black text-white w-full p-2 mb-2"
          >
            {loading ? "Loading..." : "Login"}
          </button>

          <button
            onClick={signup}
            disabled={loading}
            className="border w-full p-2"
          >
            {loading ? "Loading..." : "Signup"}
          </button>
        </>
      )}

      {view === 'checkEmail' && (
        <div className="text-center space-y-4">

          <div className="bg-green-100 p-4">
            <p className="font-bold">Compte créé ✔</p>
            <p>Un email de confirmation a été envoyé</p>
          </div>

          <button
            onClick={() => setView('form')}
            className="border px-4 py-2"
          >
            Retour login
          </button>

        </div>
      )}

    </div>
  )
}