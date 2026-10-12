# Phase 07 — Code-authored narrated concept lessons

Status: proposed / not started. Depends on Phase 05 and the Phase 06 bridge/security contract. Native stage-only lessons must work with free-form activity JS disabled.

## Student outcome

The student presses “Watch explanation” and gets a short animated lesson explaining the concept and a dry run of the selected input. It has narration, captions, pause, speed, scene navigation and seek. They can stop at a step, inspect state or switch back into interactive exploration.

## File targets

Extend `packages/learning-engine/src/` with `lesson/{schema,check,narration,timeline,clock,stage,captions,narrator}.ts`. Add web `lib/ai/lesson.ts`, `lib/services/lesson-service.ts`, and `components/learning/video/{lesson-player,lesson-stage,script-scene,transcript,playback-controls}.tsx`. Extend artifact/detail routes and extension lesson preview. Keep the engine independent of React/Next; web components own DOM rendering and browser speech.

## Lesson contract

A lesson has title, objective, level, language, source artifact/input hashes and ordered scenes. Each scene has ID/title/narration, cue markers, trace-step references, actors and cue-triggered actions. Initial actors: array cells, pointers, map entries, queue items, labels, arrows and code highlights. Actions: enter, leave, move, highlight, update value, connect and focus. Validate scene/actor/cue IDs and all references.

Target 45–120 seconds for one concept, typically 3–6 scenes; hard cap 12 scenes and 5-minute estimate. Narration is user-facing explanation, not generated implementation notes. Audio playback is optional. Output is an in-browser motion lesson; downloadable MP4 is outside this phase.

## Implementation steps

1. **Build deterministic lesson validation.** Strict schemas, bounded source/text, cue reference checking, trace result consistency, valid source-line mapping and no orphan actors. Store lint warnings separately from blocking errors. Reject scenes that contradict verified trace states instead of animating them plausibly.
2. **Generate storyboards from evidence.** Use the selected concept/invariant and validated trace as input. Suggested sequence: what we need → what brute force repeats → key idea → dry run → important edge case → takeaway/checkpoint. Model chooses narration and presentation; trusted trace remains the state authority.
3. **Implement a host clock.** One clock controls play/pause/seek/rate/scene position. Stage frames are computed from absolute scene time and validated data. Reconstruct on seek, do not replay accumulating DOM mutations. Keep visual time and narration cues linked through a typed timeline.
4. **Add narrator adapters.** Browser speech synthesis where available, plus a timed silent narrator for captions-only playback. Handle missing voices, delayed voice list, utterance cancellation, background-tab interruptions and stalled speech. If precise word boundaries are unavailable, use estimated cue positions and mark the timing fallback. Do not call estimated captions word-exact proof.
5. **Render native scenes.** SVG/DOM stage consumes frame state, semantic theme colors and reduced-motion. Array/map/queue visuals share trace semantics with Phase 05. Code highlights use verified mapping only. Caption panel and transcript remain selectable text and accessible outside graphics.
6. **Support optional script visuals carefully.** Use Phase 06 capability rules and the same host-owned clock/bridge. Scripts receive time, fired cues and safe state; they cannot own narration or invoke APIs. If optional JS remains disabled, use the native stage fallback and retain the scene explanation.
7. **Connect viewing and doing.** A scene can pause at a trusted checkpoint. “Explore this step” opens the native trace player at the linked step/input. Wrong prediction offers replay/explanation, not a solved status. When input or solution changes, mark the lesson stale and regenerate deliberately.
8. **Persist and display.** Cache by trace/engine/prompt versions. Show Generate lesson once, then Play saved lesson. Wide cinema view has a visible close control, focus containment/return and Escape support; side panel offers compact playback or a wide-view action. Theme follows Phase 03 across captions, stage and controls.

## Tests and acceptance

- Pure timeline/clock tests use a fake scheduler for play/pause/seek/speed/scene boundaries and cue ordering.
- Seeking backward and replaying a scene yields the same actor values and pointers as the underlying trace.
- Missing voices and blocked/stalled speech fall back to captions without losing controls. Pause/seek cancels obsolete utterances.
- Schema fixtures reject unknown cues, missing trace steps, invalid line maps, duplicate IDs and wrong final output.
- Native stage and trace player show identical states for every linked checkpoint.
- Keyboard controls, transcript, captions, reduced motion, 200% zoom and theme matrix pass. Cinema opening/closing restores focus and does not scroll or modify the host judge page.
- Watch completion is stored as participation only; a host checkpoint has its own answer/result.
- Saved lesson replays with provider disconnected. A drawing error preserves narration/transcript and offers text fallback.

## Demonstration and exit gate

Generate a Two Sum lesson for `[3,3]`, pause before the lookup, predict the map state, seek backward, replay and switch into Explore. Demonstrate captions-only playback and a dark learning view opened from a dark LeetCode question. Compare lesson/trace output side by side.

## Rollback and exclusions

Feature-flag narration independently from trace storage. Keep transcript and stage explanation when speech fails. No paid TTS, media download, external caption scraping, MP4 export or claim of executing all solution languages is included.
