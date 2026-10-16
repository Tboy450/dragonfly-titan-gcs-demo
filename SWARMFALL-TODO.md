# Swarmfall Update Checklist

Owner request recorded October 16, 2026: the game "still needs a lot of work"; keep an extensive
update checklist. Started by Claude (Anthropic Claude Opus 5.5).
The game lives in `dist/invasion/` and is live at
https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/ (see README and ARCHITECTURE.md).
Keep this file updated across sessions and assistant handoffs.

## How to use this list

- Every item has an ID (for example `CTRL-03`), so the owner can ask for items by number.
- **P1** = needed for a solid public game (do these next). **P2** = important depth.
  **P3** = later ideas.
- ★ marks things the owner asked for directly.
- Tick an item in the same commit as the work, add the worker's name after it, and add a signed
  CHANGELOG entry (house rule 5).
- Game rules stay in plain modules with tests (`battle.mjs`, `campaign.mjs`, `units.mjs`,
  `hazards.mjs`, `achievements.mjs`); `main.mjs` and `scene.mjs` only read them (house rule 3).
- Replaced work is archived, never deleted (house rule 6).

## Resume here (October 16, 2026)

- **Codex continuation (October 16):** FIX-01 implemented locally: active missions autosave
  every 5 seconds and when the page is hidden/left. Resume from the title, paused, with terrain,
  orders, drops, hazards and camera restored. New missions ask before replacing a checkpoint.
  Campaign progress and the checkpoint share one storage record. See the signed CHANGELOG entry
  for verification and release status. The existing aft-bulkhead changes remain separate.
- **New owner requests (October 16):** pilot/first-person campaign, later drone builder,
  optional extraction after victory requirements, and multiple small pods. Tracked as
  MODE-20, MODE-21, OBJ-07 and DROP-01 below; these are planned, not implemented.

- **Live build:** `8b2399b`. The game arrived in `73c83e6`; `8b2399b` added the forgiving 404
  page. 237 tests pass on the committed tree.
- **Balance** was tuned only with a scripted bot that plays the whole campaign. It won all seven
  planets on its first tries, with losses rising from 0 (Titan) to about 150 drones (Aurex).
  No human playtest yet (TEST-03).
- **Not part of the game:** another session's uncommitted aft-bulkhead work is in the working
  tree with one failing test (OPS-01). Keep it out of game commits.
- **Suggested next step:** Milestone 1.

## Milestones (suggested order)

1. **Playable and polished:** the P1 items in FIX, TUT, CTRL, AUD, PERF and TEST, then human
   playtests.
2. **Deeper campaign:** ECON upgrades, new drones (DRONE), smarter defenders and a visible
   public (ENEMY), wildlife and new hazards (HAZ), more objective kinds (OBJ).
3. **New modes:** free mode (MODE-01 to 03) and local versus (MODE-10 to 15).
4. **Look and sound:** VIS and the rest of AUD.
5. **More content:** more planets, star systems and story (OBJ-03, OBJ-06).

## Built so far (October 15-16, Claude)

- [x] Separate page `dist/invasion/` with its own public link; the simulator is unchanged apart
  from how `titan-terrain.mjs` finds its ground texture.
- [x] Campaign galaxy: seven planets in order, each unlocking the next; rewards (matter, drone
  types, pod slots); a minimum supply per planet so a lost mission can always be retried.
- [x] Titan as the empty practice planet on the simulator's real terrain; NASA's Dragonfly
  parked at its landing site, recoverable as an unlockable drone (the research model).
- [x] Society levels 0-5 and threat levels 0-5; 4 mobile defender types and 7 structures.
- [x] Drop pods with the simulator's aeroshell, heat shield and parachutes; one squad per pod;
  matter as the resource; pod slots; drop cooldown.
- [x] Damage path (Strikers, Breachers, salvage, rising alarm) and control path (Links capture
  under fire, calm the public, turn standing defenses).
- [x] Public alarm with moods, militia raids, stronger defenses and artillery.
- [x] Nine hazards, each announced before it starts; shelter in held zones.
- [x] Weapons per target class (ground, structure, air), ready for drone-vs-drone weapons.
- [x] Two optional objectives per planet (three stars), twelve achievements, progress saved in
  the browser.
- [x] Controls: tap to select and order, drag/pinch/rotate camera, keyboard keys, minimap,
  drop panel, debrief; phone layout.
- [x] 17 game tests; the balance bot beats all seven planets.
- [x] Forgiving 404 page: mistyped or decorated game links forward to the game.

## 1. Known problems (FIX)

