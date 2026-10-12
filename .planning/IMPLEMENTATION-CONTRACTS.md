# Implementation contracts

Status: proposed. Applies to the eight-phase roadmap. Names below are target contracts, not currently exported symbols. Phase 01 owns shared definitions; later phases extend them through explicit version changes.

## 1. Identity and ownership

`ProblemKey = platform + ':' + routeKind + ':' + externalId`. Include `routeKind` so a Codeforces Gym problem is not rewritten as a problemset problem. Normalize only via platform adapters, not arbitrary title text. File names remain storage addresses; titles and slugs can change without creating another learning identity.

`SessionKey = browserWindowId + ':' + tabId + ':' + ProblemKey`. Each session stores selected solution ID, attempt ID, language, teaching mode, trace step, scroll position and request identity. Durable learning belongs to the problem; session state belongs to that tab. A page reload can restore the saved problem but must not replay a one-time pending navigation request.

`SolutionId` identifies an immutable generated answer. `AttemptId` identifies an immutable student-code snapshot. All follow-up, diagnostic and learning-artifact requests carry their relevant IDs. Changing language creates/selects a different solution; regenerating creates another version. Never bind chat by “first solution with this language”.

Add proposed files under `packages/shared/src/`: `identity.ts`, `schemas.ts`, `teaching.ts`, `artifacts.ts`, `progress.ts`, `theme.ts`, `bridge.ts`. Export every public contract from `index.ts`. Add Zod as an explicit shared dependency aligned with the existing web version when implemented; do not rely on transitive resolution.

## 2. Record version 2 and migration

Extend the current problem file to a validated v2 record containing:

```ts
type ProblemRecordV2 = {
  version: 2;
  problemKey: string;
  // Existing platform/id/title/url/statement/tags/timestamps remain.
  solutions: VersionedSolution[]; // id, language, code, line notes, model, createdAt
  attempts: AttemptSnapshot[];    // id, codeHash, language, code, capturedAt, origin
  chat: VersionedChatTurn[];      // solutionId or attemptId; unbound legacy flag
  generatedResults: CachedModelResult[]; // canonical complete validated responses + cost metadata
  artifactRefs: ArtifactRef[];
  progress: ProblemProgress;
};
```

Keep existing `status: attempted | solved | revisit` as a compatibility summary. Detailed completion lives in `progress`: `unstarted | practicing | solved-with-help | solved-independently | revisit`. Judge acceptance is an independent, optional observation. Do not infer it from copied code, a checkpoint or self-report.

v1-to-v2 migration validates first, derives deterministic IDs using a stable canonical digest of identity/language/code/time/index, keeps the first solution and its original ordering, preserves raw chat and timestamps, and marks legacy chat unbound. Do not invent which solution an old conversation referred to. Read adaptation is non-destructive; write migration first creates a backup and uses an atomic replacement. Unsupported newer versions remain untouched and produce a recoverable message.

`readProblem` returns `ok | missing | corrupt | unsupported-version`; a bad file is not silently treated as an empty vault. Capture the resolved vault root once per operation. Use per-problem mutation serialization, a shared migration barrier for folder changes, and revision checks. Coordinate all writers in the supported single local-server process; prevent a second instance from writing the same vault or explicitly add a cross-process lock. Never claim an in-memory promise map protects multiple processes.

## 3. Files and limits

Preserve `<vault>/<platform>/<file>.json`. **Cache every validated model-backed result in that problem file**: complete solutions, hint levels, approaches, diagnostics, chat answers, generated activity source and generated lesson/storyboard payload. Add `generatedResults` for structured responses not already represented by solutions/chat. Store request/cost/cache-key metadata alongside the result. Artifact references do not replace this canonical problem-file cache.

