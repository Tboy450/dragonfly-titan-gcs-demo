# Archived TWTA Placeholder (until 2026-10-14)

Archived October 14, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `caec79e`.
Tag: `archive/twta-2026-10-14`.

Part 14 was a single orange box, 0.30 x 0.07 x 0.14 m, at [0.05, 0.02, 0.08] (mid-deck, just
under the top deck), labeled "TWTA radio amplifier (under the top deck)" with source
"ICES-2023 p7". It was replaced by the tube, power conditioner and cables in `dist/twta.mjs`,
drawn after published flight TWTAs (LRO, MRO, Stellant) and placed under the starboard deck
above the radio. The deck mounting it showed is kept; its single-box shape, size and mid-deck
spot are what changed.

## Files here

- `vehicle-research.mjs`, `layers-panel.mjs`: exact copies at `caec79e` (the panel text then
  read "The traveling-wave tube amplifier supports the Earth downlink. Its temperature is an
  estimate linked to radio operation."; both sentences are kept in the new text).
- `index.html`: exact copy at `caec79e`. Its Model assumptions listed the "radio amplifier"
  among the placeholder blocks, and README.md said the same ("the drive electronics, avionics
  and radio amplifier"); both now list it as redrawn. The rest of that text is unchanged.
- `twta-internal-*.jpg`, `twta-thermal-*.jpg`: the isolated box at orbit angles 0, 1.5, 3.1, 4.7
  in Internal and Thermal (canvas 713 x 537). `twta-context-internal-0.6.jpg`: installed among
  its neighbors.

## Restore

Use the tag in a separate checkout for the whole previous app. For a narrow restore: in
`dist/vehicle-research.mjs`, remove the `buildTwta` import and call, and put back
`material = interiorPart("twta", "twta", "TWTA radio amplifier (under the top deck)", "ICES-2023 p7", 0xc0643c);`
followed by `mesh(new THREE.BoxGeometry(0.3, 0.07, 0.14), material, [0.05, 0.02, 0.08]);`;
restore the `twta` text, the `lroTwta`, `mroTelecom`, `stellantTwt` and `thermal2020` sources
and the twta source list in `dist/ui/layers-panel.mjs`; remove `tests/twta.test.mjs`. Archive
the replaced version in turn and rerun all tests.
