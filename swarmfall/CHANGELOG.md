# Swarmfall Change Log

Signed record of changes to the game and the Asset & Environment Lab, newest first, from
November 1, 2026, when Swarmfall became its own project folder. Earlier game entries are in the
[repository change log](../CHANGELOG.md), mixed with simulator entries. Use the same entry format
as that log (signed, with what changed, files, assumptions, checks and what is still open), and
add the entry in the same commit as the change.

## Entries

### 2026-11-01: Isolate Swarmfall into its own project folder
- **Signed:** GitHub Copilot (Claude Opus 5.5, GitHub Copilot app)
- **Commit:** Isolate Swarmfall into its own project folder
- **What changed:** The game, the lab, their tests, checklist (`TODO.md`), research and archive
  folders moved here from the repository root with their history. Everything the game loads is now
  inside `dist/`: its own three.js r180 and a pinned copy of the simulator modules it reuses
  (`dist/vendor/dragonfly/`, from simulator 454c3e6, refreshed with `tools/sync-dragonfly.mjs`).
  The website addresses are unchanged. Full details and checks are in the
  [repository change log](../CHANGELOG.md) entry of the same date.
- **Assumptions:** No rule, model, save format or visual changed; only import paths did.
- **Checks:** 305 game tests pass, including the new `tests/isolation.test.mjs`. The Dragonfly
  drone and Titan terrain from the pinned copy are identical to before, and a Titan mission and the
  lab's Titan Hive world load in a browser with no errors.
- **Open / next:** Not yet published. Move local ignored authoring files from the old
  `research/fantasy-city-2026-10-16/` path to `swarmfall/research/fantasy-city-2026-10-16/`.
