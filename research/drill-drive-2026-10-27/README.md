# DrACO upper drive: exterior fit and mounting relief

Codex (OpenAI), October 27, 2026. Baseline 0e5ca42; recovery tag
`archive/drill-drive-2026-10-27`. One upper-drive subpass.

## Evidence and boundary

Reuse the real EM1 photograph in [AMS2024 printed192 fig.2](../sources/draco-ams2024/README.md):
covered actuator, gearbox, covered universal joint and feed mechanism. Newly saved
printed193 explains the top universal joint, self-aligning nut and free lower screw
end. The deeper public-source search returned the same primary paper and previously
recorded prototype material, not an uncovered flight gearbox or current motor drawing.
No CGI appearance reference or generated image is used.

The real joint has two rotational degrees of freedom. Its forks, bearings and gears
are not visible in fig.2. Do not represent the simple connection envelope exposed by
the simulator's Covers switch as the real joint or as a rigid substitute in a physics
solver. The source establishes the mechanism family, not these fitted dimensions,
flight mount geometry, bolt pattern or structural strength.

## Reproduced problems and changes

- Archived geometry leaves an 80.000 mm gap between the top of the drawn screw and
  the gearbox bottom when Covers is hidden. Add a neutral output continuity envelope
  across that interval, an annular output flange/cover and lower annular adapter
  meeting the existing upper bellows collar. It is **not** a joint reconstruction.
- Upper body mounting return crosses the screw. Cut its forward depth from 90 to
  54 mm, preserving the rear edge, x/y, body reach and guide contact. Its front is
  now z=29 mm local, leaving 12 mm to the old screw envelope. Lower mount unchanged.
- Enlarge the fitted drive foot and add a motor shoe and input neck/envelope.
  Foot meets guide/body return, shoe meets retained motor, and input meets gearbox.
  These are geometric contacts; actual flight load paths remain unverified.
- Provide a real notch in the bottom cover and a real opening in its top panel,
  rather than passing the foot/neck through closed sheets. Four side panels remain
  exact; outer cover envelope, old motor and gearbox remain exact.
- Add estimated external flange/gearbox fasteners. No flight bolt-count claim.
  The cover, interfaces and mounting shoe remain separately hideable.

All new dimensions, profiles, supports, clearances and finishes are [EST]. Bore/
shaft radial gap is 2 mm in the drawing, not a machining tolerance. The retained
shaft diameter is 8 mm [EST]; the paper lists EM1 1/4-inch ACME and alternate EM2
5/16-inch threads. This pass does not turn the full simulator into dimensionally
exact EM1 hardware. Reconcile screw/nut/bellows/drive together in a future dimensional
pass, not by changing one isolated thread diameter.

Entire roller carriage, nut/pocket, head/bit, bellows and fittings, complete moving
lead paths and sample plumbing remain exact. Keep 130 mm travel and existing bit
depth. The lower fitting retains its open bore; no lower screw bearing is added.
No controller, sensor, gear train, joint dynamics, friction or strength solver added.

## Verification

682 tests pass. Seven new regressions:

1. Exact archive comparison outside a specific drive allowlist at three feed poses.
2. Reproduce old gap/crossing; prove upper relief is a subset and lower mount exact.
3. Four cover sides exact; ray tests pass through the new bottom notch/top opening
   and hit the archived closed panels.
4. Explicit motor-foot-shoe/input/output/collar contact chain.
5. Open annular shaft corridor and free lower end.
6. Independent Covers/Interfaces/Mounts.
7. Installed-model triangle/vertex proximity screens through 13 actual sampling
   poses, with only specific intended seating pairs excluded. 605,696 narrow-phase
   candidates checked. This sampled screen is not a universal collision solver.

Earlier full-stroke, cable, bellows, carriage and strict pneumatic tests still pass.
Their preservation filters defer only listed drive meshes to the new exact archive
suite; no broad geometry exemption.

Browser: actual installed Internal, cover hide/restore, Thermal/starboard and 390px
phone. Desktop 1265/1265 px; phone 375/375; 24 numbered parts, two drill focuses and
no browser errors. Screenshots and JSON saved. No existing public mission reset.
`preview.html` renders actual simulator meshes in isolation for a usable detail
sample; unrelated hardware is intentionally omitted. Comparison shows the original
real photograph plus Covers on/off samples, not an invented internal CAD.

## Handoff

Next: audit fixed Z-feed actuator electrical exit and local retention using the real
EM1 photo/related prototype evidence. Distinguish ground-test cables from flight
harnesses; do not assign a controller, pinout or sensor type without a source.
Then decide whether an explicitly estimated local lead is supported. Sensors and
remote/body-to-controller continuation remain open.

Hidden drive mechanics and actual flight mount/load paths remain unresolved; don't
keep adding speculative gear/joint detail just to fill context. Preserve this drive,
carriage, sleeves and head leads. No Assets Lab, Swarmfall, saves or Git cleanup work.

## Publication receipt

Drill implementation commit **6090dc7**; integrated release
**badbec29114070088602c49ec6613fc019234f04**, October 27, 2026.
[Open the public simulator](https://tboy450.github.io/dragonfly-titan-gcs-demo/?v=badbec2).
Concurrent shared-branch work through 9a0affa was incorporated unchanged; the only
conflict was the shared changelog, resolved by retaining both sets of entries.
No Swarmfall code or data was edited by this pass. All **703 combined tests** pass.
Pages **40591034163** succeeded. Verified working live build, new drive disclosure,
24 numbered parts/two drill targets, 1265/1265px and zero browser errors.
`public-port.png` and `public-checks.json` record it. Recovery tag pushed; local
preview stopped, viewport restored, one project tab kept on the public app.
Receipt signed Codex (OpenAI).
