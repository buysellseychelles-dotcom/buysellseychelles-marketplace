import { createClient } from '@supabase/supabase-js'
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from '@/lib/upload-limits'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const path = formData.get('path') as string | null
    const bucket = (formData.get('bucket') as string) || 'avatars'

    if (!file || !path) {
      return Response.json({ error: 'Missing file or path' }, { status: 400 })
    }

    // Limite de taille : 5 MB par fichier (défense côté serveur)
    if (file.size > MAX_UPLOAD_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1)
      return Response.json(
        { error: `Image too large (${mb} MB). Maximum ${MAX_UPLOAD_MB} MB per photo.` },
        { status: 413 },
      )
    }

    // Create bucket if it doesn't exist (public, no RLS needed)
    await supabaseAdmin.storage.createBucket(bucket, { public: true }).catch(() => {})

    const bytes = await file.arrayBuffer()
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      // Cache long : les avatars/documents sont soit sur un chemin fixe re-uploadé avec
      // un ?t= de cache-busting côté appelant, soit sur un chemin unique par upload.
      .upload(path, bytes, { contentType: file.type, upsert: true, cacheControl: '31536000' })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
    return Response.json({ url: publicUrl })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload error'
    return Response.json({ error: msg }, { status: 500 })
  }
}
