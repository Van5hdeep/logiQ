# Partner review and execution gate

Status: **pending review**. Date: 2026-10-13. This branch contains proposed plans only. No phase is started or approved by its presence here.

## Reading order

1. [ROADMAP.md](./ROADMAP.md): product outcome, scope and eight phases.
2. [IMPLEMENTATION-CONTRACTS.md](./IMPLEMENTATION-CONTRACTS.md): shared data, identity and safety boundaries.
3. [THEME-INTEGRATION.md](./THEME-INTEGRATION.md): LeetCode integration and entire-extension dark mode.
4. Phase plans in numeric order. Audit their tasks against the actual source, not only other planning documents.

## Decisions to accept or amend

| Decision | Proposal | Review result |
|---|---|---|
| Page integration | Side panel primary; contextual launcher beside description; wide labs optional | Pending |
| Theme | Match this page default; persistent Light/Dark overrides; all extension states covered | Pending |
| Backend | Keep local JSON and direct OpenRouter; no database/runner/service migration | Pending |
| Student agency | Hints and checkpoints; no automatic solve requests or submission | Pending |
| Trace provenance | Deterministic templates first; arbitrary generated code is not claimed executed | Pending |
| Custom HTML | Restricted web-only sandbox; declarative default; JS capability separately gated | Pending |
| Narration | Browser speech + captions; silent/text fallback; MP4 export deferred | Pending |
| Retention | Attempts and recall outcomes drive progress; watching is not mastery | Pending |

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
