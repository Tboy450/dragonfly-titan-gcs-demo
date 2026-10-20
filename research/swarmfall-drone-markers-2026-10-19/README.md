# FIX-04 — Tiny-drone readability

Implemented October 19, 2026 — **Codex (OpenAI)**. Game-only update; neither environment lab
or the separate studio's working files were changed. The owner delegated copy expansion to
another project; ongoing work here follows the original Swarmfall improvement checklist.

Living friendly drones now receive a small squad-colored diamond when their projected
model bounds are below **8 CSS pixels**. The diamond has a dark outline and a 3-pixel radius.
It sits at the existing selection-ring anchor; selection rings and health bars still draw.
Close models, dead units, enemies, structures and off-screen/behind-camera points receive
no friendly marker. Clean view hides all of these overlay cues as before.

`scene.mjs` caches each ordinary drone's body/rotor bounding radius from its existing model,
then uses camera-space depth and projection scale to estimate screen diameter. Dragonfly's
bounds are cached when its existing template is first built, without constructing another
research model. This is a conservative projected bound, not a per-pixel silhouette/occlusion
measurement. Overlay markers can show through scenery; fog-of-war/occlusion policy remains
future work. They do not add world geometry, change physical model scale or alter hit tests,
selection rules, unit statistics, orders, paid cargo or save schemas.

`drone-markers.mjs` contains the plain projection/viewport/readability functions. Invalid
or behind-camera sizing returns no marker. CSS dimensions keep the footprint independent
of framebuffer/device-pixel ratio. No new DOM nodes or per-unit mesh/material batches.

**387/387 tests pass.** [Full output](test-results.txt). Four new checks cover perspective
size/depth/viewport math; threshold, invalid and clipped points; actual entry-point overlay
wiring with Canvas/DOM stand-ins including unselected/selected/damaged/native/dead/Clean-view
paths; and real Three camera/model bounds at near/far zoom using a renderer stand-in.
Presentation is checked not to mutate unit state. These are automated acceptance checks,
not native browser shader output or real-phone visual acceptance. Browser automation was
previously restricted and was not retried. No new screenshot or GPU benchmark is claimed.

Canonical checklist now **24/305 checked**, with FIX-04 signed for implementation/automated
scope. Broader browser/device acceptance remains open. Original files and the dated historic
mission picture are [preserved with restore steps](../../archive/swarmfall-drone-markers-2026-10-19/README.md).
