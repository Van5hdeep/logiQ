import "server-only";
import { z } from "zod";
import { languageLabel, type AiError, type LanguageId, type ProblemContext, type Solution } from "@logiq/shared";
import { chatCompletion, type ChatMessage } from "./openrouter";

const SolutionSchema = z.object({
  idea: z.string().min(1),
  code: z.string().min(1),
  lines: z
    .array(
      z.object({
        from: z.number().int().min(1),
        to: z.number().int().min(1),
        code: z.string(),
        explanation: z.string().min(1),
      }),
    )
    .min(1),
  complexity: z.object({
    time: z.string().min(1),
    timeReason: z.string().min(1),
    space: z.string().min(1),
    spaceReason: z.string().min(1),
  }),
});

const EXAMPLE = {
  idea: "We need two numbers that add up to target. Instead of checking every pair (slow), we walk through the list once and remember each number we've seen in a dictionary (a lookup table). For each number we ask: have we already seen the number that would complete the sum? If yes, we're done.",
  code: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            if target - num in seen:\n                return [seen[target - num], i]\n            seen[num] = i\n        return []",
  lines: [
    { from: 1, to: 2, code: "class Solution:\n    def twoSum(...)", explanation: "LeetCode's required class and method signature." },
    { from: 3, to: 3, code: "seen = {}", explanation: "Maps each number we've passed to its index, so lookups are O(1)." },
    { from: 4, to: 4, code: "for i, num in enumerate(nums):", explanation: "Visit every number once, keeping its index." },
    { from: 5, to: 6, code: "if target - num in seen:\n    return [seen[target - num], i]", explanation: "If the partner that completes the sum was seen earlier, return both indices." },
    { from: 7, to: 7, code: "seen[num] = i", explanation: "Remember this number for later partners." },
    { from: 8, to: 8, code: "return []", explanation: "Fallback; the problem guarantees an answer exists." },
  ],
  complexity: {
    time: "O(n)",
    timeReason: "Each of the n numbers is visited once and each dictionary lookup is O(1) on average.",
    space: "O(n)",
    spaceReason: "The dictionary can hold up to n numbers.",
  },
};

function systemPrompt(language: LanguageId, platform: ProblemContext["platform"]): string {
  const io =
    platform === "leetcode"
      ? "Write only the LeetCode solution class/function with the exact signature LeetCode expects (match the starter code if given). No input reading, no main."
      : "Write a complete program that reads from standard input and writes to standard output, handling multiple test cases if the statement has them. Use fast I/O and 64-bit integers where sums can overflow.";
  return [
    `You are an expert competitive programmer and patient DSA teacher. Solve the problem in ${languageLabel(language)}.`,
    "The solution must be correct and optimal for the given constraints.",
    io,
    "Write every explanation so a beginner understands it on first read:",
    "- Short sentences and everyday words. No unexplained jargon: the first time you use a term (e.g. hash map, prefix sum, two pointers, DP state), explain it in a few words.",
    "- Always say WHY, not only WHAT: what the line achieves for the overall idea.",
    "- Use small concrete numbers from the examples when they help.",
    "First, `idea`: the approach in 2-4 simple sentences (what we notice, what we do, why it works), as if talking to a friend.",
    "Then the code, then `lines`: explain the code line by line. Every non-trivial line gets 1-3 sentences. Group trivial lines (braces, imports, blank lines) with their neighbours. Line numbers are 1-based and refer to your code.",
    "Then time and space complexity in Big-O, each with a one or two sentence reason that names what n (and any other letter) means.",
    "Respond with ONLY a JSON object, no markdown fences, in exactly this shape:",
    JSON.stringify(EXAMPLE),
  ].join("\n");
}

function userPrompt(p: ProblemContext): string {
  return [
    `Problem: ${p.number && p.number !== p.title ? `${p.number}. ` : ""}${p.title} (${p.platform})`,
    p.difficulty ? `Difficulty: ${p.difficulty}` : "",
    "",
    p.statement,
    p.starterCode
      ? `\nStarter code from the page's editor${p.starterLanguage ? ` (${p.starterLanguage})` : ""} — follow its signature, translated to the target language if different:\n${p.starterCode.slice(0, 4000)}`
      : "",
  ]
    .filter((x) => x !== "")
    .join("\n");
}

/** Pulls the JSON object out of a model reply (tolerates code fences and stray text). */
function parseReply(content: string): unknown {
  const cleaned = content.replace(/^```(?:json)?\s*|\s*```$/g, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON object in the reply");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function generateSolution(
  problem: ProblemContext,
  language: LanguageId,
  model: string,
): Promise<{ ok: true; solution: Solution } | { ok: false; error: AiError }> {
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt(language, problem.platform) },
    { role: "user", content: userPrompt(problem) },
  ];

  // One retry with the validation error, since free models sometimes break the format.
  for (let attempt = 0; attempt < 2; attempt++) {
    const reply = await chatCompletion({ model, messages, maxTokens: 8000, timeoutMs: 180_000 });
    if (!reply.ok) return { ok: false, error: reply.error };

    try {
      const parsed = SolutionSchema.parse(parseReply(reply.content));
      return {
        ok: true,
        solution: { language, ...parsed, model: reply.model, createdAt: new Date().toISOString() },
      };
    } catch (e) {
      messages.push(
        { role: "assistant", content: reply.content.slice(0, 6000) },
        {
          role: "user",
          content: `That reply was not valid (${(e as Error).message.slice(0, 300)}). Reply again with ONLY the JSON object in the required shape.`,
        },
      );
    }
  }
  return {
    ok: false,
    error: {
      kind: "unknown",
      message: "The model's answer was not in the expected format twice. Try again or switch model.",
    },
  };
}
