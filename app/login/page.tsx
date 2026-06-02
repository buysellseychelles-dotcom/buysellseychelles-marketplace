'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {

  const router = useRouter()
  const searchParams = useSearchParams()
  const confirmed = searchParams.get('confirmed')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.push('/post-ad')
    }
    checkUser()
  }, [])

  const login = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    setLoading(false)

    if (error) return alert(error.message)

    await supabase.auth.refreshSession()
    router.push('/post-ad')
  }

  const signup = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?confirmed=true`
      }
    })

    setLoading(false)

    if (error) return alert(error.message)

    alert("Compte créé ✔ check email")
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

      <button onClick={login} className="bg-black text-white w-full p-2 mb-2">
        Login
      </button>

      <button onClick={signup} className="border w-full p-2">
        Signup
      </button>

    </div>
  )
}