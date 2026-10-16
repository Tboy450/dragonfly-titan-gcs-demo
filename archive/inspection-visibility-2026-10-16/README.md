# Before independent inspection visibility controls

Archived October 16, 2026 by Codex (OpenAI). Baseline commit `8b2399b`.
The copied working files also include Claude's uncommitted aft-bulkhead isolation membership;
the tag alone does not contain that draft line. Copies are the exact pre-edit files.

Contents: renderer, inspector state/UI, HTML and stylesheet; desktop/360 px model screenshots,
installed context, and four-angle Internal/Thermal DraMS captures. This version had orbit,
focus and isolation, but no independent shell/foam/casing/cover visibility controls.

Restore by comparing these files with their current `dist/` counterparts and applying only
the inspection changes desired. `ui-vehicle-inspector.mjs` belongs at
`dist/ui/vehicle-inspector.mjs`. Do not wholesale replace the current renderer or HTML over
later part, label, camera, game or source updates. Remove the new visibility imports and HTML
controls together if fully reverting the feature. Run all Node tests and inspect both Mission
layers and Pilot after restoration.

Local archive tag: `archive/inspection-visibility-2026-10-16` at `8b2399b`.
