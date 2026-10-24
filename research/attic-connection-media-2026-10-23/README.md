# Attic Line Audit And DraMS Short-Wire Installation

Codex (OpenAI), October23,2026. One local connection group and line-visibility correction,
not a full attic wiring network or replacement of the science instruments.

## Sources Reviewed Before Editing

- [NASA SVS15003](https://svs.gsfc.nasa.gov/15003), March5 integration photographs,
  released April20,2026, NASA/Mike Guinto. Original DraMS photo and real-hardware crop:
  `../drams-2026-10-12/nasa-drams-integrated.jpg` and
  `../drams-detail-2026-10-20/photo-crop-drams.png`. Carousel crop:
  `../carousel-detail-2026-10-21/photo-crop-top-hardware.jpg`. All visually reviewed.
  Photos include ground support/test equipment; no complete flight harness map can be
  inferred. Large rising test bundles, connector table and handling fixture stay omitted.
- [Barfknecht et al., SciTech2024](https://ntrs.nasa.gov/citations/20230017316), saved
  [page3/fig2](../sources/scitech2024-sdc-drams-interface/scitech2024-p03.jpg), NASA GSFC
  and Aerodyne. Warm/cryogenic zones and instrument arrangement only, explicitly CAD.
  No cable position, hidden feedthrough, materials or circuit assignment derived from CAD.
- [NASA-STD-8739.4A Change4](../sources/nasa-harness-workmanship/README.md), saved pages29-31.
  General connector support/stress relief context, not a Dragonfly-specific construction
  requirement verified here. Cable construction unknown: no table row or certified bend radius.

Sources remain saved under original credits. No image-generation service used.

## Inventory Before Adding Anything

`audit.mjs --write` builds the actual DraMS/carousel meshes, transforms their eight tube
examples to construction coordinates and writes [ENDPOINTS.md](ENDPOINTS.md) / `endpoints.json`.
Two electrical examples, three estimated gas/sample tubes and three unclassified routes.
Medium/function confidence is EST for every row, flight mating false. Candidate model
connector centers are listed individually, not silently assigned to a circuit.

DraMS previously grouped its electrical examples and schematic transfer paths together
under Harnesses / lines; three valve tubes were under Interfaces. The carousel white
line was also under Interfaces, so hiding mechanical interfaces hid it too. That does
not establish what the real white line carries; it remains unclassified.

The main attic trunk, external DraMS bus, three warm-drive electrical lead sets and an
identified warm/cold electrical feedthrough remain missing. The Wonderwall neck is a
sample interface; it is not evidence for an electrical penetration. No attic trunk added.

## Scoped Changes / Limits

- DraMS local electrical examples use the existing Harnesses / lines mask; its three
  valve-tube examples use new Gas / sample tubing examples, separately from valve hardware.
  Two schematic laser/interface/GC routes and the carousel white-line example use new
  Unclassified / schematic lines. Every prior tube shape/pose stays exact except one wire.
  Other legacy parts are NOT reclassified by this pass.
- DraMS's existing8mm-diameter short wire keeps both old endpoints and gains a smooth
  estimated slack bow, two lacing bands and one stand-off on the unchanged electronics
  enclosure side. Existing hardware/connector locations, walls, insulation, other leads,
  sample/air routes, thermal/flight/science logic remain unchanged.
- Wire diameter, lacing/support counts, material appearances, stand-off, endpoint identities
  and routing are estimates, not a verified flight cable or electrical splice. No wire
  conductor/pins, ground support bundle, new circuit, pressure/flow or heat-leak solver.
- New DraMS focus groups distinguish electrical/plumbing/unclassified examples. Carousel
  white-line focus is independent from its mechanical Interfaces. Original24 numbers and
  reversible Open interior are retained. Source and accuracy notes remain expandable.
- First lacing draft exceeded the old35cm x bound by about1.4mm in its transformed
  bounding box. Archived before reducing the bow; no envelope/test limit enlarged.
- Browser review caught a nested focus hiding its own parent. Archived that draft and
  mobile picture, then made four non-nested DraMS targets. Short-wire macro uses the
  existing inspector's3cm minimum-radius option; no physical scaling or camera-engine change.

## Verification / Samples

Initial **561 tests passed**; final suite adds a non-nested-focus regression. Tests cover
the eight-row audit, unresolved networks, exact
unrelated geometry/world poses/material values (including carousel instances), retained
wire endpoints/radius and added length, independent media masks/restore/Open interior,
enclosure-support contact and sampled swept-radius clearance against attic surfaces.
Only explicit brass-cylinder/connector endpoint contacts receive12mm exemptions;
no whole-unit clearance exemption. Existing attic/neighbor/DrACO tests also pass.

`render.html`: actual model modules, installed overview plus wire/carousel close-ups.
Detail casings are ghosted only for inspection; whole view uses actual materials.
`?before` resolves exact archived modules; `?draft` shows rejected lacing width. These
are local samples, not public-site evidence. Nonblank pixel counts are exposed for QA.
Archive and recovery: [attic-connection-media-2026-10-23](../../archive/attic-connection-media-2026-10-23/README.md).

Browser/publication receipt appended after checks. No complete flight harness claim.

Final local suite: **562 tests pass, zero failures/skips**. `browser-checks.json` records
six media-mask checks in Internal/Thermal, separate carousel white-line hide/restore,
six source links,24 numbered rows, source-limit notes and Pilot return. Corrected macro
was visually checked with the existing casing/cover/interface/insulation masks removed;
installed context is intentionally retained until hidden, not auto-disassembled.
390px requested mobile client/scroll widths both375px; no browser errors. Desktop/mobile
macro, installed overview and before/after/reference samples saved and visually reviewed.
Local dev-module caching required fresh preview origins; source ?v=dev stamps preserved,
no speculative production cache or camera-engine edits. Whole attic network still open.

## Next / Handoff

Attic local-line audit and ONE short-wire installation example complete. Whole attic
network remains open. Review external instrument power/data and actual mating-interface
evidence before building a main trunk; do not copy the photo's ground test cabling.
Carousel drives and warm/cold electrical penetrations need their own reference passes.
Keep data/power/RF/fiber/gas/sample/air identities separate. Sensor, motor and RF families
remain separate later packages. Archive, fit-test and show samples for each next package.
