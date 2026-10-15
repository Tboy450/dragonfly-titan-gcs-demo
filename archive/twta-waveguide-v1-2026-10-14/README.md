# Archived TWTA Waveguide Route, First Version (until 2026-10-14)

Archived October 14, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `e43fc85`.
Tag: `archive/twta-waveguide-v1-2026-10-14`.

The TWTA (part 14) was published earlier the same day with its WR-112 output waveguide running a
few centimeters forward from the collector end and bending straight up into the top deck "toward
the high-gain antenna", which was then drawn on a pole at mid-deck. Rebuilding part 10 placed the
antenna gimbal at z -0.55 (ICES-2023 fig. 1), so the waveguide now runs forward under the deck to
the gimbal's under-deck rotary joint. The tube, EPC and their placement are unchanged.

## Files here

- `twta.mjs`, `twta.test.mjs`: exact copies at `e43fc85` (revision `twta-2026-10-14`).
- `twta-waveguide-v1-under-*.jpg`: views from below showing the short run and the riser into
  the deck.

## Restore

Copy `twta.mjs` back to `dist/` and `twta.test.mjs` to `tests/` (the gimbal test's clearance list
then needs no rotary-joint exception). Archive the replaced version in turn and rerun all tests.
