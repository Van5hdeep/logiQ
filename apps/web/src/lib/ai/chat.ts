import "server-only";
import { languageLabel, type AiError, type ChatTurn, type Solution, type StoredProblem } from "@logiq/shared";
import { chatCompletion, type ChatMessage } from "./openrouter";

const HISTORY_TURNS = 10; // keep prompts small: only the latest turns are sent

function systemPrompt(problem: StoredProblem, solution: Solution | undefined): string {
  return [
    "You are logiQ, a friendly DSA tutor. The student is looking at this problem and the solution below and asks follow-up questions.",
    "Answer so a beginner understands on first read: short sentences, everyday words, explain any technical term in a few words, say WHY. Use a tiny concrete example when it helps.",
    "Keep answers focused: usually 3-8 sentences. Use a short code snippet only if it really helps, in a ``` block. Refer to solution lines by number when useful.",
    "If the question is unrelated to this problem or DSA, gently steer back.",
    "",
    `Problem: ${problem.number && problem.number !== problem.title ? `${problem.number}. ` : ""}${problem.title} (${problem.platform})`,
    problem.statement.slice(0, 8000),
    "",
    solution
      ? [
          `Solution in ${languageLabel(solution.language)} (line numbers for reference):`,
          solution.code
            .split("\n")
            .map((line, i) => `${i + 1}: ${line}`)
            .join("\n"),
          solution.idea ? `Idea: ${solution.idea}` : "",
          `Complexity: time ${solution.complexity.time} (${solution.complexity.timeReason}); space ${solution.complexity.space} (${solution.complexity.spaceReason})`,
        ].join("\n")
      : "",
  ].join("\n");
}

export async function answerQuestion(
  problem: StoredProblem,
  solution: Solution | undefined,
  question: string,
  model: string,
): Promise<{ ok: true; answer: ChatTurn } | { ok: false; error: AiError }> {
  const history: ChatMessage[] = (problem.chat ?? [])
    .slice(-HISTORY_TURNS)
    .map((t) => ({ role: t.role, content: t.content }));

  const reply = await chatCompletion({
    model,
    messages: [
      { role: "system", content: systemPrompt(problem, solution) },
      ...history,
      { role: "user", content: question },
    ],
    maxTokens: 2000,
    timeoutMs: 120_000,
  });
  if (!reply.ok) return { ok: false, error: reply.error };
  if (!reply.content) {
    return { ok: false, error: { kind: "unknown", message: "The model returned an empty answer. Try again." } };
  }
  return {
    ok: true,
    answer: { role: "assistant", content: reply.content, model: reply.model, createdAt: new Date().toISOString() },
  };
}
