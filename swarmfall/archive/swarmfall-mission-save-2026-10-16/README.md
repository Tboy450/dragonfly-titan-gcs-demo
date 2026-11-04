# Swarmfall before mission saving — October 16, 2026

Archived by Codex (OpenAI). Baseline commit: `8b2399b`.
Exact pre-edit copies of `dist/invasion/main.mjs` and `index.html` are here, alongside
`title-before.png`. The title offered Play campaign and Reset progress, with no mission
resume option. Battle rules, rendering and campaign data are unchanged by this pass.

To restore the former page behavior, copy these two files back to `dist/invasion/`.
The additive `mission-save.mjs` module becomes unused; preserve it in the archive if reverting.
Do not restore unrelated interior changes. Local preview test saves use their own localhost
origin and do not touch the public game's saved data.

The archive tag is `archive/swarmfall-mission-save-2026-10-16` on `8b2399b` when created.
