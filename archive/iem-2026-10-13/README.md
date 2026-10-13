# Archived IEM Placeholder (until 2026-10-13)

Archived October 13, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `1820799`.
Tag: `archive/iem-2026-10-13`.

Part 12 was a teal 0.22 x 0.18 x 0.30 m box at [0.2, -0.2, -0.12] with seven grey bars on top,
labeled "Integrated electronics module (IEM)". It was replaced by the photo-based IEM in
`dist/iem.mjs` (finned top, nine card fronts with connectors, plugged-in harness).

## Files here

- `vehicle-research.mjs`, `layers-panel.mjs`: exact copies at `1820799`.
- `iem-internal-*.jpg`, `iem-thermal-*.jpg`: the isolated box at orbit angles 0, 1.5, 3.1, 4.7 in
  Internal and Thermal (1280 x 800). `iem-context-internal-0.22.jpg`: installed among its
  neighbors.

## Restore

Use the tag in a separate checkout for the whole previous app. For a narrow restore: in
`dist/vehicle-research.mjs`, remove the `buildIem` import and call and put back

```js
material = interiorPart("iem", "equipment-bay", "Integrated electronics module (IEM)", "NASA integration update, 10 Mar 2026; APL CAD reference; placement illustrative", 0x579cae);
mesh(new THREE.BoxGeometry(0.22, 0.18, 0.3), material, [0.2, -0.2, -0.12]);
for (let z = -0.24; z < 0.03; z += 0.045) mesh(new THREE.BoxGeometry(0.20, 0.008, 0.008), metal, [0.2, -0.106, z]);
```

restore the `iem` text and source entry in `dist/ui/layers-panel.mjs`, and remove
`tests/iem.test.mjs`. Archive the replaced version in turn and rerun all tests.
