# Archived Side-Camera Placeholders (until 2026-10-13)

Archived October 13, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `d40180f`.
Tag: `archive/side-cameras-2026-10-13`.

Part 23 was two plain boxes (0.07 x 0.12 x 0.16 m) at [+/-0.455, -0.24, 0.62], labeled "Side
camera suites: down camera, micro-imager, LED (under foam, both sides)", from ICES-2023. They
were replaced by the DragonCam cameras in `dist/side-cameras.mjs` and `dist/ecam.mjs`.

## Files here

- `vehicle-research.mjs`, `layers-panel.mjs`: exact copies at `d40180f`.
- `cam-internal-*.jpg`, `cam-thermal-*.jpg`: isolated at orbit angles 0, 1.5, 3.1, 4.7;
  `cam-context-internal-1.5.jpg` and `cam-context-exterior-1.5.jpg`: installed.

## Restore

Use the tag in a separate checkout for the whole app as it was. For a narrow restore: in
`dist/vehicle-research.mjs`, remove the `buildSideCameras` import and call and put back

```js
material = interiorPart("side-cameras", "cold-actuators", "Side camera suites: down camera, micro-imager, LED (under foam, both sides)", "ICES-2023 p2, fig. 3", 0xbfb8aa, "exterior");
for (const side of [-1, 1]) mesh(new THREE.BoxGeometry(0.07, 0.12, 0.16), material, [side * 0.455, -0.24, 0.62]);
```

restore the `side-cameras` text in `dist/ui/layers-panel.mjs`, and remove
`tests/side-cameras.test.mjs`. Archive the replaced version in turn and rerun all tests.
