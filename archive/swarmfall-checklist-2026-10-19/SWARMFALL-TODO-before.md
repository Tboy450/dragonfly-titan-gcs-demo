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

- **Asset & Environment Lab release (Codex, October 17):** renamed the lab and added an Assets
  mode for 18 individual drone, urban and fantasy models with inspection views and attribution.
  [Public lab](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/);
  [asset inspector](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?asset=drone-scout).
  Five environments, destruction stages and historical foundation variants remain available.
  Linked from the game title; uses the existing GitHub Pages release workflow and build stamp.
  Unfinished modular-kit work remains separate. A concurrent EFIELD update reached main during
  publication; its existing simulator changes, documentation and archives are preserved by merge.

- **City review and destruction artwork (Codex, October 17):** all five environments now have
  Intact / Damaged / Major destruction / Ruins previews with broken mesh geometry, exposed
  floors, rods and settled rubble. Original cities, terrain, water and citadel terraces are
  retained. See ENV-05 and the [implementation review](research/fantasy-city-2026-10-16/GAME-INTEGRATION.md)
  for five local links, measured GLB costs and concrete campaign integration steps. The
  recommended route is one playable district within the full city, shared environment data,
  collision/navigation/landing courts, then per-building damage and persistence. These art
  states do not complete ENV-01 through ENV-04. **DROP-01 remains the next requested gameplay
  pass** after this review/artwork; no parachute or pod logic changed.

- **Environment Lab and backups (Codex continuation, October 16):** first three visual tests
  are implemented at `dist/invasion/environments/`: alien arcology, metropolis and tidal
  citadel, with orbit/pilot cameras, view presets, flyover, dusk and light rendering. First
  version preserved in `598e3b9` by Claude after Codex's usage limit. Six verified source
  backups (1.84 GB) are in `C:/Users/Heemi/Documents/Game Asset Library/`, with licenses,
  creators, hashes and a pending space/alien queue. [Current handoff](research/fantasy-city-2026-10-16/ASSET-BACKUPS.md).
  These updates supersede the older "no city runtime import yet" research status below:
  selected CC0 models are imported in the separate lab, but no campaign planet was replaced.
  Preserve every earlier version, original archive and Downloads copy; do not clean up yet.

- **Codex continuation (October 16):** FIX-01 implemented locally: active missions autosave
  every 5 seconds and when the page is hidden/left. Resume from the title, paused, with terrain,
  orders, drops, hazards and camera restored. New missions ask before replacing a checkpoint.
  Campaign progress and the checkpoint share one storage record. See the signed CHANGELOG entry
  for verification and release status. The existing aft-bulkhead changes remain separate.
- **New owner requests (October 16):** pilot/first-person campaign, later drone builder,
  optional extraction after victory requirements, and multiple small pods. Tracked as
  MODE-20, MODE-21, OBJ-07 and DROP-01 below; these are planned, not implemented.
- **City research (Codex, October 16):** all references consolidated in
  [City assets, scale and destruction](research/fantasy-city-2026-10-16/README.md): Skyrim,
  Minecraft megacities (scale only), Spider-Man, Crackdown/Crackdown 3, Kakarot map/West City
  and elven/fantasy architecture. Ranked free/paid asset shortlist and verified limitations.
  Kenney's CC0 source archive is saved locally; no city runtime import yet. Start VIS-11 next
  for a city prototype; ENV items below cover the separately requested destructibility.

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

- [x] **VIS-19 ★ (P2) — Codex (October 17)** Rename and publish **Asset & Environment Lab**;
  retain all five environment tests and add individual inspection for 18 bundled game/kit
  assets, grouped selection, creator/license links, fit-to-view cameras and a turntable.
  Public URL and title-screen link above; preserve existing routes and campaign saves.

- [ ] **VIS-18 ★ (P2)** Implement the reviewed city integration path: shared versioned layout
  data, asynchronous district loading, real terrain/multi-level surfaces, fixed objective and
  safe drop sites, flight clearance/ground navigation, district culling and compatible mission
  saves. Start with a separate city battle test and a roughly 0.8–1 km playable district inside
  the full city; retain Aurex and existing campaign saves until validated. See FIX-02/FIX-03,
  VIS-10 through VIS-12, MODE-20 and the [code review](research/fantasy-city-2026-10-16/GAME-INTEGRATION.md).

