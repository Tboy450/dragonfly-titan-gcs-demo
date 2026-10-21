# Part 06 Sample Carousel: Top Hardware

Claude (Anthropic Claude Opus 5.5), October 21, 2026, from the Connections and Installation
list (owner's October 20 note). Codex's October 12 carousel is kept; part 06 stays credited to
Codex.

## Source

NASA's carousel integration photo, credit NASA/Mike Guinto ([SVS 15003](https://svs.gsfc.nasa.gov/15003)),
saved in [`../carousel-2026-10-12/`](../carousel-2026-10-12/README.md). Crop here:
`photo-crop-top-hardware.jpg`.

On top of the drum, on the side toward the Wonderwall, the photo shows a foil-wrapped
cylindrical unit with Kapton and gold tape bands, a cube-shaped block on the cross-link with
round bolted flanges, and white wiring. The photo does not say what the unit and the block are.
The aluminum posts and the plate with handles under the carousel belong to the handling fixture
(as Codex noted) and are not drawn; the carousel's drives below were already modeled.

## What changed (`dist/sample-carousel.mjs`, revision `carousel-2026-10-21`)

- `carousel-top-hardware` (interfaces layer): the foil-wrapped unit (crinkled foil, two Kapton
  bands and a gold band) on the lid; the fins under it are left out, like those under the ports.
- The valve block with two round flanges and four bolts each, on the cross-link.
- A white wire loop from the unit to the block, kept clear of the sample inlet's manifold (#02).
- Positions and sizes [EST].

## Checks

All 426 tests pass, including Codex's carousel tests (bounds, attic roof) and the clearance of
the DrACO lines and manifold (the first wire route touched the manifold and was moved). Renders:
`model-*.png`, `before-after.png` (top left is before). The earlier carousel is in
[`../../archive/carousel-2026-10-21/`](../../archive/carousel-2026-10-21/README.md).
