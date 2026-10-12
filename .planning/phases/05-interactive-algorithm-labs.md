# Phase 05 — Interactive dry runs and editable inputs

Status: proposed / not started. Depends on Phases 01–04. Shared artifact/provenance rules: [contracts](../IMPLEMENTATION-CONTRACTS.md).

## Student outcome

Instead of reading a paragraph about a loop, the student sees the array, pointers, lookup map and variables change one step at a time. They can predict the next action, edit the sample input, rerun locally, and compare brute-force work with an optimal algorithm.

## File targets

Add `packages/learning-engine/` for pure schemas, trace validation, trusted algorithm templates, checkpoints and operation counts; export via its `src/index.ts`. Add web `lib/services/artifact-service.ts`, `/api/artifacts` routes, `/problems/[platform]/[file]/page.tsx`, and `components/learning/{trace-player,array-view,map-view,queue-view,grid-view,input-editor,checkpoint,operation-comparison}.tsx`. Add extension `components/trace-preview.tsx` and artifact links. Configure workspace transpilation/exports and verify both package consumers.

## Implementation steps

1. **Define trace state.** Use a discriminated family schema, bounded inputs and step count, unique step IDs, source mapping, state snapshots/deltas, invariant, operation count, result and provenance. Reject non-finite values, invalid indexes, broken references and inconsistent final state. Build deterministic replay from snapshots; Back/Seek must reconstruct state rather than reverse arbitrary animation effects.
2. **Implement trusted seeds.** Two Sum with lookup before insert, binary search with a declared half-open or closed interval, and fixed/variable sliding-window examples. Algorithm functions produce events while running in a packaged worker. Include reference implementations and test oracles; start with small bounded inputs.

   Match a question to a template only through a validated applicability description: input/output shape, constraints, required invariant and algorithm variant. Use packaged matching or an existing cached teaching result at 0 requests. An optional “Suggest a template” action may spend 1 disclosed request and cache the suggestion in the problem file; opening a lab or editing input must never invoke it automatically. Unsupported questions retain cached guided explanations/native fallback; do not run an unrelated seed or auto-generate custom content.
3. **Be precise about code linkage.** Executing a trusted JavaScript template validates that template. It does not execute arbitrary Python/C++/Java generated output. Match exact code hash and verified source map before highlighting solution lines; otherwise label the trace “Algorithm walkthrough” and show abstract steps beside the selected code. Maintain explicit reviewed mappings for supported reference listings only.
4. **Build reusable renderers.** Arrays show index/value and current pointers; maps show insertion/lookup; queue and grid primitives follow the same state model. Text inspector and an accessible trace table present equivalent information. Use semantic theme tokens from Phase 03, not family-specific random styling.
5. **Create playback controls.** Next, Back, Play/Pause, Reset, speed and step scrubber. Pause automatically for prediction checkpoints. Keyboard arrow controls only when focus is inside the player; never capture the judge editor's shortcuts. Reduced motion changes state instantly. Mobile/narrow panel uses compact preview; the wider workspace offers code/trace split view.
6. **Make input editing meaningful.** Parse supported array/string/target inputs locally, validate ranges and rerun the trusted algorithm worker. Input change creates a new trace identity and invalidates prior checkpoints/lesson references until rebuilt. Keep the original sample available. No AI call per keystroke, slider move, step or replay.
7. **Add native prediction checks.** Questions reference real trace states: next complement, pointer move, map membership or valid window. Trusted host code grades bounded answers and provides feedback tied to the transition. Incorrect prediction gives a small explanation and retry, not automatic code reveal.
8. **Compare operation counts.** Run both trusted brute and optimal templates for the same input. Explain the counting convention and invariant; show input size and counted work. Keep asymptotic claims separate from measured browser time. Cap expensive brute-force cases and expose the cap instead of hanging the page.
9. **Persist and reopen.** Canonical model-backed teaching/template results stay in the problem file; native traces are derived locally and may have rebuildable sidecars with code/input/engine versions. Detail opens without the extension/provider. Missing trace sidecars rebuild locally at 0 requests or fall back to saved text. A stale generated response is never refreshed by replay/input edit; offer a separate declared generation action only if the student asks. Link back to the canonical question.

## Requests per action

Native trace creation, input parsing/editing, playback/seek/reset, prediction grading, operation comparisons and theme changes cost **0 requests**. Reuse cached teaching metadata from the problem file. Optional Suggest a template costs 1 on an explicit cold action and 0 for a matching saved result, with no automatic repair. Guided explanation costs remain the separately chosen Phase 04 action; creating a lab does not bundle a new explanation call. Phase SUMMARY lists measured costs and provider-spy evidence.

## Tests and acceptance

- Two Sum: duplicate values `[3,3]`, negative values, zero, pair near end and explicit no-pair behavior where allowed.
- Binary search: empty input, absent target, first/last element, duplicates, odd/even lengths and interval shrink invariants.
- Sliding window: empty/small input, all equal symbols, repeated symbols, impossible/zero window policy and boundary constraints.
- Each tested trace reaches the oracle result; every transition follows the chosen algorithm invariant. Same input/engine version yields the same steps.
- Next/Back/Seek/Reset reach identical states; a checkpoint cannot award a result for another artifact revision.
- Worker cancels/terminates on bounds/time budget; main UI remains responsive. Oversized input shows a clear limit.
- Source hash mismatch prevents false code highlights. Unsupported runtime labels are visible, not hidden in Settings.
- Saved detail opens with the local provider disconnected; theme/keyboard/table alternative pass browser tests.
- Provider-spy tests assert **0 calls** across native lab generation, replay, seek, input edits, sliders, theme changes, missing sidecar rebuild and stale generated-content fallback. Optional template suggestion dispatches once only when clicked, saves its full result in the problem file, and reopens at 0.

## Demonstration and exit gate

Change Two Sum to `[3,3]`, target `6`; predict the lookup, inspect the map, then compare brute versus lookup work. Reopen the artifact from the vault, change input and confirm old checkpoint results are not applied to the new trace. Record one binary-search boundary case and one window-shrink case as regression fixtures.

## Rollback and expansion

Feature-flag native labs while keeping explanation storage untouched. New engine versions keep old artifacts readable or render them as stale. BFS is the next family only after seed acceptance; arbitrary language execution and source instrumentation require a separate runtime proposal.
