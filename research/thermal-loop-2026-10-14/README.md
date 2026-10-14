# Parts 17, 18 and 19: Circulation Fans, Warm Duct and Trim Device

Implemented October 14, 2026 by Claude (Anthropic Claude Opus 5.5). Revision
`thermal-loop-2026-10-14`. Source: `dist/thermal-loop.mjs`; the flow arrows in
`dist/vehicle-research.mjs` follow it. Replaces the single fan cylinder, the duct box and the
side "chimneys" with flaps, archived in
[`archive/thermal-loop-2026-10-14`](../../archive/thermal-loop-2026-10-14/README.md).

## Sources (all published)

| Source | What it gives |
|---|---|
| TFAWS 2023 (Holtzman and Castano, APL) slide 4, saved as [`../sources/tfaws2023-thermal-controller/tfaws23-at-14-slide04.jpg`](../sources/tfaws2023-thermal-controller/README.md) | The loop: fan and ducting at the MMRTG; ducted flow forward under the floor; open flow into the body under the nose and aft through the bay to the MMRTG; a **cold duct** along the belly between **gas diverter valves "located fore and aft of the Lander ducting"**, beside the leg and arm attachments; "Lander temperatures are controlled with a cold duct trim device" |
| TFAWS 2023 slide 3 plan view (`tfaws2023-slide3-plan-view-ducting-fans.jpg`) | The ducting on the centerline and the **Fans**, two side by side, at the MMRTG end ("bypass duct not shown") |
| TFAWS 2023 slides 7-8 | Fan-A and Fan-B; Divert1 and Divert2; trim opening in 2% steps up to 40% of the airflow; ≥810 W rejection, ≤36 W closed leak, response ≤10 min; 15 W fan allocation |
| TFAWS 2024 (Lin, APL), slides 5-16 in [`../sources/tfaws2024-dtm/`](../sources/tfaws2024-dtm/README.md) | Full-scale test of the "3D-printed cold duct trim device" with an **aft and a front diverter flap**; heat rejection vs flap angle up to 23.7 degrees (245.7 W, Ultem duct, not flight-like); a flight-like fan at 5,000-6,200 rpm; the section (slide 7) shows the duct under the floor and the cold duct below it, with foam-wrapped flap housings under the belly |
| ICES-2023-389 p. 2-3, 7 | Air enters the body below the nose; the hottest ducting is around the fan, where air leaves the MMRTG. Its trim device is a **43 x 34 x 2.54 cm chimney on each side** with foam caps: an earlier concept, superseded by the cold duct in the two later talks |

## What was built

| Part | Basis |
|---|---|
| Two fans (A and B) side by side, about 0.115 m rotors in purple housings, with an adapter back to the MMRTG | TFAWS 2023 slides 3, 7 [PUB]; size [CALC] from the plan view; housing and adapter shapes [EST] |
| Warm duct 0.14 m wide on the centerline from the fan transition (z +0.93) to the nose (z -1.18), turning up into the body below the nose; flange rings | plan view [CALC]; ICES-2023 [PUB]; height 4.5 cm [EST] |
| Cold bypass duct under the belly, outside the foam, from z -0.56 to +0.60, with ribs | TFAWS 2023 slide 4, TFAWS 2024 [PUB]; section 0.14 x 0.035 m [EST] |
| Fore (z -0.61) and aft (z +0.67) diverter flaps in the warm-duct floor, in foam-wrapped wedge housings below the belly, with actuators; both open with the trim setting up to 24 degrees | [PUB] two flaps and the angle range; positions inboard of the leg attachments [PUB, slide 4]; housing shapes, hinge sides and actuators [EST] |
| Flow arrows: through the fans and duct to the nose, aft through the bay; at trim, forward through the cold duct between the flaps | slide 4 [PUB] |

## Notes

- The part keeps its durable id `trim-chimneys` so saved selections still work; its label and
  text now describe the cold duct.
- The side-chimney drawing (ICES-2023's concept) is archived, not deleted.
- TFAWS 2024 mentions a "split cold duct" for the lander model; what is split (two ducts side by
  side, or two sections) is not stated. One duct is drawn.
- `RESEARCH-COMPENDIUM.md` says the flaps are "aluminum flaps covered in foam, one on each side at
  the aft end, driven by linear actuators"; that detail was not found in the saved papers and is
  left as recorded, with a note.
- Noted, not fixed (older parts): the old placeholder boxes for the drive electronics, battery,
  nose electronics and aft bulkhead reach down into the under-floor duct zone; they are fixed
  when those parts are redrawn.

## Checks

`tests/thermal-loop.test.mjs`: two fans side by side aft of the duct; the duct 0.14 m wide on the
centerline under the floor, turning up at the nose; the cold duct outside the foam under the
belly, spanning the two diverters, which sit inboard of the leg attachments; the main path passes
the fans and duct and the bypass runs forward through the cold duct; no overlap with any rebuilt
part (tubes sampled along their length). The air-loop test now checks the aft and front flaps
and 20 arrows through the one cold duct. 183 tests pass. `model-vs-sources.jpg` compares TFAWS
2023 slide 4 and the TFAWS 2024 section with the model.
