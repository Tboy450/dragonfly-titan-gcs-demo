# Arm Shoulder Fittings (Exterior)

Claude (Anthropic Claude Opus 5.5), October 20, 2026. The owner's October 15 note: "the joint
where it connects to the body doesn't go straight in it looks more like a little hexagon at the
shoulder". Not one of the 24 numbered interior parts; ticked in the checklist's exterior section.

## Source

NASA/APL's May 2026 photo of the flight lander frame in its tap test, already saved with the
rotor heads: [`../rotor-heads-2026-10-15/nasa-apl-lander-frame-tap-test-2026-05.jpg`](../rotor-heads-2026-10-15/README.md)
(credit NASA/Johns Hopkins APL/Ed Whitman; [NASA/APL July 9 article](https://science.nasa.gov/blogs/dragonfly/2026/07/09/nasas-dragonfly-clears-key-tests-as-titan-rotorcraft-takes-shape/)).
Real hardware, bare frame (no foam). Crops here: `photo-crop-forward-root.jpg` (starboard
forward arm root, nearly side-on) and `photo-crop-aft-root.jpg` (aft arm root). The
*Revolutionary Rotors* frames were checked; they show the rotors, not the shoulders.

What the photo shows: each arm tube ends in a dark machined fitting bolted to the side panel.
A flanged, pocketed base sits flat on the panel; the fitting narrows outward along the arm as a
faceted, roughly hexagonal collar with ribs; it ends in a round flange with a ring of about a
dozen bolts holding the arm tube. The arm leaves the fitting along its own line, angled from the
panel, not straight out. A lug on top carries a lifting shackle.

## What is drawn (`dist/arm-shoulder.mjs`, revision `arm-shoulder-2026-10-20`)

- A six-sided collar, flats up and down, 15 cm across the flats where it leaves the foam,
  11 cm at the flange, 9 cm long, with a rib along each edge; dark machined gray.
- A round 13.2 cm flange with 12 bolt heads; the arm's fairing starts at the flange.
- Oriented along each arm, seated at the body's foam surface (x 0.43 m).
- **Not drawn:** the base plate on the panel (under the body's foam in this model); the lifting
  lug (it may be ground-handling only). All sizes [EST], proportioned on the photo against the
  arm tube. The arm's own fairing radii changed to start at the flange (5.8 to 4.5 cm, [EST]).

The round tan foam ring and round flange it replaces are in
[`../../archive/arm-shoulder-2026-10-20/`](../../archive/arm-shoulder-2026-10-20/README.md).

## Checks

`tests/arm-shoulder.test.mjs` (4 tests): six-sided collar narrowing outward, round flange,
12 bolts, 6 ribs; on all four arms it starts at the foam surface, points along the arm and has a
flat on top; it stays between the rotor planes and clear of the motor stacks; the research model
uses it and the old ring is gone. Close renders from four angles: `model-*.png`;
`photo-vs-model.jpg` sets the photo crops beside the model before and after.

## Still open

The bare flight arm (a round tube with fittings in the photo) under its fairing; the harness
along the arm; whether the flight arms carry foam at the shoulder.
