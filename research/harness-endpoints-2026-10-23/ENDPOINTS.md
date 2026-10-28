# Modeled Bay Harness Endpoint Register

Codex (OpenAI), October 23, 2026.

Asset: `main-harness-2026-10-27-meb-interface`. World-space tube endpoints and sampled peer centerlines. <=1 mm surface gap means geometric contact only, never verified electrical mating.

construction metres: +x starboard, +y up, +z aft

All routes are estimates. Distances concern this model only, not flight wiring.

| Stable route | Status | Closest explicit stub gap, center / surface (mm) | Missing or unverified |
|---|---|---|---|
| bay/iem | geometric-contact-only | 3.61 / 0.00 | Electrical identity, circuit continuity and actual mating hardware remain unverified. |
| bay/power-unit-2 | geometric-contact-only | 3.74 / 0.00 | Electrical identity, circuit continuity and actual mating hardware remain unverified. |
| bay/power-unit-1 | geometric-contact-only | 3.74 / 0.00 | Electrical identity, circuit continuity and actual mating hardware remain unverified. |
| bay/battery | geometric-contact-only | 6.16 / 0.00 | Electrical identity, circuit continuity and actual mating hardware remain unverified. |
| bay/radio | mating-interface-unresolved | No assigned device stub | Branch approaches radio; no assigned power/data mating port or cable lead established. |
| bay/rde-1 | geometric-contact-only | 3.61 / 0.00 | Electrical identity, circuit continuity and actual mating hardware remain unverified. |
| bay/rde-2 | geometric-contact-only | 3.61 / 0.00 | Electrical identity, circuit continuity and actual mating hardware remain unverified. |
| bay/navigation-feb-imu | mating-interface-unresolved | No assigned device stub | Branch approaches support area; separate FEB/MIMU mating interfaces and routes remain unmodeled. |
| bay/navigation-meb | geometric-contact-only | 0.00 / 0.00 | Electrical identity, circuit continuity and actual mating hardware remain unverified. |
| bay/starboard-down-camera | geometric-contact-only | 0.00 / 0.00 | Electrical identity, circuit continuity and actual mating hardware remain unverified. |
| bay/microscopic-camera | geometric-contact-only | 0.00 / 0.00 | Electrical identity, circuit continuity and actual mating hardware remain unverified. |
| bay/led-array | geometric-contact-only | 0.00 / 0.00 | Electrical identity, circuit continuity and actual mating hardware remain unverified. |
| bay/port-down-camera | geometric-contact-only | 0.00 / 0.00 | Electrical identity, circuit continuity and actual mating hardware remain unverified. |
| bay/iem-to-power-unit-1 | network-link-only | No assigned device stub | Appearance-only network link; not an identified device-to-device circuit. |
| bay/power-unit-2-to-radio | network-link-only | No assigned device stub | Appearance-only network link; not an identified device-to-device circuit. |
| bay/twta-power-supply | geometric-contact-only | 6.08 / 0.00 | Electrical identity, circuit continuity and actual mating hardware remain unverified. |
| bay/antenna-gimbal-drive | geometric-contact-only | 6.71 / 0.00 | Electrical identity, circuit continuity and actual mating hardware remain unverified. |
| bay/circulation-fans | mating-interface-unresolved | No assigned device stub | Branch approaches fan flange, not a modeled electrical connector; fan split/controller leads absent. |
| bay/iem-to-radio | network-link-only | No assigned device stub | Appearance-only network link; not an identified device-to-device circuit. |
| bay/power-unit-1-to-rde-1 | network-link-only | No assigned device stub | Appearance-only network link; not an identified device-to-device circuit. |

## Missing Branches

None among this register's explicit target stubs. This does not mean all harness families are present.

Full coordinates, individual candidate stubs, approximate lengths and peer attachments: `endpoints.json`.

## Still Outside This Initial Register

- Attic instrument/DPU network
- Front navigation cameras and separate IMU leads
- RDE-to-arm/motor routes
- RF/HGA moving continuity
- Sensor controller destinations
- Actuator leads, bonds and feedthrough supports

Parallel appearance strands have no assigned circuit endpoints. Network proximity is not a splice.
Floor clamps/lacing exist; wall anchoring, backshells, strain relief and actual bend limits remain open.
