import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { brandProfileId, topic, rawInput, platforms, tone, mediaUrl } = await req.json();

    if (!brandProfileId || !topic) {
      return NextResponse.json({ error: 'Brand Profile ID and Topic are required' }, { status: 400 });
    }

    // 1. Fetch brand profile context
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('brand_profiles')
      .select('*')
      .eq('id', brandProfileId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 });
    }

    const prompt = `You are an expert social media content creator for the brand "${profile.brand_name}" in the "${profile.niche}" niche.
Target Audience: ${profile.target_audience}

Task: Generate highly engaging social media content based on the following:
Topic: ${topic}
Input/Notes: ${rawInput || 'Expand on the topic'}
Tone: ${tone || 'Professional yet engaging'}
Requested Platforms: ${platforms.join(', ')}

Return a JSON object matching this schema:
{
  "instagram": { "caption": "...", "hashtags": ["#tag1", "#tag2"] },
  "twitter": { "tweet": "..." },
  "youtube": { "title": "...", "description": "...", "tags": ["tag1", "tag2"] },
  "tiktok": { "caption": "...", "hashtags": ["#tag1", "#tag2"] }
}

Only include keys for the platforms requested. Ensure the content is tailored to the specific platform's culture and constraints (e.g., short for Twitter, visual-first for Instagram).`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const formattedContent = JSON.parse(response.choices[0].message.content || '{}');

    // 2. Save to posts table
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .insert({
        brand_profile_id: brandProfileId,
        topic,
        raw_input: rawInput,
        media_urls: mediaUrl ? [mediaUrl] : [],
        formatted_content: formattedContent,
        status: 'pending_approval',
      })
      .select()
      .single();

    if (postError) throw postError;

    return NextResponse.json(post);

  } catch (error: any) {
    console.error('Content Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
