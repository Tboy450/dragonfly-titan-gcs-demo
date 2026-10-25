# Inspection Controls

Codex (OpenAI), October 25, 2026. UI-only update; no vehicle/terrain/flight changes.

- Mouse wheel over the model zooms only when Mission inspection's Rotate toggle
  is selected, for research-model Internal/Thermal. Off, Exterior and original
  model leave normal page scrolling intact. Ctrl/Meta+wheel retains browser zoom.
- Wheel up increases magnification, down decreases it. Pixel/line/page wheel
  units are normalized; zoom remains 60-300%, without leaking page scroll at limits.
- Vehicle Layers now sits immediately above the viewport. All existing controls,
  sections and 24 numbered parts remain. Phone order is toolbar, viewport,
  inspection details; Pilot hides this toolbar and keeps its free-camera handler.
- Interior c reuses Thermal b's exact light-grey grid painter and dark ink.
  Interior and Thermal choices persist independently; old a/b preferences survive.

Evidence: `desktop.png`, `phone.png` and `browser-checks.json`. Reuse the existing
source/photo records: this task creates no new hardware or realism claims.
Recovery files, before view and rejected mobile-order draft:
[`archive/inspection-controls-2026-10-25`](../../archive/inspection-controls-2026-10-25/README.md).

623 automated tests pass (four added checks for wheel policy/units, backdrop
painting/preferences, and control preservation/selector placement). Native browser
wheel tests: selected zoom 100->131->100% with page Y unchanged; deselected wheel
scrolls page 180px with zoom unchanged. Thermal and phone wheel checks pass.
Phone client/scroll widths both 375px. Published-build verification recorded below.

## Publication Receipt

Published source `051c9d9b940de9018e234afb0a31ec94feb6cec1`;
GitHub Pages run `40217478630` succeeded. Live build stamp, Interior c,
toolbar position and all24 parts verified with zero browser errors.
Live wheel zoom100->131->100% kept pageY904; wheel outside the canvas scrolled
the page without changing model zoom. `public.png` is the complete live view;
`public-checks.json` holds the observed results. Desktop/phone screenshot
pixel checks found15,185/6,267 colored hardware pixels and28,221/19,425 distinct
colors in the model region (nonblank). Recovery tag pushed; local preview stopped.

Owner also asked about Reverse (sim). Existing code only arms an opt-in fictional
vertical pulse: zero manual throttle, above 1m, no altitude hold/auto guidance,
not over liquid; adds 0.2m/s^2 until 0.6m/s descent. It has no horizontal braking.
This pass explains that limitation without changing physics, gates or controls.

Next hardware task remains IEM column five, IDs15/16/17;14 reviewed,12 open.
