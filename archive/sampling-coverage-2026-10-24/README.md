# Before Sampling Connection Coverage

Codex (OpenAI), October24,2026. Recovery tag `archive/sampling-coverage-2026-10-24`
on **08e0a6d**. Exact old index, stylesheet and layer-panel module saved here.
`before-ui.png` is the earlier verified live d9033df drive-inspection screenshot; this
new coverage panel did not exist. All3D geometry remains unchanged in the new pass.

`rejected-mock-switch-checks.json` retains the failed browser check before correcting
the original-demo metadata guard. A false value was non-null and its absent `userData`
was dereferenced. It is now null; no archived check is misrepresented as a passing run.

To restore selectively, compare these files with later edits before copying them to
`dist/index.html`, `dist/styles.css`, `dist/ui/layers-panel.mjs`. New sampling-connections
modules can remain unused after the old UI is restored. Retain or separately reapply the
mock-selection guard fix, reconcile its regression, run the full tests and inspect Mission/
Pilot and research/original model switches. Never reset unrelated work.