- [x] **FIX-01 (P1) — Codex (October 16, local)** Save and resume an active battle, including
  its terrain callback/pads. Title-screen Resume mission; autosave every 5 s and on page exit/
  hiding, resumed missions paused, malformed/version-mismatched saves ignored. New-mission
  replacement confirmation; unavailable-storage warning. Release status in CHANGELOG.
- [ ] **FIX-02 (P1)** Drones fly through Aurex's towers (skyline up to about 48 m; drones cruise
  at 15-28 m) and through hills. Make flying height follow terrain and buildings
  (`battle.mjs` for the rule, `scene.mjs` for the obstacles).
- [ ] **FIX-03 (P1)** Ground troops walk in straight lines and simply stop at shorelines. Add
  pathfinding (a grid search on `isLand`, or flow fields).
- [ ] **FIX-04 (P1)** Drones are a few pixels wide when zoomed out. Draw squad-colored markers
  in the overlay when a unit would be too small to see.
- [ ] **FIX-05 (P2)** After its target dies, an attack order moves on to the nearest defender
  within 110 m, sometimes off screen with no feedback. Show the new target and allow "stop".
- [ ] **FIX-06 (P2)** Zone rings follow the ground but steep Titan dunes and trees can still
  hide parts of them. Consider drawing them on top at low opacity.
- [ ] **FIX-07 (P2)** On phones the objectives and log panels cover much of the battlefield.
  Collapse them after the first capture and add a log toggle.
- [ ] **FIX-08 (P2)** The drop panel and the "pick a zone" hint stay open under the debrief when
  a mission ends. Close them in `finishMission`.
- [ ] **FIX-09 (P2)** Aurex, the last planet, is very hard (bot: about 16 minutes and 150 drones
  lost). Revisit after human playtests.
- [ ] **FIX-10 (P2)** The title card hides the title screen's spiral galaxy.
- [ ] **FIX-11 (P3)** "Hold" with no squad selected does nothing and says nothing. Show a hint.
- [ ] **FIX-12 (P3)** Strikes, retaken zones and lost squads off screen give no cue. Add an
  edge-of-screen marker (see CTRL-06).

## 2. Tutorial and onboarding (TUT)

- [ ] **TUT-01 (P1)** Interactive Titan tutorial with highlighted buttons and checked steps
  (drop, select, move, capture, ride out a hazard, recover the Dragonfly); skippable. Replaces
  the coach text in `main.mjs`.
- [ ] **TUT-02 (P1)** First-time tips when something new appears: first defenders, first
  jammer, each alarm stage, first artillery, first converted defense.
- [ ] **TUT-03 (P2)** Encyclopedia: every drone, defender, society and hazard with its numbers
  and what beats it (generated from `units.mjs` and `hazards.mjs`).
- [ ] **TUT-04 (P2)** Tooltips on drop-panel rows and HUD items (alarm thresholds, hazard
  effects, supply).
- [ ] **TUT-05 (P3)** A short intro screen for the Hive and the campaign.

## 3. Controls and HUD (CTRL)

- [ ] **CTRL-01 (P1)** Drag-box selection on desktop and a lasso or two-finger selection on
  touch screens.
- [ ] **CTRL-02 (P1)** Squad tools: merge, split, rename, select by drone type, renumber keys.
- [ ] **CTRL-03 (P1)** Waypoint queues (Shift+tap), patrol and an "attack-move here" order.
- [ ] **CTRL-04 (P1)** Desktop convention: left-click selects, right-click orders (today both
  happen on a left tap).
- [ ] **CTRL-05 (P1)** Camera: follow the selected squad, jump to the last alert, edge-scroll,
  reset view.
- [ ] **CTRL-06 (P1)** Alerts with minimap pings and tap-to-jump: squad under attack, zone being
  retaken, hazard incoming, artillery marked.
- [ ] **CTRL-07 (P2)** Formation choices (spread, tight, line) and stances (aggressive, hold
  fire for a quiet takeover).
- [ ] **CTRL-08 (P2)** Give orders by tapping the minimap.
- [ ] **CTRL-09 (P2)** Drop presets ("assault", "hack team"), remembered per planet.
- [ ] **CTRL-10 (P2)** Settings: camera speed, invert drag, key rebinding, UI size.
- [ ] **CTRL-11 (P3)** Gamepad support.
- [ ] **CTRL-12 (P3)** Pause menu with restart, settings and quit to the galaxy.

## 4. Economy and progression (ECON)

- [ ] **ECON-01 (P1)** Hive upgrades bought with banked matter between missions: pod slots,
  pod cooldown, drone armor, speed and damage, hazard resistance, Link hack speed. New screen;
  rules in `campaign.mjs`.
