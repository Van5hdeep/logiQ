# Phase 06 — AI-authored interactive HTML activities

Status: **deferred / not approved / not started**. Review after Phases 01–05 have been in use; a separate explicit approval is required. Depends on Phases 01, 03–05. Phase 02 provides the page handoff. Custom activities are optional and must not become required for the first milestone.

## Student outcome

For concepts that need a special visual, the student can ask “Make this interactive”. The saved activity may use HTML, CSS, SVG or Canvas with sliders/buttons and small experiments. It opens in the connected local learning workspace, carries the current problem and theme, and includes a plain-language objective and checkpoint.

## File targets

Add `packages/learning-engine/src/{activity-schema,activity-check}.ts`, `apps/web/src/lib/ai/activity.ts`, `lib/services/activity-service.ts`, `lib/activity-bridge.ts`, `lib/activity-document.ts`, and `components/learning/{activity-host,activity-fallback,activity-toolbar}.tsx`. Extend artifact routes and problem detail. Extension gains only a typed activity summary/launch action; it does not eval or inject generated source into LeetCode.

## Two capability levels

**Default: declarative activity.** Model writes a constrained HTML/CSS visual and declares controls/bindings/checkpoints from a bounded interaction vocabulary. The bundled runtime owns slider/button logic and computation. Parse the document, strip active handlers/scripts/remote resources, namespace IDs, validate permitted elements/styles and mount the result only in the sandbox.

The initial interaction schema is deliberately concrete: controls are `range | select | button`; range controls have finite `min/max/step/initial`, selects have at most 12 explicit options, and buttons name an allowlisted action such as next/reset/toggle. Bindings connect a declared control ID to a declared element/state ID through `set-text | set-width-percent | set-translate | choose-scenario | seek-trace-step`. Numeric transforms are validated scale/offset/clamp operations, not expression strings or `eval`. Canvas/SVG drawings use packaged array/window/graph primitives driven by the same bounded state. Add another primitive only through a schema/runtime version and fixtures; never let the model supply a new privileged function name.

**Optional: free-form JavaScript scene.** Model-authored JS can draw a custom browser visual only after a separate capability review and safety tests. User explicitly launches it in the local web workspace. It receives no extension APIs, local service token, provider key, arbitrary parent functions or vault access. Default deployment can keep this capability disabled while still delivering useful declarative HTML activities.

## Implementation steps

1. **Define the activity envelope.** Store objective, problem/solution/input references, source version, capability level, bounded source, allowed controls, declared activity IDs, fallback explanation and optional checkpoint IDs. A title/slider alone is insufficient; every interaction must change an observable concept state.
2. **Build the generation prompt.** Supply the relevant concept, validated trace/invariant, requested interaction, semantic tokens, allowed primitives, limits and an example. Request source plus metadata in one response, not a multi-call build pipeline. One cold generation costs 1 request; at most 1 format repair is allowed only after disclosing maximum 2. Save complete validated source/metadata in the problem file. Failed generation preserves existing content and cannot trigger another request from replay.
3. **Construct isolated documents.** Use `iframe sandbox="allow-scripts"` without same-origin, popups, top navigation, downloads or form privileges. Restrict document CSP: default none, no connections, no external frames/assets, controlled inline styling/scripts inside the sandbox only, and bounded data images if needed. Escape injected metadata/theme values and prevent an authored document from removing or preceding the policy.
4. **Implement a narrow bridge.** Host checks `event.source`, protocol, declared activity ID, allowed fields, serialized byte limit and rate. Child messages are ready/resize/error/activity only. Deduplicate event IDs; clamp height; reject unknown RPC. Parent sends theme/reduced-motion/state snapshots and reset commands. Reconnect/remount discards stale session events.
5. **Separate proof from reporting.** Activity completion events record participation. Grade trusted checkpoints in host code; never accept a child-supplied perfect score as mastery. Do not copy arbitrary child objects into stored records.
6. **Bound work and recover.** Computation in the declarative runtime runs in a terminable worker with input/step/time limits. Host timeout can recover from missing ready/message floods. Free-form drawing JS inside an iframe does not have a guaranteed CPU isolation boundary: same-process infinite loops may freeze the page before a watchdog can run. Do not claim otherwise. Keep JS scenes opt-in/disabled until the chosen browser isolation strategy and manual recovery behavior are demonstrated.
7. **Integrate the experience.** Preview objective and Launch activity near the explanation. Host owns title/return/Reset/text/checkpoint. Input edits, reset and theme updates use cached source plus declared local interactions only. If input-specific generated content is stale, use native/text fallback and offer a separately labelled Regenerate action; never invoke it automatically. Canonical source/result lives in the problem file; artifacts resolve that cache and reopen at 0 requests.

## Requests per action

Explicit Generate/Regenerate activity costs **1 request**, maximum **2** only with a disclosed bounded repair. Cached launch/reopen, control changes, replay, seeking, input edits, Reset and theme changes cost **0**. Input-triggered stale states cannot regenerate. Record problem-file cache location and cold/cache/repair counts in the phase SUMMARY if this phase is later approved.

## Tests and acceptance

- Normal slider/button activities manipulate a real concept: window width, pointer distance, map collision illustration or comparison counts.
- Invalid source, event handlers in declarative mode, external fetch/image/frame attempts, local API calls and parent navigation cannot obtain privileged data or alter the parent workflow.
- Foreign-window events, spoofed protocol, extra fields, oversized payloads, replayed completion and floods are rejected.
- Missing ready, script error and invalid height show bounded error/fallback UI; Reset restores a clean bridge session.
- Generated colors cannot inject CSS/markup or bypass theme normalization; light/dark controls remain readable.
- Participation events cannot create verified checkpoint success. Changed solution/input hash cannot reuse old checkpoint credit.
- Packaged extension contains no generated eval path. Real Chrome CSP behavior is tested separately from mocked iframes.
- Provider-spy tests assert **0 calls** on cached launch/reopen, replay, seek, input/slider edits, Reset, theme changes and stale/error fallback. Source survives restart in the problem file; generation/repair stays within the disclosed maximum and shared daily budget.

## Demonstration and exit gate

Create a declarative window-size activity from a saved problem, drag its slider, answer its host checkpoint, reset, close and reopen. Demonstrate a rejected malicious fixture and unchanged vault record. The partner separately decides whether optional JS scenes meet the capability gate; otherwise ship the declarative feature and stage-based lessons only.

## Technical constraints and rollback

Use the web learning page for custom executable content. Chrome MV3 logic must remain packaged; declaring a sandbox does not grant a blanket Web Store-policy exemption. Verify distribution separately before extending this to the side panel. Keep activity feature flags and preserve plain content when disabled.

References: [Chrome extension security and packaged logic](https://developer.chrome.com/docs/extensions/develop/migrate/improve-security), [declared extension sandbox pattern](https://developer.chrome.com/docs/extensions/how-to/security/sandboxing-eval). These support execution boundaries; final generated-code distribution policy still requires implementation review.
