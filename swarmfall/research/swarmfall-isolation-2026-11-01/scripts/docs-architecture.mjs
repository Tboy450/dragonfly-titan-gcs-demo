import { pathToFileURL } from "node:url";
const { readDoc, writeDoc, replaceOnce } = await import(pathToFileURL(process.argv[2] + "/docutil.mjs").href);
const { eol, text } = readDoc("ARCHITECTURE.md");
const start = text.indexOf("### Swarmfall drone invasion game (`dist/invasion/`, its own page)\n");
const end = text.indexOf("### Documents and tooling\n");
if (start < 0 || end <= start) throw new Error("section bounds");
const section = text.slice(start, end);
const lines = section.split("\n");
const intro = lines.slice(1, 4).join("\n");
const table = lines.filter(line => line.startsWith("|")).map(line => line.replace(/`invasion\//g, "`")).join("\n");
const balance = section.slice(section.indexOf("Balance was checked")).trim();
const testRowStart = text.indexOf("| `invasion-battle.test.mjs`, `invasion-campaign.test.mjs` |");
const testRow = text.slice(testRowStart, text.indexOf("\n", testRowStart));

const expectedIntro = "A strategy game that reuses the simulator's Titan terrain, arrival hardware and research model.\nIt imports those modules read-only and never touches the simulator's state. Rules follow the\nsame split as the simulator: plain modules with tests, plus a page layer.";
if (intro !== expectedIntro) throw new Error("intro changed:\n" + intro);

const guide = `# Swarmfall: Architecture and Handoff Guide

A one-page map of the drone game and its Asset & Environment Lab for whoever works on it next.
Read it with the newest entries of [CHANGELOG.md](CHANGELOG.md) (from November 1, 2026) and,
for earlier history, the [repository change log](../CHANGELOG.md). The simulator's
[architecture guide](../ARCHITECTURE.md) holds the house rules, which apply here too.

## The short version

- A static web page with **no build step**: everything in \`dist/\` is served as-is.
  \`index.html\` loads \`main.mjs\`; the lab is \`dist/environments/index.html\`.
- **Tests:** \`node --test swarmfall/tests/*.test.mjs\` from the repository root (Node 22). They
  must pass before publishing.
- **Publishing:** the repository's workflow (\`.github/workflows/pages.yml\`) runs these tests and
  the simulator's, copies \`swarmfall/dist/\` into the site as \`invasion/\`, replaces every \`?v=dev\`
  with the commit and publishes to GitHub Pages. Leave the \`?v=dev\` stamps as they are.
- **Isolation:** everything the game and the lab load is inside \`dist/\`
  (\`tests/isolation.test.mjs\`). three.js is the game's own copy in \`dist/vendor/three/\`. The
  simulator modules the game reuses are a pinned copy in \`dist/vendor/dragonfly/\` with a manifest
  of hashes: do not edit it; change the simulator, then run \`node swarmfall/tools/sync-dragonfly.mjs\`
  (\`--check\` lists what differs). Nothing in the simulator imports the game.
- **Every change gets a signed entry** at the top of [CHANGELOG.md](CHANGELOG.md). Replaced work is
  archived in \`archive/\` here, with a row in [archive/README.md](archive/README.md).

## Files (\`dist/\`)

A strategy game that reuses the simulator's Titan terrain, arrival hardware and research model,
through the pinned copy in \`vendor/dragonfly/\`; it never touches the simulator's state. Rules
follow the same split as the simulator: plain modules with tests, plus a page layer.
${table}
| \`vendor/dragonfly/\` | Pinned copy of the simulator modules above: Titan terrain and its training geography, the arrival timeline and hardware, and the research model with the modules it imports; \`manifest.json\` records the simulator commit and a hash per file |
| \`vendor/three/\` | three.js r180, plus the GLTFLoader, OrbitControls and BufferGeometryUtils addons the lab loads through its import map |

${balance}

## Tests (\`tests/\`)

| File | Covers |
|---|---|
${testRow}
| \`isolation.test.mjs\` | The game page and the lab import only files inside \`dist/\`, no relative path leaves it (apart from the title screen's link to the simulator), the \`?v=dev\` stamps, and the pinned Dragonfly copy matching its manifest |

The other \`invasion-*.test.mjs\` files are named after the module or feature they cover.
\`tests/helpers/invasion-ui-harness.mjs\` runs the real \`main.mjs\` with DOM and renderer stand-ins;
\`tests/fixtures/invasion/\` holds real older saves for the migration tests.
`;
writeDoc("swarmfall/ARCHITECTURE.md", guide, eol);

const pointer = `### Swarmfall drone invasion game (\`swarmfall/\`, its own project)
Since November 1, 2026 the game and its Asset & Environment Lab are a separate project in
\`swarmfall/\`, published at \`invasion/\` by the same workflow. Its file map and tests are in
[swarmfall/ARCHITECTURE.md](swarmfall/ARCHITECTURE.md). It reuses this simulator's Titan terrain,
arrival hardware and research model through a pinned copy (\`swarmfall/dist/vendor/dragonfly/\`,
refreshed with \`node swarmfall/tools/sync-dragonfly.mjs\`), so changing those modules here changes
the game only once that copy is refreshed. Nothing in \`dist/\` may import the game
(\`tests/site-layout.test.mjs\`).

`;
let out = text.slice(0, start) + pointer + text.slice(end);
out = replaceOnce(out, "- **Tests:** `node --test tests/*.test.mjs` (Node 22). They must pass before publishing.",
  "- **Tests:** `node --test tests/*.test.mjs` (Node 22). They must pass before publishing.\n  Swarmfall has its own: `node --test swarmfall/tests/*.test.mjs`.", "tests bullet");
out = replaceOnce(out, "The workflow runs the tests, stamps versions and publishes\n  `dist/` to GitHub Pages.",
  "The workflow runs both test suites, adds `swarmfall/dist/` as\n  `invasion/`, stamps versions and publishes to GitHub Pages.", "publishing bullet");
out = replaceOnce(out, "| `SWARMFALL-TODO.md` | The game's update checklist:", "| `swarmfall/` | Swarmfall, the drone game, as its own project: see [swarmfall/README.md](swarmfall/README.md) |\n| `swarmfall/TODO.md` | The game's update checklist (formerly `SWARMFALL-TODO.md`):", "todo row");
out = replaceOnce(out, "| `.github/workflows/pages.yml` | Test, stamp and publish to GitHub Pages |",
  "| `.github/workflows/pages.yml` | Test both projects, add Swarmfall to the site as `invasion/`, stamp and publish to GitHub Pages |", "workflow row");
out = replaceOnce(out, testRow, "| `site-layout.test.mjs` | The simulator stands alone (no `dist/invasion/`, no imports from Swarmfall); the publish workflow tests both projects and adds Swarmfall at `invasion/` before stamping; the site's not-found page sends mistyped game links to the game. Swarmfall's own tests are in `swarmfall/tests/` |", "test row");
writeDoc("ARCHITECTURE.md", out, eol);
console.log(`moved ${table.split("\n").length} file rows and the test row to swarmfall/ARCHITECTURE.md`);
