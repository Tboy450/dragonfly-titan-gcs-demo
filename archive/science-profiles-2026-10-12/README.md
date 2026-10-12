# Before Extended Science Profiles

Archived from **a115d4a**, tag `archive/science-profiles-2026-10-12`.

This version used one 30-second, 160 W sample job. Science results/logs and engineering
references were displayed directly; the notebook used a separate toggle that switched
Pilot to Mission. The archive preserves the affected simulation, UI, markup and styles.
The three before screenshots show Internal view on desktop/phone and the science panel.
Geometry, terrain and photographic assets were not replaced in this update.

## Restore

Use a separate checkout of the archive tag to inspect or run the complete previous app.
For selective restoration, review subsequent changes before copying the archived `dist/`
files into corresponding paths. Restoring all these files removes imports of the new
`science-programs.mjs`; revert the associated new science-profile tests with that feature.
Keep unrelated changes, then run `node --test tests/*.test.mjs` and browser checks.

Only the current top-level `dist/` is published; this archive stays in the repository.
