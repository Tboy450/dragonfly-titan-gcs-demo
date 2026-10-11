# Vehicle inspection update: October 11, 2026

Signed: Codex (OpenAI GPT-6). First milestone approved by the owner after the October 10
source review: reference viewer and model refinements, with live component details.

## Evidence used

- [NASA printable Dragonfly](https://science.nasa.gov/3d-resources/dragonfly/), credited
  to Gary Allen Backus / Backus Creative Imaging. The Assembly Guide was rendered and
  visually inspected: pp1-3 show the forward enclosure, flat runners, shaped supports,
  body-side DrACO and antenna mount. The guide identifies a 1:23.5 printable model.
  Its PDF remains in the local review folder and is not committed. STL/3MF meshes were
  not imported or treated as certified flight CAD.
- [APL spacecraft/payload page](https://dragonfly.jhuapl.edu/What-Is-Dragonfly/Spacecraft-and-Science-Payload.php),
  with the preserved `FullPayload.png`, first CAD frame and multi-angle sheet.
  Visual comparisons support the front science bay / lower central bay / aft generator
  arrangement, rotor arm attachments and sample plumbing. Video filename says 2024;
  the static image has no stated revision date.
- [NASA March 10, 2026 integration update](https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/)
  names the IEM and two PSUs. Their exact placement is not established by that text.
- [NASA April 23, 2026 integration update](https://science.nasa.gov/blogs/dragonfly/2026/04/23/nasas-dragonfly-rotorcraft-gets-decked-out-tested/)
  shows the sample carousel and describes DraMS integration.
- [NASA: Playing Lacrosse on Titan](https://science.nasa.gov/science-research/science-enabling-technology/technology-highlights/playing-lacrosse-on-titan/)
  describes two redundant drills and blowers, pneumatic transfer and a carousel with
  dozens of cups. This is a 2020 architecture description, not a claim about final cup count.
- [NASA spacecraft and instruments](https://science.nasa.gov/mission/dragonfly/spacecraft-and-instruments/)
  supplies the envelope and payload/radio roles.
- [NASA multimedia](https://science.nasa.gov/mission/dragonfly/multimedia/) also publishes
  the inside-out CAD and X-ray animations with NASA/Johns Hopkins APL credit. Its faster CAD copy:
  `https://assets.science.nasa.gov/content/dam/science/missions/dragonfly/dragonfly-videos/Dragonfly_2024_RotatingCADmodel_ver3.mp4`.

## Implemented

- Smooth curved forward attic over the existing long low fuselage; detailed front apertures.
- Four flanged arm roots, slimmer outer arms and distinct upper/lower motor housings on each
  coaxial mast. Rotor diameter, blade count and rotation logic retain their existing values.
- Broad flat runners and shaped support legs, preserving the collision/contact footprint.
- Vertical body-side DrACO assemblies and illustrative transfer-tube routes, replacing the
  small skid-mounted drill nubs. Stowed bits clear the runner contact plane.
- Taller pan-shaped sample carousel. The 24 drawn cups are explicitly illustrative.
- IEM, two PSUs and Frontier radio replace the generic avionics group. They use the existing
  bay-air temperature estimate; no independent component temperatures or currents are invented.
- Selected parts show relevant existing energy, radio, thermal or sampling state and linked sources.
  Live temperatures update in place so a focused component button is not replaced.
- On-demand reference viewer: complete payload image, playable CAD movie, source/design labels,
  attribution and printable-model links. Playback stops when closed, hidden or leaving Mission.
  Keyboard handling does not send flight commands from reference controls.

## Media handling

Browser requests to the APL image/movie were reset during verification, although command-line
HEAD requests succeeded. Small local derivatives of the already preserved originals provide
reliable viewing: 152,294-byte WebP cutaway, 22,964-byte first-frame poster, and 4,124,170-byte
960 x 540 H.264 movie. No recoloring, background removal, cropping or generated detail.
Original files remain unchanged; credit and source links remain visible. The files retain
their owners' rights; no new permissive license has been established. See
[asset credits](../dist/assets/vehicle-references/README.md) and the reproducible preparation script.

## Limits and remaining work

All new detail dimensions, component positions and tube routes are visual approximations [EST].
The procedural model's measured envelope is 3.85 x 3.94 x 1.74 m, within the existing tolerances
around the published 3.85 x 3.85 x 1.75 m. Design epochs are labeled, not merged into an assertion
of final flight hardware accuracy. No energy, thermal, flight or camera constants changed.

Animated drilling, pneumatic transfer, carousel indexing and DraMS stages remain the next
proposed milestone. This update reads the existing combined sampling job without changing
its timing, power accounting, mission progress or saved-state schema.

## Verification

Desktop/phone Playwright checks cover rendered vehicle pixels and rotor movement in all
three layers, canvas framing, no horizontal overflow, component selection/live updates,
keyboard focus, lazy asset loading, actual image/video decoding, playback pause, error/retry
recovery and the original-model fallback. Previous model code and images are preserved in
[`archive/vehicle-inspection-2026-10-11`](../archive/vehicle-inspection-2026-10-11/README.md).