- [ ] **VIS-16 ★ (P2)** Contoured coastal setting for cyberpunk City / Skyway (Codex,
  October 16): individual source contact points shape smooth ground, separate footing pads,
  access roads and shoreline; animated ocean water and a Foundation camera. Original imported
  architecture retained. Flat-ground comparison remains selectable; the large-plinth draft and
  first gallery are preserved under `archive/environment-lab-v1-2026-10-16/`.
  **Owner review:** second low-coast pass is the preferred baseline and restored as default.
  High contact-envelope draft rejected: terrain swallowed buildings. Finish actual underside
  fitting across the entire city without burying architecture; some elevated bases still float.
  Both first foundation passes have screenshots and selectable comparison links in credits.
  Gallery titles restored to **Skyway megacity** and **Phototextured city** by owner preference;
  original Cyberpunk City and drone City names remain in subtitles/credits.
  Fresh local test link: `http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk`.
  These are visual experiments; collision, navigation, citywide streaming and destruction remain open.
  **Houdini terrain revision (October 17):** authored a connected HeightField landscape from
  the preferred second coast, projected actual exposed bases, preserved base outlines in a
  constrained triangle mesh, and added narrow cut/fill steps at adjoining district elevations.
  Main city geometry is unchanged; the rejected Blender building extensions are not loaded in
  this variant. Added Rear coast / Building bases cameras and independent contact probes.
  Inspect `http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&foundation=houdini`.
  Owner review of the high rear terrain remains open; all prior comparison passes are retained.
  Final native checks: 25,740 exposed-base samples, zero ray misses or sampled burial,
  maximum gap 2.368 preview units; 557 exposed transit samples clear of the ground.
  Houdini is now the default Skyway preview. Artistic review remains VIS-16 work.

- [ ] **VIS-17 ★ (P2)** Reusable terrain/foundation authoring tools for imported cities.
  Investigate Blender Geometry Nodes Raycast / Shrinkwrap against selected underside proxies;
  Houdini HeightField Project + geometry masks for district-scale fitting; Unreal Landscape
  Patch if an Unreal authoring workflow becomes useful. Start with Blender and the second
  Skyway coast pass. Keep roofs/bridges out of terrain targets, constrain coast and slopes,
  generate fitted retaining/foundation meshes, and test both gaps and unwanted burial.
  [Tool shortlist, official sources and workflow](research/fantasy-city-2026-10-16/FOUNDATION-TOOLS.md).
  **Implemented first tool (Codex, October 16):** official portable Blender 4.5.14 verified
  and used for an editable Geometry Nodes Raycast foundation workflow. The preserved Blender variant adds
  structural fill from actual undersides onto the unchanged second coast; plain coast still
  selectable. Checked 23,885 top/bottom pairs, retained originals and first draft. Artistic
  refinement and full component review remain VIS-16 work. Signed SideFX Launcher downloaded;
  **Software setup (October 17):** Houdini 22.0.466 Production installed; Apprentice licenses
  activated; the main Apprentice workspace opened and responds. Launcher recognized the
  account after restarting with License Administrator
  already signed in, avoiding the failing Launcher browser-login path. Owner stopped the
  building-extension approach; the setup-only pause ended when the owner requested a Houdini terrain fit.
  [Authoring handoff](research/fantasy-city-2026-10-16/foundation-authoring/README.md).
  **Second tool implemented (October 17):** native Houdini HeightField Project and masks,
  bounded smoothing, underside ceilings, constrained contact-edge meshing and two adaptive
  refinement passes. Saved an editable `.hipnc`, local caches and the evaluated browser GLB.
  [Houdini workflow, validation and review links](research/fantasy-city-2026-10-16/houdini-authoring/README.md).

- [x] **VIS-13 ★ (P2)** First separate environment comparison gallery (Codex; preserved by
  Claude in `598e3b9`): three inspectable city studies, aerial/district/street cameras,
  orbit/free-pilot/flyover, dusk, light rendering and runtime source credits. Local address:
  `http://127.0.0.1:4187/invasion/environments/`. This completes the initial test-gallery
  deliverable only; VIS-10 through VIS-12 remain open for the requested quality and integration.
