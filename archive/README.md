# Archive

Earlier looks and assets kept at the owner's request, each with pictures, the original code or
files, and steps to bring it back. None of this is published on the website (only `dist/` is).

**Rule (owner, 2026-10-08):** replaced work is never thrown away, even bad or inaccurate
versions. Whoever replaces a model, texture, terrain, visual, sound or behavior archives the old
one here in the same change: a folder with the old code or files, pictures and restore steps, a
git tag `archive/<name>` on the last commit that used it, and a row in the table below. Drafts
that were fixed before publishing are kept too, with pictures and their code (no tag, since they
were never committed).

| Folder | What | Replaced on | Git tag |
|---|---|---|---|
| [exterior-backdrops-v2](exterior-backdrops-v2/README.md) | Procedural rock field, clean-room finish and oversized Titan poster before photographic A/C replacement | 2026-10-09 | `archive/exterior-backdrops-v2` |
| [cleanroom-steep-floor](cleanroom-steep-floor/README.md) | Detailed clean-room floor before Claude's gentler perspective correction | 2026-10-09 | `archive/cleanroom-steep-floor` |
| [pre-review-fixes-2026-10-09](pre-review-fixes-2026-10-09/README.md) | Single-screen Pilot layout, overlapping narrow Mission labels, hover counting and dust timing before review fixes | 2026-10-09 | `archive/pre-review-fixes-2026-10-09` |
| [classic-peaks-terrain](classic-peaks-terrain/README.md) | Sharp saw-tooth far mountain peaks | 2026-09-29 | `archive/classic-peaks-terrain` |
| [mountain-basin-map](mountain-basin-map/README.md) | The mountain-basin map around the base | 2026-10-08 | `archive/mountain-basin-map` |
| [paddle-blades](paddle-blades/README.md) | Flat paddle rotor blades on the NASA model (with OBJ files) | 2026-10-08 | `archive/paddle-blades` |
| [mission-grid-backdrop](mission-grid-backdrop/README.md) | The Mission diagram's single grid/horizon backdrop | 2026-10-08 | `archive/mission-grid-backdrop` |
| [airflow-arrows-v1](airflow-arrows-v1/README.md) | First Internal-layer air-flow arrows (one fixed-speed loop) | 2026-10-08 | `archive/airflow-arrows-v1` |
| [copilot-dune-terrain](copilot-dune-terrain/README.md) | GitHub Copilot's own dune landscape (branch work, never published), with its test | 2026-10-09 (at the merge) | `archive/copilot-dune-terrain` |
| [thermal-scale-range-relative](thermal-scale-range-relative/README.md) | Range-relative thermal colors and the open parts list | 2026-10-09 | `archive/thermal-scale-range-relative` |
| [thermal-air-no-grid](thermal-air-no-grid/README.md) | Thermal "Titan air" backdrop before its white grid | 2026-10-09 | `archive/thermal-air-no-grid` |
| [exterior-backdrops-v1](exterior-backdrops-v1/README.md) | The first Exterior backdrops a / b / c (Titan ground, plain clean room, simple poster) | 2026-10-09 | `archive/exterior-backdrops-v1` |
| [mission-backdrop-drafts](mission-backdrop-drafts/README.md) | Drafts of the new backdrops: cut-off blueprint label, tiled ground seams, true-color thermal where cold parts blend in, faint yellow grid, white text on light grey; Exterior v2 drafts with gear over the telemetry text or on the phone's keep-out tape | 2026-10-08/09 (never published) | none |

### Replaced before this rule (in git history only, not yet archived here)

- The first arrival capsule and parachutes (simple cone heat shield, sphere-cap canopies, glow
  sphere), replaced 2026-09-29 by "Rework the arrival sequence graphics and camera" (a6571b6);
  last used in 51c4649.
- "Sleep until dawn" (woke at 06:00), replaced the same day by "Sleep until morning" (8090e0e);
  last used in efdf954.
- Start over's pop-up confirmation, replaced 2026-09-29 by the tap-twice button (63eb373).
