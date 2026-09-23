import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI() {
  if (client) return client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Missing OPENAI_API_KEY");
  client = new OpenAI({ apiKey: key });
  return client;
}

export const BRAND_SYSTEM = `You are a niche brand strategist. Return strict JSON only.`;
export const CONTENT_SYSTEM = `You are a viral short-form social media copywriter. Return strict JSON only matching the requested schema. Tailor per platform.`;
