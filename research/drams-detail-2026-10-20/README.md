# Part 08 DraMS: Visible-Hardware Pass

Claude (Anthropic Claude Opus 5.5), October 20, 2026, on the owner's note that something seemed
missing from the attic apparatus. Codex's October 12 DraMS (frame, enclosures, analyzer,
interface neck, local lines, fan) is kept; only hardware visible on the outside in the photo is
added. Part 08 stays credited to Codex.

## Source and what is flight hardware

NASA's integration photo, credit NASA/Mike Guinto ([SVS 15003](https://svs.gsfc.nasa.gov/15003)),
saved in [`../drams-2026-10-12/nasa-drams-integrated.jpg`](../drams-2026-10-12/README.md); crop
here: `photo-crop-drams.png`.

The photo shows DraMS during integration, so not everything in it flies:
- **Drawn (instrument hardware):** a copper-gold insulation blanket over the upper units;
  stainless valve and fitting bodies; a brass cylinder; short wire bundles.
- **Not drawn (test equipment, as Codex also decided):** the tan table with rows of capped
  connectors and the foil-wrapped cable bundles rising out of the photo to the test racks.
- **Not drawn:** the blue caps on the fittings (likely protective covers removed for flight).

## What changed (`dist/drams-assembly.mjs`, revision `drams-2026-10-20`)

- `drams-insulation-blanket` (insulation): a crinkled copper-gold blanket over the analyzer's
  top half (the crinkle is a repeatable jitter, not a physical model).
- `drams-photo-fittings` (interfaces layer, separate from Codex's interface-neck group): three
  valve bodies with hex fittings on the electronics lid just aft of the analyzer, each with a
  short stainless line into the gas chromatograph enclosure, and the brass cylinder.
- A white wire bundle from the brass cylinder to the electronics box connectors.
- Identities, positions and sizes are [EST]. The photo does not show which DraMS units these
  belong to; no hidden internals are drawn.

## Checks

Codex's DraMS tests pass (cases and covers, attic bounds, clearance with the Wonderwall and
carousel, interface alignment, analysis anchor). Full suite: 417 of 418 pass; the one failure is
in `tests/invasion-mission-save.test.mjs`, from the Swarmfall chat's uncommitted game edits at
the same time, not this change. Renders: `model-*.png`; `photo-vs-model.jpg`. The earlier
DraMS is in [`../../archive/drams-2026-10-20/`](../../archive/drams-2026-10-20/README.md).

## Still open

The 08 detailed follow-up in the checklist (ITMS, laser/LDMS interface, GC hardware, pyrolysis
oven, seals and transfer paths) needs its own sources. The Wonderwall port sits lower in the
photos than drawn; moving it moves the DraMS interface too.
