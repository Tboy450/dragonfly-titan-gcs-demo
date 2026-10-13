# Archived first rebuild of part 12, the IEM (published October 13, 2026)

Archived October 13, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `c36db54`.
Tag: `archive/iem-v1-2026-10-13`.

The first photo-based version, published earlier the same day, was drawn from the 1280-pixel
photos. The owner noticed it looked too much like the other new boxes, with the same evenly
spaced connector rows. The full-resolution photos showed different details (see
`research/iem-2026-10-13/README.md`), and the second version replaced it.

## Files here

- `iem.mjs`, `iem.test.mjs`: the first version's module and tests.
- `iem-internal-*.jpg`, `iem-thermal-*.jpg`: isolated at orbit angles 0, 1.5, 3.1, 4.7;
  `iem-face-internal-*.jpg`: face view; `iem-context-internal-0.22.jpg`: installed.

## Restore

Use the tag in a separate checkout for the whole app as it was. For a narrow restore, copy
`iem.mjs` over `dist/iem.mjs` and `iem.test.mjs` over `tests/iem.test.mjs`, then
restore the part's text in `dist/ui/layers-panel.mjs` from that commit. Archive the replaced
version in turn and rerun all tests.
