# Before the belly-bypass relief / access-view presets

Codex (OpenAI), November 6, 2026. Baseline `874a0d6`;
recovery tag `archive/belly-bypass-2026-11-06` points to that exact commit.

The former belly covers the cold channel and intersects both housing surfaces.
`before-belly.png` is the actual previous WebGL sample, reused from the immediately
preceding audit because no intervening geometry changed. No duplicate source collage.

Exact saved files and restore destinations:

- `vehicle-research.mjs`, `inspection-visibility.mjs`, `chase-vehicle.mjs` → `dist/`.
- `model-inspector.mjs` → `dist/vehicle-inspector.mjs`.
- `vehicle-inspector.mjs`, `layers-panel.mjs` → `dist/ui/`.
- `index.html` → `dist/index.html`.
- `inspection-layout.test.mjs`, `render-smoke.test.mjs`, `trim-interfaces.test.mjs`,
  `thermal-installation-seat.test.mjs` → `tests/`.
- `audit.mjs` → `research/thermal-installation-2026-11-06/audit.mjs`.

Prefer a temporary checkout of the recovery tag for an exact historical view;
do not overwrite newer work in the active checkout. Restoring the integration
file omits the new belly cutter. Earlier hardware geometry is unchanged.
The new code/tests/research can remain in that comparison checkout without use.

The old renderer also preserves the ghost-shell appearance rejected for the new
focused insulation presets; no separate photo was retained for that transient trial.
