import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { type Platform, type PostContent } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const fallback = (topic: string, platforms: Platform[]): PostContent => ({
  platforms, hook: `A fresh perspective on ${topic}.`,
  captions: Object.fromEntries(platforms.map((p) => [p, `What if ${topic} could be simpler? Here is the idea worth sharing today.`])),
  hashtags: ['#socialstrategy', '#creatorworkflow', '#contentmarketing'],
  media_specs: { format: '9:16 vertical', duration: '30–45 seconds', notes: 'Lead with the hook in the first 2 seconds.' },
})

export async function POST(request: Request) {
  try {
    const schema = z.object({ topic: z.string().trim().min(3).max(5000), platforms: z.array(z.enum(['instagram', 'youtube', 'x', 'facebook', 'tiktok'])).min(1).max(5), mediaUrl: z.string().url().optional().or(z.literal('')) })
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Add a valid topic, media URL, and platform selection.' }, { status: 400 })
    const { topic, platforms, mediaUrl } = parsed.data
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    let content = fallback(topic, platforms)
    if (process.env.OPENAI_API_KEY) {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const response = await client.chat.completions.create({ model: 'gpt-4o', response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'You are a senior social media strategist. Return only JSON with hook, captions (object keyed by platform), hashtags (array), and media_specs (object with format, duration, notes). Make platform-native copy.' }, { role: 'user', content: JSON.stringify({ topic, platforms, mediaUrl }) }] })
      content = { ...JSON.parse(response.choices[0].message.content || '{}'), platforms }
    }
    const { data, error } = await supabase.from('posts').insert({ user_id: user.id, topic: topic.trim(), generated_content: content, status: 'pending', media_url: mediaUrl || null }).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) { console.error('[v0] generate error', error); return NextResponse.json({ error: 'Could not create draft.' }, { status: 500 }) }
}
