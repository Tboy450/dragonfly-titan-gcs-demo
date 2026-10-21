# Part20 annotation before the hardware-family approximation

Archived October 21, 2026 by Codex (OpenAI), before replacing the measurement target.
Recovery tag `archive/battery-sensor-2026-10-21` points to committed baseline `f1c6129`.

- Exact old `battery-measurement.mjs`, its test, vehicle builder, inspector, renderer, layer
  panel and HTML are saved here. The original annotation is not sensor hardware.
- `before/`: fresh Edge desktop/mobile Internal/Thermal screenshots, four orbit views,
  battery-cover inspection, raw context render, checks and battery/part21 mesh manifests.
- `draft-a/`: first unpublished thermistor approximation source and screenshots. Its gray
  end used overlapping ellipsoids, producing a rough visible border in macro views. The final
  version splits a single surface into black and gray faces. This draft was never committed/published
  on its own and has no separate tag. Failed verification runs that preceded the saved passed
  run were test-harness issues: rotated world AABBs and a hidden raw-preview root, not discarded
  vehicle models.
- `draft-b/`: second unpublished finish, source and passed renders; its gray coating used a
  separate spherical patch whose differing triangulation caused small dark spots at high
  magnification. Final black/gray surfaces share vertices and have disjoint triangle sets.

## Restore

For a full historical snapshot, inspect the recovery tag in a separate worktree. To restore
only the old annotation on a later release, port this folder's battery builder plus the
corresponding battery-sensor title/detail/assumptions and tests; reconcile the initial-pass
count and checklist. Do not copy the complete old HTML/vehicle/UI files over later work.
The optional macro-framing helper can remain for other parts; the old annotation does not
request it. Battery and part21 geometry were not changed by this replacement.

To inspect draft-a, use its saved module in an isolated checkout with this release's call
signature. Its appearance is superseded; do not present its overlapping end geometry as
the latest model. Final sources and samples are in
[the research record](../../research/battery-sensor-2026-10-21/README.md).
