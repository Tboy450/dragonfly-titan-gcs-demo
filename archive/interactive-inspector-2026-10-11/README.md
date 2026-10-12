# Before Interactive Inspection

Archived from **8b12b3c**, tag `archive/interactive-inspector-2026-10-11`.
Capture began October 11; replacement completed October 12, 2026.

The earlier Mission Internal/Thermal model had a fixed camera and selected-part details,
but no orbit, zoom, focus, isolation or sampling-follow controls. Sampling motion already
used the shared science clock. Its reverse assist only cancelled upward motion and did
not add a downward push through the apex.

`dist/` preserves the affected renderer, flight model, markup/styles and UI modules before
this update. The three before screenshots show Internal view at desktop and phone sizes
and the science panel during a sample job. The earlier model-assumptions text is in the
archived HTML.

## Restore

Use a separate checkout of `archive/interactive-inspector-2026-10-11` for the complete
earlier version. For a selective restoration, copy this folder's `dist/` files to their
corresponding project paths after reviewing later changes. The new inspector modules
become unused when these original imports are restored. Revert the associated inspector
and updated reverse-assist tests along with the feature, then run
`node --test tests/*.test.mjs`. Do not overwrite unrelated later work.

Only the live `dist/` directory is published. Archives remain in the repository.
