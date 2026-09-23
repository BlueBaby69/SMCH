create extension if not exists "uuid-ossp";

-- Enum Types
create type post_status as enum ('draft', 'pending_approval', 'scheduled', 'published', 'failed', 'rejected');
create type target_platform as enum ('instagram', 'twitter', 'youtube', 'facebook', 'linkedin', 'tiktok');

-- 1. Brand Profiles Table (Niche Engine)
create table public.brand_profiles (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  niche text not null,
  brand_name text not null,
  handle_ideas text[] default '{}',
  bio_instagram text,
  bio_twitter text,
  bio_youtube text,
  bio_tiktok text,
  target_audience text,
  avatar_prompt text,
  ayrshare_profile_key text,
  is_active boolean default true
);

-- 2. Posts Table
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  brand_profile_id uuid references public.brand_profiles(id) on delete set null,
  topic text not null,
  raw_input text,
  media_urls text[] default '{}',
  formatted_content jsonb not null,
  status post_status default 'pending_approval' not null,
  scheduled_for timestamp with time zone,
  published_at timestamp with time zone,
  ayrshare_post_id text,
  error_message text
);

-- 3. Analytics Table
create table public.post_analytics (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade,
  platform target_platform not null,
  likes integer default 0,
  shares integer default 0,
  comments integer default 0,
  impressions integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
