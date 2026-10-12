# .planning

Planning docs for **logiQ** — personal DSA helper (browser extension + web app).

## Current proposal: integrated learning, eight phases

Start with [ROADMAP.md](./ROADMAP.md), then [IMPLEMENTATION-CONTRACTS.md](./IMPLEMENTATION-CONTRACTS.md), [THEME-INTEGRATION.md](./THEME-INTEGRATION.md), and [PARTNER-REVIEW.md](./PARTNER-REVIEW.md).

**Status: ready for partner review; implementation is not authorized yet.** These documents describe proposed work against commit `0f806e654efad62547a09472fafd1b148d5d84f8`, not completed features. Execution starts only after the partner's review is accepted and the owner authorizes implementation.

The eight phase plans in `phases/01-*` through `phases/08-*` are the implementation sequence for this proposal. The original `PLAN.md` and `phase-0-1-tonight.md` remain historical context. Do not revive their superseded database, hosting or AI-gateway suggestions. Existing local JSON storage and direct OpenRouter access remain the baseline.

The requested extension dark mode is a proposed scoped replacement for D15's extension light-only rule. The web vault keeps its current default appearance; the extension and a web learning workspace explicitly opened from it share a matching theme. This proposal documents that decision without changing application code.

| File | Purpose |
|---|---|
| [ROADMAP.md](./ROADMAP.md) | Current eight-phase implementation proposal and dependency order |
| [IMPLEMENTATION-CONTRACTS.md](./IMPLEMENTATION-CONTRACTS.md) | Identity, versioning, API, storage, artifacts and progress contracts |
| [THEME-INTEGRATION.md](./THEME-INTEGRATION.md) | Full-extension dark mode, page theme matching and embedded UI rules |
| [PARTNER-REVIEW.md](./PARTNER-REVIEW.md) | Review checklist, decisions and implementation approval gate |
| [PLAN.md](./PLAN.md) | Historical initial plan; superseded choices are not the current architecture |
| [EXPLANATION-SPEC.md](./EXPLANATION-SPEC.md) | What every AI answer must contain: modes, section order, schemas, prompt, checks (based on algo-sensei + leetcode-helper research) |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | UI rules: layout, colours, type, components. All UI follows this |
| [AI-ROUTING.md](./AI-ROUTING.md) | OmniRoute setup, combos, code, risks |
| [phases/phase-0-1-tonight.md](./phases/phase-0-1-tonight.md) | Tonight's build checklist |
| [DECISIONS.md](./DECISIONS.md) | Decision log (lightweight ADRs) |
| [BACKLOG.md](./BACKLOG.md) | Future ideas not yet scheduled |
| `phases/01-*` ... `phases/08-*` | Detailed proposed tasks, file targets, tests and acceptance gates |

Workflow: when a phase starts, write `phases/phase-N-*.md` with tasks + acceptance criteria; log choices in DECISIONS.md; move ideas from BACKLOG into PLAN when promoted.
