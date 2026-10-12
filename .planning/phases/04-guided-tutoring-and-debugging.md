# Phase 04 — Hints, approach and understanding the student's code

Status: proposed / not started. Depends on Phases 01–03. Extends [EXPLANATION-SPEC.md](../EXPLANATION-SPEC.md) through the bounded contracts below.

## Student outcome

**Start Question still returns the full solution by default: idea + complete code + line-by-line explanation + time and space complexity, unchanged from D18/v1.** No hint, checkpoint or additional Reveal click gates that answer. Hint, Approach, Explain my code and Debug are extra modes the student chooses. Hint gives a nudge; Approach omits finished code; diagnostics analyze a captured attempt. Chat follows the exact selected version and context.

## File targets

Add shared `teaching.ts` schemas and prompt-version constants, `apps/web/src/lib/ai/{teach,hints,diagnose}.ts`, `lib/services/teaching-service.ts`, `/api/teach/route.ts`, `/api/attempts/route.ts`, and extension `components/{mode-picker,hint-ladder,approach-view,attempt-review}.tsx`. Refactor `ai/explain.ts`, `ai/chat.ts`, `/api/chat`, `SolutionView`, `ChatCard`, and panel state. Add prompt fixtures and an `evals/` manifest during execution.

## Implementation steps

1. **Define discriminated responses.** Hint `{level, prompt, nudge, nextAction}`; approach `{restatement, observations, invariant, steps, complexity}`; diagnostic `{attemptId, diagnosis, evidence, failingCase?, minimalDiff?, uncertainty, nextCheck}`; full extends the existing answer with algorithm reasoning and structured sample walkthrough. Limit array/string lengths and validate code/link ranges.
2. **Implement the hint ladder.** Observation → direction → technique → skeleton, with five levels if needed to separate the first two nudges. Only serve the requested next level; keep previous hints in context and avoid repeats. No finished solution in hints. Store assistance events, not an automatic solved flag. Reload restores the level for that problem/attempt, with an explicit restart option.
3. **Snapshot the student's attempt.** On Explain my code/Debug, show captured language/code and create an immutable AttemptId. If the editor changes, offer “Analyze current code” to create another snapshot; never silently change the original analysis. The student can paste code when capture is unavailable.
4. **Ground prompts.** Send structured statement/constraints/examples, selected target and requested mode. Keep Start Question bound to `/api/explain` full mode, independent of the last extra mode used. Include the mode-specific schema/gold example and correctness checklist. A single repair may add 1 request only after the original action disclosed maximum 2; invalid output in a hint/approach mode never silently calls full mode.
5. **Build diagnostic UX.** Show what the code intends, a concrete suspected failure, a small code diff and verification action. Distinguish observed sample failure from model hypothesis. Missing executable runtime produces “Suggested case; not run”. Missing constraints produce a request to confirm capture, not a confident optimality claim.
6. **Support optional active reasoning.** Within a student-selected hint/approach or practice mode, offer a checkpoint before its reveal. Full code in those extra modes requires an explicit Show full solution action; **Start Question itself immediately requests and displays the full answer**. Checkpoints never gate the default flow. Viewing a full answer is not a solve event.

   Deterministic grading is limited to bounded answers such as a selected state, index or numeric value. Free-text invariant explanations are self-reviewed against a visible rubric or receive explicitly labeled AI feedback; a keyword match is not proof of conceptual understanding. Keep that result separate from verified trace checkpoints and independent recall evidence.
7. **Fix version-bound chat.** Select solutionId/attemptId rather than language. Thread UI names its target; switching versions switches/restores the matching thread. Persist IDs on turns. Follow-up quick actions use the displayed context and request budget; they never trigger on hover.
8. **Control latency and requests.** Return/stream only validated sections; partial JSON is not a finished result. Cache complete validated solutions, each hint level, approaches, diagnostics and chat in the problem file under contract §9 keys. Show cold/cache/maximum repair cost before dispatch; maximum 2 requires disclosure. No automatic model-switching or retry loop. Reopening, replay, seeking, input edits and theme changes cost 0; stale generated content needs a separate Generate/Regenerate action.

## Requests per action

| Action | Cold | Cached | Maximum |
|---|---|---|---|
| Start Question / chosen new language / explicit regenerate | 1 | 0 for saved answer; regenerate is a fresh explicit action | 2 only after format-repair disclosure |
| One new hint level / Approach / Explain my code / Debug | 1 | 0 for matching target/mode/level | 2 only after format-repair disclosure |
| One submitted follow-up / optional free-text feedback | 1 | 0 for matching question and thread context | 1; explicit retry is another declared action |
| Reopen, switch saved version, replay, seek, input/theme change | 0 | 0 | 0, including stale/error paths |

Respect the shared **50 requests/day** baseline across models. Phase SUMMARY lists measured requests per action and the canonical problem-file cache fields.

## Tests and acceptance

- **Start Question on a new problem shows idea + complete code + line-by-line + time and space complexity, unchanged from v1.** It costs 1 cold request; clicking again with a valid saved solution costs 0 and never routes through hints or a reveal gate.
- Start Question remains full even after the student previously selected Hint/Approach/Debug; a separate selected-mode action returns only that mode's content.
- Golden and malformed responses test all mode schemas, invalid ranges, oversized payloads, empty replies and failed repair.
- Hint fixtures contain no complete answer; reveal level is monotonic, persisted and tied to the correct attempt. Prompt eval includes a rubric for spoiler leakage rather than relying only on regex.
- A deliberate Two Sum insertion-order bug receives a relevant duplicate-value case; UI labels it unexecuted unless Phase 05's supported engine checks it.
- Changed editor code leaves prior attempt analysis unchanged. Regenerated solution chat receives the correct code version.
- Switching tabs/modes during a slow reply does not show or save the reply under another identity. Failed requests preserve the student's draft.
- Keyboard users can select modes, reveal hints and access explanations; all states inherit light/dark tokens.
- Offline CI uses fixed responses. Optional real-model evaluation records schema success, clarity, correctness evidence, hint leakage and latency against prompt/model versions; it does not silently consume daily quota.
- Provider-spy test asserts **0 calls** on replay, seek, input edits, theme changes, saved-version switching and cached reopen, including a stale/missing derived artifact. Reopening the same hint after restart reads the problem file at 0 cost; a new level incurs only its disclosed cost.
- Repair disclosure is present before a possible second request; exhausted budget blocks dispatch; another model does not reset the daily ledger.

## Demonstration and exit gate

On a new real question, click Start Question and show all four answer sections immediately. Reopen the saved answer at 0 requests. Then independently choose Hint, Explain my code or Debug and show each bounded response. Chat about a regenerated version, restart and reopen the cached hint. Record request counts; assistance remains separate from solved status.

## Rollback and limits

Keep Full solution available behind the existing endpoint adapter if a guided mode is disabled. No universal judge runner, automatic editor replacement or automatic verdict claim. The original expanded explanation spec is a direction; implement this bounded subset before adding every historical section.
