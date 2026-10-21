# Archived Arm Shoulders: Round Foam Ring and Flange (until 2026-10-20)

Archived October 20, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `8dad2ea`.
Tag: `archive/arm-shoulder-2026-10-20`.

Each arm met the body with a round tan foam ring (`CylinderGeometry(0.13, 0.13, 0.075)`, foam
seam color) and a round dark metal flange (`CylinderGeometry(0.092, 0.092, 0.085)`), both turned
straight across the body rather than along the angled arm, then a foam fairing tapering from
10 to 6.5 cm. The owner noted on October 15 that the real joint "doesn't go straight in" and
looks like a little hexagon. Replaced by `dist/arm-shoulder.mjs` (the machined fitting in
NASA/APL's May 2026 frame photo); see
[`../../research/arm-shoulder-2026-10-20/`](../../research/arm-shoulder-2026-10-20/README.md).

## Files here

- `vehicle-research.mjs`: exact copy at `8dad2ea` (the two shoulder `mesh` calls and the
  `taper(root, fairingEnd, 0.1, 0.065, ...)` in the arm loop).
- `pictures/old-*.png`: close renders of the starboard forward shoulder from four angles, the
  same camera positions as `research/arm-shoulder-2026-10-20/model-*.png`.

## Restore

Use the tag in a separate checkout for the whole previous app. For a narrow restore, put the
archived ring, flange and `taper(root, ...)` lines back in the arm loop of
`dist/vehicle-research.mjs` in place of `buildArmShoulder` and `taper(flangeEnd, ...)`, remove
the `arm-shoulder.mjs` import, and delete `dist/arm-shoulder.mjs` and
`tests/arm-shoulder.test.mjs`. Archive the replaced version in turn and rerun all tests.
