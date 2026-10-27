# DrACO roller carriage and spherical lead nut

Codex (OpenAI), October 27, 2026. Baseline 6a3d71f; recovery tag
`archive/drill-carriage-2026-10-27`. One mechanical subpass, not a full drill rebuild.

## Evidence

[Adams, Dottinger and Corrigan / Honeybee, AMS2024](../sources/draco-ams2024/README.md):
printed 192 fig.2 is a real EM1 feed-stage photograph. Printed 195 fig.6 shows real
ETU/EM1 spherical-nut hardware beside the different EM2 universal-style nut.
Printed 198 fig.10 gives roller sections; printed 199 fig.11 is a **CAD/engineering
illustration**, not a real roller photograph. Original pages saved once in the shared
source packet. Reuse the real EM1 assembly for exterior context and the drawing for
arrangement; no generated images or assumed flight CAD.

[PUB] EM1 has six crossed crowned cam rollers in a V-grooved guide and a spherical
lead nut. EM2 has eight rollers and a different nut mount; do not combine those
features and call the result EM1 or current flight hardware.

[EST] Every fitted guide/carriage dimension, bearing diameter, bridge, supports,
studs/fasteners, nut/pocket profile and finish here. The model retains its 30 × 16 mm
guide envelope and 130 mm travel. Development travel of 160/300 mm does not identify
the current flight mechanism. No source drawing is treated as a dimensional flight
installation. Brown nut finish is illustrative DFL, not the bare bronze shown before
coating in fig.6.

## Changes and limits

- Replace flat groove stripes with a V-notched guide cross-section.
- Six crowned roller exteriors, crossed axes, studs and supported rear bridge per
  drill. Three stud caps carry eccentric-adjustment metadata; no actual eccentric
  offset, preload adjustment, needle internals or bearing friction is simulated.
- Replace the solid nut box with an open-bore spherical nut and separate pocket,
  ears and fasteners. Keep the screw centered; radial modeled bore clearance is
  1 mm, an illustrative clearance rather than flight machining tolerance.
- Rollers rotate in the rolling direction as the carriage feeds, using the estimated
  4.5 mm radius. This geometric illustration does not solve loads, friction, wear,
  galling, thermal contraction or self-alignment dynamics.
- Carriage supports are in Mounts; nut/pocket in Interfaces. Existing bridge remains
  with the head casing. Covers independently hides sleeves and drive covers.
- Preserve the complete head/bit outside replaced adapter/nut pieces, all pneumatic
  routes, all moving cable geometry, both sleeves and their fittings, drive covers,
  130 mm travel and bit depth. No additional numbered parts or focus targets.
- The upper drive universal joint is still only a covered envelope. Its forks,
  gears, helical screw threads, load path and current flight details remain open.

## Verification

675 tests pass. Six new tests cover exact archived preservation outside the specific
mechanical allowlist; 41 feed positions with roller/guide flank contact and no guide
penetration; hollow nut/seat and supported mounts; reversible rolling transforms,
correct contact-velocity direction and geometry reuse; independent layers; and
installed-model mesh screening through 13 sampling poses. No external surfaces
were within the 0.15 mm narrow-phase search in that last screen after reducing a
stud cap that touched the retained head. Existing cable, bellows and pipe checks pass.
This is sampled geometric validation, not a complete collision or structural solver.

Actual browser checks: Internal, cover hide/restore, Thermal/starboard and 390px
phone. Desktop client/scroll 1265/1265; phone 375/375; 24 numbered components, two
drill focuses and no browser errors. Local sampling was exercised and paused during
late analysis; do not claim that screenshot is at maximum feed. Installed-model tests
check the full stroke. Samples, browser JSON and measurements are saved here.

`real-cad-model-comparison.jpg` compares the real spherical joint photo, the clearly
labeled roller drawing and the actual meshes in a standalone inspection render.
`preview.html` imports the same drill builder and shows only the guide, screw and
carriage; head, covers and unrelated equipment are intentionally hidden to expose the
mechanism. No substitute geometry or painted-in detail. Full installed-app and
isolated-render screenshots are retained; this preview is research-only.

## Handoff

Next: upper drive coupling/gearbox exterior and support/load-path reconciliation,
starting from real fig.2. Preserve the completed sleeves, carriage and leads.
Do not invent hidden gears or a flight motor from an enclosure photo. If no stronger
evidence is public, document that limit and move to the identified feed/sensor wiring
gap rather than fabricate exact internals. Remote controller routes, full electrical
networks, current flight stroke and the unidentified old cylinder/cone remain open.
No Assets Lab, Swarmfall, saves, unrelated projects or Git cleanup touched.

Publication receipt will be added after the deployed build is verified.
