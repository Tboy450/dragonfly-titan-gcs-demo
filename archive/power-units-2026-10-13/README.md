# Archived PSU Placeholders (until 2026-10-13)

Archived October 13, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `c36db54`.
Tag: `archive/power-units-2026-10-13`.

Part 11 was two plain green boxes (0.20 x 0.22 x 0.26 m and 0.20 x 0.22 x 0.22 m) at
[-0.22, -0.18, -0.2] and [-0.22, -0.18, 0.12], labeled "Two power switching units (PSUs)". They
were replaced by the photo-based PSUs in `dist/power-units.mjs`.

## Files here

- `vehicle-research.mjs`, `layers-panel.mjs`: exact copies at `c36db54`.
- `psu-internal-*.jpg`, `psu-thermal-*.jpg`: the isolated boxes at orbit angles 0, 1.5, 3.1, 4.7
  in Internal and Thermal (1280 x 800). `psu-context-internal-0.22.jpg`: installed among their
  neighbors.

## Restore

Use the tag in a separate checkout for the whole previous app. For a narrow restore: in
`dist/vehicle-research.mjs`, remove the `buildPowerUnits` import and call and put back

```js
material = interiorPart("power-units", "equipment-bay", "Two power switching units (PSUs)", "NASA integration update, 10 Mar 2026; ICES-2023 fig. 4; placement illustrative", 0x4f9a8f);
mesh(new THREE.BoxGeometry(0.2, 0.22, 0.26), material, [-0.22, -0.18, -0.2]);
mesh(new THREE.BoxGeometry(0.2, 0.22, 0.22), material, [-0.22, -0.18, 0.12]);
```

restore the `power-units` text and source entries in `dist/ui/layers-panel.mjs`, and remove
`tests/power-units.test.mjs`. Archive the replaced version in turn and rerun all tests.
