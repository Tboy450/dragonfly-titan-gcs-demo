# Before RF connection review

Baseline `eb842296f6e2a4bbf6a91a01bfb6b4c9e4b3203f`.
Exact prior `dist/ui/layers-panel.mjs` and `dist/ui/sampling-connections.mjs`
are retained here. This is an additive evidence/inspection panel, not a hardware
replacement: existing radio, TWTA, gimbal, harnesses and their earlier source
comparisons remain the baseline unchanged. `before.png` in the research packet
shows the exact baseline Connection installation status without the new review.

Restore these two files to `dist/ui/`; the now-unused `dist/rf-installation.mjs`
can remain archived alongside the source packet. Preserve all other changes.
The baseline marker is in `baseline.txt`. Local recovery tag
`archive/rf-installation-review-2026-10-29` is on eb84229; no merge/publish yet.
