# Before electrical evidence / blower scale disclosure

October 27, 2026 — Codex (OpenAI). Baseline 58148de; tag
`archive/draco-electrical-audit-2026-10-27`.

Exact prior sampling inventory/UI files are retained here. `draco-plumbing.mjs`
is unchanged; saved as a baseline for the scale audit and preservation test.
This pass adds evidence/disclosure only, not a replacement blower model.

Existing before picture: [published open interior](../../research/drill-fixed-feed-lead-2026-10-27/public-open-interior.png).
Unchanged isolated pair and measured comparison:
[audit samples](../../research/draco-electrical-audit-2026-10-27/README.md).
No redundant full-vehicle source/model sheet copied.

To restore, copy this folder's `sampling-connections.mjs` to `dist/` and its
`ui/` files to `dist/ui/`, then remove the now-unused evidence module/imports
together. Alternatively retrieve only these files from the recovery tag. Do not
reset the whole shared repository or overwrite concurrent work. Retain research
and source packets; run the full suite and update tests/docs to match any rollback.
