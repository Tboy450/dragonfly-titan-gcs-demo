# Interior Realism Checklist

Owner request recorded October 12, 2026. Maintainer for this entry: Codex (OpenAI).
Process and handoff notes added October 13, 2026 by Claude (Anthropic Claude Opus 5.5).
Context reconciled October 15, 2026 by Codex (OpenAI), including Claude's interrupted battery pass.
Battery pass finished and Codex's RDE pass reviewed October 15, 2026 by Claude (Anthropic Claude Opus 5.5).
Codex's October 16-20 passes reviewed and part 21 annotated October 20, 2026 by Claude.
Keep this file updated across context resets and assistant handoffs. Do not rebuild the
whole interior in one pass. Complete, verify and archive one part before moving on.

## Owner's Ordered Continuation (October21)

Owner steering, October 27, current pass:
- [x] Number every currently selectable top-level inspection assembly consistently
  across model markers, component selector, temperature list and detail title.
  Preserve original 1–24 IDs; append missing structure/harness assemblies.
- [x] Check anchors against actual hardware, including rotated views and hidden
  covers. Keep readable leader placement; do not put markers in empty group centers.
- [x] **Leave part 5 grouped**, per owner's clarification. Existing MEB/FEB/IMU/shelf
  subassembly controls stay; no new split parts or per-unit numbering requested now.
  [Numbering pass](research/inspection-numbering-2026-10-27/README.md): stable IDs
  25–32 appended, actual triangle pins, 733 tests, desktop/Thermal/390px checks saved.
  Committed locally before blower pass; combined publication still pending.
- [ ] After numbering/placement is complete, owner explicitly requests the **blower
  pair** rebuild. Use saved real supplier EM/catalog photos and 345 ×168 mm reference
  dimensions; reconcile both units and plumbing together, preserve source boundaries.

October 27: [Part 5 MEB harness connection](research/navigation-meb-link-2026-10-27/README.md).
- [x] Correctly identify the curved line as Bay harness `navigation-meb`; earlier
  shelf-leg interpretation was wrong. Reuse original real wiring/workmanship and
  Ocellus source packets. No exact flight connector or circuit established.
- [x] Fit one EST external flange/shell/backshell and strain relief between existing
  MEB ribs. Only branch tail changes; first two controls, all cable diameters,
  other routes, equipment geometry/poses and historical design boxes preserved.
- [x] Single shared inspection context: part 5/MEB and Bay harness retain branch;
  isolated IMU/FEB/shelf and camera routes omit it. Masks restore independently.
  725 tests, actual mesh seating/clearance and desktop/390px Internal/Thermal checked.
- [x] Archive exact prior modules/tag; useful connector/installed samples saved.
  Geometric connection is an illustrative example, NOT verified flight mating.
- [x] Published 00a7e35; Pages 40625667490 succeeded. Shared update preserved
  unchanged, 729 combined tests pass. Public MEB isolation sample/JSON saved;
  24 numbered parts, Open interior and no overflow/errors verified.
- [ ] Actual flight MEB ports/circuits, separate FEB/IMU leads and internal routing
  remain open. Do not declare the whole navigation harness complete.
- [ ] NEXT scheduled model rebuild: part 24 supplier-scale blower pair/plumbing,
  as detailed in the electrical audit below. No third inferred blower or guessed pinout.

October 27: [Electrical evidence / blower scale audit](research/draco-electrical-audit-2026-10-27/README.md).
- [x] Research actual supplier hardware/specs; save original EM composite and
  catalog photo, correctly separating real hardware, concept art and edited background.
- [x] Audit feed sensing and sample diverters. Related KArLE sensors are not DrACO
  flight evidence. No invented sensor count, controller, connector or pinout.
- [x] Measure unchanged blower meshes; 117.5 mm full span / 79.3 mm casing versus
  supplier 345 mm length / 168 mm diameter. 85 mm current pair spacing needs review.
  Parallel-cylinder overlap is screening only, not actual solid-collision proof.
- [x] Nested closed Electrical audit & blower size panel, focus links, part 24
  scale warning; 721 tests, desktop/390px checks and real/model/scale sample saved.
- [x] Published 5e25b65; Pages 40602293824 passed. Live Open interior, 24 numbers,
  closed audit, no overflow/errors verified. Public evidence screenshot/JSON saved.
- [x] Owner screenshot **2026-10-27 193738** clarifies the curved line by part 5:
  `main-harness-navigation-meb`, owned by Bay harness, NOT the part-5 support leg.
  Earlier identification was wrong. Its network end joins the trunk; its device
  end approaches Ocellus MEB at [-.2,-.235,-1.262] m without an assigned mating
  connector. Already `mating-interface-unresolved` in the October23 endpoint
  register. Reconcile this existing branch with the rebuilt MEB and a justified,
  labeled installation interface; do not invent a flight pinout or circuit.
  Part-5 isolation hides this separately owned harness, explaining its disappearance.
  FEB/IMU navigation branch remains independently unresolved. See current audit
  README and saved clarification screenshot. No geometry changed for this diagnosis.
  Its estimated external installation/inspection continuation is completed in the
  newer MEB link pass above; exact flight mating remains unresolved.
- [ ] NEXT: rebuild **part 24 blower pair together** from real supplier photos and
  published overall dimensions. Reconcile orientation/centers, supports, inlet,
  exhaust, selector and return fit; check other rebuilt parts and access layers.
  Preserve two redundant units; older APL cylinder/cone identity remains a candidate,
  not proof of a third blower. Exact port/foot detail and installed positions EST.
- [ ] Only after housing/plumbing fit, revisit electrical leads if supported.
  Supplier voltage/power/pinouts and flight feed-sensor identities remain unresolved.
  BNCP-21 water/glycol cooling is a different product; do not assign it to Dragonfly.

October 27: [Fixed feed lead + inspection defaults/numbers](research/drill-fixed-feed-lead-2026-10-27/README.md).
- [x] Recheck real EM1 and Costa prototype/GSE evidence; do not copy development
  plugs or assign a flight circuit/controller. Related TRIDENT remains separate.
- [x] One fixed-frame local service-lead example per drill; 4 mm diameter/exit/
  routing, actual rear opening/grommet and supported retention remain EST.
- [x] Preserve five other cover panels, full drive/carriage/head/bit/bellows, moving
  leads and sample routes. 712 tests; stationary frame, geometry/clearance/layers checked.
- [x] Owner addition: selector numbers 1–24 match model markers; extra assemblies
  stay unnumbered. Fresh Mission Internal, fresh/reset Open interior; saved mode
  choices and All/custom/Exterior/Thermal controls retained.
- [x] Desktop/390px phone, fresh/reset default, saved Exterior and IEM 12, port/
  Thermal starboard checked; no overflow/errors. Sources, archive and samples saved.
- [x] Published 6ee178c; Pages 40596670874 succeeded including 717 combined tests.
  Shared update preserved unchanged. Live Internal/Open, numbers 1–24, IEM 12,
  reset Open, fixed-lead disclosure and no overflow/errors verified; public samples/
  JSON saved. Preview stopped, viewport restored, tab left at Open interior.
- [x] Feed sensing + blower/diverter electrical evidence audit completed above. No inferred
  sensor count/type, flight connector/pinout or remote circuit from loose plugs.
  Exact flight wiring and hidden mechanics remain unresolved; see pass handoff.

October 27: [Upper drive exterior and mounting fit](research/drill-drive-2026-10-27/README.md).
- [x] Reuse real EM1 fig.2; save printed193 once for kinematic/free-end evidence.
  No uncovered flight gear/joint reference found; do not fabricate those internals.
- [x] Reproduce 80 mm drawing gap and upper mount crossing. Add neutral continuity
  envelopes, hollow cover/fittings, shoe/foot and actual cover openings; upper
  return now clears shaft by 12 mm. Fitted geometry EST, not flight load validation.
- [x] Preserve motor/gearbox, four cover sides, lower mount, entire carriage,
  bellows, leads, plumbing, bit depth and 130 mm travel. 682 tests.
- [x] Installed Internal/Thermal, covers hide/restore, 390px phone: 24 parts/two
  focuses, no overflow/errors. Real/Covers-on/Covers-off samples and comparison saved.
- [x] Published badbec2; Pages 40591034163 succeeded. Shared-branch updates preserved
  unchanged; 703 combined tests pass. Live build/disclosure, 24 parts/two targets,
  no overflow/errors verified. Public sample/JSON saved; server stopped, viewport reset.
- [x] Fixed feed-drive lead audit/local example completed above. Original next item:
  Reuse real EM1/prototype photos, distinguish GSE cables from flight wiring.
  No invented controller, pinout or sensor type. Remote wiring and real joint
  internals remain open; current handoff has exact limits.

October 27: [Roller carriage and spherical nut](research/drill-carriage-2026-10-27/README.md).
- [x] Read real fig.6 and EM1 assembly; save original source pages once. Correctly
  identify fig.11 as CAD, distinguish spherical EM1 nut from universal-style EM2.
- [x] Six crossed crowned roller exteriors, V-guide, supported bridge and hollow
  spherical nut/pocket. Fitted sizes/finish EST; no hidden needle/friction solver.
- [x] Preserve complete leads, bellows/drive covers, sample plumbing, bit depth and
  130 mm travel. Exact archived preservation guard; 675 tests and browser samples.
- [x] Desktop/390px phone, Thermal and removable covers checked; 24 numbered parts,
  two drill focuses, no overflow/browser errors. Real/CAD/model comparison saved.
- [x] Published ee24ad0; Pages 40505971224 succeeded including 675 tests. Live build,
  new disclosure, 24 parts/two targets, no overflow/errors verified; public sample/
  JSON saved. Preview stopped, viewport restored, shared tab returned to public app.
- [x] Upper drive exterior/seating pass completed above; actual flight load path and
  hidden mechanism remain open. Original next item:
  Reuse real fig.2; do not infer hidden gears or a flight motor from a covered can.
  Preserve this pass, sleeves and leads. Full wiring/flight dimensions remain open.

October27: [Feed covers and dust bellows](research/drill-feed-stage-2026-10-27/README.md).
- [x] Real EM1 photo-referenced drive cover/gearbox, metal guide, paired sleeves/end
  fittings. Preserve130 mm travel, bit depth, pneumatic network and moving lead paths.
- [x] Upper mount exact; lower return cut back to clear sleeve while retaining rail
  contact. Supported drive foot/lower collar; no floating fitting accepted.
- [x] Covers can expose the screw/actuator separately;669 tests, desktop Internal/
  Thermal and390px phone checks,24 parts/two focuses, no overflow/browser errors.
- [x] Exact before archive/tag, reused real/CAD sources, samples/measurement JSON.
- [x] Publisheddc0ee8a; Pages40497034993 succeeded including669 tests. Live build,
  new stage/limits text,24 parts/two targets, no overflow/errors verified. Public
  sample/JSON saved; temporary preview stopped and viewport restored.
- [x] Guide/roller carriage and spherical nut exterior completed in the pass above.
  Upper drive U-joint internals remain open. Original instruction: read saved
  EM1 photo and AMS2024 fig.6 first; preserve completed sleeves/leads and revalidate
  full stroke after changes. Flight travel/load path and hidden mechanisms stay open.
- [ ] Feed/sensor and body-to-controller wiring remain unresolved, as do full networks.

October27 wrap-up: [Drill moving lead pass](research/drill-moving-leads-2026-10-27/README.md).
- [x] Two constant-length moving lead examples per drill, fixed upper-mount retention
  points, supports and motor boots. Original motor ends/diameters and mechanics retained.
- [x] Real2024 EM1 source photo, related TRIDENT harness photos and existing NASA
  workmanship evidence saved/reused; round envelopes and routes explicitly EST.
- [x] 662 tests:41 stroke positions, installed mesh/pair clearance, real sampling pose,
  buffer reuse, support contacts and independent layers. Desktop/phone samples/JSON saved.
- [x] Publishedb6fb179; Pages40481602061 succeeded including tests. Live build,
  constant-length/controller disclosures,24 parts/two targets and no overflow/errors
  verified. Public sample/JSON saved; temporary server/tab stopped.662 tests pass.
- [ ] NEXT PASS: reconcile retained2022 feed-stage geometry against2024 EM1/ETU
  real hardware: actuator/gearbox enclosure, guide/roller carriage and paired dust bellows.
  Start from saved `research/sources/draco-ams2024/` pages210/214/215. Keep130 mm
  travel until bit depth, ground clearance, hose and cable envelopes are reconciled;
  development160/300 mm figures do not automatically identify flight travel.
- [ ] Fixed retention-to-controller continuation, feed motor/sensors, blower/diverter
  wiring and actual cable construction/cryogenic life remain open. No new remote mating claim.
Historical wrap-up instruction applied to the earlier turn; owner resumed this work above.

October27: [Both-drill plumbing continuity](research/draco-connectivity-2026-10-27/README.md).
- [x] Confirm owner's assembled-equipment concern; retain both neighborhood samples.
  Trace both intake routes, carousel/return and both blower inlets.
- [x] Reproduce/fix1 mm return-selector gap; advance only the last control4 mm into
  a3 mm estimated seat. Preserve all other hardware/routes; strict10-join checks.
- [x] 655 tests pass. Explain route/valve limits in existing collapsed inventory.
- [x] Publishedb27cb6e; Pages40475925194 succeeded. Public full-network focus,
  route/limits/seat text,24 parts/eight rows, no overflow/errors verified. Samples
  and JSON saved; temporary previews stopped.655 tests pass.
- [x] Local moving lead examples completed in the later pass above; full networks remain open.

October27: [DrACO side inventory](research/draco-side-audit-2026-10-26/README.md).
- [x] Inventory both mechanisms: matching 45 mesh pieces, two body mounts and two
  short motor-lead examples each. No missing named drill counterpart found.
- [x] Separate paired mechanisms from shared suction and one-sided camera equipment.
  Both exact flight blower positions remain unverified; no arbitrary mirror copy.
- [x] Two independent drill focuses with fixed-rail numbers; sample tubing uses Plumbing.
- [x] Eight source/coverage rows in a collapsed inventory; buttons return to the model.
- [x] Exact before files/recovery tag, reused source imagery and desktop/phone samples.
- [x] 652 tests, Internal/Thermal pixels, 24 parts, 11 IEM targets, hide/restore,
  research-only gating, all focus callbacks, no overflow/browser errors.
- [x] Published4f375be; Pages40463472979 succeeded. Live build, eight inventory rows,
  both drill focuses,24 parts and11 IEM targets verified, zero browser errors.
  Public sample/JSON saved; local preview stopped.652 tests pass.
- [x] Local drill motor-lead moving service accommodation completed above;
  full Z-feed/blower/diverter wiring, identified avionics mating, separate elevator
  paths, guards and hidden brackets remain open. Do not claim flight completeness.
Outreach was handled separately; its private local send log is not part of this release.

October26: [IEM tag / terminal cleanup](research/iem-terminal-cleanup-2026-10-26/README.md).
- [x] Lead8 label surface-attached, no sampled penetration anywhere on its cable.
- [x] Three hollow EST retention wraps replace solid terminal blocks, original footprints.
- [x] All26 complete cable curves/endpoints/radii and other fittings exact; all325 pair
  measurements unchanged.645 tests pass; no lead8 exception or enlarged contact limits.
- [x] Real APL hardware photo rechecked/reused, source/recovery records and sample saved.
- [x] Desktop/phone:24 parts,11 focuses, no overflow or browser errors; Internal/Thermal checked.
- [x] Published7538184; Pages40278240471 succeeded. Live build, corrected-label and
  capacity disclosures,24 parts and11 focuses verified without browser errors.
  Public sample/JSON saved, preview stopped;645 tests pass.
- [ ] Literal terminal topology/capacity redesign remains open:26 modeled9 mm leads need
  at least45.9 mm area-equivalent diameter, versus the illustrative18 mm branch. Photos
  do not identify all destinations. Do not add a false splice, conceal the mismatch or
  arbitrarily resize flight hardware. Further network changes need a separately scoped pass.
DrACO equipment asymmetry inventory is completed above; its unresolved hardware stays open.
Git cleanup remains paused; Assets Lab/Swarmfall/save data untouched.

October26: [final IEM columns and approved lower refit](research/iem-final-columns-2026-10-25/README.md).
- [x] Finish columns7/8, IDs22-26, with attached tags/supports/two ties and two focuses.
- [x] Owner-approved refits4/13/21; all26 endpoints/radii and other18 installations exact.
- [x] Try2 cm accommodation first; measured extra return extent10.4 mm, envelope allowance12 mm.
  No enclosure enlargement or3 cm expansion. Original main-harness/contact limits retained.
