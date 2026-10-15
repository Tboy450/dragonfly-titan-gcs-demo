# Archived HGA Dish Face, Ring Version (until 2026-10-14)

Archived October 14, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `f20648c`.
Tag: `archive/hga-dish-rings-2026-10-14`.

Published earlier the same day with part 10: an orange face with V-shaped slot pairs (both slots
at 45 degrees to the radius, touching) on concentric rings, drawn on a 512 px canvas. Replaced by
the layout read from NASA's full-resolution test-chamber photo: one continuous spiral, pairs
turned by half their angle around the disc, the two slots side by side along the spiral (the
herringbone near the rim), slots growing toward the edge, a ring of seven spots around the feed
(`dist/vehicle-research.mjs`, 1,024 px canvas). See
`research/hga-actuators-2026-10-14/model-dish-texture-vs-photo.jpg`.

## Files here

- `vehicle-research.mjs`: exact copy at `f20648c` (the texture is the block after
  "High-gain antenna: a flat 0.874 m radial-line slot disc").
- `hga-dish-rings-texture.png`: the texture as drawn (512 x 512).

## Restore

Put the archived texture block back in place of the spiral block in `dist/vehicle-research.mjs`
(both end at `const slotTexture = new THREE.CanvasTexture(slotCanvas);`). Archive the replaced
version in turn and rerun all tests.
