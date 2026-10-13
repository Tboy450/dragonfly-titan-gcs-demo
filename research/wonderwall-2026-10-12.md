# Part 07: Wonderwall / Warm-Cold Attic Interface

Reviewed and implemented October 12, 2026 by Codex (OpenAI).
Asset: `dist/wonderwall.mjs`, revision `wonderwall-2026-10-12`.

## References

- [ICES-2023-389, Dragonfly Lander Thermal System Modeling](https://ttu-ir.tdl.org/server/api/core/bitstreams/0737a596-5ba9-488b-9cc6-0b2ed93e2cd5/content),
  p. 7. Read the owner's local PDF after the web endpoint failed. The authors describe
  the Wonderwall and a greater-than-100 C difference between the carousel and ITMS,
  roughly 5 cm apart. **That separation is not a wall-thickness specification.**
- [NASA Goddard / Barfknecht et al., SciTech 2024 thermal-interface paper](https://ntrs.nasa.gov/api/citations/20230017316/downloads/AIAA_SCITECH2024_final_proof.pdf),
  figs. 2 and 11, pp. 3/8. Shows the side-by-side warm/cold regions and shaped attic
  boundary. Foam/chimney construction is assembled in sections, rather than an empty
  undivided cavity. Figure 11 is a preliminary engineering-model visualization.
- [NASA SVS carousel integration photographs](https://svs.gsfc.nasa.gov/15003),
  March 5, 2026, **NASA/Mike Guinto**. Images already archived in
  [`carousel-2026-10-12`](carousel-2026-10-12/README.md). These show an interface-side
  profile, central circular feature, pale facing areas and machined-looking framework.
  They do not identify every visible feature as part of the named Wonderwall.

## Interpretation, Not Flight CAD

The old broad transverse slab is replaced by a fore/aft-oriented contoured partition
along the warm/cold boundary. It remains an **[EST] educational reconstruction**.
The photos do not establish a manufacturing drawing, laminate stack, fastening schedule
or exact dimensions. The apparent circular feature is represented as an interface opening;
its actual seal, feedthrough and instrument connection are deferred to the DraMS rebuild.
No assertion is made that flight hardware contains an unsealed open hole.

Nominal position x=0.095, y=0.08, z=-1.26 m; length 0.61 m; maximum height 0.40 m;
22 mm core and thin faces are **estimated display geometry**, not published thicknesses.
The profile follows the reference silhouette and current attic envelope. The core's
appearance does not identify its actual material. PEEK used inside the SDC is not
automatically assigned to this partition. Temporary GSE and lift hardware are excluded.

Cold and warm face colors use existing cold-attic and equipment-bay nodes. There is no
through-wall heat solver, verified conductance or measured skin temperature in this asset.
Thermal/science physics are unchanged.

## Fit and Layering

- Installed beside the previously updated carousel without changing its scale or position.
- Their whole-assembly bounds are disjoint, with over 8 mm modeled clearance including
  projecting fasteners and linkage. This is simulator clearance, not a flight requirement.
- Fits the current inner width and forward roof envelope. Older DraMS boxes remain
  provisional and may intersect; they are not used to distort the new geometry.
- Separate named groups: insulation, cold-facing, warm-facing, mounts. Visibility can
  change independently without moving installed hardware. **User-facing peel-away
  controls are not implemented yet.** Their detailed requirements are in the checklist.
- Number 07 and ID `wonderwall` stay unchanged. Global label stacking remains a separate task.

## Verification and Next

154 Node tests passed: updated-to-updated clearance, envelope, genuinely cut-through
interface openings, separate layer groups and existing rendering/simulation regressions.
Playwright: desktop/360 px UI, four angles in Internal and Thermal; nonblank canvas,
framed geometry, no horizontal overflow or browser exceptions. Both faces and installed
context visually inspected. Previous source and screenshots are in
[`archive/wonderwall-2026-10-12`](../archive/wonderwall-2026-10-12/README.md).

Next part: #08 DraMS assembly, especially actual casing and interface connections.
Exact dimensions/material stack remain an open research item.
