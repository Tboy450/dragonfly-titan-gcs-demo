# CTRL-08 — Minimap orders

Implemented October 20, 2026 — **Codex (OpenAI)**.

| Input | Behavior |
| --- | --- |
| Default View mode, primary click/tap | Center the camera at that map point |
| Desktop right-click | Order selected squads: attack a nearby enemy, capture a zone or move |
| Map: Orders, primary mouse/touch/pen tap | Same order rules, without moving the camera |
| Map: View | Restore ordinary camera taps |
| Order input during landing placement | Cancel that preview; no purchase, launch or squad order |

A brief cyan expanding target ring confirms a successful order on the minimap. Paused
orders remain supported. Empty selection explains what to select and never moves the camera.
The battlefield's existing selection, primary/right-click, drag/pinch and explicit Launch
controls remain in place. A view-mode map tap can still navigate during placement.

The toggle is attached below the map, has a pressed state and readable action labels, and
uses a 40 CSS-pixel minimum height. Clean view hides the complete map/toggle panel. Viewport
coordinates use actual CSS bounds, including offsets and non-square dimensions; invalid or
outside points do not order. This does not introduce ground/bridge surface queries or change
targeting/range/battle rules: existing `orderAt` decides attack/capture/move.

Pointer handling suppresses drag/release movement above8 pixels, multi-touch, button chords,
unsupported clicks, pointer cancellation/capture loss, blur, hidden pages, modal interruptions,
ended missions and Clean-view input. Synthetic click events cannot duplicate pointer orders.
Mode changes also discard pending pointer gestures. Right-click suppresses the map's native
context menu. New/resumed missions reset to **View** and clear the transient command pulse;
this mode/pulse is not saved and no checkpoint schema changes.

**400/400 tests pass.** [Full output](test-results.txt). Ten new tests execute the actual
entry-point listeners and real order rules with DOM/capture/renderer stand-ins. Coverage:
CSS/world mapping; default camera taps; right-click attack/capture/move while paused; touch/
pen toggle and synthetic-click deduplication; empty selection; displaced/chord/outside input;
interruption guards; multi-touch; placement cancellation without spending; valid checkpoint
resume clearing mode/ping/gestures. Existing camera, drop, victory, save/recovery and simulator
checks continue to pass. Native browser/touch/GPU/phone acceptance remains open; previously
restricted browser automation was not retried. No new screenshot/device benchmark claimed.

The old camera-only map is [preserved with restore steps](../../archive/swarmfall-minimap-orders-2026-10-20/README.md).
Canonical Swarmfall count: **26/305 checked**, CTRL-08 signed for implementation/automated
scope. Both environment labs and the separately maintained studio remain unchanged.
