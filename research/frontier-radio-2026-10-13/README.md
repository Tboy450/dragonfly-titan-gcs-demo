# Part 13: Frontier Radio, Enclosure-Level Rebuild

Implemented October 13, 2026 by Claude (Anthropic Claude Opus 5.5). Revision
`frontier-radio-2026-10-13`. Source: `dist/frontier-radio.mjs`. An **educational
reconstruction from a photograph and published sizes**, not CAD and not the flight unit's drawing.

## Sources and Credits

- **Photo:** [NASA Dragonfly image "Frontier Radio"](https://science.nasa.gov/image-detail/amf-48b4901b-44b0-4c89-802b-0c615842aa09/),
  credit **Johns Hopkins APL**, saved here as `nasa-apl-frontier-radio.jpg` (776 x 616). NASA's
  caption says Dragonfly uses the APL-developed Frontier radio. The page does not say whether
  this is the Dragonfly flight unit or another Frontier unit. Kept as a reference, not used as
  a texture.
- **Slice size [PUB]:** O'Neill, Millard et al., *Frontier Radio Lite: A Single-Board
  Software-Defined Radio for Demanding Small Satellite Missions*, AIAA/USU SmallSat 2016,
  SSC16-VII-2 ([PDF](https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=3383&context=smallsat)):
  the full Frontier radio is built from "four or more 4 x 6 inch packaged slices".
- **Volume and mass [PUB]:** 2,050 cm3 and 2.1 kg for the Frontier Radio (APL, *The Frontier
  Radio Virtual Radio*, iCubeSat 2019, comparison table,
  [PDF](https://icubesat.org/wp-content/uploads/2019/05/b.2.3.201905241642-paper.pdf); repeated by
  [eoPortal](https://www.eoportal.org/satellite-missions/frontier-radio), table 2). A "1.8 kg single
  band" figure seen in a search summary could not be confirmed and is not used.
- **Patent:** US 8,417,859 B2 (Johns Hopkins University, 2013), slice-based modular
  software-defined radio; drawing sheets saved in
  [`../sources/patent-us8417859-jhu-sdr/`](../sources/patent-us8417859-jhu-sdr/README.md).
  The size table page is saved in [`../sources/icubesat2019-frontier-radio/`](../sources/icubesat2019-frontier-radio/README.md).
- **Role:** [NASA, March 2026 integration update](https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/)
  (the flight radio has been delivered); [NASA spacecraft and instruments](https://science.nasa.gov/mission/dragonfly/spacecraft-and-instruments/).

## What Was Built

A black anodized stack of four slices on bolted feet, as photographed:

| Feature | Basis |
|---|---|
| Side face 4 x 6 in (10.16 x 15.24 cm) | [PUB] slice package size |
| Four slices, stack about 10.2 cm wide (face about square) | [EST] read from the photo |
| Body about 1,570 cm3 (inside the 2,050 cm3 published figure) | [CALC] |
| Connectors J11 (D-sub) and J12 on slice 1; J23, J21 (D-sub), J24, J22 (D-sub) on slice 2; J51 (SMA with adapter) on slice 3; J31 (SMA) and J32 (capped, on a chain) on slice 4 | photo labels; sizes [EST] |
| Staked screws on the end covers and face corners, a bolted foot flange with ribs at each end | photo; rear flange [EST] |
| SMA bulkheads on top joined by semi-rigid coax, one run wrapped in foil | photo; exact routes [EST] |
| On the starboard bay floor, connectors facing inboard | [EST], same spot as the old placeholder |

Mesh groups for future hide/show controls: `frontier-radio-slices` (equipment-casings),
`frontier-radio-mounts` (mounts), `frontier-radio-connectors` (interfaces),
`frontier-radio-rf-lines` (harnesses). No circuit boards or other internals are drawn.

## Not Known / Not Modeled

- Whether Dragonfly flies one Frontier or two (redundant). The articles say "the flight radio"
  in one place and "the radios" in another. One unit is drawn.
- The flight unit's slice count and exact connectors; the photo may show another mission's unit.
- Its real location in the bay, mounting interface and cable runs to the IEM, TWTA and
  antennas. The placement is the old placeholder's spot, kept on the floor.
- The 2,050 cm3 figure is larger than the photographed four-slice body; it may describe a
  larger configuration or include connectors and feet.

## Checks

- `tests/frontier-radio.test.mjs`: 4 x 6 inch side face, square connector face, volume not above
  the published figure, four slices that fill the width, independent layer groups, labeled
  connectors present, feet on the floor, connectors inboard, inside the bay, clear of the
  carousel, Wonderwall and DraMS. All 160 tests pass.
- Mission -> Internal and Thermal, isolated at four orbit angles and in context, at 1280 x 800
  and phone width (375 px); no console errors. `model-vs-photo.jpg` compares them.
- Two drafts were fixed before publishing (mirrored connector face; stack too wide); see
  `archive/frontier-radio-2026-10-13/`.

Previous placeholder and restore steps: [`archive/frontier-radio-2026-10-13`](../../archive/frontier-radio-2026-10-13/README.md).
