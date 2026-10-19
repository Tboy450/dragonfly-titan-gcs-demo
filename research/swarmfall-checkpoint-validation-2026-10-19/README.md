# Swarmfall checkpoint validation — SAVE-01

Implemented October 19, 2026 — **Codex (OpenAI)**.

The resume validator now rejects malformed battle state before it reaches movement,
combat, drop release or rendering. It reads data without writing browser storage or
changing the surrounding campaign bank/conquests. Checkpoint version stays **3**;
real version-1/version-2 saves still migrate with stable mission identity and paid cargo.

## Checks added

- Required numeric counters, flags, IDs, capacity, cooldown and camera bounds; required
  statistics must exist, counts must be integers, and movement/formation values must be finite.
- Unique zones/squads/entities, valid zone/objective/home/raid references, known own-property
  unit/hazard/unlock types, compatible side/class/structure/conversion/health fields and a
  real squad for each player drone. Only Dragonfly may be marked landed.
- Complete numeric orders, including Hold; capture zones must exist. Attack/target IDs may
  refer to a previously issued, now-pruned unit. That is normal during combat and preserves
  existing attack-move/retargeting behavior.
- Pod clocks/release flags, wave identity and sibling agreement, cargo capacity/unlocks,
  stagger and non-overlapping global slot ranges. Missing paid siblings are rejected while
  their wave is retained. Earlier released backshells may legitimately expire before later
  siblings; the boundary is tested.
- Pending/hit strike fields and chronology; hazard type/event identity, phase, geometry,
  timing, wind, multipliers and eruption damage zones.
- Bounded collections, strings, aggregate text, JSON node/depth counts, no cycles/sparse
  arrays/nonfinite or non-JSON values. The preflight runs before legacy cloning/hashing so
  NaN cannot turn into a null field that bypasses validation.

These are recovery limits [EST], above normal campaign sizes: at most 5,000 units/squads,
150 retained pods, 64 zones, 256 strikes, 1,000 transient events, 200 log messages and 32
objectives/specials. They are not new gameplay caps. A future mode/schema must review the
limits and validation together.

## Evidence

- [325-test full run](test-results.txt) and [41 focused save/drop/victory tests](focused-test-results.txt).
  Eleven new regression tests cover malformed state and legal recovery exceptions.
- [332-test combined run](merged-test-results.txt): all tests pass after merging concurrent
  simulator MIMU/Ocellus work from `9e647ba`. Both changes and signed records are preserved.
- [Before/after report](validation-report.json): eight concrete invalid checkpoints were
  accepted by the archived production validator and are rejected now. Reproduce with
  `node research/swarmfall-checkpoint-validation-2026-10-19/compare-validators.mjs`.
- Each of seven real planets runs 220 simulated seconds, validating every second through
  active weather and, where supported, artillery/lightning. Existing tests also compare
  deterministic futures through terrain rebuilds and v1/v2 migration.
- Converted structures, stale attack IDs, the staggered backshell expiry boundary,
  partial releases, unchanged campaign data and one-frame-effect suppression are tested.
- [Previous validator and historical picture](../../archive/swarmfall-checkpoint-validation-2026-10-19/README.md)
  are retained under tag `archive/swarmfall-checkpoint-validation-2026-10-19`.

SAVE-01 is complete for current checkpoint schemas. **SAVE-02 remains open** for a visible
recovery explanation and backup/export workflow; invalid saves currently follow the existing
rejection path. SAVE-03 still needs browser storage-fault review. This work does not prove
historical purchase authenticity if every related field is edited together, or recover
entire missing waves after all their metadata has vanished.

Browser access was previously blocked in this chat and was not retried. This release has
automated rule/data checks, not new desktop/touch/device or visual acceptance. Lab/pod/victory
visual checks remain open; original assets and unfinished kit work are untouched.
