# Archived Nose-Camera Placeholders (until 2026-10-13)

Archived October 13, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `8dfe691`.
Tag: `archive/nose-cameras-2026-10-13`.

Part 04 was three dark boxes (0.09 x 0.09 x 0.12 m) at x -0.22, 0 and +0.22, y -0.1, z -1.8,
labeled "Navigation and forward cameras (no active airflow)" from ICES-2023. They were replaced
by the six DragonCam nose cameras in `dist/nose-cameras.mjs`.

## Files here

- `vehicle-research.mjs`, `layers-panel.mjs`: exact copies at `8dfe691`.
- `nose-internal-*.jpg`, `nose-thermal-*.jpg`: isolated at orbit angles 0, 1.5, 3.1, 4.7;
  `nose-context-internal-3.4.jpg`: installed.

## Restore

Use the tag in a separate checkout for the whole app as it was. For a narrow restore: in
`dist/vehicle-research.mjs`, remove the `buildNoseCameras` import and call and put back

```js
material = interiorPart("nose-cameras-inside", "nose-cameras", "Navigation and forward cameras (no active airflow)", "ICES-2023 p7, fig. 3", 0x3d4a52);
for (const x of [-0.22, 0, 0.22]) mesh(new THREE.BoxGeometry(0.09, 0.09, 0.12), material, [x, -0.1, -1.8]);
```

remove the `nose-cameras-inside` text in `dist/ui/layers-panel.mjs` and
`tests/nose-cameras.test.mjs`. Archive the replaced version in turn and rerun all tests.
