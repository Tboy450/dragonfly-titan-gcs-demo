# Part 12: Integrated Electronics Module (IEM), Enclosure-Level Rebuild

Implemented October 13, 2026 by Claude (Anthropic Claude Opus 5.5). Revision `iem-2026-10-13`.
Source: `dist/iem.mjs`. An **educational reconstruction from photographs**; no IEM drawing or
dimension has been published.

## Photos (saved here)

| File | Shows | Credit |
|---|---|---|
| `nasa-apl-iem-harness.jpg`, `apl-iem-harness.jpg` | Emory Toomey and Hunter Reeling connect the IEM **engineering model** to the lander harness | NASA/Johns Hopkins APL |
| `nasa-apl-psu-iem-testing.jpg`, `apl-iem-psu-testing.jpg` | Carlisa Drew, Seth Harvey, Anthony Fanelli, Emory Toomey and TJ Lee run power and functional tests on the IEM and a PSU in APL's clean room | NASA/Johns Hopkins APL/Ed Whitman |
| `apl-integration-video-cover.jpg` | Cover of APL's "Integration & Testing: Power and Electronics" video (a slice-built box with handles, color-filtered) | Johns Hopkins APL |

From [NASA's March 10, 2026 blog](https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/)
and [APL's March 12, 2026 release](https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins).
NASA describes the IEM as the "brain" holding the core avionics (command and data handling,
guidance and navigation, communications) "in a single space-saving and power-efficient box".

## What Was Built

| Feature | Basis |
|---|---|
| Dark chassis with a black finned top (fins run front to back) | photos |
| Front face of nine silver card panels with captive screws and gold micro-D connectors | photos; card count and connector layout [EST] |
| A harness backshell on every connector; silver-wrapped cables drop to the floor and gather at one end, with Kapton-taped ties | photos; routes [EST] |
| Bolted mounting flanges along the base | [EST]: the photos show the box fastened to a vertical structural panel whose interface is not visible |
| About 26 cm wide, 22 cm tall, 24 cm deep | [EST] scaled from the engineers' gloved hands; no size is published |
| Starboard bay floor, same center as the old placeholder, card face inboard | [EST] |

Mesh groups: `iem-chassis` (equipment-casings), `iem-mounts` (mounts), `iem-connectors`
(interfaces), `iem-harness` (harnesses). No circuit boards are drawn. The red handles in the
photos are ground handling gear and are left out.

## Not Known / Not Modeled

- Real dimensions, card count and connector types.
- Where the IEM is mounted in the flight lander: the photos show it on a vertical panel of
  the open-frame structure, which this model does not have yet.
- Whether the black top is a heat sink for the circulating bay gas (as drawn) or a cover.

## Checks

`tests/iem.test.mjs`: nine card fronts each with a connector, dense top fins, a backshell on
every connector, independent layers, inside its allowance and the bay, chassis on the floor,
card face inboard, clear of the carousel, Wonderwall, DraMS and Frontier radio. All 162 tests
pass. Internal and Thermal isolated at four angles and in context; phone width (375 px); no
console errors. `model-vs-photos.jpg` compares the photos with the model.

Previous placeholder and restore steps: [`archive/iem-2026-10-13`](../../archive/iem-2026-10-13/README.md).
