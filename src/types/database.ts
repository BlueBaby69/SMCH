export type PostStatus = 'draft' | 'pending_approval' | 'scheduled' | 'published' | 'failed' | 'rejected';
export type TargetPlatform = 'instagram' | 'twitter' | 'youtube' | 'facebook' | 'linkedin' | 'tiktok';

export interface BrandProfile {
  id: string;
  created_at: string;
  niche: string;
  brand_name: string;
  handle_ideas: string[];
  bio_instagram?: string;
  bio_twitter?: string;
  bio_youtube?: string;
  bio_tiktok?: string;
  target_audience?: string;
  avatar_prompt?: string;
  ayrshare_profile_key?: string;
  is_active: boolean;
}

export interface Post {
  id: string;
  created_at: string;
  brand_profile_id: string | null;
  topic: string;
  raw_input?: string;
  media_urls: string[];
  formatted_content: Record<string, any>;
  status: PostStatus;
  scheduled_for?: string;
  published_at?: string;
  ayrshare_post_id?: string;
  error_message?: string;
}

export interface PostAnalytics {
  id: string;
  post_id: string;
  platform: TargetPlatform;
  likes: number;
  shares: number;
  comments: number;
  impressions: number;
  updated_at: string;
}
