import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const brandId = url.searchParams.get("brandId");
    const supabase = getSupabaseServer();
    let q = supabase.from("posts").select("*, brand_profiles(id, brand_name, niche)").order("created_at", { ascending: false }).limit(100);
    if (status) q = q.eq("status", status);
    if (brandId) q = q.eq("brand_profile_id", brandId);
    const { data, error } = await q;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}
