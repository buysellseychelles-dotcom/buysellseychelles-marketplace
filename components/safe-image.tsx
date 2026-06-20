'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  className?: string
  width?: number
  height?: number
}

export default function SafeImage({ src, alt, fill, className, width, height }: SafeImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300 text-3xl">
        📷
      </div>
    )
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        onError={() => setError(true)}
        unoptimized
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
      unoptimized
    />
  )
}
