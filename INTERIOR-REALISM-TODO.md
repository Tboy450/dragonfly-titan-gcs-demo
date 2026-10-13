# Interior Realism Checklist

Owner request recorded October 12, 2026. Maintainer for this entry: Codex (OpenAI).
Process and handoff notes added October 13, 2026 by Claude (Anthropic Claude Opus 5.5).
Keep this file updated across context resets and assistant handoffs. Do not rebuild the
whole interior in one pass. Complete, verify and archive one part before moving on.

## Current Milestone

- [x] Implement the compact, expandable surface operations queue.
- [x] Review the owner's video `1000046285.mp4` (33.88 s), including frames near 4, 17 and 29 s.
- [x] Identify a concrete label-layout cause in the code (below).
- [ ] Correct label anchoring/overlap (deferred while beginning parts, per latest owner request).
- [x] Rebuild the first part: DrACO sample carousel (#6), using public integration photos; estimated scale explicitly labeled.
- [x] Rebuild the second part: Wonderwall interface (#7); contour, openings and independently grouped faces/core/mounts, all detail dimensions estimated.
- [x] Rebuild #8 DraMS at enclosure level; separate cases/covers, mounting frame and a simplified aligned interface. Detailed internals remain open.
- [x] Rebuild #13 Frontier radio from APL's photo and published slice size (Claude, October 13).
- [x] Rebuild #12 IEM from NASA/APL's integration photos (Claude, October 13).
- [x] Rebuild #11 power switching units from NASA/APL's testing photo (Claude, October 13).
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
3. **Capture the detail; research and credit; save everything used.** The goal is to capture
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
   shell/foam/casing hide/show controls will toggle, so hidden layers never move parts.
   Local imports keep `?v=dev`. Register it in `dist/vehicle-research.mjs` with
   `interiorPart(id, thermalZone, label, source, color)` and keep the durable ID.
6. **Fit rules (owner, October 12).** Model frame: x across (cavity about +/-0.36 m), y up
   (bay floor about -0.29, cavity to +0.07, attic to +0.5), z along the body (nose negative,
   nose bulkhead -1.56, aft bulkhead +1.08). Stay inside the structural envelope. Check
   clearance only against the already-rebuilt set; never shrink or move a correct part to dodge
   an old placeholder. Record legacy overlaps as follow-ups for that neighbor's own pass.
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
11. **Write it up.** Signed `CHANGELOG.md` entry; research README; `RESEARCH-COMPENDIUM.md`
    note; `ARCHITECTURE.md` file-table row for the new module; README if user-visible text
    changed; tick the box below with links to the research notes and what remains estimated.
12. **Publish.** Commit with the assistant's co-author trailer, `git push origin master:main`
    plus the archive tag, then confirm the GitHub Pages run and the live build stamp.

## Handoff Notes (for Claude and other assistants)

- **State on October 13, 2026:** parts 06, 07, 08 (Codex), 13, 12 and 11 (Claude) are
  rebuilt and live; 164 tests pass. Codex was stopped by a usage limit while writing this section; Claude
  completed it.
- **Rebuilt-set assets to test against:** `carouselAsset` (`dist/sample-carousel.mjs`),
  `wonderwallAsset` (`dist/wonderwall.mjs`), `dramsAsset` (`dist/drams-assembly.mjs`),
  `frontierRadioAsset` (`dist/frontier-radio.mjs`), `iemAsset` (`dist/iem.mjs`),
  `powerUnitsAsset` (`dist/power-units.mjs`). Add each
  new part to this list and to the clearance tests of the parts it neighbors.
- **Suggested order next:** #14 TWTA, #17 circulation fan, #15 battery casing. Recheck
  references each time; reorder if a clearer source turns up.
- **Viewing locally:** Codex used Playwright scripts outside the repo; Claude uses the desktop
  app's browser pane with a no-cache static server for `dist/`. Debug hooks on localhost:
  `window.dragonflyState`, `window.dragonflyRenderer`, `window.dragonflyTick(now)`.
- **Owner preferences that apply here:** realism is the goal, but keep it easy to operate;
  keep the light visible; never throw work away; archive pictures with every replacement; sign
  every change. The owner often checks on a phone, so always check phone width.
- **Still open across all parts:** the numbered-callout layout defect (Priority 1 below), the
  shell/foam/casing hide/show controls, and authoritative dimensions for every rebuilt part.

## Priority 1: Numbered Callouts

The video shows labels forming a vertical chain and changing apparent attachment while
the model rotates. `dist/ui/flight-view.mjs`, `drawPartMarkers()`, resolves collisions by
adding 14 pixels to **screen-space Y**, up to 12 times. It does not draw a leader back to
the original projected anchor. This is a confirmed layout defect, not evidence that the
vehicle's world-space Y axis is wrong. Inspect projection/visibility as well before deciding
that this is the only cause.

`dist/chase-vehicle.mjs` currently projects each group's world bounding-box center. A group
containing two separated parts can therefore have an anchor in empty space between them.
Markers are a 2D overlay; their current visibility check is not a surface-occlusion test.

- [ ] Preserve a stable part ID and number across rotation, zoom, filtering and layer changes.
- [ ] Give each assembly a deliberate local 3D anchor; validate mirrored/multi-part groups.
- [ ] Keep projected anchor coordinates separate from the displayed label position.
- [ ] Resolve dense labels in both screen axes, with short leader lines when displaced.
- [ ] Keep labels within the viewport and out of telemetry, titles and inspector controls.
- [ ] Define visible/hidden-part behavior: hide, ghost or expose on selection rather than
  presenting every rear-side component as if it were on the front surface.
- [ ] Exclude non-drawn markers from collision placement; keep selection and click targets aligned.
- [ ] Test full orbit, elevation changes, close-ups, isolate/reset, both models, Internal
  and Thermal, and desktop/360/390 px layouts. No screen-axis label chains or detached IDs.
- [ ] Archive previous label code and angle-matched screenshots before replacement.

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
(`power-units-2026-10-13`). Their installed bounds and clearance are tested together; the
DraMS neck intentionally passes through the wall aperture.

- [ ] **01 DrACO drill/feed assemblies** (`drills`): housings, feed mechanism, attachment and working clearance.
- [ ] **02 Pneumatic sample-transfer lines** (`sample-lines`): verified endpoints, tube size/routing and bends; avoid routing through solid housings.
- [ ] **03 Nose bulkhead** (`nose-bulkhead`): profile, thickness, apertures and relation to the forward bay.
- [ ] **04 Forward/navigation cameras** (`nose-cameras-inside`): individual bodies, lens openings, mounts and actual enclosure boundaries.
- [ ] **05 IMU/lidar electronics, FEB/MEB** (`nose-electronics`): distinguish boxes and brackets; verify names/locations against current sources.
- [x] **06 Cold sample-delivery carousel** (`sample-carousel`): enclosed drum, cooling fins, ports and underside drives; stationary housing, internal indexing cue. [References/limits](research/carousel-2026-10-12/README.md). No exposed invented cup inventory; 0.36 m diameter and placement remain estimates.
- [ ] **06 dimensional follow-up:** replace proportional scale with an authoritative dimension/CAD if available; reconcile interfaces as #02/#07/#08 are rebuilt. Existing legacy overlap is not corrected by shrinking #06.
- [x] **07 Wonderwall thermal barrier** (`wonderwall`): contoured reference-based warm/cold partition, interface openings and separate face/core/mount groups. [References and limits](research/wonderwall-2026-10-12.md). Not a verified flight material stack.
- [ ] **07 dimensional/interface follow-up:** authoritative wall thickness, material stack and real sealed instrument penetrations; reconcile with #08. Published ~5 cm instrument separation is not wall thickness.
- [x] **08 DraMS assembly** (`drams`): first enclosure-level pass, with separate covers/casings/frame and simplified connection through #07. [References/limits](research/drams-2026-10-12/README.md). Dimensions and details remain estimated.
- [ ] **08 detailed follow-up:** independently source ITMS electrodes, UV laser/LDMS interface, GC hardware, carousel-side pyrolysis oven, fan and actual seals/transfer paths. Do not invent hidden internals or treat the current casings as flight CAD.
- [ ] **09 Rotorcraft drive electronics** (`rde`): both enclosures, mounting/thermal interfaces and cable exits.
- [ ] **10 HGA azimuth/elevation actuators** (`hga-actuators`): motors, bearings, bracket geometry and relationship to the antenna mechanism.
- [x] **11 Power switching units** (`power-units`): two units [PUB]; face mapped connector by connector from the full-resolution testing photo and checked by overlay (eight slices, two ribs, seven 25-way D-subs, small cluster, uncapped port, empty upper right); size from standard D-sub sizes, about 20 x 24 x 19 cm [EST]; PSU 1 beside the IEM on its wall as photographed. [References/limits](research/power-units-2026-10-13/README.md). Corrected October 13 (first version archived).
- [ ] **11 follow-up:** a photo of the second PSU (drawn the same) and of the flight units' real wall positions; separate PSU currents if the power model ever splits them.
- [x] **12 Integrated electronics module** (`iem`): from the full-resolution photos: black heat-sink top with fins parallel to the face and fastener rows, copper ground strap, bolted face plate with two rows of connector windows over eight columns, mated and labeled Micro-Ds, yellow tape; back to a wall panel beside PSU 1. Size from standard Micro-D sizes, about 28 x 28 x 22 cm [EST]. [References/limits](research/iem-2026-10-13/README.md). Corrected October 13 (first version archived).
- [ ] **12 follow-up:** an uncovered view of the face to map the windows exactly; real wall position; the wall panel itself once the open-frame structure is modeled; harness routes to the PSUs, radio and instruments. The old HGA-actuator placeholder (#10) currently sits in front of it.
- [x] **13 Frontier X-band radio** (`frontier-radio`): four black slices on bolted feet, labeled connectors J11-J32, top semi-rigid coax, from APL's photo; 4 x 6 in slice size [PUB], stack width from the photo [EST]. [References/limits](research/frontier-radio-2026-10-13/README.md).
- [ ] **13 follow-up:** one radio or two (redundancy); real bay location and cable runs to the IEM, TWTA and antennas; reconcile with #12 and #14 when they are rebuilt.
- [ ] **14 TWTA amplifier** (`twta`): housing and top-deck mounting/heat path; avoid intersecting nearby hardware.
- [ ] **15 Battery and thermal buffer** (`battery`): outer pack casing first; then sourced heat-pipe/PCM arrangement and optional cutaway, not generic exposed cells.
- [ ] **16 Aft bulkhead** (`aft-bulkhead`): profile, penetrations and attachment to the generator/fan region.
- [ ] **17 Circulation fan** (`fan`): casing, inlet/outlet, impeller visibility and duct connections.
- [ ] **18 Under-floor warm-gas duct** (`underfloor-duct`): channel cross-section, cover/floor interface, openings and bends.
- [ ] **19 Trim chimneys/flaps** (`trim-chimneys`): both ducts, insulation-covered flaps, hinges and actuator linkage; check motion clearance.
- [ ] **20 Battery temperature sensor** (`battery-sensor`): verify installation; distinguish an actual sensor body from a diagram marker.
- [ ] **21 MMRTG fin-root sensor** (`mmrtg-sensor`): same distinction, with verified placement rather than a floating green sphere.
- [ ] **22 Nose methane/E-field instruments** (`nose-sensors`): individual housings, supports and wire exits.
- [ ] **23 Side camera suites** (`side-cameras`): both sides, downward camera/micro-imager/LED apertures, mounts and insulation openings.
- [ ] **24 DrACO blower** (`drill-blower`): housing, inlet/outlet, tube connections and mounting behind the arm.

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
- [ ] **Owner reminder, October 12:** independent hide/show controls for outer/attic shell,
  structural facing, insulating foam, compartment/interface panels and individual equipment
  casings when they obstruct inspection. Put them in a compact expandable Layers section.
- [ ] Keep hidden layers physically installed: no position/scale changes, flight effects or
  unintended camera re-centering. Retain part identity and make hidden/selected state clear.
- [ ] Include restore-all/reset, keyboard/touch access and desktop/mobile checks. Existing
  isolated-part inspection remains available. Wonderwall's named groups prepare this work;
  no new layer-hiding UI has shipped yet.
- [x] Keep isolated DraMS unobstructed by neighboring carousel/partition; full context returns
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
