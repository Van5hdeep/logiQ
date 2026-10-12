# .planning

Planning docs for **logiQ** — personal DSA helper (browser extension + web app).

## Current proposal: integrated learning, eight phases

Start with [ROADMAP.md](./ROADMAP.md), then [IMPLEMENTATION-CONTRACTS.md](./IMPLEMENTATION-CONTRACTS.md), [THEME-INTEGRATION.md](./THEME-INTEGRATION.md), and [PARTNER-REVIEW.md](./PARTNER-REVIEW.md).

**Status: B1–B3 amended for re-review; implementation is not authorized yet.** These documents describe proposed work against commit `0f806e654efad62547a09472fafd1b148d5d84f8`, with owner review recorded in `c5fd0ef`, not completed features. Phases 01–05 have conditional approval; Phases 06–08 remain deferred. Do not merge until the reviewer records APPROVE PLAN for the agreed scope. Execution also needs the owner's instruction to start.

The eight phase plans in `phases/01-*` through `phases/08-*` are the implementation sequence for this proposal. The original `PLAN.md` and `phase-0-1-tonight.md` remain historical context. Do not revive their superseded database, hosting or AI-gateway suggestions. Existing local JSON storage and direct OpenRouter access remain the baseline.

The proposed dark/page-matching settings are an **optional exception** to D15. Light stays the default for new and existing extension installs and the web vault. A connected learning workspace receives the student's explicitly chosen extension appearance. Start Question keeps the full solution by default; guided modes are extra choices. Results and request costs follow the shared 50-request/day budget and problem-file cache contract. These are plan amendments only.

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
