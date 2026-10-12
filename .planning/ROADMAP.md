# Integrated learning roadmap

Date: 2026-10-13. Baseline: `0f806e654efad62547a09472fafd1b148d5d84f8`. Review baseline: `c5fd0ef`. Status: **B1–B3 amended; awaiting reviewer confirmation, APPROVE PLAN and owner authorization to execute**. Phases 01–05 have conditional approval; Phases 06–08 remain deferred until the first milestone has been used and reviewed.

## Product outcome

A student opens a LeetCode question and logiQ feels attached to that exact question. The panel follows its identity and language, with **Light as the default appearance for new and existing installs**. Match this page and Dark are opt-in settings. Students can choose additional modes to request a small hint, inspect their own attempt, predict a state change or edit a sample input. Narrated dry runs and the full recall workflow remain later, separately reviewed phases.

**Start Question still returns the full solution by default: idea + complete code + line-by-line explanation + time and space complexity, unchanged from D18/v1.** Hints, approach-only, explain-my-code and debug are extra modes the student explicitly chooses. No preliminary hint, checkpoint or Reveal solution click is required after Start Question. “No automatic request” means no request without a user action; it does not prohibit a full solution from that action.

The normal journey stays on the question page. The extension side panel is the primary workspace; a small contextual launcher appears near the problem description. Wide graphs, DP tables and custom activities can open in a connected local learning page with a visible return-to-question action. The product never replaces the judge's editor or automatically submits a solution.

## Baseline we are extending

Implemented: WXT/React extension, Next.js local API and vault, direct OpenRouter requests, full explanations, follow-up chat, language caching and JSON persistence. Missing: guided modes, deterministic traces, completed progress/review workflows, full dark mode, question-bound session lifecycle, narrated lessons and automated behavior tests. Patterns/Review/Stats are placeholders.

Retain the pnpm workspace, TypeScript, current React/Next/WXT stack, local vault and manual model choice. Do not add a cloud database, hosted code runner, paid voice service, public tunnel, new authentication product or framework migration as part of these phases.

## Phase sequence

| Phase | Deliverable | Depends on | Reviewable demonstration |
|---|---|---|---|
| [01](./phases/01-foundation-and-contracts.md) | Versioned records, solution identity, reliable saves, local-service protection and tests | Existing app | Old vault opens; selecting a solution binds chat to its exact version |
| [02](./phases/02-question-page-integration.md) | Question-bound sessions, route detection, contextual launcher and editor context | 01 | Switch between two questions while a response is pending; each retains its own state |
| [03](./phases/03-page-matched-dark-mode.md) | Light-default extension, optional page matching/Dark and learning-page theme | 01–02 | Fresh install on dark LeetCode stays light; opted-in matching follows without a white flash |
| [04](./phases/04-guided-tutoring-and-debugging.md) | Unchanged Start Question full answer plus extra hint/approach/diagnostic modes and version-bound chat | 01–03 | Start Question shows all four answer sections; separately choose a hint or debug an attempt |
| [05](./phases/05-interactive-algorithm-labs.md) | Deterministic dry runs, editable inputs, predictions and operation comparisons | 01–04 | Change Two Sum input and predict the next lookup; reopen the saved lab |
| [06](./phases/06-custom-interactive-activities.md) | AI-authored HTML activities in a restricted web sandbox | 01, 03–05 | Manipulate a saved activity; malformed messages cannot change vault data |
| [07](./phases/07-narrated-concept-lessons.md) | Code-authored animated lessons, narration, captions and seekable playback | 05–06 | Seek backward in a narrated dry run and reconstruct the same algorithm state |
| [08](./phases/08-review-patterns-and-release.md) | Review scheduling, pattern transfer, honest statistics and integrated release QA | 01–07 | Complete a recall session, then solve a variation without opening the answer |

Phase 03 can proceed before Phase 04 after session events exist. Phase 06 is optional at runtime: disabling custom activities must not break native labs or stage-only narrated lessons. Phase 08 finalizes retention and release; infrastructure tests start in Phase 01, not at the end.

## Scope and priorities

**First coherent milestone: Phases 01–05, conditionally approved after B1–B3 are verified.** Reliable page integration + Light default with optional matching/Dark + unchanged full-answer entry + additional guided modes + three usable algorithm labs.

