# NASA / APL source review: October 10, 2026

Reviewed by GPT/Codex against local commit `ac79847`. This is a research and asset
handoff only: no simulator code, parameters, presentation, or deployed files changed.
The proposals below are not implemented or approved for publication.

## Source register

All eight requested URLs are recorded below. Four already appeared in the research
documents; the three newly indexed primary articles supplement, not replace, older
research. Dates in titles are publication dates; all were inspected on October 10.

### S1. Wiring and landing region (September 2, 2026)

[NASA: Dragonfly Gets Wired Up While Titan Landing Area Is Named](https://science.nasa.gov/blogs/dragonfly/2026/09/02/nasas-dragonfly-gets-wired-up-while-titan-landing-area-is-named/)

Already indexed in `RESEARCH-COMPENDIUM.md`. [PUB] The harness contains 17,315 feet
of conductors and 374 connectors, with a mass near 100 pounds. Harness routing under
the outer foam leaves room for interior warm-air circulation. Ahmakiq Undae includes
dunes and interdunes south of Selk, extending toward hills and mountains. Use this
for wiring placement and geographic context, not an invented cable-by-cable diagram.
Photography credit: NASA/Johns Hopkins APL/Ed Whitman.

### S2. Vibration, antenna and integration (July 9, 2026)

[NASA: Dragonfly Clears Key Tests as Titan Rotorcraft Takes Shape](https://science.nasa.gov/blogs/dragonfly/2026/07/09/nasas-dragonfly-clears-key-tests-as-titan-rotorcraft-takes-shape/)

Already indexed in the compendium. [PUB] Ground vibration testing includes both
bungee-suspended and padded-skid configurations; mass simulators stand in for some
equipment. The 87.4 cm high-gain antenna deploys while stationary and stows for flight.
Leak testing supplies thermal-model airflow information. A lab test article must not
be presented as a fully equipped flight vehicle. Photography: NASA/Johns Hopkins
APL/Ed Whitman. The visible blue test leads do not establish a green grounding lead's
function or precise attachment point.

### S3. Structure and sampling hardware (April 23, 2026)

[NASA: Dragonfly Rotorcraft Gets Decked Out, Tested](https://science.nasa.gov/blogs/dragonfly/2026/04/23/nasas-dragonfly-rotorcraft-gets-decked-out-tested/)

New primary-source entry; supplements the compendium's secondary April coverage.
[PUB] Lockheed Martin manufactures APL-designed honeycomb panels with 0.01-inch
aluminum face sheets. The roughly 230-pound figure describes the frame, not the
complete aircraft. The top deck supports telecom hardware. DrACO delivers sample
cups through a carousel to DraMS, which supports laser desorption and gas
chromatography. The article also documents parachute sequence testing. Credits vary
by image: NASA/Johns Hopkins APL/Ed Whitman, Airborne Systems North America, and
NASA/Mike Guinto. Preserve the credit for the particular image used.

### S4. Avionics and integration (March 10, 2026)

[NASA: Dragonfly Mission Begins Rotorcraft Integration, Testing Stage](https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/)

Already indexed in `RESEARCH.md` and the compendium. [PUB] The integrated electronics
module (IEM) handles command/data, navigation and communications functions. Two power
supply units distribute power. APL integrates the lander; Lockheed Martin supplies
the cruise stage and aeroshell. Published future test dates describe plans, not proof
that those tests have occurred. Image credits include NASA/Johns Hopkins APL and
NASA/Johns Hopkins APL/Ed Whitman.

### S5. Rotor, insulation and aeroshell tests (September 8, 2025)

[NASA: Dragonfly Soaring Through Key Development, Test Activities](https://science.nasa.gov/blogs/dragonfly/2025/09/08/nasas-dragonfly-soaring-through-key-development-test-activities/)

New primary-source entry. [PUB] Langley's heavy-gas wind tunnel used a full-scale
half-lander to investigate rotor loads and vibration. The article describes 7.6 cm
Solimide-based insulation tested in Titan-like conditions, Frontier flight radios,
and Lockheed aeroshell fabrication/thermal-cycle tests. Heavy test gas is not a claim
that every tunnel runs nitrogen. Image credits include NASA, Johns Hopkins APL/Justin
Artis, Johns Hopkins APL, and Lockheed Martin, depending on the figure.

### S6. Critical Design Review (April 24, 2025)

[NASA: Dragonfly Passes Critical Design Review](https://science.nasa.gov/blogs/dragonfly/2025/04/24/nasas-dragonfly-passes-critical-design-review/)

New primary-source entry. [PUB] Passing CDR approves mission design, fabrication,
integration and test plans, allowing construction to proceed. Use April 2025 for
this mission-level milestone, not as a date of completed qualification. Older cruise
duration wording is historical; it should not override newer mission scheduling.
Author: Erin Morton, NASA. Partner listing is organizational credit, not a license
for unrelated partner media.

### S7. Spacecraft and payload overview (undated live page)

[Johns Hopkins APL: Spacecraft and Science Payload](https://dragonfly.jhuapl.edu/What-Is-Dragonfly/Spacecraft-and-Science-Payload.php)

Already indexed in the compendium and follow-up; successfully inspected in-browser
on this pass. [PUB] The page describes an approximately 875 kg, 3.85 m by 3.85 m by
1.75 m vehicle, MMRTG/battery power, direct-to-Earth X-band communications, navigation
sensors and the science payload. It distinguishes cruise conductive cooling from
Titan convective thermal control. It supplies a rotating CAD video and a payload
cutaway image, not exposed downloadable CAD meshes. The page names
polymethacrylimide-based foam, conflicting with S5's Solimide description: retain both
dated statements pending reconciliation. Credit the imagery to Johns Hopkins APL;
no individual creator or permissive asset license was identified on this page.

## Proposed changes only

**October 11 implementation:** the owner authorized the first inspection update.
The reference viewer, selected exterior corrections, IEM/PSU/radio separation and
component readings are implemented in [the follow-up record](vehicle-inspection-2026-10-11.md).
The dated proposal table below remains the original review; other proposals are still open.

### Additional reference: NASA printable model

[NASA 3D Resources: Dragonfly](https://science.nasa.gov/3d-resources/dragonfly/)
was inspected October 10, 2026; the page was last updated August 19, 2026.
[PUB] It lists assembly and print guides, Prusa/Bambu/Orca 3MF projects, a combined
STL archive and individual parts for the body halves, high-gain antenna, DrACO,
four propeller assemblies, electric-field hardware and assembly dowels.
**Credit: Gary Allen Backus/Backus Creative Imaging**, as displayed on NASA's page.
The listed downloads are dated August 17-18, 2026. Keep NASA's landing page as the
canonical download reference; files have not been downloaded in this addition.

Proposed follow-up: compare the print geometry and assembly guide with the app's
body, rotor supports, skids and antenna proportions. Check printable joins, dowels,
scale and mesh detail before adapting it for a real-time model. Printing geometry
can include assembly accommodations and does not by itself establish flight hardware
dimensions or internal equipment layout. This resource supplies actual downloadable
geometry, complementing the rendered APL media described in S7.

| Priority | Proposal | Existing state and scope | Basis |
|---|---|---|---|
| 1 | Add an official-reference viewer beside the Mission model | Offer the rotating CAD video and payload cutaway, with persistent credits and a design-date label. Do not replace the interactive procedural model with a flat image. Review reuse terms before public distribution. | S7; assets saved below |
| 1 | Refine the Internal model's proportions and component placement | Use multiple animation angles to check the MMRTG/duct, electronics boxes, battery region, science bay, skid instruments and sample routing. Existing internal parts are illustrative; this is a refinement, not a missing-layer feature. No pixel-to-dimension measurements without a reliable scale. | S3, S4, S7 |
| 1 | Make Exterior B a consistent ground-test configuration | Retain parked rotors and skid contact. Match padding, exposed panels, hardware and lead routing to a chosen photo/date. Keep suspended vibration testing a separate future preset. Do not move a lead onto a rotating cap based on color alone. | S2, S4 |
| 2 | Distinguish assembly hardware from the insulated Titan vehicle | Add an optional assembly/flight configuration later; show harnesses between structure and insulation, panel seams and a structural cutaway. Avoid mixing uncovered test hardware with the final outer shell. | S1, S3, S5 |
| 2 | Expand diagnostics from a generic avionics group to IEM and two PSU roles | The model currently groups avionics/power/radio boxes. Add sourced names and linked subsystem status; any fault probabilities, limits or recovery behavior remain [EST] unless separately sourced. | S4 |
| 2 | Make the science sequence visible in stages | Sampling and a carousel model already exist. Expose drill, pneumatic transfer, cup/carousel positioning and DraMS analysis as linked visual states; optional LD/GC selection needs its own time/power assumptions. | S3, S7 |
| 3 | Add a dated engineering test/history reference | Connect rotor vibration, insulation, leak/airflow, antenna and entry-system test context to relevant diagnostics, with photos where reuse is cleared. This is context, not fabricated test telemetry. | S2-S6 |
| 3 | Resolve source conflicts before changing physical constants | Investigate foam chemistry/design epoch, and compare illustration dates with current hardware. Do not infer pack energy from 134 Ah without pack voltage/topology. | S5, S7; existing battery research |

## Keep as-is / guardrails

- Three-blade rotors, MMRTG power, the 11.5 kWh energy baseline, Titan convection,
  antenna stow/deploy, science sampling and Internal/Thermal layers already exist.
  These links do not justify adding duplicate features or changing all their values.
- Existing sparse mountains are compatible with S1's geographic description. Their
  exact positions/heights remain illustrative, not surveyed Ahmakiq terrain.
- No source here establishes a Dragonfly liquid-to-liquid shell-and-tube design.
  Retain the clearly separated hypothetical exchanger study.
- Keep 2024 CAD imagery, 2025 test articles and 2026 flight integration distinct.
  A visible older blade configuration must not silently override newer rotor research.
- Do not identify unseen connectors, assign flight wiring functions to laboratory
  leads, or interpret the illustrated payload colors as temperatures.

## Saved model references

See [asset record and credits](apl-spacecraft-models/README.md). Both media files have
been extracted from their webpage context without website chrome. Original rendered
backgrounds remain: the payload image has translucent structure which a simple
background key would damage. They are not transparent 3D assets or recovered meshes.

No app implementation was performed in this review. Research documents and APL
reference media are included in the subsequent owner-requested GitHub push.
