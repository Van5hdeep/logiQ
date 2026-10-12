# Explanation Spec — what logiQ outputs and how

> Implementation note, 2026-10-13: this expanded teaching contract is a target, not a description of every current feature. The bounded next implementation is [Phase 04](./phases/04-guided-tutoring-and-debugging.md), with identity/versioning from [IMPLEMENTATION-CONTRACTS.md](./IMPLEMENTATION-CONTRACTS.md). Dry runs, custom activities and narrated lessons are implemented through Phases 05–07. Preserve these new provenance and safety rules where older suggestions below differ.

> D18 default, clarified by B2: **Start Question still returns the full solution by default: idea + complete code + line-by-line explanation + time and space complexity.** Hints, approach-only, explain-my-code and debug are additional modes the student chooses. Opening the panel with Alt+L does not itself call a model; clicking Start Question requests the full answer without a preliminary hint/checkpoint/reveal gate. Replay, seek, input edits and theme changes use 0 model requests. Follow [the request-budget contract](./IMPLEMENTATION-CONTRACTS.md#9-free-request-budget-and-problem-file-cache): 50 requests/day shared across free models, per-action cost disclosure, and canonical results cached in the problem file.

> The "contract" for every AI answer. The prompt, the zod schema, the side-panel UI
> and the web app all follow this document. Last updated: 2026-10-10.

## 0. Research basis

Studied the best open-source DSA helper skills available (Oct 2026):

| Source | What it is | What we take from it |
|---|---|---|
| [karanb192/algo-sensei](https://github.com/karanb192/algo-sensei) (MIT, ~290★) | Claude skill: router `SKILL.md` + 5 mode files (Tutor, Hint, Review, Interview, Pattern Mapper) + full solution template | **Mode routing**, **5-level hint ladder**, **review rubric**, **signal-keyword → pattern table**, "Key Insight / aha" section, brute→optimal progression, common mistakes, interview follow-ups, key takeaways |
| [amanattar/leetcode-helper](https://github.com/amanattar/leetcode-helper) | Codex skill: `SKILL.md` + `AGENTS.md` with strict answer format and a quality checklist | **Fixed section order**, **line-by-line format** (`code` → purpose, not syntax), **dry-run as a state table**, "be specific about what n/m mean", **pre-send checklist**, preserve the judge's exact signature |

Neither covers competitive programming (Codeforces/CodeChef: full program, stdin/stdout,
multiple test cases, overflow, constraints-driven complexity) or a structured JSON output
for a UI. logiQ combines both and adds those. We write our own prompt text — structure only
is borrowed.

Key lessons:
1. **Explain before code.** Restatement → insight → algorithm → code → line-by-line → dry run → complexity → edge cases.
2. **Line-by-line = purpose, not syntax.** Group trivial lines; never explain braces/imports one by one.
3. **Dry run as a table** of variable states per step (tree/graph/DP → a trace that fits: recursion tree, DP table, BFS queue).
4. **Complexity must name its variables** ("n = length of nums") and justify each term.
5. **Hints are a ladder**, never skip levels, no code until level 5.
6. **Teach the pattern, not the problem**: signal words, why the pattern fits, "next time you see X, think Y".
7. **Quality checklist** before answering (signature, edge cases, complexity, dry run present).

---

## 1. Modes

| Mode | Trigger in UI | Gives code? | Output sections (in order) |
|---|---|---|---|
| **Hint** | "Hint" button (click again → next level) | Only level 5 (pseudocode) | one `hint` object per level |
| **Pattern** | "What pattern is this?" | No | characteristics, signal words, pattern(s), why it fits, key insight, approach outline |
| **Approach** | "Approach" | No (pseudocode allowed) | restatement → observations → pattern → brute force → optimal idea → algorithm steps → complexity |
| **Full** (default) | **Start Question** / "Explain fully"; Alt+L only opens the panel | Yes | Always idea + complete code + line-by-line + complexity; additional sections in §2 do not gate that answer |
| **Explain my code** | "Explain my code" (needs editor code) | Uses *your* code | restatement (short) → what your approach is → line-by-line on your code → complexity of your code → is it optimal? → edge cases it misses |
| **Review / Debug** | "Why is it wrong / TLE?" (+ verdict if detected) | Minimal fix diff | verdict diagnosis → failing input (if found) → root cause → fix → complexity actual vs required → edge cases to test → scores |
| **Chat** | Follow-up box | As needed | free text, grounded in the stored explanation |

Hint ladder (from algo-sensei, adapted):
1. **Observation** — question about input/constraints/small case
2. **Pattern nudge** — "does this remind you of…?" without naming it
3. **Direction** — what to track / which direction to process, still unnamed
4. **Technique** — name the pattern and data structure + key insight
5. **Skeleton** — pseudocode only

Each newly selected hint level uses 1 request, with at most 1 disclosed format repair (maximum 2). Reopening a saved level uses 0. Previous hints remain context to avoid repeats; save the complete validated level and assistance event in the problem file, not a new database. Hint-only response rules never replace Start Question's full-answer behavior.

---

## 2. Full explanation — section order & rules

| # | Section | Rules |
|---|---|---|
| 1 | **Restatement** | 2–4 plain sentences. What's input, what's output, the one detail people miss. Don't rewrite the statement. |
| 2 | **Constraints → budget** | Filled **without AI** from the heuristic (n ≤ 10⁵ → O(n log n)); AI may add one line on what it implies. |
| 3 | **Key observations** | 2–5 bullets; each a fact that the solution uses. |
| 4 | **Pattern(s)** | Normalised tag(s) + *why it fits* + signal words quoted from the statement. |
| 5 | **Brute force** | Idea + complexity + why it's too slow for these constraints. Skip only if brute force is already optimal. |
| 6 | **Key insight ("aha")** | One short paragraph — the jump from brute to optimal. |
| 7 | **Algorithm** | Numbered steps, language-independent. Include correctness reason (invariant / greedy proof sketch / DP state meaning). |
| 8 | **Visual** (optional) | ASCII or Mermaid: pointers on array, tree, graph, DP table. |
| 9 | **Code** | User's language. LeetCode: exact given signature. Codeforces/CodeChef: full program, fast I/O, multiple test cases, `long long` where sums can exceed 2³¹. Comments only on tricky lines. |
| 10 | **Line-by-line** | Array of `{ lines: [start, end], code, explanation }`. Group trivial lines; every non-trivial line covered. The side panel highlights the matching code lines on hover. |
| 11 | **Dry run** | On the problem's sample (or a smaller one). Table: step + key variables + action. For recursion/DP/graph use the fitting trace. |
| 12 | **Complexity** | Time & space, each with: variables defined, per-part breakdown, total, and why. Compare to the constraints budget. |
| 13 | **Edge cases** | Each with *input → expected → why the code handles it*. |
| 14 | **Common mistakes** | Off-by-one, overflow, uninitialised DP, forgetting to reset between test cases, etc. Specific to this problem. |
| 15 | **Alternatives** (optional) | Other valid approaches with trade-offs. |
| 16 | **Follow-ups** | "What if…" variations an interviewer would ask, with one-line answers. |
| 17 | **Takeaway** | "When you see ⟨signal⟩, think ⟨technique⟩" — 1–2 lines. Saved as the card front for spaced review. |
| 18 | **Similar problems** | Only from your own library (DB lookup by pattern) + optionally names the model suggests, marked "unverified". |

---

## 3. Output schema (zod, shared by API + UI)

```ts
const LineNote = z.object({
  lines: z.tuple([z.number(), z.number()]),   // 1-indexed, inclusive
  code: z.string(),                           // the exact code of those lines
  explanation: z.string(),
});

const Complexity = z.object({
  variables: z.record(z.string()),            // { n: "length of nums" }
  time: z.string(), space: z.string(),        // "O(n log n)"
  breakdown: z.array(z.object({ part: z.string(), cost: z.string() })),
  justification: z.string(),
});

export const FullExplanation = z.object({
  restatement: z.string(),
  constraintNote: z.string().optional(),
  keyObservations: z.array(z.string()),
  patterns: z.array(z.object({ tag: z.string(), why: z.string(), signals: z.array(z.string()) })),
  bruteForce: z.object({ idea: z.string(), time: z.string(), space: z.string(), whyNotEnough: z.string() }).optional(),
  keyInsight: z.string(),
  algorithm: z.object({ steps: z.array(z.string()), correctness: z.string() }),
  visual: z.object({ kind: z.enum(['ascii', 'mermaid']), content: z.string() }).optional(),
  code: z.object({ language: z.string(), source: z.string() }),
  lineByLine: z.array(LineNote),
  dryRun: z.object({
    input: z.string(),
    columns: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    result: z.string(),
    note: z.string().optional(),              // for non-tabular traces
  }),
  complexity: Complexity,
  edgeCases: z.array(z.object({ case: z.string(), expected: z.string(), why: z.string() })),
  commonMistakes: z.array(z.object({ mistake: z.string(), fix: z.string() })),
  alternatives: z.array(z.object({ name: z.string(), idea: z.string(), time: z.string(), space: z.string(), tradeoff: z.string() })).optional(),
  followUps: z.array(z.object({ question: z.string(), answer: z.string() })),
  takeaway: z.string(),
});
```

Other modes get their own smaller schemas (`HintSchema`, `PatternSchema`, `ApproachSchema`,
`MyCodeSchema`, `ReviewSchema`) in `packages/shared/schemas/`.

Review scoring (from algo-sensei): `correctness`, `efficiency`, `codeQuality`, `interviewReady` each 1–5,
plus `overall: 'optimal' | 'good' | 'needs-work'`.

---

## 4. Work done *before* the AI call (no AI, free, instant)

| Step | Output used in prompt and UI |
|---|---|
| Constraint parser + complexity budget table | `constraintNote`, sanity check on returned complexity |
| **Signal-keyword detector** (regex table below) | Candidate patterns sent as hints to the model; shown instantly as "likely patterns" |
| Platform tags/difficulty | Context (hidden in UI by default) |
| Code language detection | Sets `code.language` |
| Cache lookup `(problem, mode, codeHash)` | Skip the AI call entirely if hit |

Signal-keyword table (seed; lives in `packages/shared/signals.ts`):

| Signal in statement | Candidate pattern |
|---|---|
| contiguous subarray/substring, longest/shortest window, at most k distinct | sliding window |
| sorted array, pair/triplet sum, palindrome, in-place | two pointers |
| sorted + find, minimum X such that, maximise the minimum | binary search / BS on answer |
| number of ways, min/max cost, can you reach, subsequence | dynamic programming |
| all combinations/permutations/subsets, generate all | backtracking |
| shortest path unweighted, levels, minimum steps | BFS |
| weighted shortest path | Dijkstra |
| connected components, merge groups, redundant edge | DSU / DFS |
| prerequisites, ordering, dependencies | topological sort |
| k-th largest/smallest, top k, merge k sorted, running median | heap |
| next greater/smaller, histogram, span | monotonic stack |
| prefix, word dictionary, autocomplete | trie |
| range sum/update queries | prefix sums / Fenwick / segment tree |
| intervals, meetings, merge overlapping | sort + sweep / greedy |
| modulo 10⁹+7, nCr | combinatorics + modular arithmetic |
| xor, bits, subset masks with n ≤ 20 | bit manipulation / bitmask DP |

---

## 5. Prompt structure (one system prompt, cached)

```
[ROLE]        Patient DSA teacher for a student who wants to *understand*, not copy.
[STYLE]       Plain words, concrete examples, explain why before how, no filler.
[MODE RULES]  Rules for the requested mode only (from §1/§2).
[PLATFORM]    LeetCode: exact signature, no I/O.  CF/CodeChef: full program, fast I/O,
              multiple tests, overflow care.
[CONTEXT]     statement, constraints, samples, budget (pre-computed), candidate patterns,
              user's code + verdict (if any), language.
[SCHEMA]      Return JSON matching <schema>. No markdown outside fields.
[CHECKLIST]   Before answering verify: signature/IO correct · complexity fits budget ·
              every non-trivial line explained · dry run reaches the sample output ·
              edge cases listed · no section empty.
[EXAMPLE]     One short gold example (Two Sum) in the exact JSON shape.
```

Flash-class models (Gemini 3.8 Flash) follow structure far better with one
gold example and an explicit checklist — both are mandatory.

---

## 6. Post-AI checks (no AI)

| Check | Action if it fails |
|---|---|
| JSON matches zod schema | Retry once with the validation error appended; then show an error with a "regenerate" button |
| Stated time complexity vs constraint budget | Show ⚠️ "complexity may be too slow for n ≤ …" |
| Dry-run `result` equals sample output | Show ⚠️ "dry run doesn't match the expected output" |
| `lineByLine` ranges cover the code, in order, inside bounds | Re-map by matching `code` text; drop broken entries |
| (Later) run the code on samples (Pyodide / Judge0) | ✅/❌ badge next to the code |

---

## 7. UI rendering (side panel)

- **Sticky header:** problem title, platform badge, constraint budget chip, likely patterns (tags hidden until clicked).
- **Tabs or accordion** per section in §2 order; Restatement, Key insight and Code open by default.
- **Code + line-by-line side by side:** hovering an explanation highlights its lines (Shiki line highlighting).
- **Dry run** as a real table; Mermaid/ASCII visuals rendered inline.
- **Complexity card**: time/space big, breakdown below, ✅/⚠️ against budget.
- **Takeaway** shown last, with a "Add to review" toggle (on by default).
- Streaming: sections appear as the JSON streams in (`streamObject` partial objects).

---

## 8. Evaluation

Keep `evals/` with ~30 problems (mix of LC Easy/Med/Hard, CF 800–2000, CodeChef) with known
pattern + complexity. Script runs each mode on the model and checks schema validity,
complexity match, dry-run match. Run whenever the prompt or model changes.
