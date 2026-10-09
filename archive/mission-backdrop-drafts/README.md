# Archived drafts: the new Mission backdrops before their fixes (2026-10-08)

While building the per-layer Mission backdrops, three states were changed before publishing.
They are kept here under the owner's rule that no work is thrown away, including flawed drafts.

| Draft | What was wrong | Picture | Published fix |
|---|---|---|---|
| Blueprint labels | Labels sat at the exact middle of each dimension line, so "1.75 m" was cut off at the left edge | `draft-blueprint-label-cut-off.jpg` | Labels kept inside the frame (`blueprint-as-shipped-phone.jpg`) |
| Titan ground | The Huygens ground photo was tiled, leaving visible seams | `draft-titan-ground-tile-seams.jpg` | One stretch of the photo, no seams (`titan-ground-as-shipped-phone.jpg`) |
| Thermal true color | The background used the exact thermal color of -179 C air, so parts at air temperature (rotors, arms, skids, fins) blended into it and almost vanished | `thermal-true-air-color-parts-blend-in.jpg` | Background dimmed to 55% (`thermal-dimmed-as-shipped.jpg`) |

The true-color thermal view was never published; it was rendered only for this archive (its
on-screen caption still reads "dimmed" because only the color was changed for the picture). It is
the physically literal version: a real thermal camera shows objects at air temperature in the
same color as the air.

## Files here

- `drafts.mjs`: the draft code for each of the three, as reference copies.
- Pictures: the drafts at 1280x800, and the published versions for comparison.

## Getting them back

These states were never committed, so there is no git tag. To see one, apply its lines from
`drafts.mjs` in `dist/ui/mission-backdrop.mjs` (the published file is at commit 62a129d).
