# Minimap before squad orders

Preserved October 20, 2026 — **Codex (OpenAI)**. Baseline
`5220223983b8c26721aefd21859578482000bdcd`, tag
`archive/swarmfall-minimap-orders-2026-10-20`.

`original/` retains exact previous `main.mjs`, `index.html` and `invasion.css`. The old
minimap accepted click events only and moved the camera. It had no order mode, command pulse
or separate pointer-cancellation handling. `drafts/initial-mode-styling.css` keeps the first
unpublished toggle color declaration before correcting its undefined accent token.

`historical-mission-2026-10-16.png` is the dated picture from earlier control archives,
not a fresh view of this minimap update/draft. No native browser/phone acceptance claimed;
previous browser restriction retained. No map artwork or lab is replaced by this change.

Use the tag in a separate checkout to reproduce old behavior. For selective restoration,
compare the map listener and related start/reset logic in the original main with the current
entry point, plus the minimap markup/CSS. The new plain coordinate helper/test become unused
if restoring old code. Preserve newer work/saves first; keep every archive/source asset and
unfinished kit draft. Neither original nor copied environment labs were edited.
