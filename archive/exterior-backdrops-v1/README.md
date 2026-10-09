# Archived look: the first Exterior backdrops a / b / c (2026-10-08 to 2026-10-09)

The Mission view's Exterior layer has three backdrops picked with the a / b / c buttons. These
were the first versions, replaced on 2026-10-09 when the owner asked for them to be "a lot
cooler" with more detail.

| Option | What it was | Pictures |
|---|---|---|
| a | Titan landing area from above: the Huygens ground photo over a sand gradient, scattered pale pebbles, a dune band at the far edge, the lander's shadow | `a-titan-desktop.jpg`, `a-titan-phone.jpg` |
| b | Assembly clean room: plain grey floor grid in perspective, a dashed yellow-and-black keep-out square, two grey equipment boxes, a wall with a grille strip | `b-cleanroom-desktop.jpg`, `b-cleanroom-phone.jpg` |
| c | Poster: starfield, a large orange Titan with a blue haze rim, Saturn with one ring band (sitting under the right-hand telemetry text) | `c-saturn-desktop.jpg`, `c-saturn-phone.jpg` |

Pictures are at 1280x800 (desktop) and 375x812 (phone).

## What replaced them

- **a:** a lit dune with sand ripples and a bright crest at the far edge fading into haze, broad
  bright and dark ground patches, wind streaks, thousands of gravel specks, rounded icy cobbles
  with highlights and shadows (bigger toward the viewer, like the Huygens landing site), a dark
  rain-dampened patch, thin ground fog.
- **b:** perforated raised-floor tiles with the ceiling lights reflected in the epoxy, a striped
  KEEP OUT tape square with a stencil, a nitrogen purge cart with its hose to the vehicle, a tool
  cart, a work stand on casters, a platform ladder, a shipping crate (wide screens), a cable
  cover and an ESD ground strap, a wall with an observation window, air grilles and a sign. On a
  phone the equipment moves below or just inside the tape.
- **c:** the Milky Way with dust lanes, colored and spiked stars, Saturn with banded clouds, the
  C, B and A rings, the Cassini Division and Encke Gap, the rings' shadow on the planet, a small
  icy moon; Titan with haze mottling, methane cloud streaks, the north polar hood, a night side
  and its detached blue haze layer. Saturn now sits clear of the telemetry text.

## Files here

- `exterior-backdrops-v1.mjs`: the three painters (`paintTitan`, `paintCleanroom`,
  `paintSaturn`) as they were in `dist/ui/mission-backdrop.mjs` at commit 3b0dfc3. They use that
  module's `seeded()`, `groundImage`, `groundShadow()` and `vignette()`.
- The six pictures above.

## Getting it back

- **Whole app as it was:** git tag `archive/exterior-backdrops-v1` (commit 3b0dfc3).
- **Just these looks:** in `dist/ui/mission-backdrop.mjs`, replace the block from
  `// Soft round blob` up to `// Internal: engineering blueprint grid.` with the contents of
  `exterior-backdrops-v1.mjs`.
