# Part 14: TWTA (100 W X-Band Amplifier), Rebuild

Implemented October 14, 2026 by Claude (Anthropic Claude Opus 5.5). Revision
`twta-2026-10-14`. Source: `dist/twta.mjs`. An **educational reconstruction from published
descriptions of the Dragonfly TWTA and photos of flight TWTAs of the same kind**. It is not
CAD, and the Dragonfly unit itself is not pictured anywhere found.

## What Is Published About Dragonfly's TWTA

- **A 100-watt traveling-wave tube amplifier** with the APL Frontier radio at X-band
  ([NASA spacecraft and instruments](https://science.nasa.gov/mission/dragonfly/spacecraft-and-instruments/)). [PUB]
- **Mounted directly to the lander interior top deck**; heat goes to the wall by conduction
  and to the interior gas by convection; one leg of the cruise-stage fluid loop goes to the top
  deck to limit the tube temperatures in cruise (ICES-2020-160 p. 5, saved in
  [`../sources/ices2020-160-thermal-overview/`](../sources/ices2020-160-thermal-overview/README.md)). [PUB]
- **On the underside of the top deck**, on in flight and warm; the cruise loop runs through
  piping in the honeycomb side structure to high-load parts "such as the TWTA" (ICES-2023-389
  pp. 5, 7, saved in [`../sources/ices2023-389-lander-thermal/`](../sources/ices2023-389-lander-thermal/README.md)). [PUB]
- **How many:** NASA's page and ICES-2023 say one TWTA; ICES-2020 (an earlier design stage)
  says "TWTAs". One is drawn.
- ICES-2023 fig. 4's caption mentions the "lander TWT", but the text says the TWTA is not shown
  in that figure (the top deck is removed). A small hot box high on the far wall just aft of
  the attic may be it; it is not used for placement.

## Reference Units (the look and the sizes)

| Source (saved) | What it gives |
|---|---|
| NASA/TM-2010-216262 fig. 1 and tables I-II ([`../sources/nasa-tm-2010-216262-lro-twta/`](../sources/nasa-tm-2010-216262-lro-twta/README.md)); crop `lro-twta-photo-nasa-tm-2010-216262.jpg` | LRO's flight TWTA by L-3: black conduction-cooled tube on a wider silver baseplate with eight bolted ears per side, red staked screws, labels (maker, high voltage, part number, beryllia warning, RF input/output tags), ports on the face; separate black EPC with red screws, a gold D-sub on top and a braided high-voltage cable from its end to the tube's gun end. Tube 37 x 9 x 9 cm, 1.5 kg; EPC 20 x 7 x 11 cm, 1.3 kg |
| DESCANSO MRO telecom ([`../sources/descanso-mro-telecom-2006/`](../sources/descanso-mro-telecom-2006/README.md)); crop `mro-twta-panel-fig2-5.jpg` | A flown 100 W X-band TWTA: two tubes 1.9 kg in total and two EPCs 3.0 kg; tubes and high-voltage supplies as separate boxes linked by waveguide |
| Stellant space TWT sheet and brochure ([`../sources/stellant-space-twt/`](../sources/stellant-space-twt/README.md)); crops `stellant-space-tubes.jpg`, `stellant-twta-tube-and-epc.jpg`, `stellant-epcs.jpg` | Conduction-cooled X-band tube, 40-160 W, 7.0-8.5 GHz, about 895 g; photos of a conduction-cooled tube with its waveguide output on the collector end, EPCs with corner ears, and a TWTA's braided umbilical |
| US 11,854,759 B2 (Thales; [`../sources/patent-us11854759-thales-cc-twt/`](../sources/patent-us11854759-thales-cc-twt/README.md)) | Background: conduction-cooled tubes use their base as the heat sink |

Dragonfly's TWTA supplier is not named in any source found.

## What Was Built

| Feature | Basis |
|---|---|
| One TWTA: a tube (TWT) and a separate EPC joined by a braided high-voltage umbilical | [PUB] one 100 W TWTA; layout as in the LRO and Stellant photos |
| Tube 33 x 7.5 x 7.5 cm on a 9.1 cm baseplate with eight bolted ears per side | [EST] scaled from LRO's tube (37 x 9 x 9 cm, 1.5 kg) to the X-band tubes' mass (0.9-0.95 kg, MRO and Stellant) at the same package density |
| EPC 21 x 7.5 x 11 cm with four corner ears | [EST] scaled from LRO's EPC (20 x 7 x 11 cm, 1.3 kg) to MRO's X-band EPC (1.5 kg) |
| Baseplates bolted up to the underside of the top deck through thermal pads, face pointing down | [PUB] deck mounting and conduction to the deck; thermal pads [EST] |
| Face details: red staked screws at the corners and beside the input, test point, labels for maker, high voltage, input, part number and beryllia warning, two side labels | LRO photo; sizes [EST] |
| RF input: SMA on a small square flange a quarter of the way from the gun end; coax down to the radio's J31 SMA | [EST]: which radio port feeds the TWTA is not published |
| RF output: WR-112 (standard X-band) waveguide flange on the collector end, then runs with mitered corners forward under the deck, down clear of PSU 2, forward and inboard to the high-gain antenna gimbal's rotary joint (revision `twta-2026-10-14b`); flanges and two deck hangers | Stellant photo (output on the collector end); WR-112 standard size; route [EST]. The first version bent straight up into the deck; it is archived in `archive/twta-waveguide-v1-2026-10-14` |
| EPC: staked screws, labels, gold bus D-sub with backshell on the face, high-voltage gland on a square flange at the aft end | LRO and Stellant photos; sizes [EST] |
| EPC bus harness outboard to the starboard wall and forward toward the power units, ending at a tie | [EST] |
| Under the starboard top deck, x 0.115 (tube) and 0.255 (EPC), z -0.05 to 0.28, above the Frontier radio and aft of PSU 2, near the antenna mast (z 0.05) | [EST]; replaces the old placeholder's mid-deck spot |

The cruise loop's piping runs inside the honeycomb panels (ICES-2023), so no exposed pipe is
drawn. Mesh groups for future hide/show controls: `twta-casings` (equipment-casings),
`twta-mounts` (mounts), `twta-interfaces` (interfaces), `twta-harnesses` (harnesses). No tube
internals (gun, helix, magnets, collector stages) are drawn.

## Not Known / Not Modeled

- The Dragonfly unit's maker, size, mass, ports and connectors; whether it is one TWTA or a
  redundant pair.
- Its exact place on the deck underside, and the RF chain between it and the antenna
  (isolator, diplexer, switches, rotary joints); the waveguide stops at the gimbal's under-deck
  rotary joint (part 10).
- Which radio port feeds it and how the EPC is powered (bus harness route).
- The deck panel itself is not drawn as a separate part yet (see the shell and layered-views
  items in `INTERIOR-REALISM-TODO.md`).

## Checks

- `tests/twta.test.mjs`: one tube and one EPC with the umbilical between their glands; sizes no
  larger than the LRO units; everything below the deck underside, with both thermal pads
  against it; starboard, inside the wall; the waveguide reaches the deck ahead of the tube; the
  coax runs from the tube input to the radio's J31; layer groups; clear of every rebuilt part
  (tubes checked as points along their paths, in world coordinates; only the coax plug meets
  J31). All 188 tests pass.
- Mission -> Internal and Thermal, isolated at four orbit angles, from below at four angles and
  in context, at 1280 x 800 and phone width (375 px, no sideways scroll). `model-*.jpg` are
  those views; `model-vs-sources.jpg` sets the model beside the LRO and Stellant photos.

Previous placeholder and restore steps: [`archive/twta-2026-10-14`](../../archive/twta-2026-10-14/README.md).
