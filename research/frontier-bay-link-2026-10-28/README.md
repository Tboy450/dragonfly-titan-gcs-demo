# Part13 — existing bay lead, external mating example

Codex (OpenAI), October28,2026. Continue supported connections after blower fit.
The blower electrical gate remains open: public supplier/Honeybee material does
not establish flight motor exits, controller ports or pinouts. No blower wire added.

## Sources / explicit limits

- Reuse [real NASA/APL Frontier photo](../frontier-radio-2026-10-13/nasa-apl-frontier-radio.jpg),
  credit Johns Hopkins APL; [NASA source](https://science.nasa.gov/image-detail/amf-48b4901b-44b0-4c89-802b-0c615842aa09/).
  Rechecked live. J22 is legible, but the picture establishes neither this branch's
  function nor actual Dragonfly flight mating. Do not label it a power/data port
  assignment. No pinout, voltage or contact pattern reconstructed.
- Reuse [NASA harness workmanship pages29–31](../sources/nasa-harness-workmanship/README.md)
  for general wire dress/backshell reasoning, not a Dragonfly cable specification
  or qualification. Exact cable construction and rated bends remain unknown.
- [Blue Origin's current capabilities](https://www.blueorigin.com/exploration-systems)
  and [DrACO scope](https://www.blueorigin.com/news/dragonfly-selected-nasa-new-frontiers-mission)
  confirm dedicated avionics/software, not installed electrical interfaces. A search
  candidate presentation marked proprietary/not for redistribution was not copied,
  used as geometry or added to the app. No unrestricted flight ICD found.

Original photographs and existing real/CAD/model comparison are reused, not copied
again. This is a connection pass; the radio itself and RF geometry stay exact.

## Model change and fit

`frontier-bay-interface.mjs` defines an EST external mating shell, flange, hollow
backshell and strain relief in front of the existing photo-labeled J22 insert.
The port choice, all new dimensions, finish and floor support are illustrative.
The existing receptacle is unchanged, with a blind mating plane and no invented pins.

Only `bay/radio` is refitted. Its two original trunk/junction controls stay exact.
The original14 mm estimated bundle could not turn into this small face without
crowding/folding. It becomes one **6 mm estimated lead**, not an asserted flight
cable size. Terminal controls align normally through the relief/backshell bore;
one fitted local cushion/strap/support replaces its old generic floor pad.
The original trunk, other branches, route radii and all radio/RF meshes stay exact.
Basic curvature/clearance guards establish a drawable example, not cable life,
minimum rated bend radius, strain, temperature performance or flight qualification.

Single shared context root `radio-harness-link` serves Radio13 and Bay32; no
duplicate wire or extra top-level number. Whole radio/Connector-face focus shows
the link; RF-only and isolated camera-route views omit it. Harnesses, Interfaces
and Mounts hide independently. Part5's grouping/links are retained.

Endpoint status becomes **geometric-contact-only** with an explicit model seat.
This does not confirm actual circuit continuity or flight connector identity.

## Verification / recovery / next

Six new tests cover archived-route/equipment preservation, actual J22 face/rib
fit, bore/normal approach/basic fold guard, full-model swept clearance, support
seating, shared isolation/masks, stable32 inspection numbers and endpoint status.
Prior preservation suites defer only the explicitly tested radio change.
Measurements and actual app samples are saved here before publication.

761 full tests pass. Desktop and390px phone:33 options/32 list IDs, Open interior,
current6 mm/unconfirmed-J22 disclosure, no horizontal overflow or console errors.
Installed/close/Thermal/RF-only/phone samples saved. RF-only omits the bay branch;
the whole radio shows it. Real source photo and `connection-detail.png` queued in
right file panel. `measurements.json` is reproducible with `node .../audit.mjs`.

## Publication receipt

Implementation64a4cfe, integrated public release **89b4899**.
[Pages40815721341](https://github.com/Tboy450/dragonfly-titan-gcs-demo/actions/runs/40815721341)
succeeded including CI. **766 combined tests** pass after merging32db4d8;
incoming shared-project files preserved unchanged. Live part13,6 mm/unconfirmed
J22 disclosure,32 list IDs/33 options, Open interior and no overflow/errors checked.
`public.png`/`public-checks.json` save the actual deployed result. Archive tag
pushed. Preview stopped, viewport restored, public radio inspection retained.
Photo and new connection sample queued in right file panel. Next unresolved items
remain source-gated: actual radio mating/circuit, FEB/IMU and blower/diverter leads.

[Exact before files/tag](../../archive/frontier-bay-link-2026-10-28/README.md).
Rejected draft dimensions/routes are retained there. All new installation details
remain EST. Next: exact radio flight circuit/connector assignment, FEB/IMU leads
and blower/diverter electrical interfaces; do not invent missing circuitry.
No Assets Lab, Swarmfall, private outreach or saved mission changes.
