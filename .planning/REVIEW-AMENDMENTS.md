# Review amendments: B1–B3

Date: 2026-10-13. Base: `c5fd0efe49c3f942742560367313a79ae38c4206` on `planning/integrated-learning-roadmap`. Revision branch: `planning/review-amendments`. Status: amendments ready for re-review; **REQUEST CHANGES remains the recorded decision** until the reviewer updates it.

## B1 — Preserve Light by default

Light stays the default for fresh and existing extension installs, including dark host/OS combinations. Missing/invalid/legacy preference resolves to Light. Match this page and Dark require explicit selection, persist independently of vault moves, and cover every extension state. The connected workspace receives that explicit preference; the vault default does not change.

Updated: README, ROADMAP, THEME-INTEGRATION, DESIGN-SYSTEM optional-exception banner, D21, Phases 03/08 and current review proposal table. D21 no longer attributes the earlier dark proposal to the owner or replaces D15's default.

Implementation acceptance: fresh/migrated install on dark LeetCode stays Light; opt into matching/Dark, reload, switch tabs and exercise loading/error/chat/lab states. Every theme action has 0 provider dispatches.

## B2 — Keep Start Question's full answer

Start Question remains the default full-answer action: idea + complete code + line-by-line + time and space complexity. No prerequisite hint/checkpoint or second reveal click is introduced. Hint, Approach, Explain my code and Debug are additional deliberate actions. Alt+L/Open tutor only opens the panel; clicking Start Question can request the full answer.

Updated: ROADMAP, EXPLANATION-SPEC default/mode row, Phase 04 outcome/steps/demo/tests, Phase 02 launcher behavior, API contract, decision D28 and review checklist. The separate answer-hidden review/practice flow does not replace Start Question.

Implementation acceptance: on a new problem, Start Question returns all four sections at 1 cold request; saved reopen uses 0. After using Hint, Start Question still returns full. A separately chosen Hint does not silently generate full output.

## B3 — Budget every request and keep generated results local

The plan targets 50 free-model requests/day shared across models. Every feature documents cold/cache/repair cost; repairs count as requests and an action that may use 2 discloses that maximum before dispatch. Native labs and playback run locally. Complete validated generated results live in the problem JSON; sidecars hold only rebuildable derived data. Model switches do not invalidate a usable result or reset the ledger.

Replay, seeking, input edits, sliders, Reset, speed/voice changes, route/theme changes and cached reopen dispatch 0 model requests, even with missing sidecars, stale generated material or provider errors. Stale material uses cached/native/text fallback; regeneration is a separate cost-labelled action. Failed disk writes retry local persistence, not model generation.

Updated: IMPLEMENTATION-CONTRACTS §2/§3/§4/§9; per-action tables/sections and provider-spy acceptance in Phases 01–08; ROADMAP, EXPLANATION-SPEC, D29 and reviewer checklist. Phase SUMMARY must report cold/cache/repair counts, problem-file cache fields and zero-call test evidence.

## Scope and review gate

Phases 01–05 remain conditional on reviewer confirmation of these fixes. Phases 06–07 are deferred until the first milestone has been used; Phase 08 is also unapproved as the full review states. No merge, implementation or retrospective approval is performed by this revision.

The historical review transcript stays intact. The appended response maps changes to B1–B3 without changing REQUEST CHANGES to APPROVE PLAN. Source application code and the local audit document are outside this amendment commit.

## Verification

Run from the repository root:

```powershell
powershell.exe -NoProfile -File .planning/validation/verify-review-amendments.ps1
git diff --check
git diff --name-only origin/planning/integrated-learning-roadmap
```

The script checks current defaults/entry behavior/cost rules across documents, per-phase acceptance/evidence sections, deferred statuses, reviewer gate and local Markdown links. It does **not** execute the planned runtime provider-spy, migration, browser or theme tests. Those remain implementation acceptance gates and must not be reported as already passing.
