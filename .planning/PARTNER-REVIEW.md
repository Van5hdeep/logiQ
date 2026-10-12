# Partner review and execution gate

Status: **changes requested** (owner review recorded below, 2026-10-13). Date: 2026-10-13. This branch contains proposed plans only. No phase is started or approved by its presence here.

## Reading order

1. [ROADMAP.md](./ROADMAP.md): product outcome, scope and eight phases.
2. [IMPLEMENTATION-CONTRACTS.md](./IMPLEMENTATION-CONTRACTS.md): shared data, identity and safety boundaries.
3. [THEME-INTEGRATION.md](./THEME-INTEGRATION.md): LeetCode integration and entire-extension dark mode.
4. Phase plans in numeric order. Audit their tasks against the actual source, not only other planning documents.

## Decisions to accept or amend

| Decision | Proposal | Review result |
|---|---|---|
| Page integration | Side panel primary; contextual launcher beside description; wide labs optional | Accepted |
| Theme | Match this page default; persistent Light/Dark overrides; all extension states covered | **Amend (B1):** Light stays the default; Match this page and Dark are opt-in |
| Backend | Keep local JSON and direct OpenRouter; no database/runner/service migration | Accepted |
| Student agency | Hints and checkpoints; no automatic solve requests or submission | **Amend (B2):** Start Question keeps giving the full solution; hints are an extra mode |
| Trace provenance | Deterministic templates first; arbitrary generated code is not claimed executed | Accepted |
| Custom HTML | Restricted web-only sandbox; declarative default; JS capability separately gated | **Deferred (S1):** Phase 06 approved later |
| Narration | Browser speech + captions; silent/text fallback; MP4 export deferred | **Deferred (S1):** Phase 07 approved later |
| Retention | Attempts and recall outcomes drive progress; watching is not mastery | Accepted, with B3 (request budget) |

## Review checklist

- [ ] The phase order delivers a useful first milestone without requiring all eight phases.
- [ ] Proposed file targets fit current Next/WXT/shared contracts.
- [ ] Existing v1 vault files and earliest solutions remain readable and preserved.
- [ ] Request identity, solution identity, attempt identity and active-tab identity cannot drift.
- [ ] LeetCode SPA navigation and root/editor changes have fallback behavior and tests.
- [ ] Dark mode covers every extension-owned surface and preserves the web vault default.
- [ ] Host sampling is allowlisted/normalized; no page data can inject styles or privileged actions.
- [ ] API pairing, loopback binding, folder migration and damaged-file recovery are testable.
- [ ] Hints do not reveal later levels or code before explicit reveal.
- [ ] Trace highlights reference verified source, or show honest language-independent steps.
- [ ] Trace, video and custom-input states cannot contradict one another.
- [ ] Generated HTML and free-form JS are separated from privileged extension/server execution.
- [ ] Canvas animations have transcript/state-table alternatives, keyboard controls and reduced motion.
- [ ] Review scheduling distinguishes assistance, acceptance and independent recall.
- [ ] Each phase has tests, real-browser gates, rollback and a reviewable demo.
- [ ] Dependency/service additions remain local/free and ordinary CI does not spend AI quota.
- [ ] Historical PLAN/DECISIONS/DESIGN conflicts are explicitly resolved by the proposal's scope.

## How to record review

For each finding record: phase/file, severity (`blocker | important | suggestion`), concrete problem, requested change, and how the revision will be verified. Blocking findings must be resolved before the corresponding phase is approved. Changes to shared contracts require rereading dependent phases.

```text
Reviewer:
Reviewed branch/commit:
Decision: APPROVE PLAN / REQUEST CHANGES
Approved scope/phases:
Blocking findings:
Required amendments:
Optional suggestions:
Review date:
```

Leave this template blank until the actual reviewer responds. “Plan approved” authorizes the agreed design for the owner's decision; execution still needs the owner's instruction to start. Do not interpret a pushed branch, an empty checklist or a draft comment as approval.

## Definition of a phase complete after execution

Its acceptance tests pass, its installed-extension/web demonstration is recorded, regression gates pass, and its summary identifies any unverified external conditions. The owner/partner reviews that evidence before dependent release work proceeds. Use a separate implementation branch; preserve this plan branch as the review record.

## Owner review: 2026-10-13

```text
Reviewer: Van5hdeep (owner), with Claude Code
Reviewed branch/commit: planning/integrated-learning-roadmap @ 71f8e39
Decision: REQUEST CHANGES
Approved scope/phases: Phases 01-05 (first milestone), once B1-B3 are resolved.
                       Phases 06-08 are not approved yet; review again after 01-05 are in use.
Blocking findings: B1, B2, B3
Required amendments: B1, B2, B3 (below)
Optional suggestions: S1, S2
Review date: 2026-10-13
```

### B1: blocker: theme default contradicts the owner's decision (ROADMAP "Design decisions", D21, THEME-INTEGRATION.md, Phase 03, DESIGN-SYSTEM.md banner)

- **Problem:** `match-page` is proposed as the default for the entire extension, and D21's rationale cites an "explicit user request for a page-integrated dark experience". The owner did not make that request. The owner rejected the dark theme as harsh on the eyes (D15, light-only). With `match-page` as default, the panel turns dark whenever LeetCode is dark.
- **Requested change:** default stays **Light** for new and existing installs. `Match this page` and `Dark` are opt-in settings. Correct D21's rationale to "optional dark/matching theme"; keep the DESIGN-SYSTEM banner as "optional exception", not "replaces the light-only restriction".
- **Verify:** fresh install on a dark LeetCode page shows a light panel; switching to Match this page / Dark persists and covers every panel state.

### B2: blocker: Start Question must keep giving the full solution (Student agency row, Phase 04, ROADMAP outcome)

- **Problem:** the owner's spec (D18) is: Start Question → complete code → every line explained → time and space complexity. The roadmap's hints/checkpoints framing and the Phase 04 demo ("receive one hint without revealing code") read as if hints replace that.
- **Requested change:** state explicitly in ROADMAP, Phase 04 and EXPLANATION-SPEC that **Start Question still returns the full solution by default**. Hints, approach-only, explain-my-code and debug are additional modes the student chooses. "No automatic AI request" means no request without a click, not "no full solution".
- **Verify:** Phase 04 acceptance includes "Start Question on a new problem shows idea + code + line-by-line + complexity, unchanged from v1", alongside the hint demo.

### B3: blocker: no free-request budget (IMPLEMENTATION-CONTRACTS, Phases 04-08, review checklist)

- **Problem:** OpenRouter's free allowance is 50 requests/day per account, shared by all free models. Hints, debug, labs, AI-authored activities and lessons each add model calls, but the only quota rule is that CI must not spend quota.
- **Requested change:** add a contract rule and a checklist item: every AI-backed feature documents how many requests one use costs, caches its result in the problem file, and never calls the model again on replay, input edits, seeking or theme changes. Show the user the cost when it is more than one request.
- **Verify:** each phase SUMMARY lists requests per action; a test asserts replay/seek/input-edit paths make zero model calls.

### S1: suggestion: approve Phases 06-07 later

AI-authored HTML activities (with a sandbox) and narrated lessons are large for a personal tool and spend quota. Keep the plans, but mark them "approve after Phases 01-05 have been used for a while".

### S2: suggestion: don't merge this branch before the amendments

The branch edits DESIGN-SYSTEM.md, EXPLANATION-SPEC.md and DECISIONS.md. If it is merged as is, the "proposed" banners become the rules. Merge only after B1-B3 are resolved and this review is updated to APPROVE PLAN.
