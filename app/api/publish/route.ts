import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { id } = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: post, error } = await supabase.from('posts').select('*').eq('id', id).eq('user_id', user.id).single()
    if (error || !post) return NextResponse.json({ error: 'Draft not found.' }, { status: 404 })
    if (process.env.AYRSHARE_API_KEY) {
      const content = post.generated_content as { platforms: string[]; captions: Record<string, string> }
      const response = await fetch('https://api.ayrshare.com/api/post', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AYRSHARE_API_KEY}` }, body: JSON.stringify({ post: content.captions[content.platforms[0]] || '', platforms: content.platforms, mediaUrls: post.media_url ? [post.media_url] : undefined }) })
      if (!response.ok) throw new Error('Ayrshare rejected the post')
    }
    const publishedAt = new Date().toISOString()
    const { data, error: updateError } = await supabase.from('posts').update({ status: 'published', published_at: publishedAt, publish_attempts: (post.publish_attempts || 0) + 1, external_results: { published: true, publishedAt } }).eq('id', id).eq('user_id', user.id).select().single()
    if (updateError) throw updateError
    await supabase.from('post_events').insert({ post_id: id, user_id: user.id, action: 'published', metadata: { publishedAt } })
    return NextResponse.json(data)
  } catch (error) { console.error('[v0] publish error', error); return NextResponse.json({ error: 'Publishing failed. Check your Ayrshare token.' }, { status: 500 }) }
}
