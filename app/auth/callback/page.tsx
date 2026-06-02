'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      await supabase.auth.getSession()
      router.push('/login?confirmed=1')
    }

    handle()
  }, [])

  return <p className="p-6">Confirmation en cours...</p>
}