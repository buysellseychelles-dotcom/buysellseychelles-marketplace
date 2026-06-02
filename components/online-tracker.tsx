'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function OnlineTracker() {

  useEffect(() => {

    const setOnline = async () => {

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      if (!user) return

      await supabase
        .from('profiles')
        .update({ online: true })
        .eq('id', user.id)
    }

    const setOffline = async () => {

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      if (!user) return

      await supabase
        .from('profiles')
        .update({ online: false })
        .eq('id', user.id)
    }

    setOnline()

    window.addEventListener('beforeunload', setOffline)

    return () => {
      setOffline()
      window.removeEventListener('beforeunload', setOffline)
    }

  }, [])

  return null
}