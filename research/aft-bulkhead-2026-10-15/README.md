# Part 16: Aft Bulkhead and Generator Interface

Geometry by Claude (Anthropic Claude Opus 5.5), October 15, 2026.
Verification, archive and release closeout by Codex (OpenAI), October 16, 2026.
Claude's geometry is preserved; Codex corrected a clearance-test false positive and completed
the documentation. This checked-off pass remains an approximate, photo-referenced model.

## Sources checked

- [NASA, April 23, 2026: top-deck fit check](https://science.nasa.gov/blogs/dragonfly/2026/04/23/nasas-dragonfly-rotorcraft-gets-decked-out-tested/).
  Real structure photograph; original already saved at
  `research/lander-structure-2026/nasa-apl-top-deck-fit-check.jpg`.
  Credit: NASA/Johns Hopkins APL/Ed Whitman. The end structure's ribbed circular feature,
  pocketed perimeter and gold-colored appearance inform the draft; exact dimensions and
  material/coating are not established by appearance.
- [NASA, July 9, 2026: structural testing](https://science.nasa.gov/blogs/dragonfly/2026/07/09/nasas-dragonfly-clears-key-tests-as-titan-rotorcraft-takes-shape/) and
  [APL's same-day article](https://www.jhuapl.edu/news/news-releases/260709-dragonfly-clears-key-tests-as-assembly-comes-together).
  The article explicitly describes mass simulators during structural testing. A pictured
  cylinder is test equipment, not proof of flight-MMRTG surface detail or internal plumbing.
  It says flight bulkheads were to be populated in July, so a test-frame photo should not
  automatically be treated as the final interior bulkhead arrangement.
  **Orientation settled:** both articles explicitly describe the vibration-table structure as
  inverted. The generator-side cylinder points down in that fixture; restoring the vehicle's
  upright orientation puts its axis aft/up. This agrees with the APL CAD cross-reference.
  Full-resolution original: `nasa-apl-inverted-vibration-test-2026.jpg`, from
  [APL's image file](https://www.jhuapl.edu/sites/default/files/2026-07/20260709-Dragonfly-Lander-Vibe-Table.jpg).
  Credit: NASA/Johns Hopkins APL/Ed Whitman. This photo establishes configuration and visible
  structure, not dimensions or flight-MMRTG internal construction.
- Claude's `mmrtg-tilt-evidence.jpg` compares the real photos with APL 2024 CAD. Preserve it
  as the original research artifact: its first heading says aft/down **in the inverted test
  pose**, not in flight. The 25-degree angle is measured approximately by Claude, not a
  published flight specification. CAD is used for layout/orientation, not appearance.
  The original 2024 video, credits and hashes are saved in
  [`../apl-spacecraft-models/`](../apl-spacecraft-models/README.md); source:
  [APL spacecraft and payload](https://dragonfly.jhuapl.edu/What-Is-Dragonfly/Spacecraft-and-Science-Payload.php).

## Parameters and checks

`aftBulkheadAsset`: tilt 25 degrees [EST]; interface center [0,-0.1,1.106] m [EST]; plate
width 0.7 m, local top 0.198/bottom -0.242 m, thickness 0.012 m [EST]. Aft fuselage foam,
MMRTG pose, antenna position and fan/duct placement are coupled to this asset. Keep the
module with its imports in `vehicle-research.mjs` and `thermal-loop.mjs`.

Codex corrected a false collision in `tests/aft-bulkhead.test.mjs`: non-tube vertices now
transform directly into the panel frame. The actual fan-adapter end is at local z -0.014 m,
2 mm forward of the plate at -0.012 m. All five part tests pass. These tests establish
geometric consistency of the estimates, not agreement with final flight hardware.

## What was built and what remains unknown

- Real photos inform the gold-colored face, pocketed perimeter, ribbed circular interface,
  fastener rows and labels. Exact shapes/counts are simplified estimates. Coating/material
  identification is unknown; gold appearance does not establish chem-film or metal type.
- The panel is canted and the generator axis rises aft at 25 degrees [EST]. The body's aft
  foam face follows it. Generator geometry was retained and reposed; the MMRTG sensor follows
  its fin root. The low-gain antenna is 9 cm farther forward [EST].
- Fans moved from z 1.16 to 1.04 m [EST] to fit the panel; the warm duct transition and
  illustrative airflow path follow them. Their short collar ends 2 mm before the panel.
  How gas actually crosses the structure and connects to the generator is unpublished;
  no invented aperture or internal channel is drawn. This is an illustrative interface,
  not validated fluid or structural analysis. Fan/power/thermal simulation constants stay intact.
- Separate plate/casing, interface and mount groups support the inspection controls.
  Isolating #16 includes the generator and circulation fans so their relationship is visible.
- Dimensions, installed placement, detailed final flight bulkhead configuration, MMRTG mount
  engineering and exact tilt remain open follow-ups. Completion means this approximate asset
  and its checks/records are complete, not that final flight CAD has been reconstructed.

## Archive and visual verification

[`archive/aft-bulkhead-2026-10-15`](../../archive/aft-bulkhead-2026-10-15/README.md) saves the last
committed rectangular panel, level MMRTG, old body face and fan placement, exact original files,
Internal/Thermal at four angles, installed side view and desktop/390/360 px captures.
[`archive/fans-v1-2026-10-15`](../../archive/fans-v1-2026-10-15/README.md) records the coupled fan
placement. Both archive tags point to baseline `f216162`.

The initial failed clearance test and unchanged draft geometry/pictures remain in
`archive/aft-bulkhead-2026-10-15/review-draft/`. Current `aft-*.png`, `render-checks.json` and
`model-vs-sources.jpg` show the new model and comparison. Multi-angle WebGL checks verify
nonblank framed geometry, no script errors and no horizontal overflow on desktop and phones.
No image generation was used.
