# Archived Swarmfall Corvan map (until 2026-10-21)

Archived October 21, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `52dc4a8`.
Tag: `archive/swarmfall-corvan-map-2026-10-21`.

Corvan before it gained a city district: an open snowfield 920 m across (`half: 460`) with a
Hive beacon and five zones (a citadel, a deposit and three factory towns of small houses), four
needed to win. It was replaced by a 1.8 km map (`half: 900`) with a 900 m city district whose
five squares are capture zones, plus two countryside zones (seven zones, five needed).

**Restored October 21 (later the same day):** the owner moved large city maps into their own
mode, so campaign Corvan uses this map again. The city version is archived in
[`../swarmfall-corvan-city-2026-10-21/`](../swarmfall-corvan-city-2026-10-21/README.md).

## Files here

- `campaign.mjs`, `planet-terrain.mjs`: exact copies at `52dc4a8`. Corvan's old definition is
  in `campaign.mjs`:
  `map: { centerX: 0, centerZ: 0, half: 460 }, zoneCount: 5, required: 4, seed: 3109`, with the
  old description "Frozen ridges and factory towns. Flak and radar cover the passes, and a full
  alarm brings artillery."
- `pictures/corvan-before-snowfield.jpg`: the old map from above, at the start of a mission.
  It was rendered after the change, from the archived planet definition. The code that draws a
  map without a city is unchanged, so the picture matches the old app.
- `pictures/corvan-after-city.jpg`: the replacement, from a similar camera, for comparison.

## Still playable

A Corvan battle saved before the change has no city stamp. `checkpointPlanet` in
`dist/invasion/mission-save.mjs` rebuilds it on this old landscape and map size, so saved
battles carry on unchanged (tested in `tests/invasion-city.test.mjs`).

## Restore

Use the tag in a separate checkout for the whole previous app. To bring back only the old map,
replace Corvan's `map`, `zoneCount`, `required` and `description` in
`dist/invasion/campaign.mjs` with the values above and delete its `city` entry. The city code
then stays unused. Archive the city version in turn, and rerun all tests.
