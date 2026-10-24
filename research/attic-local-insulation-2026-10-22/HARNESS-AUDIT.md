# Harness coverage register

Codex, October22-23,2026. Initial inventory, not a complete flight wiring diagram.
The owner specifically asked whether whole harnesses may be missing.

October23 continuation: [measured initial bay register](../harness-endpoints-2026-10-23/README.md)
now closes the modeled lower-camera gaps and supplies the omitted port-camera route as
an estimate. Historical missing-port notes below describe the pre-pass state. Attic and
other global coverage remain open; contact is not verified electrical continuity.

Existing `main-harness.mjs` has a floor trunk, branches, wall risers, parallel strands,
cross-bay bundles, ties and clamps. RDE service loops are already done. NASA/APL's saved
wiring photo supports appearance, not circuit topology. Do not duplicate those runs.

| Family | Existing representation | Still open |
|---|---|---|
| Warm bay: IEM, PSUs, battery, radio | Main branches and component stubs | Exact mating endpoints, slack, supports, destinations and full circuit identity |
| Attic: DraMS, carousel, Wonderwall | Local photo-detail wiring and sample paths | Main-harness explicitly omits an attic trunk; audit local leads before adding that network |
| Navigation / front cameras | Navigation branches and local connectors | FEB/MEB/MIMU and camera routing, tie points and pass-throughs |
| Lower cameras / LED | Local leads, wall feedthroughs, selected branches | Port Down Camera branch omitted behind PSU1; verify all camera endpoints |
| RDE / arms / motors | Two RDE units, connector loops, floor branches | Root-to-motor power/data, stationary arm routes and shoulder crossings |
| RF / HGA | Coax, TWTA/EPC, waveguide and gimbal lead | Continuity, moving slack, deck interfaces and separate power/data/RF identities |
| Sensors | Local20/21 leads, EFIELD preamps, METHAN fiber entry | Real flight count/type, destinations, warm/cold feedthroughs and DPU/controller interfaces |
| Thermal / sample systems | Fans/ducts/flaps and DrACO transport | Electrical actuator leads, mounts, seals, unions and supports; air/sample plumbing is not wiring |

For every route record stable ID, owner, source/figure/credit, confidence, medium, start/end
transforms, mating geometry, modeled extent, missing segment and supports. Flag dangling
stubs without inventing pinouts. Check actual3D continuity, new-to-new intersections,
optical/gimbal/rotor motion and masks/restore before marking a family complete.

Next: endpoint register first, then attic wiring and the port Down Camera branch, one
supported family at a time. Clips, brackets, bonding straps, strain reliefs and feedthroughs
also need auditing. Cable count, redundancy, shielding and flight topology remain unknown
unless a public source establishes them. This pass adds no wires.
