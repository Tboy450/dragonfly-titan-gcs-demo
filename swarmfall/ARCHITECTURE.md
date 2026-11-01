# Swarmfall: Architecture and Handoff Guide

A one-page map of the drone game and its Asset & Environment Lab for whoever works on it next.
Read it with the newest entries of [CHANGELOG.md](CHANGELOG.md) (from November 1, 2026) and,
for earlier history, the [repository change log](../CHANGELOG.md). The simulator's
[architecture guide](../ARCHITECTURE.md) holds the house rules, which apply here too.

## The short version

- A static web page with **no build step**: everything in `dist/` is served as-is.
  `index.html` loads `main.mjs`; the lab is `dist/environments/index.html`.
- **Tests:** `node --test swarmfall/tests/*.test.mjs` from the repository root (Node 22). They
  must pass before publishing.
- **Publishing:** the repository's workflow (`.github/workflows/pages.yml`) runs these tests and
  the simulator's, copies `swarmfall/dist/` into the site as `invasion/`, replaces every `?v=dev`
  with the commit and publishes to GitHub Pages. Leave the `?v=dev` stamps as they are.
- **Isolation:** everything the game and the lab load is inside `dist/`
  (`tests/isolation.test.mjs`). three.js is the game's own copy in `dist/vendor/three/`. The
  simulator modules the game reuses are a pinned copy in `dist/vendor/dragonfly/` with a manifest
  of hashes: do not edit it; change the simulator, then run `node swarmfall/tools/sync-dragonfly.mjs`
  (`--check` lists what differs). Nothing in the simulator imports the game.
- **Every change gets a signed entry** at the top of [CHANGELOG.md](CHANGELOG.md). Replaced work is
  archived in `archive/` here, with a row in [archive/README.md](archive/README.md).

## Files (`dist/`)

