# Archived look: Mission view grid backdrop (until 2026-10-08)

The Mission view drew the same backdrop behind the vehicle diagram in all three layers, until it
was replaced by a backdrop per layer (Titan landing area / clean room / Saturn poster for
Exterior, an engineering blueprint for Internal, Titan's cold air for Thermal).

## What it was

- An orange-to-navy sky gradient, a cyan horizon line that tilted with the vehicle's pitch and
  roll, seven wavy amber contour lines in the lower part, and a faint 34 px grid over everything.
- In the Internal and Thermal layers the whole backdrop was darkened with a 62% navy overlay.
- Telemetry text (altitude, vertical speed, speed, roll, pitch, wind) was drawn on top; that is
  kept in the new backdrops.

## Files here

- `mission-backdrop-original.mjs`: the drawing code as it was (reference copy).
- Pictures of all three layers at desktop and phone size: `exterior-*`, `internal-*`,
  `thermal-*`.

## Getting it back

- **Whole app as it was:** git tag `archive/mission-grid-backdrop` (commit 417c91b).
- **Just the backdrop:** in `dist/ui/flight-view.mjs`, paint the code from
  `mission-backdrop-original.mjs` in `drawFlight()` instead of calling `drawMissionBackdrop()`,
  and restore the 62% overlay in `drawVehicle()` for the Internal and Thermal layers.
