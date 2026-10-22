# Port Wall and End Interfaces

Codex (OpenAI), October 22, 2026. Continues the accepted starboard wall without rebuilding
the numbered parts. No image generation; original real hardware photographs and saved
technical pages reused with their credits.

## Evidence

- [NASA April 23 primary-structure report](https://science.nasa.gov/blogs/dragonfly/2026/04/23/nasas-dragonfly-rotorcraft-gets-decked-out-tested/),
  rechecked this pass: honeycomb primary panels designed by Johns Hopkins APL, manufactured
  by Lockheed Martin Space, with 0.01-inch aluminum face sheets. [PUB] 0.254 mm conversion.
  [Original April hardware photo](../lander-structure-2026/nasa-apl-top-deck-fit-check.jpg)
  shows the side-to-aft interface and exposed panel edges, not the hidden fittings drawn here.
- [APL July 9 structure report](https://www.jhuapl.edu/news/news-releases/260709-dragonfly-clears-key-tests-as-assembly-comes-together),
  rechecked: structure, vibration and sealing tests; instruments/wiring/insulation integrated
  later. [Original frame photo](../rotor-heads-2026-10-15/nasa-apl-lander-frame-tap-test-2026-05.jpg)
  informs silver faces, visible joints/fasteners and local tape. Both real photographs credit
  NASA/Johns Hopkins APL/Ed Whitman. Hoists, bungees, red test blocks and temporary test leads
  are not treated as flight hardware. A picture of one side does not establish the unseen
  side's exact apertures, core, fastener counts or fitting dimensions.
- [ICES-2023-389 p5 thermal CAD](../sources/ices2023-389-lander-thermal/ices2023-389-p05.jpg),
  Coker et al., JHUAPL, [paper](https://ttu-ir.tdl.org/server/api/core/bitstreams/0737a596-5ba9-488b-9cc6-0b2ed93e2cd5/content):
  arrangement context only, not appearance or joint/layup dimensions.
- [Saved DragonCam sources](../sources/dragoncam-2026/README.md), Clark et al., MSSS,
  [paper](https://arxiv.org/abs/2601.13221): actual camera types and optical geometry, not
  new flight wall-cutout dimensions. Existing camera models and positions are unchanged.

## What Was Built

`dist/side-wall.mjs` retains its original default starboard output. Optional `side:-1`
builds the port panel with its own metadata, targets and second camera relief, using the
same face-sheet geometry helper rather than duplicating a second panel implementation.
The exact starboard mesh/pose manifest still matches the before snapshot.

[PUB] two actual-thickness 0.254 mm faces. [EST] port x=-0.3725..-0.3605 m,
z=-1.50..+0.99 m, y=-0.31..+0.07 m, 12 mm separation, outline, silver finish,
edge closeouts, tape and fasteners. Bottom-edge reliefs: z=0.10..0.22 m up to
y=-0.19 m for Down Camera; z=0.29..0.455 m up to y=-0.148 m for Microscopic
Camera/LED installation. Reliefs fit existing hardware, not exact flight apertures.
No core cells, core alloy, inserts, adhesive or hidden electronics invented.

`dist/wall-end-joints.mjs` adds separate **Wall end joints (estimated)**, not a new number.
Simple side webs and transverse returns join the existing walls to the nose panel's
side edge and the aft panel's side rim. [EST] 1.5 mm fitting thickness, dimensions,
finish and fastener arrangement. Nose connection uses existing panel position/depth/width.
Aft uses the existing 25-degree frame and local rim z=-0.035 m, not a vertical seam.
World y=-0.285..+0.040 m; the taper spans the existing wall-to-bulkhead gap.
No pressure seal, electrical bonding performance, load rating, hidden insert/bondline,
new structural/thermal solver or verified disassembly procedure is claimed.

The IEM's existing six estimated wall-bolt tips meet the new inner face within 0.1 micrometer
numerical tolerance; they are contacts, not penetrating equipment. Its existing braided
ground-bond endpoint extends about 1.46 mm into the unmodeled panel region, explicitly
recorded as a bounded installation-contact approximation, not a verified flight bond design.
No IEM geometry or route was changed to make that contact. A later mount/bond pass should
resolve the actual termination rather than silently moving the equipment now.

## Inspection and Unfinished Construction

- Port outer/inner/edge targets with independent Covers/Casings/Mounts masks.
- Joint nose/aft targets, with independent Mounts/Interfaces masks. Isolation retains the
  two walls and end bulkheads as context. No new numbered callout or reassigned ID.
- Global **Structural wall panels** hides both walls and joints; older Body shell and
  Attic shell controls remain distinct. Long notes stay under existing expandable sections.
- Older combined body/foam is retained, not suddenly a separately modeled insulation stack.
  Opening a facing exposes unmodeled core space, not proof of a hollow flight panel.
- Core/adhesive/inserts, exact joint detail, local insulation/blisters, deck and attic boundary,
  shoulder load paths and detailed seals remain open. Thermal uses the shared bay node,
  not wall temperatures or qualified material conductance. No flight, energy, game or save changes.

## Process and Verification

- [Real/CAD/model/app comparison](port-wall-joints-real-cad-model-comparison.jpg), plus
  raw port/joint renders and close nose/aft samples with existing bulkheads translucent.
  Original source images remain in their credited folders; no duplicate downloads.
- [Exact before files, six views, manifests and restore notes](../../archive/port-wall-joints-2026-10-22/README.md).
  Baseline `8ac4e59`, recovery tag `archive/port-wall-joints-2026-10-22`.
  No rejected geometry draft: model stayed unchanged while helper contact tolerances,
  existing camera ID and case-sensitive text matching were corrected.
- Eight new tests: port thickness/negative-x pose, actual reliefs, nose edge contact,
  canted aft geometry, masks/restoration/context, finite/bounded geometry, unchanged
  optical aim/clear sightlines, bounded pre-existing IEM wall contacts.
- Full suite: **481 pass, zero failures**, saved in `tests.txt`.
- Local Edge: **42** Internal/Thermal viewport/subassembly cases (24 port +18 joints),
  at1440/390/360px; three port masks/two joint masks/global mask/restore, source links,
  stable24 rows, installed context and Pilot return. No page/network failures or overflow.
- Every numbered part plus the accepted starboard panel matches the baseline geometry/pose
  manifest exactly (JSON-normalized signed zeros). Wall-face triangle/plane samples have
  no unintended crossings. One bounded IEM bond contact is saved separately. Joint vertices
  clear equipment; mating walls/bulkheads are intentionally excluded from equipment collision
  checks and their contact geometry is unit-tested. Curved TubeGeometry candidates use
  the actual sampled centerline/radius after the bounding-box broad phase. Initial broad
  candidates for the two long sample tubes are retained in the archive; narrow phase clears
  them, without moving those tubes. These are visualization checks, not mechanical certification.
- Three views per new assembly and two contextual details pass nonblank/framed WebGL
  pixel checks. Comparison and raw/detail renders visually reviewed before publication.

## Next / Handoff

**Deck and attic boundary next:** inventory the current deck geometry, its source and
what it hides before editing. Fit supports/access/penetrations around the existing HGA,
TWTA, sample transport and attic instruments; do not rebuild those completed parts.
Keep skins, decks, equipment covers and foam independently removable where supported.
After that, separate body/attic insulation regions and local camera blisters. Preserve
published thickness versus estimated layup, original24 IDs and all prior archives.
Detailed shoulder loads, IEM bond termination and flight fitting/seal evidence remain
follow-ups. Broader harness/support/layer-preset/UI audit packages stay open in the checklist.
