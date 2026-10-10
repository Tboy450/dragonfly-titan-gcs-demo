# Before the review fixes

Tag `archive/pre-review-fixes-2026-10-09` points to `665a669`, the last published version
before this change. The source snapshots preserve the flight-day counter, dust system,
Pilot layout, reset placement and Mission overlays. The `ui/mission-backdrop.mjs`
snapshot additionally includes Claude's uncommitted gentle clean-room floor correction;
the committed tag still has the steep floor archived separately.

## Pictures

- `thermal-phone-before.png`: overlapping thermal/footer controls.
- `thermal-phone-after.png`, `thermal-light-phone-after.png`, and
  `internal-narrow-phone-after.png`: reviewed narrow Mission labels.
- `pilot-before.png`: single-screen Pilot without the page data underneath.
- `pilot-after.png` and `pilot-data-restored.png`: intermediate restoration checks.
- `pilot-desktop-after.png`: intermediate desktop check before correcting grid spacing.
- `pilot-phone-restored.png`, `pilot-phone-footer-restored.png`,
  `pilot-desktop-restored.png`, and `pilot-desktop-data-restored.png`: final scrollable
  layout with the flight box fitted separately and all page sections retained.

## Behavior

The old day counter counted repeated crossings of 1 m as separate flights. It now stays
latched until actual touchdown. Dust formerly aged by a capped render delta, allowing
old particles to survive long visits to Mission. It now ages by elapsed simulation time,
without backfilling a whole missed interval of new particles. Pause still freezes dust.

## Restore

Copy only the relevant snapshot into its matching `dist/` path, then run
`node --test tests/*.test.mjs`. For a full historical version, check out the archive tag
in a separate worktree. Do not overwrite newer unrelated edits. The full old Pilot
layout also requires the historical `index.html`, `app.js`, `styles.css` and `ui/` files
from the tag; the new `ui/pilot-layout.mjs` is not used there.
