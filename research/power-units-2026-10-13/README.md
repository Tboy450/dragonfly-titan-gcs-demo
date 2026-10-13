# Part 11: Power Switching Units (PSUs), Enclosure-Level Rebuild

Implemented October 13, 2026 by Claude (Anthropic Claude Opus 5.5). Revision
`power-units-2026-10-13`. Source: `dist/power-units.mjs`. An **educational reconstruction from a
photograph**; no PSU drawing or dimension has been published.

## Sources

| File / link | What it gives | Credit |
|---|---|---|
| `nasa-apl-psu-iem-testing.jpg` | Carlisa Drew, Seth Harvey, Anthony Fanelli, Emory Toomey and TJ Lee test the IEM and a PSU in APL's clean room | NASA/Johns Hopkins APL/Ed Whitman |
| `psu-detail-crop.jpg` | Crop of the PSU from that photo | same |
| [NASA March 10, 2026 blog](https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/) | "The IEM and both PSUs were connected to Dragonfly's wiring system and passed their first power-service checks"; PSUs "control the flow of power to Dragonfly's instruments and systems" | NASA |
| [APL March 12, 2026 release](https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins) | same photo and captions | Johns Hopkins APL |

The IEM photos in [`../iem-2026-10-13/`](../iem-2026-10-13/README.md) show the same scene.

## What Was Built

| Feature | Basis |
|---|---|
| Two units | [PUB] "both PSUs" |
| Silver connector face built from four horizontal slices with dark seams | photo; slice heights [EST] |
| Rows of tall connectors: six on the upper row, three in the middle, six lower; face screws | photo; exact count [EST]. In the photo they carry pink test caps; here they are mated to the harness |
| Black top and black side covers | photo |
| A backshell on every connector; silver-wrapped cables drop and gather toward the gap between the two units, with Kapton-taped ties | photo style; routes [EST] |
| Bolted base flanges | [EST] |
| About 24 cm wide, 22 cm tall, 20 cm deep each | [EST] scaled from the gloved hands in the photo |
| Port bay floor at the old placeholders' centers, connector faces inboard (facing the IEM and radio across the bay) | [EST] |

Mesh groups per unit: `psu-N-casing` (equipment-casings), `psu-N-mounts` (mounts),
`psu-N-connectors` (interfaces), `psu-N-harness` (harnesses). The red handles in the photo
are ground handling gear and are left out. No circuit boards are drawn.

## Not Known / Not Modeled

- Real dimensions, slice count and connector types; whether both units look alike.
- Where they mount in the flight lander (the photo shows the testing setup next to the IEM).
- Separate PSU currents: the simulator models whole-vehicle power only.

## Checks

`tests/power-units.test.mjs`: two units, four slice faces each, at least twelve connectors each
with a mated backshell, independent layers, inside the allowance and the bay, casings on the
floor and apart, faces inboard, clear of the carousel, Wonderwall, DraMS, radio and IEM. All
164 tests pass. Internal and Thermal isolated at four angles, a face-on view and in context;
375 px phone width; no console errors. `model-vs-photo.jpg` compares them.

Previous placeholders and restore steps: [`archive/power-units-2026-10-13`](../../archive/power-units-2026-10-13/README.md).
