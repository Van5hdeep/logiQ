# Backlog / Future Ideas

Unscheduled ideas. Move into PLAN.md §8 when promoted to a phase.

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
