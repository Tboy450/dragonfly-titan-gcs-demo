# Hold controls before empty-selection guidance

Preserved October 19, 2026 — **Codex (OpenAI)**. Baseline
`183bdba5638ff9248d3f51a0d912bfd454d3c23d`, tag
`archive/swarmfall-hold-hint-2026-10-19`.

`original/main.mjs` is the exact previous entry point. Hold and H silently did nothing
when no squad was selected. The selected-squad Hold rules were already implemented and
remain unchanged. No model, terrain, asset or lab is replaced here.

`historical-mission-2026-10-16.png` is the dated picture retained in the preceding marker
archive, not a fresh capture of this UI update. Browser access was previously restricted
and was not retried; no new screenshot or native browser acceptance is claimed.

Use the tag in a separate checkout, or compare the Hold button/key handlers in this file
with `dist/invasion/main.mjs`. Restore only the relevant handlers after preserving newer
work and saves. Existing archives, source assets, models and kit drafts are retained.
