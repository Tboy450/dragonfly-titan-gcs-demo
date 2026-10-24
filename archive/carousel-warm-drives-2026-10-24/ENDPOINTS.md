# Attic Local-Line Register

Codex (OpenAI), October23,2026.

construction metres: +x starboard, +y up, +z aft

Eight local line examples only. Gas/sample labels describe modeled intent, not identification of specific flight tubing; unclassified routes intentionally remain unassigned. No electrical, flow, pressure or heat-leak solver.

| Stable model route | Owner | Modeled medium | Inspection layer | Flight mating |
|---|---|---|---|---|
| attic/drams-laser-interface-route | drams | unclassified (EST) | unclassified-lines | Unverified |
| attic/drams-gc-transfer-route | drams | unclassified (EST) | unclassified-lines | Unverified |
| attic/drams-local-harness | drams | electrical-example (EST) | harnesses | Unverified |
| attic/drams-wire-bundle | drams | electrical-example (EST) | harnesses | Unverified |
| attic/drams-valve-line-1 | drams | gas-sample-example (EST) | plumbing | Unverified |
| attic/drams-valve-line-2 | drams | gas-sample-example (EST) | plumbing | Unverified |
| attic/drams-valve-line-3 | drams | gas-sample-example (EST) | plumbing | Unverified |
| attic/carousel-white-wire | sample-carousel | unclassified (EST) | unclassified-lines | Unverified |

## Missing Networks / Interfaces

- **attic-main-trunk:** No attic trunk or documented bay-to-attic electrical mating interface in the current model.
- **drams-external-power-data:** Local enclosure example is not a complete external bus connection.
- **carousel-three-warm-drives:** Three modeled drive housings have no assigned electrical connector/leads.
- **warm-cold-electrical-feedthrough:** Wonderwall sample neck and existing slot do not establish an electrical feedthrough location or construction.

Full world-space endpoints, radii, lengths and all candidate model connector centers: `endpoints.json`.
A nearby connector is not an assigned circuit. The white carousel line remains unclassified; it is not copied into an assumed electrical trunk.
