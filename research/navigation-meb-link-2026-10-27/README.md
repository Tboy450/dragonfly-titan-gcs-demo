# Part 5 MEB branch connection — October 27, 2026

Codex (OpenAI). Owner's clarified curved line is `main-harness-navigation-meb`,
not the IMU shelf leg or warm duct. The old branch approached the rebuilt MEB
without a mating interface. This pass fits a **labeled external installation
example**, not an identified Ocellus flight connector.

## Evidence and limits

- Reused [real NASA/APL wiring photograph](../nose-bulkhead-2026-10-19/nasa-apl-harness-integration.jpg),
  NASA/Johns Hopkins APL/Ed Whitman, September 2026. Guides existing silver wrap,
  lacing and general assembly appearance, not a particular Ocellus circuit.
  [Original NASA article](https://science.nasa.gov/blogs/dragonfly/2026/09/02/nasas-dragonfly-gets-wired-up-while-titan-landing-area-is-named/).
- Reused [NASA harness workmanship pages 29–31](../sources/nasa-harness-workmanship/README.md),
  especially §8.1.2–8.1.3 on installed wire dress and accommodating bends at backshells.
  [Active NASA source](https://standards.nasa.gov/node/283). This is general design
  reasoning, not qualification or proof of Dragonfly hardware. Exact cable
  construction, allowable bend, sealing and cold-environment performance unknown.
- [Ocellus structure evidence](../ocellus-outer-structure-2026-10-19/README.md)
  remains unchanged: real related hardware for general construction; historical
  NASA design dimensions; CAD only for scale/arrangement. No exact Ocellus flight
  connector photo or ICD found in the checked material. Do not copy unrelated
  Micro AVIM laser interfaces or a SpaceCube pinout onto this electrical example.

No new source photos duplicated and no redundant real/CAD/model sheet created.
Prior reference sheets remain valid; this pass saves useful connection/installed samples.

## What changed

- Only the MEB branch's final approach controls changed. Its trunk junction,
  initial two controls and 16 mm drawn cable diameter remain exact. Every other
  branch, trunk, decorative strand, enclosure, published envelope and equipment
  pose is preserved. Added straight terminal approach and 7 mm seating into an
  open strain-relief sleeve.
- [EST] 26 mm square blind flange against the actual MEB side-wall face, between
  the existing ribs; generic hollow shell, coupling, backshell and strain relief.
  Their sizes, location and fasteners are estimates. External fitting extends
  beyond the existing box; it is not part of a verified flight envelope. No pins,
  internals, wall penetration, circuit, connector standard or cable seal claimed.
- One geometry instance in shared `navigation-meb-link` context. Whole part 5,
  MEB-only and Bay harness inspection retain it; isolated FEB/IMUs/shelf and
  individual camera-route views omit it. Part-5 isolation omits the rest of the
  trunk at the branch's shared junction. Harnesses and Interfaces masks work
  independently from both owners. No extra numbered component or selector entry.
- Existing collapsed part assumptions and installation information explain the
  estimate. Endpoint register now records geometric seat contact, while flight
  topology remains false. FEB/IMU, radio and circulation-fan mating interfaces
  remain unresolved. No power, thermal, physics or save-state changes.

## Verification / samples

725 tests pass. Four new regressions cover exact preservation outside the MEB
tail, straight/open-bore seating, actual wall/rib contact and navigation-surface
clearance, single shared ownership and reversible inspection masks. Existing
whole-neighbor tests also pass. Degenerate zero-area comparison triangles are
excluded; they do not establish a physical collision.

`node research/navigation-meb-link-2026-10-27/audit.mjs --write` reproduces
[measurements.json](measurements.json). Sampled navigation-hardware cable-surface
clearance is about 26.0 mm, excluding the deliberately fitted external interface;
not a strength/electrical or certified clearance claim. Terminal tangent is [0,0,-1].
`preview.html` renders actual model meshes, not a generated hardware photograph.
Samples: `box-and-branch.png`, `connection-detail.png`, `part-5-shared-branch.png`,
`meb-isolated.png`, `meb-thermal.png`, `meb-phone.png`. Browser checks: 24 numbered
parts, no desktop/390px overflow or errors, isolation and mask changes checked.
MEB-only focus includes the entire shared branch in its bounds, so the trunk
junction also stays inside the narrow phone frame; IMU/FEB focus is unchanged.

## Archive and next

Recovery tag `archive/navigation-meb-link-2026-10-27` at f9660ce;
[exact baseline and restore](../../archive/navigation-meb-link-2026-10-27/README.md).
The earlier mistaken support-leg identification is corrected in the prior audit
packet; original diagnostic samples remain as records, not evidence for this line.
Next scheduled rebuild is part 24's supplier-scale blower pair/connected plumbing.
Separate FEB/IMU routes still need evidence before an installation pass; this
single MEB example does not close the whole navigation harness or flight interfaces.
