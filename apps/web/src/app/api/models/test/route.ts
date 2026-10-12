import { fetchFreeModels, fetchKeyStatus, testModel } from "@/lib/ai/openrouter";

/** Sends one tiny request to a free model and reports whether it answered. Uses 1 free request. */
export async function POST(request: Request) {
  // Local app: only accept calls made from our own pages, so other sites can't burn the quota.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  const model = typeof (body as { model?: unknown })?.model === "string"
    ? (body as { model: string }).model
    : "";

  let models;
  try {
    models = await fetchFreeModels();
  } catch {
    return Response.json({ error: "Could not load models from OpenRouter." }, { status: 502 });
  }
  if (!models.some((m) => m.id === model)) {
    return Response.json({ error: "Unknown or non-free model." }, { status: 400 });
  }

  const result = await testModel(model);
  const key = await fetchKeyStatus();
  return Response.json({ result, key });
}
