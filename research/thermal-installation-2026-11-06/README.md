# Thermal installation audit — November 6, 2026

Signed: Codex (OpenAI). Baseline: `83b3e95`, including Copilot's published
Swarmfall isolation. No model, cable route, material, controller or physics changed.

## Review of the preceding two updates

Parts 18/19 follow the published warm-duct / open body return and fore/aft cold
bypass architecture. The open inspection shells are reasonable educational
approximations. Wall thickness, port/throat sizes, elbow shape, installation,
seals and actuator linkage remain estimates, not reconstructed flight hardware.
The existing part research and source packets retain their photographs and credits.

## Evidence rechecked

- [NASA/APL wiring photograph, September 2, 2026](https://science.nasa.gov/blogs/dragonfly/2026/09/02/nasas-dragonfly-gets-wired-up-while-titan-landing-area-is-named/).
  Credit NASA/Johns Hopkins APL/Ed Whitman. Existing original:
  `../nose-bulkhead-2026-10-19/nasa-apl-harness-integration.jpg`;
  inspected crop `../main-harness-2026-10-21/photo-crop-bay-harness.jpg`.
  Supports the general bundled/laced harness appearance, not this clamp position.
- [NASA-STD-8739.4 active record](https://standards.nasa.gov/standard/NASA/NASA-STD-87394),
  revision A, Change 4 (2022). Saved page 29 in
  `../sources/nasa-harness-workmanship/nasa-std8739-4a-c4-029.jpg`:
  support, strain relief and avoidance of damaging edge pressure. General design
  reasoning only; this model is not claimed compliant or mechanically qualified.
- [NASA/APL TFAWS 2024](https://tfaws.nasa.gov/wp-content/uploads/TFAWS2024-AT-02.pdf),
  pages 3, 5, 6, 9: exposed cold duct; real DTM construction and underside photograph.
  Credit Dahway Lin, Diarny Fernandes, Collette Gillaspie, JHUAPL/NASA.
  Reused saved slide 9 in `../sources/tfaws2024-dtm/`.
  The DTM uses polystyrene test insulation and printed Ultem ducting, with
  simplified component obstructions. It does not establish flight tile seams.

No new CGI source, generated image or repeated source-comparison collage.

## Clamp finding

The single raw warm-duct contact is the `power-unit-1-to-rde-1` harness foot
against the joint at z −0.455 m. Foot underside and joint top both meet the
construction floor at y −0.284 m. Evaluating the actual Float32 vertices gives
a signed gap of **−2.7939650593111764e−11 m**, approximately −0.000000028 mm.
This is numerical face seating, not a meaningful geometric penetration.

`audit.mjs` explicitly checks both supporting planes and the overlapping x/z
footprints in the construction frame. Its 1e−7 m epsilon is numerical only,
not a required engineering clearance or a NASA tolerance. Raw triangle-contact
records are retained in `measurements.json`; no broad collision exception or
change to historical audit utilities was made. Real penetration/gap and disjoint
footprints must fail this seat classification. World transforms do not change it.

No geometry was moved or replaced. Therefore no new asset archive/recovery tag
is needed; original thermal and harness archives remain intact. The flat foot
is still a generic support illustration. Flight strap/fastener design, actual
structural bearing and thermal isolation are unresolved.

## Genuine next issue: insulation / exposed cold duct

Both diverter housing surfaces cross the belly surface. The cold channel bottom
is y −0.395 m, whereas the existing beveled belly reaches approximately −0.410 m.
An underside render confirms the belly covers the channel in the whole assembly.
Treat this as one local insulation/exposed-channel boundary package, not two
independent arbitrary holes. The earlier nominal `bellyY = −0.36` is not the
actual lowest beveled surface. Keep equipment/routes fixed during the next trial.

- [ ] Reconcile actual body-surface profile, both housings and cold-channel exposure.
- [ ] Keep the five body regions and component insulation independently removable.
- [ ] Archive prior surfaces and this known-issue view before replacing geometry.
- [ ] Check exposed-channel sightlines, flap sweep and installed contacts together.
- [ ] Label any recess/clearance contour estimated; do not imply qualified seals,
  local foam thickness, adhesive/membrane/800-tile layout or flight attachment.
- [ ] Leave aft collar/bulkhead passage and real actuator linkage source-gated.
- [ ] Keep simulation coefficients unchanged without a separate thermal audit.

## Verification and samples

Four new seat-classification tests pass. Complete suites: **513 simulator tests
and 305 Swarmfall tests pass** (818 total). Swarmfall's 305 tests are now in
its separate folder; the earlier combined 807 count is historical, not a lost
test suite. Boundary tests confirm its vendored simulator copy stays untouched.

`seat-sample.png` is actual existing WebGL geometry, not a newly designed clamp.
`known-belly-boundary.png` records the occlusion for the next pass. `render.html`
provides the three inspection views; `serve.mjs` binds only 127.0.0.1:4216.
The local app's nested Vehicle part assumptions disclosure visibly contains
the corrected part 18 explanation. Its full text stays within expandable notes.

Publication receipt pending deployment verification.
