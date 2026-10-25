# Fourth-Column Recovery

Codex (OpenAI), October 25, 2026. Baseline `c5e4b58`, tag
`archive/iem-fourth-column-2026-10-25`.

`iem.mjs` and `avionics-installation.mjs` are the exact eleven-reviewed/15-open baseline;
`before.png` is its full model. No repeated real-photo/CAD comparison was created.
The first support-14 draft used a perpendicular post and intersected new lead 13.
An offset foot `[-0.030,0.065,-0.114]` then intersected completed lead 3. The final offset
foot is `[-0.030,0.075,-0.114]`; only the new support changes. These unpublished candidates
are recorded in `rejected-supports.json`, with fractions/restore instructions.

For the complete prior app, create a detached worktree at the tag and serve `dist/`.
For a targeted restore, use these builders plus `dist/ui/layers-panel.mjs` from the tag,
reconcile later tests/status, and avoid overwriting unrelated work. Only `dist/` deploys.
