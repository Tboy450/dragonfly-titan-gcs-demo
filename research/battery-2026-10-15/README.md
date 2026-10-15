# Part 15: Battery, Rebuild

Implemented October 15, 2026 by Claude (Anthropic Claude Opus 5.5). Revision
`battery-2026-10-15`. Source: `dist/battery.mjs`. An **educational reconstruction from published
figures, sizes and text**, not CAD.

## Sources and Credits

| Source | What it gives |
|---|---|
| Aerospace America, Paul Marks, Sept. 30, 2022, *Designing Dragonfly, NASA's Titan explorer* ([page](https://aerospaceamerica.aiaa.org/features/designing-dragonfly-nasas-titan-explorer/)) | An 11.5 kWh pack built by APL "using large, high-energy-density cells made by GS Yuasa"; kept near 20 C |
| APL, *Spacecraft and Science Payload* ([page](https://dragonfly.jhuapl.edu/What-Is-Dragonfly/Spacecraft-and-Science-Payload.php)) | A 134 Ah battery charged by the MMRTG |
| ICES-2022-256 real test photos, figs. 10, 11, 13 (`../sources/ices2022-256-battery-module/` pp. 6-7; crops `ices2022-fig10a-test-module-photo.jpg`, `ices2022-fig11-test-module-photo.jpg`, `ices2022-fig13b-test-module-photo.jpg`) | **The look.** APL's 9-cell thermal test module in its chambers: a cream-white lower section with a frame of posts and rails around recessed panels, a flange, a bare aluminum upper housing with three black 2 in fans on its end and round connectors (one large four-pin) on its long face, small black 1 in fans on the lower walls; test thermocouples and Kapton tape (not drawn) |
| ICES-2022-256 text and CAD figs. 2-7 (crops `ices2022-fig2-module-crop.jpg`, `ices2022-fig3-cells-top-crop.jpg`, `ices2022-fig4-cells-crop.jpg`) | A 24-cell battery; the module is 0.40 x 0.24 x 0.50 m, about 41 kg, with six 2 in and eight 1 in fans and copper heat pipes in three directions; attached to the bottom deck in cruise; fans push heat into the lander air in flight. The CAD figures are used **only for the internal arrangement** (upright cells, bus straps, heat pipes, base), not for colors or the outside (owner's rule, October 15: real photos first) |
| GS Yuasa LSE Gen III datasheet (`../sources/gs-yuasa-lse-gen3/`; crop `gs-yuasa-lse-cells-photo-crop.jpg`) | LSE134: 134 Ah, 496 Wh, 130 x 50 x 271 mm, 3.53 kg, champagne anodized aluminum case, two terminals on top |
| ICES-2020-160 p. 4 | Aluminum fin extrusions between the cell stacks; battery bulk temperature rises about 10 C in 30 min of flight |
| ICES-2023-389 p. 5 | Battery kept isothermal by heat pipes (CCHPs); 7.5 kg of phase-change wax melting at 22.5 C buffers flights |
| TFAWS 2023 slide 3 plan view (`tfaws2023-plan-view-battery-crop.jpg`, `tfaws2023-plan-view-ruler.jpg`) | A large ribbed block across the bay just forward of the aft arm roots: px 800-940 along the body and 255-465 across at 327 px/m, so z 0.34-0.77 and about 0.64 m wide |

No battery patent specific to Dragonfly was found.

## What Was Built

| Feature | Basis |
|---|---|
| 24 prismatic cells, 130 x 50 x 271 mm, upright, champagne anodized, two terminals with white caps each | [PUB] 24 cells, GS Yuasa, 134 Ah; cell model LSE134 inferred [EST]; 24 x 496 Wh = 11.9 kWh, within 4% of the published 11.5 kWh |
| Cells four across (0.142 m pitch) and six deep (0.056 m pitch) | [EST] arranged to fit the plan-view block; the test module is three by three of the same cells |
| Aluminum fin plates between the rows | [PUB] fin extrusions between the cell stacks (ICES-2020) |
| Copper heat pipes along all three axes on the sides of the cell block | [PUB] heat pipes in three orthogonal directions; routes [EST] |
| Copper bus straps joining the cells in series, row by row, and two main leads | [EST] the series layout; straps as in fig. 3 |
| Enclosure 0.62 x 0.40 x 0.33 m: a cream-white lower section (frame of posts and rails standing out from recessed panels) up to the cell tops, a bolted flange, and a bare aluminum upper housing over the terminals and bus straps with a bolted lid (see-through in Internal) | Look from the real test photos (figs. 10, 11, 13); size [EST] from the plan view, cell height and the deck above. The test module's upper housing is taller (about a third of its height); here it is limited by the top deck |
| Three 2 in fans on each end of the upper housing; 1 in fans on the lower walls, two per wall (eight) | [PUB] counts and sizes, and the 2 in fans' place, from the test module photos; 1 in positions [EST] |
| Base on four corner pads beside the warm duct, so the duct runs under the battery | [EST]; ICES-2022 says the battery attaches to the bottom deck |
| Upper housing's forward face: one large four-pin round power connector and two smaller round connectors on the port half, cables down the face and forward to a tie | Connector types from the test photos; positions, the forward face and routes [EST] (kept to the port half, clear of the TWTA's cable on the starboard side) |
| Center z 0.565 (moved 1 cm aft from the first draft to clear the TWTA's high-voltage cable) | [EST] inside the plan-view block |

The phase-change wax is not drawn: where it sits is not published. Mesh groups:
`battery-mounts` (mounts), `battery-enclosure` (equipment-covers), `battery-cells`
(equipment-casings), `battery-bus-bars` (harnesses), `battery-connectors` (interfaces).

## Also Changed

The warm duct (part 18) was lowered 7.5 mm (y -0.305 to -0.3125) so its joint flanges sit below
the bay floor line instead of 7.5 mm above it, where one met the battery's base. The first
position is archived in `archive/warm-duct-v1-2026-10-15`.

## Not Known / Not Modeled

- The flight cell model, the pack's real size, cell arrangement, enclosure, fan layout, heat-pipe
  routes and where the phase-change wax is.
- How the pack mounts to the bottom deck; whether it sits over the duct.
- Noted, not fixed (older part): the battery temperature sensor placeholder (#20) sits inside the
  new enclosure; settle it when #20 is redrawn.

## Checks

- `tests/battery.test.mjs`: 24 cells of 130 x 50 x 271 mm upright; 24 x 496 Wh within 5% of
  11.5 kWh; the test module holds three by three cells; on the floor, under the deck, inside the
  plan-view block; base above the warm duct and pads beside it; fin plates, heat pipes in x, y and
  z, enough straps for a series string, six 2 in and eight 1 in fans; cells inside the enclosure;
  lid see-through; layer groups; clear of every rebuilt part, including Codex's provisional RDE
  enclosures. All 207 tests pass.
- Mission -> Internal isolated at two angles, installed at two angles, Thermal; no console
  errors. `model-*.jpg` are those views; `model-vs-sources.jpg` sets them beside the real test
  photos and the cell photo (the CAD crop is labeled as arrangement only).

Previous placeholder: [`archive/battery-2026-10-15`](../../archive/battery-2026-10-15/README.md),
which also keeps the unpublished CAD-look draft.
