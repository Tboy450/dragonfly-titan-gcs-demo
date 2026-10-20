# Part20 before measurement-annotation correction

Codex (OpenAI), October20,2026. Recovery tag `archive/battery-measurement-2026-10-20`
on committed baseline5220223. Exact prior builder, inspector, layer-panel UI and HTML saved.
`before/` contains fresh actual Internal/Thermal desktop/phone pictures, four orbit angles,
hidden battery covers, raw context render, per-mesh manifest and acceptance JSON.

Old part20: green sphere radius .022m at [.2,.02,.72], intersecting rebuilt battery geometry.
It had no identified sensor-package reference. Part20 isolation hid its battery context.

To restore only that behavior, revert the battery-sensor construction lines/import in
`dist/vehicle-research.mjs` from this snapshot, remove the battery-sensor association from
`dist/vehicle-inspector.mjs`, and restore only its UI text/source/assumption lines from
archived panel/HTML. The new standalone `battery-measurement.mjs` can remain unused.
Do not replace entire current files or reset the repository to this tag; later work from
Claude/Codex and the separate game must be preserved. Run tests/render checks before publishing.

No replacement hardware draft was fabricated/discarded. Verification-helper copy/JSON fixes
changed only test tooling, not application visuals, geometry or simulation behavior.