Derived trace frames/render indexes may live beneath `<vault>/<platform>/_artifacts/<generated-id>.json` as rebuildable local caches. An absent sidecar never requires a model request: restore from the problem-file result or show native/text fallback. APIs resolve canonical generated content from the problem file. IDs are generated/validated server-side, never accepted as arbitrary paths. Folder-copy logic must preserve or rebuild sidecars while the complete model result remains in the copied problem record.

Proposed starting ceilings: statement 60,000 characters at intake; attempt code 20,000 characters; one artifact 256 KiB serialized; one trace 2,000 steps with bounded arrays/grids; one custom activity source 64 KiB; one lesson 12 scenes and a 5-minute estimated duration. Keep central constants with per-kind tighter limits. Never silently truncate a mathematically important constraint. If the token budget cannot fit the full question, ask the student to confirm a structured capture or select a relevant section before generation.

Bound cumulative problem/chat size and surface an archive/export action instead of dropping content. JSON backups and export remain local. Handle missing artifact references with explanation-only fallback. Theme preferences for the extension live in `chrome.storage.local`, not the chosen vault folder, so appearance survives vault migration.

Cache growth is bounded by explicit local archive/export controls; do not silently evict a generated result and then spend another request reopening it. If persistence fails after generation, retain the response in memory and retry only the local write; warn that it is not yet durable rather than invoking the model again.

## 4. API surface

| Target endpoint | Input | Result / rule |
|---|---|---|
| Existing `POST /api/explain` | Problem context, language, regenerate, requestId | Start Question default: idea + complete code + line-by-line + complexity with immutable solution ID |
| New `POST /api/teach` | ProblemKey/ref, mode, solutionId or attemptId, hint level, requestId | Discriminated hint/approach/diagnostic response; validated before save |
| Existing `POST /api/chat` | Ref + solutionId/attemptId + question | Version-grounded turn; reject unrelated IDs |
| New `POST /api/attempts` | Ref, captured code/language, origin, requestId | Immutable snapshot; bounded and deduplicated |
| New `PATCH /api/problems/[platform]/[file]` | Explicit progress action + expected revision | New progress summary; never replace the whole record from the browser |
| New `POST /api/artifacts` | Ref, solutionId, kind, input, requestId, explicit generation intent | Local derivation/canonical cache hit first; a model-backed miss needs an intentional Generate action and cost disclosure |
| New `GET /api/artifacts/[id]` | Validated generated ID | Bounded artifact resolved within the vault |
| New `POST /api/progress/events` | Event ID, problem/artifact/checkpoint IDs, typed action | Idempotent append + derived progress; no arbitrary object merge |
| New `GET /api/review` | Cursor, local-date/timezone policy | Due recall items; cached answers stay hidden initially |

Use one application-service layer for web and extension callers. Invalid JSON is 400; unknown referenced identity 404; stale revision 409; unavailable local/provider service 503/502; actual quota exhaustion 429. Unknown quota is not zero. Return stable machine-readable error codes plus plain messages.

## 5. Local service and cancellation

Bind local launch/start scripts to loopback and validate an explicit Host allowlist before trusting request headers. Accept exact trusted origins and the pinned extension origin; additionally pair the extension with a random local token through a user-initiated web setup flow. Store the token only in extension-owned storage; inject no token into site content or activity sandboxes. Reject unauthorized mutations with missing Origin/token. Define GET policies separately rather than treating CORS as authentication.

Pairing messages must validate sender origin, protocol and intended extension ID. Web calls use same-origin protection; extension calls use the paired token. Revoke/rotate through local Settings with a clear reconnect action. Do not expose the server through a public tunnel.

Deduplicate generation by problem/solution/input/mode/request ID. Record a request state machine and a small concurrency limit. On navigation, cancel client wait and discard late responses by SessionKey/request ID; server provider cancellation is best effort. A successfully completed request may remain saved for its original problem but never changes another active session. No automatic unbounded retry or paid-model fallback.

## 6. Trace, lesson and activity provenance

