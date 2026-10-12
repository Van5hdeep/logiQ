# logiQ design system

> Planned extension/workspace exception, 2026-10-13: the new roadmap proposes **Match this page / Light / Dark across the entire extension**, including LeetCode-compatible dark surfaces and a connected web learning view. See [THEME-INTEGRATION.md](./THEME-INTEGRATION.md) and [Phase 03](./phases/03-page-matched-dark-mode.md). This explicit scope replaces the extension's light-only restriction when execution is authorized. The current web vault retains the light default and existing design rules. The exception is proposed, not implemented.

> **Every new screen and component follows this. Do not introduce a different style.**
> Source: three reference dashboards (soft pastel learning plan, dark glass finance dashboard,
> light neumorphic wallet). We took structure, colour logic and type feel only.
> Revised 2026-10-12: white-only theme with rainbow accents on containers (the black frame and dark mode were too harsh).
> Tokens live in `apps/web/src/app/globals.css`; primitives in `apps/web/src/components/ui/`.

## 1. What we took from the references
| Reference | Borrowed idea |
|---|---|
| Learning plan (light) | Device frame (now white) with a centred pill nav; soft off-white canvas; big pastel cards; right rail panel; large bold page title; pastel stat tiles incl. one dashed tile; "superscript count" headings; circular icon buttons; one highlighted card in a stronger tint |
| Finance dashboard | Translucent bar chart with one highlighted bar; small badge pills; superscript counts (its dark navy look was dropped) |
| Wallet (light) | White cards on light grey with soft shadow; black active pill, white inactive pills; circle icon buttons; thin, rounded charts |

## 2. Layout
```
┌ page background (very light grey-blue #f6f7fb) ───────────────────────────┐
│ ┌ white frame, radius 36, hairline border + soft shadow ───────────────┐ │
│ │ TopNav (white): logo   [ Vault  Patterns  Review  Stats  Settings ]  user │
│ │ ━━━━━━━━━━━━━━━━ rainbow hairline ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│ │ ┌ main (white) ───────────────────────────────────┬ rail (340px) ─┐ │ │
│ │ │ big title + search · stat tiles · filters       │ Review today  │ │ │
│ │ │ cards grid                                       │ This week     │ │ │
│ │ └──────────────────────────────────────────────────┴───────────────┘ │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
```
- **Light theme only.** The app stays white even when the OS is in dark mode (no dark variant, `color-scheme: light`). Never add `dark:` classes or a dark palette without an explicit decision.
- No black surfaces anywhere: nav, frame and active states are white / soft tints.
- Frame only on `md+`; on phones it is full-bleed, nav becomes a scrolling pill row.
- Rail only on `xl+`. It shows "what needs me today" (review queue, weekly activity).
- Page structure inside main: **title row (h1 + search)** → **stat tiles** → **filters + view toggle** → **content cards**.
- Max app width 1480px. Gaps: 12–16px between cards, 32px (`gap-8`) between sections.

## 3. Colour
Surfaces: page `#f6f7fb`, canvas/cards `#ffffff`, rail `#fafafd`, chips `#f3f4f8`, hairlines `#ececf3`.
Text `#1f2140`, muted `#7b7e99`. Brand indigo `#5b4bff`, accent teal `#19c3a6`.

**Soft tints** (pill, tile and card backgrounds; always the token, never a raw hex): `mint`, `lilac`, `butter`, `sky`, `peach`.
**Rainbow accents** on containers: every card / tile gets a 4px rounded bar along its top edge (`AccentBar`).
The bar colour follows the tone; hero containers use the full rainbow gradient (`accent="rainbow"`).
Rainbow order: rose → orange → yellow → green → sky → indigo → violet (`--rainbow`, `RAINBOW_COLORS`).

Meaning is consistent everywhere:
| Tone / accent | Means |
|---|---|
| mint / green | solved / success / easy |
| butter / yellow | attempted / in progress / medium |
| peach / orange | revisit / needs attention / hard |
| sky / blue | neutral info, totals |
| lilac / violet | highlight / "latest" / featured |
| rainbow | hero or summary container (weekly chart), the nav hairline |

Rules: one featured (lilac) card at most per list; text is always `text-foreground`;
colour is never the only signal (labels and icons accompany it); keep tints light so large areas stay gentle.

