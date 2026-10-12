# Phase 04 — Hints, approach and understanding the student's code

Status: proposed / not started. Depends on Phases 01–03. Extends [EXPLANATION-SPEC.md](../EXPLANATION-SPEC.md) through the bounded contracts below.

## Student outcome

The student chooses the amount of help. Hint gives one small nudge; Approach explains reasoning without finished code; Explain my code analyzes their captured attempt; Debug focuses on a failing case and minimal fix; Full solution remains an explicit reveal. Chat follows the exact selected version and context.

## File targets

Add shared `teaching.ts` schemas and prompt-version constants, `apps/web/src/lib/ai/{teach,hints,diagnose}.ts`, `lib/services/teaching-service.ts`, `/api/teach/route.ts`, `/api/attempts/route.ts`, and extension `components/{mode-picker,hint-ladder,approach-view,attempt-review}.tsx`. Refactor `ai/explain.ts`, `ai/chat.ts`, `/api/chat`, `SolutionView`, `ChatCard`, and panel state. Add prompt fixtures and an `evals/` manifest during execution.

## Implementation steps

1. **Define discriminated responses.** Hint `{level, prompt, nudge, nextAction}`; approach `{restatement, observations, invariant, steps, complexity}`; diagnostic `{attemptId, diagnosis, evidence, failingCase?, minimalDiff?, uncertainty, nextCheck}`; full extends the existing answer with algorithm reasoning and structured sample walkthrough. Limit array/string lengths and validate code/link ranges.
2. **Implement the hint ladder.** Observation → direction → technique → skeleton, with five levels if needed to separate the first two nudges. Only serve the requested next level; keep previous hints in context and avoid repeats. No finished solution in hints. Store assistance events, not an automatic solved flag. Reload restores the level for that problem/attempt, with an explicit restart option.
3. **Snapshot the student's attempt.** On Explain my code/Debug, show captured language/code and create an immutable AttemptId. If the editor changes, offer “Analyze current code” to create another snapshot; never silently change the original analysis. The student can paste code when capture is unavailable.
4. **Ground prompts.** Send structured statement/constraints/examples, the selected attempt/solution and requested mode. State that retrieved/page content is data, not instructions. Keep provider API unchanged; include mode-specific schema/gold example and a correctness checklist. Use a single bounded repair retry; invalid output does not reveal a hidden full answer.
5. **Build diagnostic UX.** Show what the code intends, a concrete suspected failure, a small code diff and verification action. Distinguish observed sample failure from model hypothesis. Missing executable runtime produces “Suggested case; not run”. Missing constraints produce a request to confirm capture, not a confident optimality claim.
6. **Support active reasoning.** Ask the student to explain the invariant or expected next value before reveal. Checkpoints have explicit expected/rubric data and explanatory feedback. Full code remains behind an intentional Reveal solution action. Do not count reveal as success.

   Deterministic grading is limited to bounded answers such as a selected state, index or numeric value. Free-text invariant explanations are self-reviewed against a visible rubric or receive explicitly labeled AI feedback; a keyword match is not proof of conceptual understanding. Keep that result separate from verified trace checkpoints and independent recall evidence.
7. **Fix version-bound chat.** Select solutionId/attemptId rather than language. Thread UI names its target; switching versions switches/restores the matching thread. Persist IDs on turns. Follow-up quick actions use the displayed context and request budget; they never trigger on hover.
8. **Control latency and requests.** Return/stream only validated sections; incomplete JSON stays loading and is never persisted as a finished artifact. Use a cancellable status indicator and honest unknown quota. Reuse cached hints/approaches where identity, mode and prompt version match; no automatic model switching loop.

## Tests and acceptance

- Golden and malformed responses test all mode schemas, invalid ranges, oversized payloads, empty replies and failed repair.
- Hint fixtures contain no complete answer; reveal level is monotonic, persisted and tied to the correct attempt. Prompt eval includes a rubric for spoiler leakage rather than relying only on regex.
- A deliberate Two Sum insertion-order bug receives a relevant duplicate-value case; UI labels it unexecuted unless Phase 05's supported engine checks it.
- Changed editor code leaves prior attempt analysis unchanged. Regenerated solution chat receives the correct code version.
- Switching tabs/modes during a slow reply does not show or save the reply under another identity. Failed requests preserve the student's draft.
- Keyboard users can select modes, reveal hints and access explanations; all states inherit light/dark tokens.
- Offline CI uses fixed responses. Optional real-model evaluation records schema success, clarity, correctness evidence, hint leakage and latency against prompt/model versions; it does not silently consume daily quota.

## Demonstration and exit gate

On one real question: request a hint, explain an attempted solution, capture a new attempt, inspect a suspected bug, reveal full help, then chat about a regenerated version. Show that saved assistance and attempts survive reopen and remain separated from solved status.

## Rollback and limits

Keep Full solution available behind the existing endpoint adapter if a guided mode is disabled. No universal judge runner, automatic editor replacement or automatic verdict claim. The original expanded explanation spec is a direction; implement this bounded subset before adding every historical section.
