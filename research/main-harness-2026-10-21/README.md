# Main Wiring Harness: First Pass (Bay Floor)

Claude (Anthropic Claude Opus 5.5), October 21, 2026, on the owner's October 20 note that a lot
of connecting equipment is missing. Not a numbered part; listed under Connections and
Installation in `INTERIOR-REALISM-TODO.md`.

## Source

NASA/APL's September 2, 2026 photo of the flight fuselage being wired, credit NASA/Johns Hopkins
APL/Ed Whitman ([NASA blog](https://science.nasa.gov/blogs/dragonfly/2026/09/02/nasas-dragonfly-gets-wired-up-while-titan-landing-area-is-named/)),
saved by Codex in [`../nose-bulkhead-2026-10-19/nasa-apl-harness-integration.jpg`](../nose-bulkhead-2026-10-19/README.md).
Crop here: `photo-crop-bay-harness.jpg`.

What it shows: silver-sheathed bundles, roughly 1-3 cm across, in a dense network on the bay
floor and up the side walls and a diagonal brace; laced at tie points (blue-green lacing visible)
and clamped to the structure; branching to the units' connectors. It does not give a wiring
diagram, routes or which unit connects to which.

## What is drawn (`dist/main-harness.mjs`, revision `main-harness-2026-10-21`)

- A 2.4 cm trunk down the floor's centerline from the navigation units (z -1.0) to the battery
  (z 0.27), passing the 8 cm gap between the two drive-electronics boxes.
- Branches (1-1.8 cm) that meet the cable stubs the earlier unit passes left: both power units
  and the IEM (Claude, October 13) and the battery cables (Claude, October 15). They also end at
  connector faces: the radio, both drive-electronics connector blanks, the navigation FEB/IMU
  support and MEB, and the inner ends of the lower cameras' wall pass-through cables.
- Blue-green lacing ties about every 6 cm; clamp feet on the floor about every 16 cm.
- Inspection layers: bundles `harnesses`, clamps `mounts`. Shown in Internal and Thermal.
- All routes, sizes, spacing and the topology are [EST]; no pin, signal or power assignment is
  implied. The drive-electronics blanks are Codex's "connector blanks only, no claimed route";
  the branches to them are likewise illustrative.

## Not drawn yet

- The photo's density: dozens of looping bundles. This pass draws the main trunks only.
- Runs up the walls and brace, and the attic (DraMS, carousel) harness.
- The port down camera: its wall pass-through is behind power unit 1.
- Under-deck units (TWTA harness exists in its own module; gimbal drive).

## Checks

`tests/main-harness.test.mjs` (4 tests): one trunk and a branch per unit, layers and clamps;
branch ends within 2-3 cm of the power-unit, IEM and battery stubs; everything on the floor
and inside the side walls; sampled bundles clear every rebuilt part (19 builders), except the
last 3 cm of a branch at its own unit. Full suite: 426 pass. Renders: `model-*.png` (units and
harness only), `model-in-app-internal.png`, `photo-vs-model.jpg`.
