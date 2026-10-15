# Archived Part-Number Layout (until 2026-10-15)

Archived October 15, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `f1e9072`.
Tag: `archive/part-labels-2026-10-15`.

The Mission view's Internal and Thermal part numbers were placed at the center of each part's
bounding box, recomputed every frame, and a number that overlapped one already placed was pushed
straight down the screen in 14 px steps, up to 12 times, with no leader back to its part. As the
view turned, which number collided changed from frame to frame, so numbers chained, flipped and
jumped (the owner's video and request, October 15). A part with separated pieces (two drills, two
power units, both side cameras) was numbered in the empty space between them.

Replaced by `dist/ui/part-label-layout.mjs` and fixed anchors in `dist/chase-vehicle.mjs`: each
number sits on a fixed point on its part's own hardware; a crowded number moves to the nearest
free spot around that point with a leader line, keeps that spot while it stays free, and eases
there; the readouts' corners are kept clear; phones use slightly smaller circles.

Measured over one full turn of the view in 2-degree steps (moves beyond the median motion of all
numbers in that step):

| View | Jumps over 12 px, before | after | Largest, before | after |
|---|---|---|---|---|
| Internal, 1280 px | 263 | 12 | 150 px | 19 px |
| Thermal, from higher up | 202 | 19 | 140 px | 21 px |
| Internal, close and low | not measured | 7 | | 16 px |
| Internal, phone 390 px | not measured | 11 | | 17 px |

## Files here

- `flight-view.mjs`, `chase-vehicle.mjs`: exact copies at `f1e9072` (`drawPartMarkers` and the
  label loop in `drawMission`).
- `old-internal-*.jpg` (six angles around a full turn), `old-thermal-*.jpg` (two angles).
- `old-vs-new-settled.jpg`, `old-vs-new-mid-orbit.jpg`: the same angles before (left) and after
  (right). `new-thermal-high.jpg`, `new-phone-390.jpg`: the new layout.

## Restore

Use the tag in a separate checkout for the whole previous app. For a narrow restore, put the
archived `drawPartMarkers` back in `dist/ui/flight-view.mjs` (and remove the
`part-label-layout.mjs` import), and in `dist/chase-vehicle.mjs` project the bounding-box center
again instead of `userData.labelAnchor`; remove `tests/part-label-layout.test.mjs`. Archive the
replaced version in turn and rerun all tests.