- [ ] **ECON-02 (P2)** A research tree that unlocks drones and abilities, instead of fixed
  planet rewards.
- [ ] **ECON-03 (P2)** Review every matter source and cost (zone income, salvage, Dragonfly
  drilling, recall refund, supply floor) and record the reasoning (DOC-01).
- [ ] **ECON-04 (P2)** Replay modifiers on conquered planets (higher threat, extra hazards) for
  bonus matter and stars.
- [ ] **ECON-05 (P3)** A seeded challenge planet of the day.

## 5. Drones and weapons (DRONE)

- [ ] **DRONE-01 (P2)** Warden: shields drones near it.
- [ ] **DRONE-02 (P2)** Mender: repairs drones in the field.
- [ ] **DRONE-03 (P2)** EMP drone: switches a structure off for a few seconds (a control-path
  tool).
- [ ] **DRONE-04 (P2)** Carrier (releases small drones) and Harvester (gathers matter at
  deposits).
- [ ] **DRONE-05 (P2)** Stealth Scout: unseen by defenders until it fires; does not raise the
  alarm.
- [ ] **DRONE-06 (P2)** Dragonfly abilities: wide-area scan, a drilling animation with dust
  (reuse the simulator's drill and downwash-dust modules), faster capture while landed.
- [ ] **DRONE-07 (P2)** Drone energy with recharge in held zones (ideas from the simulator's
  energy model), giving a reason to rotate squads.
- [ ] **DRONE-08 (P3)** Veteran squads: ranks earned from kills and captures.
- [ ] **DRONE-09 ★ (P2)** Weapons for fighting other drones, different from those used on
  defenders and planet threats: EMP pulse, flak pods, net launcher. Uses the existing `air`
  target class in `units.mjs`; needed by MODE-12.

## 6. Defenders, society and the public (ENEMY)

- [ ] **ENEMY-01 (P1)** Make the public visible: people in settlements who flee from drones;
  panic raises the alarm; harming them carries a penalty.
- [ ] **ENEMY-02 (P2)** Behavior by society level: tribal ambushes, agrarian barricades,
  industrial repair crews, networked defenders hacking drones back, spacefaring counter-drops.
- [ ] **ENEMY-03 (P2)** Enemy aircraft below level 5 (balloons, helicopters, jets) and boats on
  Halcyon.
- [ ] **ENEMY-04 (P2)** A capital core per planet: a boss structure with phases.
- [ ] **ENEMY-05 (P2)** Turrets that aim, radar dishes that turn, damaged and destroyed models
  with rubble.
- [ ] **ENEMY-06 (P2)** The public beyond one alarm meter: morale per zone, Link broadcasts,
  uprisings that flip zones back.
- [ ] **ENEMY-07 (P3)** Surrender: high control and low alarm make a settlement give up without
  a fight.

## 7. Planet threats and hazards (HAZ)

- [ ] **HAZ-01 ★ (P2)** Wildlife and other threats on the planet (owner: "other threats on the
  planet"): sandworms on Kepra, swamp beasts on Velm, ice crawlers on Corvan. Neutral; they
  attack anything nearby.
- [ ] **HAZ-02 (P2)** More hazards: quakes, floods and tides on Halcyon, meteor showers,
  radiation storms, sinkholes.
- [ ] **HAZ-03 (P2)** A forecast of the next hazards, and counters (shelters, resistance
  upgrades from ECON-01).
- [ ] **HAZ-04 (P2)** Let some hazards hit defenders too (lightning, eruptions), so the
  weather can be used as a weapon.
- [ ] **HAZ-05 (P3)** Day and night per planet (ideas from `titan-day.mjs`): shorter sight at
  night, defenders' searchlights.

## 8. Objectives, campaign and story (OBJ)

- [ ] **OBJ-01 (P2)** More objective kinds: hold for a time, protect a zone, destroy the
  headquarters, take a planet without destroying anything, escort the Dragonfly, rescue
  downed drones.
- [ ] **OBJ-02 (P2)** Mid-mission events: reinforcement waves, supply drops, announced
  counter-attacks.
- [ ] **OBJ-03 (P2)** Briefing and debrief text per planet; story beats along the campaign.
- [ ] **OBJ-04 (P2)** More achievements (per planet, per drone), badge art, progress bars for
  counting goals.
- [ ] **OBJ-05 (P2)** Difficulty levels that scale defenders, hazards and supply.
- [ ] **OBJ-06 (P3)** More planets: several star systems on the campaign map, branching routes.

## 9. Game modes (MODE)

- [ ] **MODE-20 ★ (P2)** First-person / pilot campaign experience (owner, October 16).
  Let the player pilot a drone during campaign battles, with a cockpit/pilot camera and
  flight/aim controls. Define how piloting switches back to swarm command and how the other
  squads behave while the player flies. Preserve campaign objectives, hazards and progression.
- [ ] **MODE-21 ★ (P3)** Future Tank Wars-style drone builder for the pilot campaign (owner,
  October 16). Design configurable drone bodies, propulsion, weapons and equipment, with
  understandable cost/performance tradeoffs. This is a future design request; scope and
  the specific Tank Wars reference need clarification when implementation begins.
- [ ] **OBJ-07 ★ (P1)** Meeting the level's required objectives should offer a choice:
  **leave and claim victory** or **continue capturing everything** (owner, October 16).
  Keep the battle running when continuing, retain an explicit victory/extraction action,
  show remaining zones, and award campaign rewards exactly once. Define loss/retreat after
  victory is available and when optional objectives/stars are finalized. The current game
  ends the mission automatically as soon as the required zone count is reached.
- [ ] **DROP-01 ★ (P2)** Split a squad's delivery into multiple parachute pods carrying
  **1–3 drones per pod**, dropped beside one another (owner, October 16; suggested rule).
  Keep one squad/order group across the wave. Show pod count before launch; find spaced,
  safe landing points inside the chosen zone, with a fallback when space is limited.
  Charge matter once for the full payload and apply cooldown once per wave. Update arrivals,
  release timing, inbound counts, save/resume and drop HUD; test small and large payloads.

Free mode (★ owner: "eventually a free mode with a universe or galaxy to pick planets"):

- [ ] **MODE-01 ★ (P2)** Planet generator from a seed: biome, society, threat, hazards, zone
  count. `createBattle` already accepts any planet object; extend `planet-terrain.mjs`.
- [ ] **MODE-02 ★ (P2)** A galaxy browser with many star systems: pick any planet and see its
  details (builds on `galaxy.mjs`).
- [ ] **MODE-03 (P2)** Custom settings (starting matter, pod slots, hazards on or off) and
  shareable seeds.

Local versus (★ owner: "a larger local versus mode where you fight to see who can take over a
planet first", with drones using different weapons against each other than against the NPCs
and other threats on the planet):

- [ ] **MODE-10 ★ (P2)** Two swarms on one planet. `battle.mjs` has one player side ("swarm")
  and the locals ("native"); split the swarm into players, each with matter, squads, a Hive
  beacon and drops.
- [ ] **MODE-11 ★ (P2)** Race rules: first to hold N zones wins, or most control at a time
  limit; the locals and the planet's threats fight both players.
- [ ] **MODE-12 ★ (P2)** Drone-vs-drone weapons that differ from those used on NPCs and planet
  threats (DRONE-09).
- [ ] **MODE-13 ★ (P2)** Larger maps, and local play on one device: split screen or two halves
  of a tablet, plus pass-and-play.
- [ ] **MODE-14 (P3)** A computer-controlled rival swarm for solo versus practice (the balance
  bot is a starting point).
- [ ] **MODE-15 (P3)** Online versus (needs TECH-02's fixed-step simulation).

## 10. Look (VIS)

- [ ] **VIS-01 (P1)** Rotor-wash dust under low drones and at pod touchdown (reuse
  `downwash-dust.mjs`).
- [ ] **VIS-02 (P2)** More detailed drones: panel detail, lights, smoke when damaged, banking
  in turns.
- [ ] **VIS-03 (P2)** Effects: muzzle flashes, missile trails, shock rings, burning wrecks,
  scorch marks, a color sweep on capture, a hacking beam from Links.
- [ ] **VIS-04 (P2)** Ground textures per world instead of vertex colors; water and lava
  surfaces; heat haze over lava.
- [ ] **VIS-05 (P2)** Skies with moons and planets (Saturn above Titan), clouds, a galaxy
  backdrop.
- [ ] **VIS-06 (P2)** Walking people and troopers; interceptors that bank and dive.
- [ ] **VIS-07 (P2)** Galaxy map: slow rotation, nebulae, planet previews, zoom.
- [ ] **VIS-08 (P3)** An icon set for drones and achievements.
- [ ] **VIS-09 (P3)** Photo mode and mission replays.

## 11. Sound (AUD)

The game is silent today.

- [ ] **AUD-01 (P1)** Effects: a swarm hum that grows with the number of drones in view (the
  simulator's `sound-mix.mjs` approach), shots per weapon, explosions, capture chime, alarm
  stages.
- [ ] **AUD-02 (P1)** Hazard sounds (rain, wind, thunder, eruptions) and the pod's entry and
  parachute.
- [ ] **AUD-03 (P1)** A sound toggle and volume, off by default like the simulator.
- [ ] **AUD-04 (P3)** Music by society level.

## 12. Performance (PERF)

- [ ] **PERF-01 (P1)** Measure on real phones: frame time with 40, 100 and 150 drones, on
  Aurex's skyline and in storms.
- [ ] **PERF-02 (P1)** Each Dragonfly drone is a full copy of the research model's exterior.
  Use a low-detail stand-in beyond about 150 m.
- [ ] **PERF-03 (P1)** The 2,400 weather particles are moved on the CPU every frame. Move them
  to the GPU.
- [ ] **PERF-04 (P1)** Adaptive resolution and a graphics quality setting (decor density,
  effects).
- [ ] **PERF-05 (P2)** Combat checks every unit against every enemy each step. Use the
  spatial grid already used for drone spacing.
- [ ] **PERF-06 (P2)** Run the simulation in a background worker if the page gets busy.

## 13. Engineering and tests (TECH, TEST)

- [ ] **TECH-01 (P1)** Split `main.mjs` (about 790 lines) into `invasion/ui/` modules like the
  simulator's `ui/` folder: camera, selection, drop panel, HUD, minimap, debrief.
- [ ] **TECH-02 (P2)** Fixed-step simulation, so game speed and frame rate never change the
  result; needed for replays and online versus.
- [ ] **TECH-03 (P2)** Versioned progress saves with migration (`PROGRESS_VERSION`) before
  upgrades or new fields arrive.
- [ ] **TECH-04 (P2)** Export and import progress to move it between devices.
- [ ] **TECH-05 (P3)** Installable app with offline play.
- [ ] **TEST-01 (P1)** A render smoke test for `scene.mjs` and `models.mjs`, using the
  stand-in renderer from the simulator's `render-smoke.test.mjs`.
- [ ] **TEST-02 (P1)** A browser end-to-end check: title, galaxy, drop, capture, debrief.
- [ ] **TEST-03 (P1)** Human playtests: at least three players per planet; record time, losses
  and where they got stuck.
- [ ] **TEST-04 (P2)** The game imports `vehicle-research.mjs`. Check the Dragonfly drone still
  builds after every simulator model change.
- [ ] **TEST-05 (P2)** Add the balance bot to the repository with a quick CI mode: every planet
  winnable, difficulty rising.

## 14. Publishing and housekeeping (OPS)

- [ ] **OPS-01 (P1)** Another session's aft-bulkhead work (`dist/aft-bulkhead.mjs`,
  `dist/vehicle-research.mjs`, `dist/thermal-loop.mjs`, `dist/vehicle-inspector.mjs`,
  `tests/aft-bulkhead.test.mjs`, `research/aft-bulkhead-2026-10-15/`) is uncommitted with one
  failing test. Whoever started it should finish or archive it.
- [ ] **OPS-02 (P1)** GitHub Actions warnings on the publish run: actions that target Node 20
  are deprecated (`configure-pages@v5`, `deploy-pages@v4`, the upload step); update them when
  newer versions are available. `ubuntu-latest` moves to Ubuntu 26 from October 19, 2026:
  watch the first run after that.
- [ ] **OPS-03 (P2)** Owner decision: a "Play Swarmfall" button on the simulator page (not
  added; the game links back to the simulator).
- [ ] **OPS-04 (P2)** A short link that ignores capitals in the project name, for example a
  `tboy450.github.io` site with a `/swarmfall` redirect, or a separate `swarmfall` repository.
- [ ] **OPS-05 (P2)** Credits and notices in the game: the three.js license, the NASA/APL
  Dragonfly sources behind the model, and a "fan-made, not affiliated with NASA or APL" line on
  the title screen.
- [ ] **OPS-06 (P3)** Remove stale git worktree records under `.git/worktrees/` that Windows
  would not delete, and the `sites` remote, which needs a login (`sites-redirect/` was never
  published).

## 15. Documentation (DOC)

- [ ] **DOC-01 (P2)** Design notes: every gameplay number (drones, defenders, hazards, alarm,
  economy) in tables with the reason for it, kept in step with the code.
- [ ] **DOC-02 (P2)** How-to guides: add a planet, a drone, a defender, a hazard and an
  achievement (files to touch, tests to add).
- [ ] **DOC-03 (P3)** A player guide (controls and tips) linked from the title screen.
