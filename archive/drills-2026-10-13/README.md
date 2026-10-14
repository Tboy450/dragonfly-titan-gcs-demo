# Archived Drills (until 2026-10-13)

Archived October 13, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `16b1f10`.
Tag: `archive/drills-2026-10-13`.

Part 01 was Codex's simplified drill on each side (October 11): a grey box head (0.14 x 0.11 x
0.23 m) at y -0.23, a tapered feed tube, two struts, three discs and a feed group with a bit and a
helical flute that slid down and spun as one piece. Replaced by the LPSC 2022 fig. 2 drill in
`dist/drills.mjs` (gold head with actuators on a red Z-stage rail; only the bit turns).

## Files here

- `vehicle-research.mjs`, `layers-panel.mjs`, `render-smoke.test.mjs`: exact copies at `16b1f10`.
- `drill-internal-*.jpg`, `drill-thermal-*.jpg`: at orbit angles 0, 1.5, 3.1, 4.7;
  `drill-zoom-internal-1.3.jpg`, `drill-zoom-exterior-1.3.jpg`: close views.

## Restore

Use the tag in a separate checkout for the whole app as it was. For a narrow restore, copy the
drill block (from `subsystem("drills", "drills")` to `drillFeeds.push(feed)`) and the two
`poseSampling` lines (`feed.position.y = -0.72 - ...`, `feed.rotation.y = ...`) from the archived
`vehicle-research.mjs`, remove the `drills.mjs` import, restore the sampling test's rotation
check from `render-smoke.test.mjs`, and remove `tests/drills.test.mjs`. Archive the replaced
version in turn and rerun all tests.
