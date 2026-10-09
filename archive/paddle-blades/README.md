# Archived asset: flat "paddle" rotor blades (NASA model, until 2026-10-08)

The NASA/APL 2023 model's rotors used these flat blades until they were replaced by tapered,
twisted 3D blades with hub caps and a blur disc. The same shape is still used by the original
demo model, so it also lives on in `dist/chase-vehicle.mjs`.

## What it was

- A flat four-corner outline, double-sided, with no thickness or twist. Model units (blade
  along +x, chord along y): (0.07, -0.055), (0.69, -0.025), (0.70, 0.02), (0.17, 0.115),
  laid flat into the rotor plane with `rotateX(-PI/2)`.
- On the NASA model each rotor was scaled so 0.70 units = 0.675 m (the published 1.35 m
  rotor), with three blades 120 degrees apart.
- Motion blur: six faint copies of each blade trailing behind it, fading with distance,
  their opacity rising with rotor speed (up to 0.10 at 700 rpm).
- Color 0xb6bdb6, metalness 0.5, roughness 0.4.

## Files here

- `paddle-blade.obj`: one blade, in metres, at the NASA model's scale.
- `paddle-rotor-3-blades.obj`: a three-blade rotor, in metres.
- Pictures (phone size): the Mission diagram from above and at three-quarter view, and the
  flight view with rotors at 720 rpm, for the paddle blades (`paddle-blades-*`) and the new
  blades (`new-blades-*`).

The OBJ files open in most 3D viewers (Windows 3D Viewer, Blender, online OBJ viewers).

## Getting it back

- **Whole app as it was:** git tag `archive/paddle-blades` (commit 775b502, the last version
  with these blades on the NASA model). `git checkout archive/paddle-blades`, then serve `dist/`.
- **Just the blades, in a later app:** in `dist/vehicle-research.mjs`, build each rotor's blades
  from the shared `bladeGeometry`, `bladeMaterial` and `trails` (pass them in from
  `dist/chase-vehicle.mjs`, as in the tagged version) instead of `researchBlade`, and drop the
  hub caps and blur disc.
