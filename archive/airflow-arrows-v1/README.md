# Archived look: first air-flow arrows (until 2026-10-08)

The Internal layer's first warm-air loop: 26 identical orange cones moving at a fixed speed
around one closed path (MMRTG, fan, under-floor duct forward, up at the nose, back through the
bay, into the MMRTG). It did not show flow rate, the trim flaps, the cold-duct bypass or the
controller's sensors, and the arrows were hidden where they passed through solid parts.

Replaced by a loop whose speed follows the fan's flow and whose colors go from MMRTG-warm to
bay-cool, a cold-duct bypass through each side chimney that grows with the trim setting, moving
trim flaps, the two controller sensors, arrows drawn over the parts, and a live "Warm-air loop"
panel (how it moves, how it is regulated, how it is measured).

## Files here

- `airflow-arrows-v1.mjs`: the code as it was (from `dist/vehicle-research.mjs`).
- `internal-desktop-grid-backdrop.jpg`, `internal-phone-blueprint.jpg`: the Internal layer with
  these arrows (on the old grid backdrop and on the new blueprint).

## Getting it back

- **Whole app as it was:** git tag `archive/airflow-arrows-v1` (commit c6a7f07).
- **Just the arrows:** replace the circulation-loop block in `dist/vehicle-research.mjs` (from
  "Circulation loop" to `poseAirflow`) with `airflow-arrows-v1.mjs`, and call
  `poseAirflow(time)` without the state.
