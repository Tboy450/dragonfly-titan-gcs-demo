# Archived HGA Actuator Placeholder, Pole-Mounted Antenna and Dish Face (until 2026-10-14)

Archived October 14, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `e43fc85`.
Tag: `archive/hga-actuators-2026-10-14`.

Three things were replaced together by the gimbal in `dist/hga-gimbal.mjs` (part 10):

1. **Part 10 placeholder** (`hga-actuators`, interior only): a blue cylinder (r 0.1 m, 5 cm
   tall) at [0, 0.035, -0.36] with a 0.10 x 0.07 x 0.12 m box under it, labeled "HGA
   azimuth/elevation actuators" (source "ICES-2023 p2, fig. 3"). Its spot under the dish's
   forward rim was close to the published one (forward of the dish); its shape was not.
2. **The research model's antenna motion**: the dish sat on a vertical pole at [0, 0.15, 0.05]
   (`kit.buildAntenna`, 0.04 m stowed, rising 0.52 m straight up and tilting toward Earth). The
   sources describe a motorized arm on an azimuth/elevation gimbal forward of the dish instead.
   The classic demo model still uses `buildAntenna` and is unchanged.
3. **The dish face**: a dark blue-gray face with square dots in rings. NASA's 2026 photos show
   orange Kapton with pairs of slots. The dish also sits 4 cm higher now (center y 0.25 instead
   of 0.21), on the arm's pedestal.

## Files here

- `vehicle-research.mjs`, `chase-vehicle.mjs`, `layers-panel.mjs`, `vehicle-inspector.mjs`,
  `index.html`: exact copies at `e43fc85`. The index's Vehicle part assumptions and Model
  assumptions listed "10 antenna actuators" among the parts not yet redrawn.
- `README-project.md`: the project README at `e43fc85`. Its Vehicle Layers paragraph still
  listed "the cold attic with the sample carousel, DraMS" among the placeholder blocks, which had
  not been true since Codex redrew them on October 12; that clause was dropped and the rest of the
  list kept.
- `hga-internal-*.jpg`, `hga-thermal-*.jpg`: the isolated placeholder at four orbit angles.
  `hga-context-internal-*.jpg`, `hga-context-exterior-*.jpg`: installed, stowed.
  `hga-deployed-exterior-*.jpg`: the dish raised on the old pole. `hga-sheet.jpg`: the four
  exterior views together.

## Restore

Use the tag in a separate checkout for the whole previous app. For a narrow restore: in
`dist/vehicle-research.mjs`, put back the old slot texture, `buildAntenna` in the kit
destructuring, `const researchAntenna = buildAntenna([0, 0.15, 0.05], 0.04, 0.52, 0.03);` with
the dish mesh on `researchAntenna.head`, and the placeholder lines after
`interiorPart("hga-actuators", ...)`; remove the `buildHgaGimbal` import and call. In
`dist/chase-vehicle.mjs`, remove `earthLocal` from the kit and the `part.userData.shell` check
in `applyLayer`. Restore the `hga-actuators` text in `dist/ui/layers-panel.mjs` and the
isolation entry in `dist/vehicle-inspector.mjs`; restore the TWTA's first waveguide route
(`archive/twta-waveguide-v1-2026-10-14`); remove `tests/hga-gimbal.test.mjs`. Archive the
replaced version in turn and rerun all tests.
