import { z } from "zod";
import { LANGUAGES, type ChatResponse, type ChatTurn, type LanguageId } from "@logiq/shared";
import { answerQuestion } from "@/lib/ai/chat";
import { forbidden, json, originAllowed, preflight } from "@/lib/cors";
import { appendChat, parseRef, readProblem, readSettings } from "@/lib/store";

const RequestSchema = z.object({
  ref: z.object({ platform: z.string(), file: z.string() }),
  language: z.enum(LANGUAGES.map((l) => l.id) as [LanguageId, ...LanguageId[]]),
  question: z.string().trim().min(1).max(2000),
});

export function OPTIONS(request: Request) {
  return preflight(request);
}

/** Follow-up question about a saved problem. Q and A are saved in the problem's file. */
export async function POST(request: Request) {
  if (!originAllowed(request)) return forbidden(request);

  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json(request, { error: "Invalid request." }, { status: 400 });
  const ref = parseRef(parsed.data.ref.platform, parsed.data.ref.file);
  if (!ref) return json(request, { error: "Invalid problem address." }, { status: 400 });

  const problem = await readProblem(ref);
  if (!problem) return json(request, { error: "Problem not found in your vault." }, { status: 404 });

  const solution =
    problem.solutions.find((s) => s.language === parsed.data.language) ?? problem.solutions[0];
  const { modelId } = await readSettings();
  const result = await answerQuestion(problem, solution, parsed.data.question, modelId);
  if (!result.ok) {
    const status = result.error.kind === "daily_limit" || result.error.kind === "rate_limited" ? 429 : 502;
    return json(request, { error: result.error }, { status });
  }

  const question: ChatTurn = { role: "user", content: parsed.data.question, createdAt: new Date().toISOString() };
  const chat = (await appendChat(ref, [question, result.answer])) ?? [question, result.answer];
  return json(request, { answer: result.answer, chat } satisfies ChatResponse);
}
