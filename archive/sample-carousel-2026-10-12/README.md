# Archived Carousel Before the First Part Rebuild

Archived October 12, 2026 by Codex (OpenAI), from commit `0886e40`.
Tag: `archive/sample-carousel-2026-10-12`.

This version drew a shallow blue pan with 24 illustrative exposed cups. The complete
housing rotated with sampling. It was replaced by a photo-referenced enclosed assembly.

Files are exact pre-change copies:
- `vehicle-research.mjs` from `dist/vehicle-research.mjs`.
- `layers-panel.mjs` from `dist/ui/layers-panel.mjs`.
- `render-smoke.test.mjs` from `tests/render-smoke.test.mjs`.

`carousel-ui-1440.png`, `carousel-ui-360.png` and `carousel-context.png` show the old
model in the app. `carousel-internal-*` and `carousel-thermal-*` are angle-matched
isolated renders at 900x600 and 360x460; transparent areas may display black in viewers.

## Restore

For an exact historical application, inspect/check out the tag in a separate checkout.
For a narrowly scoped restoration, compare the archived carousel construction and
`poseSampling()` sections with the current `dist/vehicle-research.mjs`, restore those
sections and remove its `sample-carousel.mjs` import. Restore the corresponding
component text/source handling and pan-animation assertions from the other two copies.
Do not overwrite later unrelated changes by copying entire files over them.
Keep any replaced new implementation archived as well. Run all tests and visual checks.
