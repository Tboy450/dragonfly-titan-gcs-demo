# Archived map: mountain basin (used until 2026-09-30)

This was the working map before the landscape was changed to match Dragonfly's real landing area,
**Ahmakiq Undae** (dunes and interdunes south of Selk crater; named by the IAU in September 2026).
It is archived here so it can be looked at or brought back.

## What it was

- A flat basin around the base (the landing site at 0, 0), rising into photo-textured mountain
  ridges from ~100 m out, up to ~110 m high, all the way to the edge of the 4.9 km terrain.
- The ground texture is the Huygens descent image (`dist/assets/titan-mountain-reference.jpg`),
  scattered in rotated patches. The new map still uses it.
- Far ridges are smoothed (level of detail from 2026-09-29). The sharper earlier version is in
  [../classic-peaks-terrain](../classic-peaks-terrain/README.md).
- Sites: Base (0, 0), Dry outcrop (145, -90, a level pad at 1.4 m), Sites A-F out to ~1.8 km, the
  rain-darkened interdune and the methane puddle at (210, -110). Coordinates are metres east
  (x) and south (z).

## Files here

- `titan-terrain.mjs`: the terrain, sky, fog and ground-shading code exactly as it was.
- `mission-systems.mjs`: the site layout (sites, outcrop, puddle, damp ground) as it was.
- Pictures (phone size): the landing at 37 s, 43 s and 50 s; the base from 30 m up looking north
  and south; 120 m up near Site F.

These copies are for reference; they import files by paths relative to `dist/`.

## Getting it back

- **Whole app as it was:** git tag `archive/mountain-basin-map` (commit 8ec910b).
  `git checkout archive/mountain-basin-map`, then serve `dist/`.
- **Just the map, in a later app:** copy `titan-terrain.mjs` from here over
  `dist/titan-terrain.mjs` (and `mission-systems.mjs` if the site layout changed), then run
  `node --test tests/*.test.mjs`. Later changes to those files would need merging by hand.