```ts
type ArtifactEnvelope = {
  id: string; version: 1; kind: 'trace' | 'activity' | 'lesson';
  problemKey: string; solutionId?: string; attemptId?: string;
  codeHash?: string; inputHash: string;
  provenance: 'trusted-template' | 'executed-code' | 'illustrative';
  validation: 'schema-checked' | 'sample-checked' | 'failed';
  engineVersion: string; model?: string; promptVersion?: string;
  createdAt: string; payload: unknown;
};
```

A trace includes input, expected output if known, actual result, invariant description, operation count, and ordered steps `{id, action, state, sourceLocation?, explanation?}`. State is typed by renderer family: array/pointers/map/queue/graph/grid. Validate indexes, step references, output comparison, unique IDs and finite values.

Source highlights require a verified code hash plus valid line mapping. A JavaScript template trace is not evidence that the student's arbitrary Python code executed. When no mapping exists, show language-independent algorithm steps with an explicit provenance label.

Lessons reference trace steps; custom activities receive only allowlisted artifact state and semantic theme tokens. The host owns playback, reset and checkpoint grading. Child-reported `completed` means interaction reported, not mastery verified. A solution/input/engine change creates a new artifact revision and marks earlier dependent material stale without deleting it.

## 7. Extension messages

Version every message; validate unknown fields and payload limits. Site-to-extension messages carry only problem identity, capture metadata, route/theme changes and user actions. Background-to-panel events carry SessionKey and revision. Web-to-extension commands allow ping/open-workspace/pairing, with trusted sender checks and canonical platform URL validation.

Do not bridge generic `fetch`, arbitrary filesystem paths, eval strings or extension API names. MAIN-world code is a packaged, narrow editor-reading function; returned values are untrusted. Prefer per-tab background state and declarative content-script events to polling unrelated tabs.

## 8. Test and evidence contract

Use Vitest for schemas/state/storage/trace and fixture extraction; Playwright with a persistent Chromium context for the real MV3 extension journey. Browser tests need packaged extension output, not a mocked React panel alone. Maintain offline fixtures for repeatable CI and a separate manual real-platform matrix. Free-model eval runs require an explicit developer command; ordinary CI uses fixtures and consumes no AI quota.

Record `schema validity`, `sample result`, `trace consistency`, `hint leakage`, `version grounding` and `latency` separately. No “all tests pass” claim if a suite is skipped or a live gate is blocked. Dependency additions and scripts are proposed work, not included in this planning branch.

## 9. Free-request budget and problem-file cache

**Product budget: 50 free-model requests/day per account, shared by all free models.** Model selection does not reset or multiply this allowance. Treat that as the supported baseline even if a particular account has a higher allowance; do not require credit purchases or a paid fallback. Query provider allowance when available, handle unavailable data as Unknown, and keep a local UTC-day dispatch ledger as a conservative lower-bound record, not an authoritative count of requests made by other apps.

Every feature must specify cold-use, cache-hit and retry costs before implementation. One provider dispatch is one budgeted request, including format repair and retries; failed/cancelled requests may still count, so reserve/count each dispatch conservatively. Metadata lookups and native/browser actions cost 0 model requests. No feature may hide multiple model stages behind an unlabelled one-click action.

