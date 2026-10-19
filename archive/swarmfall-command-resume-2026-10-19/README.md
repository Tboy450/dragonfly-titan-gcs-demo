# Resume before command UI persistence

Preserved October 19, 2026 — **Codex (OpenAI)**. Baseline
`0fc30b745a9a0c5b78b0eb2471830c15aca81da0`, tagged
`archive/swarmfall-command-resume-2026-10-19`.

`original/` holds exact prior `main.mjs`, `mission-save.mjs` and the entry-point recovery UI
test file. That version saved battle orders and the camera, but reset selection/payload and
always opened the drop panel on resume. It did not store optional command UI metadata.

The dated October 16 mission picture is historical context, copied from the earlier
drop-wave archive. Browser access was blocked previously and was not retried; no new
screenshot or real-browser acceptance is claimed.

Use the tag in a separate checkout to reproduce the prior behavior. Compare the two runtime
files with `dist/invasion/` and the test with `tests/`. The new command-state module can remain
unused when restoring old code. Preserve newer work and save files before restoring anything.
All source assets, previous archives, download receipts and unfinished kit work remain.
