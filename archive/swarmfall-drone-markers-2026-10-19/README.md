# Mission overlay before tiny friendly-drone markers

Preserved October 19, 2026 — **Codex (OpenAI)**. Baseline
`7ab195e50426ebd77fed3ad134d5838008fc980c`.

`original/` retains exact previous `main.mjs`, `scene.mjs` and render test. Previously only
selected or damaged units received unit overlay cues, so healthy unselected drones could
be difficult to see when zoomed out. The original renderer did not expose projected unit
size for this overlay. No art/model assets are being replaced in this change.

`historical-mission-2026-10-16.png` is a dated picture from the prior pointer-control archive,
not a fresh screenshot of this pass. Browser automation was restricted earlier and was not
retried. There is no new browser/GPU acceptance claim.

Restore by comparing `original/main.mjs` and `original/scene.mjs` with `dist/invasion/`, plus
the render test with `tests/`. The added marker module/new test become unused when restoring
old entry/render code. Preserve newer work and saves before restoration. Existing source
assets, foundation/model variants, both labs and unfinished kit files remain untouched.

Recovery tag `archive/swarmfall-drone-markers-2026-10-19` was created on `7ab195e`.
The source remains available in this archive whether or not deployment has completed.
