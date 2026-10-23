# Attic/local insulation and open-equipment access

Codex (OpenAI), October22-23,2026. Two initial construction/access passes, not a complete
flight insulation stack or harness reconstruction.

## Sources

- [Real NASA/APL foam test photo and NESC slides](../sources/nasa-foam-2025/README.md):
  Johns Hopkins APL/Justin Artis; test hardware, not installed flight tiling.
- [ICES2020p5](../sources/ices2020-160-thermal-overview/ices2020-160-p05.jpg):
  preliminary25mm camera-isolation covering and50mm HGA dome. Historical references,
  not proof of current local material/thickness or hidden membrane stack.
- [ICES2023p3](../sources/ices2023-389-lander-thermal/ices2023-389-p03.jpg) and
  [p5](../sources/ices2023-389-lander-thermal/ices2023-389-p05.jpg): layout-only CAD.
- [DragonCam2026p3](../sources/dragoncam-2026/dragoncam-p03.jpg) and
  [p5](../sources/dragoncam-2026/dragoncam-p05.jpg): isolated camera enclosures,3mm windows,
 986mm working distance,52degree aim and camera envelope. [Paper/credits](../sources/dragoncam-2026/README.md).
  [p15](../sources/dragoncam-2026/dragoncam-p15.jpg) has real prototype lens photos, not
  the complete flight enclosure. CAD is labeled CAD.
- [Real HGA arm photo](../hga-actuators-2026-10-14/apl-hga-arm-2026-07.jpg):
  NASA/Johns Hopkins APL/Ed Whitman. [Article/limits](../hga-actuators-2026-10-14/README.md).

Original saved sources visually reviewed; no image-generation service used.

## Implementation and limits

Attic's original outer triangles/normals/UVs are retained in five removable regions:
roof, port, starboard, lower closing surface and ends. HGA's old capsule geometry and
transforms are retained in upper/lower surface focuses. These are inspection splits,
not flight tile cuts, actual foam volumes, a hollow-flight-body claim or hidden liners.

Three hollow lower-camera window-surround examples have estimated10mm width/depth,
not published flight dimensions or the preliminary25mm covering. They are NOT complete
camera foam blisters. The LED cavity/window is retained without inventing another enclosure.
Local thickness/material, membranes, adhesives and full blister shapes remain open.

Old windows used nominal planes and sat inside the actual beveled model body. Their3mm
panes now meet its actual surface, while camera bodies/aim/mounts stay fixed. Estimated
rectangular optical corridors cut the outer foam; triangle attributes interpolate across
cuts and body bounds stay unchanged. Neighboring-camera reliefs clear20 sampled rays.
This is not a full flight field-of-view/straylight analysis.

Open interior hides body/attic/local insulation, enclosing wall/deck/bulkhead surfaces and
flow overlays; casings, mounts and modeled connections stay installed. It releases part
focus/isolation. All layers/Restore reverses visibility. No flight/science/thermal changes.

Public loading diagnostics isolated the unversioned Three.js-core request. A fresh query
key loaded24 parts with normal HTTP. The vendor wrapper now uses the release stamp for
that nested import; algorithms/version/license unchanged. Final public acceptance must
use no interception, local substitute or protocol workaround. Readiness gates on the
initialized DOM/app, not deferred backdrop-image load completion.

## Verification / review

Initial full suite532/532. Local Edge35 responsive/selector cases, nine global and three
component masks/restore, Open interior from isolated attic, original24 rows, sources and
Pilot return pass. Six raw samples pass nonblank/framing pixels. Manifests protect all
equipment/structure except explicitly changed windows/cavities/new surrounds and split
dome; fan animation phase differs across startup snapshots, while geometry/static mounting
and hub centers remain checked. Attic geometry matches the before triangle bag.

Before sources/views/manifests and the rejected rim draft are [archived](../../archive/attic-local-insulation-2026-10-22/README.md).
That draft blocked a neighboring camera ray; final reliefs pass without moving cameras.
Early `load-*/` reports preserve transport experiments, not unmodified public-acceptance claims.

Updated component details/sources, Vehicle/Model assumptions, construction/harness coverage,
README, architecture, source register and checklist. Long notes remain expandable.
[Harness register](HARNESS-AUDIT.md): existing wiring is not a complete flight harness;
attic trunk, camera/nav, motor and sensor routing plus supports/feedthroughs remain open.
No wires added. Full local foam sections and a separate thermal material audit remain open.

Publication/combined-test receipts are appended after deployment.
