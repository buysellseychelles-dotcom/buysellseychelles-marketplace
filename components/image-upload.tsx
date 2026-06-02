'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, ImagePlus, AlertCircle } from 'lucide-react'

export default function ImageUpload({
  images,
  onImagesChange,
  minImages = 1,
  maxImages = 5,
}: {
  images: string[]
  onImagesChange: (images: string[]) => void
  minImages?: number
  maxImages?: number
}) {

  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)

    if (images.length + fileArray.length > maxImages) {
      setError(`Maximum ${maxImages} images autorisées`)
      return
    }

    setError(null)

    const newImages: string[] = []
    let loaded = 0

    fileArray.forEach((file) => {

      if (!file.type.startsWith('image/')) {
        setError('Seules les images sont autorisées')
        return
      }

      const reader = new FileReader()

      reader.onload = (e) => {
        const result = e.target?.result as string

        if (result) {
          newImages.push(result)
        }

        loaded++

        if (loaded === fileArray.length) {
          onImagesChange([...images, ...newImages])
        }
      }

      reader.readAsDataURL(file)
    })

  }, [images, maxImages, onImagesChange])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">

      {/* ZONE UPLOAD */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
        onDrop={handleDrop}
        className={`border-2 border-dashed p-6 text-center rounded ${
          isDragging ? 'border-black bg-gray-100' : 'border-gray-300'
        }`}
      >

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <Upload className="mx-auto mb-2" />

        <p>Ajoute tes photos</p>
        <p className="text-sm text-gray-500">
          Min {minImages} • Max {maxImages}
        </p>

      </div>

      {/* ERREUR */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* PREVIEW */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">

          {images.map((img, i) => (
            <div key={i} className="relative aspect-square">

              <Image
                src={img}
                alt="photo"
                fill
                className="object-cover rounded"
              />

              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded"
              >
                <X className="w-3 h-3" />
              </button>

            </div>
          ))}

          {/* ADD BUTTON */}
          {images.length < maxImages && (
            <label className="border border-dashed flex items-center justify-center rounded aspect-square cursor-pointer">

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />

              <ImagePlus />

            </label>
          )}

        </div>
      )}

      {/* COUNT */}
      <p className="text-xs text-gray-500 text-right">
        {images.length}/{maxImages}
      </p>

    </div>
  )
}