- [x] Complete isolated validation before installation, then640 tests; all325 pairs clear,
  second-column3 mm guard retained.11 focuses,24 parts, desktop/phone and zero browser errors.
- [x] Baseline archive/recovery tag, rejected trial parameters, full-IEM and phone samples.
- [x] Publish020bfae; Pages40276054426 succeeded. Live build/disclosures,11 targets,
 24 parts and phone375/375px verified with zero browser errors. Public sample/JSON
 and recovery tag saved. Preview stopped. Previous live build below is historical.
- [x] Lead8 contact resolved in the later tag cleanup above; historical measurements retained.
- [ ] Terminal convergence remains explicitly measured/open. No flight topology claim.
The eight local columns are reviewed estimates, not a completed or flight-qualified harness.
Next broader task remains the port/starboard DrACO equipment inventory below; do not mirror
equipment without evidence. Git cleanup paused; no Assets Lab/Swarmfall/save changes.

October25 current checkpoint: [IEM columns five/six](research/iem-fifth-sixth-columns-2026-10-25/README.md).
- [x] IDs15-21: seven EST routes/tags/supports, fourteen ties and two column focuses.
- [x] Preserve fourteen completed routes/fittings, five placeholders and26 endpoints/radii.
- [x]635 tests; all original envelope/main-harness/contact checks retained, including
  the second column's3 mm guard. Rebuilt sampled gaps exceed2 mm. Terminal and
  legacy-placeholder interference remain open and separately measured.
- [x] Nine focuses in Internal/Thermal, hide/restore and phone375/375px;24 parts,
 22 nonblank focus render checks and no browser errors. Shared references reused.
- [x] Two-finger centroid pan when Rotate is selected; one-finger orbit/native
  page scroll off retained. Actual UI-event tests, not a claimed physical-device test.
- [ ] Next: seventh column IDs22/23, then eighth IDs24/25/26.21 reviewed,5 remain.
Published **00d32be**, Pages40241403099 succeeded. Live build/new targets/disclosures,
24 parts and phone375/375px verified without errors; public samples/JSON and recovery
tags saved. Preview stopped. Git cleanup remains paused: backup is partial,
OneDrive could not supply some files; no deletion performed. Command-local automatic
cleanup suppression only, not a permanent repository/global setting. Do not touch
Assets Lab/Swarmfall data. Earlier dated next-step entries below are historical.

October25 owner follow-up:
- [x] Validate port/starboard DrACO drill equipment asymmetry (October27 inventory above;
  no missing named paired mechanism found, flight installation still incomplete). Inventory both drill heads,
  feed/drive hardware, brackets, guards, hoses/harnesses and nearby optical/sample interfaces
  against real NASA/APL photos and published diagrams. Distinguish intentional shared or
  one-sided equipment from a missing modeled part before adding or mirroring anything.
  Save a side-by-side inventory and source evidence; symmetry is not assumed.

October25: [inspection pan](research/inspection-pan-2026-10-25/README.md).
- [x] Right hold/drag slides the view only while Rotate is selected; left drag still orbits.
- [x] Shared camera keeps part labels attached; focus/reset/follow recenter.
- [x]628 tests, desktop/phone keyboard-equivalent pan, wheel/focus/Pilot checks.
Hardware unchanged; next IEM15/16/17. IMPORTANT: after OneDrive's mass-deletion
warning owner chose Keep. Use `git -c gc.auto=0 -c maintenance.auto=false` for writes;
do not clean/prune or approve/suppress OneDrive deletion prompts.
Publisheda68e08a, Pages40222640031 succeeded; live sample/JSON saved,24 parts,
zero errors.628 tests pass; recovery tag pushed and preview stopped. No automatic
cleanup during publication. Hardware next remains15/16/17.

October25 UI request: [inspection controls](research/inspection-controls-2026-10-25/README.md).
- [x] Rotate-selected mouse-wheel zoom, without hijacking normal scroll/browser zoom.
- [x] Layer selector above viewport; keep all details below, including phone order.
- [x] Interior c light-grey grid, reusing Thermal's painter with independent preferences.
- [x]623 tests; actual desktop/phone wheel checks, no horizontal overflow or part loss.
No hardware work in this pass. Next remains fifth IEM column15/16/17 below.
Published051c9d9; Pages40217478630 succeeded. Live wheel/grid/toolbar/24 parts
verified, zero errors. Public sample/JSON saved; recovery tag pushed and preview stopped.

Latest October25: [fourth column, IDs12-14](research/iem-fourth-column-2026-10-25/README.md).
- [x] Three separated estimated routes/attached labels, three supports, six ties and seventh focus.
- [x] Preserve all eleven completed routes/fittings and26 endpoints;619 tests pass.
- [x] Keep original main-harness, IEM envelope and gathering/contact limits unchanged.
- [x] New focus in Internal/Thermal, whole IEM, hide/Restore and compatibility;24 parts,
  phone375/375px client/scroll, zero errors. Shared reference records reused.
- [x] Fifth column IDs15/16/17; completed in the later combined five/six pass above.
Owner's process clarification: reuse source records/photos unless resolving a new detail.
Do not duplicate real/CAD comparison sheets per cable or column. One current model sample
and concise measured evidence are enough; retain baseline/rejected parameters for recovery.
Terminal bundle overlap, actual circuits, full harness and qualified bends remain open.
Published **e372a1b**, Pages40213913093 succeeded. Live new focus,14-reviewed/12-open notes,
seven focus options, five source links and24 parts verified; zero errors. Phone375/375px
with full canvas visible; desktop/phone hardware-pixel checks pass. One public sample saved,
shared references reused; recovery tag pushed, preview/watcher stopped. Next15/16/17.

Latest October25: [third-column lower IDs 10/11](research/iem-third-lower-2026-10-25/README.md)
complete the third card column as an installation estimate. Two routes/labels, two supports,
four ties and a sixth focus; all nine completed routes and 26 endpoints remain exact.
614 tests pass, including unchanged floor-harness/envelope checks. Sampled free-span gaps
about 4.4/2.5 mm; inherited terminal overlaps and flight mating remain unresolved.
Desktop/phone, 12 focus cases and hide/Restore pass; all 24 parts retained, zero browser errors.
Real/CAD/model and full-component samples, recovery tag and rejected draft saved.
- [x] Refine third-column lower pair IDs 10/11 as explicitly estimated installation examples.
- [x] Fourth card column IDs 12/13/14; completed by the later pass above.
Eleven reviewed, 15 remain. Earlier next-step notes below are historical, not current tasks.
Published **2491558**, Pages 40211931773 succeeded. Live build/six focuses, eleven-reviewed/
15-open notes, five links and all 24 parts verified without errors. Public full-IEM sample
and JSON saved. Recovery tag pushed; temporary preview and deployment watcher stopped.

Latest October25: [third-column upper pair IDs 8/9](research/iem-third-upper-2026-10-25/README.md)
has separated service routes, attached labels, two supports and four ties [EST]. All seven
previously reviewed routes, fittings, enclosure, floor harness and 26 endpoints stay fixed.
609 tests pass; sampled free-span gaps about 4.5/2.4 mm. Nine reviewed, 17 open. Next two:
third-column lower IDs 10/11. Terminal gathering overlaps and flight circuits remain open.
Owner's visibility concern: first column was hidden by isolated subassembly view, not
removed. New samples include Whole component / full-IEM views with every column present.
Published **09e58eb**, Pages 40171467980 succeeded. Live five-focus/count/source checks
pass with zero errors; public full-IEM screenshot/JSON saved. Recovery tag pushed;
temporary preview and deployment watcher stopped. Next IDs 10/11 have not been started.

Latest October25: [second-column upper/lower routes](research/iem-second-column-2026-10-25/README.md)
complete the local installation estimate for the first two card columns. IDs 5/7 gain
separate bends, attached labels, refitted supports and two ties each. The completed middle
lead, first column, enclosure, floor harness and all 26 endpoints stay fixed. 604 tests pass;
sampled free-span gaps about 3.1/4.9 mm. Terminal gathering overlaps are still unresolved.
Seven reviewed routes, 19 open. Next: third-column upper pair IDs 8/9, then lower 10/11.
Preserve all seven reviewed routes and exact fitting contacts; no new circuit assignment.
Published **6933908**, Pages 40169713662 succeeded. Live four-focus/count/source checks
pass with zero errors; public sample/JSON saved. Recovery tag pushed; preview/watcher stopped.

Latest October25: [IEM middle lead](research/iem-middle-lead-2026-10-25/README.md) has a
separated service bend, attached label, support and two ties [EST]. All 26 endpoints and
every other mesh, including completed fittings and the floor harness, stay fixed.
599 tests pass; sampled free-span gap about 2.4 mm. Inherited gathering endpoints still
overlap and are explicitly unresolved. Five local routes reviewed, 21 remain.
Next: second-column upper/lower leads (IDs 5 and 7), preserving the now-completed middle
route and all first-column work. Desktop/phone, eight focuses and reversible layer checks
pass; all 24 numbered parts retained and zero browser errors. Archive/samples saved.
Published **95d5f89**, Pages 40165566073 succeeded. Live build/four focuses, updated
five-reviewed/21-open notes, five source links, 24 parts and zero errors verified.
Public screenshot/JSON saved; recovery tag pushed. Preview and watcher stopped.

Current October25 checkpoint: owner requested all five avionics installation families.
[Five-family support/inspection pass](research/avionics-installation-2026-10-25/README.md)
adds10 estimated supports,6 lacing examples and24 navigation retention pieces, with a
collapsed status panel/five focuses. All prior meshes/62 curves exact;595 tests pass.
IEM second-column middle support is explicitly deferred because legacy routes overlap;
two surrounding supports fit. No navigation harness or radio external link is fabricated.
Desktop/phone checks retain24 parts and375px client/scroll widths, zero browser errors.
This supersedes the earlier single-column next-step notes, not the open full-harness scope.
Published **31afae8**, Pages 40162267225 succeeded. Five live focus actions apply Open
interior/isolation; five source links, all 24 parts and zero browser errors verified.
Public screenshot/JSON saved with research; recovery tag pushed. Complete flight routing
remains open, particularly the overlapping IEM middle lead and unknown mating circuits.

Current October24 checkpoint: [IEM lower pair complete as an installation estimate](research/iem-lower-pair-2026-10-24/README.md).
Four leads reviewed,22 still open. The completed upper pair, all26 endpoints, enclosure
and main harness are unchanged. Third focus, attached labels and connector-clear supports;
583 tests pass, desktop/mobile and six focus cases verified, zero browser errors.
Next: second card column indices4/5/6 (three existing leads). Earlier next-step notes below
are historical; do not repeat the now-finished first-column lower pair.
Published **38f297e**, Pages40159761299 succeeded. Live three-focus/accuracy/source/count
checks pass without errors; public sample/JSON saved. Preview and watcher stopped.

Latest October24 installation: [IEM upper pair](research/iem-service-bends-2026-10-24/README.md).
First two existing leads gain estimated slack, lacing/supports and two focus targets.
All26 endpoints, enclosure, main harness and other24 curves preserved exactly.580 tests
pass; browser focus/masks/phone/Pilot/model-switch checks pass with zero errors.
Archive/source comparison saved. This does NOT finish the full IEM or avionics harness.
Next: existing lower pair indices2/3, same photo/scale and endpoint preservation process.
Published **19b379f**, Pages40158732621 succeeded. Live focuses/source links/accuracy notes,
24 parts and zero errors verified; public screenshot/JSON saved. Local preview stopped.

Latest October24 source gate: [sampling electronics role/coverage audit](research/sampling-electronics-2026-10-24/README.md).
Public roles documented for IEM, PSUs, DrACO avionics, DraMS main/laser electronics and
carousel drives. New expandable panel exposes gaps and four existing inspection targets.
No new wires, controllers or geometry. Source photos/page saved; actual flight mating still
unresolved. Next bounded installation pass: IEM connector service-loop/support audit,
using existing photos and endpoint register, not another speculative attic trunk search.
576 tests pass; desktop/mobile focus and view-mode retest have zero errors after the
original-demo metadata guard fix. Physical interfaces and full wiring remain open.
Published c3b2199, Pages40109821169 succeeded. Live six-row/source panel, all four focus
actions and original-model switch pass with zero errors; screenshot/JSON saved in research.
Local preview stopped; next remains IEM local connector installation, not a new attic bus.

Latest October24 checkpoint: [carousel warm-drive installation](research/carousel-warm-drives-2026-10-24/README.md).
Three existing drive examples retain centers/nominal can scale, with real-photo-inspired
metallic housings, dark caps, wrapped necks and independent focuses/layers. Three estimated
local leads have slack/lacing/supports under the existing baseplate; remote bus/controller
connections remain OPEN. Cold carousel and other equipment unchanged;572 tests pass.
The attic register now measures11 examples; all four unresolved network families stay open.
Next source gate: actual external instrument/controller mating before a new trunk/penetration.
Published d9033df; Pages40108265512 succeeded. Normal public navigation verifies all three
drive targets, close-up,24 rows and current accuracy notes, with no errors. Live screenshot/
JSON saved with research; local preview stopped. No game edits in this pass.

Latest October23 attic checkpoint: [eight-line register / local installation](research/attic-connection-media-2026-10-23/README.md).
Two electrical examples, three estimated gas/sample tubes and three unclassified routes
have independent inspection access. One DraMS short wire gains estimated slack/lacing/
support; endpoints fixed, all other hardware/tubing/carousel geometry exact.562 tests pass.
Published **cc272b0**, Pages run40059963401 successful; **567 combined tests pass** after
preserving Claude's92e5a58 game update. Normal public browser checks confirm six media-mask
cases,24 parts and the wire macro with no errors. Public screenshot/JSON are saved beside
the register. Local preview servers stopped. Next: external/mating/drive/feedthrough
reference work before any new trunk geometry; the full attic network is not complete.
Full attic trunk, external DraMS power/data, warm-drive leads and an identified electrical
feedthrough remain OPEN. Do not copy integration ground-test harnesses or treat a nearby
connector/sample neck as an assigned electrical interface. Other legacy parts not reclassified.
Local browser: six media-mask cases in Internal/Thermal, carousel line-only hide/restore,
six source links,24 rows, Open interior, corrected non-nested wire macro with casing masks,
desktop/mobile samples and Pilot return pass. No horizontal overflow or browser errors.

Owner: "ok do those then begin on this and add this to the checklist first then continue".
Recorded BEFORE further model edits. Finish one scoped part with source/archive/tests and
samples before starting the next. Real hardware first; unverified Dragonfly details remain
explicitly estimated, not flight CAD. Do not repeatedly search the same closed leads.

1. [x] **Codex, Part20 battery-temperature sensor:** TE44909-family approximation replaces
   annotation-only geometry. Real maker photo/drawing; 2.4 mm maximum envelope, paired leads,
   estimated bond pads/side-wall placement. Macro selector at unchanged scale. Exact flight
   type/count/installation remain open. [Sources, samples and checks](research/battery-sensor-2026-10-21/README.md).
2. [x] **Codex, Part21 MMRTG fin-root sensor:** Omega F2020 Class B hardware-family example,
   2 x2 x0.8 mm element, paired10 mm leads, estimated curved bond and placement. Real catalog
   photos/drawing; range covers157 C. Independent layers and actual-scale macro inspection.
   Flight type/count/mount/routing remain open. [Sources and samples](research/fin-root-sensor-2026-10-21/README.md).
3. [x] **Codex, October22 MMRTG generator body:** real NASA PIA23306 appearance reference,
   published64 x66 cm envelope; thinner pale fins, narrower housing, root attachments, end
   covers/collar and covered connector example. Detailed sizes/finish/variant estimated.
   Independent inspection targets/masks and unnumbered body selector;24 numbers preserved.
   Sensor21 refitted via shared dimensions. [Sources, samples and checks](research/mmrtg-body-2026-10-22/README.md).
