import { fetchFreeModels, fetchKeyStatus } from "@/lib/ai/openrouter";

/** Free models (with DSA recommendations) plus today's free-request allowance. */
export async function GET() {
  try {
    const [models, key] = await Promise.all([fetchFreeModels(), fetchKeyStatus()]);
    return Response.json({ models, key });
  } catch {
    return Response.json({ error: "Could not load models from OpenRouter." }, { status: 502 });
  }
}
