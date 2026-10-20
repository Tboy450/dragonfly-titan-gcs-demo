# RDE before individual unit inspection

Archived October19,2026 by Codex (OpenAI). Recovery tag
`archive/rde-inspection-2026-10-19` on committed baseline `7ab195e`.

Exact prior `rotor-drive-electronics.mjs`, `layers-panel.mjs` and
`rotor-drive-electronics.test.mjs` retained here. `before/` contains fresh pre-change
desktop/390/360 Internal/Thermal pair pictures, installed context, hidden covers,
raw model renders, acceptance JSON and exact world-space mesh/material manifest.
These are actual renders of the archived code, not synthetic photographs.

Restore the archived module to `dist/rotor-drive-electronics.mjs` and test to
`tests/rotor-drive-electronics.test.mjs`; copy only the RDE-specific source/detail lines
from the archived panel into current `dist/ui/layers-panel.mjs` to avoid undoing later
unrelated changes. Remove the newer RDE-specific source-selector line if restoring it.
Run full tests and browser checks before publishing. Never reset the entire repository
to the tag: it would discard subsequent game and other interior updates.

The replacement changes inspection hierarchy only. Geometry, estimated materials,
installed coordinates and thermal behavior remain identical. No rejected shape draft
was created during this inspection pass.
