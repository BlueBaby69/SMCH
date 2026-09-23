import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { niche, targetAudienceDescription } = await req.json();

    if (!niche) {
      return NextResponse.json({ error: 'Niche is required' }, { status: 400 });
    }

    const prompt = `You are a world-class brand strategist. Create a complete brand kit for a new AI-powered social media brand in the following niche: "${niche}".
Target Audience: ${targetAudienceDescription || 'General audience interested in this niche'}.

Return a JSON object with the following structure:
{
  "brandNameSuggestions": ["Name 1", "Name 2", "Name 3"],
  "handleIdeas": {
    "instagram": ["handle1", "handle2"],
    "twitter": ["handle1", "handle2"],
    "tiktok": ["handle1", "handle2"],
    "youtube": ["handle1", "handle2"]
  },
  "bios": {
    "instagram": "...",
    "twitter": "...",
    "youtube": "...",
    "tiktok": "..."
  },
  "avatarPrompt": "Detailed AI image generation prompt for a brand logo/avatar",
  "strategyPillars": ["Pillar 1", "Pillar 2", "Pillar 3"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Flatten handles for the database text[] column
    const allHandles = Object.values(result.handleIdeas).flat();
    const selectedBrandName = result.brandNameSuggestions[0];

    const { data, error } = await supabaseAdmin
      .from('brand_profiles')
      .insert({
        niche,
        brand_name: selectedBrandName,
        handle_ideas: allHandles,
        bio_instagram: result.bios.instagram,
        bio_twitter: result.bios.twitter,
        bio_youtube: result.bios.youtube,
        bio_tiktok: result.bios.tiktok,
        target_audience: targetAudienceDescription,
        avatar_prompt: result.avatarPrompt,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      brand: data, 
      fullKit: result 
    });

  } catch (error: any) {
    console.error('Brand Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
