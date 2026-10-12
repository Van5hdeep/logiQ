# AI routing

> **Update 2026-10-12 (D16): logiQ now calls OpenRouter directly, with a manual model switcher.**
> The OmniRoute plan below is kept for reference but is not used. Current design:
> - Key in `apps/web/.env.local` (`OPENROUTER_API_KEY`), server-side only.
> - Live list of free chat models from `https://openrouter.ai/api/v1/models`, merged with our DSA ranking
>   (`apps/web/src/lib/ai/recommendations.ts`). New free models appear automatically as "untested".
> - `/models` page: pick the model (saved in the browser), `Test` button (1 request), recommended badges, evidence,
>   expiry dates, and today's free-request counter from `GET /key`.
> - Errors are classified (`daily_limit`, `rate_limited`, `unauthorized`, `privacy_settings`, `model_unavailable`,
>   `network`) and shown with `AiErrorNotice`, which links to `/models` when switching can help.
> - **Limit facts:** the free allowance (50/day, 1,000/day after a one-time $10 credit; 20/min) is per account across
>   all free models, so switching does not reset it. Switching fixes per-model upstream limits ("Provider returned
>   error"), which were seen on Gemma 4 and Laguna in live tests.
> - Some free models are agent-app only (Inkling): flagged `usable: false`.
> - The explain pipeline (next step) reads the chosen model id, calls `chat/completions`, and on a `rate_limited` /
>   `model_unavailable` error shows the notice so the user can switch. Optional later: auto-retry on the next
>   recommended model.


> Supersedes the single-model decision (D11). Decision D12. Updated 2026-10-12.
> Assumption: "omni router" = **[OmniRoute](https://github.com/diegosouzapw/OmniRoute)**
> (MIT, self-hosted AI gateway). If you meant OpenRouter's `openrouter/free` router, see §7.

## 1. What OmniRoute gives us
- One **OpenAI-compatible endpoint** (`http://localhost:20128/v1`, `POST /v1/chat/completions`, `Authorization: Bearer <OmniRoute key>`).
- Behind it: many providers (Gemini, Groq, OpenRouter free, etc.) that you connect with your own free keys/accounts.
- **Combos** = a chain of models it fails over across when quota runs out, a provider errors, or a circuit breaker trips (also per-key cooldowns and model lockouts). 19 routing strategies (`priority`, `fill-first`, `auto`, …).
- Zero-config aliases: `auto`, `auto/coding`, `auto/fast`, `auto/smart`, … (but a fresh install may have no eligible route until providers are connected).
- Dashboard shows usage and free-tier info (`/dashboard/free-tiers`).

So logiQ's code stays trivial: **one base URL, one model name** (`logiq-main`, a combo we define). All limit-switching lives in OmniRoute, not in our code.

## 2. Architecture change: it runs on your PC
OmniRoute is self-hosted, so **Vercel cannot reach it**. For v1 everything runs locally:

```
Browser extension ──► Next.js (localhost:3000) ──► OmniRoute (localhost:20128/v1) ──► free providers
                              │
                              └──► Neon Postgres (free cloud)   [or local SQLite tonight]
```

- The web app/API is run with `pnpm dev` / `pnpm start` on your PC while you practise (an autostart script comes later).
- Hosting on Vercel + OmniRoute via a Cloudflare Tunnel (free) is a **later** option → BACKLOG.
- Downside: the PC must be on. Upside: no hosting limits, API keys never leave your machine.

## 3. Setup (tonight, ~30 min)
1. `npm i -g omniroute` (or Docker: `docker run -p 20128:20128 diegosouzapw/omniroute`). **Pin the version** you test with.
2. Set an admin password **before first run** (`INITIAL_PASSWORD`; the reported default is the literal `CHANGEME`). Bind to localhost only.
3. Never commit the `.env` it generates; add it to `.gitignore`.
4. In the dashboard connect free providers: **Google AI Studio (Gemini 3.8 Flash)**, **Groq**, **OpenRouter** (free key), others per `/dashboard/free-tiers`. Skip any marked `tos: avoid`.
5. Create combo **`logiq-main`**: strategy `priority`; order: Gemini 3.8 Flash → large-context OpenRouter free models (e.g. Nemotron 3 Ultra, Inkling) → Groq. Create **`logiq-fast`** for hints/patterns: fastest models first.
6. Copy the OmniRoute API key into `.env.local` as `OMNIROUTE_API_KEY`; set `OMNIROUTE_BASE_URL=http://localhost:20128/v1`.
7. Smoke test: `curl` a chat completion with `model: logiq-main`.

## 4. Code (packages/ai)
```ts
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
const router = createOpenAICompatible({
  name: 'omniroute',
  baseURL: process.env.OMNIROUTE_BASE_URL!,
  apiKey: process.env.OMNIROUTE_API_KEY,
});
export const model = (mode: string) =>
  router(mode === 'hint' || mode === 'pattern' ? 'logiq-fast' : 'logiq-main');
```
- Env vars `AI_MODEL_MAIN`, `AI_MODEL_FAST` hold the combo names.
- Because the model behind the router **changes between requests**, don't rely on one vendor's native JSON-schema mode:
  1. Prompt for JSON with the schema + one gold example (EXPLANATION-SPEC §5).
  2. Parse and **validate with zod**; on failure retry once with the error appended (the router may pick another model).
  3. Stream text for the UI skeleton; when complete, validate and store the structured object. Partial-object streaming is best-effort, not required.
- Always record `response.model` (the router reports which model answered) → shown as "answered by …" and stored with the explanation.
- If OmniRoute is unreachable → the panel shows "Start OmniRoute" with the command; cached explanations still work.
- Optional later: a direct Gemini key as a last-resort provider if the whole router is exhausted.

## 5. Why this beats the earlier ideas
| Before | Now |
|---|---|
| Hand-written provider chain, cooldown logic, 429 handling | Done by OmniRoute (circuit breaker, cooldown, lockout) |
| One model, possible ~20 req/day cap | Several free pools combined |
| Our code knows each provider SDK | Our code knows one OpenAI-compatible URL |

## 6. Risks specific to OmniRoute
| Risk | Mitigation |
|---|---|
| Young third-party project; provider counts and claims vary by source and are partly maintainer-written; fast-moving versions | Pin version; read release notes before upgrading; keep the base URL swappable so we can point at plain Gemini/OpenRouter in 5 minutes |
| It stores your provider keys and has an admin dashboard | Strong admin password, localhost-only, don't expose the port, keep `.env` out of git; consider Docker |
| Free-tier figures are estimates and change | Treat as bonus capacity, not a guarantee; cache every answer |
| Quality varies between the models it may pick | Show which model answered; "regenerate" button; `priority` order puts the best model first; zod + complexity/dry-run checks catch bad output |
| Small-context model picked for a big prompt | Only put ≥128K-context models in the combos |
| Free providers may train on prompts | Only public DSA problems + your code; never secrets |
| Some providers reject third-party clients or are marked `tos: avoid` | Use only allowed providers; leave excluded ones off |

## 7. If "omni router" meant OpenRouter instead
Use `https://openrouter.ai/api/v1` with model `openrouter/free` (random free model with the needed features) or an explicit `models: [...]` fallback list. Same code as §4 — only base URL and key change. Caveat: its free quota is **account-wide, 20 req/min and 50 req/day** (1,000/day after a one-time $10 credit), so it will not switch away from a daily cap. OmniRoute avoids that by combining several providers.
