# Archive

Earlier looks and assets kept at the owner's request, each with pictures, the original code or
files, and steps to bring it back. None of this is published on the website (only `dist/` is).

**Rule (owner, 2026-10-08):** replaced work is never thrown away, even bad or inaccurate
versions. Whoever replaces a model, texture, terrain, visual, sound or behavior archives the old
one here in the same change: a folder with the old code or files, pictures and restore steps, a
git tag `archive/<name>` on the last commit that used it, and a row in the table below.

| Folder | What | Replaced on | Git tag |
|---|---|---|---|
| [classic-peaks-terrain](classic-peaks-terrain/README.md) | Sharp saw-tooth far mountain peaks | 2026-09-29 | `archive/classic-peaks-terrain` |
| [mountain-basin-map](mountain-basin-map/README.md) | The mountain-basin map around the base | 2026-10-08 | `archive/mountain-basin-map` |
| [paddle-blades](paddle-blades/README.md) | Flat paddle rotor blades on the NASA model (with OBJ files) | 2026-10-08 | `archive/paddle-blades` |
| [mission-grid-backdrop](mission-grid-backdrop/README.md) | The Mission diagram's single grid/horizon backdrop | 2026-10-08 | `archive/mission-grid-backdrop` |

### Replaced before this rule (in git history only, not yet archived here)

- The first arrival capsule and parachutes (simple cone heat shield, sphere-cap canopies, glow
  sphere), replaced 2026-09-29 by "Rework the arrival sequence graphics and camera" (a6571b6);
  last used in 51c4649.
- "Sleep until dawn" (woke at 06:00), replaced the same day by "Sleep until morning" (8090e0e);
  last used in efdf954.
- Start over's pop-up confirmation, replaced 2026-09-29 by the tap-twice button (63eb373).
