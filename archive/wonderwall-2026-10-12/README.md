# Archived Wonderwall Slab

Archived October 12, 2026 by Codex (OpenAI), from commit `3387a30`.
Tag: `archive/wonderwall-2026-10-12`.

The previous interface was a 0.72 x 0.38 x 0.05 m box across the nose at z=-1.30 m.
It intersected the newly rebuilt carousel. The 5 cm thickness was not a published
Wonderwall dimension. It is preserved here, not discarded.

- `vehicle-research.mjs`: exact previous `dist/vehicle-research.mjs`.
- `layers-panel.mjs`: exact previous `dist/ui/layers-panel.mjs`.
- `wonderwall-ui-*`: desktop/phone app views.
- `wonderwall-internal-*`, `wonderwall-thermal-*`: four angle-matched isolated views.
- `wonderwall-context.png`: previous installed-context view.

To inspect the entire previous app, use the tag in a separate checkout. For a narrow
restoration, restore the archived `wonderwall` construction block and component source
text in the current files, remove the `buildWonderwall` import/call, and reconcile the
new Wonderwall tests. Do not overwrite unrelated subsequent changes with full file copies.
Archive the replacement in turn and rerun the test suite and visual checks.
