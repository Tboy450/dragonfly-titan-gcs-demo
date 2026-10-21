# Part 07 Wonderwall: Photo Detail Pass

Claude (Anthropic Claude Opus 5.5), October 20, 2026, on the owner's note that something seemed
missing from the attic apparatus. Codex's October 12 panel (outline, layers, port, mounts,
position) is kept; only visible detail from the photos is added. Part 07 stays credited to
Codex in the checklist and the app.

## Sources

NASA's carousel integration photos, credit NASA/Mike Guinto ([SVS 15003](https://svs.gsfc.nasa.gov/15003)),
already saved in [`../carousel-2026-10-12/`](../carousel-2026-10-12/README.md) and
[`../drams-2026-10-12/`](../drams-2026-10-12/README.md). Crops here:
`photo-crop-carousel-side.png` (the panel from the carousel side) and
`photo-crop-drams-side.png` (the panel edge-on from the DraMS side).

What they show: khaki facesheets with bare aluminum edges; a tall machined gray frame with
rectangular pockets from the top edge down around the port on the carousel side; the port as a
bolted ring with a cross of spokes to a central hub; orange Kapton over the frame below the port
and to its aft side; clip tabs with bolts along the edges, about every 5-6 cm.

## What changed (`dist/wonderwall.mjs`, revision `wonderwall-2026-10-20`)

- Facesheets recolored khaki on both sides (were pale and metal).
- `wonderwall-port-frame` (mounts): machined plate from the Kapton to the top edge around the
  port, 12 pockets in rows (none crosses the port), four spokes from the bolted ring to a hub
  ring. The middle of the port stays open for the modeled DraMS neck; whether the photo's hub is
  that neck is not established.
- `wonderwall-kapton-covers` (covers): replaces Codex's small amber patch with the photographed
  Kapton: the lower frame and a block aft of the port.
- `wonderwall-edge-clips` (mounts): tabs with bolts on both faces along the top, slanted and
  bottom edges, skipped where the frame and Kapton sit.
- Everything stays within the old 16 mm gap to the carousel (now 14 mm; the test needs 8) and
  inside the attic.
- All positions and sizes are traced on the photos [EST].

## Discrepancy kept for a later pass

In the photo the port's center sits about 40% of the way up the panel; the model has it at 61%
(Codex's placement, which the DraMS interface neck is keyed to). Moving it means moving the DraMS
interface and the carousel transfer too, so it is left for the 07/08 interface follow-up.

## Checks

All 418 tests pass (Codex's Wonderwall tests: layers, clearance with the carousel, attic bounds,
open port). Renders: `model-*.png`; `photo-vs-model.jpg` sets the photo beside the model before
and after. The earlier panel is in [`../../archive/wonderwall-2026-10-20/`](../../archive/wonderwall-2026-10-20/README.md).
