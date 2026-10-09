# Archived look: Thermal "Titan air" backdrop without a grid (until 2026-10-09)

Option **a** of the Thermal backdrop filled the view with the thermal scale's color for Titan's
-179 C air (dimmed to 55%), with drifting cold-air streaks and a vignette, and no grid. The owner
found the view had lost its grid, so a white grid at the same weights as the yellow one (thin
lines every 12 px, bold 2 px lines every 60 px) was added.

## Files here

- `drawThermalAir.mjs`: the drawing code as it was (commit fb9b232).
- `thermal-titan-air-no-grid.jpg`: the view (captured before the 2026-10-09 merge, so it shows the
  older range-relative part colors; the air color is the same).

## Getting it back

- **Whole app as it was:** git tag `archive/thermal-air-no-grid` (commit fb9b232).
- **Just this look:** in `drawThermalAir()` in `dist/ui/mission-backdrop.mjs`, remove the
  `drawGrid(...)` call.
