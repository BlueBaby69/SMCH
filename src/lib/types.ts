export type Platform = "instagram" | "twitter" | "youtube" | "facebook" | "linkedin" | "tiktok";
export type PostStatus = "draft" | "pending_approval" | "scheduled" | "published" | "failed" | "rejected";

export interface FormattedContent {
  instagram?: { caption: string; hashtags: string[] };
  twitter?: { tweet: string };
  youtube?: { title: string; description: string; tags: string[] };
  tiktok?: { caption: string; hashtags: string[] };
  facebook?: { caption: string };
  linkedin?: { caption: string };
  [key: string]: unknown;
}

export interface BrandProfile {
  id: string;
  created_at: string;
  niche: string;
  brand_name: string;
  handle_ideas: string[];
  bio_instagram: string | null;
  bio_twitter: string | null;
  bio_youtube: string | null;
  bio_tiktok: string | null;
  target_audience: string | null;
  avatar_prompt: string | null;
  ayrshare_profile_key: string | null;
  is_active: boolean;
}

export interface Post {
  id: string;
  created_at: string;
  brand_profile_id: string | null;
  topic: string;
  raw_input: string | null;
  media_urls: string[];
  formatted_content: FormattedContent;
  status: PostStatus;
  scheduled_for: string | null;
  published_at: string | null;
  ayrshare_post_id: string | null;
  error_message: string | null;
  brand_profiles?: BrandProfile | null;
}

export interface PublishPayload {
  post: string;
  platforms: Platform[];
  mediaUrls?: string[];
  profileKey?: string;
  scheduleDate?: string;
}
