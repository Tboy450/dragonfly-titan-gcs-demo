# Archived Battery Placeholder (until 2026-10-15)

Archived October 15, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `b2ac24a`.
Tag: `archive/battery-2026-10-15`.

Part 15 was a single olive box, 0.60 x 0.30 x 0.52 m, at [0, -0.15, 0.72], labeled "Battery: 11.5
kWh, 7.5 kg phase-change wax, heat pipes" (source "ICES-2023 p5, figs. 3-4"). It reached from the
floor into the warm duct's zone and forward to z 0.98. It was replaced by the 24-cell battery in
`dist/battery.mjs`, placed from the TFAWS 2023 plan view (z 0.34-0.77).

## Files here

- `vehicle-research.mjs`, `layers-panel.mjs`, `index.html`: exact copies at `b2ac24a`. The panel
  text read "The battery supplies flight power and recharges from the MMRTG. The thermal model
  includes a phase-change buffer and inhibits charging outside its permitted band."; both
  sentences are kept in the new text. The index listed "15 battery" among the parts not yet
  redrawn.
- `battery-internal-*.jpg`, `battery-thermal-*.jpg`: the isolated box at four orbit angles.
  `battery-context-internal-*.jpg`: installed among its neighbors.

## Restore

Use the tag in a separate checkout for the whole previous app. For a narrow restore: in
`dist/vehicle-research.mjs`, remove the `buildBattery` import and call and put back
`material = interiorPart("battery", ...)` followed by
`mesh(new THREE.BoxGeometry(0.6, 0.3, 0.52), material, [0, -0.15, 0.72]);`; restore the battery
text and sources in `dist/ui/layers-panel.mjs`; remove `tests/battery.test.mjs`. Archive the
replaced version in turn and rerun all tests.

## Unpublished draft (no tag)

`cad-look-draft/`: the first build, never published, took its enclosure look from the paper's CAD
figure (ICES-2022 fig. 2): one champagne box with a lid, fans on the end walls and connectors low
on the forward wall. The owner's rule on October 15 (real hardware photos first; CGI mainly for
dimensions and placement) led to the published look from the real test photos (figs. 10, 11, 13):
a cream ribbed lower section, a flange and a bare aluminum upper housing with the fans and round
connectors. The draft renders are here; `draft-to-photo-edit.py` and `draft-rib-contrast-edit.py`
hold the exact draft code blocks (the "old" side of each replacement) and what replaced them. The
battery also moved 1 cm aft (center z 0.555 to 0.565) to clear the TWTA's high-voltage cable.