4. [ ] **Structural wall layers:** start one side-wall panel, then skin/deck/insulation and
   mounting layers separately. Add hide/ghost controls as needed; preserve interior access
   and camera penetrations. Do not invent undocumented honeycomb/core construction.
   First starboard panel initial pass complete October22: separate 0.254 mm aluminum faces,
   estimated edge closeouts and camera relief; outer/inner/edge focuses and independent masks.
   [Sources, process, sample and limits](research/side-wall-2026-10-22/README.md).
   Opposite wall/end joints, deck and independent foam regions keep this overall item open.
   Port wall and estimated nose/canted-aft joint initial passes now complete; deck/attic
   boundary is next. [Current sources, samples and handoff](research/port-wall-joints-2026-10-22/README.md).
   Initial deck/attic-edge pass complete. Body outer surface is now split into five
   removable inspection regions; attic/HGA surface access and local camera-window surrounds
   now have initial passes too. Full local construction and harness continuity remain open.
   [Current body evidence/sample/handoff](research/body-foam-2026-10-22/README.md).

Other harness work stays queued behind this order. Current count24/24 initial passes
(9 Codex / 15 Claude), with labeled hardware-family/design approximations. Installation and
construction work are still open. Follow the expanded packages below after the ordered
items; do not confuse finishing the numbered list with finishing construction and connections.

Current October23 attic/local checkpoint: initial attic cover and camera/HGA access passes
implemented. Five attic surface regions and two HGA dome surfaces retain prior geometry;
three estimated camera-window surrounds, component/global insulation masks and Open interior
whole-equipment access. All layers/Restore reverses it; no equipment/flight-state movement.
Lower windows now meet the actual beveled body, with estimated optical corridors/neighbor
reliefs; camera bodies and aim unchanged. Full camera blisters/inner construction remain
open, not flight CAD. Combined550 tests and35 local Edge cases pass; masks/source/count24/
Pilot/geometry/pixels pass. Archive baseline ef3b429; rejected rim draft kept. Release59a03b9
published successfully through Pages39899505403. Uniform renderer import stamping is
tested, but the normal public browser still did not initialize: blank model, Internal
unresponsive. Do not claim a public UI pass or a resolved loading cause.
[Publication receipt and next diagnostic boundary](research/attic-local-insulation-2026-10-22/live-59a03b9/README.md).
[Current sources/samples/handoff](research/attic-local-insulation-2026-10-22/README.md).

Owner's latest direction: entire harnesses may be missing. Existing floor/riser/component
runs are not a complete electrical design. [Coverage register](research/attic-local-insulation-2026-10-22/HARNESS-AUDIT.md)
records the omitted attic trunk and port Down Camera branch, plus navigation, arm/motor,
sensor and RF continuity follow-ups. Full endpoint register comes before adding bundles.
Do not duplicate existing runs or infer flight pinouts/cable counts. No new wires this pass.

October23 continuation: [initial bay register / lower-camera installation](research/harness-endpoints-2026-10-23/README.md).
20 rows:12 geometric contacts,4 unresolved device mating interfaces,4 network-only links.
Three camera/LED tips corrected; port Down Camera bypass/support added through existing
reliefs around PSU1 without moving equipment. Trunk/other routes retained. Unnumbered
Bay harness offers four focuses and wire/mount masks.10 focused tests pass; full coverage
of attic, navigation, sensor, motor and RF families remains open. Earlier public59a03b9
initialized normally and rendered Open interior with24 rows; genuine screenshot saved.
Full556-test suite and actual desktop/mobile app controls/masks/sources/Pilot checks pass.
Real/CAD/before/after comparison saved. No unchecked global family is silently completed.
Releasea4ed215 and recovery tag pushed; Pages40057622872 succeeded. Normal public CUA
build badge/new selector/port focus/Open interior rendering/24 rows pass; error log empty.
Publication screenshot saved in current research; local server stopped. Next: attic leads,
with sample/air lines tracked separately before assigning a main attic trunk.

Historical October22 body-insulation checkpoint: five independent top/deck, port, starboard,
belly and end surface regions, with aggregate body/foam masks and separate structural
wall/deck masks. Exact original outer-body triangles/normals/UVs retained; three legacy
solid cross-bay seam boxes retired and archived. No volumetric foam, inner liner, flight
tile map or membrane stack invented. All24 equipment plus walls/joints/deck/attic unchanged.
NASA2025 real test photo and NESC May2026 foam development saved/reviewed: current body
selection is Solimide-based / Solimide16, not a blanket update to all local Rohacell.
Legacy thermal constants remain unchanged; a separately scoped source/material audit is open.
Initial519 tests passed; combined525 pass after merging Claude's newer game/Lab commits
throughf8e88e3. Release dc5dee4 and recovery tag pushed; Pages39893875943 succeeded.
Public HTML/module/build stamps verified directly. Public Edge UI checks remain incomplete:
30/90second load-event timeouts before the interaction loop; do not claim public36 passed.
Local36 cases, source/pixel/mask/restore/geometry checks passed. [Publication receipt](research/body-foam-2026-10-22/live-dc5dee4/README.md).
Local preview stopped. Next: attic region separation, then local camera/HGA insulation. Keep thickness,
penetrations, encapsulation/vents and hidden construction open until separately supported.

Historical October22 deck checkpoint: unnumbered Top deck / attic edge, separate0.254mm
faces and estimated12mm depth, opening, edges/lip and lock foundations. Existing HGA/TWTA
share unchanged y=.07m mounting plane; foundations meet existing lock bases. Initial89mm
opening crossed unchanged dome; draft archived,121mm final opening passes15 deploy/pointing
states. Original24 parts, walls/joints and body/attic foam geometry/poses match baseline1bee304.
503 tests and24 local Edge viewport/subassembly cases pass, four part/global masks restore,
sources/count24/Pilot return and raw/context pixel/framing checks pass. Comparison reviewed.
Next is body/deck insulation-region separation, then attic/local foam. Exact core/layup,
supports, seals and conduction/strength remain unmodeled, not new flight-engineering claims.
Release43f6e21 and recovery tag pushed; Pages39764147097 succeeded. Public Edge24
viewport/subassembly cases, four part/global deck masks and restore, sources, original24
rows, context and Pilot return passed without page/network failures or overflow. Receipt:
`research/top-deck-2026-10-22/live-43f6e21/`. Local preview server stopped.

Historical October22 port/joint checkpoint: two new unnumbered inspection choices, port
wall with separate Down Camera and Microscopic Camera/LED reliefs; nose and canted aft
joint pairs follow existing bulkhead edges. New detail is estimated; no core/seal/insert
or qualified load/bond claim. All24 numbered parts and accepted starboard geometry/poses
match baseline8ac4e59. Existing IEM bolt tips meet the inner face; prior ground-bond endpoint
has a recorded bounded1.46 mm embedding, to resolve in a later actual-mount/bond pass.
481 tests pass;42 local Edge viewport/subassembly cases, masks/restore, sources, original
24 numbers, Pilot return, optical rays and visualization clearance checks pass. Real/CAD/
model/phone comparison and raw/context views saved. Deck/attic boundary next, then separate
foam regions, camera blisters and remaining structural connections. Do not restart parts.
Releasedd1343f2 and recovery tag pushed; Pages39731139711 succeeded. Public Edge42
viewport/subassembly cases (24 port/18 joints), independent part/global masks and restore,
sources, original24 rows and Pilot return pass without page/network failures or overflow.
Receipt/screenshots in current research `live-d1343f2-port/` and `live-d1343f2-joints/`.
Local preview server stopped. Deck/attic boundary is next; no repeated initial part passes.

Historical October22 wall checkpoint: first starboard panel added without altering any of the
24 numbered parts. Real frame photos and NASA's published 0.01-inch aluminum faces used;
outline, 12 mm separation, fittings and camera relief estimated. Core cells/layup unmodeled.
Initial inboard draft crossed PSU/TWTA harness, archived; wall alone moved 9.5 mm outboard.
Local 24 viewport/subassembly cases, independent masks/restore, sources, Pilot return,
all-numbered geometry manifests and wall-face/neighbor clearance pass. Raw model views
are nonblank/framed. Body/attic foam remain combined; new wall is physical structure,
not a box of equipment inside the bay. Opposite side and end joints are next.
Full suite: 463 pass, zero failures. Current source/model comparison visually reviewed;
release/public verification recorded in the current research folder after deployment.
Concurrent game/workflow changes through22e7df8 merged intact; combined469 tests pass.
No manual game/workflow edits, simulator implementation unchanged by merge.
Model25a1dae/release1d05c6d and recovery tag pushed; Pages39729103197 succeeded. Public
24 viewport/subassembly cases, three part masks and global wall mask/restore, original24
numbers, sources and Pilot return passed without page/network failures or overflow.
Receipt in `research/side-wall-2026-10-22/live-1d05c6d/`. Local preview server stopped.

Historical October22 body closeout: own MMRTG exterior pass complete;458 combined tests pass
(450 before merging concurrent game work through2190944),24 numbers unchanged.
Local24 viewport/subassembly cases, layer masks/restore, refitted21, source links, raw model
pixel/framing and numbered-neighbor/stabilizer clearance pass. Battery/20 geometry unchanged.
Next is the first structural side-wall panel. Flight coating, detailed fin/root/end/connection
dimensions and sensor installation remain open evidence follow-ups, not missing initial parts.
Release4449203 and recovery tag pushed; Pages39726749517 succeeded. Public Edge24 cases
passed at1440/390/360px, with source links, stamped module, unchanged24 numbers, independent
masks/restore, refitted21 and Pilot return; no page/network failures or overflow. Receipt:
`research/mmrtg-body-2026-10-22/live-4449203/`. Local preview server stopped.

Historical Part21 closeout:444 tests pass,18 local browser viewport/layer/subassembly cases,
four orbit angles, independent masks and Pilot return, raw macro/full-installation pixel
checks and no numbered-neighbor intersections. Generator/battery/part20 manifest unchanged.
Photo/drawing/illustration/model comparison archived. Next: MMRTG body, then first wall panel.
Release6189cd8/tag pushed; Pages39639698393 succeeded. Public Edge18 cases, source/count/
revision/module stamp, masks/restore, covers and Pilot return passed with no page/network
failures or overflow. Receipt in `research/fin-root-sensor-2026-10-21/live-6189cd8/`.
Preview server stopped; NASA generator photo/cutaway leads recorded for the next body pass.

Historical Part20 closeout:438 tests passed;18 real-Edge Internal/Thermal/selector cases at1440/390/360px,
four orbit angles, independent masks/restore and Pilot return passed. Installed-frame clearance
check has no overlaps with other numbered parts. Battery and21 mesh manifests match the
pre-pass baseline. Source photographs/drawing/CAD/model comparison and both finish drafts
saved. Release83ff28a/tag pushed; Pages39636392679 succeeded. Current public builddde1292
includes the concurrent game release and passes18 production browser cases plus masks,
sources, module stamp, restoration and Pilot return; receipt in the part20 research folder.
At that checkpoint21 was next; its completed pass is now recorded above.

Owner's efficiency direction: batch independent reads and related implementation steps;
reuse saved sources and helpers, run focused checks during development and a full suite at
the completed change boundary. Repeat checks only for changed behavior or unresolved faults.
Finish/record one part, then proceed when appropriate; do not equate more reasoning effort
with a need to re-audit settled details or perform another identical documentation deployment.

## Previous Checkpoint: 22 Initial Passes; RDE Connector Service Loops

October21 Codex: [current source comparison, archive and handoff](research/rde-service-loops-2026-10-21/README.md).
Claude's 03/09 closeouts retained as approved approximations. **22/24 initial passes**;
only20/21 remain annotations. RDE cables/ties now have their own Harnesses/lines mask,
separate from Interfaces. Four estimated slack bows retain the original connector/trunk
endpoints; enclosures, other parts and main-harness routes unchanged. No hidden pinout or
qualified bend-radius claim. Saved NASA/APL wiring photo and NASA workmanship pages support
appearance/general principles only.432full tests pass; real-Edge18unit/layer/viewport cases,
six independent wire/interface-mask cases, restoration/Pilot and raw-pixel framing pass.
Archive/tag5f9e1bb. Model/source/archive releasee7f7993 pushed with recovery tag;
Pages39558352175 succeeded. Public Edge build e7f7993 passes six Internal/Thermal
1440/390/360 cases, independent masks/restore, source links/count22, stamped module and Pilot
return; no page/network failures or overflow. Current research `live-e7f7993/` saves receipt.
Next installation items: other units' service loops, attic wiring, supports and ghostable wall
panels, one scoped pass at a time. Do not restart completed parts or touch game assets.

## Previous Checkpoint: Part 21 Annotated Like Part 20; Hardware Open (October 20, Claude)

The owner asked Claude to check Codex's work and continue ("do like 3-6 of the parts", pushing
after each). **Review:** Codex's October 16-20 passes (#22 EFIELD/METHAN, #05 Ocellus/MIMU,
provisional #03, #09 inspection, #20 annotation) are committed and published; 409 tests passed
before this pass. Claude's unpublished #22 research draft was dropped, not merged: Codex's #22
already covers it. Count **20 of 24 (5 Codex, 15 Claude)** at that point; **21 of 24 (6 Codex, 15 Claude)** after the
owner approved approximations on October 21 (03 closed out), and **22 of 24 (7 Codex, 15 Claude)** after 09.
20 and 21 stay annotations.

**Part 21:** [sources, changes and checks](research/mmrtg-measurement-2026-10-20/README.md). The
green sphere passed through the MMRTG's top fin and floated alone when isolated. It is now a
labeled annotation on the housing beside the top fin's root, posed with the generator, and
isolating 21 shows the MMRTG. TFAWS 2023 slides 7/9 and NASA's MMRTG fact sheet (157 C) are the
evidence; Pioneer's RTG fin-root sensors are context only. No flight sensor package, count or
position is published, so **21 stays unchecked**. Archive and tag `archive/mmrtg-sensor-2026-10-20`
on `d016f12`. 414 tests pass; real Edge at 1440/390/360 px, before and after.

