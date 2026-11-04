# Archived Swarmfall Aurex skyline, scenery only (until 2026-10-22)

Archived October 22, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `ce9b949`.
Tag: `archive/swarmfall-aurex-skyline-2026-10-22`.

Aurex, the campaign's city world, was drawn with about 420 purple towers scattered at random
by the renderer (`scene.mjs` `decorate`, biome "city"). The battle rules never knew they were
there: drones flew straight through them, troops walked through them and shots passed through
(checklist FIX-02). The towers also moved with the graphics quality setting, since their count
followed the decor density.

They were replaced the same day by a solid skyline (`planet-terrain.mjs` `attachSkyline`). The
towers are seeded from the planet with the same spread and sizes, kept clear of the zones, and
drawn from the same data:
- drones climb over them;
- troops walk round them;
- pods don't land on them;
- they block direct fire.

## Files here

- `scene.mjs`, `planet-terrain.mjs`: exact copies at `ce9b949`. The old towers came from the
  `planet.biome === "city"` branch of `decorate` in `scene.mjs`.
- `pictures/aurex-skyline-overview.jpg`, `pictures/aurex-skyline-beacon.jpg`: the scenery
  skyline (desktop, 1280 × 800).
- `pictures/aurex-solid-skyline-after.jpg`: the solid skyline from the same camera, for
  comparison.

## Still playable

An Aurex battle saved before the change has no `battle.skyline` marker. `checkpointPlanet` in
`dist/invasion/mission-save.mjs` rebuilds it without towers, so it resumes as it was played
(tested in `tests/invasion-skyline.test.mjs`).

## Restore

Use the tag in a separate checkout for the whole previous app. To bring back the scenery-only
towers, restore the `planet.biome === "city"` branch of `decorate` from `scene.mjs` here, and
stop `createPlanetTerrain` from calling `attachSkyline`. Archive the replaced version in turn and
rerun all tests.
