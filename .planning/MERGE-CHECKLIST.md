# Merge checklist for collaborator branches

A branch is merged into `main` only when **every** item below passes. Anything unclear or failing means
no merge: the branch gets a review comment listing what to fix.

Applies to the roadmap work in [PARTNER-REVIEW.md](./PARTNER-REVIEW.md) (owner review of 2026-10-13).

## 1. Scope
- [ ] Work lives on its own branch (not `main`, not `planning/integrated-learning-roadmap`), based on current `main`.
- [ ] Only approved scope: the plan amendments (B1–B3) and/or Phases **01–05**. No Phase 06/07/08 implementation yet.
- [ ] No new paid services, cloud database, hosted runner, tunnel or auth product.

## 2. Owner requirements (from the review)
- [ ] **B1:** extension theme defaults to **Light** for new and existing installs; Match this page / Dark are opt-in. The web vault stays light.
- [ ] **B2:** Start Question still returns idea + complete code + line-by-line + time/space complexity by default. Hints and other modes are extra.
- [ ] **B3:** every AI-backed feature documents its request cost, caches results in the problem file, and makes no model call on replay, seek, input edits or theme changes (with a test).
- [ ] Existing vault files (v1) still open, and the first saved solution is never replaced or rewritten.

## 3. Quality gates (run from a clean checkout)
- [ ] `pnpm install --frozen-lockfile` succeeds.
- [ ] `pnpm typecheck` and `pnpm lint` pass.
- [ ] `pnpm build` (web) and `pnpm ext:build` (extension) succeed.
- [ ] Tests added by the branch (`pnpm test`, if defined) pass.
- [ ] Merges into `main` without conflicts.
- [ ] Design follows [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) (with the B1 amendment).

## 4. Safety
- [ ] No secrets: no OpenRouter keys (`sk-or-v1-…`), no `.env.local`, no personal paths or vault data.
- [ ] No build output or `node_modules` committed.
- [ ] Local API protections kept: origin checks, same-origin-only storage routes, no secret values in page UI or prompts.

## 5. How it is merged
Open a pull request from the branch, post the checklist result on it, then merge with a merge commit (history
kept, branch not deleted). If any item fails, the PR stays open with a "changes requested" comment instead.