**Deferred milestone: Phases 06–07 are plans, not approved implementation.** Review them again after Phases 01–05 have been in use. Custom activities and short guided lessons remain on demand; replay and input changes run locally without further model calls.

**Deferred final milestone: Phase 08 is also not approved yet, as recorded in the owner's full review.** Recall and pattern transfer make saved material useful over time. An answer viewed, a video watched and a problem solved independently are distinct events.

Initial deterministic algorithms: Two Sum, binary search with an explicit interval convention, and fixed/variable sliding window. BFS follows only after these pass. Universal Python/C++/Java execution, arbitrary-code instrumentation, MP4 export, submission-history scraping, automatic editor writes, cloud sync and additional platforms remain later work.

## Design decisions for review

- Entire extension gets `light | match-page | dark`, with **Light as the default for new and existing installs**. Match this page and Dark are opt-in; preference persists only after explicit selection. This is an optional extension/workspace exception, not a replacement for D15's default. Preserve model/language settings during migration.
- Native contextual UI uses host-compatible neutral surfaces and a restrained accent. Full-panel styling is compact; the wider web vault retains its present layout.
- Site integration is adapter-based. LeetCode is the reference flow; Codeforces and CodeChef retain working fallbacks and get no guessed editor writes or fake theme signals.
- A validated trace is shared by native visualization, predictions and lesson scenes. Trace provenance states exactly what ran.
- Custom code never executes in the privileged extension or local server. The default activity format uses HTML/CSS plus declarative interactions; free-form JavaScript remains a separately gated sandbox capability.
- File writes are atomic, versioned and recoverable. Artifacts and progress reference immutable solution/attempt identities.

## Execution protocol after approval

1. Recheck current HEAD, dirty files, dependencies and the relevant phase's contract. Record any drift from this baseline.
2. Implement one phase on a feature branch. Keep each vertical slice reviewable; changes to shared contracts come before consumers.
3. Add meaningful unit/fixture tests first for state, storage, validation, bridge and trace logic. Run the existing build/typecheck/lint gates plus extension build and targeted browser tests.
4. Record commands, outcomes, demo evidence and remaining limitations in `phases/NN-.../SUMMARY.md` or a clearly linked phase summary file. Do not mark source-only checks as real-site proof.
5. Review the acceptance gate before starting dependent work. A failed gate triggers repair or an explicit plan amendment.
6. Keep this proposal pending until the reviewer verifies B1–B3 and records APPROVE PLAN for the agreed scope, then the owner says to execute. Do not merge this planning branch before that approval. Phases 06–08 need separate later approval. Pushing amendments does not self-approve the review.

## Shared acceptance rules

- No answer or late request appears under the wrong question.
- Start Question remains the full-answer default; additional teaching modes are explicit choices.
- No automatic model request on navigation, hover, replay, seeking, input edits or theme changes. Missing/stale generated material falls back to cached text/native behavior and an explicit Generate/Regenerate action.
- Plan for **50 free-model requests/day per account, shared by all free models**. Every model-backed action documents cold/cache/retry cost, persists the result in the problem file, and shows the maximum cost before an action that can use more than one request. Switching models does not reset the budget.
- Each implemented phase SUMMARY lists requests per action and spy-test evidence for zero model calls during replay/seek/input-edit/theme-change paths; see [the request-budget contract](./IMPLEMENTATION-CONTRACTS.md#9-free-request-budget-and-problem-file-cache).
- Every supported panel state has light/dark, keyboard and narrow-width coverage.
- Problem identity and saved learning remain usable when extraction fails or the local server is offline.
- Plain explanations remain available if a lab, sandbox, speech voice or animation fails.
- Current origin/token rules protect PC-changing routes; secret values never reach injected page UI, model prompts or custom artifacts.
- Generated content has limits and visible provenance. Sample checks do not become a claim of judge acceptance.

See [IMPLEMENTATION-CONTRACTS.md](./IMPLEMENTATION-CONTRACTS.md) for shared shapes and [PARTNER-REVIEW.md](./PARTNER-REVIEW.md) for review decisions. These plans use testable milestones rather than calendar estimates before the first implementation slice is measured.
