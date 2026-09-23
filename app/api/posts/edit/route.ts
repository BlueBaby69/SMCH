import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({ id: z.string().uuid(), hook: z.string().trim().min(1).max(500), hashtags: z.array(z.string().trim().regex(/^#/)).max(20), captions: z.record(z.string(), z.string().trim().min(1).max(5000)), scheduledFor: z.string().datetime().nullable().optional() })
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Please check the draft fields.' }, { status: 400 })
  const { id, hook, hashtags, captions, scheduledFor } = parsed.data
  const { data: post, error: findError } = await supabase.from('posts').select('generated_content').eq('id', id).eq('user_id', user.id).single()
  if (findError || !post) return NextResponse.json({ error: 'Draft not found.' }, { status: 404 })
  const generated = { ...post.generated_content, hook, hashtags, captions }
  const { data, error } = await supabase.from('posts').update({ generated_content: generated, scheduled_for: scheduledFor || null, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id).select().single()
  if (error) return NextResponse.json({ error: 'Could not save draft.' }, { status: 500 })
  await supabase.from('post_events').insert({ post_id: id, user_id: user.id, action: 'edited', metadata: { scheduledFor: scheduledFor || null } })
  return NextResponse.json(data)
}
