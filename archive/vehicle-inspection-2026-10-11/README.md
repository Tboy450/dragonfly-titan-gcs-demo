# Before the vehicle inspection update

Preserved from `231b221` on October 11, 2026. Tag: `archive/vehicle-inspection-2026-10-11`.

- `vehicle-research.mjs`: original 2023-derived procedural model, round skid tubes,
  skid-mounted drill nubs, angular attic and generic avionics group.
- `chase-vehicle.mjs`: matching renderer and layer handling (unchanged by this update).
- `layers-panel.mjs`: original temperature-only component details.
- `inspection-exterior-desktop.png`, `inspection-internal-desktop.png`,
  `inspection-internal-phone.png`: browser captures before the edits.

The original demo model remains selectable in the app separately from this archive.

## Restore

To restore only the older research geometry, copy this folder's `vehicle-research.mjs`
over `dist/vehicle-research.mjs`. The newer reference viewer can remain in place.

For the complete previous UI, first preserve any current work, then restore the matching
`dist/` files from commit `231b221` or the archive tag. The old layer panel expects its
old `index.html` structure; do not replace that module alone. Run the tests and inspect
the Mission and Pilot views before publishing a restoration.