- [ ] **VIS-14 ★ (P2)** Compare complete Blender scenes against the modular/procedural tests.
  Convert cyberpunk City and drone City with embedded scripts disabled, retain originals and
  license notices, inspect geometry/materials/packed textures, record reductions and offer
  separate preview links. Then evaluate Hidden Alley for close-view detail. Keep the first
  gallery available; new experiments should add choices rather than erase old work.
  **Progress (Codex, October 16):** cyberpunk City and drone City converted with Blender
  4.5.14, embedded scripts disabled, originals retained. Added Skyway megacity and Phototextured
  city as separate gallery choices, normalized to a 2 km source span. Geometry grouped by
  material; drone textures capped at 1024 px, animation omitted; cyberpunk gets new PBR colors.
  Both rendered without browser errors. Hidden Alley conversion and campaign integration remain
  open; these previews do not by themselves complete VIS-10/VIS-11/VIS-12 or ENV destruction.
- [ ] **VIS-15 ★ (P2)** Space/alien asset continuation: planetary bases, orbital stations,
  intricate alien architecture, vessels and appropriate environments. Follow the library's
  source/queue manifest; use only free authorized files, respect daily download allowances,
  resolve exact CC-BY notices before redistribution and keep incomplete downloads pending.

- [ ] **VIS-10 ★ (P2)** Large alien/fantasy cities (owner, October 16). Minecraft megacities
  are a reference for **scale and intricacy only**; the owner explicitly wants a less blocky,
  non-voxel appearance. Aim for sprawling connected districts, distinctive skylines, curved
  architecture, monumental buildings, bridges and layered streets suitable for close pilot
  flight as well as the strategy view. Explore fantasy/mythical city assets and reusable
  modular kits; choose a coherent style per civilization. Public availability alone does not
  establish permission to reuse a city/map; record the actual asset license and credits.
  Use the [ranked asset shortlist and reference comparison](research/fantasy-city-2026-10-16/README.md):
  Downtown City MegaKit / Poly Haven for detailed urban districts; Medieval Village MegaKit
  for fantasy districts; paid Synty Elven Realm as an optional explicit elven-city candidate.
  Preserve all owner references, including Kakarot's rounded West City architecture and larger
  regional map, Skyrim's dense stone/timber districts, Spider-Man's continuous city fabric,
  Minecraft megacity infrastructure/scale and Crackdown's vertical skyline.
  Evaluate appearance before adoption; modular pieces need substantial layout/art work to
  achieve the requested scale. Prototype one district with a larger skyline, then expand with
  distance-based detail, section loading, shared materials/instances, building collisions,
  navigable streets, safe pod zones and phone performance checks. Coordinate with FIX-02,
  FIX-03, MODE-20 and PERF; Kenney source pack downloaded for evaluation, no runtime city yet.
- [ ] **VIS-11 ★ (P2)** Implement the large-city asset prototype from VIS-10 and the
  [research handoff](research/fantasy-city-2026-10-16/README.md). Start with a verified free
  subset of Downtown City MegaKit for urban blocks, or Medieval Village MegaKit for a fantasy
  district. Compose connected roads, varied heights, landmarks and a larger skyline; adapt to
  the civilization instead of copying franchise buildings. Add an inspectable local city
  preview. Preserve campaign balance initially; Aurex's current gameplay square is 1 km wide.
  Shared city layout must drive geometry, collision, navigation and safe pod areas. Measure
  desktop/phone rendering, use distance-based detail and section culling, preserve licenses,
  credits and originals, and archive the prior skyline before replacement. Do not check this
  off merely for downloading models or drawing another scatter of boxes.
