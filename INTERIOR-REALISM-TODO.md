# Interior Realism Checklist

Owner request recorded October 12, 2026. Maintainer for this entry: Codex (OpenAI).
Keep this file updated across context resets and assistant handoffs. Do not rebuild the
whole interior in one pass. Complete, verify and archive one part before moving on.

## Current Milestone

- [x] Implement the compact, expandable surface operations queue.
- [x] Review the owner's video `1000046285.mp4` (33.88 s), including frames near 4, 17 and 29 s.
- [x] Identify a concrete label-layout cause in the code (below).
- [ ] Correct label anchoring/overlap (deferred while beginning parts, per latest owner request).
- [x] Rebuild the first part: DrACO sample carousel (#6), using public integration photos; estimated scale explicitly labeled.
- [ ] Continue the remaining parts individually; no unverified internals presented as CAD.

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
Current rebuilt set: `sample-carousel` only (`carousel-2026-10-12`).

- [ ] **01 DrACO drill/feed assemblies** (`drills`): housings, feed mechanism, attachment and working clearance.
- [ ] **02 Pneumatic sample-transfer lines** (`sample-lines`): verified endpoints, tube size/routing and bends; avoid routing through solid housings.
- [ ] **03 Nose bulkhead** (`nose-bulkhead`): profile, thickness, apertures and relation to the forward bay.
- [ ] **04 Forward/navigation cameras** (`nose-cameras-inside`): individual bodies, lens openings, mounts and actual enclosure boundaries.
- [ ] **05 IMU/lidar electronics, FEB/MEB** (`nose-electronics`): distinguish boxes and brackets; verify names/locations against current sources.
- [x] **06 Cold sample-delivery carousel** (`sample-carousel`): enclosed drum, cooling fins, ports and underside drives; stationary housing, internal indexing cue. [References/limits](research/carousel-2026-10-12/README.md). No exposed invented cup inventory; 0.36 m diameter and placement remain estimates.
- [ ] **06 dimensional follow-up:** replace proportional scale with an authoritative dimension/CAD if available; reconcile interfaces as #02/#07/#08 are rebuilt. Existing legacy overlap is not corrected by shrinking #06.
- [ ] **07 Wonderwall thermal barrier** (`wonderwall`): actual shape and sample interfaces; do not reduce it to an unexplained slab or invent layer materials.
- [ ] **08 DraMS assembly** (`drams`): enclosure and subassemblies; separately research ion-trap mass spectrometer, UV laser/LDMS interface, GC hardware, pyrolysis oven and fan. Do not invent detailed internal geometry where no public view exists.
- [ ] **09 Rotorcraft drive electronics** (`rde`): both enclosures, mounting/thermal interfaces and cable exits.
- [ ] **10 HGA azimuth/elevation actuators** (`hga-actuators`): motors, bearings, bracket geometry and relationship to the antenna mechanism.
- [ ] **11 Power switching units** (`power-units`): both casings, connectors and mounting surfaces.
- [ ] **12 Integrated electronics module** (`iem`): reference casing, panel seams, connectors and mounting, not exposed decorative boards.
- [ ] **13 Frontier X-band radio** (`frontier-radio`): enclosure, connectors and clearances.
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
