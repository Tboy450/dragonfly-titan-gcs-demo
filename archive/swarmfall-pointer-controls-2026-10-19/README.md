# Pointer controls before desktop selection/order separation

Preserved October 19, 2026 — **Codex (OpenAI)**. Baseline
`514241beb24249663301323a69e810c0fc7fbe7d`, tagged
`archive/swarmfall-pointer-controls-2026-10-19`.

`original/` retains the exact previous `main.mjs`, `index.html` and recovery/resume UI test.
All stationary buttons previously called the same smart tap: friendly drones selected,
otherwise a selected squad received an order. Right-drag rotated, primary drag panned and
pinch zoomed. The old handler did not discard capture loss or blur, or recheck release
movement. The preserved test contains its original file-local DOM stand-in harness.

`historical-restored-mission-2026-10-16.png` is historical context copied from the prior
wave archive, not a fresh baseline capture. Browser access was blocked previously and was
not retried; no new screenshot or browser acceptance is claimed.

To reproduce, use the tag in a separate checkout. For a selective restoration, compare
`original/main.mjs` and `original/index.html` with their `dist/invasion/` counterparts and
the original test with `tests/`. The added pointer module/helper would become unused;
retain them until any other dependencies have been reviewed. Preserve current work and
saved campaigns before restoring. No downloaded assets, prior variants or kit drafts removed.
