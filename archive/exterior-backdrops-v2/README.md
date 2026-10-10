# Detailed procedural Exterior backdrops

Replaced after the owner clarified that "more detail" meant cinematic imagery, rather than
additional drawn rocks. The last shipped version is tagged `archive/exterior-backdrops-v2`
at `aaf1349`. `mission-backdrop.mjs` preserves all three painters, including the corrected
gentle clean-room floor. `flight-view.mjs` preserves the prior HUD rendering.

- `a-desktop.png` / `a-phone.png`: painted dune, cobbles, gravel and haze.
- `b-desktop.png` / `b-phone.png`: detailed clean room before lighting/material refinements.
- `c-desktop.png` / `c-phone.png`: procedural Saturn and oversized Titan limb.
- `draft-photo-*.mjs` and `exterior-*-draft.png`: first photographic composition check;
  the bright sky needed stronger readout contrast and phone carts still sat under controls.

To restore the historical visuals, copy `mission-backdrop.mjs` to `dist/ui/` and the old
HUD module if needed. Preserve unrelated newer edits. A separate checkout of the archive
tag restores the complete old application for comparison. Run the test suite and inspect
both phone and desktop layouts before publishing a restoration.

The replacement uses a NASA/APL animation still for A and credited Cassini photography for C.
Source/processing notes: `dist/assets/exterior/README.md`. B retains this floor perspective.
