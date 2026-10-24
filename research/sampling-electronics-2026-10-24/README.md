# Sampling Electronics: Functional Evidence And Physical Gaps

Codex (OpenAI), October24,2026. Source gate after the local carousel-drive package.
No equipment, wire geometry, physics coefficients or science timing changed in this pass.

## Accepted Primary Evidence

| Source | Supported use | Does not establish |
|---|---|---|
| [NASA/APL, March12,2026 integration](https://www.jhuapl.edu/news/news-releases/260312-dragonfly-integration-begins) | IEM core spacecraft avionics; PSUs switch instrument/system power | Attic connector assignments or routing |
| [Honeybee / Blue Origin, January29,2021](https://www.blueorigin.com/news/dragonfly-selected-nasa-new-frontiers-mission) | DrACO scope includes hardware, avionics and flight software | A specific current controller enclosure or installation |
| [Bae/Steinfeld, NASA GSFC, ICES2024-103](https://ntrs.nasa.gov/citations/20240005590), p2 Fig1 | DraMS main electronics box in warm instrument schematic | Electrical harness, motor controller or exact MEB housing |
| [NASA GSFC ETD laser electronics](https://etd.gsfc.nasa.gov/capabilities/capabilities-listing/high-voltage-instrument-electrical-systems/) | Identified DraMS laser-electronics engineering model and its functional blocks | Flight configuration, voltage/pinout adoption or installed location |
| [Barfknecht et al., NASA GSFC/Aerodyne, SciTech2024](https://ntrs.nasa.gov/citations/20230017316), p3 Fig2 | Warm carousel actuators under baseplate, cold sample region above | Motor identities or external electrical mating |

Saved `ices2024-p02.png` is the full NASA paper page rendered with Poppler, credited
Daniel G. Bae and David E. Steinfeld, NASA GSFC. Fig1 is schematic/CAD, not a hardware
photograph. The PDF was downloaded temporarily and removed after rendering; this research
record retains its page image and official link. Do not transfer values from this figure into flight
code: it describes a thermal study. In particular, its printed kelvin/Celsius pairing
for the sample threshold is inconsistent; no temperature conversion or solver is changed.

`nasa-leu-em-page.png` saves the actual NASA page with its real open electronics unit,
waveforms and explicit engineering-model caption. Credit: NASA Goddard Engineering and
Technology Directorate. Page last updated February17,2026. This is useful future visual
evidence, **not** a dimensioned flight drawing or permission to infer hidden PCB contents.
Existing real IEM/PSU photographs and carousel references remain in their earlier source
folders; no duplicate ground harness or new motor model is derived here.

## Gate Outcome

The reviewed material establishes separate roles, not a flight cable/interface drawing.
Do not wire all sample equipment straight to the IEM as if DrACO avionics or DraMS local
electronics did not exist. DraMS MEB and Ocellus lidar MEB are different instrument units;
the shared abbreviation is not a shared enclosure. Exact mating locations, route, conductor
count, bus protocol, voltage, redundancy and warm/cold penetration construction stay open.

The current11-route model register is unchanged. Three local drive leads are not complete
controller circuits. No external attic trunk is added. PUB tags in the new data describe
documented roles, while all physical mating flags remain false/unresolved.

## App And Checks

`dist/sampling-connections.mjs`: six immutable role/coverage records and primary-source
links. `dist/ui/sampling-connections.mjs`: compact accessible definition-list renderer.
The existing Mission layer panel adds **Sampling electronics & connections**, collapsed
by default. Four focus icons open existing IEM, PSU, DraMS and carousel-drive targets.
Unmodeled DrACO avionics and LEU have no fake selectable geometry. Panel is hidden for
Exterior/original demo; all long text stays in the expandable section.

Browser checks: six rows/links, four correct focus actions, Internal/Thermal visibility,
Exterior/original-demo hiding, Pilot return and24 original numbered parts. Requested390px
mobile viewport has375px client/scroll widths and no horizontal overflow. Desktop/mobile
samples saved. Checking original-demo selection exposed a pre-existing false sentinel
passed into optional component metadata; it is now null. The archive retains the failed
check log; clean retest logs are bounded by a recorded start timestamp, with zero errors.
The dedicated regression evaluates the actual production lookup statement.

Archive baseline: [sampling-coverage-2026-10-24](../../archive/sampling-coverage-2026-10-24/README.md),
tag on08e0a6d. Final full suite: **576 tests pass, zero failures/skips**. No game files
changed.

## Publication Receipt

Build **c3b2199** (`c3b219910d7df9b98363026b815d6b5d679f569c`) published successfully
through Pages run **40109821169**, including its full test step. Normal public navigation
verified the stamped build, collapsed default, six rows/source links, all four correct
focus actions, original-demo hiding/switch-back,24 numbered parts and zero browser errors.
Evidence: `public-c3b2199-checks.json` and `public-c3b2199-coverage.png`. Recovery tag and
sources are pushed; local preview stopped. No new physical connection is implied.

## Leads Not Promoted To Flight Evidence

- A JHU thesis download returned403. Its search snippets are not treated as a reviewed
  connector drawing or source for protocol/redundancy claims.
- XINA GSE wiki describes development simulators and heritage electronics. It is not
  used to assign flight harness routes, debugging ports or protocols.
- A conference slide deck displayed proprietary/export/distribution markings. It is not
  copied into this public repository or used to reconstruct geometry.
- An alumni integration report and contract aggregators are leads, not dimensional/flight
  interface evidence. Existing public Honeybee/NASA primary sources suffice for roles.

## Next / Handoff

Source gate reviewed; physical attic trunk remains deferred, not silently checked off.
Next bounded installation pass: **IEM connector service-loop/support audit**, using the
already saved real integration photo and existing bay endpoint register. Keep its enclosure
and matched stub endpoints; check cable/support fit and mask access, not speculative attic
destinations. Do not repeat this same unsuccessful controller/flight-pinout search.

Future DrACO avionics and separate DraMS LEU exterior passes require their own identity,
scale/placement evidence (or explicit labeled approximation scope). Add them without
renumbering the original24 parts. No new controller should be hidden inside a generic box
merely to close a visual wire. Keep electrical, sample/gas, optical and thermal-air paths distinct.
