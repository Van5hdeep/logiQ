import { z } from "zod";
import { LANGUAGES, type ExplainResponse, type LanguageId } from "@logiq/shared";
import { generateSolution } from "@/lib/ai/explain";
import { forbidden, json, originAllowed, preflight } from "@/lib/cors";
import { completeContext } from "@/lib/problem-source";
import { findProblem, readSettings, saveSolution } from "@/lib/store";

const RequestSchema = z.object({
  problem: z.object({
    platform: z.enum(["leetcode", "codeforces", "codechef"]),
    externalId: z.string().min(1).max(100),
    number: z.string().max(40),
    title: z.string().max(300),
    url: z.string().url(),
    statement: z.string().max(60_000),
    difficulty: z.string().max(40).optional(),
    tags: z.array(z.string().max(60)).max(30).optional(),
    starterCode: z.string().max(20_000).optional(),
    starterLanguage: z.string().max(40).optional(),
  }),
  language: z.enum(LANGUAGES.map((l) => l.id) as [LanguageId, ...LanguageId[]]),
  regenerate: z.boolean().optional(),
});

export function OPTIONS(request: Request) {
  return preflight(request);
}

/**
 * Solve + explain a problem in a language, and save it to the DSA folder.
 * A solution already saved for that language is returned without calling the AI (0 tokens).
 */
export async function POST(request: Request) {
  if (!originAllowed(request)) return forbidden(request);

  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return json(request, { error: "Invalid request: " + parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { language, regenerate } = parsed.data;

  if (!regenerate) {
    const saved = await findProblem(parsed.data.problem);
    const solution = saved?.problem.solutions.find((s) => s.language === language);
    if (saved && solution) {
      return json(request, { ...saved, solution, cached: true } satisfies ExplainResponse);
    }
  }

  const problem = await completeContext(parsed.data.problem);
  const { modelId } = await readSettings();
  const result = await generateSolution(problem, language, modelId);
  if (!result.ok) {
    const status = result.error.kind === "daily_limit" || result.error.kind === "rate_limited" ? 429 : 502;
    return json(request, { error: result.error }, { status });
  }

  const saved = await saveSolution(problem, result.solution);
  return json(request, { ...saved, solution: result.solution, cached: false } satisfies ExplainResponse);
}