A strategy game that reuses the simulator's Titan terrain, arrival hardware and research model,
through the pinned copy in `vendor/dragonfly/`; it never touches the simulator's state. Rules
follow the same split as the simulator: plain modules with tests, plus a page layer.
| File | What it does |
|---|---|
| `units.mjs` | Drone, defender, wildlife and society types; weapons per target class (ground, structure, air) so drones can later carry different arms against rival drones; pod slots and costs |
| `campaign.mjs` | The seven planets in campaign order, rewards, per-planet supply (scaled by the difficulty), saved progress (validated field by field, including each planet's last wave and the difficulty) and `applyMissionResult`; Frontier maps (`frontiers`), `missionSupply` and `applyFrontierResult`, which never touch the campaign bank |
| `mission-save.mjs` | Versioned JSON battle checkpoints, validation and terrain callback/pad restoration; stored with campaign progress by the page; battles record their map, city and landform, and `checkpointPlanet` rebuilds exactly that world (older Corvan saves included) |
| `battle.mjs` | One mission: zones, drops, orders (group pace, attack-move), movement, combat, capture (damage or control path, converted defenses), public alarm, reinforcements, artillery, income, mid-mission events (supply caches, counter-attacks, reinforcement waves), wildlife (a third side: dens, prowling, chases), objectives, stars, outcome; frontier scouting (`cityFound`, `hiddenUnits` for the page); direct fire needs a clear line past city buildings |
| `hazards.mjs` | Seeded environmental threats with advance warning; shelter in held zones; the forecast; where strikes land (near misses clear of the swarm, vents beside it), and lightning and eruptions that hit defenders too |
| `achievements.mjs` | Twelve campaign achievements, checked live and at the end of a mission |
| `planet-terrain.mjs` | Ground height per planet: Titan reuses `terrainHeight`; the other worlds are invented noise landscapes with liquid levels and level zone pads; a planet with `city` gets level city ground, `walkable`, `roofAt` and a building-aware `canDropAt`; a `landform` (frontier valley) gives ridged mountains, a flat valley, the beacon's basin and a pass, optional lava channels and volcano cones, plus `siteOK` for gentle zone sites |
| `city-layout.mjs` | A seeded, versioned city district (blocks, lots, tiered buildings, streets, squares, parks) and fast `buildingAt` / `roofAt` / `clearAt` / `lineBlocked` queries; the one source for city rules and drawing; styles "metropolis", "forge" (halls, smokestacks, cooling towers) and "town" (houses, keep, walls with gates, turrets) |
| `city-render.mjs` | Draws a city layout with the Environment Lab kit: streets, sidewalks, squares, parks, merged facade buildings and rooftop gear; forge cities get halls, stacks, towers, slag yards and animated smoke; towns get tile-roofed houses, a keep and crenellated walls |
| `random.mjs` | Seeded random numbers stored on the battle (reproducible missions) |
| `models.mjs` | Procedural drone, defender, structure and building geometry (vertex colors, merged for instancing) and the compacted Dragonfly research model |
| `scene.mjs` | three.js view: planet ground/sky/liquid/decor (Titan via `createTitanTerrain`), zone rings (with faint copies drawn on top so hills never hide them), instanced units, townspeople who flee drones (drawn only), shots, explosions, strike markers, weather particles, pods via `createArrivalHardware` + `edlStateAt` |
| `galaxy.mjs` | The campaign galaxy drawing, and where the title screen's galaxy goes beside the card |
| `battle-sound.mjs` | What the optional sound should be: hum, rain, wind and rumble levels from the battle and view, one-shot cues from events, and the sound levels |
| `sound.mjs` | Plays it with Web Audio (no sound files): beds, shots, explosions, chimes, sirens, thunder, pod entry and parachutes; off by default |
| `quality.mjs` | Graphics quality levels (decor, city detail, ground, pixel ratio) and adaptive resolution from frame time |
| `tips.mjs` | First-time tips: first defenders in sight, each kind of defense, alarm stages, first artillery and captured defense |
| `field-guide.mjs` | The Field guide: every drone, defender, society and hazard with numbers and counters, generated from the rules, plus the controls, and the same facts as tooltips for drop rows, matter, alarm and hazards (TUT-04), with the hazard forecast and counters (HAZ-03) |
| `paths.mjs` | Ground routes: a deterministic grid search round water, buildings and walls, used by troops on foot when blocked |
| `replay.mjs` | Replay challenges on conquered planets (ECON-04): Raised threat, Wild weather and On alert, which ones each planet offers, and the bonus each adds to the replay reward |
| `settings.mjs` | Device settings apart from the campaign save (CTRL-10): camera speed, invert drag, UI size and key bindings, checked on load; rebinding swaps a key in use; key names for labels and the Field guide |
| `tutorial.mjs` | The Titan tutorial: checked steps from the battle (drop to win, plus a weather step) and the button to highlight |
| `swarm-dust.mjs` | Rotor-wash dust: a pooled, seeded puff simulation for low drones and pod touchdowns, drawn with sprites |
| `camera-assist.mjs` | Follow the selected squads' center, the newest alert to jump to, lost-squad alerts, edge-of-screen alert arrows, edge scrolling and the starting view |
| `frame-clock.mjs` | Turns each frame's real time into battle steps of at most 0.05 s: slow frames catch up, stalls are dropped, sustained lag is detected |
| `free-camera.mjs` | The free camera's movement: start from and return to the orbit camera, fly with limits (ground, roofs, ceiling, map edge, no flying into buildings) |
| `main.mjs` | Screens, saving, the mission loop, camera and touch controls, selection, orders, drop panel, HUD, minimap, debrief |
| `index.html`, `invasion.css` | Markup and styles (phone layout in the last section) |
| `vendor/dragonfly/` | Pinned copy of the simulator modules above: Titan terrain and its training geography, the arrival timeline and hardware, and the research model with the modules it imports; `manifest.json` records the simulator commit and a hash per file |
| `vendor/three/` | three.js r180, plus the GLTFLoader, OrbitControls and BufferGeometryUtils addons the lab loads through its import map |

Balance was checked with a scripted bot that plays the whole campaign (all seven planets won on
first tries, losses rising from 0 to about 150 drones); real playtesting is still needed.

## Tests (`tests/`)

| File | Covers |
|---|---|
| `invasion-battle.test.mjs`, `invasion-campaign.test.mjs` | Swarmfall: practice win and Dragonfly recovery, drop checks, damage and control paths, hazard warnings, lightning, solar flares, loss and retreat, generated planets on dry level ground, determinism, campaign order and rewards, save validation, achievements, page stamps |
| `isolation.test.mjs` | The game page and the lab import only files inside `dist/`, no relative path leaves it (apart from the title screen's link to the simulator), the `?v=dev` stamps, and the pinned Dragonfly copy matching its manifest |

The other `invasion-*.test.mjs` files are named after the module or feature they cover.
`tests/helpers/invasion-ui-harness.mjs` runs the real `main.mjs` with DOM and renderer stand-ins;
`tests/fixtures/invasion/` holds real older saves for the migration tests.
