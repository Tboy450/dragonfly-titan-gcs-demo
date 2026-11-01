# Part19 — fitted bypass interfaces

Codex (OpenAI), November1,2026. Follows part18's published open warm duct.
One adjoining passage package, not a new thermal solver or flight valve design.

## Sources and confidence

Rechecked the existing saved real DTM photo and associated CAD/section pages:

- [NASA/APL TFAWS2024](https://tfaws.nasa.gov/wp-content/uploads/TFAWS2024-AT-02.pdf),
  slides9/15/16: actual test hardware, duct layout, and the two diverter flaps.
  Slide9 real photo is ../sources/tfaws2024-dtm/tfaws2024-at-02-slide09.jpg;
  other used pages are saved in that same source packet. Credit: Dahway Lin,
  Diarny Fernandes, Collette Gillaspie, Johns Hopkins APL / NASA TFAWS2024.
- [NASA/APL TFAWS2023](https://tfaws.nasa.gov/wp-content/uploads/TFAWS23-AT-14-Presentation.pdf),
  slide4: fore/aft gas diversion through the exposed cold bypass. Saved source
  pages in ../sources/tfaws2023-thermal-controller/; Holtzman and Castaño, APL.

[PUB] arrangement and test behavior, not exact flight duct surfaces. The DTM used
printed Ultem and simplified thermal obstructions; it is not flight hardware.
Real photo reused for appearance/context; CAD only for topology. No new generated
image or repeated source collage. Detailed walls, ports, seals, installation and
actuator linkage remain [EST]/unconfirmed.

## What changed

- Cold channel now has a bore within its unchanged outer envelope.
- Two warm-floor openings fit around the unchanged flaps; roof/sides remain.
- Hollow fore/aft connectors meet their floor ports and cold-channel end planes.
  The prior illustration's 10/30 mm gaps are removed; these were model gaps,
  not measurements of flight hardware.
- [EST] walls1.5 mm; ports131×93 mm; top package134×96 mm; straight throat6 mm.
  The throat is sized for the retained6 mm-thick flap, not a flight design claim.
- Retained foam-housing outlines have local2 mm clearance cuts. They represent
  surfaces only, not foam thickness, exact tile lines or qualified sealing.
- Existing flaps, hinges, actuators, ribs, fan/nose geometry, placement constants,
  arrow curves and simulated temperatures/flow/power remain exact.
- Part19 has three details (cold channel/front connector/aft connector), still
  one of32 numbered assemblies. Casings/Interfaces/Insulation remain independent.

Implementation: dist/trim-interfaces.mjs plus specific calls in thermal-loop.mjs
and warm-duct-passages.mjs. No per-frame geometry, extra state or game/lab change.

## Checks and retained limits

**807 full tests pass**. Six new tests cover floor openings/retained rims/roof,
both uncapped connector passages/cold-end seats, closed/open flaps, every integer
degree0–24 through the fixed geometry, exact baseline preservation, installed
contact changes and inspection/layer metadata. Prior guards delegate only the
five named trim families and existing warm-run family to this exact new suite.

The first direct-taper draft clipped the thick flap at all sampled settings.
Its code and50-hit audit are in the archive's rejected-direct-taper/. The6 mm
straight throat yields zero sampled flap contacts. This is a geometric screen,
not a tolerance stack, seal/contact-force or aerodynamic qualification.

Full-model audit: four old warm-run/trim conflicts removed; **zero new contact
pairs**. Two inherited housing/body-belly insulation surface contacts remain,
plus the separate warm-duct joint/main-harness clamp contact. Do not report
the entire lander installation, insulation or gas loop as collision-free.
audit.mjs regenerates measurements.json, including original/current contacts.

Actual local app Internal/Thermal/390px checks:32 numbers/33 menu options,
three detail targets, Casings/Insulation hide/restore, widths375/375 and no
browser errors. Only fresh local preview's arrival was skipped; no personal
mission reset. Actual WebGL before/after/insulation/open-port and app samples
saved here. render.html provides an angle slider and hides surrounding surfaces
for inspection without changing any simulation code.

## Next

1. Review the inherited joint/main-harness clamp contact as one local fit while
   preserving completed cable paths/endpoints.
2. Reconcile the two housing/body-belly surface boundaries with the insulation
   package. Flight foam thickness/seals are not publicly established here.
3. Aft collar attachment/bulkhead penetration remains source-gated. Actual
   actuator linkage, seal design and complete flight gas circuit are unmodeled.

Archive and exact restore baseline09a03d4:
../../archive/trim-interfaces-2026-11-01/README.md.

Publication receipt pending successful Pages/live verification.
