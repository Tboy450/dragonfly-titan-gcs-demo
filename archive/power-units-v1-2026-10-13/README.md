# Archived first rebuild of part 11, the PSUs (published October 13, 2026)

Archived October 13, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `c36db54`.
Tag: `archive/power-units-v1-2026-10-13`.

The first photo-based version, published earlier the same day, was drawn from the 1280-pixel
photos. The owner noticed it looked too much like the other new boxes, with the same evenly
spaced connector rows. The full-resolution photos showed different details (see
`research/power-units-2026-10-13/README.md`), and the second version replaced it.

## Files here

- `power-units.mjs`, `power-units.test.mjs`: the first version's module and tests.
- `power-units-internal-*.jpg`, `power-units-thermal-*.jpg`: isolated at orbit angles 0, 1.5, 3.1, 4.7;
  `power-units-face-internal-*.jpg`: face view; `power-units-context-internal-0.22.jpg`: installed.

## Restore

Use the tag in a separate checkout for the whole app as it was. For a narrow restore, copy
`power-units.mjs` over `dist/power-units.mjs` and `power-units.test.mjs` over `tests/power-units.test.mjs`, then
restore the part's text in `dist/ui/layers-panel.mjs` from that commit. Archive the replaced
version in turn and rerun all tests.
