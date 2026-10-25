# IEM Before Lower-Pair Refinement

Codex (OpenAI), October 24, 2026. Baseline `7a50d2e`, recovery tag
`archive/iem-lower-pair-2026-10-24`.

Exact prior `iem.mjs`, `layers-panel.mjs`, `iem-service-bends.test.mjs` and shared
`audit-upper.mjs` are retained. Before pictures show the completed upper pair with the
old lower paths. `draft-low-support.mjs` and its picture preserve the unpublished draft
whose support/label placement crowded adjacent wires. Later checks also caught a support
over a connector body; only new geometry was corrected.

To restore the previous installation, copy the archived IEM module and layer panel back to
`dist/iem.mjs` and `dist/ui/layers-panel.mjs`; restore the archived service test and shared
audit to their original paths if reverting those contracts too. The new lower-pair test
would then describe an intentionally absent feature. Update notes/checklist and run the
full suite before publishing. Never reset the checkout or unrelated newer work.

Replay through `research/iem-lower-pair-2026-10-24/render.html?before` or `?draft`
on a static server. Current limits, sources, samples and endpoint audit are in the
[research record](../../research/iem-lower-pair-2026-10-24/README.md).
