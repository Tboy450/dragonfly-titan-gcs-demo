# IEM Before Upper-Pair Service Bends

Archived October 24, 2026 by Codex (OpenAI). Exact baseline `d3fe35d`,
tag `archive/iem-service-bends-2026-10-24`.

- `iem.mjs`: Claude's prior photo-referenced enclosure and 26 lead paths, revision
  `iem-2026-10-13b`.
- `layers-panel.mjs`, `iem.test.mjs`: exact prior UI text and IEM tests.
- `before-whole.png`, `before-pair.png`: actual baseline builder rendered this pass.
- `draft-before-label-refit.mjs`, `draft-label-crowding.png`: unpublished rejected draft,
  retained because labels were not attached to the changed wires and the two bows crowded
  each other. Later exact-geometry tests caught both. No recovery tag for an uncommitted draft.

To restore the full prior behavior, copy the archived IEM module to `dist/iem.mjs`
and archived layer panel to `dist/ui/layers-panel.mjs`. The archived original IEM tests
remain compatible; new upper-pair-specific tests would no longer describe the restored
version. Run the entire suite and update the accuracy notes/checklist before publishing.
Do not reset the whole checkout or revert unrelated newer work. For a geometry-only
restore, also remove the new IEM connection-note/source additions to avoid stale claims.

Replay with `research/iem-service-bends-2026-10-24/render.html?before` or `?draft`
on a local static server. Current comparison, sources, tests and limits are in the
[research record](../../research/iem-service-bends-2026-10-24/README.md).
