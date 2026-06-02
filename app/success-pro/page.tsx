'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SuccessPro() {

  useEffect(() => {

    const activate = async () => {

      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      if (!user) return

      await supabase
        .from('profiles')
        .update({
          is_pro: true
        })
        .eq('id', user.id)
    }

    activate()

  }, [])

  return (
    <div className="p-10 text-center">

      <h1 className="text-3xl font-bold text-purple-600">
        ⭐ Vous êtes maintenant PRO
      </h1>

    </div>
  )
}