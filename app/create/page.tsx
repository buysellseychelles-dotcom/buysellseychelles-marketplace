'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/image-upload'

export default function CreatePage() {

  const router = useRouter()

  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const create = async () => {

    if (!title || !price) {
      alert('Titre et prix obligatoires')
      return
    }

    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) {
      alert('Connexion requise')
      setLoading(false)
      return
    }

    // 🚨 ANTI-SPAM
    const { data: lastPost } = await supabase
      .from('listings')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastPost?.created_at) {
      const diff = Date.now() - new Date(lastPost.created_at).getTime()

      if (diff < 60 * 1000) {
        alert('⏳ Attends 1 minute')
        setLoading(false)
        return
      }
    }

    // 📦 CREATE LISTING
    const { data, error } = await supabase
      .from('listings')
      .insert({
        title,
        price: Number(price),
        location,
        description,
        user_id: user.id,
        boosted: false,
        score: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error || !data) {
      alert('Erreur création')
      setLoading(false)
      return
    }

    // 📸 UPLOAD IMAGES (PROPRE + LOW DATA)
    for (let i = 0; i < images.length; i++) {

      const file = images[i]

      const fileName = `${data.id}-${i}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('listings')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (!uploadError) {

        const { data: publicUrl } = supabase
          .storage
          .from('listings')
          .getPublicUrl(fileName)

        await supabase.from('listing_images').insert({
          listing_id: data.id,
          image_url: publicUrl.publicUrl,
        })
      }
    }

    setLoading(false)

    router.push(`/listing/${data.id}`)
  }

  return (
    <div className="max-w-md mx-auto p-4">

      <h1 className="text-2xl font-bold mb-4">
        ➕ Nouvelle annonce
      </h1>

      <input
        placeholder="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <input
        placeholder="Prix"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <input
        placeholder="Localisation"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="border p-2 w-full mb-2"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      {/* IMAGES SIMPLE (IMPORTANT LOW DATA) */}
      <ImageUpload
        images={images.map(f => URL.createObjectURL(f))}
        onImagesChange={(urls: string[]) => {
          // conversion simple UI → File handling
        }}
        minImages={1}
        maxImages={6}
      />

      <button
        onClick={create}
        disabled={loading}
        className="bg-black text-white w-full p-3 rounded mt-4"
      >
        {loading ? 'Publication...' : 'Publier'}
      </button>

    </div>
  )
}