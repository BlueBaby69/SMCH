import { createClient } from '@supabase/supabase-js'

export type Platform = 'instagram' | 'youtube' | 'x' | 'facebook' | 'tiktok'
export type PostContent = {
  platforms: Platform[]
  captions: Record<string, string>
  hashtags: string[]
  media_specs: { format: string; duration: string; notes: string }
  hook: string
}
export type Post = {
  id: string
  topic: string
  generated_content: PostContent
  status: 'draft' | 'pending' | 'published'
  media_url: string | null
  created_at: string
  published_at?: string | null
  scheduled_for?: string | null
  updated_at?: string
  publish_attempts?: number
  external_results?: Record<string, unknown>
}

export function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
