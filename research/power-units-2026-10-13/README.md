# Part 11: Power Switching Units (PSUs)

Revision `power-units-2026-10-13b` (Claude, Anthropic Claude Opus 5.5), October 13, 2026.
Source: `dist/power-units.mjs`. An **educational reconstruction from a photograph**; no PSU
drawing or size has been published. The first version (`power-units-2026-10-13`) is archived in
[`archive/power-units-v1-2026-10-13`](../../archive/power-units-v1-2026-10-13/README.md).

## Sources

| File / link | What it gives | Credit |
|---|---|---|
| `nasa-apl-psu-iem-testing-full.jpg` (6723 x 4480) and the 1280 px copy | IEM and a PSU in testing; the face of one PSU in detail | NASA/Johns Hopkins APL/Ed Whitman |
| `psu-detail-crop.jpg` | Crop of the PSU | same |
| `face-map-overlay.jpg` | The model's connector map (green), slice dividers (blue) and ribs (yellow) drawn over the photo, to check placement | Claude, over the NASA/APL photo |
| [NASA March 10, 2026 blog](https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/) | "The IEM and both PSUs were connected to Dragonfly's wiring system"; PSUs "control the flow of power" | NASA |
| [APL March 12, 2026 release](https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins) | Same photo; video caption: engineers install the IEM and PSU on the open-frame lander structure | Johns Hopkins APL |
| [`../sources/connector-standards/`](../sources/connector-standards/README.md) | D-sub sizes used as the ruler | |

## What was drawn

| Feature | Basis |
|---|---|
| Two units | [PUB] "both PSUs" |
| Eight vertical slices; a rib across the face and a shorter rib over its left part | photo |
| Large connectors stacked two-high on the two left slices; a cluster of small connectors next to them; three large connectors and an uncapped silver port along the lower right; empty upper right; screw posts on the middle dividers | photo, mapped connector by connector and checked by overlay |
| Large = 25-way D-sub (shell B, 53 mm), medium = 9-way (shell E, 31 mm) | standard sizes matched to the photo |
| Black top band, top and side covers | photo |
| About 20 cm wide, 24 cm tall, 19 cm deep | [EST]: two 53 mm D-sub flanges stacked between the ribs need a face about 21.5 cm tall; the photo's proportions then give the width |
| Every connector mated to a silver-wrapped cable (pink test caps in the photo) | [EST] flight configuration |
| PSU 1 on the port wall, beside the IEM and on its left as seen from inside | photo arrangement; wall [EST] |
| PSU 2 on the starboard wall, drawn the same as PSU 1 | [EST]: only one PSU is photographed |

Red handling handles are left out. No circuit boards are drawn.

## Checks

`tests/power-units.test.mjs`: two units, eight slices, two ribs, seven 25-way D-subs, one
uncapped port, every other connector mated, nothing in the empty upper right, independent
layers, on the floor inside the walls, faces inboard, PSU 1 on the IEM's wall 1-12 cm from it,
both clear of the rebuilt set and the IEM. `model-vs-photo-v2.jpg` shows the overlay, a close
view and the installed bay; `model-vs-photo.jpg` is the first version.
