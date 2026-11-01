# Lab before Scout original/polished comparison

Preserved October 19, 2026 — **Codex (OpenAI)**. Baseline
`204fb0f3ca383e55180377263572cfdfdb3469d6`, tag
`archive/scout-lab-comparison-2026-10-19`.

`original/` retains exact previous `asset-viewer.mjs`, `lab.mjs`, `index.html` and the
asset-viewer test. That inspector always loaded current drone models and had no historical
Scout selector. The preceding game release had already polished Scout's hull/sensor.

`historical-cpu-comparison.png` is copied from that preceding Scout pass. It illustrates
old/current geometry with a CPU projection, not the old lab UI or a new browser screenshot.
No native browser visual/capture acceptance is claimed; prior browser restriction retained.

Use the tag in a separate checkout to reproduce the prior inspector. For selective restore,
compare these three runtime/HTML files with `dist/invasion/environments/` and the test with
`tests/`. The added historical Scout module becomes unused if restoring the old loader.
Preserve later work before restoring anything. The historical module does not change the
campaign Scout or its old source archive.

[Comparison links and evidence](../../research/scout-lab-comparison-2026-10-19/README.md).
