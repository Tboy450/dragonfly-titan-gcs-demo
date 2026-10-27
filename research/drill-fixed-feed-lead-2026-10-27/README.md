# Fixed feed-drive lead and numbered open-interior inspection

Codex (OpenAI), October 27, 2026. Baseline cf714c6; recovery tag
`archive/drill-fixed-feed-lead-2026-10-27`. Includes the owner's additional request
to number the component selector and default to the unobstructed interior.

## Evidence and limits

Reused original [real EM1 feed-stage photo](../sources/draco-ams2024/README.md),
AMS2024 printed192 fig.2. It shows electrical leads and loose plugs around the
covered actuator, but does not establish which lead serves which circuit or an
exact flight exit, connector, pinout, jacket or controller destination.
Rechecked [Tighe Costa's own Phase A account](https://www.tighecosta.com/draco)
and the already saved real brassboard photo in [the drill source packet](../drills-2026-10-13/README.md).
It explicitly describes EGSE integration. Do not copy that test cart's cables or
blue development plugs into the vehicle and call them flight equipment.

[Related TRIDENT hardware](../sources/trident-ams2018/README.md) remains a different
flat-flex implementation, not proof of DrACO wire type. Reuse [NASA workmanship
pages](../sources/nasa-harness-workmanship/README.md) only for general support/strain
relief reasoning. No standard-table row or cryogenic qualification is asserted.
No generated imagery or new CGI appearance reference.

## Model change

- One explicitly estimated fixed feed-drive **service-lead example per drill**,
  separate from the two existing moving head-lead examples. Not a flight cable
  count or a power-versus-encoder/sensor assignment.
- Local start on the provisional motor envelope, straight through a new actual rear
  panel opening/grommet, a tangent semicircular accommodation and a supported
  retention ring/tab at the stationary drive foot. No controller connector.
- [EST] 4 mm diameter, 38.5 mm bend radius, 164.951 mm centerline length, exit,
  grommet/relief, supports and finish. Radius is calculated from the chosen layout,
  not a published minimum for an identified cable. The ring's remote continuation
  remains unmodeled. The short motor-entry seat is an illustrative junction.
- Both ends stay on the fixed drill frame; the path and mesh buffers do not change
  with the independent carriage feed. No additional animation allocation.
- Rear panel alone changes; the other five cover panels, motor/gearbox, carriage,
  nut, bit, bellows and fittings, both moving head leads, all sample plumbing,
  130 mm stroke and bit depth remain exact.
- Harnesses hides the lead, Interfaces its exit grommet, Mounts its retention.
  Covers can expose the estimated motor exit. No extra numbered part or nested focus.

## Inspection UI requested during this pass

- Component selector uses the same ordered 24 labeled groups as the 3D markers and
  temperature list: `1. DrACO ...` through `24. DrACO blowers ...`.
  Extra assemblies stay unnumbered; selected-component hidden-count suffixes retain
  the same number. Names/values and all existing targets remain available.
- Fresh Mission starts Internal, with Open interior masks by default. Reset inspection
  returns to Open interior. All layers, custom masks, Exterior and Thermal remain
  available. An explicit saved Mission-layer choice still wins on reload.
- Arrival/Pilot behavior and mission saves are not changed. The local fresh-origin
  arrival was skipped during visual testing; no public mission was reset.

## Verification and samples

712 tests pass. Seven fixed-lead regressions cover exact archived preservation,
five untouched cover panels, stationary frame/buffer identity over 41 poses, exact
length/tangency, actual cover aperture versus old solid panel, support/bore clearance,
independent masks and installed-hardware/moving-lead proximity through 13 sampling
poses. 2,229,760 narrow-phase candidates checked; only the first 2.1 mm motor seat
is an explicit mating allowance. This is sampled fit validation, not full collision
or harness-life qualification.

Two additional UI tests compare all 24 selector numbers against the actual labeled
model order, preserve unnumbered assemblies/suffixes, and test fresh/reset Open
interior with explicit All/custom access still available. The older independent-mask
test explicitly selects All before exercising its unchanged all-visible semantics.

Actual browser checks: fresh Mission Internal/Open, 24 numbered options, IEM marker/
selector 12, saved Exterior restored, reset/default screenshots, port drill, Thermal
starboard and 390px phone. Desktop 1265/1265 and phone 375/375 px, no errors.
New inventory text explains the estimated fixed example and unresolved wiring.
`browser-checks.json`, measurements and full screenshots saved.

`preview.html` uses the actual simulator builder for an isolated rear-view sample;
head/unrelated equipment are intentionally omitted. Comparison reuses the original
real EM1 photo, one actual lead render and the requested numbered UI view. Source
pictures are not duplicated per wire or component.

## Handoff

Next: feed sensing and blower/diverter electrical **evidence audit**. Search for real
hardware and related Honeybee mechanisms, but do not infer a sensor type/count,
flight connector or remote circuit from an unidentified plug. Record confirmed
versus unresolved interfaces before adding more geometry. The new local lead is
not a completed feed-motor harness.

Exact flight exit/material, remote continuations, controller topology, hidden joint/
gear mechanics and a coupled screw/nut/bellows dimension review remain open.
Preserve this fixed lead, completed head leads, drive/carriage and masking choices.
No Assets Lab, Swarmfall data, unrelated saves or Git cleanup touched.

Publication receipt will follow live verification.
