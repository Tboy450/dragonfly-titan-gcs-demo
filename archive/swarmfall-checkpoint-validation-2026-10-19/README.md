# Checkpoints before validation hardening

Preserved October 19, 2026 — **Codex (OpenAI)**. Baseline `cf4c866646e96bc68c4db83700255689b4913c2d`,
tagged `archive/swarmfall-checkpoint-validation-2026-10-19`.

`original/mission-save.mjs` and `original/invasion-mission-save.test.mjs` retain the exact
prior production validator and its original test file. The former accepted finite basic
fields but left gaps in unit classes/combat fields, orders, references, wave completeness,
strikes, hazard internals and bounded JSON data. The new release preserves checkpoint v3
and v1/v2 migrations; it tightens acceptance rather than replacing the save format.

`historical-restored-mission-2026-10-16.png` is the dated October 16 picture already
preserved in the drop-wave archive. It is historical context, not a fresh October 19
browser verification. This update changes validation, not the interface or artwork.

Use the tag in a separate checkout to reproduce prior behavior, or compare `original/`
with the current corresponding files under `dist/invasion/` and `tests/`. Preserve current
work and saved data before restoring anything. The [comparison script](../../research/swarmfall-checkpoint-validation-2026-10-19/compare-validators.mjs)
loads this archived validator without overwriting the active one.
