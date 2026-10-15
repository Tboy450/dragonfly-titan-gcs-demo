# Archived Warm Duct Height, First Version (until 2026-10-15)

Archived October 15, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `b2ac24a`.
Tag: `archive/warm-duct-v1-2026-10-15`.

The warm duct (part 18) ran at y -0.305 with joint flanges reaching y -0.2765, 7.5 mm above the
bay floor line (y -0.284). Drawing the battery (part 15) on the floor over the duct showed the
flange poking through the floor; the duct was lowered 7.5 mm to y -0.3125 so it and its flanges
sit under the floor, inside the foam. Width, route and everything else are unchanged.

## Files here

- `thermal-loop.mjs`: exact copy at `b2ac24a` (revision `thermal-loop-2026-10-14`).
- `duct-v1-internal-*.jpg`: the isolated duct at the old height.

## Restore

Set `duct.y` back to -0.305 in `dist/thermal-loop.mjs` (the battery's base will then meet a
flange). Archive the replaced version in turn and rerun all tests.
