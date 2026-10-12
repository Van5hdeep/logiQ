# logiQ — Initial Plan (v0.1)

> A personal DSA tutor that lives in your browser. Trigger it on any problem page
> (LeetCode, Codeforces, CodeChef), get a complete explanation, and have every
> problem logged to a web app where you can review and revise it later.

Status: **Planning** · Owner: Vanshdeep · Last updated: 2026-10-10

> **Constraint (v0.2): ₹0 / $0 budget.** Every component below runs on a free tier
> or locally. Paid options (e.g. Claude API) are kept only as an optional later upgrade
> behind the same interface. See §12 "Zero-cost plan".

---

## 1. Goals & non-goals

### Goals (v1)
1. **One-shortcut help on any problem page** — `Alt+L` (or toolbar click) opens a side panel on LeetCode / Codeforces / CodeChef.
2. **Complete explanation**, with depth you choose:
   - Problem restated in plain words + what the constraints are really telling you
   - Intuition → brute force → optimal approach (why each step works)
   - Full solution code in your language
   - **Line-by-line** walkthrough of that code (or of *your* code)
   - Time & space complexity with justification
   - A dry run on a sample input
   - Edge cases & common mistakes
   - Pattern / technique tags (e.g. "monotonic stack", "binary search on answer")
3. **Automatic tracking** — every problem you open help on is saved with statement, your code, explanations, status, tags, difficulty.
4. **Web app** — dashboard to browse, search, filter and revise all saved problems.

### Non-goals (for now)
- Multi-user / public product, payments, mobile app.
- Auto-submitting code or anything that acts on the judge for you.
- Use during **live contests** (Codeforces/CodeChef rules forbid AI help during rated rounds — the extension will detect active contest pages and disable itself; see §9).

---

## 2. Recommended stack (and why)

| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript everywhere** | One language across extension, web app and API; shared types. |
| Monorepo | **pnpm workspaces + Turborepo** | Share types, zod schemas, prompts and UI between extension and web. |
| Extension framework | **WXT** (Vite-based, MV3) | Current default choice in 2026 comparisons: framework-agnostic, actively maintained, one codebase for Chrome/Edge/Firefox, HMR, handles MV2/MV3 differences. Plasmo is the alternative but is less actively maintained. |
| Extension UI | **React + Tailwind + shadcn/ui** in the **Chrome Side Panel** (`chrome.sidePanel`) | Side panel sits next to the problem without covering the editor and persists across tab navigation. Falls back to Firefox `sidebar_action`. |
| Web app | **Next.js (App Router) + React + Tailwind + shadcn/ui** | Same UI kit as the extension; route handlers double as the API, so no separate backend service for v1. |
| API | **Next.js route handlers** (could later move to **Hono** if split out) | Keeps the Anthropic key server-side. Streams AI output to the extension via SSE. |
| Database | **Neon Postgres (free plan)** + **Drizzle ORM** | Free, ~0.5 GB (thousands of problems); scales to zero and wakes automatically (Supabase free pauses after ~1 week idle and needs a manual restore). Postgres full-text search; **pgvector** available for "similar problems". |
| Auth | **Auth.js** with GitHub OAuth (free), restricted to your account; extension uses a **personal API token** generated in web settings | Free, no vendor limits, simplest secure setup for one user. |
| AI | **OmniRoute** (self-hosted AI gateway, OpenAI-compatible) in front of free providers (Gemini 3.8 Flash, Groq, OpenRouter free…), called through the Vercel AI SDK (`@ai-sdk/openai-compatible`). Fails over between models when a limit is hit. See [AI-ROUTING.md](./AI-ROUTING.md). | Free, combines many free quotas, limit-switching handled outside our code. |
| Rendering | **react-markdown + Shiki** (syntax highlight), **KaTeX** (math in statements), **Mermaid** (optional diagrams) | Good-looking, accurate explanations. |
| State / data fetching | **TanStack Query** (both apps), **Zustand** for small local UI state | |
| Charts | **Recharts** | Topic/difficulty distribution, streak heatmap. |
| Testing | **Vitest** (units, extractors with saved HTML fixtures), **Playwright** (extension + web e2e) | Site DOMs change — fixture tests catch extractor breakage fast. |
| Hosting | **Vercel Hobby** (web/API, free for personal non-commercial use) + **Neon** (DB) | Zero-ops, free. *Alternative:* Cloudflare Workers + D1 (also free). |
| Extension distribution | **Load unpacked** (Developer mode) | Free; Chrome Web Store needs a one-time $5 fee — skip until you want to share it. |

