# Swarmfall isolation: the move's helper scripts (November 1, 2026)

GitHub Copilot moved Swarmfall from the repository root into `swarmfall/` on November 1, 2026
(commit `f1fa793`, branch `tboy450-isolate-swarmfall`). These are the scripts it wrote to plan,
carry out and check that move. Copilot left them uncommitted in its own worktree. Claude copied
them here unchanged on November 3, 2026, when it reviewed and merged the branch into main, so
the record of how the move was made and checked is kept with the project.

They are one-time tools. Several read temporary files the move produced (`move-map.json`,
`old-files.json`), which were not kept, so they will not run again as they are. Nothing in the
game, the tests or the publish workflow uses them.

| Script | What it did |
|---|---|
| `scripts/plan.mjs` | Built the move plan (old path → new path) for every tracked file |
| `scripts/codemod.mjs` | Re-pointed relative imports and links in moved files to their new or vendored targets |
| `scripts/verify-move.mjs` | Checked every planned file exists at its new path and git sees the moves as renames |
| `scripts/fix-research-scripts.mjs` | Re-pointed research scripts from `dist/invasion/` to the new `dist/` paths |
| `scripts/doclinks.mjs`, `docutil.mjs`, `docs-readme.mjs`, `docs-architecture.mjs`, `docs-archive.mjs` | Moved and re-linked README, ARCHITECTURE and archive index text between the root and `swarmfall/` |
| `scripts/checklinks.mjs` | Checked that document links which worked before the move still work |
| `scripts/ci-sim.mjs` | Ran the publish workflow's assemble and stamp steps on a copy and compared the result with the published site |
| `scripts/identity.mjs` | Built the Dragonfly drone, Titan's terrain, the arrival timeline and Titan's battle ground from the old layout and from the pinned copy, and compared them |
| `scripts/measure-dragonfly.mjs` | Measured what the game's Dragonfly drone costs to build (meshes and vertices, before and after removing the interior) |

## Checks re-run by Claude, November 3, 2026

On the branch alone, and on the branch merged with that day's main (`5430a12`):

- **Tests:** `node --test swarmfall/tests/*.test.mjs` passed (305), and so did
  `tests/site-layout.test.mjs` (3).
- **Identity:** `identity.mjs`, run against the published tree at `454c3e6`, found 0
  differences. The Dragonfly drone had 269 meshes and 383,939 vertices on both sides, and Titan
  terrain (4,544 samples), the arrival timeline (301 times) and Titan's battle ground all matched.
- **Published site:** the site assembled as the workflow does, compared with what main
  published that day:
  - Added: the game's own copies (62 files in `invasion/vendor/dragonfly`, 7 in
    `invasion/vendor/three`).
  - Moved: three three.js add-ons that only the Asset Lab used now live under `invasion/`.
  - Changed: import paths only, plus the Asset Lab's import map.
- **Simulator drift:** `swarmfall/tools/sync-dragonfly.mjs --check` reported 3 simulator files
  newer than the pinned copy (`thermal-loop.mjs`, `warm-duct-passages.mjs` and a new
  `trim-interfaces.mjs`). These are interior parts the game removes, so the copy was left as it
  is.
- **Document links:** 47 relative links were broken before the merge and 47 after. None broke
  because of the move.
