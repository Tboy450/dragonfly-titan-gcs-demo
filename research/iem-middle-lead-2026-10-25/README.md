# IEM Middle-Lead Installation

Codex (OpenAI), October 25, 2026. Owner approved the next cable-routing pass after the
five-family fitting package. This pass revises **only `iem-local-lead-6`**, its white label
and six new fitting meshes: one four-piece support and two lacing examples.

## Sources And Limits

- [NASA/APL integration release, March 12, 2026](https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins),
  rechecked this pass. Real power/function testing photo credited NASA/Johns Hopkins APL/
  Ed Whitman. [Original photograph record](../iem-2026-10-13/README.md); local crop
  `real-iem-testing-crop.jpg` is from that saved photo, not generated or painted.
  Silver cable wrapping, labels and the general hanging arrangement guide appearance.
  The image does not reveal this lead's circuit, exact route or flight clamp placement.
- [NASA-STD-8739.4A Change 4](https://standards.nasa.gov/standard/NASA/NASA-STD-87394),
  active record rechecked; previously saved workmanship pages in the project's connector/
  harness source records guide support and relief principles. No cable construction,
  minimum allowable bend radius or flight qualification is inferred from this model.
- [NASA/APL TFAWS2023 slide 3](../sources/tfaws2023-thermal-controller/README.md):
  saved `tfaws23-at-14-slide03.jpg` is CAD arrangement/dimensional context only. It is
  included in the comparison sheet, not used as a real hardware appearance reference.

All new geometry is **EST**, not flight-identical hardware. No remote circuit, splice,
connector pinout, support load rating, panel drilling or hidden electronics is invented.
The app's thermal and electrical behavior is unchanged.

## Geometry And Verification

The old middle cable substantially shared the neighboring upper cable's vertical path.
The new departure moves sideways before entering a deeper service bend, stays above the
floor-harness crossing and returns to its exact old gathering endpoint. Its label is moved
onto its own curve. The first column, neighboring second-column supports and all other
equipment, materials, transforms and 25 IEM cable curves are unchanged.

- All 26 start/end coordinates and radii preserved within numerical round-off (1e-12 m).
- New middle lead length about 0.491 m; radius remains 4.5 mm. These are model dimensions,
  not published cable specifications. Extra modeled length is slack, not a circuit change.
- Dense curve screen: minimum free-span surface gap about **2.4 mm** against all other
  25 leads. This is a sampled check, not continuous collision certification.
- The exact pre-existing gathering boundary is retained: **both samples x < -0.135 m
  and y < 0.025 m in IEM-local coordinates**. Terminal endpoints intentionally remain
  tightly packed, including coincident centers and overlapping modeled radii. This is
  explicitly reported as unresolved, not declared a valid physical bundle construction.
- Triangle checks cover the new swept cable against equipment/fittings, with bounded
  own-backshell/label contact and the unchanged 16 mm terminal tie contact allowance.
- Existing main-harness clearance tests pass without changed geometry or larger tolerances.
- Preservation fingerprint covers every other old mesh, including all completed supports,
  ties, labels, connectors and enclosure surfaces. Historical preservation tests exempt
  only this specific revised curve/label; the new focused test covers that revision.

**599 tests pass**, zero failures/skips. Eight Internal/Thermal focus cases, removable
mount/line masks and Restore, original-model/Exterior hiding and Pilot return pass.
Phone client/scroll widths are both 375 px, all 24 numbered parts remain, zero browser errors.
Real browser renders use the actual modules, raw materials and framebuffer nonblank checks;
desktop/phone app screenshots are also saved. Status text now says five reviewed routes,
21 still open. Nothing claims that the entire second column or IEM harness is complete.

## Samples And Recovery

- `iem-real-cad-model-comparison.jpg`: real testing crop, credited CAD context, before/after.
- `iem-before-after.jpg`: same-scale overview of the actual models.
- `support.png`, `support-side.png`, `app-desktop.png`, `app-mobile.png`: detail and app views.
- `route-check.json`, `endpoints.json`, `render-checks.json`, `browser-checks.json`:
  measurements, all 26 endpoint/review records and QA evidence.
- `audit.mjs --write` regenerates the route screen; `comparison.py` uses Pillow to compose
  the saved images. No image-generation service is used.
- [Recovery archive](../../archive/iem-middle-lead-2026-10-25/README.md), tag
  `archive/iem-middle-lead-2026-10-25` on `abad1f6`. Rejected direct departure and floor
  return candidates are retained with their renders. The previous batch's sheets remain
  historical snapshots; this pass does not overwrite their geometry register or images.

## Next Handoff

The middle lead's bounded local route/support pass is complete as an estimate. Next:
second-column upper/lower leads (`iem-local-lead-5` and `iem-local-lead-7`), which retain
their old paths and existing fittings. Archive before replacing; preserve all reviewed
first-column routes, the middle route, endpoints and fitting contacts. Then continue IEM
route groups and PSU leads. A later complete bundle/junction accommodation must resolve
the fixed gathering overlaps explicitly, not enlarge the clearance exclusion. Actual
flight identities, global wiring, redundancy and qualified bends remain source-gated.
