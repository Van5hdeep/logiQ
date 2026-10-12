# logiQ: working notes

Personal DSA helper: Chrome extension + web app (the vault). Plan and specs are in `.planning/`
(start with `.planning/README.md`).

## UI rule (important)
All UI, now and in the future, follows **`.planning/DESIGN-SYSTEM.md`**: white-only theme (no dark mode, no black
surfaces), white frame, 28px cards with soft tints and rainbow accent bars on top, pill controls,
Plus Jakarta Sans, tone meaning (mint solved, butter attempted, peach revisit, sky info, lilac featured). Build from `apps/web/src/components/ui/*`.
Never introduce a different visual style, raw hex colours, or new fonts. The extension side panel
uses the same tokens.

## Stack and commands
- pnpm workspace: `apps/web` (Next.js 16, Tailwind 4), `apps/extension` (WXT, to build), `packages/shared`.
- `pnpm dev` (http://localhost:3000), `pnpm typecheck`, `pnpm lint`, `pnpm build`.
- Next.js here has breaking changes vs older versions: read `apps/web/node_modules/next/dist/docs/`
  before using framework APIs. `cacheComponents` is on: avoid runtime APIs/dates during render without Suspense.

## Other conventions
- Zero-cost constraint: free tiers or local only. Secrets only in `.env*` (git-ignored).
- AI goes straight to OpenRouter free models (`apps/web/src/lib/ai/`), model chosen on `/models`; see the top of `.planning/AI-ROUTING.md`. Outputs follow `.planning/EXPLANATION-SPEC.md`. `OPENROUTER_API_KEY` lives only in `apps/web/.env.local`.
- Storage: no database. One JSON file per problem in `<vault>\<platform>\<number>-<name>.json` via `apps/web/src/lib/store.ts`. The vault folder is chosen on the Settings page and resolved by `lib/storage-location.ts` (`LOGIQ_DATA_DIR` env > `~/.logiq/config.json` > `~/Documents/logiQ`). The owner's vault is `C:\Vanshdeep\DSA`. Settings (model, language) live in `settings.json` inside the vault.
- Extension (`apps/extension`, WXT): side panel talks to `http://localhost:3000/api/*` (CORS allows only its fixed id `hfflkpmhfebkhdgbagopjkmkelgoaobo`). Build the zip with `pnpm ext:zip`; the vault's "Get extension" page serves it.
