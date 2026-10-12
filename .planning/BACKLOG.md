# Backlog / Future Ideas

Unscheduled ideas. Move into PLAN.md §8 when promoted to a phase.

## Promotion into the current proposal

The [eight-phase roadmap](./ROADMAP.md) now schedules deterministic visual dry runs, native input playgrounds, guided modes, prompt evaluation, pattern transfer, review and statistics. Full-extension page-matched dark mode, contextual LeetCode integration, custom HTML activities and narrated lessons are also specified there. They remain proposed pending partner review and owner authorization.

Later ideas below remain unscheduled. Legacy runner/database/gateway suggestions are not approved dependencies for this roadmap. In particular, the native labs use local trusted implementations; universal remote judge execution, embeddings databases, external notification services and cloud hosting are outside scope.

## Learning
- [ ] **Run generated code against samples** in a sandbox (Judge0 / Cloudflare Sandbox) and show ✅/❌
- [ ] **Algorithm visualiser** — step-through animation of the dry run (arrays, pointers, stacks, graphs)
- [ ] **Similar problems** from your own library via embeddings + pgvector
- [ ] **Weakness report** — topics with low confidence / many lapses → suggested next problems (Codeforces API by tag+rating)
- [ ] **Pattern cheat-sheets** auto-built from problems you solved
- [ ] **"Explain like an interview"** mode — talk-through script for mock interviews
- [ ] Weekly email/notification digest of due reviews

## Platforms
- [ ] AtCoder, GeeksforGeeks, HackerRank, InterviewBit adapters
- [ ] Import full LeetCode / Codeforces submission history to backfill the library
- [ ] Firefox build + Edge store listing

## Product
- [ ] Export library to Markdown / Notion / Anki
- [ ] Offline mode (IndexedDB cache in extension, sync later)
- [ ] Public share link for a single explanation
- [ ] Multi-user support (RLS policies, quotas) if opened to friends
- [ ] PWA / mobile-friendly review page for revising on the go
- [ ] MCP server exposing your library so Claude can quiz you

## Engineering
- [ ] Observability: token & free-quota usage dashboard, error tracking (Sentry)
- [ ] Prompt eval set: ~30 problems with known complexities, regression-test prompts on model changes
- [ ] Adapter health check — nightly Playwright run against a few live problem pages
- [ ] Host on Vercel + expose OmniRoute via a free Cloudflare Tunnel so the app works without the local web server
