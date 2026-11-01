# Dragonfly simulator modules (Swarmfall's pinned copy)

Swarmfall reuses a few parts of the Dragonfly Titan simulator: Titan's terrain and haze
(`titan-terrain.mjs`, with the training geography in `mission-systems.mjs`), the arrival
timeline (`edl.mjs`) and parachute/backshell hardware (`arrival-hardware.mjs`) used by drop
pods, and the research model (`vehicle-research.mjs`) that becomes the Dragonfly drone once its
interior is removed. Those modules and everything they import are copied here so the game never
imports the simulator, and simulator work cannot change battles, saves or the drone by accident.

- **Do not edit these files.** Change the simulator (`dist/` at the repository root), then
  refresh this copy on purpose:

  ```sh
  node swarmfall/tools/sync-dragonfly.mjs --check   # what differs from the simulator now
  node swarmfall/tools/sync-dragonfly.mjs           # copy it
  ```

  Review the diff, run `node --test swarmfall/tests/*.test.mjs` and look at the Titan map and
  the Dragonfly in the game before publishing. Titan battles and Dragonfly saves depend on
  `terrainHeight` and the model, so treat a refresh like any other gameplay change.
- `manifest.json` records the simulator commit the copy was taken from and a SHA-256 per file;
  `swarmfall/tests/isolation.test.mjs` fails if a file is edited, added or removed by hand.
- The only changes from the originals are a two-line header and the three.js import path
  (`./vendor/three/` becomes `../three/`, the game's own copy).
- The entry modules are listed in `entries` in the tool; their imports are followed
  automatically. The tool stops with an error if a module starts importing something it does
  not know how to copy (another folder, an addon, a new asset type).
