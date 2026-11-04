# Swarmfall Change Log

Signed record of changes to the game and the Asset & Environment Lab, newest first, from
November 1, 2026, when Swarmfall became its own project folder. Earlier game entries are in the
[repository change log](../CHANGELOG.md), mixed with simulator entries. Use the same entry format
as that log (signed, with what changed, files, assumptions, checks and what is still open), and
add the entry in the same commit as the change.

## Entries

### 2026-11-03: Review and merge the isolation into main
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Merge Swarmfall isolation into main" and "Keep the isolation's helper scripts and review notes"
- **What changed:** Reviewed GitHub Copilot's isolation branch (`f1fa793`, entry below) at the
  owner's request and merged it into main (`5430a12`). The only conflict was the repository
  change log, where both sets of entries were kept.
  - Copilot's 13 helper scripts were never committed, so they are kept unchanged in
    `research/swarmfall-isolation-2026-11-01/scripts/`, with a README that says what each did.
  - That README also records this review's checks.
  - The backup tag `backup/pre-swarmfall-isolation-2026-11-03` marks main just before the merge.
- **Why:** The owner wanted Swarmfall to be its own modular project without fully leaving the
  simulator. This keeps one repository, one website and the same addresses, and simulator work
  can no longer change the game by accident. A separate repository stays possible later; this
  folder can be split out with its history.
- **Checks:**
  - 305 game tests pass, and so does the site-layout test once the merge's empty `dist/invasion/`
    folders were removed.
  - The simulator suite's one failure (the IEM cable sweep) also fails before the merge.
  - Copilot's identity check found the Dragonfly drone, Titan terrain, arrival timeline and
    Titan's battle ground unchanged.
  - The assembled site matches main's, apart from the game's own copies and the three add-ons
    moved under `invasion/`.
  - No document link broke.
  - In the browser, through a preview serving the published layout: a Titan mission loaded
    every script from `/invasion/`. The Asset Lab's add-ons came from the game's own copy. The
    simulator page loaded, with no failed requests or console errors.
- **Open / next:**
  - About 2.8 GB of local-only city art tools (portable Blender and Python, authoring scenes,
    5 untracked screenshots) are still at `research/fantasy-city-2026-10-16/`. Move them here
    before running that folder's scripts.
  - The pinned simulator copy is 3 interior files behind; refresh it only when the game should
    take simulator changes.

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
