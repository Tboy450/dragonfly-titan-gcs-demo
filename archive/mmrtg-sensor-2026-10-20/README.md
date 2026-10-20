# Archived Part 21 Placeholder: MMRTG Fin-Root Sensor Sphere (until 2026-10-20)

Archived October 20, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `d016f12`.
Tag: `archive/mmrtg-sensor-2026-10-20`.

Part 21 was a 4.4 cm green sphere (`SphereGeometry(0.022)`) at radius 0.22 m on the MMRTG's top
fin, in the generator's frame, labeled "MMRTG fin-root temperature sensor: the other controller
input" with "placement illustrative". It looked like a sensor body, passed through the 2 cm top
fin at its root, and when isolated it floated alone because the generator was not shown. It had
no part text, and its sources were the generic thermal-layout and payload links.

Replaced by `dist/mmrtg-measurement.mjs`: a labeled measurement annotation (ring and crosshair,
part 20's style) lying on the housing beside the top fin's root, posed with the generator, with
part text and sources; isolating part 21 now shows the MMRTG. See
[`../../research/mmrtg-measurement-2026-10-20/`](../../research/mmrtg-measurement-2026-10-20/README.md).

## Files here

- `vehicle-research.mjs`, `vehicle-inspector.mjs`, `layers-panel.mjs`, `index.html`: exact
  copies at `d016f12` (the sphere is under "Kept on the MMRTG's top fin root").
- `battery-measurement.test.mjs`: Codex's part 20 test at `d016f12`, before its part 21 check
  was pointed at the archived copies.
- `pictures/`: `old-internal-*` and `old-thermal-*` (four orbit angles, in context),
  `old-iso-internal-*` (isolated: the sphere alone), `old-contact-sheet.png`.
- `before/`: real-Edge baseline from a checkout of `d016f12`
  (`research/mmrtg-measurement-2026-10-20/verify-render.cjs --baseline`): isolated Internal and
  Thermal at 1440/390/360 px, four angles, a close view, the part text panel and
  `render-checks.json`.

## Restore

Use the tag in a separate checkout for the whole previous app. For a narrow restore: in
`dist/vehicle-research.mjs`, put back the archived `mmrtg-sensor` lines (the `interiorPart` call
returning `material` and the sphere `mesh` call) in place of the `buildMmrtgMeasurement` call
and remove its import; remove the `"mmrtg-sensor"` line from `inspectionGroups` in
`dist/vehicle-inspector.mjs`; remove `mmrtgFeedback`, `mmrtgFacts`, the `"mmrtg-sensor"`
component text, its source splice and its live reading from `dist/ui/layers-panel.mjs`; restore
the placeholders and Model assumptions sentences in `dist/index.html`; delete
`dist/mmrtg-measurement.mjs` and `tests/mmrtg-measurement.test.mjs`, and restore the archived
part 20 test. Archive the replaced version in turn and rerun all tests.
