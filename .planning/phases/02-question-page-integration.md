# Phase 02 — Tutor attached to the active question

Status: proposed / not started. Depends on Phase 01. See [contracts](../IMPLEMENTATION-CONTRACTS.md) and [theme integration](../THEME-INTEGRATION.md).

## Student outcome

On LeetCode, logiQ opens beside the exact question being solved. The student sees the correct title, language and attempt context, can launch help near the description, and can move between questions without receiving an answer from another tab.

## File targets

Refactor `apps/extension/lib/page-readers.ts`, `entrypoints/background.ts`, `entrypoints/sidepanel/App.tsx`, `lib/pending.ts`, `lib/api.ts`, `wxt.config.ts` and web `extension-client.ts`. Add `entrypoints/problem.content.ts`, `lib/adapters/{types,leetcode,codeforces,codechef}.ts`, `lib/session-store.ts`, `lib/request-controller.ts`, `components/problem-header.tsx`, `components/page-launcher.tsx`, and fixture/session tests. Extend server `problem-source.ts` to preserve route kind and structured examples.

## Implementation steps

1. **Split platform adapters.** Each adapter implements URL recognition, canonical identity, description/title/examples/constraints capture, editor capture capability, completeness metadata, launcher anchor and future theme signal. Keep selectors local to that adapter. Gym retains its Gym URL. Unsupported routes never guess a problem from a page title.
2. **Add packaged route observation.** Content scripts start only on supported hosts. Use a debounced combination of Chrome URL/tab updates, popstate and scoped DOM changes for same-tab SPA navigation. A packaged MAIN-world observer is allowed only if necessary; it must be narrow and reversible. Record the recognized identity, not arbitrary page payloads.
3. **Own sessions in the background.** Maintain a validated per-tab map in session storage. Activation selects the matching SessionKey. Question changes detach/cancel the prior client wait and restore/start the right session. Tab closure removes only ephemeral state. Generation requests include SessionKey/requestId/revision; reducers discard mismatched completions.
4. **Consume pending opens once.** Vault-to-extension commands include validated ref/solutionId and canonical URL. Load the desired saved solution, acknowledge, remove the pending record, clear badge, and preserve that selection on later refreshes. If Chrome refuses panel opening without a gesture, display the badge fallback without retry loops.
5. **Capture editor context deliberately.** Prefer the focused editor/model and known site language selector. A packaged MAIN-world function returns only code, detected language and capture metadata. Validate and length-limit it in the isolated/background layer. If access fails, show a paste box. Capturing an attempt happens on an explicit action, not on every keystroke.
6. **Mount the contextual launcher.** Inject a small logiQ shadow-root control near the question heading with Open tutor, Hint and Explain my code. Register it once per route; cleanup on detach. Use a dismissible corner fallback if anchors disappear. Do not overlay editor/Run/Submit controls or alter page styles globally. Before Phase 04, unavailable extra modes are disabled or explained; Start Question remains available and explicitly returns the full answer. Clicking Open tutor only opens the panel and does not spend a request.
7. **Expose reliable panel states.** Show the bound question title and language, captured/partial/unavailable context, local connection state and a Cancel action. Detect page language without discarding a manual override. Ask before refreshing a changed code snapshot used by a diagnostic; keep the original attempt immutable.
8. **Add structured capture repair.** Server enrichment reports which fields were obtained and which remain missing. If samples/constraints are incomplete, allow student confirmation or paste fallback. Preserve the problem statement; never use silent truncation as evidence that the complete question was captured.

## Tests and acceptance

- Fixtures cover all three platforms, LeetCode SPA route changes, multiple Monaco models, absent editor, delayed description rendering, malformed pages and Gym routes.
- Start a slow request on A, switch to B, finish A: B remains B; A's saved result becomes available only in A's session.
- Two tabs of the same problem keep independent selected versions/scroll/draft state but share durable records correctly.
- Open solution B from the vault: B loads once; later storage/tab refresh does not force solution A.
- Launcher never duplicates, moves cleanly with route updates and remains keyboard operable. Failed anchor detection provides one usable fallback.
- Manual language override persists for the session; selecting a solution synchronizes language and regenerate target.
- Route/tab changes, capture, Open tutor, theme events and saved-session restoration make 0 provider calls. Start Question remains a separate deliberate full-answer action.
- Local server stopped, extraction fails or site markup changes: header stays honest and pasted context/saved data remain accessible.

## Demonstration and evidence

Use the installed extension on two real LeetCode questions, including same-tab next-question navigation and a mocked delayed provider response. Record session identity before/after switches and a short video/screenshot of the launcher placement. Repeat the extraction smoke flow on Codeforces/CodeChef. Separate offline fixtures from real-site proof.

## Rollback and limits

Feature-flag contextual injection independently of the side panel. Disabling it restores toolbar/Alt+L entry; existing saved sessions remain readable. No automatic editor write, code submission, history import, broad page scraping or remote content-script execution is included.

## Requests per action

Page capture/enrichment, editor snapshot, launcher open, route observation and session restoration cost **0 requests**. A deliberate Start Question uses the shared full-answer cost (cold 1, cached 0, maximum 2 only after repair disclosure). No model request is triggered by navigation. Save result/cache metadata in the problem file and report the provider-spy assertion in the phase SUMMARY.
