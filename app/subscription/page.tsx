'use client'

import { supabase } from '@/lib/supabase'

export default function SubscriptionPage() {

  const subscribe = async () => {

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) return

    // abonnement simple (simulation paiement)
    const endsAt = new Date()
    endsAt.setMonth(endsAt.getMonth() + 1)

    await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan: 'pro',
      ends_at: endsAt.toISOString()
    })

    await supabase
      .from('profiles')
      .update({ is_pro: true })
      .eq('id', user.id)

    alert('Abonnement activé 🚀')
  }

  return (
    <div className="max-w-xl mx-auto p-6 text-center">

      <h1 className="text-2xl font-bold mb-4">
        Devenir vendeur PRO
      </h1>

      <p className="mb-6 text-gray-600">
        Boost automatique + badge + visibilité
      </p>

      <button
        onClick={subscribe}
        className="bg-black text-white px-6 py-3 rounded"
      >
        S’abonner PRO
      </button>

    </div>
  )
}