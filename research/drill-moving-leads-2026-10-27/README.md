# Drill moving motor leads

Codex (OpenAI), October27,2026. Recovery baselinec99f0dc, tag
`archive/drill-moving-leads-2026-10-27`.

## Evidence and limits

Real DrACO source: [AMS2024 EM1 photo, printed192 fig.2](../sources/draco-ams2024/README.md).
It shows actuator packaging and braided leads but not complete flight routing.
Related real hardware: [TRIDENT/RP15 flex harness comparison](../sources/trident-ams2018/README.md).
TRIDENT uses flat flex; this does not establish DrACO's construction. Existing
[Costa development photos](../drills-2026-10-13/README.md) and saved2022 CAD figure
are reused. CAD supports retained mechanical arrangement, not cable appearance.
General [NASA harness workmanship](../sources/nasa-harness-workmanship/README.md)
supports strain relief/support reasoning. No table row is asserted applicable to
an unidentified flight cable. No new generated source imagery.

## Change

Previously each entire short lead moved with the carriage; neither had a stationary
retention end. Two replacement lead examples per drill retain the motor-cap endpoints
and6 mm drawn diameters. Fixed ends now stop in open retention rings supported from
the existing upper body mount. They are not invented controller connectors. The old
far ends moved with the head (one also ended in the fixed Z-motor envelope); they
were not useful flight mating points to preserve.

Each curve has two vertical legs and a translating semicircle. Arc height changes
by half the feed, keeping total length and tangent continuity constant. Estimated
lengths341.2/415.2 mm and bend radii56.1/41.4 mm; no material, fatigue or standard
compliance claim. Supports, boots, clamps and routing remain EST. Solid support tabs
start behind the retaining ring, leaving the wire bore open. Both ends follow their
own mechanical frame correctly. Four cable meshes reuse position/normal buffers
through animation rather than allocating replacement geometry every frame.

All43 non-lead mechanical meshes per drill, hose/pipe network and flight/science
rules remain exact. Each drill now has51 meshes including two leads and six fitting
examples. Harnesses hides leads, Mounts hides supports, Interfaces hides motor boots.
The existing port/starboard focuses and24 numbered parts remain. Renderer calls the
builder's `setFeed`; demonstration still operates port only, starboard stays stowed.

## Verification

662 tests pass (`--test-concurrency=2` reduces local parallel memory use).
Seven new tests cover exact mechanical/motor-end preservation,41 stroke positions,
constant length, tangent continuity, support contacts, independent masks, real
vehicle pose integration, installed mesh-triangle screens and cable pairs. Repeated
motion retains geometry/buffer identity and outward triangle winding. Full-model
geometry fixture mocks decorative canvas paint only; real browser checks cover rendering.
Earlier audit/return tests explicitly defer changed lead/fitting meshes to this suite,
while retaining their original mechanism and pneumatic-continuity guards.

Desktop Internal/Thermal and390px phone samples saved: `port-stowed.png`,
`port-extended.png`, `phone-port-extended.png`, `thermal-starboard.png`.
Local disposable sampling paused at10.0415 s with port extended; no existing user
mission was reset.24 parts, two drill targets,1265/1265px desktop and375/375px phone,
zero browser errors. `browser-checks.json` and `measurements.json` record results.
Source comparison uses real EM1, prior CAD and actual model sample with explicit labels.
Published **b6fb179f766f1ff9ba63b4aab104d43133f6b506**, October27,2026.
[Public app](https://tboy450.github.io/dragonfly-titan-gcs-demo/?v=b6fb179).
Pages40481602061 succeeded including662 tests. Live build, constant-length and
unresolved-controller disclosures,24 numbered parts/two drill targets,1265/1265px
and zero browser errors verified. `public-port.png` and `public-checks.json` saved.
Recovery tag pushed. Temporary preview server/tab stopped; viewport restored.
Receipt signed Codex (OpenAI). Owner-requested handoff is below and in the checklist.

## Next

Reconcile the retained2022 drill/feed illustration with2024 real EM1/ETU evidence:
actuator/gearbox housing, guide/roller arrangement and paired dust bellows. Save
separate geometry/stroke decisions; do not blindly enlarge travel from130 to160/300 mm,
which would change bit/ground depth and hose/wire envelope. Distinguish bellows-film
test values from wire construction. Keep this wiring pass intact unless evidence
requires changes, and recheck the entire stroke after mechanical updates.

Still open: fixed-end continuations to the body/controller, feed-motor/sensor leads,
blower/diverter wiring, actual connector families, guards and qualified cryogenic
flex life. No complete electrical network, flight wiring or thermal-conduction solver.
No Assets Lab, Swarmfall, saves or Git cleanup changes.
