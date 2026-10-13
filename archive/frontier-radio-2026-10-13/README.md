# Archived Frontier Radio Placeholder (until 2026-10-13)

Archived October 13, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `abba3af`.
Tag: `archive/frontier-radio-2026-10-13`.

Part 13 was a single green 0.18 m cube (5.8 L) at [0.22, -0.2, 0.2] in the equipment bay,
labeled "Frontier X-band radio". It was replaced by the photo-referenced four-slice Frontier
radio in `dist/frontier-radio.mjs` (about 10 x 10 x 15 cm). The cube was nearly four times the
real radio's size.

## Files here

- `vehicle-research.mjs`, `layers-panel.mjs`: exact copies at `abba3af`.
- `radio-internal-*.jpg`, `radio-thermal-*.jpg`: the isolated cube at orbit angles 0, 1.5, 3.1,
  4.7 in Internal and Thermal (1280 x 800). `radio-context-internal-0.22.jpg`: installed among
  its neighbors. `radio-ui-phone.jpg`: the Mission view at phone width.

## Unpublished drafts (no tag)

- `mirrored-face-draft/`: the first build had the connector face mirrored (J11 on the
  viewer's right, unlike the photo). `draft-lines.mjs` holds the four code blocks as drafted.
- `wide-stack-draft/`: the stack width came from the 2,050 cm3 published volume (13.2 cm),
  wider than the photographed four-slice unit. `draft-asset-lines.mjs` holds the asset block;
  `draft-wide-stack-vs-photo.jpg` shows the difference.

## Restore

Use the tag in a separate checkout for the whole previous app. For a narrow restore: in
`dist/vehicle-research.mjs`, remove the `buildFrontierRadio` import and call and put back
`mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), material, [0.22, -0.2, 0.2]);` after
`material = interiorPart("frontier-radio", ...)`; restore the `frontier-radio` text in
`dist/ui/layers-panel.mjs`; remove `tests/frontier-radio.test.mjs`. Archive the replaced
version in turn and rerun all tests.
