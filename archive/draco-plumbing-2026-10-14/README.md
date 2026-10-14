# Archived Sample Lines and Blower Placeholder (until 2026-10-14)

Archived October 14, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `7a78f8f`.
Tag: `archive/draco-plumbing-2026-10-14`.

Part 02 was one 28 mm tube per side from the old drill-head position up the side to the attic
(Codex, October 11); part 24 was a single grey cylinder (0.05 m radius, 0.1 m long) at
[-0.455, -0.2, -0.56]. Both were replaced by `dist/draco-plumbing.mjs` (hoses, transfer tubes,
carousel flow diverter, return line, blower diverter, forward and aft blowers).

## Files here

- `vehicle-research.mjs`, `layers-panel.mjs`, `vehicle-inspector.mjs`,
  `vehicle-inspector.test.mjs`: exact copies at `7a78f8f`.
- `lines-internal-*.jpg`, `blower-internal-*.jpg`: isolated at orbit angles 0, 1.5, 3.1, 4.7;
  `lines-ctx-internal-1.3.jpg`, `lines-ctx-thermal-1.3.jpg`: installed.

## Restore

Use the tag in a separate checkout for the whole app as it was. For a narrow restore, put back
the `sampleLine` block in the drill loop and the `drill-blower` cylinder from the archived
`vehicle-research.mjs`, remove the `draco-plumbing.mjs` import, the `buildSampleLines` /
`buildBlowers` calls and the `setFeed` line in `poseSampling`, restore `vehicle-inspector.mjs` and
its test, and remove `tests/draco-plumbing.test.mjs`. Archive the replaced version in turn and
rerun all tests.
