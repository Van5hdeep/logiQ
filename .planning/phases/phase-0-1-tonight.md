# Tonight — Phase 0 + first vertical slice

Goal by end of tonight: **press a shortcut on a LeetCode problem → streamed explanation in a side panel → saved in the DB.**
If time runs short, the ✂ items move to tomorrow. Order matters: each step unblocks the next.

## Prereqs (10 min)
- [ ] Node 20+ and pnpm installed (`node -v`, `corepack enable`)
- [ ] Free keys: Google AI Studio, Groq, OpenRouter
- [ ] Neon account + empty project (copy `DATABASE_URL`) — *or* local SQLite tonight and move to Neon later
- [ ] `git init` + `.gitignore` (node_modules, .env*, .wxt, .next, OmniRoute data)

## Step 1 — Router (30 min) → AI-ROUTING.md §3
- [ ] Install and secure OmniRoute, connect providers, create `logiq-main` / `logiq-fast` combos
- [ ] `curl` smoke test returns an answer; note which model answered
- ✅ Done when: curl works, and disabling one provider's key still gets an answer

## Step 2 — Monorepo skeleton (20 min)
- [ ] pnpm workspace: `apps/web` (Next.js + Tailwind + shadcn), `apps/extension` (WXT + React + Tailwind), `packages/shared`, `packages/ai`
- [ ] `packages/shared`: `ProblemContext` type, `FullExplanation` zod schema (EXPLANATION-SPEC §3), constraint → complexity-budget function, signal-keyword table
- [ ] TS config, ESLint/Prettier, Vitest

## Step 3 — AI pipeline (45 min)
- [ ] `packages/ai`: OmniRoute client (AI-ROUTING §4), system prompt per EXPLANATION-SPEC §5 with the Two Sum gold example, `explain(context, mode)` → validated object, retry once on invalid JSON
- [ ] Vitest: schema accepts the gold example, rejects broken JSON
- [ ] Script `pnpm explain:demo` runs Two Sum + one Codeforces problem and prints the result
- ✅ Done when: both demos return valid objects and the dry-run output matches the sample

## Step 4 — API + DB (30 min)
- [ ] Drizzle schema: `problems`, `user_problems`, `explanations` (+ `model`, `input_hash`); other tables later
- [ ] `POST /api/explain` (Bearer personal token from `.env`, no OAuth tonight): cache lookup → router → store → return/stream
- [ ] ✂ Auth.js + GitHub login (tomorrow)
- ✅ Done when: `curl` to `/api/explain` twice → second call served from cache

## Step 5 — Extension MVP (60–90 min)
- [ ] WXT config: MV3, `sidePanel`, `commands` (`Alt+L`), host permissions for leetcode.com and localhost:3000
- [ ] LeetCode adapter: slug → same-origin GraphQL `question(titleSlug)` for statement/samples/difficulty/tags; DOM scrape as fallback
- [ ] Main-world script to read Monaco code (`monaco.editor.getModels()`)
- [ ] Side panel (React): header, mode buttons (Full / Approach / Hint), section renderer (restatement, insight, algorithm, Shiki code, line-by-line, dry-run table, complexity), "answered by <model>" label, loading and error ("Start OmniRoute") states
- [ ] Load unpacked in Chrome and try 3 problems (Easy / Medium / Hard)
- ✅ Done when: Alt+L on a LeetCode problem shows a full explanation and the row exists in the DB

## Tomorrow and after (not tonight)
Web app pages (library, detail, dashboard) · Codeforces/CodeChef adapters · hint ladder · FSRS review · Auth.js · tunnel/hosting option

## Rules for the night
- One working vertical slice beats five half-built features.
- Commit after every ✅.
- Don't tune prompts until the whole pipeline runs end to end; then tune using 5–10 saved problems.
