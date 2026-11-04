# HUD before phone panel decluttering

Preserved October 20, 2026 — **Codex (OpenAI)**. Baseline
`a7261bb12ee33100fec92fa9902a2dbffa2d87d5`, tag
`archive/swarmfall-phone-hud-2026-10-20`.

`original/` keeps exact entry point, HTML, CSS and DOM test harness before FIX-07.
Objectives had a manual summary, but no automatic phone collapse; the log had no
collapse control. The harness incorrectly treated any open element as a modal dialog.

`historical-mission-2026-10-16.png` is a dated historical picture retained from the
prior control archive, not a fresh screenshot of this baseline or the new behavior.
Native browser access remains restricted; no new browser/GPU/phone review is claimed.

To reproduce the old behavior, use the tag in a separate checkout. For selective restore,
compare the HUD markup/style, mission start and updateHud against these originals;
remove the corresponding phone-HUD tests if restoring the behavior. Preserve later
changes and saves first. Neither lab, source city library nor separate studio changed.
