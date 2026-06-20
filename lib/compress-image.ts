export async function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    // Skip non-images or already small files (< 200 KB)
    if (!file.type.startsWith('image/') || file.size < 200 * 1024) {
      resolve(file)
      return
    }

    const img = new window.Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)

      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(file); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }
          // Only use compressed version if it's actually smaller
          if (blob.size >= file.size) { resolve(file); return }
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, '.jpg'),
            { type: 'image/jpeg' }
          )
          resolve(compressed)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

export async function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(f => compressImage(f)))
}