### Alternatives considered
- **Plasmo / CRXJS** instead of WXT — Plasmo is React-first and fine, but WXT is more actively developed and not locked to React.
- **Separate Express/FastAPI backend** — unnecessary for one user; Next.js route handlers are enough. Revisit if heavy background jobs appear.
- **Local-only (IndexedDB, no backend)** — possible, but the web app + cross-device sync + hiding the API key all need a server.
- **Calling the AI API directly from the extension** — rejected: the API key would live in the extension bundle/storage.

---

## 3. Architecture

```
┌────────────────────────── Browser ───────────────────────────┐
│  Problem page (leetcode.com / codeforces.com / codechef.com)  │
│   ├─ content script  ── site adapter → ProblemContext         │
│   └─ main-world script ── reads editor code (Monaco / Ace)    │
│                       │ runtime messages                      │
│  Background service worker ── auth token, routing, cache      │
│                       │                                       │
│  Side panel (React) ── modes: Hint / Approach / Full / My code│
└───────────────────────┼──────────────────────────────────────┘
                        │ HTTPS + SSE (Bearer personal token)
┌───────────────────────▼──────────── Vercel ───────────────────┐
│ Next.js app                                                   │
│  /api/explain   → prompt builder → OmniRoute (local gateway)     │
│  /api/problems  → CRUD, search                                 │
│  /api/attempts  → status / code snapshots                     │
│  Web UI: dashboard, problem library, review queue, stats      │
└───────────────────────┬───────────────────────────────────────┘
                        │
              Neon Postgres, free (+ pgvector later)
```

### Site adapters (the non-AI core of the extension)
One adapter per site, all returning the same `ProblemContext` shape:

```ts
type ProblemContext = {
  platform: 'leetcode' | 'codeforces' | 'codechef';
  externalId: string;          // "two-sum", "1872C", "START123A"
  url: string;
  title: string;
  statementHtml: string;       // sanitized
  constraints?: string;
  samples: { input: string; output: string }[];
  difficulty?: string | number; // "Medium" | 1600
  tags: string[];              // platform tags (may be hidden by user preference)
  userCode?: { language: string; source: string };
  isLiveContest: boolean;
};
```

| Site | Problem data | User's code |
|---|---|---|
| LeetCode | DOM + LeetCode's (unofficial) GraphQL endpoint used by its own frontend (`question(titleSlug)`), called same-origin from the page | Monaco editor via a main-world script (`monaco.editor.getModels()`) |
| Codeforces | DOM of `/problemset/problem/…` or `/contest/…/problem/…`; tags & rating from the **official API** `problemset.problems` | No in-page editor on problem pages → paste box in side panel, or read from submit page / submission view |
| CodeChef | DOM of problem page (statement, constraints, samples) | Ace editor via main-world script (`ace.edit(...).getValue()`) |
| Fallback (any site) | User selects text / pastes statement | Paste box |

Adapters are isolated so a DOM change on one site breaks only one file, and each has fixture tests.

---

## 4. Where AI is needed vs. where it is not

**Rule of thumb:** collect, store, organise, and measure without AI; use AI only for *reasoning and teaching*.

### ✅ No AI needed (deterministic code)
| Feature | How |
|---|---|
| Extract problem, samples, constraints, difficulty, tags | Site adapters + platform APIs |
| Read your code & language | Editor APIs (Monaco/Ace) |
| Detect "Accepted" / attempt status | Observe the result DOM / submission page |
| Save + organise problems, notes, attempts | Postgres |
| Search | Postgres full-text search (`tsvector`) |
| Tag normalisation across platforms | Mapping table (`"two pointers"` ≈ `two-pointers` ≈ `2-pointers`) |
| **Complexity *budget* from constraints** | Heuristic table: n ≤ 12 → O(2ⁿ·n)/O(n!), n ≤ 500 → O(n³), n ≤ 5·10³ → O(n²), n ≤ 10⁶ → O(n log n)/O(n), larger → O(log n)/O(1). Shown instantly before AI answers, and used to sanity-check the AI. |
| Spaced-repetition review queue | **FSRS** (or SM-2) scheduling on each solved problem |
| Stats: topic coverage, difficulty spread, streaks, heatmap | SQL aggregates |
| Syntax highlighting, markdown/math rendering | Shiki, KaTeX |
| Contest-mode detection | URL + contest timer DOM / Codeforces `contest.list` API |
| Explanation caching | Hash of (problem id + mode + code) → reuse stored answer |

