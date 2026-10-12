import { z } from "zod";
import { LANGUAGES, type LanguageId } from "@logiq/shared";
import { fetchFreeModels } from "@/lib/ai/openrouter";
import { forbidden, json, originAllowed, preflight } from "@/lib/cors";
import { readSettings, writeSettings } from "@/lib/store";

const PatchSchema = z.object({
  modelId: z.string().max(200).optional(),
  language: z.enum(LANGUAGES.map((l) => l.id) as [LanguageId, ...LanguageId[]]).optional(),
});

export function OPTIONS(request: Request) {
  return preflight(request);
}

/** Model + default language, stored in the DSA folder and shared by the web app and extension. */
export async function GET(request: Request) {
  if (!originAllowed(request)) return forbidden(request);
  return json(request, await readSettings());
}

export async function PUT(request: Request) {
  if (!originAllowed(request)) return forbidden(request);
  const parsed = PatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json(request, { error: "Invalid settings." }, { status: 400 });

  if (parsed.data.modelId) {
    const models = await fetchFreeModels().catch(() => []);
    const ok = models.some((m) => m.id === parsed.data.modelId && m.usable);
    if (!ok) return json(request, { error: "Unknown or unusable free model." }, { status: 400 });
  }
  return json(request, await writeSettings(parsed.data));
}