**Also October 20:** the arm shoulder fitting (exterior item, owner's October 15 note) is drawn
from the May 2026 frame photo; see the Exterior section below.

**Also October 20 (owner's attic note):** Wonderwall (#07) and DraMS (#08) got photo-detail
passes (Codex's parts kept underneath). The main wiring harness's first pass (bay-floor trunk
and branches) followed on October 21 (Connections and Installation section).

At this October20 checkpoint,03/09/20/21 awaited evidence. The owner subsequently approved
labeled approximations for03/09, now counted; **only20/21 remain unbuilt sensor hardware**.
Flight-specific details of completed approximations remain follow-ups, not missing initial
passes. Do not repeat searches of the same sources without a new lead; continue the separate
Connections and Installation work below.

## Previous Checkpoint: Part 20 Annotation Corrected; Hardware Open (Codex)

October20 Codex: [sources, actual samples, archive and handoff](research/battery-measurement-2026-10-20/README.md).
Replaced intersecting green sphere with an explicitly illustrative battery-temperature target,
not a sensor body or exact sensing point/count. Part20 isolation includes battery context.
NASA/APL2023 controller inputs inspected; real2022 test leads do not identify flight sensors.
TE/Juno/Landsat heritage and DrEAM entry-sensor reuse do not establish battery-sensor adoption.
No invented package/wiring. Claude's battery and part21 unchanged, manifest-verified.
394scoped-tree tests pass;404pass after preserving concurrent minimap updatea7261bb.
Actual Edge desktop/mobile Internal/Thermal, four angles, cover restore/Pilot,
raw pixel/framing checks pass. Archive/tag5220223; release3ff49b5 merged/published as2810746.
Pages39382667705 succeeded. Public actual Edge six Internal/Thermal cases1440/390/360,
stamped module/revision, part20/count20, sources, covers restore/Pilot pass; no page/network
errors or overflow. Live pictures/JSON saved in current research folder. Receipt-only follow-up.
**20/24 (5 Codex / 15 Claude) unchanged.20 stays unchecked; remaining03/09/20/21.**
Need actual flight sensor package/photo/install evidence, not another unrelated thermistor.
No game edits; preserved published work through5220223. Do not restart completed05/22.

## Previous Checkpoint: Part 09 Inspection / Evidence Audit

October19 Codex continuation: [current evidence, comparison, tests and handoff](research/rde-inspection-2026-10-19/README.md).
Both provisional controllers are separately selectable; each retains casing/cover/mount/
interface groups. Exact mesh vertices/materials/installed poses preserved against archived
baseline. AAC current-sensor and APL WBG references added, no hidden boards invented.
Real CAPS photo remains obscured; related-project X-57 is NOT evidence of hardware reuse.
Part09 stays unchecked; **20/24 (5 Codex / 15 Claude)** unchanged. No physics/game edits.
386 full tests pass; real Edge18viewport/layer/selector cases and raw-pixel framing checks
pass, plus cover hide/restore and Pilot return. Archive/tag7ab195e retained. Public release
status: release5d85fd0 pushed and Pages39355386898 succeeded. Public real-Edge checks passed:
stamped module/revision, both selectors at1440/390/360, sources, cover hide/restore across
Thermal and Pilot return; no page/network failures or overflow. Pictures/JSON in current
research `live/`. Remaining03,09,20,21; this verification follow-up changes no app code.

## Previous Checkpoint: Part 05 Approved Initial Pass Complete

**Newest owner reply:** "same as last 2 parts" to the explicit choice between a labeled
outer-structure approximation and waiting for exact photos. Proceeded with the approved
approximation. [Current asset, sources, real/CAD/model samples and handoff](research/ocellus-outer-structure-2026-10-19/README.md).
**20/24 initial passes, 5 Codex / 15 Claude**, not verified flight replicas. #05 checked
with separate flight-specific follow-up. Historical count19/unchecked notes below and in
prior research are superseded; do not restart completed MIMUs or repeat the approval question.
Model/archive51d063d and recovery tag pushed; Pages39322730880 succeeded. Public real-Edge
checks at1440/390/360 passed: stamped module/revision, count20, source links, selectors,
cover hide/restore and Pilot return; no page/network errors. Live JSON/pictures saved in
the current part research folder. Full suite367 pass. This release note changes no geometry.

Ocellus MEB/FEB now have estimated outer structures within unchanged nominal2023 envelopes:
MEB machined frame/stiffeners/lid; FEB base/returns/receiver barrel/angled collimator housing.
All detailed proportions/finish/caps/mounts/installation remain estimates. No hidden boards,
optical train, mirrors, pins or flight harness invented. Current MIMU geometry/shelf and all
unit poses preserved exactly; all new-to-new clearances pass without moving other equipment.
Original05 label anchor/five focuses retained, removable casings/covers/mounts/IMU interfaces.
Archive exact prior code/UI/tests/box pictures and two rejected rib drafts; recovery tag f28fe8b.

11 focused tests pass; 38 viewport/layer/angle captures plus eight raw-pixel/framing checks,
cover hide/restore and Pilot return pass in real Edge. Full suite/publication recorded in
current asset README/change log. Remaining initial passes: 03,09,20,21. Real-photo-first,
cross-project research before approximation, exact archive/source/credit process remains.

## Earlier October 19 Cross-Project Hardware Search

**Newest owner instruction:** search other projects for comparable/reused parts, then
cross-check those against Ocellus. Completed the requested deeper research pass, not a new
model. [Evidence matrix, original sources and comparison](research/ocellus-cross-project-2026-10-19/README.md).
NASA documents GRSSLi/GRLR -> Kodiak lineage, Ocellus development from Kodiak, shared SQRLi
qualification and SpaceCube Mini family use in Ocellus. Real v2.0 Mini board imagery saved,
but exact Ocellus generation/card stack unverified. NASA NEPP2024 p5 names the Ocellus1064nm
seed laser; reported test quantity is NOT installed count. DIAMOND identifies test MiniAVIM
versus mission MicroAVIM interface; real related connector photos/product image saved.
Optotune MR-10-30 is an unverified SQRLi procurement lead, NOT an Ocellus identification;
Mirrorcle's Kodiak architecture citation is NOT supplier adoption. Do not copy either scanner.

**No geometry, physics or game files changed. #05 unchecked, 19/24 unchanged.** Published
MIMUs remain intact. No complete as-built Ocellus housing/board-stack photograph established.
Owner redirected to deeper research; do not treat the old approximation question as a new
waiting gate or infer an answer. Next modeling must preserve original source scale/masks,
archive CURRENT module/tests/UI/renders, and not move rebuilt neighbors to make room.
Current lidar studies remain explicitly nominal 2023 envelopes, not photo-matched units.

## Earlier October 19 Ocellus Evidence Follow-Up

**Newest checkpoint, research only:** original NASA SQRLi 2024 review retrieved and visually
inspected. Real optical/board imagery, complete source slides1/4 and explicitly identified
Ocellus FEB packaging CAD (NASA Optics2023 slide13) saved, plus credited real digitizer-test
photo. SQRLi review links its MEB qualification to sister-project Ocellus, but does NOT
establish identical complete flight boxes; different FEB/FOV must not be copied. Digitizer
is largely occluded. No identified complete Ocellus flight-box photograph found. **No model,
app behavior or physics changed; #05 remains open/count19.** Historical checkpoint: a labeled
approximation question was presented; the owner subsequently requested deeper cross-project
research (newest checkpoint above), not approval of invented internals.
[Evidence, rejected substitutions, implementation boundary and next steps](research/ocellus-evidence-2026-10-19/README.md).
Current MIMU family geometry stays as published; do not restart it. Archive the CURRENT
lidar study before any replacement, not just old blue blocks. Preserve new unrelated game
commits (fast-forwarded clean worktree to81177ed); do not edit that source. Preview4195.

## October 19 Published MIMU Family Subpass

**Release checkpoint:** model/source/archive commit `9e647ba` pushed to main and the
isolated feature branch; recovery tag on cf4c866 pushed. Pages run **39301658664 succeeded**.
Public build9e647ba verified in real Edge at 1440/390/360 px: stamped module, source links,
five selectors, cover hide/restore across Internal/Thermal and Pilot return all pass; no
page/network errors or horizontal overflow. Full local suite **321 pass**; 30 local selector
checks plus eight raw-angle pixel/framing checks pass. Dated live JSON/screenshots saved in
`research/nose-electronics-2026-10-19/`. A documentation-only follow-up records this result;
do not mistake the historical pre-MIMU notes below for current missing work.

**Latest:** after deeper real-photo/reuse research, owner requested continuing part 05.
Honeywell's current June 2026 datasheet and original hardware product image are inspected
and archived; NASA/APL Uranus Appendix C pp.184-185 explicitly associates MIMU with Dragonfly.
Both old IMU cubes are replaced by photo-referenced Honeywell space MIMU FAMILY approximations.
Exact Dragonfly variant/options and installation remain unconfirmed. Full 233.7 mm diameter
x 169.9 mm supplier upper envelope, not exact flight dimensions. No supplier power/mass imported.
Ribbed housing, rounded removable cap, side cover and external connector shells; no invented
pins, internal boards/gyros or flight harness. Independent casings/covers/mounts/interfaces,
four unit focuses plus separately selectable estimated support shelf retain original number 05.

Codex found nominal Ocellus design dimensions in NASA MSS 2023 page 6: MEB
24.19 x 18.54 x 12.04 cm and FEB 23.4 x 23.2 x 12.7 cm. Two dimensioned enclosure
representations replace the two generic lidar boxes; no Ocellus hardware-photo match is
claimed. Native geometry x/y/z maps length/height/depth. Placement, yaw, neutral finish,
walls/covers/feet remain estimates. No hidden optics, electronics or harness invented.
**#05 stays unchecked; count 19/24 unchanged** because Ocellus appearance and exact flight
MIMU configuration/installation are not verified. Current module revision
`nose-electronics-mimu-family-2026-10-19`.

**Fit:** new units clear one another and rebuilt neighbors without moving completed parts
or shrinking sourced envelopes. Old FEB/IMU overlaps now resolved. Both IMUs at x .205,
bottom y -.1, z -1.393/-1.145 with yaw 0/180. Shelf/post arrangement is an explicit installation
study, not flight evidence. Cover removal reveals UNMODELED space, not asserted empty hardware.
Original blocks, central-flat/upright rejected placements, pre-MIMU dimension study and shelf
isolation draft archived with exact code/tests/pictures. [All parameters, real/CAD/process
samples and handoff](research/nose-electronics-2026-10-19/README.md).

Next within #05: SQRLi 2024 review/digitizer leads are now inspected (see newest checkpoint),
but no exact complete Ocellus photo found. Keep shared processors distinct from identical
housings. Seek actual Dragonfly
MIMU flight variant/scale/mount evidence. [Research leads](research/nose-electronics-2026-10-19/PHOTO-AND-REUSE-SEARCH.md).
Real Kodiak is heritage only; supplier exploded MIMU image is CAD, not an interior photo.
#03/#09/#20/#21 also open. No game edits; published game commits preserved by fast-forward to
cf4c866 before this pass. Preview 4195 / isolated worktree below. Prior tool-approval block
cleared; fetch now works. Check current deployment before claiming live status.

## October 19 Nose-Panel Provisional Pass

Codex assessed next unfinished part **03**. Real 2026 flight-structure photos provide
panel finish/joint evidence, but no fully exposed identified nose face or dimensioned
reference was found. The plain block now has a thin face representation, perimeter
returns, mounts and independent inspection groups; all dimensions/details remain [EST].
No hidden honeycomb cells, stack or apertures invented. **#03 stays unchecked; count
19/24 (4 Codex, 15 Claude) is unchanged.** METHAN's exception is not blanket approval.
[Real photos, labeled CAD and model/process samples](research/nose-bulkhead-2026-10-19/README.md).
Next: obtain a nose-specific photo/scale, or assess #05/#09/#20/#21 independently. Do not
restart #22 or touch the separate city/game project. Worktree/preview below still apply.

The owner now requests **real, CGI/CAD and process samples** with each part update.
Keep their types/credits visibly distinct; CGI is layout/dimension support, not a substitute
for real appearance evidence. Include an actual model sample inline in the completion reply.

## October 18 Part-22 Closeout

**Owner approved a labeled METHAN approximation on October 18.** Codex replaced the
remaining placeholder with an explicitly estimated exterior gas-cell enclosure, removable
metal-felt filter cassettes/cover, mounts, fiber feedthrough and short jacketed fiber entry.
The cold-cell / warm-DPU separation follows Lorenz et al., IPM 2025 pp. 184-185. The
diagram is not a hardware photo; casing size, finish, filter count/layout and all installation
details remain [EST]. No hidden mirrors, optical path, warm DPU electronics or visible beam
are invented. The two EFIELD assemblies are unchanged from their photo-referenced subpass.

**Initial asset pass #22 is complete under that explicit approximation approval.** Count:
**19/24 (4 Codex, 15 Claude)**, not nineteen verified flight replicas. Hardware photography,
exact dimensions, real coating/material and internal optics remain follow-ups. Independent
Front/Rear EFIELD and METHAN inspection is included; original part ID 22 is retained.
[Source/model comparison and parameters](research/methan-2026-10-18/README.md).
Old placeholder and prior controls are archived with restore tags; no other part was moved.

Work remains on the isolated `codex/dragonfly-nose-sensors-publish` worktree below, preview
4195. Preserve the shared checkout's unrelated kit files and all already-published game work.
Check the fresh remote and deployment result before describing the current public build.

## October 18 Earlier Checkpoint (Historical)

**Codex local checkpoint, not published:** both EFIELD probes already existed in the
October 17 release; the chat sample showed only the front one. A new Subassembly menu
under component 22 focuses/isolates front EFIELD, rear EFIELD or METHAN individually.
Both probes retain the same geometry and original number 22; the label follows the
selected subassembly. Selection is viewing-only; masks restore after draws/errors.
Tests: 272 pass; real desktop/390/360 px Internal/Thermal and four-angle pixel checks pass.

**METHAN still open.** New APL primary reference: Lorenz et al., IPM 2025, printed
pp. 184-185, original page images saved. Exterior mirrored gas cell with dust filters;
fibers through foam to warm DPU light engine (1.67 micrometer/continuum superluminescent
sources and photodiodes). Do not put a generic laser module, catalytic sensor, visible
beam or fictional electronics outside. No clear METHAN hardware photo found in reviewed
sources; CAPS 2024's depiction is CAD. Owner has been asked whether a labeled approximation
is acceptable if no hardware photo is available. Await that answer before changing appearance.
**Count stays 18/24; #22 is not checked off.**
[Evidence, screenshots and handoff](research/part22-2026-10-18/README.md).

Continue in the isolated `codex/dragonfly-nose-sensors-publish` worktree listed below.
It is now based on published `fb2e5b6`, which includes the other chat's released city lab
and the October 17 simulator update. Do not remove that released work or touch the shared
checkout's untracked city kits. Preview 4195. Current selector changes are local only.

## October 17 Context (Historical)

**Codex: #22 EFIELD subpass.** Two fixed probes now follow Seese et al., IPM 2025,
printed pp. 186-187: actual engineering-model photos (fig. 2), 30 cm carbon-fiber stalks
and 5 cm gold-plated aluminum balls [PUB]. Front upper starboard and rear lower port
near MMRTG locations are published; coordinates, pointing, tube diameter, preamp envelope
and interfaces are [EST]. TEMP/MICRO are co-mounted as photographed, not #20/#21.
METHAN still has no comparable real hardware reference: retain its provisional housing.
**#22 remains unchecked; count stays 18/24 (3 Codex, 15 Claude).** See
[sources, parameters and verification](research/nose-sensors-2026-10-17/README.md).

Work is isolated on `codex/dragonfly-nose-sensors-publish`, based on `eed63b1`, in
`C:/Users/Heemi/.codex/visualizations/2026/09/21/01a0c1fe-26e1-7300-9b26-02e6197228f6/nose-sensors-worktree`.
The shared checkout contains unrelated unpublished city commits and edits. Do not reset it,
include those commits in this release, or overwrite the other session's files. Preview: port 4195.
Inspect both checkouts and fresh remote state before choosing where to continue.

**Next:** find real METHAN hardware images and a scale reference; CAPS 2024 slide 42's
CAD is not a hardware photograph. Preserve EFIELD and part ID 22. Keep published probe
dimensions fixed when adjusting estimated mounting coordinates. Independent casing/cover/
mount/interface/harness tags exist. Label 22 is anchored to the front preamp, not the empty
midpoint between the two assemblies. No electric-field solver or instrument telemetry was added.

## October 16 Context (Historical)

**Current closeout:** Claude's #16 aft bulkhead is complete as an approximate photo-referenced
asset. Codex preserved the geometry, confirmed NASA/APL's explicit inverted-fixture caption,
corrected the clearance-test false positive, archived the previous model and completed source,
app and release records. Completed count: **18 of 24** (3 Codex, 15 Claude); #09 stays provisional.

Codex has now finished the previously queued **Inspection layers** controls:
body/attic shells, separately modeled foam, compartment panels, flow markers, and per-component
casings/covers/mounts/interfaces/harnesses. Restore Layers preserves the camera; camera reset
restores all masks. Hidden component settings are marked in the component menu. Internal and
Thermal share masks; Pilot, Exterior and the original model keep their ordinary presentation.
No new material stack or hidden hardware has been invented. See
[verification and limitations](research/inspection-visibility-2026-10-16/README.md).

**Keep #16 together:** `aft-bulkhead.mjs` is imported by `vehicle-research.mjs` and
`thermal-loop.mjs`. Interface center [0,-0.1,1.106] m; tilt 25 degrees; width 0.7 m;
thickness 0.012 m, all [EST]. Fans now sit at z 1.04 m (formerly 1.16); their collar clears
the panel by 2 mm. The low-gain antenna moved 9 cm forward. Body aft foam, generator pose,
MMRTG sensor and illustrative airflow follow the tilted interface. Physics constants remain
unchanged. Coating, exact flight tilt/configuration and the real air passage remain unknown.
Source and verification notes:
[aft-bulkhead](research/aft-bulkhead-2026-10-15/README.md).

Another session is also updating Swarmfall independently. Preserve its files and any new commits when
staging simulator work. Keep unrelated pending game/city changes out of this release commit.
Verification on October 16: **248 Node tests pass**, plus desktop/390/360 px real WebGL checks.
Release includes this closeout, the inspection controls and their three archive tags. For
subsequent handoffs, compare current GitHub Pages success/build with `origin/main` rather than
assuming that matching local files or this historical test count proves the current live build.

## October 15 Context (Historical)

**Update (Claude, October 15, after this snapshot):** the owner asked Claude to look at Codex's
work and continue. Claude finished #15 (all items below ticked) and reviewed Codex's #09 pass
(review notes under the #09 follow-up). Both are committed together and published; see
CHANGELOG. Completed count: **17 of 24** (3 Codex, 14 Claude). Tests: 207 pass. Since Codex's
snapshot the battery look was also reworked to follow the real test photos (owner's real-photo
rule), and its center moved to z 0.565 (see the parameters below). Codex's snapshot follows as
written.

**Later owner direction:** skip #15 battery for now; preserve it without finishing or publishing
it. Codex proceeded with #09 research and a provisional enclosure illustration, not a completed
photo-referenced rebuild. [RDE status and sources](research/rde-2026-10-15/README.md).
The 16-part completed count is unchanged. The battery completion tasks below remain deferred.
After the RDE illustration: 207 Node tests pass; desktop/360 px and four-angle Internal/Thermal
WebGL checks pass. Old blocks and the clearance-fix draft are archived with pictures; local
tag `archive/rde-2026-10-15` points to `b2ac24a`. No commit/push of this mixed working tree.

This snapshot supersedes the older handoff status, not the research qualifications below.

- **Committed baseline:** `b2ac24a`, antenna surface filtering/roughness/bump refinement.
  Local `master` and freshly fetched `origin/main` match. The improvement branch and the
  locally recorded `sites/main` have no commits ahead of `origin/main`. GitHub Pages deployment
  was not rechecked in this documentation pass; matching Git commits alone is not a live-site check.
- **Completed checklist:** 16 of 24 initial part passes: 01, 02, 04, 06, 07, 08, 10, 11,
  12, 13, 14, 17, 18, 19, 23, 24. Three are credited to Codex and thirteen to Claude.
  Completion does not certify exact flight dimensions or close the listed follow-ups.
- **Current work is #15, not a fresh start.** Claude's battery model, tests, research and
  archive folders are on disk but uncommitted. `dist/vehicle-research.mjs` already imports
  `dist/battery.mjs`; `dist/thermal-loop.mjs` contains the companion duct adjustment.
  Do not discard these changes, recreate the part, or publish only the two tracked files:
  the new module must accompany its import.
- **Checks:** Codex reran `node --test tests/*.test.mjs` on October 15: **203 passed, 0 failed**,
  including the five battery tests. Claude reports rendered Internal/Thermal views and saved
  comparison images; Codex has not independently repeated that browser inspection this pass.
- **Release gap:** the app still describes the battery as a placeholder and counts 16 parts.
  Passing tests do not prove those descriptions match the new, uncommitted geometry.
  Keep #15 unchecked until the completion tasks below are done.

### Finish the Interrupted Battery Pass

- [x] **Claude:** Create `dist/battery.mjs` and integrate it in the research model; add
  `tests/battery.test.mjs`. Preserve the existing 11.5 kWh simulation, rather than replacing it
  with the inferred cells' 11.9 kWh nameplate sum.
- [x] **Claude:** Save [battery research and limitations](research/battery-2026-10-15/README.md),
  source pages in `research/sources/ices2022-256-battery-module/` and
  `research/sources/gs-yuasa-lse-gen3/`, and comparison/render images.
- [x] **Claude:** Create [battery archive](archive/battery-2026-10-15/README.md) and
  [previous duct-position archive](archive/warm-duct-v1-2026-10-15/README.md).
  Folder existence is not completion of the archive index/tag steps.
- [x] **Codex:** Confirm the current working tree passes all 203 tests (October 15).
- [x] **Claude:** Recheck the source distinction before release: the LSE134 cell identification is inferred,
  and the nine-cell test module's fan counts/layout are not proof of the 24-cell flight pack's
  layout. Show those limits in the app as well as the research note. PCM location is unknown;
  do not invent a wax compartment. Do not infer exact flight hardware from test equipment.
  (Done: the panel text, Vehicle part assumptions and research note say all four. The look now
  follows the test module's real photos, figs. 10, 11, 13, not its CAD figure.)
- [x] **Claude:** Update `dist/ui/layers-panel.mjs` battery description and sources; update
  `dist/index.html` Model assumptions, Vehicle part references and Vehicle part assumptions.
  Only on completion change the total to 17 of 24 (3 Codex, 14 Claude), remove battery from
  the placeholder list, and check off #15 here in the same change.
- [x] **Claude:** Add battery/source rows to `research/PART-SOURCES.md`, both archive rows to
  `archive/README.md`, the module to `ARCHITECTURE.md`, and the status to
  `RESEARCH-COMPENDIUM.md`; review README wording and sign the battery CHANGELOG entry as Claude's
  implementation, crediting any subsequent finisher separately.
- [x] **Claude:** Verify archive contents and restore steps; create the two missing archive tags on the
  pre-replacement commit `b2ac24a` after confirming it is the recorded original. No October 15
  archive tags were present when Codex checked. (`b2ac24a` is the last commit with the old
  battery box and duct height; both tags created and pushed with Codex's `archive/rde-2026-10-15`.)
- [x] **Claude:** Inspect installed and isolated battery at multiple angles in Internal/Thermal, desktop
  and 360/390 px widths, with real WebGL screenshots/pixel checks. Check lid visibility,
  framing, console errors and new-to-new clearance; retain #20 sensor overlap as its follow-up.
  (Done at 1280 and 390 px; a flange-to-TWTA-cable contact found by the clearance test was fixed
  by moving the battery 1 cm aft.)
- [x] **Claude:** Rerun all tests after text/checklist edits, check the diff, commit the complete battery
  change, push with its archive tags, and verify Pages success and the live build stamp.
  This documentation-only context update does not publish or complete the battery pass.

**Parameters to preserve while resuming (model meters, +Y up, nose toward -Z):**
`batteryAsset` revision `battery-2026-10-15`; center is **[x,z] = [0,0.565]** (was 0.555 when
Codex wrote this), not XYZ; enclosure width 0.62, depth 0.40, bottom Y -0.27, flange (split)
Y 0.006, top Y 0.064 (was 0.04 before the real-photo rework); floor Y -0.284.
The 4-by-6 arrangement, enclosure and installed placement are estimates. The warm duct's
center Y changed from -0.305 to -0.3125 (7.5 mm lower), revision `thermal-loop-2026-10-15`.
Read the exported asset constants rather than duplicating them. Keep tube-clearance tests
in world coordinates; don't use a whole cable-inclusive box to judge enclosure placement.

## Current Milestone

- [x] **Codex:** Implement the compact, expandable surface operations queue.
- [x] **Codex:** Review the owner's video `1000046285.mp4` (33.88 s), including frames near 4, 17 and 29 s.
- [x] **Codex:** Identify a concrete label-layout cause in the code (below).
- [x] **Claude:** Correct label anchoring/overlap (October 15); far-side occlusion remains open.
- [x] **Codex:** Rebuild the first part: DrACO sample carousel (#6), using public integration photos; estimated scale explicitly labeled.
- [x] **Codex:** Rebuild the second part: Wonderwall interface (#7); contour, openings and independently grouped faces/core/mounts, all detail dimensions estimated.
- [x] **Codex:** Rebuild #8 DraMS at enclosure level; separate cases/covers, mounting frame and a simplified aligned interface. Detailed internals remain open.
- [x] **Claude:** Rebuild #13 Frontier radio from APL's photo and published slice size (October 13).
- [x] **Claude:** Rebuild #12 IEM from NASA/APL's integration photos (October 13).
- [x] **Claude:** Rebuild #11 power switching units from NASA/APL's testing photo (October 13).
- [x] **Claude:** Rebuild #23 lower DragonCam cameras from the 2026 DragonCam paper (October 13).
- [x] **Claude:** Rebuild #04 nose cameras from the same paper (October 13).
- [x] **Claude:** Rebuild #01 DrACO drills from LPSC 2022 fig. 2 (October 13).
- [x] **Claude:** Rebuild #02 sample lines and #24 blowers from DrACO fig. 1 (October 14).
- [x] **Claude:** Rebuild #17 fans, #18 warm duct and #19 trim device from TFAWS 2023/2024 (October 14).
- [x] **Claude:** Rebuild #14 TWTA after published flight TWTAs (LRO, MRO, Stellant) and the Dragonfly thermal papers (October 14).
- [x] **Claude:** Rebuild #10 HGA gimbal (actuators, motorized arm, locks) from ICES-2023/2020 and APL's arm photo; the dish now rises on the arm (October 14).
- [x] **Claude:** Rebuild #15 battery: 24 cells, fins, heat pipes, fans; look from real photos of APL's test module (October 15).
- [x] **Claude:** Rebuild #16 aft bulkhead, canted generator interface and matching fan/duct placement
  (October 15); **Codex:** source verification, corrected clearance test, archives and release
  closeout (October 16). Exact dimensions and 25-degree angle remain estimates.
- [ ] Continue the remaining parts individually; no unverified internals presented as CAD.

## The Process (one part per pass)

Written down October 13, 2026 from how parts 06, 07 and 08 were rebuilt (Codex) so any
assistant can continue the same way. Every step happens in the same change as the part.

1. **Start of session only:** read the README, the newest `CHANGELOG.md` entries and this file;
   `git fetch origin`, `git branch -r`, `git log --oneline main..origin/<branch>` for each
   branch (house rule 7). Once per session, not before every request.
2. **Pick the part.** Next in order is the part with the clearest public reference
   (photograph, labeled figure or published dimension). Skip parts whose only source is a
   vague diagram until one turns up. Work on one part at a time; finish, verify and publish it
   before starting the next.
3. **Capture the detail; research and credit; save everything used.**
   **Owner clarification, October 15:** prioritize real hardware photos and documented physical
   examples for appearance. Use CGI/CAD primarily for dimensions/placement where real examples
   are unavailable; only fall back to CGI appearance when necessary, and state that limitation.
   Keep test fixtures separate from flight hardware. An illustrative draft is not a checked-off
   reference-based asset. The goal is to capture
   what the sources really show and replicate it, so each part looks as distinct (or as alike)
   as the real hardware. Gather every view of the part and of the parts it is made of. How to
   capture and draw it is chosen per part; there are several ways. Examples that worked for
   the IEM and PSUs: full-resolution originals (NASA's image server often has 4-7k pixel
   versions behind the page copy), standard parts such as connectors used as rulers and drawn
   at their published sizes, and tracing details then checking the trace over the photo.
   Save every photo, paper figure and patent
   drawing the part is built from in the project: photos in `research/<part>-<date>/`, paper
   pages and patent sheets as images in `research/sources/<source>/` (shared between parts),
   each with a README giving citation, link, credit and what it constrains. Add the part's row
   to `research/PART-SOURCES.md`. Search patents too (Google Patents): they can help with
   design choices. Tag every number [PUB] (published), [CALC] (derived) or [EST] (estimated).
   Never use image generation. Link the PDFs as sources and save the pages used as images.
4. **Archive before replacing (house rule 6).** `archive/<part>-<date>/` holds exact copies
   of every file the change replaces, angle-matched screenshots of the old part (Internal and
   Thermal, several orbit angles, desktop and phone UI), and a README with restore steps.
   Tag `archive/<part>-<date>` on the last commit with the old part; add a row to
   `archive/README.md`. Drafts fixed before publishing go in a subfolder with pictures, no tag.
5. **Build it as its own module.** `dist/<part>.mjs` exports a frozen `<part>Asset`
   (revision such as `frontier-radio-2026-10-13`, key bounds, anchors, interface points) and
   `build<Part>({ parent, mesh })`. Set `parent.userData.assetRevision` and
   `dimensionConfidence`. Put meshes in named sub-groups tagged `userData.inspectionLayer`
   from the shared vocabulary: `mounts`, `equipment-casings`, `equipment-covers`,
   `interfaces`, `harnesses`, `insulation`, `interface-faces`. These are what the future
   shell/foam/casing hide/show controls toggle, so hidden layers never move parts.
   Local imports keep `?v=dev`. Register it in `dist/vehicle-research.mjs` with
   `interiorPart(id, thermalZone, label, source, color)` and keep the durable ID.
6. **Fit rules (owner, October 12).** Model frame: x across (cavity about +/-0.36 m), y up
   (bay floor about -0.29, cavity to +0.07, attic to +0.5), z along the body (nose negative,
   nose bulkhead -1.56, aft bulkhead +1.08). Stay inside the structural envelope. Check
   clearance only against the already-rebuilt set; never shrink or move a correct part to dodge
   an old placeholder. Record legacy overlaps as follow-ups for that neighbor's own pass.
   **True scale and placement (owner, October 13):** where possible, where a part sits and how
   big it is come from sources too, not only its shape, so that every part fits together like
   the real vehicle. Use layout sources (cutaway and CAD figures, installation photos, test-article
   sections, published dimensions) to place each part. Where no source gives the position,
   mark it [EST] in the code and app text, list it in the placement table below, and revisit it
   when a layout source turns up.
7. **Honesty in the app.** Update the part's text in `dist/ui/layers-panel.mjs`
   (`componentInfo`, `sources`) to say what is published and what is estimated. Never draw
   invented hidden internals; enclosure-level is fine when that is all the sources show.
8. **Inspector.** Check `inspectionGroups()` in `dist/vehicle-inspector.mjs`: isolating the
   part must show it unobstructed; turning isolation off restores the installed context.
9. **Tests.** `tests/<part>.test.mjs`: groups and inspection layers exist, hiding a layer does
   not move the assembly, bounds stay in the envelope, no overlap with the rebuilt set,
   anchors sit on the new geometry, revision/confidence are set. Then run all tests:
   `node --test tests/*.test.mjs`.
10. **Look at it.** Mission -> Internal and Thermal -> pick the part -> Isolate, at several
    orbit angles, desktop and phone width (360-390 px). No console errors, nothing clipped.
11. **Write it up.** In the app, keep **Model assumptions** (the summary: which parts are
    redrawn, what is still a placeholder, the "N of 24" count), **Engineering references >
    Vehicle part references** (sources) and **Vehicle part assumptions** (the full list: one
    entry per redrawn part, "Published: ... Estimated: ...", credited Codex or Claude) current,
    and the footer's part-sources link working (`dist/index.html`).
    `tests/part-assumptions.test.mjs` checks the list and counts against this checklist. Signed `CHANGELOG.md` entry; research README; `RESEARCH-COMPENDIUM.md`
    note; `ARCHITECTURE.md` file-table row for the new module; README if user-visible text
    changed; tick the box below with links to the research notes and what remains estimated.
12. **Publish.** Commit with the assistant's co-author trailer, `git push origin master:main`
    plus the archive tag, then confirm the GitHub Pages run and the live build stamp.

## Placement Status of Rebuilt Parts

Size and position basis for each rebuilt part (October 13, 2026). [PUB] published, [EST]
estimated. Parts with an estimated position need a layout pass against the sources below.

| Part | Size | Position |
|---|---|---|
| 06 Sample carousel | [EST] 0.36 m drum from SciTech 2024 fig. 2 proportions | [EST] attic, from SciTech 2024 figs. 1-2 schematic |
| 07 Wonderwall | [EST] | [EST] attic, from SciTech 2024 figs. 2 and 11 |
| 08 DraMS | [EST] | [EST] keyed to the Wonderwall opening |
| 13 Frontier radio | [PUB] 4 x 6 in slices; width [EST] from the photo | [EST] the old placeholder's spot on the starboard floor |
| 22 EFIELD / METHAN | [PUB] two 0.30 m carbon stalks / 0.05 m balls; METHAN architecture. [EST] 0.062 x 0.100 x 0.105 m chamfered cell, 0.006 m frame edge, two filtered covers | METHAN center (0.505,-0.100,-1.670) m, skin x=0.435 m [EST]. EFIELD regions published, exact pose estimated. Owner-approved METHAN approximation; see October 18 closeout. |
| 12 IEM | [EST] from standard Micro-D sizes in the photos | [EST] port wall; photo shows it on a wall panel beside a PSU |
| 11 PSUs | [EST] from standard D-sub sizes in the photo | PSU 1 beside the IEM as photographed (absolute position [EST]); PSU 2 [EST] |
| 23 Lower cameras | Microscopic Camera [PUB] 105 x 155 x 90 mm; ECAM-P50 heads [EST] | Microscopic Camera [PUB] 986 mm at 52 degrees from the port drill site; Down Cameras [EST] mid-body per DragonCam figs. 2-3 |
| 04 Nose cameras | [PUB] camera types; heads as part 23 | [EST] from DragonCam figs. 2-3 (camera panel at z -1.665) |
| 10 HGA gimbal | [EST] arm 0.6 m measured on ICES-2023 fig. 1 against the 87.4 cm dish [PUB]; actuators sized from fig. 3 | [PUB] forward of the stowed dish, under foam, internal portion under the deck; [EST] hinge at z -0.55 |
| 15 Battery | [PUB] 24 cells; [EST] GS Yuasa LSE134 cells (130 x 50 x 271 mm, inferred), 4 x 6 layout, 0.62 x 0.40 x 0.33 m enclosure | [EST] center z 0.565 inside the TFAWS 2023 plan-view block (z 0.34-0.77), on pads over the warm duct |
| 14 TWTA | [EST] scaled from published LRO, MRO and Stellant units | [PUB] underside of the top deck; [EST] starboard, above the radio |
| 01 Drills | [EST] proportioned from LPSC fig. 2, about 0.7 m tall per DragonCam fig. 3 | [EST] 0.43 m forward of center, within the sources' 0.34-0.45 m (NASA print model, DragonCam fig. 3, APL cutaway) |

Layout sources to use for the placement pass: DragonCam paper fig. 2 (lander CAD with internal
boxes), DrACO LPSC 2022 fig. 1, SciTech 2024 fig. 1, ICES-2020-160 fig. 4, ICES-2023-389
figs. 3-4, TFAWS 2024 slide 7 (full-scale test article section with component mock-up boxes),
APL's rotating CAD video, NASA/APL integration photos.

## Handoff Notes (for Claude and other assistants)

- **Current state:** use the October 15 snapshot and battery completion checklist above.
  The earlier October 13 baseline of six rebuilt parts / 164 tests is historical, not current.
- **Rebuilt-set assets to test against:** `carouselAsset` (`dist/sample-carousel.mjs`),
  `wonderwallAsset` (`dist/wonderwall.mjs`), `dramsAsset` (`dist/drams-assembly.mjs`),
  `frontierRadioAsset` (`dist/frontier-radio.mjs`), `iemAsset` (`dist/iem.mjs`),
  `powerUnitsAsset` (`dist/power-units.mjs`), `sideCamerasAsset` (`dist/side-cameras.mjs`),
  `noseCamerasAsset` (`dist/nose-cameras.mjs`), `drillAsset` (`dist/drills.mjs`),
  `dracoPlumbingAsset` (`dist/draco-plumbing.mjs`), `thermalLoopAsset` (`dist/thermal-loop.mjs`), `twtaAsset` (`dist/twta.mjs`), `hgaAsset` (`dist/hga-gimbal.mjs`), `batteryAsset` (`dist/battery.mjs`), `rdeAsset` (`dist/rotor-drive-electronics.mjs`, provisional). Add each
  new part to this list and to the clearance tests of the parts it neighbors. Tests that
  compare whole-part boxes are too coarse for parts with long cables (the TWTA's coax reaches
  the radio); check those piece by piece, with tubes sampled along their paths in world
  coordinates (`tests/twta.test.mjs`).
- **Suggested order next (owner update October 15):** #15 is now done (Claude); seek clearer #09 hardware
  references after the provisional enclosure pass, then #05 nose electronics, #03 and #16
  bulkheads (NASA/APL top-deck fit-check photo), #20-#22 sensors. Recheck references each time;
  reorder if a clearer source turns up. (Taken off this line October 14 because they are done:
  #02, #24, #17, #18, #19, #14 and #10.)
- **Viewing locally:** Codex used Playwright scripts outside the repo; Claude uses the desktop
  app's browser pane with a no-cache static server for `dist/`. Debug hooks on localhost:
  `window.dragonflyState`, `window.dragonflyRenderer`, `window.dragonflyTick(now)`.
- **Checklist attribution (owner, October 13):** mark every checked item with who did it,
  **Codex** or **Claude**, as it is checked.
- **Sources (owner, October 14):** published papers, figures and photos are the drawing sources;
  APL's CAD movie and cutaway are a cross-reference where nothing else shows a detail.
- **Overlaps:** fix overlaps between rebuilt parts by correcting the layout; overlaps with parts
  not yet redrawn are only noted in that part's follow-up and fixed when it is redrawn.
- **Owner preferences that apply here:** realism is the goal, but keep it easy to operate;
  keep the light visible; never throw work away; archive pictures with every replacement; sign
  every change. The owner often checks on a phone, so always check phone width.
- **Still open across all parts:** far-side label occlusion, source-backed construction layers,
  and the remaining estimated dimensions/placements. Independent visibility controls are now
  implemented locally; they operate on existing geometry only.
- **Handoff safety:** inspect `git status` before editing and preserve other assistants' work.
  Use `apply_patch` for manual edits. Do not reset the tree or silently merge unrelated work.
  Keep durable part IDs, the shared sampling clock, simulation behavior and saved-state
  contracts unchanged during asset passes. Keep long text expandable, normal page scrolling
  and browser Ctrl zoom intact. Never use or suggest an image-generation service.

## Numbered Callouts (Fixed October 15, Claude)

The video shows labels forming a vertical chain and changing apparent attachment while
the model rotates. `dist/ui/flight-view.mjs`, `drawPartMarkers()`, resolves collisions by
adding 14 pixels to **screen-space Y**, up to 12 times. It does not draw a leader back to
the original projected anchor. This is a confirmed layout defect, not evidence that the
vehicle's world-space Y axis is wrong. Inspect projection/visibility as well before deciding
that this is the only cause.

`dist/chase-vehicle.mjs` currently projects each group's world bounding-box center. A group
containing two separated parts can therefore have an anchor in empty space between them.
Markers are a 2D overlay; their current visibility check is not a surface-occlusion test.

**Done October 15 at the owner's request ('fix that aggressive part number jumping').** Each
number sits on a fixed anchor on its part's own hardware (`dist/chase-vehicle.mjs`,
`labelAnchor`); `dist/ui/part-label-layout.mjs` moves a crowded number to the nearest free spot
with a leader, keeps it while free and eases there. Over a full turn, jumps over 12 px fell from
263 to 12 (worst 150 px to 19 px). Old code and pictures: `archive/part-labels-2026-10-15`.

- [x] **Claude:** Preserve a stable part ID and number across rotation, zoom, filtering and layer changes.
- [x] **Claude:** Give each assembly a deliberate local 3D anchor; validate mirrored/multi-part groups. (The part's middle if it lies on a mesh, else its largest mesh; computed once in the craft frame.)
- [x] **Claude:** Keep projected anchor coordinates separate from the displayed label position.
- [x] **Claude:** Resolve dense labels in both screen axes, with short leader lines when displaced.
- [x] **Claude:** Keep labels within the viewport and out of telemetry, titles and inspector controls. (Viewport and the ALT/ROLL readouts; the inspector controls are outside the canvas.)
- [ ] Define visible/hidden-part behavior: hide, ghost or expose on selection rather than
  presenting every rear-side component as if it were on the front surface. (Still open: numbers
  for parts on the far side are drawn like the rest; nearer parts win crowded spots.)
- [x] **Claude:** Exclude non-drawn markers from collision placement; keep selection and click targets aligned.
- [x] **Claude:** Test full orbit, elevation changes, close-ups, isolate/reset, both models, Internal
  and Thermal, and desktop/360/390 px layouts. No screen-axis label chains or detached IDs.
  (Full orbits measured in Internal, Thermal from above, close and low, and at 390 px;
  `tests/part-label-layout.test.mjs`. The original demo model uses the same code path.)
- [x] **Claude:** Archive previous label code and angle-matched screenshots before replacement.

## Part-by-Part Asset Checklist

Numbers below match the current research-model registration order, not official NASA part
numbers. IDs are the durable keys. A checked box means this reference-based geometry pass,
structural fit, stable inspection identity, archive and regression checks are complete;
it does not mean exact flight dimensions are certified or the global callout defect is fixed.
Some numbered groups are exterior-adjacent but share this inspection list.

**Owner update, October 12:** archive and replace one clearly referenced part at a time.
Do not shrink/move an updated part to avoid older placeholder assets. Check collisions
between the rebuilt parts only as that set grows, while always checking the vehicle's
structural envelope. Track unresolved legacy interfaces for their own makeover.
Current rebuilt set: `sample-carousel` (`carousel-2026-10-12`) and `wonderwall`
(`wonderwall-2026-10-12`) and `drams` (`drams-2026-10-12`) and `frontier-radio`
(`frontier-radio-2026-10-13`) and `iem` (`iem-2026-10-13`) and `power-units`
(`power-units-2026-10-13`) and `side-cameras` (`side-cameras-2026-10-13`) and `nose-cameras-inside`
(`nose-cameras-2026-10-13`) and `drills` (`drills-2026-10-13`) and `sample-lines`/`drill-blower` (`draco-plumbing-2026-10-14`) and `fan`/`underfloor-duct`/`trim-chimneys`
(`thermal-loop-2026-10-14`), `twta` (`twta-2026-10-14b`) and `hga-actuators`
(`hga-gimbal-2026-10-14`). The working tree additionally contains the unfinished battery pass and
thermal-loop revision `thermal-loop-2026-10-15`; see the snapshot above. Installed bounds and clearance are tested together; the
DraMS neck intentionally passes through the wall aperture.

- [x] **Claude:** **01 DrACO drills** (`drills`): gold head with percussion and rotation actuators and the percussion spring, red Z-stage rail with motor, lead screw and lower bracket, swivel with pneumatic port, hollow bit with side opening and slotted crown; the carriage slides while drilling and only the bit turns; a full stroke drills 5.8 cm (6 cm published limit). [References/limits](research/drills-2026-10-13/README.md).
- [ ] **01 follow-up:** real part sizes; exact fore-aft position (sources span 0.34-0.45 m forward of center; model 0.43 m). The #02 pass now connects to the moving swivel port; preserve that connection through the full drill stroke.
- [x] **Claude:** **02 Sample-transfer lines** (`sample-lines`): flexible hose from each drill's port (follows the drill down), rigid tubes forward under the body edges and up into the attic, flow-diverter manifold on the carousel inlet, return tube down the port side to the blowers; topology from DrACO fig. 1, routes and the 13 mm size [EST]. [References/limits](research/draco-plumbing-2026-10-14/README.md).
- [ ] **02 follow-up:** real tube sizes and routes; separate LDMS and GCMS elevators at the carousel (the carousel models one inlet).
- [x] **Codex:** **03 Nose bulkhead** (`nose-bulkhead`): Codex's October 19 provisional thin-panel/perimeter/mount pass, not photo-matched; owner-approved design approximation October 21 (closeout by Claude): bay-side pocketed edge frame, bolted stiffener, rib, edge fasteners and tape tabs in the flight structure's photographed style. [Evidence/model/process comparison](research/nose-bulkhead-2026-10-19/README.md); [approximation notes](research/nose-bulkhead-2026-10-21/README.md).
- [ ] **03 follow-up:** a photo of the actual nose bulkhead; its face profile, thickness, apertures (camera and harness pass-throughs), layup and attachment. Do not invent a hidden core.
- [x] **Claude:** **04 Nose cameras** (`nose-cameras-inside`): Forward MAC (hooded lens), Forward WAC, two Side Cameras and two NavCams (yellow top plates) on a camera panel behind the nose cap, each behind a window; same ECAM body throughout, differences from DragonCam fig. 1; positions from figs. 2-3. [References/limits](research/nose-cameras-2026-10-13/README.md).
- [ ] **04 follow-up:** pointing angles and which low unit is the WAC or the NavCams; the fuller 2026 chin (the low cameras stand out of the older nose shell, noted for the fuselage nose redraw).
- [x] **Codex:** **05 IMU/lidar electronics, FEB/MEB** (`nose-electronics`): owner-approved Ocellus outer-structure approximation within historical 2023 envelopes; estimated machined MEB frame/stiffeners/lid, FEB base/returns/receiver barrel/angled collimator housing. Real related hardware informs construction, identified CAD arrangement/scale only. Not photo-matched flight units. Existing two MIMU family models/poses preserved. Independent casings/covers/mounts/interfaces, four units plus shelf focus, original05 anchor; no hidden boards, detailed optics or harness. [Current sources, model samples and limits](research/ocellus-outer-structure-2026-10-19/README.md).
- [ ] **05 follow-up:** exact flight MIMU variant/mounts, Ocellus as-built housing/coating/dimensions, processor generation and board stack, real optical train and installed fiber/electrical interfaces. Family/evaluation hardware is not proof of flight configuration. Initial pass counted as an approved approximation only.
- [x] **Codex:** **06 Cold sample-delivery carousel** (`sample-carousel`): enclosed drum, cooling fins, ports and underside drives; stationary housing, internal indexing cue. [References/limits](research/carousel-2026-10-12/README.md). No exposed invented cup inventory; 0.36 m diameter and placement remain estimates.
- [ ] **06 dimensional follow-up:** replace proportional scale with an authoritative dimension/CAD if available; #02/#07/#08 now have approximate integrated interfaces, but real sealed transfer paths remain unverified. Existing legacy overlap is not corrected by shrinking #06.
- [x] **Codex:** **07 Wonderwall thermal barrier** (`wonderwall`): contoured reference-based warm/cold partition, interface openings and separate face/core/mount groups. [References and limits](research/wonderwall-2026-10-12.md). Not a verified flight material stack.
- [ ] **07 dimensional/interface follow-up:** authoritative wall thickness, material stack and real sealed instrument penetrations. The #08 neck now aligns with the modeled opening; that is not confirmation of the real seal design. Published ~5 cm instrument separation is not wall thickness.
- [x] **Codex:** **08 DraMS assembly** (`drams`): first enclosure-level pass, with separate covers/casings/frame and simplified connection through #07. [References/limits](research/drams-2026-10-12/README.md). Dimensions and details remain estimated.
- [x] **Claude:** **07/08 visible detail, Wonderwall half (October 20):** khaki facesheets, machined pocketed frame around the port, spoked port fitting, Kapton covers and edge clips from the SVS 15003 photos; Codex's panel kept underneath. The photo puts the port lower (about 40% up the panel vs 61% drawn); left for the 07/08 interface follow-up since DraMS is keyed to it. [Notes](research/wonderwall-detail-2026-10-20/README.md).
- [x] **Claude:** **07/08 visible detail, DraMS half (October 20):** insulation blanket over the analyzer, three valve bodies with lines into the GC enclosure, a brass cylinder and a wire bundle from the SVS 15003 photo; the photo's test cables and connector table left out as ground equipment. [Notes](research/drams-detail-2026-10-20/README.md).
- [x] **07/08 visible-detail pass (owner, October 20: "something may be missing from the apparatus"; compared by Claude against the saved NASA/Mike Guinto photos):** the real Wonderwall has a machined, pocketed gray frame over its upper part, a bolted circular interface fitting with a cross of spokes, orange Kapton covers around it and mounting tabs along its edges; the model is a plain panel with a round hole. The real DraMS is an open assembly (no outer walls, as in the model) but dense with visible hardware: foil-wrapped harness bundles, tubes, valves, small cylinders and wiring on a gold-toned frame; the model has an open frame with one cylinder and two boxes. Draw what the photos show on the outside; keep hidden internals out (see the 08 follow-up below). **Both halves done (above).**
- [ ] **08 detailed follow-up:** independently source ITMS electrodes, UV laser/LDMS interface, GC hardware, carousel-side pyrolysis oven, fan and actual seals/transfer paths. Do not invent hidden internals or treat the current casings as flight CAD.
- [x] **Codex:** **09 Rotorcraft drive electronics** (`rde`): Codex provisional enclosure pass October 15;
  two hollow cases, separate lids/mounts, illustrative internal fans and real vent openings.
  Owner-approved design approximation October 21 (closeout by Claude): black finned heat-sink tops, slice seams and
  mated plugs with backshells and leads to the main harness, in the style of APL's photographed avionics.
  [Sources/limits](research/rde-2026-10-15/README.md); [approximation notes](research/rde-2026-10-21/README.md).
- [ ] **09 follow-up (Claude's review, October 15):** sources and labels check out; APL's gallery and
  NASA's pages still have no RDE photo. ICES-2023 fig. 4 places the two hot RDE boxes just aft of
  the attic, as drawn, but they appear side by side on one side of the bay rather than split across
  the centerline; settle the arrangement with the next reference. The HGA gimbal's under-deck drive
  sits about 3.5 cm above the port box. Vent guards, fan count and finish remain invented.
- [x] **Claude:** **10 HGA azimuth/elevation actuators** (`hga-actuators`, durable id kept; the whole gimbal): internal portion under the deck (azimuth bearing, drive, rotary joint) and, above it under a 5 cm Rohacell dome, a stacked turntable and a gold elevation drum, just aft of the attic and forward of the stowed dish [PUB, ICES-2023 p. 2, figs. 1, 3; ICES-2020 p. 5]; the motorized arm, gray truss pedestal, thermal isolator and flexible feed from APL's July 2026 photo; launch lock under the dish's aft rim and a flight lock either side [PUB positions, shapes EST]; the dish now rises on the arm and points at Earth (azimuth limited to keep it out of the attic [EST]); orange slotted dish face from NASA's chamber photo; TWTA waveguide rerouted to the rotary joint. Arm 0.6 m and hinge at z -0.55 measured on ICES-2023 fig. 1 [EST]. [References/limits](research/hga-actuators-2026-10-14/README.md).
- [ ] **10 follow-up:** the flight pedestal is taller than drawn (APL photo); real actuator sizes and the azimuth/elevation ranges; what the tall gold-and-orange tower beside the dish in APL's photo is; the RF chain through the gimbal (rotary joints or cable wrap); the medium-gain antenna.
- [x] **Claude:** **11 Power switching units** (`power-units`): two units [PUB]; face mapped connector by connector from the full-resolution testing photo and checked by overlay (eight slices, two ribs, seven 25-way D-subs, small cluster, uncapped port, empty upper right); size from standard D-sub sizes, about 20 x 24 x 19 cm [EST]; PSU 1 beside the IEM on its wall as photographed. [References/limits](research/power-units-2026-10-13/README.md). Corrected October 13 (first version archived).
- [ ] **11 follow-up:** a photo of the second PSU (drawn the same) and of the flight units' real wall positions; separate PSU currents if the power model ever splits them.
- [x] **Claude:** **12 Integrated electronics module** (`iem`): from the full-resolution photos: black heat-sink top with fins parallel to the face and fastener rows, copper ground strap, bolted face plate with two rows of connector windows over eight columns, mated and labeled Micro-Ds, yellow tape; back to a wall panel beside PSU 1. Size from standard Micro-D sizes, about 28 x 28 x 22 cm [EST]. [References/limits](research/iem-2026-10-13/README.md). Corrected October 13 (first version archived).
- [ ] **12 follow-up:** an uncovered view of the face to map the windows exactly; real wall position; the wall panel itself once the open-frame structure is modeled; harness routes to the PSUs, radio and instruments. The old HGA-actuator placeholder has been replaced by the #10 pass.
- [x] **Claude:** **13 Frontier X-band radio** (`frontier-radio`): four black slices on bolted feet, labeled connectors J11-J32, top semi-rigid coax, from APL's photo; 4 x 6 in slice size [PUB], stack width from the photo [EST]. [References/limits](research/frontier-radio-2026-10-13/README.md).
- [ ] **13 follow-up:** one radio or two (redundancy); real bay location and cable runs to the IEM, TWTA and antennas. #12/#14 are rebuilt and the modeled TWTA coax reaches J31; actual flight routing/port assignment remains unverified.
- [x] **Claude:** **14 TWTA amplifier** (`twta`): one 100 W X-band TWTA [PUB] on the underside of the top deck [PUB]: a conduction-cooled tube on a flanged baseplate and a separate EPC joined by a braided high-voltage umbilical, drawn after NASA's photo of LRO's TWTA and Stellant's space-tube photos; sizes scaled from LRO, MRO and Stellant units [EST]; WR-112 waveguide up through the deck, input coax to the radio, EPC harness to the wall [EST]; under the starboard deck above the radio [EST]. [References/limits](research/twta-2026-10-14/README.md).
- [ ] **14 follow-up:** the Dragonfly unit's real size, ports and maker; one or two units (ICES-2020 says "TWTAs"); its exact deck position; the RF chain to the antenna (isolator, diplexer, switches, rotary joints) and the radio port that feeds it; draw the top-deck panel itself once the shell layers are modeled.
- [x] **Claude:** **15 Battery and thermal buffer** (`battery`): 24 upright cells [PUB count] of GS Yuasa's 134 Ah LSE134 [EST, inferred], 4 x 6, with fin plates, copper heat pipes in three directions and series bus straps; enclosure look from the real photos of APL's 9-cell test module (cream ribbed lower section, flange, bare aluminum upper housing with three 2 in fans per end, 1 in fans on the lower walls, round connectors including a large four-pin); on pads over the warm duct, center z 0.565 from the TFAWS 2023 plan view [EST]; the wax is not drawn (location unpublished). [References/limits](research/battery-2026-10-15/README.md). (Codex's handoff: "in progress/uncommitted" until this pass.)
- [ ] **15 follow-up:** verify flight cell model, enclosure size, cell/fan arrangement, real
  mounting and PCM location. Keep #20's sensor-placeholder/lid overlap for the sensor rebuild.
- [x] **Claude:** **16 Aft bulkhead** (`aft-bulkhead`): gold-colored face, pocketed rim and ribbed circular
  generator interface from real NASA/APL structure photos; canted body face and aft/up MMRTG
  pose, fans and short collar. **Codex:** verified the explicit inverted-fixture caption,
  corrected the bounding-box test, archived the preceding geometry and completed release records.
  [Sources, estimated dimensions and checks](research/aft-bulkhead-2026-10-15/README.md).
- [ ] **16 follow-up:** exact flight angle, panel dimensions/material/coating and final revision;
  actual MMRTG attachment and gas passage. The 25-degree tilt, collar and 2 mm model clearance
  are illustrative geometry, not validated flight specifications.
- [x] **Claude:** **17 Circulation fans** (`fan`): Fan-A and Fan-B side by side in housings at the MMRTG end, with rotors that turn with the flow and an adapter to the MMRTG; TFAWS 2023 slides 3, 7, 8 and TFAWS 2024 slide 14; size from the plan view. [References/limits](research/thermal-loop-2026-10-14/README.md).
- [x] **Claude:** **18 Under-floor warm duct** (`underfloor-duct`): 0.14 m wide on the centerline from the fan transition to the nose, turning up into the body below the nose, with flanges; TFAWS 2023 slides 3-4, ICES-2023. [References/limits](research/thermal-loop-2026-10-14/README.md).
- [ ] **18 follow-up:** real duct height; the round perforated feature on the duct in the slide 3 plan view; old nose-electronics placeholder reaches into the duct zone (fix with that part). Battery clearance is covered by the October 15 duct adjustment (duct 7.5 mm lower); #16 now clears the duct/fans with an estimated collar.
- [x] **Claude:** **19 Trim device** (`trim-chimneys`, durable id kept): the cold bypass duct under the belly, outside the foam, with fore and aft diverter flaps in foam-wrapped housings that open with the trim setting; TFAWS 2023 slides 4, 7, 8 and TFAWS 2024. ICES-2023's side-chimney concept archived. [References/limits](research/thermal-loop-2026-10-14/README.md).
- [ ] **19 follow-up:** the cold duct's real section and the meaning of the "split cold duct" (TFAWS 2024); flap hinge sides and actuators.
- [x] **Codex:** **20 Battery temperature sensor** (`battery-sensor`): October21 labeled TE44909-family approximation: real manufacturer photo/drawing, 2.4 mm maximum envelope, black/gray epoxy bead and two 3-inch 32 AWG leads. Bond pads, profile/depth, side-wall installation and local route are estimates. Independent Casings/Mounts/Harnesses and bead macro focus; existing battery reading, physical battery and21 unchanged. [Current sources, archive and sample](research/battery-sensor-2026-10-21/README.md). October20 annotation retained in archive.
- [ ] **20 follow-up:** identified Dragonfly sensor hardware, actual count, cell/pack sensing locations, mounting/bonding, harness destination and electrical interface. TE family adoption is unconfirmed; no claimed per-cell telemetry, accuracy or new temperature solver. The example's -55 to +90 C rating is not suitable for the fin-root example or Titan ambient.
- [x] **Codex:** **21 MMRTG fin-root sensor** (`mmrtg-sensor`): October21 Omega F2020 Class B family approximation replaces Claude's archived annotation. Real catalog photo/drawing:2 x2 x0.8 mm, two10 mm x0.2 mm leads; -70 to+500 C catalog range covers NASA's157 C fin-root rating. Ceramic/blue-glass package, estimated curved bond/local route/placement beside top fin; independently hidden Casings/Mounts/Harnesses, element/installation macro selectors. Posed with current generator; actual flight hardware/count/qualification unknown. Existing modeled gas temperature retained. [Current sources and samples](research/fin-root-sensor-2026-10-21/README.md); [historical Claude annotation](research/mmrtg-measurement-2026-10-20/README.md).
- [ ] **21 follow-up:** flight type/supplier/count, exact sensing point/bond, radiation and flight qualification, generator-versus-lander ownership and harness destination. Recheck installation against the upcoming MMRTG-body redraw; current housing/fin dimensions are provisional. The reference RTD's temperature rating alone does not establish suitability for flight. No separate fin-root solver or controller implemented.
- [x] **Codex:** **22 Nose methane/E-field instruments** (`nose-sensors`): photo-referenced EFIELD assemblies plus owner-approved, labeled METHAN design approximation; independently removable housings/covers, supports and fiber entry. [Sources, estimates and verification](research/methan-2026-10-18/README.md).
  - [x] **Codex, October 17:** both EFIELD probes from an engineering-model photo and
    published stalk/ball dimensions; estimated preamp and co-mounted TEMP/MICRO; independent
    inspection masks and fixed front label. Front mount clears the rebuilt DrACO tube.
  - [x] **METHAN, October 18:** owner approved a labeled design approximation; placeholder
    replaced by estimated enclosure/filter cassettes, mounts and short optical-fiber entry.
  - [x] **Codex, October 18:** independent Front EFIELD / Rear EFIELD / METHAN inspection;
    sources distinguish the cold mirrored cell from the warm fiber-fed light engine.
  - [ ] **22 follow-up:** actual METHAN hardware photo and scale; flight cell dimensions,
    material/finish, filter layout, mounting, optics and warm DPU internals. Initial asset pass
    completion is not photo verification. Keep every estimated dimension tagged and do not
    invent extra TEMP/HYDRO sensors from the neighboring items in the CAD panel.
- [x] **Claude:** **23 Lower DragonCam cameras** (`side-cameras`): Microscopic Camera on the port side placed from its published 986 mm range at 52 degrees to the port drill site, APL's LED array beside it (365 nm UV emitter), a Down Camera on each side; Malin ECAM heads drawn from the paper's figures (shared `dist/ecam.mjs`); each in a foam cavity behind a 3 mm window, brackets on the bay wall's outer face, harness through the wall. [References/limits](research/side-cameras-2026-10-13/README.md).
- [ ] **23 follow-up:** the foam blister the Microscopic Camera needs (it is thicker than the 7.62 cm average foam); Down Cameras' exact position; the camera electronics box (ECAM-DVR8P) inside the bay. #19 has replaced the old side-chimney placeholder with the under-belly trim device; retain the rebuilt-set clearance checks.
- [x] **Claude:** **24 DrACO blowers** (`drill-blower`): forward and aft centrifugal blowers (volute, motor, axial inlet, tangential exhaust out and down) behind the port forward arm, fed by an inlet flow diverter; per DrACO fig. 1 and ICES-2023. [References/limits](research/draco-plumbing-2026-10-14/README.md).
- [ ] **24 follow-up:** real blower size and shape; the unidentified cylinder-and-cone unit under the port attic seen in APL's CAD movie.

## Connections and Installation (owner, October 20)

The owner notes that a lot of connecting equipment is still missing. Done so far: TWTA coax,
waveguide and high-voltage umbilical; sample-transfer lines (#02); the warm and cold ducts
(#17-19); METHAN fiber entry and EFIELD harness exits (#22); PSU/IEM face connectors.
- [x] **Claude:** Main wiring harness, first pass (October 21): trunk down the bay floor's centerline and branches to the power units, IEM, battery, radio, drive electronics, navigation units and lower-camera pass-throughs, meeting the stubs the unit passes left; lacing and floor clamps; routes [EST]. [Notes](research/main-harness-2026-10-21/README.md).
- [x] **Claude:** Harness, second pass (October 21): bundles beside the trunk (IEM to power unit 1, power unit 2 to radio), wall risers to the TWTA power-supply cable and the gimbal drive cable, and a starboard-wall run past the battery to the fans.
- [x] **Claude:** Harness, third pass (October 21): three strands laid with the trunk and two more cross-floor bundles, for some of the photo's density.
- [x] **Codex:** RDE connector service-loop pass (October21): four estimated slack bows/lacing on existing leads, original entries/endpoints preserved, independent Harnesses/Interfaces masks. Enclosures and main trunk unchanged. General NASA workmanship guidance, not flight-route or bend qualification. [Sources, archive and sample](research/rde-service-loops-2026-10-21/README.md).
- [ ] Harness, next passes: service loops at other units' connectors, the diagonal brace runs, the attic harness (DraMS, carousel), the port down camera (pass-through behind power unit 1).
- [ ] (Original note) Main wiring harness: NASA's September 2, 2026 photo shows dozens of silver cables
  running around and through the structure (saved for #03 in `research/nose-bulkhead-2026-10-19/`).
  Draw the main trunks between the PSUs, IEM, radio, instruments and arms, as photographed.
  **What the photo shows (Claude, October 20):** silver-sheathed bundles (roughly 1-3 cm) in a
  network across the bay floor and up the side walls and a diagonal brace, laced together with
  tie points and clamped to the structure, branching to each unit's connectors. Plan: one module
  (`dist/main-harness.mjs`) with trunks along the floor perimeter and centerline, branches ending
  at the modeled connector faces (PSUs, IEM, radio, battery, DraMS, cameras), P-clips on the
  walls, a `harnesses` inspection layer; routes [EST], clearance tests against all rebuilt parts.
  The same photo also confirms the gold aft bulkhead (#16) and the arm shoulder fitting.
- [ ] Mounting plates, brackets and standoffs for units still shown floating or on pads.
- [x] **Claude:** The carousel's top hardware (October 21): foil-wrapped unit, valve block with bolted flanges, white wire loop; the strut and drives were already modeled, and the posts under the plate are the handling fixture. [Notes](research/carousel-detail-2026-10-21/README.md).
- [ ] The open-frame wall panels the IEM, PSUs and radio mount to (#11-#13 follow-ups). Note (Claude, October 21): side panels would have to be ghosted like the body shell in Internal view, and need openings where the lower cameras pass through the wall; the diagonal brace in the September photo has no position source yet.

## Exterior: Rotor Arms and Heads

- [x] **Claude:** Rotor heads (October 15): coaxial motor stacks (collar with arm clamp between
  upper and lower machined motor drums) and bolted hub plates, from APL/NASA's *Revolutionary
  Rotors* video, NASA's tunnel photos and the flight lander-frame photo.
  [References/limits](research/rotor-heads-2026-10-15/README.md).
- [x] **Claude:** **Arm shoulder joint (owner, October 15; done October 20):** now the machined fitting from the frame photo: a six-sided ribbed collar narrowing along the arm to a round 12-bolt flange, seated at the foam surface; base plate (under foam) and lifting lug not drawn; sizes [EST]. [References/limits](research/arm-shoulder-2026-10-20/README.md). Original note: the arm does not go straight into
  the body; at the shoulder it meets a small hexagonal fitting. Redraw the shoulder (now a round
  foam ring and a round metal flange) from the real photos: the flight lander-frame tap-test photo
  (`research/rotor-heads-2026-10-15/nasa-apl-lander-frame-tap-test-2026-05.jpg`, the arm root at
  the body side) and the *Revolutionary Rotors* frames.
- [ ] **Arm follow-up:** the bare flight arm (a round tube with fittings in the frame photo) under
  its foam cover; the harness along the arm.

## Shell, Insulation and Layered Views

The owner's enclosure/inner-plating suggestion is a research question, not a confirmed
construction specification. The existing cutaway is an inspection illustration, not a
claim that bare parts float in one empty, undivided chamber. Sources already describe
bulkheads, an under-floor duct, insulation and distinct warm/cold regions; verify their
actual geometry, interfaces and materials before extending the model.

- [ ] Inventory existing fuselage, attic, deck and insulation meshes against published sections.
- [ ] Determine which parts have their own casings, thermal isolation, mounting trays or covers.
- [ ] Research the structural skin/deck, insulation thickness and placement, bulkheads,
  compartment walls and service penetrations. Do not assume a continuous inner metal liner.
- [ ] Review harnesses, brackets and plumbing where photos show them; retain confidence/source notes.
- [ ] Add an **assembled enclosure view** with casings and covers in place.
- [x] **Codex, October 16:** independent hide/show controls for outer/attic shell,
  structural facing, insulating foam, compartment/interface panels and individual equipment
  casings when they obstruct inspection, in compact expandable Inspection layers. Body/attic
  skins and foam are still combined geometry; their true construction layers remain open.
- [x] **Codex:** Keep hidden layers physically installed: no position/scale changes, flight effects or
  unintended camera re-centering. Retain part identity and make hidden/selected state clear.
- [x] **Codex:** Include restore-all/reset, keyboard/touch access and desktop/mobile checks.
  Existing isolated-part inspection remains available. Verified locally at 1440, 390 and
  360 px; released with the part 16 closeout.
- [x] **Codex:** Keep isolated DraMS unobstructed by neighboring carousel/partition; full context returns
  when isolation is off. DraMS covers/casings/mounts are separately grouped for future controls.
- [ ] Add an **insulation/construction view** with independently selectable skin, insulation,
  bulkheads/deck and equipment housings, only where supported by references.
- [ ] Consider a **section-plane cutaway** rather than making all materials transparent at once.
- [ ] Consider an **exploded assembly view**, clearly labeled as a presentation offset, with
  leader lines and a reliable reset to installed positions.
- [ ] Retain Thermal and airflow views, but distinguish model temperatures, illustrative
  flow paths and real measured values. Current airflow arrows intentionally draw over parts.
- [ ] Audit new-to-new part intersections after every update; preserve structural-envelope checks and track legacy neighbors separately.
- [ ] Keep explanatory text and construction/source notes under expandable sections.

## Remaining Work Packages (expanded October21 at owner's request)

This is an implementation backlog, not a claim that every suggested item is flight hardware.
Existing installation passes above are retained. Each unchecked package starts with an evidence
review and an inventory of what is already modeled; do not duplicate Claude's harnesses.
Publicly undocumented internals stay omitted or explicitly estimated. Complete one package,
with archive/source comparison/clearance/render checks, before the next. Keep four separate
statuses: initial part, installation, construction access, and final UI/integration acceptance.

### Connection Register and Mechanical Installation

- [ ] **Endpoint register:** table per connection with stable name, owning part, source/figure,
  confidence, existing start/end transforms, medium (power/data/RF/fiber/air/sample), modeled
  extent and missing destination. Distinguish real interfaces from illustrative stubs; never
  infer pinout or cable count from connector silhouette. Use this before adding more wires.
- [x] **Initial bay register / lower-camera family (Codex, October23):** scoped measured
  routes, three corrected tips, port-camera bypass/support; all estimated, no pinouts.
  [Data/samples/limits](research/harness-endpoints-2026-10-23/README.md). Global register above stays open.
- [ ] **Avionics service loops:** IEM, both PSUs, radio, navigation boxes and battery, one unit
  per pass; retain actual modeled connector positions, add justified slack/backshell relief,
  lacing and attachment points. RDE's October21 pass is already done, not a new open item.
- [x] **Five-family initial support/access package (Codex, October25):** IEM two second-column
  supports, one per PSU, three radio local-RF supports, three battery supports and navigation
  retention heads/washers. Existing curves and capped navigation ports retained.
  [Evidence, samples and precise open limits](research/avionics-installation-2026-10-25/README.md).
- [x] **IEM second-column middle route:** lead 6 separated, label attached, one support and
  two ties added. All endpoints/other geometry retained; terminal gathering overlaps remain
  open. [Real/CAD/model comparison, checks and handoff](research/iem-middle-lead-2026-10-25/README.md).
- [ ] **Five-family routing continuation:** remaining 17 IEM
  routes and other PSU leads; identified external radio/navigation mating before new wires.
  Battery full flight-pack routing remains unverified. Support additions do not close these.
- [ ] **Floor/perimeter routing audit:** review existing three harness passes together; remove
  no geometry without archiving. Separate actual bundled routes from accidental doubled runs;
  locate crossings/branches in 3D and tie supports to real modeled structure.
- [ ] **Wall/brace runs:** reconcile photographed diagonal brace, wall risers and cable clips
  with eventual side panels; no arbitrary brace location promoted to published geometry.
- [ ] **Attic instrument harness:** DraMS, Wonderwall and carousel visible wiring/valve lines,
  with equipment entries, local branches, supports and service slack based on saved photos.
  Do not invent hidden spectrometer/sample-processing circuits or plumbing topology.
- [x] **External sampling-electronics source gate (Codex, October24):** public roles and
  real DraMS LEU engineering-model photo recorded; bus/connector/placement evidence still
  insufficient for a physical trunk. Collapsed coverage view added, not a completed network.
- [ ] **DrACO avionics accommodation:** separately identified enclosure, reliable scale,
  mounting zone, actual mating interfaces and supported routes; not the IEM or a carousel motor.
- [ ] **DraMS LEU accommodation:** real NASA EM photo now saved; exact flight external case,
  scale/location and interfaces still needed. Do not conflate LEU, DraMS MEB and Ocellus MEB.
- [x] **IEM first upper pair (Codex, October24):** estimated service bows/lacing/supports,
  all26 endpoints retained; two focuses, independent masks, archive and real/CAD/model
  comparison. [Scoped results and limits](research/iem-service-bends-2026-10-24/README.md).
- [x] **IEM first lower pair (Codex, October24):** indices2/3 gain height-separated bends,
  four ties/two supports, attached labels and a third focus. Upper pair and all26 endpoints
  exact;583 tests pass. [Sources, sample and handoff](research/iem-lower-pair-2026-10-24/README.md).
- [x] **IEM second-column upper/lower IDs 5/7:** separated local routes, attached labels,
  refitted supports and four lacing examples; middle and first column exact. 604 tests pass.
  [Sources, samples and limits](research/iem-second-column-2026-10-25/README.md).
- [x] **IEM third-column upper IDs 8/9:** two service routes, attached tags/supports/lacing,
  separate focus and full-IEM sample; seven previous routes exact. 609 tests pass.
  [Sources, archive and handoff](research/iem-third-upper-2026-10-25/README.md).
- [ ] **IEM remaining 17 local leads:** next third-column lower IDs 10/11.
  Preserve all nine reviewed routes and every endpoint; no new flight circuit assignments.
- [ ] **Complete IEM local connector installation:** audit remaining service
  bends, lacing and support contact without moving the photo-referenced enclosure or claiming
  circuit identity. Keep main-branch/stub endpoints from the current bay register.
- [x] **Attic local-line audit / DraMS short wire (Codex, October23):** eight examples
  registered; media masks/focuses corrected; one estimated wire support/slack pass complete.
  Full preceding attic network remains open. [Sources, sample and handoff](research/attic-connection-media-2026-10-23/README.md).
- [x] **Carousel warm-drive local installation examples (Codex, October24):** three retained
  nominal drive centers/cans gain exterior detail, independent inspection and local estimated
  lead/socket/support examples. Full register now11 rows. Remote electrical destinations,
  real drive identities and complete attic harness still open, not inferred from ground cabling.
  [Real/CAD/model samples, source limits and next gate](research/carousel-warm-drives-2026-10-24/README.md).
- [ ] **Camera/navigation harness:** front-camera panel, Ocellus FEB/MEB and both MIMUs;
  port Down Camera pass-through behind PSU1 and lower camera/window clearances. Mark unknown
  destinations; preserve current photo/dimension-based camera poses and optical openings.
  Lower-camera installation initial pass complete October23; front/navigation and flight
  interfaces remain open, not completed by geometric joins.
- [ ] **Sensor connections:** finish20/21 local-installation checks, then EFIELD preamps,
  METHAN fiber entry and their warm/cold penetrations where documented. Distinguish atmospheric
  sensors from battery and generator feedback; no invented DPU internals or fiber count.
- [ ] **Arm/motor runs:** bare arm structure under foam, shoulder fittings, cable path to
  coaxial motor heads and root strain relief. Confirm documented routing before adding it;
  keep rotor animation separate from stationary cables and motor casings.
- [ ] **RF chain continuity:** review existing Frontier/TWTA coax, EPC umbilical, waveguide,
  deck crossing and HGA actuator cable; connector mating, slack and gimbal travel clearance.
  Existing paths are not permission to invent flight frequency/power/connector pin details.
- [ ] **Thermal interfaces:** fan collar, MMRTG enclosure, hot/cold ducts, flaps and trim
  outlet; check junctions, seal/attachment appearance and service access. Do not turn Titan's
  atmospheric gas ducting into an undocumented operational liquid loop.
- [ ] **Sample plumbing continuity:** drill diverters/blowers, transfer lines, carousel and
  Wonderwall entrances; review supports, unions and clipping only where sourced. Inspect
  ports/endpoints, not just visually continuous tubes; hidden valve internals stay unmodeled.
- [ ] **Equipment supports:** wall-mounted IEM/PSUs/radio, battery base, navigation shelf,
  attic trays, fan and generator brackets; track load paths to deck/frame. An estimated pad
  is not proof of a flight bracket. Fix floating assemblies one support family at a time.
- [ ] **Installation acceptance:** connection register has no unexplained floating endpoints;
  intended mating/contact pairs explicitly whitelisted, all other new-to-new intersections
  checked. Report legacy placeholders separately. Harness/interface/mount masks restore
  without moving the hardware; no qualified bend-radius or workmanship-compliance claim.

### Construction Layers and Access

- [ ] **Layer inventory:** map each existing skin, foam, deck, bulkhead, tray and equipment
  cover to its owner/source and what it obscures. Record combined meshes needing separation;
  do not assume a continuous inner metal liner, empty boxes or undocumented sandwich cores.
- [x] **First side panel initial pass:** starboard structural facing separate from equipment
  covers, two published-thickness faces, estimated edge closeouts and camera relief. Numbered
  hardware unchanged; wall-face/numbered/shoulder clearance checked. [Evidence and limits](research/side-wall-2026-10-22/README.md).
  Exact frame dimensions, core/layup/inserts, shoulder load-path connections and local foam
  remain open follow-ups, not a claim of completed flight construction.
- [x] **Opposite side/end-interface initial passes:** port panel has separate reliefs for
  Down Camera and Microscopic Camera/LED; separately selectable estimated nose/aft web/return
  pairs meet existing bulkhead edges. Original24 parts and starboard unchanged. [Sources and checks](research/port-wall-joints-2026-10-22/README.md).
  Exact flight fitting/insert/bond/seal details, IEM ground-bond termination, shoulder load
  paths and insulation penetrations remain open follow-ups, not claimed complete construction.
- [x] **Deck/attic-edge initial pass:** separate top-deck faces, estimated opening/edge lip
  and stow-lock foundations at existing HGA/TWTA mounting plane. Cameras/sample routes and
  completed assets unchanged; deck faces clear gimbal motion. [Sources and checks](research/top-deck-2026-10-22/README.md).
  Further lower-deck/support details, exact apertures/layup, local inserts/bonds/seals and
  complete attic boundary remain open; short lip is not a full thermal barrier.
- [ ] **Insulation regions:** distinguish body/attic/arm foam and warm/cold boundaries from
  structural skin. Use published thickness where applicable; retain local-thickness unknowns,
  lower-camera blister follow-up and any unmodeled mounting isolation.
  - [x] **Body surface access:** five independently hidden outer surfaces preserve the
    original outer body; no flight tile cuts or actual foam volume inferred. Source nominal
    7.6cm thickness is recorded, not applied as a blanket inward offset around existing parts.
  - [x] **Attic surface access:** split the existing raised cover without moving instruments;
    distinguish cold carousel region and warm DraMS where supported, not invented tile seams.
  - [x] **Local camera/HGA initial access:** saved real/test photos and sections reviewed;
    HGA surfaces removable; camera-window surrounds/optical reliefs estimated. Mechanism,
    camera bodies and aim preserved. Full foam blisters/inner thickness remain open.
  - [ ] **Thickness/encapsulation/venting:** verified local section geometry and load-path
    dependent encapsulation; NESC test vent-grid examples are not flight hole maps.
  - [ ] **Thermal material-revision audit:** compare current Solimide16 test conditions
    with legacy preliminary Rohacell-based conductivity/UA assumptions before changing solver.
- [ ] **Equipment-specific housing audit:** casing/lid/base/thermal attachment per unit;
  closed housings show only referenced internal hardware when opened. An empty approximation
  must not be described as an actual hollow flight enclosure.

### Layered View Packages

- [x] **All-layers / Open-interior access presets:** enclosing walls/foam/panels can be
  removed together with equipment/mounts/connections installed; reverse with All layers or
  Restore. Initial access complete, not the full discipline-specific preset package below.
- [ ] **As-installed preset:** reference exterior plus covers, mounts and connections in
  place; no default all-transparent vehicle. Restore installed poses and stable labels.
- [ ] **Construction preset:** separately hide/ghost outer skin, foam, frame/deck/bulkheads
  and equipment housings. Clearly distinguish global structural layers and part-level covers.
- [ ] **Electrical/communications preset:** retain supports and connector context, emphasize
  supported harness/RF/fiber routes; unknown routes visibly distinguished, no implied pinout.
- [ ] **Thermal/airflow preset:** show published duct regions and estimated temperature fields,
  insulation and generator/fan interfaces. Current overlay arrows and modeled temperatures
  stay labeled; no fictitious sensor network or hardware-specific heat-transfer solver.
- [ ] **Sampling-path preset:** drill/transfer/blowers/carousel/Wonderwall/DraMS connected
  view with removable obstructing structure, linked to the existing shared science sequence.
- [ ] **Service/detail preset:** part/subassembly close-up with selectively hidden local
  covers/supports; optional section plane only if clipping caps/labels are correct. Any
  exploded offsets are viewing aids, never installed geometry or collision-test coordinates.
- [ ] **View acceptance:** each preset names what it covers and reveals, preserves user
  selections, resets reliably, keeps labels on real anchors and works by touch/keyboard.
  Do not add six competing top-level tabs if compact presets in existing controls suffice.

### Whole-Project UI and Documentation Review (after parts/installations)

- [ ] **Mission tabs:** inventory Exterior/Internal/Thermal/vehicle layers, part selector,
  macro/subassembly controls, source links and live readouts. Remove stale placeholders/counts
  only when their replacements are complete; archive any replaced visual arrangement.
- [ ] **Pilot and operations:** review shared mission state, telemetry meaning and mission
  reset discoverability; preserve below-canvas scrolling/content, Ctrl browser zoom and the
  optional fullscreen behavior. No unrelated flight/physics tuning during hardware passes.
- [ ] **Science/notebook/debrief:** verify terminology and sequence still match implemented
  hardware and instruments; existing long sections stay expandable and easy to find.
- [ ] **Model/part assumptions:** reconcile initial passes vs flight verification, all family
  approximations, illustrative environment, missing internals/routes and displayed temperature
  zones. No screen may imply 24 initial passes equals a validated full engineering model.
- [ ] **Source/archive consistency:** credits, public links, stored photo/drawing/model
  comparisons, recovery tags and checklist status agree; keep real/CAD/render labels distinct.
- [ ] **Interaction/layout audit:** desktop and360/390 px phones, tabs/accordions/layer masks,
  orbit/zoom/isolation/reset, dark/thermal visibility, label stacking and no overflow. No
  information removed just to make a viewport fit; hover is not the only way to use controls.
- [ ] **Release acceptance:** full tests, new-to-new clearance matrix, nonblank/framed canvas
  checks, local/public screenshots and stamped-build verification. Check other assistants'
  branches before publishing; preserve unrelated game work and record remaining gaps.

## Reference Starting Points

Reopen the relevant sources for each part; do not infer exact dimensions from a perspective
image alone. Record source, date/version, inferred dimensions and unknowns with each asset.

- [NASA carousel integration photos](https://svs.gsfc.nasa.gov/15003)
- [APL spacecraft/payload models](https://dragonfly.jhuapl.edu/What-Is-Dragonfly/Spacecraft-and-Science-Payload.php)
- [NASA March 2026 electronics integration](https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/)
- [NASA September 2026 wiring/integration](https://science.nasa.gov/blogs/dragonfly/2026/09/02/nasas-dragonfly-gets-wired-up-while-titan-landing-area-is-named/)
- [ICES-2023-389 thermal model/layout](https://ttu-ir.tdl.org/server/api/core/bitstreams/0737a596-5ba9-488b-9cc6-0b2ed93e2cd5/content)
- [TFAWS 2023 controller/layout figures](https://tfaws.nasa.gov/wp-content/uploads/TFAWS23-AT-14-Presentation.pdf)
- [NASA DraMS overview, including oven terminology](https://www.nasa.gov/missions/nasa-instrument-bound-for-titan-could-reveal-chemistry-leading-to-life/)
- Existing `research/source-review-2026-10-10.md`, `research/apl-spacecraft-models/`,
  `RESEARCH-COMPENDIUM.md` and the owner's downloaded thermal PDFs.

No image-generation service is to be used. Prefer sourced imagery/geometry, credited
reference assets and code-native Three.js modeling with uncertainties labeled.
