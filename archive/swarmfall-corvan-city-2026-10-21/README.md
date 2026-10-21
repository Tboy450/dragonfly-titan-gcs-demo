# Archived Swarmfall Corvan city map, first version (October 21, 2026)

Archived October 21, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `fbf08c1`, the
last commit that used it (the city itself arrived in `9b77399`).
Tag: `archive/swarmfall-corvan-city-2026-10-21`.

The first city on a planetary map: campaign Corvan grew to a 1.8 km map (`half: 900`) with a
900 m district (9 × 9 blocks, 184 buildings) a little off-center. Its five squares were capture
zones, plus two countryside zones (seven zones, five needed). The owner said it still took up
most of the map and was visible from the start. They asked for rougher terrain, a flat valley
five times bigger and an even bigger map, with large city maps possibly as their own mode.
It was replaced the same day:
- Campaign Corvan returned to its original snowfield
  (see [`../swarmfall-corvan-map-2026-10-21/`](../swarmfall-corvan-map-2026-10-21/README.md)).
- City maps moved to the new Frontier mode, where Corvan Frontier puts the city deep in a
  mountain valley that has to be scouted.

## Files here

- `campaign.mjs`, `planet-terrain.mjs`, `scene.mjs`, `main.mjs`: exact copies at `fbf08c1`.
  Corvan's city definition in `campaign.mjs` was:
  `map: { centerX: 0, centerZ: 0, half: 900 }, zoneCount: 7, required: 5, seed: 3109,`
  `city: { style: "metropolis", x: 80, z: -120, blocks: 9, pitch: 100, street: 20, seed: 3109, peak: 150 }`.
  The layout and city renderer (`city-layout.mjs`, `city-render.mjs`) are still in use and
  unchanged.
- `pictures/corvan-city-overview.jpg`: the whole district from above at the start of a mission
  (desktop, 1280 × 800).
- `pictures/corvan-city-phone.jpg`: the district on a 375 px phone screen.

## Still playable

Battles saved on this version carry the stamp `city: { version: 1, seed: 3109 }`.
`checkpointPlanet` in `dist/invasion/mission-save.mjs` recognizes that stamp and rebuilds this
exact city and map, so those saves resume unchanged (tested in `tests/invasion-city.test.mjs`).

## Restore

Use the tag in a separate checkout for the whole previous app. To put the city back into the
campaign, give campaign Corvan the `map`, `zoneCount`, `required` and `city` values above in
`dist/invasion/campaign.mjs`. Archive the version being replaced in turn, and rerun all tests.
