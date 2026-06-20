import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const form = await req.formData()
  const reportId = form.get('reportId') as string

  if (!reportId) return NextResponse.json({ error: 'Missing reportId' }, { status: 400 })

  await supabase.from('reports').update({ resolved: true }).eq('id', reportId)

  return NextResponse.redirect(new URL('/admin/reports', req.url))
}
