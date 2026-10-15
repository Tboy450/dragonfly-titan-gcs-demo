# Archived Rotor Heads (until 2026-10-15)

Archived October 15, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `92ab0c4`.
Tag: `archive/rotor-heads-2026-10-15`.

At each arm end the research model had a thin central mast (r 0.043 m, 0.34 m tall), two white
motor pods (r 0.078 m) with dark caps, a gold hub cylinder under each rotor and a half-sphere
spinner dome on each rotor hub, with blades in a pale, low-metal finish. Replaced by the coaxial
motor stack and hub plates drawn from the "Revolutionary Rotors" video and NASA/APL's flight
frame photo (`dist/rotor-heads.mjs`).

## Files here

- `vehicle-research.mjs`: exact copy at `92ab0c4` (the loop after "Arms run out from the arm
  roots", the `spinnerGeometry` constant and the `bladeMaterial` line).
- `old-pilot-*.jpg`: the pilot view, Fixed and three Free angles. `old-exteriorB-*.jpg`: the
  Exterior B clean room.

## Restore

Use the tag in a separate checkout for the whole previous app. For a narrow restore, put the
archived loop body, `spinnerGeometry` and `bladeMaterial` back in `dist/vehicle-research.mjs`
and remove the `rotor-heads.mjs` import; remove `tests/rotor-heads.test.mjs`. Archive the
replaced version in turn and rerun all tests.
