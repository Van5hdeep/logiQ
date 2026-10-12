# Phase 03 — Full-extension dark mode matched to the page

Status: proposed / not started. Depends on Phases 01–02. Authoritative detailed appearance contract: [THEME-INTEGRATION.md](../THEME-INTEGRATION.md).

## Student outcome

**Light stays the default for new and existing installs**, even on a dark LeetCode page or a dark OS. The student can opt into Match this page or Dark; after that explicit choice every extension surface uses compatible colors and preserves the preference across sessions. This is an optional exception to D15, not a replacement for its default.

## File targets

Add `packages/shared/src/theme.ts`, extension `lib/theme.ts`, `components/theme-provider.tsx`, `components/theme-menu.tsx`, and adapter theme observers. Modify `entrypoints/sidepanel/style.css`, `components/ui.tsx`, `components/solution-view.tsx`, `components/chat-card.tsx`, panel initialization, background session events and launcher styles. Add a scoped web-learning theme boundary; update instructions during implementation to document the optional exception while preserving Light as the default.

## Implementation steps

1. **Create semantic tokens.** Define light/dark scheme, preference, resolved palette, detection confidence, page/session identity and reduced-motion. Separate neutral surfaces, text levels, border, code gutter, line highlight, disabled, focus and semantic status colors. Replace the accent literals in `components/ui.tsx` with token references.
2. **Capture the reference.** On real LeetCode light/dark question pages, inspect allowed root markers and computed description/editor colors. Save sanitized measurements and screenshots in test fixtures; approve exact fallback palette centrally. Candidate colors in the theme spec are not asserted as live-site values.
3. **Implement opt-in match-page resolution.** Missing/invalid/legacy preference resolves to Light, never OS or host Dark. Only an explicit Match this page selection enables host observers and OS fallback. Normalize color values, resolve alpha and reject bad samples; debounce scoped root changes and reject stale-tab recoloring. Explicit Dark is fixed, independent of host updates.
4. **Prevent initial flashes.** Load preference before visible panel content; default Light applies immediately. Apply `data-theme`, `color-scheme` and token values at the root. Only opted-in matching waits for page resolution using a compatible cached skeleton. Disconnected/local-error UI still respects the stored preference.
5. **Restyle the entire extension.** Cover native selects/textareas, focus/hover/pressed states, loading/errors/empty states, saved-version chips, code/notes/chat and future lab/player controls. Replace bright pastel fills with semantic dark tints. Keep logiQ logo small, reduce large rainbow bars in page-matched mode, and use compact page-like spacing/radii.
6. **Theme injected UI safely.** Shadow-root launcher receives the same resolved palette and packaged styles. Do not paste host CSS into the shadow tree. Preserve text contrast and avoid overlays on host controls.
7. **Carry appearance into wide learning view.** User-opened workspace receives the explicitly selected preference and safe snapshot through a validated handshake. Light remains Light even beside dark LeetCode. Include title/platform/return action; vault and standalone workspace stay Light without an explicit choice. No pairing token appears in the URL or artifact payload.
8. **Document the optional exception.** During authorized execution update root/style instructions to allow opted-in matching/Dark while preserving D15's Light default for the extension and vault. This plan amendment is not a reviewer approval or a runtime change.

## Tests and acceptance

- Unit tests cover preference precedence, valid/invalid colors, light page with dark OS, dark page with light OS and unknown markers.
- Fresh install and existing-install migration on dark LeetCode with dark OS: the entire extension, launcher and connected workspace remain Light until the student opts in.
- Missing, invalid or legacy stored preference initializes Light. Explicit Match this page / Dark persists across reloads and covers every panel state.
- With matching opted in, two tabs with different page schemes update correctly; with default Light, neither activation nor late events can recolor the panel.
- Manual Dark survives reload and site theme change; selecting Match this page resumes observation.
- Screenshot matrix covers idle, loading, error, chat, saved code, line highlight and selector states at 320/400/600 px. Later phases add their own states to the same matrix.
- No bright flash during panel open, reconnect, route switch or saved-solution load. All native controls use the resolved scheme.
- Normal text meets 4.5:1 contrast target; keyboard focus and applicable component boundaries meet 3:1. At 200% zoom, controls remain usable; reduced motion removes unnecessary transitions.
- Real-site evidence shows panel/launcher colors beside LeetCode's rendered surfaces, not only screenshots from a mock page.
- Provider-dispatch spy records **0 calls** through initial load, migration, all preference switches, host theme changes and workspace handoff.

## Demonstration and exit gate

Fresh-install the extension on dark LeetCode and verify Light. Explicitly select Match this page, toggle the host to light, then select Dark. Navigate/reopen and demonstrate saved-code/chat/error states and the chosen workspace appearance. Partner reviews default preservation, opt-in persistence and readability before accepting this phase.

## Rollback and exclusions

Store preference independently of the vault. Disabling detection uses a known palette/manual mode, never arbitrary color copying. Preserve the existing light fallback. No full-vault redesign, global host CSS replacement, copied proprietary icons or new font downloads are required.

## Requests per action

Every theme action costs **0 model requests**. Preference changes, host sampling, root mutations and handoff are local; they cannot generate or refresh explanations. Include the 0-call test and opt-in/default screenshot matrix in the phase SUMMARY.
