# Decision Log

Record each significant decision here (lightweight ADRs). Newest at the bottom.

| # | Date | Decision | Status | Rationale | Revisit if |
|---|---|---|---|---|---|
| D1 | 2026-10-10 | TypeScript monorepo (pnpm + Turborepo) | Proposed | Shared types/schemas/prompts between extension & web | — |
| D2 | 2026-10-10 | WXT for the extension, UI in Chrome Side Panel | Proposed | Actively maintained, Vite-based, cross-browser, framework-agnostic | WXT stalls / side panel UX doesn't fit |
| D3 | 2026-10-10 | Next.js App Router for web + API (no separate backend) | Proposed | Single deployable, single user | Need long-running jobs/queues |
| D4 | 2026-10-10 | Neon Postgres (free) + Drizzle; Auth.js + GitHub OAuth | Proposed (v0.2, replaced Supabase) | Free, no 7-day idle pause, FTS, pgvector | Want all-Cloudflare |
| D5 | 2026-10-10 | Free AI via Vercel AI SDK: Gemini Flash primary, Groq / OpenRouter free / Ollama fallbacks; server-side keys | Proposed (v0.2, replaced Claude-only) | $0 budget; provider-agnostic so Claude can be added later | Free tiers removed or quality too low |
| D6 | 2026-10-10 | AI only for reasoning/teaching; everything else deterministic | Proposed | Cost, speed, reliability | — |
| D7 | 2026-10-10 | Disable AI on live rated contests | Proposed | Codeforces/CodeChef rules | — |
| D8 | 2026-10-10 | Zero-cost constraint: free tiers + local only; extension loaded unpacked (no $5 Web Store fee) | Accepted | Budget | Want to publish / share |
| D9 | 2026-10-10 | Explanation contract = algo-sensei modes/hint ladder + leetcode-helper section order, extended for CP; own prompt text | Accepted | Best-reviewed open DSA skills; neither covers CP or structured UI output | Eval scores drop |
| D10 | 2026-10-10 | Multi-provider auto-switch chain: Gemini → Groq → OpenRouter `:free` (native `models` fallback) → Ollama; cooldown tracking on 429; mid-stream SSE error handling | Superseded by D11 | OpenRouter free limit is per-account (20/min, 50/day; 1000/day after $10 credits) so cross-provider fallback is needed, not just cross-model | OpenRouter changes free policy |
| D11 | 2026-10-10 | Single AI model: `gemini-3.8-flash` (AI Studio free tier); no fallback chain. Supersedes D5 and D10 | Superseded by D12 | Simplicity; one prompt to tune. Model ID in env var | Free daily cap too low (forum reports ~20 RPD) — verify in AI Studio first |
| D12 | 2026-10-12 | Use OmniRoute (self-hosted gateway) with combos `logiq-main`/`logiq-fast`; app calls one OpenAI-compatible URL; v1 runs locally (no Vercel for now); output validated with zod + retry | Superseded by D16 | Auto-switches models when free limits are hit without custom provider code | OmniRoute unstable/abandoned → point base URL at Gemini/OpenRouter directly |
| D13 | 2026-10-12 | Logo = option B "Scholar node" (mortarboard over a vault base, tassel ends in a graph node). Brand colours: indigo #5B4BFF, navy #16163A, teal #19C3A6 | Accepted | Picked by owner from 4 options | — |
| D14 | 2026-10-12 | UI follows DESIGN-SYSTEM.md (black frame + pastel 28px cards, pill nav, Plus Jakarta Sans), derived from 3 reference dashboards; light and dark themes | Accepted | Owner found the first UI plain; wants all future UI in this style | — |
| D15 | 2026-10-12 | Theme is white-only with rainbow accent bars on containers; removed the black frame/top bar and the dark mode (supersedes the colour part of D14) | Accepted | Owner found the black and dark colours harsh on the eyes; their OS is in dark mode, so the automatic dark theme was what they saw | Want an opt-in dark theme later |
| D16 | 2026-10-12 | Call OpenRouter directly (free models) with a manual model switcher page; no OmniRoute/gateway; ranking of free models for DSA kept in code (recommendations.ts) | Accepted | Owner already set up OpenRouter; the account-wide free limit means automatic switching would not help against the daily cap, so manual switching plus clear errors is enough for v1 | Want auto-fallback on per-model upstream limits (add retry on next recommended model) |
| D17 | 2026-10-13 | Storage = one JSON file per problem in `C:\Vanshdeep\DSA\<platform>\<number>-<name>.json` (+ `settings.json`); no SQL/Supabase/Neon. Atomic writes, per-folder write lock, `LOGIQ_DATA_DIR` override | Accepted (supersedes D4) | Owner wants no database; local-first app; files are readable and easy to back up | Hosting online → swap `lib/store.ts` for a cloud document store |
| D18 | 2026-10-13 | Extension flow: side panel with Start Question + language (Python default) → reads page + editor → `/api/explain` (full statement fetched from the platform's own API/page when the page is incomplete: 0 tokens) → idea + code + line-by-line + complexity → saved; changing language re-runs (saved languages load instantly); follow-up chat saved in the file; vault "Open solution" opens the tab and the saved first solution via `externally_connectable`; extension installed by zip + Load unpacked | Accepted | Owner's spec; Chrome allows installs only from the Web Store and opens the side panel only on a user gesture (badge fallback) | Publish to the Web Store |
| D19 | 2026-10-13 | Vault folder is user-chosen in Settings (type a path or Browse via the OS folder picker run by the local server); remembered in `~/.logiq/config.json`; order: `LOGIQ_DATA_DIR` env > config > default `~/Documents/logiQ`. Switching can copy saved problems (never overwrites or deletes). Storage endpoints accept same-origin only (not the extension) | Accepted | Other users need their own location; browser folder pickers can't give a real path to the server | — |

## New learning roadmap proposals — awaiting review

These decisions apply to the proposed roadmap, not the currently shipped implementation. Accept/amend them through [PARTNER-REVIEW.md](./PARTNER-REVIEW.md) before execution.

| # | Date | Decision | Status | Rationale | Revisit if |
|---|---|---|---|---|---|
| D20 | 2026-10-13 | Extend current local JSON/direct OpenRouter architecture through eight bounded phases; historical database/gateway plans stay superseded | Proposed | Fits the working code and local/free constraint | A separately approved hosting requirement exists |
| D21 | 2026-10-13 | Light stays the default for new and existing extension installs; Match this page / Dark are persistent opt-in settings with normalized host signals | Proposed optional exception to D15; B1 amended, awaiting confirmation | Optional dark/matching theme; preserves the owner's light-default decision and the vault's light default | Host design changes or real-site QA shows poor contrast |
| D22 | 2026-10-13 | Side panel remains primary; packaged shadow-root launcher sits beside the question; optional wide learning view retains context and return action | Proposed | Help stays attached to the question without replacing the judge editor | Placement or keyboard QA fails |
| D23 | 2026-10-13 | Persist immutable solution/attempt IDs, migrate v1 safely, bind sessions/requests/chat/artifacts to explicit identities | Proposed | Prevents stale-tab answers and wrong-version explanations | Versioned schema needs a reviewed migration |
| D24 | 2026-10-13 | Deterministic template traces first; one trace drives visualization, checkpoints and lesson scenes; provenance distinguishes execution from illustration | Proposed | Makes custom inputs useful and limits contradictory explanations | A separately validated arbitrary-code runtime is added |
| D25 | 2026-10-13 | Custom activities default to declarative HTML/CSS with trusted interactions in a web sandbox; free-form JS is a separate gated capability | Proposed | Supports flexible visuals while keeping privileged extension/server boundaries clear | Browser/distribution safety review approves broader execution |
| D26 | 2026-10-13 | Narrated lessons use host-owned clock, browser speech, captions and text fallback; MP4 and paid TTS deferred | Proposed | Delivers playable concept explanations locally | Students need separately scoped downloadable video |
| D27 | 2026-10-13 | Progress separates participation, assistance, self-reported solve, acceptance and independent recall; review uses versioned local scheduling | Proposed | Prevents answer viewing from masquerading as mastery | Measured recall outcomes justify a different scheduler |
| D28 | 2026-10-13 | Start Question keeps idea + complete code + line-by-line + complexity by default; hints/approach/explain-my-code/debug are extra modes | Proposed clarification of D18; B2 amended, awaiting confirmation | Adds choices without changing the owner's existing full-answer workflow | Owner explicitly changes the default flow |
| D29 | 2026-10-13 | Plan for 50 shared free-model requests/day; declare per-action costs, cache results in the problem file, and use zero requests for replay/seek/input/theme changes | Proposed; B3 amended, awaiting confirmation | Keeps the personal tool usable within the existing free budget | Provider allowance changes; revise configuration and documentation without implicit spending |
| D30 | 2026-10-13 | Phases 01–05 remain conditional on B1–B3 confirmation; Phases 06–08 need later review after first-milestone use; do not merge before APPROVE PLAN | Proposed review gate from owner review c5fd0ef | Preserves the reviewer's scope and approval authority | Reviewer records a new explicit decision |

## Template
```
### Dn — <title>
Date:
Context:
Options:
Decision:
Consequences:
```
