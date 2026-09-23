import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAI } from "@/lib/openai";
import { getSupabaseServer } from "@/lib/supabase";

const Body = z.object({ niche: z.string().min(2).max(120) });

export async function POST(req: Request) {
  try {
    const { niche } = Body.parse(await req.json());
    const openai = getOpenAI();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a niche brand strategist. Return strict JSON only." },
        {
          role: "user",
          content: `Niche: "${niche}". Return JSON: { "brand_name": string, "handle_ideas": string[5], "bio_instagram": string, "bio_twitter": string, "bio_youtube": string, "bio_tiktok": string, "target_audience": string, "avatar_prompt": string }`
        }
      ]
    });

    const data = JSON.parse(completion.choices[0].message.content ?? "{}");
    const supabase = getSupabaseServer();
    const { data: row, error } = await supabase
      .from("brand_profiles")
      .insert({
        niche,
        brand_name: data.brand_name ?? `${niche} Hub`,
        handle_ideas: data.handle_ideas ?? [],
        bio_instagram: data.bio_instagram ?? null,
        bio_twitter: data.bio_twitter ?? null,
        bio_youtube: data.bio_youtube ?? null,
        bio_tiktok: data.bio_tiktok ?? null,
        target_audience: data.target_audience ?? null,
        avatar_prompt: data.avatar_prompt ?? null
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(row);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Brand generation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
