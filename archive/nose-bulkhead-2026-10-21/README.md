# Archived Provisional Nose Bulkhead (Codex, until 2026-10-21)

Archived October 21, 2026 by Claude (Anthropic Claude Opus 5.5), from commit `46c4814`.
Tag: `archive/nose-bulkhead-2026-10-21`.

Codex's October 19 provisional panel (revision `nose-bulkhead-provisional-2026-10-19`): thin
silver face, perimeter returns, mount feet, fasteners and tape marks, unchecked and listed as
provisional in the app. On October 21 the owner approved labeled approximations; the panel is
kept and gains bay-side construction, and the part is counted. See
[`../../research/nose-bulkhead-2026-10-21/`](../../research/nose-bulkhead-2026-10-21/README.md).

## Files here

- `nose-bulkhead.mjs`, `nose-bulkhead.test.mjs`, `index.html`: exact copies at `46c4814`.
- `pictures/`: Codex's renders of this version (closed, rear, context, Internal and Thermal),
  copied from `research/nose-bulkhead-2026-10-19/`.

## Restore

Use the tag in a separate checkout for the whole previous app. For a narrow restore, copy the
module and test back, restore the provisional entry and counts in `dist/index.html`, the
component text in `dist/ui/layers-panel.mjs` and the unchecked line in the checklist, and the
"20 of the 24" check in `tests/nose-electronics.test.mjs`. Archive the replaced version in turn
and rerun all tests.
