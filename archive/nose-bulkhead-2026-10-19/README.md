# Original Nose Bulkhead Block

Archived October 19, 2026 by Codex (OpenAI), before the provisional structural-panel pass.
Baseline/tag: `9f3fea1` / `archive/nose-bulkhead-2026-10-19`.

`original/vehicle-research.mjs` contains the complete previous builder: part 03 is a
0.70 x 0.40 x 0.020 m solid gray box centered at [0,-0.13,-1.56] m.
`original/layers-panel.mjs` and `original/index.html` preserve its UI/source context.
The before screenshots cover Internal/Thermal at four angles, desktop/360 px and full
installed context. These are real Edge/WebGL captures from that unchanged baseline.

To restore only this asset, in the CURRENT `dist/vehicle-research.mjs` remove the
`buildNoseBulkhead` import/call and copy the original part-03 `interiorPart` and following
BoxGeometry call from the saved builder. Preserve later unrelated parts and the existing
`let material` declaration for part 05. Remove/revise the corresponding current component
description, assumptions and tests in the same change. Do not overwrite the entire present
builder/UI files with these older snapshots. For a complete historical inspection, use
the tag in a separate checkout, not a hard reset of anyone's current work.
