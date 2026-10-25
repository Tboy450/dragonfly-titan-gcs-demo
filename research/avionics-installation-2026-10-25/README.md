# Five-Family Installation Pass

Codex (OpenAI), October 25, 2026. Owner requested a best-effort run across IEM, PSUs,
Frontier radio, navigation electronics and battery. This closes a bounded installation
example pass for each family, **not** complete flight wiring or all outstanding service loops.

## Scope And Remaining Work

| Family | Added in this pass | Still open |
|---|---|---|
| IEM | Two cushioned supports and one lacing example in the second column; focus includes its three unchanged leads | Middle lead support deferred: legacy routes overlap. Only the previous four first-column routes have had a routing pass;22 still need review |
| PSUs | One support and one lacing example per unit; separate PSU1/PSU2 focuses | Other leads, exact circuits, second unit's actual flight location and full routing |
| Frontier radio | Three supports on existing local RF jumpers; connector/jumper focuses | Actual flight configuration and external power/data/RF mating. No new destination inferred |
| Navigation | Eight Ocellus foot retention heads plus eight MIMU heads/eight washers | Exact fastener design, flight variant, ports and harness. Capped interfaces stay capped |
| Battery | Three exterior lead supports/lacing; connector and external-lead focuses | Actual flight-pack construction, full routing and circuit identities. Internal bus remains the prior estimate |

Ten supports, six lacing examples and24 navigation retention pieces:70 new meshes.
Every prior mesh/material/installed transform and all62 existing curve geometries are exact
against the archive. No completed hardware moves, no cable curve changes, no new electrical
network, pinout, hidden electronics, thermal coefficient or game change.

The62-row register includes26 IEM leads plus its bonding braid,26 PSU leads, three radio
RF examples plus its mechanical cap tether, and five battery lead examples. It explicitly
distinguishes media and keeps every flight-mating flag false. Navigation has zero invented
wire rows. `audit.mjs --write` regenerates `installation-register.json`.

## Evidence Gate

Real hardware first; no generated imagery. Originals reused with their original credits:

- [NASA/APL March12 integration release](https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins),
  rechecked this pass. Real IEM/PSU testing photo: NASA/Johns Hopkins APL/Ed Whitman.
  Engineering-model photo: NASA/Johns Hopkins APL. Saved originals in
  [IEM](../iem-2026-10-13/README.md) and [PSU](../power-units-2026-10-13/README.md) records.
  These guide appearance, not the new clamp locations, cable topology or exact flight hardware.
- [NASA Frontier photo](https://science.nasa.gov/image-detail/amf-48b4901b-44b0-4c89-802b-0c615842aa09/),
  credit Johns Hopkins APL, rechecked and visually inspected. Existing semi-rigid/wrapped
  jumpers retained. New supports are estimates; this photo does not identify a flight variant.
  [Radio evidence](../frontier-radio-2026-10-13/README.md).
- [Honeywell MIMU hardware and family CAD](../sources/honeywell-mimu-2026/README.md),
  supplier copyright retained. Real exterior inspected; exploded CAD/dimensions are family
  context, not Dragonfly flight installation. Ocellus retains the already approved outer
  estimate and original design envelopes. New fastener details are EST, not a verified pattern.
- [ICES2022-256](../sources/ices2022-256-battery-module/README.md), APL real test-module
  photographs pp6-7 visually inspected. This is a sub-scale thermal article, not a flight pack.
  CAD figures support arrangement only. [Battery evidence](../battery-2026-10-15/README.md).
- [NASA-STD-8739.4A Change4](https://standards.nasa.gov/standard/NASA/NASA-STD-87394),
  active record rechecked. Existing saved pp29-31 supply general relief/support principles,
  not confirmation of these fittings, material, bend radius, load capacity or qualification.
- TFAWS2023 slide3 supplies NASA/APL layout context for IEM/PSUs; JHU patent US8417859
  supplies radio architecture context only. Neither is a flight cable-installation drawing.

No exact public flight harness drawing was found or assumed. Integration-test cables,
supplier-family hardware and thermal-test articles are not promoted to flight evidence.

## Implementation And Checks

`dist/cable-installation.mjs` provides the shared estimated pad/post/cushioned-strap and
lacing geometry. Explicit local foot planes and fixed curve fractions keep fitting placement
testable. No new panel holes or invisible through-bolt construction are asserted.
IEM second-column paths remain unreviewed; candidate fitting locations were screened in
`find-supports.mjs`. The middle lead has no clear screened location, so its clamp is omitted.
Rejected IEM/PSU support drafts and the navigation head/rib draft are archived.

Twelve new tests cover five exact old-mesh fingerprints, the62-row register, pad/post/wire
contact, independent masks, non-nested focus targets, post/connector/other-wire clearance,
ring/lacing clearance and retention-head/rib clearance. Existing IEM preservation tests
exclude only the new tagged installation pieces, which these tests cover separately.
Battery's older sensor-pass manifest compares the original mesh set independent of regrouping;
it still verifies every old position/vertex, while new fittings have their own tests.
No legacy equipment or cable clearance tolerance is enlarged.

**595 tests pass**, zero failures/skips. Normal app checks cover collapsed default, five
rows/source links, ten Internal/Thermal focus actions, five mobile actions, independent
mount/wire masks, Restore, original-demo/Exterior hiding and Pilot return. Original24
numbered parts retained; phone client/scroll widths both375px; zero browser errors.
`browser-checks.json`, desktop/mobile UI and all five mobile model pictures are saved.
Status focus links apply Open interior and isolate the equipment, with connector-facing
angles for IEM, PSUs and battery. Reset and layer controls restore the full vehicle.
The phone comparison uses screenshot-crop color checks, not framebuffer readback.
Research renders use actual modules and raw materials, with canvas pixel checks; visual
QA corrected an occluded navigation macro angle and caught the head/rib contact.

## Samples And Recovery

Each family has a `*-real-context-model.jpg` sheet: real source, explicitly labeled
CAD/dimensional context, exact old whole model, current fitting detail. The zoom differs
deliberately between the old overview and current macro; geometry is not enlarged.
`five-family-detail-sheet.jpg` combines all five macros. Reproduce with `comparison.py`
using Pillow, not an image-generation service.

[Archive/restore instructions](../../archive/avionics-installation-2026-10-25/README.md);
tag `archive/avionics-installation-2026-10-25` on `b83d9eb`. Before pictures and exact
source/UI/test snapshots retained. The rejected drafts never shipped.

## Handoff

All five initial support/inspection packages are implemented; full electrical installation
is not complete. Next useful physical work: resolve the IEM second-column middle lead's
legacy routing against existing neighbors without moving completed parts, then continue
route groups and PSU lead families. Radio external mating and navigation ports need source
identity before any new connection. Keep the battery internal circuit/flight-pack limits
explicit. Preserve62 registered endpoints and all24 numbered components, archive replacements
and include the real/CAD/model sample with each new package.