| Action | Cold use | Cache/reopen | Extra-request policy |
|---|---|---|---|
| Start Question / new-language full solution | 1 request | 0 when a valid saved language solution exists | At most 1 format repair: disclose maximum 2 before dispatch |
| Explicit Regenerate solution | 1 request | Existing version stays readable at 0 | Same disclosed maximum 2; never triggered by replay |
| One new hint level / Approach / Explain my code / Debug | 1 request per chosen action | 0 for the same validated target/mode/level | At most 1 format repair, disclosed maximum 2 |
| Follow-up chat / optional free-text feedback | 1 request per submitted question | 0 for matching saved question and target/thread context | No automatic repair/retry chain; explicit retry costs 1 |
| Native lab generation / edit / replay / operation comparison | 0 requests | 0 | Trusted local engine only; no hidden template-selector call |
| Optional template suggestion for an unsupported question | 1 request after explicit selection | 0 for same question/context | No automatic suggestion on input changes; failed suggestion falls back locally |
| Custom activity generation (Phase 06, deferred) | 1 request | 0 for saved activity | Source + metadata in one response; at most 1 disclosed repair, maximum 2 |
| Narrated lesson generation (Phase 07, deferred) | 1 request | 0 for saved lesson | Storyboard + narration + scenes in one response; at most 1 disclosed repair, maximum 2 |
| Review scheduling, native grading, pattern aliases and stats | 0 requests | 0 | Deterministic local behavior |
| Optional review feedback / pattern or variation suggestion (Phase 08, deferred) | 1 request per explicit action | 0 for the same target and answer/seed | No background batch; at most 1 schema repair only when the displayed maximum is 2 |

Existing model-availability Test is a separate settings action: 1 request, labelled before use and included in the shared budget; it is not a teaching-quality check. Its last result may be displayed from local settings at 0 cost; retesting is an explicit action. Automated evaluations are explicit developer commands with a displayed corpus request total, never ordinary CI or background health checks.

Cache key: `problemKey + target solutionId/attemptId + mode/kind + hintLevel or normalized question + relevant conversation digest + inputHash + promptVersion + engineVersion`. Record the generating model as provenance. Selecting another model does not invalidate a usable saved result; use a deliberate Regenerate action to request a new one. Conversation-sensitive chat caching includes the preceding thread context so the same words in a different context do not return an unrelated answer.

**Replay, seeking, input edits, sliders, reset, speed/voice changes, route/theme changes and cached reopen always make 0 model calls**, including cache-miss/stale/error paths. New input runs supported native logic locally. Input-dependent generated material is marked stale; display saved/native/text material and offer a separately labelled Generate/Regenerate action. Never auto-refresh a stale lesson/activity, synthesize a new explanation or retry a failed provider call from an event handler.

Before dispatch, check cache and quota, reserve the declared maximum for a multi-request action, and show “Uses up to 2 free requests” where repair is possible. If only one request can be budgeted, offer an explicitly one-request action with repair disabled or wait; do not silently exceed the remaining budget. Near quota exhaustion, retain cached help. Save a successful result atomically before it is considered durably cached; duplicate concurrent requests share an in-flight operation and persist only once.

### Required tests and phase evidence

Create `request-budget.test.ts` in the shared/service test layer and a packaged-extension/browser counterpart during implementation. Inject a provider-dispatch spy and seed a canonical problem-file result. After the original explicit generation, reset the spy; perform replay, seek, input edits, reset, slider/speed/theme changes, cached reopen and an inactive-tab update. **Assert `providerDispatchCalls === 0`** and unchanged request ledger. Run the same assertion with a missing sidecar, stale input-dependent artifact, depleted quota, failed provider and failed local write; each must fall back or retry local work without dispatch.

Also test: fresh Start Question cold cost 1; format repair maximum 2 only after disclosure; saved Start Question cost 0; one chosen hint level costs at most its declared maximum; same hint reopens at 0; model switching leaves cache usable; two simultaneous identical requests dispatch once; separate conversation digests do not reuse chat incorrectly; the 51st baseline request is blocked; unknown quota is never displayed as zero; another model does not reset the UTC ledger; successful generation plus failed persistence does not regenerate.

Each phase SUMMARY must include a Requests per action table (cold/cache/repair), cache location in the problem record, budget-test commands/results and any live quota uncertainty. This document specifies future runtime tests; documentation validation on the amendment branch is not a claim that those runtime tests already exist or pass.

Provider reference: [OpenRouter rate limits](https://openrouter.ai/docs/api/reference/limits). The 50-request baseline is a product constraint; provider-reported allowance remains runtime evidence.
