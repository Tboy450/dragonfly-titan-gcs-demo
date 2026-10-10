# Before sparse mountains and the parked clean-room portrait

Saved from `19c0556`, tagged `archive/sparse-mountains-and-parked-room`.

- `titan-terrain.mjs`: wide dune map before four isolated mountain landmarks.
- `flight-view.mjs`, `mission-backdrop.mjs`, `index.html`: live moving vehicle in Exterior B.
- `chase-vehicle.mjs`: renderer before projected skid contact shadows.
- `parked-room-first-draft.mjs` and `.png`: first parked-room pass before cart fittings,
  tool mat and projected skid shadows were added.
- `current-horizon.png`: old terrain looking north from 120 m above the base.
- `exterior-b-desktop-final.png`: previous clean-room display.

To restore only the map, copy the terrain file into `dist/`. To restore the old room behavior,
restore the two UI modules into `dist/ui/` and the HTML into `dist/` together. Run the tests and
review any later changes before restoring. The tag preserves the entire prior application.
