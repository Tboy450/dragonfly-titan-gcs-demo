# Aft panel, generator pose and fan placement before part 16

Archived by Codex October 16, 2026, completing Claude's October 15 asset pass.
Baseline/tag: `f216162`, `archive/aft-bulkhead-2026-10-15`.

Exact committed originals are named with their path separators replaced by `__`: vehicle
research model, thermal loop, inspector state, layers-panel UI and HTML. The old model has
a rectangular 0.7 x 0.4 x 0.02 m panel at [0,-0.13,1.08], a level MMRTG at [0,0.05,1.6],
the near-vertical aft body profile, fans at z 1.16 and low-gain antenna at z 1.02 m.

`aft-*.png` captures the old panel in Internal/Thermal at four orbit angles, desktop/390/360
px, installed side and Exterior. Browser routes substituted only the original model, thermal
loop and inspector-state modules; the current UI/renderer supplied screenshots. Old isolation
shows only the old panel, while the replacement includes its generator/fans; these are not
identically framed assembly views. Installed side views use the same camera angle.

## Restore

Use the tag in a separate checkout for the complete earlier app. For a narrow restore, compare
the originals and restore the aft-panel construction, generator pose, aft body profile, antenna
and sensor coordinates in `vehicle-research.mjs`, plus the fan/adapter/air-path code in
`thermal-loop.mjs`. Remove the aft-bulkhead imports together. Restore matching component
text/counts/checklist and revert the #16 isolation membership if needed. Retain newer rotor,
camera, battery and inspection-control work. Do not overwrite whole shared files blindly.
Archive the replacement in turn; run all tests and inspect Mission and Pilot afterward.

`review-draft/` separately preserves Claude's unpublished geometry and the initial clearance
test before Codex removed the doubled bounding-box expansion. It has its own pictures and no
tag. Source comparison and current renders are in `research/aft-bulkhead-2026-10-15/`.
