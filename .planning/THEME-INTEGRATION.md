# Page matching and extension dark mode

Status: proposed, to be implemented in Phase 03. The requested dark mode is explicit new product scope. It replaces the old extension light-only restriction once implementation is authorized; it does not automatically redesign the existing web vault.

## Appearance contract

The entire extension exposes one preference: **Match this page / Light / Dark**. New installs default to Match this page. Preference is saved in extension storage and applied before React paints. Manual choice persists across tabs. “Match this page” follows the active supported problem page; if no trustworthy signal exists, use the OS scheme and identify the fallback in Settings.

All extension-owned UI participates: launcher/popover, side panel header, controls, question summary, hints, code, line highlights, chat, errors, loading skeletons, selectors, menus, empty states, labs, lesson controls and captions. No white-only card, hardcoded bright pastel, white gradient or dark text can survive in dark mode. Native controls use matching `color-scheme`.

## Detection and synchronization

1. The LeetCode adapter observes known root theme attributes/classes and a small stable ancestor set. It does not assume OS dark means the page is dark.
2. Read computed colors from vetted description/editor surface selectors. Resolve alpha against known parent surfaces and normalize to finite RGBA; reject transparent, unreadable, unusual or missing samples. Send a tiny theme snapshot, never CSS text or selectors supplied by the page.
3. If markers and observed surfaces disagree, favor the coherent rendered surface signal with a recorded confidence. Use a maintained neutral fallback rather than copying arbitrary styles.
4. Observe root mutations, route changes, visibility/focus and system scheme only as needed. Debounce changes (initial target 100 ms) and do not observe every editor keystroke or every page subtree mutation.
5. Tag events by SessionKey/page revision. A background event from another tab cannot recolor the active panel. Unsubscribe/reconnect when supported route or tab ownership changes.
6. Cache the latest resolved theme before panel mount; apply `data-theme` and the semantic token map before first visible content. If unavailable, render a matching neutral skeleton until theme resolution completes.

Host color names and values can change. The numerical palette below is a **candidate fallback**, not a claim about current LeetCode CSS. During implementation capture the real site's light and dark computed styles and screenshots, then approve/update these centralized fallback values.

| Semantic token | Candidate dark value | Purpose |
|---|---|---|
| `--page` | `#1a1a1a` | Panel canvas next to the host |
| `--card` | `#262626` | Raised description-like surface |
| `--chip` | `#303030` | Controls and code inset |
| `--line` | `#3d3d3d` | Subtle separators |
| `--foreground` | `#eff1f6` | Main text |
| `--muted` | `#a4a4ad` | Secondary text, contrast checked |
| `--brand` | `#ffa116` | Restrained host-compatible action accent |
| `--brand-soft` | `#3b2e1e` | Active hint/step background |

Define separate foreground/background/border triples for success, warning, error and info. Existing mint/lilac/butter/sky/peach roles become deep tints in dark mode with compatible text; do not invert light colors algorithmically. Tokens are centralized, never literal colors inside components. Tone meaning remains consistent across themes.

## Integrated layout

- On LeetCode, favor neutral description-like surfaces, thin separators, a quiet problem header and compact section cards. Replace large rainbow hero bars in the panel with a small brand marker; preserve recognizable logiQ identity without making it a separate dashboard.
- Use a 12–14 px UI baseline, compact padding, 8–12 px panel tile corners, monospace code and clear focus indicators. Keep full vault typography/layout unchanged. Record exact implemented values in the design system.
- Provide a compact launcher near the question heading with “Hint”, “Explain my code” and “Open tutor”. Mount extension UI in a shadow root with packaged styles. Use a floating, dismissible fallback if the anchor is unavailable; never cover Run/Submit/editor controls.
- Do not globally alter LeetCode styles, install fonts into its document, replace its editor or emulate a judge-owned button. Label the launcher logiQ.
- Narrow panel: one column with section navigation. Wide web learning view: code/explanation and trace may share a split layout. The optional wide view is clearly a connected workspace, with title/platform/return action always visible.

## Theme across surfaces

The extension remains preference owner. A user-initiated “Open learning workspace” sends a validated theme choice and safe token snapshot through a setup/navigation handshake. No bearer secret goes in a URL. The learning view stores the resolved snapshot for this workspace/session and renders an early theme boundary. Reopened standalone learning views use their last explicit preference or a local setting; the vault retains its light default.

Sandboxed activities receive only normalized semantic colors, reduced-motion and scheme, never raw host CSS. Packaged code renderers and lesson stages use the same tokens. A custom “own style” artifact must still keep readable host controls and an accessible text alternative.

## Acceptance matrix

- LeetCode dark + Match this page: entire panel and launcher are dark; expected surfaces match observed page colors.
- LeetCode light + Match this page: panel follows light even when the OS is dark.
- Manual Light/Dark: stable across navigation and reload; returns to host matching only when the student selects it.
- Two tabs with different schemes: activating each chooses its correct page theme; late events do not overwrite it.
- Unknown/unsupported theme signal: graceful OS/fallback with usable contrast; no sampled arbitrary CSS execution.
- Loading, disconnected server, quota error, regenerated solution, chat, lab and cinema lesson: no unthemed islands or bright flashes.
- 320, 400 and 600 px panel widths: no horizontal page overflow; only code/table areas scroll where necessary.
- Keyboard focus, 200% zoom, reduced motion and contrast: normal text target 4.5:1, large text/UI boundary target 3:1 where applicable.

Save a screenshot matrix using the installed extension on real LeetCode light/dark pages. Local fixture screenshots are CI evidence, not a replacement for those host checks.

## Files and instruction reconciliation

Update `apps/extension/entrypoints/sidepanel/style.css`, `components/ui.tsx`, `components/solution-view.tsx`, `components/chat-card.tsx`, and every subsequent renderer through tokens. Add `lib/theme.ts`, `components/theme-provider.tsx`, `components/theme-menu.tsx`, and content-adapter theme observers. Scope new web workspace CSS to a dedicated boundary in `apps/web/src/app/globals.css`.

During authorized Phase 03 execution, update the light-only instructions in `CLAUDE.md` to document this explicit extension/workspace exception. This planning branch does not edit application or root instruction files.

Technical reference: [Chrome content-script isolation](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts). Exact host selectors/palette are implementation evidence to collect, not facts assumed from this document.
