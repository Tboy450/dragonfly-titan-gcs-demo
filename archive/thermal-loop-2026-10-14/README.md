# Archived Fan, Duct and Side-Chimney Trim Device (until 2026-10-14)

Archived October 14, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `cceb29a`.
Tag: `archive/thermal-loop-2026-10-14`.

- Part 17: one fan cylinder (0.1 m radius) at [0, -0.12, 1.18].
- Part 18: one under-floor duct box, 0.16 x 0.045 x 2.6 m, at [0, -0.305, -0.13].
- Part 19: the trim device as a 43 x 34 cm chimney in each side wall at z 0.45 (ICES-2023's
  concept), with a hinged flap in each (`trim-flap-port`, `trim-flap-starboard`), and flow
  arrows that ran out through each side chimney.

Replaced by `dist/thermal-loop.mjs`: two fans, a 0.14 m duct with its fan transition and nose
outlet, and the later cold bypass duct under the belly with fore and aft diverter flaps (TFAWS
2023 and 2024).

## Files here

- `vehicle-research.mjs`, `layers-panel.mjs`, `render-smoke.test.mjs`: exact copies at `cceb29a`.
- `fan-internal-*.jpg`, `underfloor-duct-internal-*.jpg`, `trim-chimneys-internal-*.jpg`:
  isolated at orbit angles 0, 1.5, 3.1, 4.7; `loop-internal-1.4.jpg`, `loop-thermal-1.4.jpg`,
  `loop-exterior-1.4.jpg`: installed, trim fully open.

## Restore

Use the tag in a separate checkout for the whole app as it was. For a narrow restore, copy the
fan, duct, chimney and `trimFlaps` blocks, the `airPath` / `bypassPaths` curves and the bypass part
of `poseAirflow` from the archived `vehicle-research.mjs`; remove the `thermal-loop.mjs` import and
calls; restore the air-loop test and the panel text from the archived files; remove
`tests/thermal-loop.test.mjs`. Archive the replaced version in turn and rerun all tests.