### 🤖 AI needed
| Feature | Notes |
|---|---|
| Plain-language restatement & intuition | Core teaching value |
| Brute force → optimal approach reasoning | |
| Solution code in chosen language | |
| Line-by-line explanation (of reference or **your** code) | Line numbers anchored so the panel can highlight lines |
| Time/space complexity with justification | Cross-checked against the constraint heuristic; mismatch shown as a warning |
| Dry run on a sample | |
| "Why is my code wrong / TLE?" debugging | Sends your code + verdict |
| Pattern/technique classification | Cheaper/faster model |
| Progressive hints (hint 1 → 2 → 3, no spoilers) | |
| Follow-up chat ("why not a heap here?") | Uses stored explanation as context |
| Similar-problem suggestions (later) | Embeddings (Gemini embedding free tier, or local **transformers.js**) + pgvector |

**Rough split:** ~60–65% of the system (extraction, storage, tracking, web app, review, stats) is plain engineering. AI is a single, well-defined service: `explain(context, mode) → structured explanation`.

---

## 5. AI design

### Modes (user picks in the side panel)
1. **Hint** — progressive nudges, no code.
2. **Approach** — intuition + algorithm + complexity, no code.
3. **Full explanation** — everything incl. code, line-by-line, dry run.
4. **Explain my code** — line-by-line on *your* code + complexity.
5. **Debug my code** — find the bug / TLE cause, minimal fix.
6. **Chat** — follow-up questions on the current problem.

> **Full output contract (modes, section order, zod schemas, hint ladder, prompt layout,
> post-AI checks): see [EXPLANATION-SPEC.md](./EXPLANATION-SPEC.md).** The schema below is
> the short version; the spec supersedes it.

### Structured output (validated with zod, rendered as sections)
```ts
type Explanation = {
  restatement: string;
  keyObservations: string[];
  patterns: string[];             // normalised tags
  approaches: { name: string; idea: string; time: string; space: string }[];
  optimal: {
    intuition: string;
    algorithmSteps: string[];
    code: { language: string; source: string };
    lineByLine: { lines: [number, number]; explanation: string }[];
    complexity: { time: string; space: string; justification: string };
  };
  dryRun?: string;
  edgeCases: string[];
  commonMistakes: string[];
};
```

### AI model routing — OmniRoute

**Full design: [AI-ROUTING.md](./AI-ROUTING.md)** (decision D12; replaces the single-model D11).
logiQ calls one endpoint (`http://localhost:20128/v1`) with a combo name (`logiq-main` for
Full/Debug/Explain, `logiq-fast` for Hint/Pattern/Chat). OmniRoute switches models/providers when a
free limit is hit; logiQ only validates the output (zod), records which model answered, and
caches. Consequence: OmniRoute is self-hosted, so v1 runs **locally** (extension → Next.js on
localhost → OmniRoute on localhost); Vercel hosting is deferred.

### Quota & quality controls (free tiers are request-limited, so *requests* are the budget)
- **One request per explanation**: ask for the whole structured `Explanation` in a single call, not one call per section.
- **Response cache** in DB keyed by `(problem, mode, code hash, model)` — revisiting a problem costs 0 requests.
- **Explain on demand only** (shortcut), never auto on page load.
- **Usage table** logging provider, tokens and 429s; side panel shows "requests left today".
- **Streaming** so the first section appears in ~1–2 s.
- Always send constraints + samples so complexity and dry run are grounded; cross-check with the constraint heuristic (matters more with smaller free models).
- Free tiers may use prompts for training — fine for public DSA problems; never send secrets.
- Optional later: run generated code against samples for free — Python in-browser via **Pyodide**, or a self-hosted **Judge0** in Docker on your PC.

