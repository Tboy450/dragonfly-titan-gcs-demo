# Rotor Heads (Coaxial Motor Stacks and Hub Plates), Rebuild

Implemented October 15, 2026 by Claude (Anthropic Claude Opus 5.5), at the owner's request ("use
the Revolutionary Rotors video to redraw the propeller armature"). Revision
`rotor-heads-2026-10-15`. Source: `dist/rotor-heads.mjs`. An **educational reconstruction from
real footage and photos**, not CAD.

## Sources and Credits (real hardware first)

| Source (saved here) | What it gives |
|---|---|
| *Revolutionary Rotors* (NASA/Johns Hopkins APL, January 2026, 3 min 37 s), APL's [Dragonfly gallery](https://dragonfly.jhuapl.edu/Gallery/) (third video) and NASA's [Saturn and Titan resources](https://science.nasa.gov/solar-system/resources/resource-packages/saturn-and-titan-resources/) ([MP4](https://www.nasa.gov/wp-content/uploads/2026/01/25-02451-putting-the-lift-in-dragonfly-nasa-cut-main-v5-delivery.mp4), 500 MB, not kept in the project). Frames saved: `revolutionary-rotors-frame-*.jpg`, two contact sheets, `motor-drum-and-hub-detail-crops.jpg` | Real footage of the full-scale semi-span wind-tunnel model with flight-like rotors at NASA Langley's Transonic Dynamics Tunnel, the spin test at APL, and rotor machining. At each arm end: a collar where the arm clamps on, between an upper and a lower motor drum of machined aluminum (labeled top ring, fine groove, band of small radial holes, screws set in notches at the rotor-side edge, a spoked face with dark windows toward the rotor); each three-blade rotor is one machined piece whose flat hub plate bolts to that face |
| NASA, *Flight Engineers Give NASA's Dragonfly Lift* ([page](https://www.nasa.gov/missions/dragonfly/flight-engineers-give-nasas-dragonfly-lift/)), photos credited NASA/Johns Hopkins APL: `nasa-tdt-model-in-tunnel-2025.jpg`, `nasa-tdt-model-setup-2025.jpg`, `nasa-rotor-machining-2025.jpg` | The same model in the tunnel and on its wall mount; a rotor on the machining table |
| NASA Dragonfly blog, July 9, 2026 ([page](https://science.nasa.gov/blogs/dragonfly/2026/07/09/nasas-dragonfly-clears-key-tests-as-titan-rotorcraft-takes-shape/)), photo credited NASA/Johns Hopkins APL/Ed Whitman: `nasa-apl-lander-frame-tap-test-2026-05.jpg` | The flight lander frame in a ground vibration test, with the flight arms and rotor heads (mass simulators in place of the blades): the same collar between two drums at each arm end |

Published elsewhere: each rotor is 1.35 m across and machined from a single block of aluminum.
The wind-tunnel model is a test article; the drums and collar match the flight frame photo.

## What Was Built

| Feature | Basis |
|---|---|
| A collar at arm height between a lower and an upper motor drum, at every arm end | Video and flight-frame photo |
| Drums about 0.24 m across, 0.10 m tall | [EST] scaled from the video (a drum is about a third of a blade's length across) against the published 1.35 m rotor |
| Each drum: turned profile with a fine groove, a band of 16 small radial holes, five notch screws at the rotor-side edge, a spoked face (six spokes, dark windows, center boss) toward its rotor, a shaft spacer to the rotor | Video frames 93 s and 204 s; counts and sizes [EST] |
| Split clamp block on the collar facing the arm, with two bolts | Video and flight-frame photo; shape [EST] |
| Each rotor's flat hub plate with a ring of bolts, one piece with the blades | Video 93 s, 204 s; the machined one-piece rotor [PUB] |
| Blades in bright machined aluminum | [PUB] machined from aluminum; the blade shape itself is unchanged |
| Rotor disks stay 0.36 m apart, as before | Unchanged |

Replaced: the white motor pods with dark caps, the gold hub cylinders and the half-sphere spinner
domes. Test instrumentation in the footage (strain gauges, tape, labels, wiring) is not drawn.

## Not Known / Not Modeled

- Real drum dimensions and the flight motor's details; what is inside the windows.
- The arms themselves: the flight arms are covered in foam (ICES-2023), so the model keeps its
  foam-covered arm; the bare flight-frame arm (a round tube with fittings) is a follow-up.
- The harness along the arm (heavy on the test model) is not drawn.

## Checks

- `tests/rotor-heads.test.mjs`: stack order (lower drum, collar, upper drum) with the rotors
  outside the drums and 0.36 m apart; drum size against the blade; clamp at arm height facing
  the arm root; spokes, holes and screws present; shafts reach the rotor planes; hub plate at its
  real size inside the scaled rotor. All 213 tests pass.
- Pilot view at four angles (zoomed and not), Fixed camera, and the Exterior B clean room.
  `model-*.jpg` are those views; `model-vs-sources.jpg` sets them beside the footage and photo.

Previous heads: [`archive/rotor-heads-2026-10-15`](../../archive/rotor-heads-2026-10-15/README.md).
