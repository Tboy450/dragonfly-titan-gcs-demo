# IEM Second-Column Upper/Lower Routes

Codex (OpenAI), October 25, 2026. Owner requested continuation from the completed middle
lead. This pass changes only **lead IDs 5 and 7**, their labels and their own estimated
installation fittings. First-column and middle-lead meshes/materials/poses remain exact.

## Source Gate

Same evidence as the preceding IEM packages, not a newly discovered flight cable drawing:

- [NASA/APL real IEM/PSU testing and engineering-model integration](https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins).
  Saved originals and credits: [IEM source record](../iem-2026-10-13/README.md).
  Real testing photograph: NASA/Johns Hopkins APL/Ed Whitman. Silver-wrapped hanging
  bundles and white tags guide appearance. The previous pass's saved real crop is reused
  in the comparison. No generated or painted reference image is substituted.
- [NASA-STD-8739.4A Change 4](https://standards.nasa.gov/standard/NASA/NASA-STD-87394):
  saved workmanship pages guide support/relief principles, not qualified dimensions,
  flight attachment, circuit assignments or allowable bends for these estimated bundles.
- [NASA/APL TFAWS2023 source record](../sources/tfaws2023-thermal-controller/README.md),
  slide 3: credited CAD arrangement/dimensional context only, not appearance or routing proof.

Every changed route, support, label placement and lacing position is **EST**. There is no
new flight pinout, electrical solver, drilling pattern, structural rating, thermal cable
coefficient, remote circuit or hidden hardware. Equipment temperatures/flight behavior
and the main floor harness are unchanged.

## Implementation And Checks

Upper lead: separated descent and an elevated return in front of the middle lead's plane.
Lower lead: a deeper low service run and a forward return before the fixed terminal end.
Two existing supports are refitted, including an offset lower foot to avoid connector
hardware and the completed lower pair. Each revised lead has an attached white tag and
two lacing examples. The existing second-column focus and independent masks are reused.

- All 26 start/end coordinates and radii preserved within 1e-12 m numerical round-off.
- Every unrelated mesh, including the entire middle installation and first-column fitting
  set, is fingerprinted against the exact `f62b5ff` archive. No completed part is shifted.
- Lead 5 length about 0.476 m; lead 7 about 0.433 m; both retain 4.5 mm model radius.
  These are measured model dimensions, not published flight cable specifications.
- Dense sampled free-span surface gaps: about **3.1 mm** (lead 5) and **4.9 mm** (lead 7)
  against the other 25 curves, including the other revised lead and completed middle lead.
  Sampling is not a continuous collision solver or qualified cable installation analysis.
- The inherited terminal zone is unchanged: **both samples x < -0.135 m and y < 0.025 m**
  in IEM-local coordinates. Coincident endpoints and modeled-radius overlaps remain
  explicitly unresolved there. This is not a flight splice or valid physical junction claim.
- Actual triangle/swept-radius checks cover nearby casings, labels and completed fittings;
  support post/ring tests screen surrounding wires. Own backshell/label contact and the
  original 16 mm gathering-tie contact allowance are unchanged, not enlarged.
- Original main-harness and IEM envelope checks pass unchanged. A low-return candidate
  failed the conservative floor-harness screen; the final return stays within the existing
  envelope without moving the floor harness or loosening any clearance test.
- Historical preservation tests exclude only explicitly superseded route/label/fitting
  IDs. This pass's fingerprint verifies everything else, including the completed middle.

**604 tests pass**, zero failures/skips. App status now says seven reviewed local routes,
19 open. Internal/Thermal focuses, independent line/mount masks and Restore, phone fit,
original-model/Exterior hiding and Pilot return are checked in the normal app. All 24
numbered parts retained; phone client/scroll widths both 375 px, zero browser errors.
Eight Internal/Thermal focus cases and all mask/Restore checks pass. Browser evidence
and source/model samples are saved here.

## Samples And Recovery

- `iem-real-cad-model-comparison.jpg`: real testing crop, explicitly labeled CAD context,
  before/current model views. Full source and previous crops remain in their original records.
- `iem-installation-details.jpg`: current overview, side and support details.
- `route-checks.json`, `endpoints.json`: pair measurements and all 26 review/endpoint records.
- `render-checks.json`: nonblank framebuffer checks from actual browser-rendered modules.
- `browser-checks.json`, desktop/phone app views: normal interface acceptance evidence.
- `audit.mjs --write` refreshes this pass's measurements only; historical snapshots stay intact.
  `comparison.py` composes saved images using Pillow, without an image-generation service.
- [Archive](../../archive/iem-second-column-2026-10-25/README.md), recovery tag
  `archive/iem-second-column-2026-10-25` on `f62b5ff`. Rejected shared/low return drafts
  and before pictures are retained. No rejected route was published.

## Next Handoff

First two card columns are locally reviewed as estimates, not full flight wiring. Next:
third-column upper pair **IDs 8 and 9**, followed by lower pair IDs 10 and 11. Preserve
all seven completed routes, endpoints and fitting contacts. Review each new path against
all neighbors and the unchanged main floor harness; keep the exact gathering exclusion
and original IEM envelope. A later complete junction accommodation must resolve terminal
overlaps explicitly. Actual cable construction, flight destinations, redundancy, global
networks and qualified bends remain source-gated, as do radio/navigation external mating.
