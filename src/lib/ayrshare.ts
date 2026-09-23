import type { Platform } from "./types";

const BASE = "https://app.ayrshare.com/api";

function headers() {
  const key = process.env.AYRSHARE_API_KEY;
  if (!key) throw new Error("Missing AYRSHARE_API_KEY");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`
  };
}

export async function ayrPost(payload: {
  post: string;
  platforms: Platform[];
  mediaUrls?: string[];
  profileKey?: string;
  scheduleDate?: string;
}) {
  const res = await fetch(`${BASE}/post`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      post: payload.post,
      platforms: payload.platforms,
      mediaUrls: payload.mediaUrls ?? [],
      profileKey: payload.profileKey,
      scheduleDate: payload.scheduleDate
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Ayrshare post failed");
  return data as { id: string; status: string; [k: string]: unknown };
}

export async function ayrAnalytics(platform: string, profileKey?: string) {
  const qs = new URLSearchParams({ platform, ...(profileKey ? { profileKey } : {}) });
  const res = await fetch(`${BASE}/analytics?${qs.toString()}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Ayrshare analytics failed");
  return data;
}
