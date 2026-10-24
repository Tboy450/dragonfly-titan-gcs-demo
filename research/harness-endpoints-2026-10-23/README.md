# Bay Endpoints And Lower-Camera Harness

Codex (OpenAI), October23,2026. One installation family, not new camera hardware,
a complete flight harness or an electrical simulator.

## Evidence Before Editing

- [Real NASA/APL September2 wiring photo](https://science.nasa.gov/blogs/dragonfly/2026/09/02/nasas-dragonfly-gets-wired-up-while-titan-landing-area-is-named/),
  NASA/Johns Hopkins APL/Ed Whitman. Original:
  `../nose-bulkhead-2026-10-19/nasa-apl-harness-integration.jpg`; reviewed crop:
  `../main-harness-2026-10-21/photo-crop-bay-harness.jpg`. Silver bundles, curves,
  wall runs and lacing inform appearance, NOT circuit routes or cable dimensions.
- [DragonCam2026 pages2/3/5](../sources/dragoncam-2026/README.md), Clark et al., MSSS
  and collaborators: camera/installation CAD and dimensions, not a wiring diagram or
  hardware photograph. Existing camera bodies, brackets, aim and3mm windows remain fixed.
- [NASA-STD-8739.4A Change4](https://standards.nasa.gov/standard/NASA/NASA-STD-87394),
  saved [pages29-31](../sources/nasa-harness-workmanship/README.md). General support/
  stress-relief context already reviewed for RDE; landing page rechecked. No actual
  Dragonfly routing or qualified cable bend radius inferred. No image generation used.

## Repeatable Audit

Run `node research/harness-endpoints-2026-10-23/audit.mjs --write` from repository root.
Actual builders provide named cable endpoints, transformed to the construction frame.
[ENDPOINTS.md](ENDPOINTS.md) and `endpoints.json` retain all explicit candidate stubs,
coordinates, lengths, media/confidence and missing destinations. Peer-curve distances
are sampled; endpoint-to-endpoint distances are analytic. Nearest geometry is not a circuit.

Before:19 branch/link rows,8 geometric contacts,3 visible gaps,4 unresolved device mating
interfaces and4 network-only links; port Down Camera had a stub but no branch.
After:20 rows,12 geometric contacts,4 unresolved device interfaces and4 network links.
Three appearance-only parallel strands remain unassigned. This is not all-device coverage.

## Installation And Limits

- Changed only the final points of starboard Down Camera, Microscopic Camera and LED
  branches. Prior center gaps10.11/11.41/10.16mm left2.11/3.41/3.16mm visible gaps after
  cable radii. All four lower-camera branches now meet explicit stub ends within1micrometre
  in this MODEL. Contact does not establish flight mating, a splice, pinout or circuit.
- Added estimated6mm-diameter port Down Camera routing from the microscopic branch,
  aft through its existing wall relief and above its housing, along the outer wall to
  the Down Camera stub. Avoids PSU1 without moving hardware or cutting a new wall hole.
- One estimated stand-off meets the existing outer wall between reliefs and supports the
  cable underside. Real layup, further strain relief/support fastening and local foam
  channel construction remain unverified. No flight workmanship compliance claimed.
- Original trunk/strands/cross-links and all unrelated branch control points unchanged.
  No flight, game, energy, thermal or simulation camera changes.
- Unnumbered Bay harness selector, four route focuses and independent wire/mount masks.
  Original24 numbers retained. Coverage/source notes stay in expandable sections.
- First short draft crossed the microscopic-camera housing and a battery lead. Rejected
  and archived with code and picture, never published.

## Checks And Samples

Focused10 tests pass: register coverage/confidence, explicit unresolved interfaces, four
exact camera ends, unrelated-route preservation, swept-radius clearance against actual
wall triangles, support contact,20 optical rays, independent masks/restore and existing
19-builder equipment clearances. Existing equipment test keeps its3cm own-unit allowance;
separate wall test does not. Not a full FOV/straylight analysis or flight certification.

`render.html` uses actual modules; amber routes/translucent equipment are review styling,
not flight materials. `?before` loads the exact archived module with only vendor-import
resolution adjusted. See [archive/restore](../../archive/lower-camera-harness-2026-10-23/README.md).

Public59a03b9 initialized normally after its initial timeout while independent audit work
continued. Open interior cleared isolated attic and rendered with24 numbered rows.
`public-59a03b9-open.png` is genuine public evidence. A direct renderer request took19s
here; root cause/initial-load duration remain unknown. No transport fix is claimed.
Older failed acceptance receipts remain historical, not deleted or relabeled.

Final full-suite/visual/publication receipt is appended after verification.

Local completion: **556 tests passed, zero failures/skips**. Actual local app CUA checks:
24 rows, four route focuses, independent Harnesses/Mounts hide/restore, five source links,
component estimate notes, installed context,390px-requested mobile screenshot with client
width375px equal to scrollWidth375px, and Pilot return. Browser error log empty. Review
canvas nonblank count verified; desktop overview/port/ends and app/mobile screenshots saved.
[Real/CAD/before/after comparison](lower-camera-real-cad-before-after.jpg) visually reviewed.
The general render smoke test now exempts ONLY tagged port-bypass/support meshes from
the old37cm bay half-width, using39cm; all other widths stay unchanged. Exact wall/equipment
tests still apply. Original smoke test archived. This is not a blanket cavity expansion.

## Publication Receipt

Release `a4ed215fbe464da7226ae3879c4d2ec27b0ef4a4` pushed to main and the Codex feature
branch with recovery tag. [Pages40057622872](https://github.com/Tboy450/dragonfly-titan-gcs-demo/actions/runs/40057622872)
succeeded, including the full suite and stamping. [Open live build](https://tboy450.github.io/dragonfly-titan-gcs-demo/?v=a4ed215).

Normal public CUA navigation returned successfully, without interception/local resource
substitution or transport changes. Build badge a4ed215, Bay harness option and port-route
focus verified; Open interior rendered installed camera/harness context,24 rows retained,
browser error log empty. Genuine `public-a4ed215-harness.png` saved. Local server stopped.
No claim of a diagnosed earlier loading cause. Receipt-only follow-up skips redundant CI.

## Next / Handoff

Keep the GLOBAL endpoint-register item open: this is the initial bay audit only.
Next review attic local wiring versus sample/air lines before assigning a trunk. Radio,
navigation and fan mating ports, separate IMU leads, sensor, motor and RF families remain
open. One sourced family at a time; archive current geometry and include samples. Preserve
Open interior and all shell/insulation masks. Do not infer circuits from connector silhouette.
