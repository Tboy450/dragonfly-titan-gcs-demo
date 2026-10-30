# Part 18 — main warm duct and nose outlet

Codex (OpenAI), October 30, 2026. Continues the open fan transition without
changing the fans, completed transition, equipment positions or simulation.

## Evidence and limits

Rechecked the owner's saved NASA/APL material and the original NASA PDFs:

- [Holtzman and Castaño, TFAWS 2023, slides 3–4](https://tfaws.nasa.gov/wp-content/uploads/TFAWS23-AT-14-Presentation.pdf):
  centerline duct, forward ducted flow and open return through the body; fore/aft
  diverters. Saved pages: ../sources/tfaws2023-thermal-controller/.
- [Lin, Fernandes and Gillaspie, TFAWS 2024, slides 5, 7 and 15](https://tfaws.nasa.gov/wp-content/uploads/TFAWS2024-AT-02.pdf):
  real development-test-module photographs and section/flow context. Saved pages:
  ../sources/tfaws2024-dtm/. Its printed Ultem duct and simplified obstructions
  are test hardware, not a photograph or drawing of the flight installation.

Existing photos/pages are reused rather than copied into another source collage.
They support a gas passage and a nose return turn, not an exact flight grille,
wall thickness, elbow radius, joint, coating or manufacturing method. No exact
dimensioned flight outlet reference was established.

## Change

The old main run, five joint flanges and outlet were solid illustrations.
The old sloped nose box also failed to seat against its separate outlet plate.

- Main run and five joint rings are now open rectangular sections. Their outer
  envelopes, positions, colors and joint spacing remain exact.
- The nose has an open fitted return elbow, meeting the main run and the entire
  underside perimeter of the retained outlet frame. The frame keeps its old
  outer dimensions/pose; its center is now open. No invented detailed grille.
- [EST] wall 1.5 mm; fitted bend radius 85.34 mm and turn 121.51 degrees are
  calculated from retained model endpoints/pose, NOT published flight dimensions.
- Four inspection details: main run, nose elbow, outlet frame and the already
  completed fan transition. Durable part 18 and all 32 top-level IDs retained.
- Implementation: dist/warm-duct-passages.mjs; integration in thermal-loop.mjs.
  No per-frame mesh creation, thermal/flow/power/camera/game/save changes.

## Verification

Six new tests check actual ray openings/rims, outward-facing interior/exterior
walls, segmented bend passage, all four outlet corner seats, retained outer
envelopes, exact preserved meshes/airflow, installation contacts and access masks.
Old fan suites delegate only the four specifically named changed shapes to this
new exact-baseline suite. The completed fan transition is still compared exactly.

**801 full tests pass**, including Claude's incoming 3033b92 review/tests,
fast-forwarded before this change. audit.mjs regenerates measurements.json.

Full installed-model surface screen finds **zero new contact pairs**. Five
inherited pairs remain and are explicitly retained: the run versus two trim
risers/two flaps, and a joint ring versus one main-harness clamp. These are not
claimed to be proper qualified seats. The independently owned trim/routing
packages need follow-up; no equipment was moved to hide them.

Real app Internal/Thermal and 390px checks passed: four detail options plus whole
assembly, 33 top-level menu options/32 numbered entries, Casings hide/restore,
no horizontal overflow and no browser errors. See browser-checks.json and app-*.png.
before-*.png and after-nose.png are actual WebGL captures, not generated images.
The baseline app captures use the archived thermal module with the current UI;
exact original UI/HTML files are separately archived.

## Next / handoff

1. Review part 19's two risers, flap sweeps and cold-duct openings as one adjoining
   interface package, using the saved real DTM material and published sections.
   Include the retained run/flap contacts above, rather than simply cutting holes
   without reconciling the full trim housing. Preserve real source/EST boundaries.
2. Review the one inherited harness-clamp/joint-ring contact as a separate local
   installation fit; do not alter completed harness routes without an exact baseline.
3. Aft collar attachment and bulkhead penetration remain source-gated.

The warm run now has an open bore in isolation. It is NOT a reconstructed complete
flow loop: unchanged trim interfaces still interrupt the installed passage; the
cold duct and aft penetration remain unfinished. No CFD or pressure-loss inference.

Archive/recovery: ../../archive/warm-duct-passages-2026-10-30/README.md.
Private outreach/work-log/temp folders are excluded from this implementation.

Publication receipt will be added after checking the Pages deployment.
