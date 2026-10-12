# Phase 08 — Recall, pattern transfer and integrated release

Status: **deferred / not approved / not started**, consistent with the owner's full review. Review after Phases 01–05 have been in use; later implementation requires separate approval. Depends on Phases 01–07. Earlier phases complete their own acceptance gates; this phase does not authorize starting retention work before its review.

## Student outcome

Saved material becomes a practice system. The student returns to a due question with its answer hidden, explains the approach, attempts a checkpoint or variation, and records how much help was needed. Patterns and Stats reflect attempts and recall evidence rather than the number of AI answers saved.

## File targets

Implement `apps/web/src/app/review/page.tsx`, `patterns/page.tsx`, `stats/page.tsx`, `components/review-rail.tsx`, `components/vault/{vault-view,vault-stats,problem-card}.tsx`, shared progress schemas, services `review-service.ts`/`pattern-service.ts`, `/api/review` and progress-event routes. Add review/pattern/stat components, extension “Review this concept” entry, versioned pattern registry, release QA fixtures and CI integration tests.

## Implementation steps

1. **Persist learning events.** Record attempt captured, hint revealed, answer revealed, prediction answered, activity used, lesson viewed, self-reported completion and recall rated. Events have generated/idempotent IDs, problem/artifact/version references and timestamp/timezone policy. Parent validates events; child-reported completion cannot assert mastery.
2. **Implement a deterministic starter scheduler.** Initial proposal: successful first recall due after 1 day, then 3, 7 and 14 days on consecutive independent successes; Again resets to 1 day, Hard does not advance beyond current interval, skipped review does not change history. Store algorithm version and next due timestamp. Confidence is supplementary, not the outcome itself. Define whether corrected answers count as assisted.
3. **Build answer-hidden Review.** This is an explicitly chosen review workflow; it does not replace Start Question's default full answer. Show question/restatement without spoilers and require an answer or deliberate reveal before rating. Restore saved trace/checkpoint at 0 requests. Optional feedback is a separate cost-labelled action, saved in the problem file for that target/answer/context.
4. **Create pattern mapping and transfer.** Normalize platform tags through a versioned alias registry. AI suggestions are candidates until validated; keep provenance. Pattern pages show concrete examples, invariant, common failure, linked problems and a variation prompt. Similar-problem suggestions come from the local vault first; external suggestions remain unverified until opened/captured.
5. **Replace misleading counters.** Stats count real practice dates, recall outcomes, assistance and topic coverage. Separate saved answers, accepted submissions, self-reported solves and independent recall. Weekly activity uses event dates in the student's chosen timezone, including midnight and DST behavior where relevant; no UTC/local label mixture.
6. **Make all saved material reachable.** Vault Open learning goes to the web detail even without the extension; Open on platform remains a separate action. Problem detail selects exact solution/attempt and links its lab, lesson, review and provenance. Missing records/artifacts have recoverable fallback; folder migration retains all references.
7. **Complete support boundaries.** Expose offline/paired/partial-capture/unknown-quota states and explicit retry. For live contest routes, implement a clear restricted-context state consistent with the reviewed platform policy; do not infer that every contest URL is live/rated. If verification is unavailable, label uncertainty and offer saved material/manual context rather than claiming a verified status.
8. **Run integrated acceptance.** Test the installed MV3 extension with local fixture pages and separately on real LeetCode. Package docs/zip/setup instructions and migration behavior. Confirm baseline Codeforces/CodeChef flows still work. Record all blocked external gates before a release claim.

## Requests per action

Review scheduling/rating, native checkpoint grading, pattern-alias mapping, stats, replay, seek, input/theme changes and saved reopen cost **0 requests**. Optional review feedback, pattern suggestion or variation generation costs **1 request per explicit action**, 0 for the same cached result in the problem file; at most 1 schema repair requires maximum-2 disclosure. No background batches, digest generation or automatic feedback. Phase SUMMARY records costs, cache fields and zero-call test evidence if this phase is later approved.

## Integrated test matrix

| Journey | Required result |
|---|---|
| Start Question on new problem → cached reopen | Full idea/code/line-by-line/complexity at 1 cold request, 0 on cache; extra modes do not change default |
| New question → hint → own-code explanation → lab → checkpoint | All objects belong to the same question/session/version |
| Question A pending → switch B → return A | No wrong-question result; correct cached session restores |
| Fresh/migrated install on dark LeetCode → opt into matching/Dark → reload | Light stays default; explicit choices persist across every panel state |
| Regenerate code → chat → saved lesson | Chat uses selected version; old dependent lesson is visibly stale |
| Change input → seek/play → native checkpoint | Trace and lesson state agree; old checkpoint credit is not reused |
| Custom activity malicious message / crash | Parent data stays intact; fallback/recovery remains available |
| Provider quota/error/offline → reopen saved material | No extra AI request; saved explanation/lab/transcript accessible |
| v1 migration → folder copy → restart | First solution/history/artifact links preserved; no split writes |
| Review success/failure/repeated event | Due date follows versioned rules; duplicate event has no effect |
| Keyboard / narrow panel / zoom / reduced motion | Every action remains reachable and graphics have text alternatives |
| Replay / seek / input or theme edit / stale generated material | Provider-spy count is 0, ledger unchanged; fallback or separate cost-labelled Generate action |

## Release evidence and acceptance

- Unit/fixture/integration suites, root typecheck/lint, web build, extension build and zip pass with warnings explained.
- Real LeetCode installed-extension recording covers launcher placement, SPA question change, actual editor capture/fallback, both host themes and return from wide learning view.
- Codeforces/CodeChef smoke tests identify platform-specific limitations; no supported-platform regression is hidden by LeetCode-only evidence.
- No secrets, tokens, private attempt code or real student records appear in screenshots, logs or committed fixtures.
- Model eval reports schema validity, hint leakage, sample checks, trace consistency, version grounding and latency; model availability is a separate metric.
- Partner reviews the phase summaries and final migration/setup/recovery instructions before release.
- Every SUMMARY has Requests per action (cold/cache/repair) and canonical problem-file cache evidence. Budget tests reject the 51st baseline request, count disclosed repairs, preserve cache across model switches and make no provider calls on replay/seek/input/theme changes.

## Rollback and deferred work

Feature-flag retention pages if a scheduler defect is found; retain event history and schema versions. Disabling custom JS or speech must preserve native labs and review. Do not roll back by deleting new progress or overwriting v2 files.

Deferred: MP4 export, universal language runners, cloud sync, mobile app, automatic code submission/editor writes, paid services, submission-history import and more platforms. Proposed later work requires another plan rather than silently expanding this release.
