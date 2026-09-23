import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase";
import { ayrPost } from "@/lib/ayrshare";
import type { FormattedContent, Platform } from "@/lib/types";

const Body = z.object({
  postId: z.string().uuid(),
  action: z.enum(["approve", "schedule", "reject"]),
  scheduleDate: z.string().optional()
});

function primaryCaption(formatted: FormattedContent): string {
  if (formatted.instagram) return `${formatted.instagram.caption}\n${(formatted.instagram.hashtags ?? []).join(" ")}`;
  if (formatted.tiktok) return `${formatted.tiktok.caption}\n${(formatted.tiktok.hashtags ?? []).join(" ")}`;
  if (formatted.twitter) return formatted.twitter.tweet;
  if (formatted.youtube) return `${formatted.youtube.title}\n${formatted.youtube.description}`;
  const first = Object.values(formatted)[0] as { caption?: string } | undefined;
  return first?.caption ?? "New post";
}

/**
 * Publish payload contract:
 * {
 *   "post": "primary caption string...",
 *   "platforms": ["instagram", "twitter", "youtube", "tiktok"],
 *   "mediaUrls": ["..."],
 *   "profileKey": "AYRSHARE_PROFILE_KEY_IF_EXISTS"
 * }
 */
export async function POST(req: Request) {
  try {
    const { postId, action, scheduleDate } = Body.parse(await req.json());
    const supabase = getSupabaseServer();

    const { data: post, error: fetchErr } = await supabase
      .from("posts")
      .select("*, brand_profiles(ayrshare_profile_key)")
      .eq("id", postId)
      .single();
    if (fetchErr || !post) throw new Error("Post not found");

    if (action === "reject") {
      await supabase.from("posts").update({ status: "rejected" }).eq("id", postId);
      return NextResponse.json({ ok: true });
    }

    const formatted = post.formatted_content as FormattedContent;
    const platforms = Object.keys(formatted) as Platform[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileKey = (post as any)?.brand_profiles?.ayrshare_profile_key ?? undefined;

    const result = await ayrPost({
      post: primaryCaption(formatted),
      platforms,
      mediaUrls: post.media_urls ?? [],
      profileKey,
      scheduleDate: action === "schedule" ? scheduleDate : undefined
    });

    await supabase
      .from("posts")
      .update({
        status: action === "schedule" ? "scheduled" : "published",
        scheduled_for: action === "schedule" ? (scheduleDate ?? null) : null,
        published_at: action === "approve" ? new Date().toISOString() : null,
        ayrshare_post_id: (result as { id?: string }).id ?? null,
        error_message: null
      })
      .eq("id", postId);

    return NextResponse.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Publish failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
