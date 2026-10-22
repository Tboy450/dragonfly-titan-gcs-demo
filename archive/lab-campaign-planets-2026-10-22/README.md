# Lab before the Campaign planets world

Preserved October 22, 2026 — **Claude (Anthropic)**. Baseline
`fb7c00b`, tag `archive/lab-campaign-planets-2026-10-22`.

The change is additive: a twelfth lab entry, **Campaign planets** (`worlds/planets.mjs`), shows
each non-Titan campaign planet and Frontier map from the game's own terrain, battle, city and
look modules, with a planet picker. Every earlier world, the asset inspector and the kit the game
imports behave as before. Four existing lab files gained small hooks, kept here exactly as they
were (from git `HEAD`):

- `original/lab.mjs` — before worlds could return `title`, `description`, `views` and `choices`.
- `original/index.html` — before the twelfth menu link and the `#world-choices` picker.
- `original/lab.css` — before the picker's wrap rule.
- `original/index.mjs` (`worlds/index.mjs`) — before the `planets` entry.

Pictures: `before-lab-menu.jpg` (lab panel at the baseline, Titan Hive outpost) and
`after-aurex-planet-picker.jpg` (Aurex with the picker, its solid skyline and capture zones).

**Restore:** copy the four files in `original/` back over `dist/invasion/environments/lab.mjs`,
`index.html`, `lab.css` and `worlds/index.mjs`, delete `worlds/planets.mjs` and
`tests/invasion-lab-planets.test.mjs`, then run `node --test tests/*.test.mjs`. Or check out
the tag in a separate worktree. No game file, kit file or save format changed.
