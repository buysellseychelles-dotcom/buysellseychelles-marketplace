'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PostAdPage() {

  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [category, setCategory] = useState('')
  const [images, setImages] = useState<FileList | null>(null)

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        title,
        description,
        price,
        location,
        whatsapp,
        category,
        boosted: false,
      })
      .select()
      .single()

    if (error || !listing) {
      alert(error?.message)
      return
    }

    if (images) {
      for (const file of Array.from(images)) {

        const fileName = `${listing.id}-${Date.now()}-${file.name}`

        const { error: uploadError } = await supabase
          .storage
          .from('listings')
          .upload(fileName, file)

        if (!uploadError) {

          const { data } = supabase
            .storage
            .from('listings')
            .getPublicUrl(fileName)

          await supabase
            .from('listing_images')
            .insert({
              listing_id: listing.id,
              image_url: data.publicUrl,
            })
        }
      }
    }

    router.push('/')
  }

  return (
    <div className="max-w-xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-4">
        Publier une annonce
      </h1>

      <form onSubmit={handleSubmit} className="space-y-3">

        <input
          placeholder="Titre"
          className="border p-2 w-full"
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="border p-2 w-full"
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          placeholder="Prix"
          className="border p-2 w-full"
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          placeholder="Location"
          className="border p-2 w-full"
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          placeholder="WhatsApp"
          className="border p-2 w-full"
          onChange={(e) => setWhatsapp(e.target.value)}
        />

        <select
          className="border p-2 w-full"
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Choisir une catégorie</option>
          <option value="voiture">Voiture</option>
          <option value="immobilier">Immobilier</option>
          <option value="electronique">Électronique</option>
          <option value="services">Services</option>
        </select>

        <input
          type="file"
          multiple
          onChange={(e) => setImages(e.target.files)}
        />

        <button className="bg-black text-white px-4 py-2 w-full">
          Publier
        </button>

      </form>

    </div>
  )
}