- [ ] **VIS-12 ★ (P2)** Prioritize architectural complexity over elementary building kits
  (owner feedback, October 16). Inspect the [updated complex-scene shortlist](research/fantasy-city-2026-10-16/COMPLEX-SCENES.md):
  carlcapu333's cyberpunk City for intricate geometry/elevated routes; Daniel Vicente's
  Medieval Modular City as a fantasy candidate; drone City for urban coverage; Hidden Alley
  for close-view realism and dressing. Some sources have only listing-level verification;
  validate archives/licenses before importing. This revises VIS-11's initial pack preference.
  Build an original reusable module inventory over time: curved facades, tower crowns,
  sweeping roofs, ornamental arches/ribs, buttresses, bridges, terraces, stairs, gardens and
  damage variants. Use Synty Elven Realm as a complexity reference; its proprietary geometry
  has not been purchased or copied. Compare imported/authored districts from street and aerial
  views; simple material swaps and repeated rectangular buildings do not close this task.

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

- [x] **OPS-07 ★ (P2)** Create a reusable asset library outside this project (Codex,
  October 16): six completed original backups totaling 1,843,813,552 bytes, searchable JSON
  catalog, creators/source/license receipts, SHA-256 hashes, ZIP CRC checks, archive inventories
  and preserved catalog history. Location: `C:/Users/Heemi/Documents/Game Asset Library/`.
  Original archives, existing files and Downloads copies retained. Further downloads remain
  open under VIS-15; source backups are not automatically game-ready implementations.

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

## 16. Destructible environments (ENV)

- [x] **ENV-05 ★ (P2) — Codex (October 17, local)** Progressive damaged/destroyed art studies
  for **all five maps**: Alien arcology, Metropolis, Tidal citadel, Skyway megacity and
  Phototextured city. Four selectable states, deterministic component grouping, real facade
  clipping, jagged remnants, exposed cross sections, bent rods and style-specific settled
  debris. Protected landscape/water/terraces; reversible Intact control; current variant
  geometry disposed on replacement. [Links and details](research/fantasy-city-2026-10-16/GAME-INTEGRATION.md).
  Visual prototypes only: no weapon-triggered destruction, collapse physics or campaign changes.
- [ ] **ENV-06 ★ (P2)** Refine destruction artwork after owner review: authored building IDs,
  localized facade wounds, recognizable fallen crowns/roofs, bridge-specific broken spans,
  support cleanup for fine imported roof ornaments, surface-fitted debris and collapse
  transitions. Replace geometric grouping heuristics with reviewed structural families before
  connecting damage to navigation. Preserve each intact asset and this first damage pass.

Owner request, October 16: investigate Crackdown 3 and Dragon Ball Z: Kakarot destruction
alongside all the earlier city references. [Research and sources](research/fantasy-city-2026-10-16/README.md).
Crackdown 3's confirmed fully destructible/cloud-powered mode is Wrecking Zone; Kakarot's
official page confirms destructible battlefields, not persistent collapse of every city
building. None of the shortlisted architecture packs includes a verified browser destruction
system. The following are implementation tasks, not claims about either game's internals.

- [ ] **ENV-01 ★ (P2)** Damageable scenery in one city district: stable building/prop IDs,
  health and intact/damaged/ruined states in a plain rules module; authored broken facades,
  dust and a capped debris pool in the renderer. Start with selected walls/props/buildings,
  then expand. Make target selection and weapon effects understandable to the player.
- [ ] **ENV-02 ★ (P2)** Destruction changes movement and combat: consistent visible geometry,
  collision, cover/line of sight, troop routes, drone clearance and safe pod landing points.
  Rubble may create obstacles or openings. Preserve required objectives and extraction paths;
  define damage to captured structures and civilian/public alarm effects.
- [ ] **ENV-03 ★ (P2)** Save destruction by stable IDs, with checkpoint version/migration,
  seeded-layout compatibility and tests across reloads. Re-entering a district must not revive
  destroyed geometry or leave invisible blocking collision. Avoid double rewards/salvage.
- [ ] **ENV-04 ★ (P3)** Profile selective building collapse and support/chain failures in a
  smaller test arena. Use prebaked chunks, simplified collision, bounded active debris and
  static settled rubble; consider a worker only if measurements justify it. Record phone and
  desktop frame time/memory. Citywide physics and online synchronization need separate design;
  do not promise Crackdown's cloud-scale behavior on the current browser architecture.
