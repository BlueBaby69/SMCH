import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAI } from "@/lib/openai";
import { getSupabaseServer } from "@/lib/supabase";

const Body = z.object({
  brand_profile_id: z.string().uuid(),
  topic: z.string().min(2).max(2000),
  mediaUrls: z.array(z.string().url()).optional().default([]),
  platforms: z.array(z.enum(["instagram", "twitter", "youtube", "tiktok", "facebook", "linkedin"])).min(1),
  tone: z.string().optional().default("viral, punchy")
});

/**
 * Expected formatted_content shape:
 * {
 *   "instagram": { "caption": "...", "hashtags": ["..."] },
 *   "twitter": { "tweet": "..." },
 *   "youtube": { "title": "...", "description": "...", "tags": ["..."] },
 *   "tiktok": { "caption": "...", "hashtags": ["..."] }
 * }
 */
export async function POST(req: Request) {
  try {
    const input = Body.parse(await req.json());
    const supabase = getSupabaseServer();

    const { data: brand } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("id", input.brand_profile_id)
      .single();

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a viral short-form social media copywriter. Return strict JSON only matching the requested schema. Tailor per platform."
        },
        {
          role: "user",
          content: `Brand: ${brand?.brand_name ?? "n/a"} (${brand?.niche ?? "general"}). Tone: ${input.tone}. Topic: "${input.topic}". Platforms: ${input.platforms.join(", ")}. Return JSON with keys only for requested platforms: instagram: {caption, hashtags[]}, twitter: {tweet}, youtube: {title, description, tags[]}, tiktok: {caption, hashtags[]}, facebook: {caption}, linkedin: {caption}.`
        }
      ]
    });

    const formatted = JSON.parse(completion.choices[0].message.content ?? "{}");

    const { data: row, error } = await supabase
      .from("posts")
      .insert({
        brand_profile_id: input.brand_profile_id,
        topic: input.topic,
        raw_input: input.topic,
        media_urls: input.mediaUrls,
        formatted_content: formatted,
        status: "pending_approval"
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(row);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Content generation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
