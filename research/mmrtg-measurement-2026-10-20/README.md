# Part 21: MMRTG Fin-Root Temperature Input (Annotation)

Claude (Anthropic Claude Opus 5.5), October 20, 2026. Same treatment as Codex's part 20 pass
([battery-measurement-2026-10-20](../battery-measurement-2026-10-20/README.md)): the old
placeholder is replaced by a clearly labeled measurement annotation, **not a reconstructed
flight sensor**. Part 21 stays unchecked; the count stays **20 of 24 (5 Codex, 15 Claude)**.

## What the sources establish

| Source (saved) | What it shows | Used for |
|---|---|---|
| Holtzman and Castano, NASA/APL, *Dragonfly Lander: Thermal Controller Design*, TFAWS 2023, slides 7 and 9 ([pages saved by Codex](../sources/tfaws2023-battery-feedback/README.md); [PDF](https://tfaws.nasa.gov/wp-content/uploads/TFAWS23-AT-14-Presentation.pdf)) | Two PID/PI controllers taking turns about every 10 minutes: battery temperature drives the trim device; **"MMRTG fin root temperature"** drives the fans (Fan-A, Fan-B speed). "MMRTG fin root temperature is sensitive to flow rate." Historical pre-decisional design. | [PUB] that the fin-root temperature is a control input; app text |
| NASA, *Multi-Mission Radioisotope Thermoelectric Generator* fact sheet NF-2020-05-619-HQ ([pages](../sources/nasa-mmrtg-factsheet/README.md); [PDF](https://science.nasa.gov/wp-content/uploads/2024/02/mmrtg-factsheet-updated-5-18-20-1.pdf)) | Fin-root temperature 157 C / 315 F; 64 cm fin tip to fin tip, 66 cm long; Dragonfly's baseline power source | [PUB] the rating quoted in the app; the generator's size (already modeled) |
| Toth and Turyshev, *Pioneer Anomaly: Evaluating Newly Recovered Data*, 2007 ([pages](../sources/pioneer-rtg-fin-root-2007/README.md); [arXiv:0710.2656](https://arxiv.org/abs/0710.2656)) | Each Pioneer 10/11 RTG carried one "fin root temperature" sensor | Context only: RTG fin-root sensors have flown. **Not evidence** of Dragonfly's sensor, its type, count or position |

Searched October 20 without finding more: NASA's Dragonfly blog (newest post September 2,
2026) and APL news releases (nothing Dragonfly-related after July 9, 2026); web searches for
MMRTG fin-root sensor type, PRT/thermocouple, telemetry and Curiosity/Perseverance engineering
data. No public photo, drawing or text gives the flight sensor's package, maker, count, exact
point, bonding or harness, or says whether it belongs to the generator or the lander.

## What changed

- `dist/mmrtg-measurement.mjs` (revision `mmrtg-measurement-annotation-2026-10-20`): a green
  ring and crosshair (same style as part 20) lying flat on the modeled generator housing,
  12 degrees to starboard of the top fin's root and 5 cm aft of the housing's middle, posed
  with the generator (`poseMmrtg`, part 16). Position and size [EST].
- The old 4.4 cm green sphere sat at the top fin's root and passed through that fin; isolated,
  it floated alone because the generator was not shown. Isolating part 21 now shows the MMRTG
  (`inspectionGroups`).
- Part text (`layers-panel.mjs`): what is published, that the target is an annotation, that the
  temperature shown is the modeled MMRTG gas (the simulator models neither the fin root nor the
  second controller), and a live line with the fans' speed, flow and generation. Sources: the
  TFAWS slides and the MMRTG fact sheet.
- The label and source line in `vehicle-research.mjs` say "annotation, not sensor hardware".
- No physics, thermal or power values changed; the MMRTG itself is unchanged.

## Checks

- `tests/mmrtg-measurement.test.mjs` (5 tests): annotation metadata and no sphere; follows the
  generator's pose, tangent to and outside the housing; crosses none of the eight fins (each
  checked in its own frame) and sits beside the top one; the modeled MMRTG still has the housing
  and fins the target was placed against (flags a future MMRTG redraw); isolation includes the
  MMRTG; the checklist keeps 21 unchecked.
- Codex's part 20 test that part 21 was untouched now compares the two archived copies (part
  20's pass did leave part 21 alone), and ignores line endings.
- Full suite: 414 pass.
- Real Edge (`verify-render.cjs`, Playwright): part 21 isolated in Internal and Thermal at
  1440/390/360 px with no page overflow, four orbit angles, a close view, part text and sources,
  return to Pilot view, no page errors. `after/` here; the old build (a checkout of `d016f12`)
  in `../../archive/mmrtg-sensor-2026-10-20/before/`. `before-after.jpg`: old left, new right.
- Seen in the app: the ring shows on the housing beside the fin root; from the far side the fin
  hides it while its number still draws (the open far-side label item in the checklist).

## Continue from here

Look for the flight sensor itself: an MMRTG interface document, a Dragonfly integration photo of
the generator area, or a paper naming the sensor. If found, archive this annotation and draw the
real part. The MMRTG model (a 0.2 m core with eight fins) is not yet redrawn from MMRTG photos;
if it changes, `tests/mmrtg-measurement.test.mjs` will ask for the target to be re-placed.
