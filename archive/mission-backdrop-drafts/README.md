# Archived drafts: the new Mission backdrops before their fixes (2026-10-08)

While building the per-layer Mission backdrops, several states were changed before publishing.
They are kept here under the owner's rule that no work is thrown away, including flawed drafts.

| Draft | What was wrong | Picture | Published fix |
|---|---|---|---|
| Blueprint labels | Labels sat at the exact middle of each dimension line, so "1.75 m" was cut off at the left edge | `draft-blueprint-label-cut-off.jpg` | Labels kept inside the frame (`blueprint-as-shipped-phone.jpg`) |
| Titan ground | The Huygens ground photo was tiled, leaving visible seams | `draft-titan-ground-tile-seams.jpg` | One stretch of the photo, no seams (`titan-ground-as-shipped-phone.jpg`) |
| Thermal yellow grid | Thin, faint yellow lines (1 px at 7% and 22% opacity) that barely showed | `draft-thermal-faint-yellow-grid.jpg` | Thicker, brighter lines (1 px at 20%, 2 px at 60%) (`thermal-yellow-grid-as-shipped.jpg`) |
| Thermal light grey | White telemetry text washed out on the light grey | `draft-thermal-light-grey-white-text.jpg` | Dark text with a light halo (`thermal-light-grey-as-shipped.jpg`) |
| Thermal true color | The background used the exact thermal color of -179 C air, so parts at air temperature (rotors, arms, skids, fins) blended into it and almost vanished | `thermal-true-air-color-parts-blend-in.jpg` | Background dimmed to 55% (`thermal-dimmed-as-shipped.jpg`) |

The true-color thermal view was never published; it was rendered only for this archive (its
on-screen caption still reads "dimmed" because only the color was changed for the picture). It is
the physically literal version: a real thermal camera shows objects at air temperature in the
same color as the air.

## Exterior a / b / c, second versions (2026-10-09)

The new, more detailed Exterior backdrops went through two drafts before publishing (the first
versions they replaced are in `../exterior-backdrops-v1/`).

| Draft | What was wrong | Picture | Published fix |
|---|---|---|---|
| Draft 1, clean room (b) | The shipping crate sat under the left telemetry text | `draft-exterior-b-cleanroom-crate-over-text.jpg` | Crate moved lower on the left (`exterior-b-cleanroom-as-shipped.jpg`) |
| Draft 1, poster (c) | Saturn sat under the right telemetry text (as in the first version) | `draft-exterior-c-saturn-under-telemetry.jpg` | Saturn moved up and left, a little smaller (`exterior-c-saturn-as-shipped.jpg`) |
| Draft 2, clean room on a phone | The keep-out square nearly fills a phone's width, so the carts, work stand and crate landed on the tape | `draft-exterior-b-cleanroom-phone-gear-on-tape.jpg` | On narrow screens the carts go below the tape, the stand and ladder just inside it, no crate (`exterior-b-cleanroom-as-shipped-phone.jpg`) |
| Draft 2, poster on a phone | Saturn touched the title and the ROLL readout | `draft-exterior-c-saturn-phone-near-title.jpg` | Smaller and further right on narrow screens (`exterior-c-saturn-as-shipped-phone.jpg`) |

Code: `exterior-v2-draft1.mjs` and `exterior-v2-draft2.mjs` (the whole painter block of each
draft). To see one, replace the block from `// Soft round blob` up to
`// Internal: engineering blueprint grid.` in `dist/ui/mission-backdrop.mjs` with it.

## Files here

- `drafts.mjs`: the draft code for each of the three, as reference copies.
- Pictures: the drafts at 1280x800, and the published versions for comparison.

## Getting them back

These states were never committed, so there is no git tag. To see one, apply its lines from
`drafts.mjs` in `dist/ui/mission-backdrop.mjs` (the published file is at commit 62a129d).
