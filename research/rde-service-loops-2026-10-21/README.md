# RDE connector installation: slack loops and wire-only inspection

Codex (OpenAI), October21,2026. Owner: "ok continue" after review of Claude's latest work.
Scoped to the reported RDE layer issue, stale completion wording and one installation item:
service-loop detail at the existing RDE connectors. No other part or game asset redrawn.
Current revision `rde-2026-10-21-service-loops`. Initial count stays **22/24**;20/21 annotations.

## Reference before editing

- [NASA September2,2026 flight-fuselage wiring update](https://science.nasa.gov/blogs/dragonfly/2026/09/02/nasas-dragonfly-gets-wired-up-while-titan-landing-area-is-named/).
  Real photo, credit NASA/Johns Hopkins APL/Ed Whitman. Original in
  `research/nose-bulkhead-2026-10-19/nasa-apl-harness-integration.jpg`; existing close crop in
  `research/main-harness-2026-10-21/photo-crop-bay-harness.jpg`, visually inspected. Silver
  sheathing, curved/looped bundles and lacing inform appearance only; exact RDE runs unresolved.
- [NASA-STD-8739.4A Change4](https://standards.nasa.gov/standard/NASA/NASA-STD-87394),
  original pages29-31 [saved and inspected](../sources/nasa-harness-workmanship/README.md).
  Connector stress relief/support and accommodated permanent offsets are general principles,
  NOT Dragonfly-specific routing evidence. Cable construction unknown; no Table7-1 row or
  numerical qualification is claimed applicable. No simulated harness is certified here.
- Historical ICES2023 thermal CAD page5 remains layout context only. Its colors are not
  finishes and no lead dimensions/routes are derived from it. Exact original remains saved.

## Changes / boundaries

- Each of the two controllers now owns a `harnesses` layer group, independently masked from
  `interfaces` (connector blanks/plugs/backshells and cooling details). Same two subassembly
  IDs, original part09, fixed anchors and installed casing pose remain intact.
- Four existing leads gain broad cubic-Bezier slack bows and two lacing ties each. Every
  original backshell entry and main-branch endpoint retained. [EST] radius .0025m, control
  reach .075m; actual bow projection follows the cubic, not a claimed .075m loop depth.
  Leads terminate within the unchanged main-harness branch envelope. No circuit, pinout,
  splice, power/signal partition, material qualification or actual flight route asserted.
- All non-wire meshes (including Claude's fins, seams, connector hardware) match archived
  vertex/index/world matrix/material manifests exactly. Main-harness module/routes and
  completed neighboring parts unchanged. New loops clear both cases/connector hardware
  except their own backshell entry; neighboring hardware and main-harness clearance tests pass.
- Updated component details to say initial part09 pass complete as an approved approximation,
  with unresolved flight hardware a follow-up. Fixed checklist's stale four-parts wording;
  only20/21 remain unbuilt sensor hardware. No extra completion count or credit change.
- No thermal solver, energy, electrical behavior, simulation camera or game files edited.

## Archive / samples / checks

[Before/current/real/CAD comparison](rde-real-cad-before-after.jpg). Each image type/credit
is explicit; no generated imagery. [Archive and restore steps](../../archive/rde-service-loops-2026-10-21/README.md),
tag on5f9e1bb, preserve exact prior source/tests/UI and fresh pre-change pictures.

- `after/`: actual current-module pair/unit Internal/Thermal at1440/390/360, hidden covers,
  installed context and two raw GL renders, nonblank/framing checks. Captured using the
  existing `../rde-inspection-2026-10-19/verify-render.cjs`:18cases plus raw samples.
- `verify-layers.cjs`: actual Edge at1440/390/360 in Internal and Thermal. Harnesses is
  enabled and independently hides/restores wires while Interfaces remains checked, and
  vice versa. Both unit selections exercised; Pilot return, sources/count, no overflow,
  page errors or network failures. Evidence in `layer-checks/`.
- Focused unit tests check masking/restoration/unchanged pose, four slack curves, original
  entry/endpoints inside unchanged trunk branches, floor bounds, own-case/backshell clearance,
  rebuilt-neighbor clearances and exact non-wire preservation. Full-suite result recorded
  with publication; local renders alone do not prove the public build changed.
- Full local suite **432 pass**, no failures/skips, output `test-results.txt`.

## Next / handoff

RDE-only service-loop installation pass complete. Next: another unit's existing connectors
after its own photo/interface review; attic wiring and ghostable structural side panels remain
separate items. Do not imply all connector loops or all installation work is complete. Preserve
Claude's wiring trunk and approved03/09 shape passes. Count22/24; exact20/21 flight sensors
still unknown. Archive CURRENT revision before changing more geometry. No CGI materials or
unverified internals promoted to flight evidence; no image-generation service used.
