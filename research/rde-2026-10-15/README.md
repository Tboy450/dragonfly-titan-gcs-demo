# Part 09: Provisional Rotor-Drive Enclosures

Codex, October 15, 2026. **Not a completed photo-referenced asset pass.**
The owner asked to skip the interrupted battery work and prioritize real hardware photos
over CGI. The battery and its duct adjustment are untouched by this pass.

## Evidence and Limits

- Coker et al., Johns Hopkins APL, [ICES-2023-389](https://ttu-ir.tdl.org/server/api/core/bitstreams/0737a596-5ba9-488b-9cc6-0b2ed93e2cd5/content),
  pp. 5 and 7: two RDE boxes; internal fans. Figure 4 is a thermal-model layout, not a
  photograph or dimensioned manufacturing drawing. Saved pages are in
  `../sources/ices2023-389-lander-thermal/`. Used for function and approximate location only.
- Elizabeth Turtle / Johns Hopkins APL, [Dragonfly Update, CAPS, October 22, 2024](https://www.nationalacademies.org/cdn/materials/9fba0b12-d11a-482c-a46a-0b8de31e5dbd),
  slide 27, saved as `caps2024-slide27.png`: real RDE thermal-module test photograph in the
  Titan Pressure Environment Chamber. Obscured by people and test hardware; it does **not**
  establish flight casing, vent, connector or fan geometry. Credit: Elizabeth Turtle /
  Johns Hopkins APL presentation hosted by the National Academies.
- Harsono et al., *Convection Cooling of Power Electronics Operating in Deep-Space*,
  [journal DOI](https://doi.org/10.1115/1.4065947) and
  [conference DOI](https://doi.org/10.1115/IPACK2023-111414): full text/figures could not be
  opened. No geometry or numerical fan specification is derived from inaccessible figures.
  No relevant Dragonfly-specific patent was found in the search.

No CGI appearance was copied. No commercial controller is passed off as Dragonfly hardware.
A clearer flight or engineering-model photo remains necessary.

## Local Implementation

`dist/rotor-drive-electronics.mjs` replaces two solid blocks with hollow, separately grouped
casings, lids, mounting feet, open vents, illustrative impellers, guards and connector blanks.
These details are **[EST] presentation choices**, not features resolved in the test photo.
No boards, semiconductor layout, pinout or cable routing is drawn.

X/Z centers remain (-0.16,-0.55) and (+0.16,-0.55) meters; width 0.24, depth 0.26;
casing floor Y -0.266, lid begins Y -0.09; feet reach bay floor Y -0.284. All are estimates.
The first lid overlapped the rebuilt TWTA waveguide flange and is archived. Previously rebuilt
parts were not moved. New-to-new clearance includes the pending battery.

Groups: `rde-mounts`, `rde-casings`, `rde-covers`, `rde-cooling`, `rde-connectors`.
They prepare layer controls but do not add a toggle UI. Inspection ID remains `rde`.
Thermal uses the existing RDE temperature; fans are static illustrations, not a new solver.

## Completion Gate

Keep part 09 unchecked and the completed-part count unchanged. Obtain readable hardware
photographs or documented engineering examples, distinguish flight hardware from fixtures,
and replace estimated appearance/dimensions. Do not silently promote these details to [PUB].

`tests/rotor-drive-electronics.test.mjs` checks layers, unchanged installed positions when
hiding covers, two units, structural limits, vent openings and per-mesh/tube clearance.
Before/after desktop/mobile and four-angle Internal/Thermal captures accompany the archive
and this folder. See CHANGELOG for final verification.
