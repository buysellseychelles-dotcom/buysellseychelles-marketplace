'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

import AIOptimize from '@/components/ai-optimize'
import AIQualityScore from '@/components/ai-quality-score'
import PriceSuggest from '@/components/price-suggest'

export function CreateListingForm() {

  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("Login required")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('listings')
      .insert([{
        title,
        description,
        price: Number(price),
        location,
        whatsapp,
        user_id: user.id
      }])
      .select()

    if (error || !data) {
      alert("Error listing")
      setLoading(false)
      return
    }

    const listing = data[0]

    for (const url of images) {
      await supabase
        .from('listing_images')
        .insert({
          listing_id: listing.id,
          image_url: url
        })
    }

    router.push('/')

    setLoading(false)
  }

  return (
    <form onSubmit={submit} className="space-y-3">

      {/* TITLE */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="title"
        className="border p-2 w-full"
      />

      {/* DESCRIPTION */}
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="description"
        className="border p-2 w-full"
      />

      {/* PRICE */}
      <input
        value={price}
        onChange={e => setPrice(e.target.value)}
        placeholder="price"
        className="border p-2 w-full"
      />

      {/* LOCATION */}
      <input
        value={location}
        onChange={e => setLocation(e.target.value)}
        placeholder="location"
        className="border p-2 w-full"
      />

      {/* WHATSAPP */}
      <input
        value={whatsapp}
        onChange={e => setWhatsapp(e.target.value)}
        placeholder="whatsapp"
        className="border p-2 w-full"
      />

      {/* 🤖 IA OPTIMISATION COMPLETE */}
      <div className="flex flex-col gap-2">

        <AIOptimize
          onApply={(data) => {
            setTitle(data.ai_title)
            setDescription(data.ai_description)
            setPrice(String(data.suggested_price))
          }}
        />

        {/* 💰 PRICE AI */}
        <PriceSuggest
          category="general"
          onApply={(p) => setPrice(String(p))}
        />

        {/* 📊 QUALITY SCORE */}
        <AIQualityScore
          title={title}
          description={description}
          price={Number(price || 0)}
          onResult={(data) => {
            alert(`🔥 Score qualité: ${data.quality_score}/100`)
          }}
        />

      </div>

      {/* IMAGES + SUBMIT */}
      <Button disabled={loading}>
        Publish
      </Button>

    </form>
  )
}