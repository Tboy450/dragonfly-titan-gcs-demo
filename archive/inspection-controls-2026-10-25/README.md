# Inspection Controls Recovery

Codex (OpenAI), October 25, 2026. Baseline `7cb0d32`, recovery tag
`archive/inspection-controls-2026-10-25`.

Exact prior files are saved here: `index.html`, `styles.css`,
`vehicle-inspector.mjs` (pure logic), `ui-vehicle-inspector.mjs` (UI binding)
and `mission-backdrop.mjs`. `before.png` shows the published Internal layout.
The prior selector was below the inspector; Interior had a/b only and wheel
events did not zoom the inspection model.

`rejected-phone-order.png` preserves the first UI draft: the inherited mobile
order left the details before the viewport. Final CSS gives the layer toolbar,
viewport and detail panel the same mobile order, retaining their DOM sequence.
No model geometry or source-reference imagery is replaced.

For the exact old app, create a detached worktree at the recovery tag and serve
`dist/`. For a targeted restoration, copy the five files to their original
paths (rename `ui-vehicle-inspector.mjs` to `dist/ui/vehicle-inspector.mjs`),
reconcile subsequent tests and avoid overwriting unrelated changes.
