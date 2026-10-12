# Phase 03 — Full-extension dark mode matched to the page

Status: proposed / not started. Depends on Phases 01–02. Authoritative detailed appearance contract: [THEME-INTEGRATION.md](../THEME-INTEGRATION.md).

## Student outcome

When LeetCode is dark, every logiQ extension surface uses compatible dark neutrals, readable code and a restrained action accent. When the page is light, logiQ follows it. The student can override this with Light or Dark and keep the choice across sessions.

## File targets

Add `packages/shared/src/theme.ts`, extension `lib/theme.ts`, `components/theme-provider.tsx`, `components/theme-menu.tsx`, and adapter theme observers. Modify `entrypoints/sidepanel/style.css`, `components/ui.tsx`, `components/solution-view.tsx`, `components/chat-card.tsx`, panel initialization, background session events and launcher styles. Add a scoped web-learning theme boundary; update `CLAUDE.md` and the design system during implementation to remove conflicting extension light-only instructions.

## Implementation steps

1. **Create semantic tokens.** Define light/dark scheme, preference, resolved palette, detection confidence, page/session identity and reduced-motion. Separate neutral surfaces, text levels, border, code gutter, line highlight, disabled, focus and semantic status colors. Replace the accent literals in `components/ui.tsx` with token references.
2. **Capture the reference.** On real LeetCode light/dark question pages, inspect allowed root markers and computed description/editor colors. Save sanitized measurements and screenshots in test fixtures; approve exact fallback palette centrally. Candidate colors in the theme spec are not asserted as live-site values.
3. **Implement match-page resolution.** Read validated signals from the active adapter; normalize color values, resolve alpha and reject bad samples. Debounce scoped root changes. Respect manual overrides and use OS/fallback only when page evidence is unavailable. Tag events by active session to reject stale-tab recoloring.
4. **Prevent initial flashes.** Load preference and latest resolved palette before mounting visible panel content. Apply `data-theme`, `color-scheme` and token values at the extension root. Use a compatible neutral skeleton if page resolution is pending. Disconnected/local-error UI still has a resolved theme.
5. **Restyle the entire extension.** Cover native selects/textareas, focus/hover/pressed states, loading/errors/empty states, saved-version chips, code/notes/chat and future lab/player controls. Replace bright pastel fills with semantic dark tints. Keep logiQ logo small, reduce large rainbow bars in page-matched mode, and use compact page-like spacing/radii.
6. **Theme injected UI safely.** Shadow-root launcher receives the same resolved palette and packaged styles. Do not paste host CSS into the shadow tree. Preserve text contrast and avoid overlays on host controls.
7. **Carry appearance into wide learning view.** User-opened workspace receives a safe theme snapshot through a validated handshake, scoped to its boundary. It includes title/platform/return action. The vault remains light by default. No pairing token appears in the URL or artifact payload.
8. **Document the exception.** During execution update root/style instructions to make extension + explicitly opened learning workspace dark support unambiguous. The old light design remains the vault default, not a blocker for this approved feature.

## Tests and acceptance

- Unit tests cover preference precedence, valid/invalid colors, light page with dark OS, dark page with light OS and unknown markers.
- Two tabs with different page schemes: activating each updates once; late inactive-tab events are ignored.
- Manual Dark survives reload and site theme change; selecting Match this page resumes observation.
- Screenshot matrix covers idle, loading, error, chat, saved code, line highlight and selector states at 320/400/600 px. Later phases add their own states to the same matrix.
- No bright flash during panel open, reconnect, route switch or saved-solution load. All native controls use the resolved scheme.
- Normal text meets 4.5:1 contrast target; keyboard focus and applicable component boundaries meet 3:1. At 200% zoom, controls remain usable; reduced motion removes unnecessary transitions.
- Real-site evidence shows panel/launcher colors beside LeetCode's rendered surfaces, not only screenshots from a mock page.

## Demonstration and exit gate

Open a dark LeetCode question, toggle the host to light, then select manual Dark. Navigate to another problem and reopen the extension. Demonstrate saved-code/chat/error states and a web learning view retaining the intended theme. Partner reviews visual consistency and readability before accepting this phase.

## Rollback and exclusions

Store preference independently of the vault. Disabling detection uses a known palette/manual mode, never arbitrary color copying. Preserve the existing light fallback. No full-vault redesign, global host CSS replacement, copied proprietary icons or new font downloads are required.
