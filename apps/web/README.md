# @logiq/web

The logiQ web app and local API (Next.js). See the [main README](../../README.md) for setup.

- `src/app`: pages (Vault, Models, Settings, Extension) and API routes under `src/app/api`
- `src/lib`: file storage (`store.ts`, `storage-location.ts`), AI calls (`ai/`), problem fetching
- `src/components`: UI, built on the primitives in `components/ui` (rules: `.planning/DESIGN-SYSTEM.md`)

Needs `OPENROUTER_API_KEY` in `.env.local` (copy `.env.example`).
