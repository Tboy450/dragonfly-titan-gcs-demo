# Archived alternative: GitHub Copilot's dune landscape (2026-10-04, never published)

On 2026-10-04 GitHub Copilot (GPT-6 Astra, Copilot App) replaced the mountain-basin map with its
own dune field on the branch `tboy450-project-improvement-priorities` (commit 5a5b98e, "Add first
expedition and improve temperature views"). Meanwhile the main line had its own Ahmakiq Undae dune
landscape (Claude, committed by Codex on 2026-10-04, published 2026-10-08). When the branch was
merged on 2026-10-09, the main line's landscape was kept, because its dune sizes follow the
published Cassini values (about 100 m high, 1-2 km wide, kilometres apart), and this one was
archived here, as the owner's rule requires.

## What it was

- Linear dunes repeating every ~620 m, crests 35-60 m high, trending slightly off east-west,
  with a gentle bend; distant hills to the north-east; a flat surface texture between.
- Ground shading tinted the dunes darker from the same formula, kept the Huygens-image texture at
  28% as fine detail, and greyed the ice-rich outcrop. (The outcrop greying, the rain wetness and
  the level pad at base were kept in the merged version.)
- The pictures were rendered from the branch itself, so they also show the other branch-era looks
  (for example the flat paddle rotor blades).

## Files here

- `titan-terrain.mjs`: the branch's terrain file (commit 0c9e506).
- Pictures (phone size): the landing at 37 s, 43 s and 50 s; the base from 30 m up looking north
  and south; 120 m up near Site F.

## Getting it back

- **Whole branch as it was:** git tag `archive/copilot-dune-terrain` (commit 0c9e506), or the
  branch `tboy450-project-improvement-priorities` itself.
- **Just the landscape:** replace `baseHeight()` in `dist/titan-terrain.mjs` with the one in this
  folder's copy (and its dune shading line in the ground shader), then run the tests; the
  terrain tests check dune sizes and would need the matching expectations.
