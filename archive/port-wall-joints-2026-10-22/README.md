# Before Port Wall and End Joints

Codex (OpenAI), October 22, 2026. Baseline `8ac4e59`, recovery tag
`archive/port-wall-joints-2026-10-22`. Port wall/joints are additive; starboard remains unchanged.

Exact prior side-wall/builder/visibility/pure-inspector/UI-layer/HTML files are saved here,
with six fresh Internal/Thermal viewport pictures and all numbered/starboard geometry
manifests in `before/`. Source photographs remain unchanged in their credited folders.

To restore the starboard-only presentation, take baseline versions of `dist/side-wall.mjs`,
`dist/vehicle-research.mjs`, `dist/inspection-visibility.mjs`, `dist/vehicle-inspector.mjs`,
`dist/ui/layers-panel.mjs`, and `dist/index.html`. Saved `layers-panel.mjs` returns to the
UI directory; the other source files to `dist/`. Remove the new joint import/build together;
the unused standalone module is harmless. Do not reset unrelated game or simulator work.

`initial-bounding-box-candidates.json` records false broad-phase candidates from the long
curved DrACO tubes. Actual centerline/radius narrow phase clears them; no tube moved.
No geometry draft was rejected or replaced during this pass. Test-helper corrections are
documented in the [research process record](../../research/port-wall-joints-2026-10-22/README.md).
