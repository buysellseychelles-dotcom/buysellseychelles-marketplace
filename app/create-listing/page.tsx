'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

import AIOptimize from '@/components/ai-optimize'
import PriceSuggest from '@/components/price-suggest'

export default function CreateListingPage() {

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [category, setCategory] = useState('Voiture')
  const [loading, setLoading] = useState(false)

  const createListing = async () => {

    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) {
      alert('Vous devez être connecté')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('listings').insert({
      title,
      description,
      price,
      category,
      user_id: user.id,
      boosted: false,
      score: 0
    })

    setLoading(false)

    if (error) {
      console.log(error)
      alert('Erreur création annonce')
      return
    }

    alert('Annonce créée 🚀')

    setTitle('')
    setDescription('')
    setPrice(0)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Créer une annonce
      </h1>

      {/* CATEGORY */}
      <select
        className="border w-full p-2 mb-3"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="Voiture">Voiture</option>
        <option value="Immobilier">Immobilier</option>
        <option value="Téléphone">Téléphone</option>
      </select>

      {/* TITLE */}
      <input
        className="border w-full p-2 mb-3"
        placeholder="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* DESCRIPTION */}
      <textarea
        className="border w-full p-2 mb-3"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* PRICE */}
      <input
        className="border w-full p-2 mb-3"
        placeholder="Prix"
        type="number"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
      />

      {/* 🤖 IA OPTIMISATION */}
      <div className="mb-4">

        <AIOptimize
          onApply={(data) => {
            setTitle(data.ai_title)
            setDescription(data.ai_description)
            setPrice(data.suggested_price)
          }}
        />

      </div>

      {/* 💰 PRICE AI */}
      <div className="mb-4">

        <PriceSuggest
          category={category}
          onApply={(p) => setPrice(p)}
        />

      </div>

      {/* SUBMIT */}
      <button
        onClick={createListing}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? 'Création...' : 'Publier l’annonce'}
      </button>

    </div>
  )
}