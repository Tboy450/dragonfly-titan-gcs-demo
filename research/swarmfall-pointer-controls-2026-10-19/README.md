# CTRL-04 — Selection and order controls

Implemented October 19, 2026 — **Codex (OpenAI)**.

| Input | Battlefield behavior |
| --- | --- |
| Mouse left-click | Select that drone's squad; empty space clears selection |
| Shift/Ctrl/Meta + left-click | Toggle an additional squad; empty space preserves selection |
| Mouse right-click | Selected squads attack an enemy, capture a ring or move to ground |
| Touch/pen primary tap | Select a friendly squad, otherwise order the selected squads |
| Primary drag | Pan the camera |
| Right/middle/Alt drag | Rotate the camera; Ctrl drag retains the prior rotation gesture |
| Two touches | Pan, pinch zoom and rotate; lifting fingers never gives an order |
| Landing placement | Primary/touch previews; Launch here confirms; right-click/Cancel cancels |

Repeating a desktop primary click on the only selected squad keeps it selected. Middle or
Alt clicks are camera-only; unsupported mouse buttons and pen barrel clicks do not order.
Right-clicking another friendly squad orders the current selection to that ground position,
without switching selection. Commands can still be issued while paused.

`pointer-controls.mjs` classifies input intent without accessing DOM or battle state.
Actual entry-point listeners resolve hits and call unchanged battle order rules. They discard
cancelled/lost capture, interrupted modal/blur/hidden-page gestures, button chords and releases
more than 8 pixels from the start, even if no intermediate move was delivered. Partial pinch
release updates the remaining pointer anchor to prevent the old camera jump. The existing
battlefield `touch-action: none` continues to let the app own touch gestures.

**380/380 tests pass.** [Full output](test-results.txt). Thirteen new tests execute actual
entry-point listeners and real battle order/drop rules with DOM, capture and projection
stand-ins. Existing save/recovery/resume coverage now shares that harness and remains passing.
The landing fixture uses a valid held court with flat land; a preview cannot spend matter or
launch, cancellation clears stale preview state, and explicit confirmation launches once.
These are automated wiring/rule checks, not native browser pointer-capture or GPU acceptance.

Prior OBJ-08 `564f000` deployment and public source were verified. Concurrent simulator
Ocellus work through `514241b` was incorporated before this change. Browser access was
previously blocked and was not retried; actual desktop, touch and device acceptance remains
open under existing TEST/release tasks. CTRL-01 box selection and CTRL-03 queues are separate.

[Prior runtime, UI test and dated picture](../../archive/swarmfall-pointer-controls-2026-10-19/README.md)
are retained with restore instructions. No art, source assets, task IDs or unfinished work
was deleted. Checklist count: **23 checked / 304 unique task IDs**.
