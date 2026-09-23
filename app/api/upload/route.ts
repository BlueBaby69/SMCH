import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'])
const maxSize = 50 * 1024 * 1024

export async function POST(request: Request) {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File) || !allowed.has(file.type) || file.size > maxSize) return NextResponse.json({ error: 'Use a JPG, PNG, WEBP, MP4, or MOV file under 50MB.' }, { status: 400 })
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { error } = await admin.storage.from('post-media').upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false })
  if (error) return NextResponse.json({ error: 'Upload failed.' }, { status: 500 })
  const { data: signed } = await admin.storage.from('post-media').createSignedUrl(path, 3600)
  return NextResponse.json({ path, url: signed?.signedUrl || null, type: file.type })
}
