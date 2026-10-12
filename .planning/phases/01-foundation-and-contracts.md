# Phase 01 — Reliable records and shared contracts

Status: proposed / not started. Depends on: current app. Gate: partner review accepted and owner authorizes execution. Contract: [implementation contracts](../IMPLEMENTATION-CONTRACTS.md).

## Student outcome

Existing saved problems remain intact. A student can choose the exact solution version to discuss, record whether they solved with help, and recover from a damaged file without losing the whole vault. The extension connects to a deliberately local service.

## File ownership and targets

Modify `packages/shared/src/problem.ts`, `types.ts`, `index.ts`, `apps/web/src/lib/store.ts`, `storage-location.ts`, `cors.ts`, `/api/chat/route.ts`, `/api/explain/route.ts`, `/api/settings/route.ts` and storage routes. Add shared schema/identity/progress files, `apps/web/src/lib/services/problem-service.ts`, `migrations/problem-v2.ts`, `local-auth.ts`, and schema/store/service tests. Add scripts/test configuration to affected package manifests and a CI workflow only during implementation.

## Implementation steps

1. **Create runtime contracts.** Move persisted-record validation into shared Zod schemas. Add immutable solution/attempt IDs, record revision, structured progress, canonical ProblemKey and typed errors. Export all symbols. Validate line-note ranges, finite indexes and source bounds; verify snippets against code rather than silently remapping ambiguous duplicate text.
2. **Migrate v1 safely.** Implement pure v1-to-v2 conversion, deterministic legacy IDs, original first-solution order, preserved chat/timestamps and explicit unbound legacy conversations. Keep read adaptation non-destructive; backup before first v2 write. Unsupported versions return a recoverable warning.
3. **Refactor persistence behind services.** Capture vault root once per operation. Serialize writes by problem identity, check expected revision, use atomic temporary writes and coordinate folder migration. Failed writes never advance the in-memory revision. Clean abandoned temp files only when verified unrelated to an active write; never delete damaged canonical records.
4. **Bind chat to a version.** Require solutionId/attemptId for new chat requests; permit legacy read display but require explicit selection for new questions. Confirm the referenced object belongs to the requested problem. Preserve selected ID in response/cache/UI; regeneration appends another ID.
5. **Implement progress mutation.** Add typed actions for practicing, solved with help, solved independently and revisit. Preserve accepted-verdict evidence separately. Return a delta/revision, not a browser-supplied whole record. Update existing vault counts and labels to the summary contract.
6. **Protect the local service.** Add loopback launch scripts, Host/origin allowlists and pairing-token checks for extension mutations. Local web setup creates/revokes a pairing grant; background validates external sender and stores the token in extension storage. Update API client to attach it without exposing it in content scripts or prompts. PC-changing routes stay web-owned.
7. **Bound resource use and errors.** Limit request sizes/generation concurrency, deduplicate request IDs, return stable error codes, expose invalid/quarantined records in the vault and keep unknown quota as Unknown. Show a recovery/export path instead of discarding older conversations.
8. **Introduce test infrastructure.** Add Vitest, temporary vault fixtures, fake provider transport and CI scripts. Root lint should explicitly cover extension/shared or document each separate command. CI never calls a real model.

## Tests and acceptance

- v1 gold fixtures migrate deterministically; rerunning migration produces identical IDs and content. First answer remains first.
- Corrupt JSON, valid-but-malformed JSON, missing artifact and unsupported-version files produce distinct errors; other problems still load.
- Two parallel solution/chat/progress mutations preserve both writes or return a revision conflict. Folder switch cannot split one operation across roots.
- Chat about solution B includes B's code, never solution A's same-language code.
- Wrong host/origin/token, missing credentials and malformed body are rejected; legitimate paired extension and same-origin web mutations succeed.
- Cache hit consumes no provider request; duplicate request ID does not save duplicate output. Disk/provider failure leaves prior data readable.
- Typecheck, full lint, web build, extension build and focused test suite pass. Runtime pairing flow is demonstrated with the installed extension.

## Demonstration and exit evidence

Open a copied v1 vault, select a regenerated solution, ask a version-specific question using a mocked provider, set “Solved with help”, and reload. Record persistent IDs, progress and damaged-file behavior. Show pairing failure/success without including tokens in evidence.

## Rollback and exclusions

Keep the untouched v1 backup and explicit supported schema versions. Test rollback read compatibility before release; restoring an older binary must not overwrite v2 records. Do not introduce a database, cloud authentication or automatic backups service. Phase completion is record/service reliability, not a claim that AI answers are correct.