---

## 6. Data model (v1, Drizzle / Postgres)

```
users            (id, email, created_at)                       -- just you
api_tokens       (id, user_id, hash, label, last_used_at)
problems         (id, platform, external_id, url, title, statement_html,
                  constraints, samples jsonb, difficulty, platform_tags text[],
                  created_at)                    UNIQUE(platform, external_id)
user_problems    (id, user_id, problem_id, status[todo|attempted|solved|revisit],
                  first_seen_at, solved_at, confidence 1-5, notes_md,
                  patterns text[], starred bool)
attempts         (id, user_problem_id, language, code, verdict, created_at)
explanations     (id, user_problem_id, mode, model, input_hash, content jsonb,
                  tokens_in, tokens_out, created_at)
chat_messages    (id, user_problem_id, role, content, created_at)
review_schedule  (user_problem_id, due_at, stability, difficulty, reps, lapses) -- FSRS
tags             (slug, display_name, aliases text[])           -- normalised taxonomy
-- later: problem_embeddings (problem_id, embedding vector)
```

---

## 7. Web app pages

| Page | Content |
|---|---|
| **Dashboard** | Solved count, streak heatmap, topic radar, difficulty split, "due for review today" |
| **Library** | Table/grid of all problems; filter by platform, difficulty, pattern, status, date; full-text search |
| **Problem detail** | Statement, your attempts (diffable), saved explanations (tabs per mode), notes, chat history, "Re-explain" |
| **Review** | FSRS queue: show problem → recall approach → reveal explanation → rate (Again/Hard/Good/Easy) |
| **Patterns** | Each pattern with its problems, your success rate, and a short AI-generated pattern summary (cached) |
| **Settings** | API token for the extension, default language, default explanation mode, today's free-quota usage |

UI direction: dark-first, IDE-like, dense but calm; shadcn/ui + Tailwind; Shiki theme matched to the side panel.

---

## 8. Roadmap

### Phase 0 — Foundations (≈ 2–3 days)
- [ ] pnpm + Turborepo monorepo: `apps/extension` (WXT), `apps/web` (Next.js), `packages/shared` (types, zod schemas, tag map), `packages/ui` (shadcn components), `packages/ai` (prompts, model routing)
- [ ] Neon project, Drizzle schema + migrations
- [ ] Install + secure OmniRoute, connect free providers, create combos (see AI-ROUTING.md §3)
- [ ] `packages/ai`: OmniRoute client, retry-once on invalid JSON, record answering model
- [ ] ESLint/Prettier, Vitest, CI (GitHub Actions: typecheck, lint, test)

### Phase 1 — MVP: LeetCode + explanation (≈ 1 week)
- [ ] LeetCode adapter (statement, samples, constraints, difficulty, tags, Monaco code)
- [ ] Side panel with modes: Approach / Full / Explain my code
- [ ] `/api/explain` with streaming + zod-validated structured output
- [ ] Constraint → complexity heuristic shown instantly
- [ ] Auto-save problem + explanation to DB
- [ ] Keyboard shortcut (`commands` API) and toolbar action
- ✅ *Done when:* on any LeetCode problem, `Alt+L` streams a full explanation and the problem appears in the DB.

### Phase 2 — Web app v1 (≈ 1 week)
- [ ] Auth, personal API token flow into the extension
- [ ] Library (filter + search), Problem detail, Settings
- [ ] Dashboard with basic stats

### Phase 3 — Codeforces + CodeChef (≈ 4–5 days)
- [ ] Codeforces adapter + `problemset.problems` API for tags/rating
- [ ] CodeChef adapter + Ace editor reader
- [ ] Generic fallback (selected text / paste)
- [ ] **Live-contest guard** (disable AI on active rated contests)
- [ ] Cross-platform tag normalisation

### Phase 4 — Learning loop (≈ 1 week)
- [ ] Hints mode, Debug mode, follow-up Chat
- [ ] Verdict detection → attempt history
- [ ] FSRS review queue + Review page
- [ ] Patterns page

### Phase 5 — Polish & smart features (open-ended)
- See [BACKLOG.md](./BACKLOG.md)

