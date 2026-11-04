import { pathToFileURL } from "node:url";
const { readDoc, writeDoc, relinkBlock, replaceOnce } = await import(pathToFileURL(process.argv[2] + "/docutil.mjs").href);
const { eol, text } = readDoc("README.md");
const start = text.indexOf("\n## Swarmfall: Drone Invasion (game)\n") + 1;
const end = text.indexOf("\n## Run Locally\n") + 1;
if (start <= 0 || end <= start) throw new Error("section bounds");
let block = text.slice(start, end);

// The moved sections, verbatim apart from stale paths and their heading levels.
block = replaceOnce(block, "## Swarmfall: Drone Invasion (game)\n", "## The game\n", "heading");
block = replaceOnce(block, "### Asset & Environment Lab\n", "## Asset & Environment Lab\n", "lab heading");
block = replaceOnce(block, "(its own page,\n`dist/invasion/`; the simulator above is unchanged)", "(its own page,\n`swarmfall/dist/`; the simulator is unchanged)", "own page");
block = replaceOnce(block, "Rules are in plain modules with tests (`tests/invasion-*.test.mjs`); see\nARCHITECTURE.md.", "Rules are in plain modules with tests (`swarmfall/tests/invasion-*.test.mjs`); see\n[ARCHITECTURE.md](ARCHITECTURE.md).", "tests");
block = replaceOnce(block, "Run `python research/fantasy-city-2026-10-16/preview-server.py` from the\nrepository root", "Run `python swarmfall/research/fantasy-city-2026-10-16/preview-server.py` from the\nrepository root", "preview server");
block = relinkBlock(block, "", "swarmfall");

const header = `# Swarmfall: Drone Invasion

[Play Swarmfall](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/) ·
[Asset & Environment Lab](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/) ·
[Update checklist](TODO.md) · [Change log](CHANGELOG.md) · [Code map](ARCHITECTURE.md)

A drone-swarm strategy game built from parts of the [Dragonfly Titan simulator](../README.md).
Since November 1, 2026 everything that belongs to the game lives in this folder, separate from
the simulator. Its web addresses are unchanged: the publish workflow still puts it at \`/invasion/\`.

## What is where

| Path | What |
|---|---|
| \`dist/\` | The game (\`index.html\`, \`main.mjs\` and the rule modules) and the Asset & Environment Lab (\`dist/environments/\`), served as-is with no build step |
| \`dist/vendor/three/\` | The game's own copy of three.js r180, plus the lab's three addons |
| \`dist/vendor/dragonfly/\` | A pinned copy of the simulator modules the game uses ([what and why](dist/vendor/dragonfly/README.md)) |
| \`tests/\` | The game's tests, with their fixtures and UI harness |
| \`tools/sync-dragonfly.mjs\` | Checks or refreshes the pinned simulator copy |
| \`TODO.md\` | The prioritized update checklist (formerly \`SWARMFALL-TODO.md\` at the repository root) |
| \`CHANGELOG.md\` | Signed record of game changes from November 1, 2026; earlier ones are in the [repository change log](../CHANGELOG.md) |
| \`research/\`, \`archive/\` | Game and lab research notes, and archived earlier versions ([index](archive/README.md)) |

The simulator never imports anything from here, and the game loads nothing from the simulator.
Titan's terrain, the drop pods' parachutes and arrival timeline, and the Dragonfly drone (the
simulator's research model without its interior) come from the pinned copy, so a simulator change
reaches the game only when someone refreshes that copy on purpose.

## Run, check and publish

From the repository root:

\`\`\`sh
python -m http.server 4177 --directory swarmfall/dist   # the game at /, the lab at /environments/
node --test swarmfall/tests/*.test.mjs                  # the game's checks (Node 22)
node swarmfall/tools/sync-dragonfly.mjs --check         # has the simulator changed since the copy?
\`\`\`

To preview the site as it is published (simulator at \`/\`, game at \`/invasion/\`, no caching), run
\`python swarmfall/research/fantasy-city-2026-10-16/preview-server.py\` and open
http://127.0.0.1:4201/invasion/.

Pushing to \`main\` runs both projects' tests, adds \`swarmfall/dist\` to the site as \`invasion/\`,
replaces every \`?v=dev\` and "Build local" with the commit and publishes to GitHub Pages
(\`.github/workflows/pages.yml\`). The simulator's [house rules](../ARCHITECTURE.md#house-rules)
apply here too: leave the \`?v=dev\` stamps alone, label estimates, archive replaced work (in this
folder's \`archive/\`) and sign every change in this folder's change log.

The research and archive folders moved here with their history. Notes written before the move
say "from the repository root" and name paths such as \`dist/invasion/\`; for game material, read
them relative to this folder, which keeps the old layout (\`dist/\`, \`research/\`, \`archive/\`,
\`tests/\`). Local files ignored by git (Blender and Houdini scenes, conversion tools) stay at their
old \`research/fantasy-city-2026-10-16/\` path in existing checkouts; move them to
\`swarmfall/research/fantasy-city-2026-10-16/\` before running that folder's scripts.

`;
writeDoc("swarmfall/README.md", header + block.replace(/\n+$/, "\n"), eol);

const pointer = `## Swarmfall: Drone Invasion (game)

[Play Swarmfall](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/) ·
[Asset & Environment Lab](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/)

A drone-swarm strategy game built from parts of this simulator. Since November 1, 2026 it is a
separate project in [swarmfall/](swarmfall/README.md), with its own code, tests, checklist, change
log, research and archive; its web addresses are unchanged. It uses a pinned copy of this
simulator's Titan terrain, arrival hardware and research model, so simulator changes reach the
game only when that copy is refreshed on purpose ([details](swarmfall/dist/vendor/dragonfly/README.md)).
The game's sections that used to be here, including the Asset & Environment Lab, are now in
[swarmfall/README.md](swarmfall/README.md).

`;
let root = text.slice(0, start) + pointer + text.slice(end);
root = replaceOnce(root, "Serve the `dist` folder over HTTP, then open the local URL (the game is at `/invasion/`):", "Serve the `dist` folder over HTTP, then open the local URL:", "run locally");
root = replaceOnce(root, "The app uses JavaScript modules and WebGL 2. Dependencies are included locally;\nthere is no package installation or build step.\n",
  "The app uses JavaScript modules and WebGL 2. Dependencies are included locally;\nthere is no package installation or build step. Swarmfall is served from its own folder\n(`python -m http.server 4177 --directory swarmfall/dist`); see [swarmfall/README.md](swarmfall/README.md).\n", "run locally 2");
root = replaceOnce(root, "## Checks\n\n```sh\nnode --test tests/*.test.mjs\n```", "## Checks\n\n```sh\nnode --test tests/*.test.mjs             # the simulator and the site layout\nnode --test swarmfall/tests/*.test.mjs   # Swarmfall (the publish workflow runs both)\n```", "checks");
root = replaceOnce(root, "Pushing to `main` runs the checks and publishes `dist` to GitHub Pages.", "Pushing to `main` runs both sets of checks and publishes `dist` to GitHub Pages, with\n`swarmfall/dist` added as `invasion/`.", "publishing");
writeDoc("README.md", root, eol);
console.log(`README.md: moved ${block.split("\n").length} lines to swarmfall/README.md`);
