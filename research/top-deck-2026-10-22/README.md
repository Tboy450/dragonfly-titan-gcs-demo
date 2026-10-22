# Top Deck / Attic Edge

Codex (OpenAI), October 22, 2026. One additive deck-construction pass. Existing numbered
equipment, walls, joints and combined foam remain unchanged. No image generation.

## Evidence and Inventory Before Editing

- [NASA April23,2026 primary-structure report](https://science.nasa.gov/blogs/dragonfly/2026/04/23/nasas-dragonfly-rotorcraft-gets-decked-out-tested/),
  rechecked this pass: APL-designed/Lockheed Martin-manufactured honeycomb panels have
  0.01-inch aluminum facesheets; top deck carries telecommunications components.
  [Original real fit-check photograph](../lander-structure-2026/nasa-apl-top-deck-fit-check.jpg),
  NASA/Johns Hopkins APL/Ed Whitman. Real assembly context/finish, not a scale drawing or
  complete view of the panel's hidden construction. Ground hoist/fixtures are not modeled.
- [ICES2020 p5](../sources/ices2020-160-thermal-overview/ices2020-160-p05.jpg),
  [source record](../sources/ices2020-160-thermal-overview/README.md),
  [paper](https://ttu-ir.tdl.org/server/api/core/bitstreams/40dace65-c244-4971-9245-67ae466f1e15/content):
  TWTA deck mounting and heat paths; cruise-stage liquid loop is a cruise reference, not
  a new active Titan cooling system in this pass.
- [ICES2023 p7](../sources/ices2023-389-lander-thermal/ices2023-389-p07.jpg) describes TWTA
  on the underside of the top deck. [Saved p3/p5 figures](../sources/ices2023-389-lander-thermal/README.md)
  locate HGA/attic equipment. Coker et al., JHUAPL; thermal CAD is arrangement-only,
  not appearance, exact apertures or structural layup evidence.
- [APL July2026 HGA arm report/photo](https://www.jhuapl.edu/news/news-releases/260709-dragonfly-clears-key-tests-as-assembly-comes-together)
  and [existing HGA source record](../hga-actuators-2026-10-14/README.md) support the
  gimbal/locks context, not the new illustrative foundation dimensions.

Before this pass there was **no independent top-deck structure mesh**. The combined
`fuselage` solid/foam surface represented the low top; `attic` was another combined
cover/foam solid. Walls/joints were separate. HGA and TWTA already shared a y=0.07 m
mounting plane, but neither owned a continuous deck. The Wonderwall is a separate existing
numbered warm/cold instrument partition and is not replaced by this edge treatment.
Exact original sources are reused in their credited folders, not downloaded again.

## Model and Limits

`dist/top-deck.mjs`, revision `top-deck-2026-10-22`, adds unnumbered **Top deck / attic edge**.
[PUB] two actual-thickness 0.254 mm aluminum faces (0.01in x25.4). [EST] total12mm depth;
bottom/top y=0.070/0.082 m, half-width0.3725 m, front/aft z=-0.73/+0.99 m, clipped
corners18mm. Datum is the existing HGA/TWTA plane; width follows the existing side walls.
Outline, finish, edge closeouts, fasteners, short lip and foundation details are estimates,
not final flight CAD. Core cells, alloy, bonds, inserts, detailed fastener bores and seals
remain unmodeled. Removing a face reveals unmodeled core space, not a hollow flight deck.

The through-opening is [EST] radius121mm centered at x=0,z=-0.55 m. Initial89mm opening
cleared the85mm collar but crossed the **existing rotating foam dome** at the upper deck
surface. Failed model/test, three renders and report are archived. Only the opening was
enlarged; no HGA geometry or pose changed. Its new radius is a clearance for this model's
combined dome envelope, not a published flight aperture or verified seal/thermal interface.

Three simple foundation examples span y=0.082..0.100 m under the existing launch-lock
and two flight-lock bases. Their sizes/placement are [EST], derived from those existing
base centers; not verified inserts or qualified load paths. Existing bases are unchanged.
TWTA's two existing thermal pads meet the new underside at0.07 m; no new conductance,
coolant route, material temperature, mass or strength calculation is introduced.

The18mm-high front lip is a short **attic-edge closeout**, not a full-height bulkhead,
Wonderwall replacement or new warm/cold barrier. Deck/attic internal supports and service
details not established by the sources stay open. Existing sample routes stay unchanged.

## Layers and Remaining Foam

- Three targets: faces; edges/opening/attic lip; stow-lock foundation examples.
- Covers/Casings hide upper/lower face separately. Mounts hides edge fittings/lip and
  foundations; Interfaces independently hides the opening rim. No parent mask accidentally
  hides the independent interface group.
- Global **Deck / attic edge** hides the whole new assembly. Structural wall panels,
  Body shell and Attic shell retain their existing meanings. Original24 numbers unchanged.
- Old combined body/attic foam overlaps the new structural representation and remains a
  known approximation pending region separation. It is not a newly correct foam stack.
  No camera blister, hidden deck plies or seals invented. Thermal is the shared bay node,
  not structural conduction. No flight, energy, game, controls or save changes.
- Long notes stay inside existing expandable component/assumptions sections.

## Checks and Process

- [Real/CAD/model/app comparison](top-deck-real-cad-model-comparison.jpg), visually reviewed.
  Three neutral-lit raw deck views plus upper/underside context images keep the original HGA/
  TWTA translucent for inspection only, never changing their installed geometry.
- [Before files, six views, exact geometry manifests, failed draft and restore steps](../../archive/top-deck-2026-10-22/README.md).
  Baseline `1bee304`, recovery tag `archive/top-deck-2026-10-22`.
- Seven new tests: published thickness/shared datum, real through-opening, foundation/base
  contact,15 deploy/pointing states clearing both faces, TWTA pad contact, independent four
  masks/global restore, three focuses, finite/bounded geometry and non-bulkhead lip.
- Full suite **503 pass, zero failures**, saved in `tests.txt`.
- Local Edge **24** Internal/Thermal viewport/subassembly cases at1440/390/360px; four
  part masks/global mask/restore, sources, original24 rows, installed context/Pilot return
  pass without page/network failures or overflow. Exact geometry/pose manifests of all24
  numbered parts, both walls, end joints and original body/attic foam match baseline.
- Triangle/plane samples find no unintended deck-face/numbered-equipment/arm crossings.
  These are visualization clearance checks, not mechanical/flight qualification. Three raw
  views and two context views pass nonblank/framed WebGL pixel checks.

## Published Acceptance

Release `43f6e21` and recovery tag pushed. [Pages run39764147097](https://github.com/Tboy450/dragonfly-titan-gcs-demo/actions/runs/39764147097)
succeeded, including the full suite. [Public build](https://tboy450.github.io/dragonfly-titan-gcs-demo/?v=43f6e21)
passed24 actual Edge Internal/Thermal viewport/subassembly cases at1440/390/360px,
four part masks and global deck mask/restore, source links, original24 rows, installed
context and Pilot return, with no page/network failures or horizontal overflow.
[Receipt and screenshots](live-43f6e21/checks.json) saved. Local preview server stopped.
Documentation/screenshot receipt skips CI; unchanged app is not redeployed or retested.

## Next / Handoff

**Separate insulation regions next, beginning with the body/deck region only.** Inventory
the existing combined solid and preserve its silhouette/archives before separating top,
sides and belly; do not claim a uniform local thickness through camera cavities and mounts.
Published insulation thickness versus estimated local boundaries must stay distinct.
Keep original24 equipment IDs, completed structure and access controls; reuse saved evidence.
Then handle attic foam and local HGA/camera blisters, followed by remaining deck supports,
penetrations, shoulder connections, IEM bond termination, harness packages and final layer/
UI/source audit. Do not restart completed numbered assets or invent hidden core/insert detail.
