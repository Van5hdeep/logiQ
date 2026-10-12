# Integrated learning roadmap

Date: 2026-10-13. Baseline: `0f806e654efad62547a09472fafd1b148d5d84f8`. Status: **proposed; awaiting partner review and owner authorization to execute**.

## Product outcome

A student opens a LeetCode question and logiQ feels attached to that exact question. The panel follows its identity, language and light/dark appearance. Students can request a small hint, inspect their own attempt, predict a state change, edit a sample input, play a narrated dry run, and later recall the same concept from their vault.

The normal journey stays on the question page. The extension side panel is the primary workspace; a small contextual launcher appears near the problem description. Wide graphs, DP tables and custom activities can open in a connected local learning page with a visible return-to-question action. The product never replaces the judge's editor or automatically submits a solution.

## Baseline we are extending

Implemented: WXT/React extension, Next.js local API and vault, direct OpenRouter requests, full explanations, follow-up chat, language caching and JSON persistence. Missing: guided modes, deterministic traces, completed progress/review workflows, full dark mode, question-bound session lifecycle, narrated lessons and automated behavior tests. Patterns/Review/Stats are placeholders.

Retain the pnpm workspace, TypeScript, current React/Next/WXT stack, local vault and manual model choice. Do not add a cloud database, hosted code runner, paid voice service, public tunnel, new authentication product or framework migration as part of these phases.

## Phase sequence

| Phase | Deliverable | Depends on | Reviewable demonstration |
|---|---|---|---|
| [01](./phases/01-foundation-and-contracts.md) | Versioned records, solution identity, reliable saves, local-service protection and tests | Existing app | Old vault opens; selecting a solution binds chat to its exact version |
| [02](./phases/02-question-page-integration.md) | Question-bound sessions, route detection, contextual launcher and editor context | 01 | Switch between two questions while a response is pending; each retains its own state |
| [03](./phases/03-page-matched-dark-mode.md) | Entire extension theme matching, manual light/dark overrides and learning-page theme | 01–02 | Toggle LeetCode appearance; every panel state follows without a white flash |
| [04](./phases/04-guided-tutoring-and-debugging.md) | Hints, approach, explain-my-code, debug and version-bound chat | 01–03 | Receive one hint without revealing code; debug an immutable attempt snapshot |
| [05](./phases/05-interactive-algorithm-labs.md) | Deterministic dry runs, editable inputs, predictions and operation comparisons | 01–04 | Change Two Sum input and predict the next lookup; reopen the saved lab |
| [06](./phases/06-custom-interactive-activities.md) | AI-authored HTML activities in a restricted web sandbox | 01, 03–05 | Manipulate a saved activity; malformed messages cannot change vault data |
| [07](./phases/07-narrated-concept-lessons.md) | Code-authored animated lessons, narration, captions and seekable playback | 05–06 | Seek backward in a narrated dry run and reconstruct the same algorithm state |
| [08](./phases/08-review-patterns-and-release.md) | Review scheduling, pattern transfer, honest statistics and integrated release QA | 01–07 | Complete a recall session, then solve a variation without opening the answer |

Phase 03 can proceed before Phase 04 after session events exist. Phase 06 is optional at runtime: disabling custom activities must not break native labs or stage-only narrated lessons. Phase 08 finalizes retention and release; infrastructure tests start in Phase 01, not at the end.

## Scope and priorities

**First coherent milestone: Phases 01–05.** Reliable page integration + matching dark mode + hints + three usable algorithm labs. This is valuable even before narration is complete.

**Second milestone: Phases 06–07.** Custom activities and short guided lessons. Keep generation on demand; replay and input changes run locally without further model calls.

**Final milestone: Phase 08.** Recall and pattern transfer make saved material useful over time. An answer viewed, a video watched and a problem solved independently are distinct events.

Initial deterministic algorithms: Two Sum, binary search with an explicit interval convention, and fixed/variable sliding window. BFS follows only after these pass. Universal Python/C++/Java execution, arbitrary-code instrumentation, MP4 export, submission-history scraping, automatic editor writes, cloud sync and additional platforms remain later work.

## Design decisions for review

- Entire extension gets `match-page | light | dark`, with `match-page` as the new default for new installs. Existing users migrate to a documented default without losing model/language settings.
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
6. Keep this proposal pending until the partner's review is recorded and the owner says to execute. Pushing this branch is publication of plans only.

## Shared acceptance rules

- No answer or late request appears under the wrong question.
- No automatic AI request on navigation, hover, a slider move, theme change or review replay.
- Every supported panel state has light/dark, keyboard and narrow-width coverage.
- Problem identity and saved learning remain usable when extraction fails or the local server is offline.
- Plain explanations remain available if a lab, sandbox, speech voice or animation fails.
- Current origin/token rules protect PC-changing routes; secret values never reach injected page UI, model prompts or custom artifacts.
- Generated content has limits and visible provenance. Sample checks do not become a claim of judge acceptance.

See [IMPLEMENTATION-CONTRACTS.md](./IMPLEMENTATION-CONTRACTS.md) for shared shapes and [PARTNER-REVIEW.md](./PARTNER-REVIEW.md) for review decisions. These plans use testable milestones rather than calendar estimates before the first implementation slice is measured.
