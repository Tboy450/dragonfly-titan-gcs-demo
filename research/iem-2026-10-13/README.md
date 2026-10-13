# Part 12: Integrated Electronics Module (IEM)

Revision `iem-2026-10-13b` (Claude, Anthropic Claude Opus 5.5), October 13, 2026. Source:
`dist/iem.mjs`. An **educational reconstruction from photographs**; no IEM drawing or size has
been published. The first version (`iem-2026-10-13`) is archived in
[`archive/iem-v1-2026-10-13`](../../archive/iem-v1-2026-10-13/README.md).

## Photos (saved here)

| File | Shows | Credit |
|---|---|---|
| `nasa-apl-iem-harness-full.jpg` (3000 x 3996), `nasa-apl-iem-harness.jpg`, `apl-iem-harness.jpg` | Emory Toomey and Hunter Reeling connect the IEM **engineering model** to the lander harness | NASA/Johns Hopkins APL |
| `nasa-apl-psu-iem-testing.jpg` (1280 px; the 6720 x 4480 original is in `../power-units-2026-10-13/`), `apl-iem-psu-testing.jpg` | Carlisa Drew, Seth Harvey, Anthony Fanelli, Emory Toomey and TJ Lee test the IEM and a PSU in APL's clean room | NASA/Johns Hopkins APL/Ed Whitman |
| `apl-integration-video-cover.jpg` | Cover of APL's "Integration & Testing: Power and Electronics" video | Johns Hopkins APL |

From [NASA's March 10, 2026 blog](https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/)
and [APL's March 12, 2026 release](https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins).
The connector sizes come from [`../sources/connector-standards/`](../sources/connector-standards/README.md).

## What the full-resolution photos show, and what was drawn

| Feature | Basis |
|---|---|
| Black heat-sink top, fins **parallel to the face**, rows of fasteners through it | both photos |
| Copper ground strap bolted at a top corner | testing photo |
| Silver face plate, slightly larger than the body, fastened all round its edge | both photos |
| Black connector windows in two rows across eight card columns | both photos (EM: gold card fronts; testing unit: silver) |
| Micro-D connectors, each mated to a silver-wrapped cable with a white label; cables drop down | testing photo |
| Strips of yellow tape on the face | both photos |
| Back mounted to a vertical wall panel, beside a PSU | testing photo |
| About 28 cm wide, 28 cm tall (face about square, EM photo), 22 cm deep | [EST] scale from the Micro-D plugs (37-way 37.8 mm long) |
| Port wall, PSU 1 on its left as seen from inside | [EST] which wall; the side-by-side arrangement is photographed |

The exact window layout is [EST]: cables cover most of the face in both photos. Depth and the
ground strap's run to the structure are [EST]. Red handling handles are left out. No circuit
boards are drawn.

## Checks

`tests/iem.test.mjs`: fins run across the face, at least 20 fins and 20 top fasteners, over 30
face screws, at least 12 windows, standard Micro-D sizes only, every plug mated and labeled,
copper strap, independent layers, inside the bay against the port wall, face inboard, clear of
the rebuilt set (and of both PSUs, in `tests/power-units.test.mjs`). `model-vs-photos-v2.jpg`
compares the photos with the model; `model-vs-photos.jpg` is the first version.