---

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Site DOM / LeetCode GraphQL changes break extraction | Adapter-per-site, saved HTML fixtures in tests, graceful fallback to "select text / paste" |
| Contest rules (Codeforces & CodeChef prohibit AI help during rated contests) | Contest detection disables explain features on live contest pages |
| Site terms on scraping | Only read the page you're already viewing, for personal use; no bulk crawling; low request rates |
| Wrong AI complexity / buggy code | Constraint heuristic cross-check; optional sample-test execution; "regenerate with Opus" button |
| Free-tier limits low or cut | OmniRoute combines several pools and fails over; one request per explanation; cache everything; base URL swappable to plain Gemini/OpenRouter |
| OmniRoute is young, third-party, and holds your API keys | Pin version, strong admin password, localhost-only, `.env` out of git (AI-ROUTING §6) |
| Free models weaker than paid ones | Single well-engineered prompt with examples, constraint heuristic cross-check, "regenerate" button |
| Leaking API keys | Keys only on the server; extension holds a revocable personal token |

---

## 10. Claude Code skills / plugins to use while building

| Area | Skill / plugin | Use |
|---|---|---|
| AI integration | Vercel AI SDK docs; **`claude-api`** (already available) only if you later add Claude | Provider setup, `streamObject`, structured output |
| Frontend UI | **`frontend-design`** plugin (Anthropic) | Distinctive, polished UI for side panel and web app |
| UI review | **Design** plugin (Anthropic) — `design-critique`, `accessibility-review` | Critique screens, a11y |
| Backend / DB | **`supabase-postgres-best-practices`** (inside the free `supabase` plugin) — Postgres advice applies to Neon too | Schema design, indexes, FTS |
| Data viz | **`dataviz`** (already available) | Dashboard charts & heatmap |
| Quality | **`code-review`**, **`security-review`**, **`simplify`** (already available) | Before each phase is merged |
| Running/verifying | **`run`** + built-in browser | Load the extension & web app and check flows |
| Hosting alt. | **Cloudflare** plugin skills (`workers-best-practices`, `wrangler`) | Only if choosing the Cloudflare stack (needs `/mcp` auth) |

---

## 11. Open questions (decide before/while building Phase 1)
1. Primary solution language for generated code — C++? Java? Python? (default + per-request override)
2. Hide platform tags by default to avoid spoilers? (Suggested: yes, reveal on click.)
3. Vercel+Neon vs. all-Cloudflare? (Suggested: Vercel+Neon for v1 — both free.)
4. Do you want explanations to auto-trigger on page open, or only on shortcut? (Suggested: only on shortcut — saves free quota and avoids spoilers.)
5. Which providers do you want connected in OmniRoute (Gemini, Groq, OpenRouter at minimum)?

See [DECISIONS.md](./DECISIONS.md) for the decision log.

---

## 12. Zero-cost plan (summary)

| Need | Free option | Free-tier limit to watch |
|---|---|---|
| Extension | WXT, load unpacked | — (Web Store would be $5 one-time) |
| Web app + API | Vercel Hobby | Personal/non-commercial use; serverless time limits (streaming is fine) |
| Database | Neon free | ~0.5 GB storage, compute-hours cap; scales to zero |
| Auth | Auth.js + GitHub OAuth | None |
| AI | **OmniRoute** (self-hosted AI gateway, OpenAI-compatible) in front of free providers (Gemini 3.8 Flash, Groq, OpenRouter free…), called through the Vercel AI SDK (`@ai-sdk/openai-compatible`). Fails over between models when a limit is hit. See [AI-ROUTING.md](./AI-ROUTING.md). | Free, combines many free quotas, limit-switching handled outside our code. |
| Embeddings (later) | Gemini embeddings / transformers.js | — |
| Code execution (later) | Pyodide in browser, Judge0 self-hosted | Your machine |
| CI | GitHub Actions | Free minutes for public repos / generous for private |

**Realistic usage:** ~5–15 problems a day × 1–3 requests each = well under the free daily caps,
especially with caching. Total running cost: **$0**.

**Upgrade path:** if free quality/limits ever feel short, add a paid provider (e.g. Claude) as the
first entry in `providers.ts` — no other code changes.