## 4. Typography
- **Plus Jakarta Sans** everywhere (`--font-jakarta`); Geist Mono for code only.
- Page title (h1): 36px, 44px on `md+`, weight 600, tracking tight.
- Card/rail title (h2/h3): 20px, weight 600, tracking tight. Card item titles: 20px/leading-tight.
- Body 14px; meta/labels 12px; muted colour for secondary text.
- Counts sit as a superscript after titles: `My Vault ⁷` (`SectionTitle count={…}`).
- Only weights 400, 500, 600. Sentence case.

## 5. Shape & elevation
- Cards `rounded-card` (28px); tiles `rounded-tile` (22px); nested boxes inside cards 22px; chips/pills/buttons fully round.
- Every card: white or soft tint, 1px hairline border (`border-line`), soft shadow (`shadow-card`), rainbow top bar.
- Dashed outline (`<Card dashed>` / `<StatTile dashed>`) = empty, secondary or "upcoming" slot.
- Charts: rounded bars (`rounded-xl`), translucent brand colour, today/selected bar solid brand. Donuts and thin progress bars follow the same rounding.

## 6. Components (build from these, extend them, don't bypass them)
| Component | File | Use |
|---|---|---|
| `Card` (`tone`, `accent`, `dashed`, `as`) | `ui/card.tsx` | Every surface. Default padding 20px; add `pt-6` so content clears the accent bar |
| `Pill` (`tone`, `icon`) | `ui/pill.tsx` | Static labels: status, difficulty, patterns |
| `Button` (`variant` primary / soft / ghost, `icon`) | `ui/button.tsx` | Actions. primary = solid indigo main action, soft = tinted secondary, ghost = quiet grey |
| `FilterPill` (`active`) | `ui/pill.tsx` | Toggle filters. Active = soft indigo tint with indigo text |
| `IconButton` / `iconButtonClass` | `ui/icon-button.tsx` | 36px circles for actions |
| `SectionTitle` (`count`, `as`) | `ui/section-title.tsx` | All headings |
| `StatTile` (`tone`, `dashed`) | `ui/stat-tile.tsx` | Big-number summaries |
| `SearchPill` | `search-pill.tsx` | The only search field style; `/` focuses it |
| `TopNav` | `top-nav.tsx` | White bar with pill navigation and rainbow hairline |
| `Logo` / `LogoMark` | `logo.tsx` | Scholar-node mark |
| `AiErrorNotice` | `ai/ai-error-notice.tsx` | Peach notice for AI failures; links to /models when switching can help |
| `ModelCard` | `models/model-card.tsx` | Reference for a card with title + badges, two actions and an inline result |
| `ProblemCard` | `vault/problem-card.tsx` | Reference for a feature card (title, platform badge circle, pills, footer actions) |

## 7. Interaction & states
- Hover: pills darken text, icon buttons turn soft indigo (`bg-brand-soft text-brand`). No scale or glow effects.
- Focus: `focus:ring-2 focus:ring-brand/40` on inputs; keep visible outlines on buttons/links.
- Empty state: a dashed `Card` with one plain sentence and the next action.
- Loading: skeleton blocks using `bg-chip` with the same radii as the real content.
- Filters/toggles use `aria-pressed`; groups use `role="group"` + `aria-label`.

## 8. Do / don't
- ✅ New pages: title row → tiles → filters → cards; use pastel tones by meaning; reuse primitives.
- ✅ Add a new reusable look? Add it to `components/ui/` and to the table above first.
- ❌ No sharp corners, no dark/black surfaces, no raw hex colours, no new fonts, no heavy shadows, no gradients except the rainbow accent bar/hairline and the avatar.
- ❌ No emoji as icons; use lucide icons (16–18px inline).

## 9. Applying it to upcoming screens
| Screen | Shape |
|---|---|
| Problem detail | Title row; left: explanation sections as stacked white cards (insight card lilac); right rail: complexity card (sky), pattern pills, notes |
| Explanation side panel (extension) | Same tokens in a narrow column: header card, mode `FilterPill`s, section cards, dashed card while loading |
| Patterns | Pastel tile grid, one tile per pattern with solved count and a thin progress bar |
| Review | One large card per question, rating buttons as pills (Again/Hard/Good/Easy in peach/butter/sky/mint) |
| Stats | Stat tiles, translucent bar chart, donut for difficulty split, heatmap in mint intensities |
| Settings | Stacked white cards with labelled rows and circle icon buttons |
