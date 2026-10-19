# Part 05: Approved Ocellus Outer-Structure Approximation

Codex (OpenAI), October19,2026. Asked whether to build a labeled approximation from real
related hardware and NASA dimensions, the owner replied **"same as last 2 parts"**. Proceeded
on the same explicitly approximate basis as METHAN and the MIMU family pass. This is NOT
approval to invent hidden electronics/optics or claim a photo-matched flight unit.

**Initial part05 pass complete as an approved approximation: 20/24 initial passes,
5 Codex / 15 Claude.** Flight-specific identification/dimensions/interfaces remain open.
Module revision `nose-electronics-ocellus-outer-estimate-2026-10-19`.

## Reference Hierarchy

- Real [SQRLi prototype optics](../sources/nasa-sqrli2024-review/README.md) and
  [Kodiak hardware](../nose-electronics-2026-10-19/README.md) inform general construction:
  machined plates, returns, fasteners, housings. These are RELATED hardware, not actual
  Ocellus photographs. Their complete geometry/optical layout is NOT copied.
- [NASA MSS2023 p6](../sources/nasa-mss2023-ocellus/README.md) supplies historical Ocellus
  design envelopes; [identified FEB CAD](../sources/nasa-optics2023-ocellus/README.md)
  supports only arrangement/proportional structure. CAD colors are not real materials.
- [Cross-project audit](../ocellus-cross-project-2026-10-19/README.md) establishes lineage
  and preserves unresolved supplier/board-stack links. No commercial scanner, SpaceCube
  stack, connector routing or laser inventory is imported into the model.
- Reinspection of original SQRLi `image9.png` shows **LMP7704HBH/EM / EVAL ONLY** on an IC.
  [TI's original marking table](../sources/ti-lmp7704-evaluation/README.md) confirms that
  marking. It is a related test-hardware image, NOT proof of a qualified Ocellus flight PCB.
  X/Y drive labels are visible; exact circuit function/netlist is not asserted or modeled.

## Modeled and Omitted

MEB: chamfered base/lid, thin side/end walls, corner posts, lid rails, ten attached external
stiffeners, four mounting feet and lid fasteners. FEB: chamfered base, rails, rear/side
returns, round receiver housing with flanges/removable cap, angled collimator housing with
removable cap, estimated supports and mounting feet. All these detailed proportions,
thicknesses, fastening patterns, caps and neutral display finishes are **[EST]**.

No lenses, MEMS mirrors, laser cavity, seed/fiber-laser package, boards, gyro elements,
pinouts, apertures through the fuselage, electrical harness or fiber routes are invented.
Removing a cap exposes **unmodeled space**, not an assertion that the flight unit is hollow.
No moving optics animation, beams or simulator power/thermal/flight changes added.

Both previously published MIMU family models and their support shelf are unchanged. The
test compares that builder section against the archived exact module, not just its bounds.
Exact Dragonfly IMU variant/options/install remain unconfirmed. Covers/casings/mounts and
existing IMU interfaces remain independently removable; no new part numbers or anchors.

## Scale and Installation

| Unit | Native x/y/z envelope, m | Bottom position x/y/z, m | Yaw |
|---|---|---|---|
| MEB | .2419 / .1204 / .1854 [PUB-2023-design] | -.207 / -.284 / -1.39 [EST] | 90deg [EST] |
| FEB | .234 / .127 / .232 [PUB-2023-design] | .205 / -.284 / -1.393 [EST] | 0deg [EST] |
| IMU A | .2337 / .1699 / .2337 [PUB-family upper bound] | .205 / -.1 / -1.393 [EST] | 0deg [EST] |
| IMU B | same supplier upper bound, NOT exact flight size | .205 / -.1 / -1.145 [EST] | 180deg [EST] |

Published envelope includes all estimated feet and screw heads. No sourced envelope shrunk,
no neighboring completed part moved. Tested all four navigation assemblies and shelf against
each other and rebuilt neighbors; intentional shelf/base support contact remains.
Original05 anchor and four unit focuses plus shelf focus retained in Internal/Thermal.

## Archive / Images / Reproduction

[Archive](../../archive/ocellus-outer-structure-2026-10-19/README.md) keeps exact prior
module/test/UI/builder/HTML, original box renders and restore steps. Recovery tag on f28fe8b.
Two rejected stiffener drafts are also retained with their exact code/tests and pictures.
The first buried ribs in the wall; the second detached them slightly. Final ribs intersect
the case wall and protrude externally; a regression assertion checks both conditions.

`ocellus-real-cad-model-comparison.jpg` distinguishes related real hardware, identified CAD,
current MEB/FEB renders and cap-hidden process sample. Full originals remain in source folders;
`compose-comparison.py` only crops/layouts existing images with explicit credits/limits.
The [unchanged MIMU comparison](../nose-electronics-2026-10-19/mimu-real-cad-model-comparison.jpg)
remains the appropriate reference for that subpass; do not call it new geometry.

`verify-render.cjs` captures 30 unit/layer/viewport combinations, eight installed whole-part
angles in both layers, installed context, cap hide/restore and eight raw unit renders.
Raw WebGL pixel counts/framing are checked and saved in `render-checks.json`; browser errors
must be empty and all widths must have no horizontal overflow. Pilot return is checked.
Requires the bundled Playwright runtime/Edge; local preview http://127.0.0.1:4195/.
Run with output directory argument; `DRAGONFLY_URL` optionally targets a published build.

Focused envelope, visibility, metadata, unchanged-IMU, clearance and checklist tests pass.
Full local suite **367 pass,0 fail**. Panel03's old global-count19 assertion was replaced
by a direct assertion that panel03 is still provisional/not a completed assumption, so
other parts completing no longer break it. Original test archived. Final publication
verification will be recorded in a release checkpoint after deployment.

## Release Checkpoint

Model/archive commit **51d063d** pushed to main and isolated feature branch; recovery tag
on f28fe8b pushed. Pages run **39322730880 succeeded**. `verify-live.cjs 51d063d` passed
against the public site in real Edge: stamped module/revision, count20, source links,
five selectors, FEB at1440/390/360 without horizontal overflow, cover hide/restore across
Internal/Thermal and reset/Pilot return. No page errors or failed requests. Public images
and `live-51d063d-ocellus-checks.json` saved here. Public builds intentionally omit localhost
debug globals; the live check verifies the published source module plus actual UI instead.
This documentation/evidence follow-up changes no model geometry or app behavior.

## Continuation

Do not redo the completed first pass or treat the historical unchecked/count19 notes in
older research folders as current. Follow-ups: exact flight MIMU configuration/mounts,
Ocellus housing/coating/dimensions, internal optical train, processor generation/card stack
and actual interfaces. Require identified real photos for appearance, drawing-supported
scale and explicit estimates. Keep all source credits and current masks/coordinates.
Remaining initial passes: 03 nose bulkhead, 09 drive electronics, 20/21 temperature sensors.
Continue one at a time, with deeper cross-project search before substituting an approximation.
