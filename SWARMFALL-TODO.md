# Swarmfall — Prioritized Update Checklist

Updated October 19, 2026 — Codex (OpenAI), following the owner's request for an extensive
priority checklist. Scope: **Swarmfall gameplay and the Asset & Environment Lab**.
The Dragonfly scientific simulator has its own interior/engineering checklists.

[Play Swarmfall](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/) ·
[Public Asset & Environment Lab](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/) ·
[City integration review](research/fantasy-city-2026-10-16/GAME-INTEGRATION.md) ·
[RTS, space and drone design study](research/swarmfall-design-2026-10-19/README.md) ·
[Previous checklist, preserved in full](archive/swarmfall-checklist-2026-10-19/SWARMFALL-TODO-before.md)

## Tracking rules

- This is the master backlog. Existing task IDs remain valid; new detailed tasks expand the
  original requests. The priority table references those tasks rather than creating duplicates.
- **P0 — urgent:** a reproduced crash, progress loss or other release-blocking failure.
  Promote a task here when reproduced; this review does not invent a new P0 incident.
- **P1 — next:** core playability or a prerequisite for the next milestone.
  **P2 — after the core:** depth, art refinement and expansion. **P3 — later:** new large modes.
  Follow the ordered roadmap; all P1 tasks are not meant to run at once.
- **★** means directly requested by the owner. Unstarred items are implementation/support
  recommendations. **S / M / L / XL** are relative scope, not promised calendar durations.
- **[x]** means implemented for the stated scope. A public preview, source download or free
  camera does not complete campaign integration, combat destruction or pilot gameplay.
- Keep battle rules in plain modules, with the renderer/UI reading state. Add meaningful tests
  to changed rules and compatibility paths. Mark completed work with worker/date/evidence.
- Preserve original models, previous terrain passes, downloaded sources and unfinished work.
  Use Blender, Houdini and code-based graphics; **do not use or suggest image generation**.
- Existing checkbox IDs are the canonical tracking entries. Detailed child tasks and milestone
  gates must pass before the corresponding broad feature is marked complete.
- Every implementation release gets a signed CHANGELOG entry, appropriate checks and public
  verification when deployment is part of the authorized task.

## Current status — October 19 review

| Area | Verified status | Still open |
| --- | --- | --- |
| Campaign | Seven planets, economy, hazards, capture/control paths, achievements and progression exist | Human balance review, deeper progression and more mission types |
| Mission saves | Codex October 19: migration, wave/victory state, one-write settlement, paused resume, SAVE-01 bounds, SAVE-02 recovery/export and SAVE-04 command/camera state implemented | Real browser reload/download/storage-fault review, optional import and future damage/environment schemas |
| Drop delivery | Codex October 19: deterministic 1–3 drone pods, solo Dragonflies, one paid squad wave, safe courts, retained orders, v1→v2 checkpoint migration | Browser/touch/device acceptance under DROP-08; real imported-city corridors remain CITY work |
| Victory | Codex October 19: persisted eligibility, one choice, continued play, explicit extraction and idempotent result ledger | Browser/touch acceptance of choice, resumed prompts and storage-failure feedback |
| Public lab | Five environments and an 18-model asset inspector were published October 17 | Expanded metadata, loading/recovery, device review and gameplay integration |
| Destruction artwork | All five maps have Intact / Damaged / Major destruction / Ruins variants | Authored structural IDs, local weapon damage, support cleanup, collision and persistence |
| Lab smoke/fire | Codex October 19: procedural fracture smoke, flames, embers, local light, pause/toggles and High/Light budgets implemented; automated checks recorded under FX-05 | Browser/GPU and real-phone acceptance (FX-06); gameplay explosions, burning rules and sound remain FX-01–04 |
| Skyway terrain | Houdini coast and editable native project exist; sampled contacts were validated | Owner art approval of the high rear land, full component/support and route review |
| Pilot mode | The lab has a free camera | Possessing a campaign drone, flight/aim controls, collision, squad handoff and HUD |
| Drone builder | Requested concept is retained | Reference clarification, modular rules/UI, balance and save compatibility |
| Free-roam planet | Existing campaign and lab supply reusable rules/art; open-world mode is not implemented | Separate persistent world, connected regions, capture/travel rules, streaming and graphics review |
| Source library | Six original backups, receipts and hashes were recorded, about 1.84 GB | Additional space/alien sources, derivative-authoring backup/restore and unresolved notices |

Historical planning-audit baseline: game/lab source at **fb2e5b6**; the October 17 combined release passed
**270 tests** and its public build was checked. That first October 19 step was a documentation/code
audit, not a new full test run. At that fetch, remote main was **9f3fea1** (October 18);
its two newer commits concern simulator part 22, with no changes under the game or its tests.
Those changes were separate from the planning edit and were merged before gameplay work below.

Implementation follow-up, October 19 — Codex: the planning checkpoint was pushed as `f122c36`
after merging simulator updates through `8632674` and passing 278 tests. The multi-pod/Clean
view update below passed **291 tests** for that release. Completed children have a checkbox and Codex
signature; broad browser/device acceptance stays open. Effects requests are retained in section 36.

Release follow-up — Codex: **5b05c32 is published**, its GitHub Pages run succeeded and public
build/import stamps were verified. The next milestone implements victory/continue, mission v3/
progress v2 migration and one-time settlement, with **306 tests passing**. See the newest signed
CHANGELOG entry and test log. The backlog now has 302 unique task IDs across 36 numbered sections.

Latest follow-up — Codex, October 19: victory/continue **f1ad919** and lab aftermath **cf4c866**
are published; both Pages deployments and their public source stamps were verified. Lab effects
passed **314 tests** and added FX-05/06, bringing the checklist to **304 unique IDs**. The next
completed item is **SAVE-01** below: current-schema checkpoint validation, with **325 tests**
passing and an eight-case before/after report. Recovery/export and browser/device checks stay open.
Before publication, concurrent simulator work from **9e647ba** was merged with both signed
records preserved; the combined repository passes **332 tests**. No checklist IDs were removed.

Recovery follow-up — Codex, October 19: **SAVE-02** is implemented with a title notice, Save
files dialog, exact-original backups before replacement/migration, JSON downloads and safe
failure/retry behavior. **351 tests pass**; existing v1/v2 fixtures remain supported. Browser
download/focus/touch and real storage-fault checks stay open under SAVE-03/SAVE-06.

Command-resume follow-up — Codex, October 19: **SAVE-04** retains active/inbound selection,
camera, draft payload and panel state. Reload is paused at 1× with visible HUD and cancelled
placement. **360 tests pass**, including real entry-point wiring with DOM/renderer stand-ins.
Browser reload/device acceptance remains open under SAVE-06; no checklist IDs were removed.

Objective follow-up — Codex, October 19: **OBJ-08** now explicitly defines tower/jammer goals
as neutralization by destruction or capture, counts live hostiles and reevaluates retaken
defenses until extraction. Old saved rule IDs remain compatible. **366 tests pass**; prior
SAVE-04 `ede71e4` deployment and live source were verified. Browser/human balance review stays open.

The old "live build 8b2399b / 237 tests" and uncommitted aft-bulkhead failure were historical
notes, not the current Swarmfall status. The aft-bulkhead/inspection work was closed in eed63b1
and included in the published baseline. Its archive and all old checklist notes are retained.
Untracked modular-kit work and local authoring/install receipts are preserved.

Pointer-controls follow-up — Codex, October 19: **CTRL-04** separates desktop selection/orders
while retaining touch controls and camera gestures. **380 tests pass; 23/304 unique tasks
are checked.** Browser/device acceptance remains open. Prior OBJ-08 release `564f000` was
published and its live source verified. See the signed evidence linked from CTRL-04.

Small-asset priority follow-up — Codex, October 19: added owner-requested **ART-09** for future
visual upgrades to smaller assets below the current project standard. No asset is claimed
reviewed or upgraded in this planning change. Current count: **23/305 unique tasks checked**;
earlier release counts above are historical.

Readability follow-up — Codex, October 19: **FIX-04** adds projected-size squad-colored
markers for tiny living friendly drones. **390 tests pass; 24/305 tasks checked.** Both
original and separate-copy environment labs are unchanged by this gameplay update. The
separate project owns expansion of the standalone studio; continue Swarmfall work here.

Hold-feedback follow-up — Codex, October 19: **FIX-11** adds an empty-selection hint to Hold
and H, with no key-repeat spam. **390 tests pass; 25/305 tasks checked.** Both environment
labs and the independently maintained studio remain untouched by this game-only change.

Minimap-orders follow-up — Codex, October 20: **CTRL-08** adds right-click orders and an
explicit touch-friendly View/Orders toggle. **400 tests pass; 26/305 tasks checked.** The
separate studio remains owned by its other project; neither environment lab is changed.

Phone-HUD follow-up — Codex, October 20: **FIX-07** reduces battlefield panel coverage
after the first capture, with manual access retained. **409 combined tests pass; 27/305 tasks
checked.** Original HUD code/picture retained; real-phone acceptance remains open.

## Priority order — work from the top

| Order | Work package | Canonical tasks | Scope | Completion gate |
| --- | --- | --- | --- | --- |
| 1 | ★ Multiple parachute pods | DROP-01 through DROP-08 | L | One squad/wave, 1–3 drones per pod, safe spacing, one charge/cooldown, correct save/resume |
| 2 | ★ Victory or continue | OBJ-07, OBJ-09 through OBJ-11; FIX-08 | M/L | Choice appears once, continuing stays playable, extraction settles rewards once |
| 3 | Save compatibility for those changes | TECH-03; SAVE-01 through SAVE-06 | M | Old saves survive; descent, arrival and extraction reloads cannot duplicate progress |
| 4 | Flight and ground movement | FIX-02/FIX-03; COMBAT-01/02; CITY-03/04 | L | Drones avoid solids, ground units find routes, height and attacks agree |
| 5 | Selection, orders and readable feedback | CTRL-01/03/04/05/06; FIX-04/07/08 | M/L | Reliable desktop/touch orders, visible squads/alerts and clean mission-end UI |
| 6 | Tutorial and first human balance pass | TUT-01/02; TEST-02/03/05; OBJ-08 | M | A new player can finish Titan, understand objectives and recover from losses |
| 7 | First playable city district | VIS-18; CITY-01 through CITY-12; PERF-01/04/07 | XL | One reviewed district with terrain, collision, routes, zones, drops and a compatible checkpoint |
| 8 | ★ Localized progressive destruction | ENV-01/02/03/06 through ENV-11; ART-01 through ART-08 | XL | One building changes state locally; visuals, collision, routes and saved state stay synchronized |
| 9 | Public lab, asset pipeline and small-asset visual polish | LAB-01 through LAB-09; OPS-08/09/10; ART-09 | M/L | Every public route works, assets have provenance/readiness, repeated changes stay responsive |
| 10 | ★ First-person/pilot campaign | MODE-20; PILOT-01 through PILOT-09 | XL | Pilot a real campaign drone and return to command without losing squad/mission state |
| 11 | ★ Free-roam planetary conquest and better graphics | MODE-01/02/03; ROAM-01 through ROAM-16; GFX-01 through GFX-06 | XL | Three connected regions, persistent capture/revisits, separate saves and measured visual quality |
| 12 | Content and progression | ECON, DRONE, ENEMY, HAZ and OBJ-01 through OBJ-06; SENSE/SWARM/SPACE/TACT experiments | L/XL | New content is balanced against measured campaign results; keep only useful experiments |
| 13 | ★ Builder and versus | MODE-21; BUILD-01 through BUILD-10; MODE-10 through MODE-15 | XL | Stable core contracts, saves and performance exist before these modes expand scope |

Tests, preservation and checkpoint compatibility belong inside each work package, not at
the very end. Start first-city work as an isolated test mission. **Metropolis is the simplest
technical route prototype; Skyway remains the intricate alien-capital art direction.** Keep
the full city as surrounding context and validate roughly a 0.8–1 km active district before
expansion. Do not shrink an entire city silently or replace campaign planets before review.

### Drone identity and immersion — new design track

The owner's October 19 direction adds RTS references, outer space, Tank Wars-style building,
drone-specific possibilities and better immersion. The [design study](research/swarmfall-design-2026-10-19/README.md)
records seven reference games and distinguishes their documented mechanics from our proposals.
The suggestions below are **unimplemented candidates**, not new promises or completed systems.

Recommended identity: **scout an alien district → establish a relay → hijack useful infrastructure
→ deploy a coordinated swarm → recover survivors → extract or press on**. Pilot possession
lets the player experience the same operation through one drone's sensors.

| When | Design experiment | Tasks | Keep it only if… |
| --- | --- | --- | --- |
| With core fixes | Responsive rotor/weapon feedback, order acknowledgement, readable battle scale | AUD-01/02/03; IMM-01/02/03/04 | The player can tell what is happening without extra HUD clutter |
| After one city district works | Scout information, one relay and one service to hijack | SENSE-01 through SENSE-06; TACT-02 | At least two useful approaches exist and a failed relay is recoverable |
| After the district and save contracts work | Three-region free-roam planetary operation | ROAM-01 through ROAM-16; GFX-01 through GFX-06 | Capture survives travel/revisits/reload, with clear planet-wide progress |
| After support/recovery rules | Rescue a disabled drone; repurpose landed pod hardware | SWARM-05/06; DRONE-02 | Creates a worthwhile rescue/positioning choice without recurring chores |
| Alongside pilot milestone | Precision tagging/disable/recovery with command-mode alternatives | PILOT-01 through PILOT-09; SWARM-07 | Direct control is useful and returning to RTS preserves the battle |
| After those roles prove useful | Small modular loadouts, then larger builder and off-world missions | BUILD-07 through BUILD-10; SPACE-01/04/05 | Building changes tactics and still fits campaign/device budgets |

Use **matter plus at most one new tactical constraint in the first prototype**. Evaluate energy,
signal and module power separately before combining them. Keep explicit player orders reliable,
provide safe return/recovery options, and make all cinematic views skippable. No basic mission
should require precision piloting. Detailed candidate and free-roam checkboxes are in sections 28–35.

## Milestones and release gates

1. **A — Drop and victory update:** DROP-01 through DROP-08, OBJ-07/09/10/11, relevant SAVE
   tasks and FIX-08. Gate: tested multi-pod launch, all arrivals, pause/reload, continuing
   capture and one-time extraction/rewards.
2. **B — Reliable command gameplay:** FIX-02/03/04/07, CTRL selection/orders/alerts, TUT-01/02,
   save hardening and a human Titan-to-Aurex review. Gate: no reproducible blocked core loop.
3. **C — One real city battle:** shared environment data, fixed sites, safe descents,
   geometry-aware movement/attacks and measured device settings. Gate: every required
   objective and extraction point is reachable; new/legacy saves behave as documented.
4. **D — Destruction that affects play:** reviewed structure families, local health/state,
   damaged collision/routes, bounded effects, durable state. Gate: no floating blocking
   collision, duplicate salvage or revived destroyed buildings after reload.
5. **E — Pilot campaign:** possession, collision-aware controls/aim, useful pilot HUD,
   autonomous remaining squads and clean RTS return. Gate: one whole mission in mixed modes.
6. **F — Free-roam planet:** three connected regions, separate world save, meaningful sites,
   persistent capture/travel/revisits and a polished foreground with a larger horizon. Gate:
   one entire operation and reload/return travel pass on target devices. Can prototype after C;
   add D's local damage and E's pilot control when those systems are ready.
7. **G — Deeper worlds:** measured economy upgrades, new drones, society behaviors, wildlife,
   hazards, mission variety and broader city districts. Gate: campaign remains winnable and legible.
8. **H — Later systems:** drone builder, broader generated galaxies, local versus and eventually
   online play. Gate: explicit designs and separate prototypes; online work follows stable
   deterministic simulation and local rules.

### Environment acceptance matrix

"Art states available" means the lab can display the four versions. It does not mean that
every asset has been artistically approved or that the environment is a playable battle.

| Environment | Public preview | Art states available | Visual review: appearance and supports | Campaign battle | Collision/routes | Safe pod courts | Saved local destruction | Phone benchmark |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Alien arcology | Yes | Yes | Pending | Pending | Pending | Pending | Pending | Pending |
| Metropolis | Yes | Yes | Pending | Pending | Pending | Pending | Pending | Pending |
| Tidal citadel | Yes | Yes | Pending | Pending | Pending | Pending | Pending | Pending |
| Skyway megacity | Yes | Yes | Pending; high rear land especially | Pending | Pending | Pending | Pending | Pending |
| Phototextured city | Yes | Yes | Pending; close-view materials especially | Pending | Pending | Pending | Pending | Pending |

"Visual review" records whether appearance, foundations and structural supports have been
reviewed; it is not a permission gate for routine implementation. These five imported lab
environments are separate from the existing campaign terrain, where pod placement is being updated.

### What a completed feature needs

State its player-visible behavior, rule/data changes, rendering/HUD feedback and relevant
save behavior. Exercise normal and failure paths, desktop/touch inputs where relevant,
and the intended mission(s). Keep existing campaign behavior compatible. Update this list
and the signed handoff; retain replaced work and source notices. A new feature is not
complete solely because its assets download or its unit tests pass.

## Initial game inventory (October 15-16, Claude; historical baseline)

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

- [x] **FIX-01 (P1) — Codex (October 16; published baseline verified October 17)** Save and resume an active battle, including
  its terrain callback/pads. Title-screen Resume mission; autosave every 5 s and on page exit/
  hiding, resumed missions paused, malformed/version-mismatched saves ignored. New-mission
  replacement confirmation; unavailable-storage warning. Release status in CHANGELOG.
- [x] **FIX-02 (P1) — Claude (October 22)** Drones pass through Aurex's towers (skyline up to
  about 48 m; drones cruise at 15–28 m). The renderer already adds ground height, but battle
  rules lack obstacle clearance, look-ahead and climb/descent limits. Add one shared
  terrain/building clearance model, with alternate routes where climbing is unsuitable; keep
  rules in `battle.mjs`.
  - Aurex's skyline is now solid (`planet-terrain.mjs` `attachSkyline`): 420 seeded towers kept
    clear of zones and drawn from the same data. Drones climb over them, troops walk round
    them, pods avoid them, and they block direct fire. It uses the same clearance model as the
    city districts (`roofAt`, `walkable`, `canDropAt`, `lineBlocked`).
  - The climb look-ahead now samples five points over the next 3 s of flight. The old two
    samples let a drone clip a narrow tower; the new test caught it, 44 m over a 48 m roof.
  - Older Aurex saves resume without towers. Old look archived in
    `archive/swarmfall-aurex-skyline-2026-10-22/`. Evidence: `tests/invasion-skyline.test.mjs`.
  - Not done: alternate routes where climbing is unsuitable (drones always climb).
- [x] **FIX-03 (P1) — Claude (October 22)** Ground troops walk in straight lines and simply stop
  at shorelines. Add pathfinding (a grid search on `isLand`, or flow fields).
  - `paths.mjs` `findRoute`: a deterministic grid search on walkable ground (land, not buildings
    or town walls), with 6 m cells. It checks the ground between cells so walls thinner than a
    cell still block it, then drops waypoints a straight walk can skip.
  - A unit on foot that bumps into water, a building or a wall plans a route to its goal and
    follows it (`battle.mjs`, `unit.route`, saved and validated with the battle). At most 3
    searches per step. A goal with no route is remembered until it moves, and the unit slides
    as before.
  - Evidence: `tests/invasion-paths.test.mjs`. A rifleman outside Brackenford's wall walks home
    through a gate, and the same happens after a save mid-route. Four-wave battles on five
    maps stay under 3.5 ms for the worst step.
- [x] **FIX-04 (P1) — Codex, October 19; implementation and automated checks** Show a
  squad-colored diamond for living friendly drones when their projected model bounds fall
  below 8 CSS pixels. Use actual model/rotor bounds and camera depth; retain selection rings
  and health bars, omit off-screen/behind-camera/dead/enemy markers, and hide them in Clean
  view. **390 tests pass**; [evidence](research/swarmfall-drone-markers-2026-10-19/README.md).
  Real browser/phone visual acceptance remains open under TEST/accessibility tasks.
- [ ] **FIX-05 (P2)** After its target dies, an attack order moves on to the nearest defender
  within 110 m, sometimes off screen with no feedback. Show the new target and allow "stop".
- [ ] **FIX-06 (P2)** Zone rings follow the ground but steep Titan dunes and trees can still
  hide parts of them. Consider drawing them on top at low opacity.
- [x] **FIX-07 (P2) — Codex, October 20; implementation and automated checks** On phones,
  collapse Objectives and Battle log once after the first capture; both have independent
  summary toggles. Respect manual reopening, reset new missions and compact captured resumes.
  Warning toasts remain active. [Evidence](research/swarmfall-phone-hud-2026-10-20/README.md).
  Real-phone layout/touch and screen-reader review remain open acceptance work.
- [x] **FIX-08 (P2) — Codex, October 19** The drop panel and the "pick a zone" hint stay open under the debrief when
  a mission ends. Close them in `finishMission`.
- [ ] **FIX-09 (P2)** Aurex, the last planet, is very hard (bot: about 16 minutes and 150 drones
  lost). Revisit after human playtests.
- [ ] **FIX-10 (P2)** The title card hides the title screen's spiral galaxy.
- [x] **FIX-11 (P3) — Codex, October 19; implementation and focused checks** Hold and H
  now explain how to select a squad when none is selected. Reveal the HUD for that hint,
  ignore held-key repeats, and preserve selected-squad Hold behavior. Ended missions receive
  no command/warning. **390 tests pass** plus entry-point control checks;
  [evidence](research/swarmfall-hold-hint-2026-10-19/README.md).
- [ ] **FIX-12 (P3)** Strikes, retaken zones and lost squads off screen give no cue. Add an
  edge-of-screen marker (see CTRL-06).

## 2. Tutorial and onboarding (TUT)

- [x] **TUT-01 (P1) — Claude (October 22)** Interactive Titan tutorial with highlighted buttons and
  checked steps (drop, select, move, capture, ride out a hazard, recover the Dragonfly);
  skippable. Replaces the coach text in `main.mjs`.
  - `tutorial.mjs` works out the step from the battle: drop, land, select, move, capture,
    Dragonfly, win. A weather step interrupts while the first front is warned or active.
  - The coach box shows checked progress dots and the step, and the button to press pulses
    (Drop wave, the squad bar).
  - **Skip tutorial** in the box. Skipping or finishing is remembered on the device.
  - Evidence: `tests/invasion-tutorial.test.mjs` walks a real Titan battle through every step.
    In the browser, step 1 showed with Drop wave pulsing, and Skip hid it and was
    remembered.
- [x] **TUT-02 (P1) — Claude (October 22)** First-time tips when something new appears: first
  defenders, first jammer, each alarm stage, first artillery, first converted defense.
  `tips.mjs` gives a tip:
  - the first time any defender is in a drone's sight;
  - for each new kind of defense (watchtower, flak, radar, missile battery, jammer, laser,
    shield pylon, interceptor), with how to beat it;
  - at each alarm stage, the first artillery and the first captured defense.
  Each shows once per device as a gold-edged toast. Evidence: `tests/invasion-tips.test.mjs`;
  in the browser the defenders and watchtower tips appeared once and were remembered.
- [x] **TUT-03 (P2) — Claude (October 22)** Encyclopedia: every drone, defender, society and
  hazard with its numbers and what beats it (generated from `units.mjs` and `hazards.mjs`).
  **Field guide** on the title screen (`field-guide.mjs`), generated from the rules:
  - Drones: cost, slots, health, speed, height, sight, capture and weapons, and the defenses
    most dangerous to them.
  - Defenders: health, weapons and effect auras, and the drones that beat them.
  - Societies: troops, defenses, capture speed and artillery.
  - Hazards: warning time, duration and advice.
  Evidence: `tests/invasion-field-guide.test.mjs`; the browser shows 31 entries in 4 sections.
- [ ] **TUT-04 (P2)** Tooltips on drop-panel rows and HUD items (alarm thresholds, hazard
  effects, supply).
- [ ] **TUT-05 (P3)** A short intro screen for the Hive and the campaign.

## 3. Controls and HUD (CTRL)

- [x] **CTRL-01 (P1) — Claude (October 22)** Drag-box selection on desktop and a lasso or
  two-finger selection on touch screens.
  - **Shift+drag** with a mouse draws a dashed box, and every squad with a living drone inside
    is selected (`pointer-controls.mjs` `boxRect`, `squadsInBox`). Plain drags still pan; an
    empty box keeps the selection and never pans.
  - On touch, **press and hold (~0.45 s), then drag** draws the box; a quick drag still pans.
    This replaces a lasso, since two fingers already pinch, turn and pan.
  - Evidence: `tests/invasion-box-select.test.mjs` and a Shift+drag test in
    `tests/invasion-pointer-controls.test.mjs`. The touch hold isn't covered by an automated
    test or a real-phone check yet.
- [x] **CTRL-02 (P1) — Claude (October 22)** Squad tools: merge, split, rename, select by drone
  type, renumber keys. The **Squad ▾** menu next to Hold (`battle.mjs` `mergeSquads`,
  `splitSquad`, `renameSquad`):
  - Merge the selected squads into the lowest-numbered one, which keeps its order. Pods still
    descending land in their own squads, so saved waves stay valid.
  - Split one squad in half, or split off every drone of one type into a new squad that holds
    in place.
  - Rename a squad (1-24 characters).
  - Number keys already follow the squad bar's order, so there was nothing to renumber.
  Evidence: `tests/invasion-squad-tools.test.mjs`, including saves staying valid after merge
  and split. In the browser, merge then "Split off Links" behaved as expected.
- [x] **CTRL-03 (P1) — Claude (October 22)** Waypoint queues (Shift+tap), patrol and an
  "attack-move here" order (`battle.mjs` `queueOrder`, `setPatrol`, `orderFor`,
  `replaceOrders`):
  - **Waypoints:** Shift+right-click, or "Queue next order" in the Squad ▾ menu on touch,
    adds up to 8 orders. Each starts when the one before is done: zone captured, target
    destroyed, or every drone in place. Selected squads show them as a dashed line with
    numbered stops.
  - **Patrol:** P, or the menu, circles the waypoints. Finished captures and attacks come back
    as moves, so it never spins on a held zone.
  - **Attack-move:** T, or the menu, then a click or tap. Armed drones turn on any defender
    they see on the way, then go on.
  - A new immediate order or Hold clears the waypoints and patrol. Saves keep queues, patrol
    and attack-move, within limits.
  - Evidence: `tests/invasion-waypoints.test.mjs`. In the browser the waypoint loop drew and
    P toggled patrol.
- [x] **CTRL-04 (P1) — Codex, October 19; implementation and automated acceptance**
  Desktop left-click selects a squad; right-click orders an attack, capture or move. Modifier
  clicks toggle additional squads; empty primary clicks clear selection. Touch/pen retain
  select-then-tap orders. Camera drags, pinches, button chords, cancelled/lost capture, blur,
  hidden pages and modal interruptions cannot release a stray command. Right-click cancels
  landing placement; only Launch here purchases the previewed wave. **380 tests pass**;
  [evidence](research/swarmfall-pointer-controls-2026-10-19/README.md). Real browser/device
  acceptance remains open under TEST tasks; box selection and order queues remain CTRL-01/03.
- [x] **CTRL-05 (P1) — Claude (October 21)** Camera: follow the selected squad, jump to the
  last alert, edge-scroll, reset view (`camera-assist.mjs`).
  - **Follow · G** tracks the selected squads until you pan.
  - **Alert · J** jumps to the newest alert (a lost drone, artillery or lightning marked, an
    eruption). The alert also shows as a red ring on the minimap for 20 s.
  - A mouse at the screen edge scrolls, and **Home** returns to the starting view.
  - Evidence: `tests/invasion-camera-assist.test.mjs`, plus browser checks of G, J and Home.
- [x] **CTRL-06 (P1) — Claude (October 21-22)** Alerts with minimap pings and tap-to-jump: squad
  under attack, zone being retaken, hazard incoming, artillery marked. Done:
  - The newest alert (`camera-assist.mjs`) is any of: a squad under fire, a drone lost,
    artillery or lightning marked, an eruption, or a held zone being retaken.
  - It shows as a red minimap ring for 20 s. J or the Alert button jumps there.
  - A held zone being retaken raises its own warning toast, once until it is back at full
    control. Warning toasts are tappable and jump the camera to the alert.
  - Evidence: `tests/invasion-camera-assist.test.mjs`. In the browser the "being retaken"
    toast appeared and tapping it centered the view on the zone.
  - Weather fronts that cover the whole map have no single place to jump to. A list of
    recent alerts could come later.
- [ ] **CTRL-07 (P2)** Formation choices (spread, tight, line) and stances (aggressive, hold
  fire for a quiet takeover).
- [x] **CTRL-08 (P2) — Codex, October 20; implementation and automated checks** Minimap
  defaults to View taps. Desktop right-click orders selected squads; Map: Orders enables
  touch/pen taps for attack/capture/move, with a brief target pulse. Paused orders work;
  cancelled/multi-touch/drag/modal gestures cannot leak commands. Order input during drop
  placement cancels the preview without spending/launching. New/resumed missions start in
  View mode; Clean view hides map controls. **400 tests pass**;
  [evidence](research/swarmfall-minimap-orders-2026-10-20/README.md). Native browser/touch/device
  acceptance remains open under TEST/accessibility tasks.
- [ ] **CTRL-09 (P2)** Drop presets ("assault", "hack team"), remembered per planet.
- [ ] **CTRL-10 (P2)** Settings: camera speed, invert drag, key rebinding, UI size.
- [ ] **CTRL-11 (P3)** Gamepad support.
- [ ] **CTRL-12 (P3)** Pause menu with restart, settings and quit to the galaxy.
- [ ] **CTRL-13 ★ (P1) — implementation by Codex, October 19; browser review pending**
  Clean view hides mission panels, minimap, toasts and battlefield labels. A small restore
  button remains; V toggles and Escape restores the HUD. Drop controls/mission end restore
  the HUD; camera controls remain available. V preserves the existing R/F pitch controls.
- [x] **CTRL-14 ★ (P2) — Claude (October 21)** Free camera (owner: "a free camera there we can
  move up and down freely would be nice"). **Free cam · C** under the minimap switches between
  the orbit camera and a camera that flies anywhere (`free-camera.mjs`):
  - Keys: W A S D fly, R/F or Page Up/Down rise and fall, Q/E turn, Z/X look up and down,
    Shift faster.
  - Mouse: the wheel rises and falls, right-drag looks, left-drag slides.
  - Touch: one finger slides; two fingers spread to fly forward and twist to turn. On-screen
    ▲ ▼ ◠ ◡ buttons rise, fall and look.
  - Speed grows with height. The camera stays over the map, above the ground and roofs,
    below 2.5 km, and out of buildings once the city is found.
  - Tapping still gives orders, and the minimap still jumps the view. Leaving returns to
    orbiting the point ahead. Free view isn't saved with a mission.
  - Evidence: `tests/invasion-free-camera.test.mjs`. Browser: street level in Corvan Prime;
    R rose 45 m and W flew 46 m in one second of frames.

## 4. Economy and progression (ECON)

- [x] **ECON-01 (P1) — Claude (October 22)** Hive upgrades bought with banked matter between
  missions: pod slots, pod cooldown, drone armor, speed and damage, hazard resistance, Link hack
  speed. New screen; rules in `campaign.mjs`.
  - **Upgrades** on the galaxy screen. Seven lines, three levels each [EST], with the effect
    per level:
    - Bigger pods: +4 wave slots.
    - Fast launch: -1 s between waves.
    - Armor plating: +10% drone health.
    - Engines: +8% speed.
    - Weapons: +10% damage.
    - Weather sealing: -20% hazard damage.
    - Link firmware: +20% Link capture.
  - Bought from the bank (`buyUpgrade`) and saved with progress. Each battle fixes its levels
    in `b.upgrades` (`battle.mjs` `upgradeEffects`), so saves resume exactly; battles without
    upgrades are unchanged.
  - Evidence: `tests/invasion-upgrades.test.mjs`; in the browser the dialog lists all seven.
  - **Balance note for playtesting:** each planet's minimum supply means spending the bank
    early costs little. Consider charging upgrades against the supply floor, or raising costs
    (ECON-03).
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
- [ ] **DRONE-10 ★ (P2)** Optional small drill drone, with a distinct cost/mobility/slot role
  alongside Dragonfly. Evaluate stronger extraction while landed at a safe held deposit/zone;
  show the landed collection bonus and test mission economy before increasing rates. Scouts,
  Links, Strikers and Breachers remain flying units. Dragonfly is currently the only drone
  that lands to drill; no new drill unit or harvest-rate buff is implemented in this update.
- [ ] **DRONE-09 ★ (P2)** Weapons for fighting other drones, different from those used on
  defenders and planet threats: EMP pulse, flak pods, net launcher. Uses the existing `air`
  target class in `units.mjs`; needed by MODE-12.

## 6. Defenders, society and the public (ENEMY)

- [x] **ENEMY-01 (P1) — Claude (October 22)** Make the public visible: people in settlements who
  flee from drones; panic raises the alarm; harming them carries a penalty.
  - Every populated settlement shows 4 to 14 townspeople (by population) who wander near home.
    They run from drones within 45 m and drift back once the town is quiet or captured.
  - Panic already raised the alarm (drones seen by the public). New: fighting inside an
    uncaptured, populated town adds a crossfire penalty to the alarm, and the battle log says
    so once per town ("Links capture quietly instead").
  - The townspeople are drawn only [EST]; the rules count the crossfire, so saves and replays stay
    exact. Saves validate the new `crossfire` flag.
  - `tests/invasion-public.test.mjs`: a fight in a defended town raises the alarm well above the same
    fight in an emptied one, and the log line appears once.
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

- [ ] **MODE-20 ★ (P2)** Individual-drone first- and third-person control (owner, October
  16; expanded October 19). Let the player take over an eligible drone, switch between an
  onboard first-person view and third-person chase view, fly/aim/use that drone's abilities,
  and return to RTS swarm command. Owner reference: Ghost Recon / RTS-style direct control;
  exact game reference is not yet specified. Preserve campaign objectives, hazards and
  progression, and keep other squads following orders. A separate optional pilot/skirmish
  mode is an acceptable first playable step if campaign integration needs more groundwork;
  that prototype does not complete the campaign handoff milestone.
- [ ] **MODE-21 ★ (P3)** Future Tank Wars-style drone builder for the pilot campaign (owner,
  October 16). Design configurable drone bodies, propulsion, weapons and equipment, with
  understandable cost/performance tradeoffs. This is a future design request; scope and
  the specific Tank Wars reference need clarification when implementation begins.
- [ ] **OBJ-07 ★ (P1)** Meeting the level's required objectives should offer a choice:
  **leave and claim victory** or **continue capturing everything** (owner, October 16).
  Keep the battle running when continuing, retain an explicit victory/extraction action,
  show remaining zones, and award campaign rewards exactly once. Define loss/retreat after
  victory is available and when optional objectives/stars are finalized.
  **Codex, October 19:** implemented with tested rule/save/settlement behavior. Browser/touch
  acceptance remains open, including choice on resume and visible extraction while continuing.
- [ ] **DROP-01 ★ (P1)** Split a squad's delivery into multiple parachute pods carrying
  **1–3 drones per pod**, dropped beside one another (owner, October 16; suggested rule).
  Keep one squad/order group across the wave. Show pod count before launch; find spaced,
  safe landing points inside the chosen zone, with a fallback when space is limited.
  Charge matter once for the full payload and apply cooldown once per wave. Update arrivals,
  release timing, inbound counts, save/resume and drop HUD; test small and large payloads.
  **Codex, October 19:** implementation and automated rules/scene checks delivered; keep
  this broad item open until DROP-08's browser/touch acceptance is completed.

Free mode (★ owner: "eventually a free mode with a universe or galaxy to pick planets"):

- [ ] **MODE-01 ★ (P2)** Planet generator from a seed: biome, society, threat, hazards, zone
  count. `createBattle` already accepts any planet object; extend `planet-terrain.mjs`.
- [ ] **MODE-02 ★ (P2)** A galaxy browser with many star systems: pick any planet and see its
  details (builds on `galaxy.mjs`).
- [ ] **MODE-03 (P2)** Custom settings (starting matter, pod slots, hazards on or off) and
  shareable seeds.
- [ ] **MODE-22 ★ (P2)** Frontier maps (owner, October 21: "make the large map variants with
  cities a different mode"). Large variants of campaign worlds, apart from the campaign, each
  with rough terrain and a city to find.
  - **Done (Claude, October 21):** Title-screen **Frontier maps** button and list, and
    **Corvan Frontier**:
    - A 6 km map. Ridged ice mountains peak around 450 m.
    - A flat valley 4.5 km long and 2.5 km wide (five times the city across).
    - Corvan Prime's 900 m district sits deep in the valley, about 3.8 km from the Hive beacon.
      The beacon lands in a basin of its own, with a lower pass into the valley.
    - Only the beacon is known at the start. Each outpost, and the city as a whole, appears
      once a drone comes within its sight plus 200 m. Hidden defenders aren't drawn.
    - The minimap shows shaded relief. The camera pulls back at most 1.8 km, and the haze
      hides what lies kilometers away.
    - Supply: 650 matter. At least Scout, Link and Striker, and 16 wave slots.
    - Results count toward statistics and achievements, never the campaign bank or conquests.
  - **Done (Claude, October 21, later):** **Ashfall Frontier**, the second map:
    - A 6 km volcanic map. Black ridged mountains with three cratered volcano cones up to
      about 810 m.
    - A 4.6 km valley veined with lava channels (about 2% of the map). Channels stay away from
      the beacon, and zones are only placed on solid ground.
    - **Forgeholm**, about 4 km from the beacon, uses the new forge city style
      (`city-layout.mjs` "forge"): foundry halls with glowing furnace doors, 1-3 banded
      smokestacks per block rising 50-95 m through the hall roofs (drones climb over them),
      cooling towers, slag yards with ore heaps, and smoke from the tallest stacks.
    - Supply: 750 matter, threat 4, eruptions and ash. Existing metropolis cities are proven
      unchanged by a fingerprint test.
  - **Done (Claude, October 21, later still):** **Velm Frontier**, the third map:
    - Jungle hills around a 4.2 km swamp valley crossed by rivers.
    - **Brackenford**, a walled market town (`city-layout.mjs` style "town"):
      - 528 plastered and brick houses with red tile roofs around courtyards, and garden blocks.
      - A stone keep with a flag.
      - A crenellated 10 m town wall with two gates per side and four turrets. Troops must
        use the gates; drones fly over.
    - About 3.3 km from the beacon. Agrarian society, threat 2, acid rain. Supply: 600 matter.
    - Frontier maps get lighter jungle trees.
  - **Still to do:**
    - More frontier maps (Skyway for Aurex, a storm-ocean harbor for Halcyon).
    - Owner playtest of distances and balance. Forward drops need a captured outpost.
    - ~~A frontier record (best time, stars).~~ Done October 21: wins, best stars and fastest win
      per map, saved with progress and shown in the Frontier list.
    - Overlap with ROAM-01/02 (free roam) to settle with the owner.

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
  - **Progress (Claude, October 21):** The owner said cities belong inside larger planetary
    maps. The first district went into campaign Corvan (published as `9b77399`). The owner then
    found it took up most of the map and was visible from the start. They asked for rougher
    terrain, a valley five times bigger and an even bigger map, possibly as a separate mode.
    Cities now live in Frontier mode (MODE-22), and campaign Corvan is its snowfield again
    (first city version archived in `archive/swarmfall-corvan-city-2026-10-21/`). Done for the
    district:
    - One seeded, versioned layout (`city-layout.mjs`) with stable building IDs.
    - Level city ground blended into the terrain.
    - Building-aware walking, roof-aware flight, and pod landings only on open ground.
    - Squares as capture zones, plus countryside zones outside the city.
    - Minimap footprints once the city is found.
    - Checkpoints record the whole world (map, city, landform). Saves made on any earlier
      Corvan map resume on that map.
    - Tests in `tests/invasion-city.test.mjs`.
    Still open:
    - ~~Line of sight: shots pass through buildings.~~ Done October 21 (see COMBAT-03).
    - Real routes for ground troops (FIX-03).
    - Building damage and destruction.
    - District culling and async loading. Corvan Frontier draws about 250 k triangles at the
      start and about 380 k with the city; measure on a real phone.
    - City types for other frontier maps (market town, forge city, Skyway for Aurex).
    - Owner playtest of Corvan Frontier's 9-zone / 6-required balance.

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
- [ ] **VIS-20 ★ (P2)** Kit-built Environment Lab worlds (Claude, October 20). Done: shared kit,
  rebuilt Metropolis (modular Downtown parts, owner's "too identical" feedback), orbital ring,
  asteroid colony and Titan Hive outpost. Still to do:
  - **Owner decision on the orbital ring:** it does not fit the story yet and is too small for a
    battle map. Options raised: the Hive's own mothership shown between missions (no rescale), or a
    late-campaign target such as Aurex's habitat, rebuilt at 10-15 km with a ~1 km playable arc.
  - Done October 20 (later): **walled market town** (about 400 houses from Kenney wall panels with
    drawn roofs, walls, castle, turning windmill sails and water wheel) and **forge city** (lava,
    foundries, stacks with smoke, cooling towers, ore railway, volcanoes).
  - Measure Light mode on a phone (Metropolis is about 4 M triangles on High); add distance-based
    detail if needed. Let kit worlds join the destruction study (they currently opt out).
  - The lab downloads three.js twice: `aftermath.mjs`, `asset-viewer.mjs` and `city-damage.mjs`
    import it with `?v=dev`, while `lab.mjs` and the kit import it without. Use one URL.

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
  FIX-03, MODE-20 and PERF; Kenney source pack downloaded for evaluation. Lab city previews
  now exist; a playable campaign city remains pending.
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

- [x] **VIS-01 (P1) — Claude (October 22)** Rotor-wash dust under low drones and at pod touchdown
  (reuse `downwash-dust.mjs`).
  - `swarm-dust.mjs` takes the simulator's dust look and motion (puffs rolling out, rising,
    growing and fading) and pools 64 puffs for the whole swarm.
  - Drones below 12 m raise dust, more the lower they fly (the Dragonfly drilling, drones just
    released), and each pod touchdown raises a burst.
  - The dust is tinted like the ground, a little lighter, and none rises over water or lava.
  - Evidence: `tests/invasion-dust.test.mjs`. In the browser, two pods landing on Kepra raised
    20 puffs, with no errors.
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

Optional, generated sound since October 22 (`battle-sound.mjs` decides, `sound.mjs` plays).

- [x] **AUD-01 (P1) — Claude (October 22)** Effects:
  - A swarm hum that grows with the number of drones in view (the simulator's `sound-mix.mjs`
    approach: a pure mix module plus a Web Audio player).
  - Shots per weapon: tracer, laser, missile, flak, spear, charge.
  - Explosions sized by what was destroyed, a capture chime, a loss tone, and alarm sirens by
    stage.
  - Shots are limited per weapon so steady fire rattles rather than roars.
- [x] **AUD-02 (P1) — Claude (October 22)** Hazard sounds:
  - Rain (methane and acid rain, lightning storms).
  - Wind (blizzard, gusts, dust, ash).
  - Thunder on lightning strikes, and an eruption rumble that grows nearer the view.
  - The pod's entry roar on each drop, and parachute flutter at nearby landings.
- [x] **AUD-03 (P1) — Claude (October 22)** **♪** button in the mission bar, or M: off, quiet,
  medium, loud. Off by default, remembered on the device, and it starts only after a click or
  tap. Evidence: `tests/invasion-sound.test.mjs`. Browser: the button switched sound on and
  saved the level, with no errors. Listening on real speakers is still the owner's call.
- [ ] **AUD-04 (P3)** Music by society level.

## 12. Performance (PERF)

- [ ] **PERF-01 (P1)** Measure on real phones: frame time with 40, 100 and 150 drones, on
  Aurex's skyline and in storms.
- [ ] **PERF-02 (P1)** Each Dragonfly drone is a full copy of the research model's exterior.
  Use a low-detail stand-in beyond about 150 m.
- [ ] **PERF-03 (P2)** Profile the 2,400 CPU-updated weather particles on target devices.
  Move animation to the GPU or reduce cost only if measured frame time justifies it; verify
  storm appearance, paused state and deterministic game hazards stay correct.
- [x] **PERF-04 (P1) — Claude (October 22)** Adaptive resolution and a graphics quality setting
  (decor density, effects), in `quality.mjs`.
  - **Graphics: Low / Medium / High** on the title screen, remembered on the device. It sets
    decor density, city detail (park trees, forge smoke), frontier ground detail and the
    sharpest pixel ratio.
  - Resolution also adapts on its own: about 2 s under ~40 fps steps it down (to half at
    most), and 5 s over ~57 fps steps it back up.
  - Evidence: `tests/invasion-quality.test.mjs`. On Velm Frontier at the start, Low draws
    about 126 k triangles at 0.75 pixel ratio, against about 250 k or more on High.
- [x] **PERF-05 (P2) — Claude (October 22)** Combat checks every unit against every enemy each
  step. Use the spatial grid already used for drone spacing.
  - Target and splash searches use 60 m buckets per side (`battle.mjs` `combatIndex`). Each
    search looks only within the unit's longest weapon range or the splash radius, but visits
    candidates in their original list order, so ties break exactly as before.
  - Evidence: identical battle state compared with the previous code on Halcyon, Aurex and
    Corvan Frontier (four waves each). Step time is 25-42% lower.
- [ ] **PERF-06 (P2)** Run the simulation in a background worker if the page gets busy.

## 13. Engineering and tests (TECH, TEST)

- [ ] **TECH-01 (P2)** Extract cohesive parts of `main.mjs` into `invasion/ui/` modules while implementing the relevant feature, like the
  simulator's `ui/` folder: camera, selection, drop panel, HUD, minimap, debrief.
- [ ] **TECH-02 (P2)** Fixed-step simulation, so game speed and frame rate never change the
  result; needed for replays and online versus.
- [x] **TECH-03 (P1) — Codex, October 19; current schema scope** Add migrations for existing versioned campaign/checkpoint saves before
  waves, victory eligibility, upgrades or environment fields change. Exact-version rejection
  existed before this update. Real mission v1/v2 and campaign v1 fixtures now migrate to mission
  v3/progress v2 without losing paid payloads, captures or unlocks. Unknown future versions are
  rejected; recoverable backup/export and future schemas remain SAVE-02/05/06 work.
- [ ] **TECH-04 (P2)** Export and import progress to move it between devices.
- [ ] **TECH-05 (P3)** Installable app with offline play.
- [x] **TEST-01 (P1) — Claude (October 22)** A render smoke test for `scene.mjs` and `models.mjs`,
  using the stand-in renderer from the simulator's `render-smoke.test.mjs`.
  - `tests/invasion-scene-smoke.test.mjs`: every game model builds finite geometry, and every
    campaign planet and frontier map (10 worlds) runs through the real scene.
  - Each world loads with real terrain, plays 60 frames of a drop, combat, weather, an
    explosion and an artillery strike, then reveals any city and draws from the free camera.
  - On unload nothing is left behind except Titan's landscape, kept hidden on purpose.
  - Appearance and speed still need the browser (PERF-01).
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

- [x] **OPS-01 (P1) — Claude/Codex; closed in eed63b1, status reconciled October 19**
  The earlier aft-bulkhead/inspection work was completed, archived and published. Its old
  uncommitted/failing-test note is preserved in the checklist archive. Continue protecting the
  game's Dragonfly rendering from simulator changes under TEST-04 rather than reopening this task.
- [x] **OPS-02 (P1) — Claude (October 22)** GitHub Actions warnings on the publish run: actions that target Node 20
  are deprecated (`configure-pages@v5`, `deploy-pages@v4`, the upload step); update them when
  newer versions are available. `ubuntu-latest` moves to Ubuntu 26 from October 19, 2026:
  watch the first run after that.
  - **Progress (Claude, October 22):** updated to `configure-pages@v6`, `upload-pages-artifact@v5`
    and `deploy-pages@v5`, all on Node 24. Their release notes list no breaking change for this
    workflow; v5's only addition is an optional `include-hidden-files` input. Check the first
    publish run after this change for the Node 20 warning, then tick this item. Runs on
    October 21-22 (Ubuntu 26 already) all passed.
  - **Done October 22:** run 39727869683 (`22e7df8`) passed with no Node 20 warning. Only
    GitHub's general Ubuntu 26 notice remains, and runs on it pass.
- [ ] **OPS-03 (P2)** Owner decision: a "Play Swarmfall" button on the simulator page (not
  added; the game links back to the simulator).
- [ ] **OPS-04 (P2)** A short link that ignores capitals in the project name, for example a
  `tboy450.github.io` site with a `/swarmfall` redirect, or a separate `swarmfall` repository.
- [ ] **OPS-05 (P2)** Credits and notices in the game: the three.js license, the NASA/APL
  Dragonfly sources behind the model, and a "fan-made, not affiliated with NASA or APL" line on
  the title screen.
- [ ] **OPS-06 (P3)** Audit stale worktree records and the older `sites` remote; identify any
  recoverable work and record cleanup options. Preserve everything under the owner's current
  no-deletion instruction; actual removal requires a later explicit cleanup request.

## 15. Documentation (DOC)

- [ ] **DOC-01 (P2)** Design notes: every gameplay number (drones, defenders, hazards, alarm,
  economy) in tables with the reason for it, kept in step with the code.
- [ ] **DOC-02 (P2)** How-to guides: add a planet, a drone, a defender, a hazard and an
  achievement (files to touch, tests to add).
- [ ] **DOC-03 (P3)** A player guide (controls and tips) linked from the title screen.

## 16. Destructible environments (ENV)

- [x] **ENV-05 ★ (P2) — Codex (published October 17)** Progressive damaged/destroyed art studies
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

## 17. Multi-pod delivery acceptance tasks (DROP)

These complete the original DROP-01 feature; they are not separate squad purchases. Use the
current terrains first, then reuse the same placement contract in city districts.

- [x] **DROP-02 ★ (P1) — Codex, October 19** Define deterministic payload packing: 1–3 drones per physical pod,
  mixed types supported, with current slot capacity applied to the **whole wave**. Explicitly
  decide how a large Dragonfly occupies a pod. Show wave capacity and pod count before launch.
- [x] **DROP-03 ★ (P1) — Codex, October 19** Give each wave and physical pod stable IDs. Charge matter and apply
  recharge once per accepted wave; failed validation charges nothing. Preserve one squad,
  type limits, unlock rules and loss recovery. Count waves versus physical pods separately.
- [ ] **DROP-04 ★ (P1)** Preview spaced touchdown positions beside one another within a held
  landing area. Check dry/allowed surface, slope, playable bounds, canopy/pod clearance and
  formation space. Use a bounded reposition/stagger fallback when the first layout cannot fit.
- [x] **DROP-05 ★ (P1) — Codex, October 19** Coordinate staggered arrivals. Assign unique formation slots across
  sibling pods; retain squad commands while later pods descend. A delayed pod must not reset
  orders, overlap released drones or split the delivery into unrelated squad cards.
- [ ] **DROP-06 ★ (P1)** Render every inbound pod/parachute with separate touchdown cues and
  controlled separation. Review the current fixed visual pod pool before increasing count;
  never silently hide excess inbound pods. Explain inbound, released and missing drones in HUD.
- [x] **DROP-07 ★ (P1) — Codex, October 19** Save/resume complete wave state: payload partition, positions,
  timers, released flags and shared squad ID. Reload before descent, between releases and
  after release; produce each drone once and never charge/refund a wave twice. Depends TECH-03.
- [ ] **DROP-08 ★ (P1)** Accept the feature with 1/2/3/4 drones, mixed and maximum payloads,
  multiple waves, paused launches, narrow courts, shoreline/roof/bridge obstacles and low
  frame rate. Test failure feedback, last-pod arrival and command continuity on desktop/touch.

Codex evidence, October 19: 12 focused wave/checkpoint tests plus the real Three.js scene
with a stand-in renderer (15 visible pod assemblies, 44 payload bodies, teardown/reload).
All seven campaign terrain pads accept the initial mixed wave. Version-1 mid-drop saves keep
their original paid giant pod, then new purchases use the new packing. DROP-04 and DROP-06
are implemented for current terrain but remain open for visual acceptance; imported-city
collision is still pending. Browser tooling rejected the local preview, so DROP-08 remains open.

## 18. Victory, objectives and checkpoint completion (OBJ, SAVE)

OBJ-07 is the owner feature. Resolve its rules before adding UI or awarding rewards early.

- [x] **OBJ-08 (P1) — Codex, October 19; rules/presentation and automated acceptance** Align objective wording and logic: “destroy every watchtower” currently
  checks remaining native structures, so conversion can satisfy it. Decide whether each
  objective means destroy, capture or neutralize; test every allowed path and display it clearly.
  Completed: shared “Neutralize every … (destroy or capture)” wording for towers/jammers in
  briefings, live objectives and debriefs, including old saved wording; “N hostile remaining”
  excludes dead records. Actual combat destruction, zone conversion, enemy retaking and
  extraction-star outcomes tested for both target types, plus capture/loss/alarm/time/hazard
  boundaries. Existing `destroyType` save keys keep their conversion-compatible semantics.
  **366 tests pass**. [Evidence](research/swarmfall-objective-rules-2026-10-19/README.md).
  Whole-mission balance and real browser/touch acceptance remain the existing TEST tasks.
- [x] **OBJ-09 ★ (P1) — Codex, October 19; rule/save/UI implementation, visual acceptance under OBJ-07** Add a persisted **victory available** phase distinct from a finished
  mission. Offer leave/claim victory versus continue. Keep an obvious extraction action and
  remaining-zone count while continuing; do not repeatedly interrupt after the first choice.
- [x] **OBJ-10 ★ (P1) — Codex, October 19** Define eligibility after zones are retaken, retreat or total defeat;
  whether time-based goals stop at eligibility or extraction; and when stars/refunds finalize.
  Implement the selected rules in one place and describe them in the choice/debrief.
- [x] **OBJ-11 ★ (P1) — Codex, October 19** Settle a mission exactly once using a stable completion identity.
  Exercise repeated callbacks, double activation, reload around extraction and replayed planets.
  First-conquest rewards remain distinct from replay income, statistics and best-time updates.
- [x] **SAVE-01 (P1) — Codex, October 19; current checkpoint schemas** Strengthen checkpoint validation for references and rule invariants:
  squad membership, orders, finite movement/formation values, pod release flags, strikes and
  practical array/count bounds. Reject invalid state without damaging valid campaign progress.
  Completed: required stats/flags, unit class/side/conversion, objective/home/raid references,
  pod siblings/slot ranges/capacity, strike/hazard internals and bounded JSON preflight.
  Preserve dead-target retargeting and independently expired backshells; v1/v2 fixtures still
  migrate. Eleven new tests, all-seven-planet active weather/combat checks, **325 tests passing**.
  [Evidence and prior-validator comparison](research/swarmfall-checkpoint-validation-2026-10-19/README.md).
  Visible recovery/export is now implemented under SAVE-02; browser storage faults remain SAVE-03.
- [x] **SAVE-02 (P1) — Codex, October 19; implementation and automated acceptance** Add real previous-version fixtures and explicit checkpoint/progress
  migration through TECH-03. An unsupported save should produce a useful explanation and a
  recoverable backup/export path, rather than silently appearing as a fresh campaign.
  Completed: visible title recovery state, confirmed readable-campaign recovery/fresh start,
  exact-original verified browser backup before replacement/legacy migration, session/original/
  preserved-backup JSON download controls, safe retry and no write on load. Failed backup,
  failed final write and observed cross-tab changes retain the original; reset only adopts
  fresh state after a successful save. Twelve storage/data and seven entry-point wiring tests;
  **351 total tests pass**. [Evidence](research/swarmfall-save-recovery-2026-10-19/README.md).
  Native browser download/focus/touch and storage-fault acceptance stay under SAVE-03/SAVE-06;
  browser backups share local quota, and file import is future work.
- [ ] **SAVE-03 (P1)** Add a tested result-settlement boundary between active mission and
  campaign bank. Handle closure during the current debrief delay and failed browser writes;
  prevent duplicate rewards/recall or unexplained loss of a just-finished mission.
  **Codex, October 19:** immediate settlement, one-write progress/checkpoint envelope, retry
  UI/dirty-result retry and failed-write tests implemented. Keep open for browser fault injection
  and recovery review; unavailable storage cannot preserve memory across a closed page.
- [x] **SAVE-04 (P2) — Codex, October 19; implementation and automated acceptance** Define which command UI state should survive reload: selected squads,
  camera, pending orders, drop payload and placement intent. Restore safely paused and cancel
  stale placement previews rather than accidentally launching from an old pointer position.
  Completed: optional versioned command metadata retains active/inbound squads, bounded
  unlocked payload drafts (including zero/empty), panel state and the camera. Orders/cargo
  remain battle-owned. HUD visible, speed 1× and paused on reload; pointer/landing intent
  discarded, with no automatic charge/launch. Bad/future UI metadata falls back safely while
  battle validation stays strict. **360 tests pass**, including seven new state tests and
  two actual Resume entry-point checks. [Evidence](research/swarmfall-command-resume-2026-10-19/README.md).
  Real browser/touch reload acceptance stays under SAVE-06.
- [ ] **SAVE-05 (P1)** Version the environment binding in a checkpoint: environment ID,
  layout/district version, structural states and objective surface IDs. Rebuild collision and
  surface callbacks; document migration/fallback when an authored city changes. Depends CITY-01/02.
- [ ] **SAVE-06 (P1)** Add reload scenarios for sibling pod arrivals, victory availability,
  continued capture, local destruction and pilot/command switching as those features arrive.
  Include unavailable/full storage and interruption; future fields must not replay effects or rewards.

## 19. Movement, combat and defender behavior (COMBAT)

These extend FIX-02/FIX-03; new cities cannot rely on decorative geometry for game rules.

- [ ] **COMBAT-01 (P1)** Define shared obstacle footprints and vertical intervals, including
  elevated routes. Reuse the same queries for flight, ground navigation, camera clearance,
  target visibility and landing validation. Rendering and collision must share transforms.
- [ ] **COMBAT-02 (P1)** Route drones around/above obstacles with look-ahead and bounded
  climb/descent. Handle shoreline, steep ground, narrow streets, blocked goals and formations;
  recover from an unavailable route with feedback rather than leaving a squad stuck forever.
- [ ] **COMBAT-03 (P1)** Use consistent world heights for weapon range and targeting. Add
  line of sight/cover against shared geometry and distinguish air, ground and structures.
  Explain a blocked shot; test street-to-roof and under-bridge cases before city release.
  - **Progress (Claude, October 21):** Line of sight and cover for city buildings:
    - `cityQueries().lineBlocked` tests a line against every building box (city-layout.mjs).
      `terrain.lineBlocked` turns each unit's height above its own ground into city heights.
    - Units fire from different heights: defenses from a 4 m mount, troops from 1.6 m, flying
      units from their altitude.
    - Direct fire needs a clear line; artillery stays indirect.
    - Drones on an attack order, and troops chasing drones, close in when a building is in
      the way.
    - Tested: cover, getting hit in the open, an attack order finding a clear line, and
      down-the-street and over-the-roof lines. A 56-drone city fight costs under 1 ms per step.
    - Later the same day:
      - On frontier maps, ridges and hills block sight too (the line is sampled every ~30 m;
        campaign maps unchanged).
      - A selected drone's attack target gets a faint line when it can fire, and a dashed red
        one with "No clear shot" while blocked.
    - Still open: bridges and multi-level surfaces (none in the game yet).
  - **Progress (Claude, October 22):** Weapon range now uses world heights:
    - `shotRange` in battle.mjs measures in 3D between the two firing heights, including the
      ground under each unit. Firing, attack-move, attack orders and troops chasing drones all
      use it, so a unit never stops where it thinks it can fire but cannot.
    - A drone over a 48 m tower (flying at 58 m) is out of a watchtower's 70 m reach from 50 m
      away and is hit once it comes down. A drone on a 60 m ridge is out of reach of a tower in
      the valley. A spear (28 m) reaches a Striker (28 m up) only from nearly underneath.
    - Air, ground and structure targets keep their own weapon lists (units.mjs `hits`).
    - Balance check on all 7 campaign planets (two scripted waves each): 11 of 14 fights came
      out the same and the rest differ by one or two drones. Step time is within 0.2 ms of
      before on the Frontier maps.
    - `tests/invasion-range-height.test.mjs`: street to roof, ridge to valley, spear to Striker.
    - Still open: under-bridge shots (no bridges yet, CITY-04).
- [ ] **COMBAT-04 (P2)** Make squad intent legible: target/retarget cue, movement destination,
  attack range and stop/disengage feedback. Show jammer/shield coverage and why a capture or
  weapon is blocked. Coordinate FIX-05, CTRL-06 and CTRL-07 rather than duplicating controls.
- [ ] **COMBAT-05 (P2)** Give defenders obstacle-aware patrol, investigate, defend and retreat
  behavior, with readable reinforcement origins. Cap numbers and ensure spawn sites/routes are
  valid; avoid reinforcements appearing inside occupied solids or inaccessible city levels.
- [ ] **COMBAT-06 (P2)** Test converted defenses and civilian/control-path consequences with
  the new geometry. Keep friendly/enemy target selection, alarm, zone recapture and structure
  damage coherent; a converted turret must not keep blocking objectives invisibly.

## 20. Playable city implementation (CITY)

These are the concrete work packages behind VIS-18. Keep each map's acceptance matrix current.

- [ ] **CITY-01 (P1)** Establish one coordinate/scale contract: units, up axis, origin,
  source transform, district bounds and meaningful drone/road/door dimensions. Record the
  current normalized display scales explicitly; do not change range/speed balance by accident.
- [ ] **CITY-02 (P1)** Export authored stable IDs for buildings, bridge spans, props and
  structural families **before** merging geometry. Preserve identity through material batches,
  LODs and damage variants; reordering source meshes must not change saved building identities.
- [ ] **CITY-03 (P1)** Supply terrain samples/triangle queries that match the baked surface.
  Keep Houdini's fitted coast intact instead of flattening it again with procedural zone pads.
  Test terrain height/normal, shore classification and boundaries at district edges.
- [ ] **CITY-04 (P1)** Add multi-level surface queries and picking: street, bridge, terrace,
  roof and tunnel IDs with height/normal. Order the intended level under overhangs and connect
  only physically reachable surfaces. A single height value cannot represent stacked streets.
- [ ] **CITY-05 (P1)** Prepare environments asynchronously before creating a battle, with
  progress, retry, cancellation and partial-resource release. Returning to the galaxy or
  changing selection must not start an abandoned load or display mismatched mission state.
- [ ] **CITY-06 (P1)** Author the first district's capture sites, defender spawns, matter
  access, safe drop courts and extraction route. Validate required-objective reachability
  before play; choose meaningful city landmarks rather than random rings through buildings.
- [ ] **CITY-07 (P1)** Build a separate city battle test with its own checkpoint namespace.
  Validate start/drop/order/capture/continue/extract/reload on one district. Keep existing
  campaign planets and progress intact while the city test is under review.
- [ ] **CITY-08 (P2)** Define district transitions and city boundaries: when the next region
  activates, how squads/orders move between them and which simulation stays active. Preserve
  large-city skyline context without simulating every street at full detail at once.
- [ ] **CITY-09 (P1)** Render in district × material chunks while retaining structure IDs.
  Add distant skyline proxies, culling and bounded asset lifetime; verify the silhouette,
  materials and terrain joins before broadening the active map. Coordinate PERF-07/08.
- [ ] **CITY-10 (P2)** Add city-aware minimap/intelligence: district extents, route links,
  landmarks, relevant vertical levels and landing courts. Show meaningful blocked/reachable
  areas so the strategic map agrees with what the player sees in the 3D view.
- [ ] **CITY-11 ★ (P2)** Map reviewed environments to civilizations without losing their
  identities: intricate Skyway capital, realistic urban districts, radial alien arcology,
  fantasy island citadel and modular metropolis. Review art, lore and biome fit per planet.
- [ ] **CITY-12 (P1)** Accept each integrated district independently: art/support review,
  navigation, capture access, safe descents, geometry-aware combat, environment-versioned saves
  and target-device performance. Update the five-map matrix; one successful map does not close all five.

## 21. Environment-specific art and foundations (ART)

Keep the owner's references: Skyrim's dense fantasy districts; Minecraft's scale/infrastructure
with a less blocky look; Spider-Man's continuous city fabric; Crackdown's verticality;
Kakarot's rounded architecture/regional scale; and Elven Realm's architectural complexity.
Use licensed sources and original adaptation, not proprietary franchise extraction.

- [ ] **ART-01 ★ (P2)** Review Alien arcology in Intact and all three damage stages: ceramic
  tower bodies/crowns, luminous rings, transit supports, canals and landing pads. Remove
  unsupported ornaments and make broken spans/remnants recognizable from street and aerial views.
- [ ] **ART-02 ★ (P2)** Review Metropolis blocks, intersections, parks, waterfront and skyline.
  Improve repetitive silhouettes and facade variation; preserve usable street widths and
  landmarks. Replace overly uniform broken-box profiles with reviewed building damage families.
- [ ] **ART-03 ★ (P2)** Review Tidal citadel terraces, house roofs, tower caps, bridges and
  waterfalls. Fit debris to each terrace, keep foundation levels coherent and author deliberate
  broken bridge spans; avoid floating roofs, rubble under decks or unexplained platform gaps.
- [ ] **ART-04 ★ (P1 for Skyway adoption)** Review Skyway's entire foundation by district,
  especially the high rear land. Capture front/rear/underside comparisons; tune coast contours,
  retaining cuts and supported roads without burying architecture or extending buildings into pillars.
- [ ] **ART-05 ★ (P2)** Review Phototextured city from street and rooftop distance. Address
  low-resolution/stretched facades, recognizable Earth dressing and roof detail; add a coherent
  alien adaptation while preserving the useful source layout and original credited version.
- [ ] **ART-06 (P2)** Build a reusable original detail inventory: curved facade ribs, tower
  crowns, arches, buttresses, sweeping roofs, stairs, gardens, bridge joints and signage.
  Give each piece a stable origin, scale, collision intent, material family and damage readiness.
- [ ] **ART-07 (P2)** Establish coherent materials, readable lighting and ground/water
  transitions per civilization. Check daylight/dusk and low graphics settings, especially
  whether gameplay silhouettes, capture zones and enemy effects remain distinguishable.
- [ ] **ART-08 ★ (P2)** Record owner art approval with annotated screenshots and exact version
  links for each map/stage. Retain every earlier platform/coast/damage pass and restore steps;
  numerical contact checks supplement artistic review rather than replacing it.


- [ ] **ART-09 ★ (P2; future visual priority) — owner request, October 19** Review smaller
  digital assets that lag behind the project's current visual standard: drone/defender
  details, props, icons, textures, decals and effect elements. Identify actual weak spots
  through side-by-side comparisons with the strongest existing work; prioritize frequently
  seen placeholders, basic shapes, inconsistent materials and blurry or mismatched details.
  Upgrade them in manageable batches with coherent alien/space styling, readable silhouettes
  and appropriate detail at RTS and future first/third-person scales. Keep performance and
  High/Light readability within budget. Retain originals, before/after views, credits and
  restore steps, and track reviewed assets individually before marking this item complete.
  **Preparation by Codex, October 19:** defined Scout → Link → defender/interceptor batches
  and recorded unchanged geometry/bounds for six templates. [Batch plan, inventory and next
  session handoff](research/swarmfall-small-assets-2026-10-19/README.md). First implementation
  candidate was Scout only. **A1 follow-up, Codex:** first Scout hull/sensor/deck/motor-cap
  pass implemented; exact rotor/light/scale contracts and prior envelope retained, originals
  archived. **381 tests pass**; [CPU comparison and checks](research/scout-polish-2026-10-19/README.md).
  Owner/browser/phone acceptance remains open; Link/other assets are untouched. Count 23/305.
  **Comparison follow-up, Codex:** the existing lab Scout inspector now offers shareable
  Original / Polish pass links with orbit/zoom/turntable; original template matches archived
  data exactly, and catalog remains 18 assets. **383 tests pass**. [Links and evidence](research/scout-lab-comparison-2026-10-19/README.md).
  This enables owner review; actual browser/device acceptance remains open.

## 22. Destruction integration acceptance tasks (ENV continuation)

ENV-05 is completed visual prototyping. The following tasks keep global art previews separate
from local weapon-triggered gameplay, building on ENV-01 through ENV-04 and ENV-06.

- [ ] **ENV-07 ★ (P2)** Author reviewed intact/damaged/heavy/ruined variants by structural
  family: open facades, exposed floors, fallen crowns, roof panels and bridge spans. Define
  intact support relationships so removing a lower structure cannot leave unexplained floating detail.
- [ ] **ENV-08 (P1 for playable damage)** Damage only the affected structure/district.
  Prebake or incrementally prepare variants during loading/idle time; weapon hits must not
  synchronously rebuild a whole city. Preserve stable IDs and bound active effects/debris.
- [ ] **ENV-09 ★ (P2)** Fit rubble, rods and settled fragments to actual terrain/deck
  surfaces and normals. Keep roads/canals/objective courts usable according to explicit rules;
  review all five maps close up, including steep coast and stacked citadel levels.
- [ ] **ENV-10 (P1 for playable damage)** Change visible geometry, collision, cover, route
  links and landing validity atomically for each damage transition. Define captured-building
  damage, salvage/alarm effects and extraction protection; never pay salvage twice.
- [ ] **ENV-11 (P1 for playable damage)** Test local destruction across save/reload and
  district unload/re-entry. Restore both visuals and blockers; destroyed structures stay
  destroyed, optional objectives remain correctly evaluated and required goals stay completable.

## 23. Asset & Environment Lab development (LAB)

Claude, October 22: the lab gained **Campaign planets** (entry 12), each campaign planet and
Frontier map from the game's own modules with its real capture zones; see CHANGELOG. Not a
checklist completion; LAB-05 search/categories and LAB-03 counts remain open.

- [ ] **LAB-01 (P1)** Add a public route smoke matrix: five maps × four art stages, all
  18 assets, historical foundation variants and game/lab links. Verify case-sensitive
  dependencies, meaningful ready/error state, build stamp and creator/source links on the deployed site.
- [ ] **LAB-02 (P2)** Add in-page load progress, cancel/retry and useful failure messages
  for assets/maps; partial failure must release resources and leave a usable prior view.
  Avoid requiring a full-page reload for every failed texture/model request.
- [ ] **LAB-03 (P2)** Enrich the inspector catalog with triangle/material/texture counts,
  source units or unverified-scale label, intended use, dependency size, readiness and damage
  variant availability. Keep original creator/license/modification links with each derivative.
- [ ] **LAB-04 (P2)** Add optional physical-scale comparisons while retaining fit-to-view
  inspection. Show drone/building/door reference sizes only after the coordinate contract is
  established; the existing 100-unit stand must not imply real-world dimensions.
- [ ] **LAB-05 (P2)** Improve inspection/comparison workflow: asset categories/search,
  focus/reset, useful isolated detail views and shareable camera/stage links. Preserve stage
  selection across map navigation and make the current city/damage version unmistakable.
  - **Progress (Claude, October 22):** Swarmfall's own pieces are now in the inspector (18 → 34
    entries), built by the game's code (`asset-viewer.mjs` `gamePiece`). New categories:
    - Defenders: three militia in society colors, and the interceptor.
    - Defenses: all seven.
    - Settlements: houses at society levels 1-5.
    - City styles: metropolis, forge and town sample blocks.
    - The Dragonfly lander drone, under Drones.
    They show intact (no damage preview), and `?asset=` links work for each.
  - **Search (October 22, later):** a search box above the picker (`searchAssets`). Every word
    must match the name, category, description or creator, and the picker shows the matches
    with a count ("6 of 34 match"). The asset on show stays listed, and Enter opens the first
    match.
  - Still open: focus/reset, isolated detail views, shareable camera and stage links, and
    keeping the stage across map changes.
- [ ] **LAB-06 (P2)** Measure repeated asset/map/stage switches for stalls, retained GPU
  resources and memory growth. Precompute or schedule expensive damage work as justified;
  keep the Intact view and controls responsive while variants prepare.
- [ ] **LAB-07 (P2)** Inspect the separate unfinished modular-kit work before adopting it.
  Check piece origins, snap dimensions, external textures, licenses and visual quality;
  integrate only a tested subset and retain the original unfinished files/author credits.
- [ ] **LAB-08 (P2)** Convert and inspect preserved Hidden Alley and HY-21 backups in an
  isolated authoring workflow. Resolve dependencies/material cost and HY-21's exact notice
  before redistribution; downloading or backing up a file alone is not runtime implementation.
- [ ] **LAB-09 ★ (P2)** Continue the licensed space/alien asset queue: planetary bases,
  orbital stations, spacecraft and intricate off-world architecture. Track pending versus
  downloaded versus inspected versus runtime-ready; respect free-access/download limits and retain receipts.

## 24. Pilot campaign and future drone builder (PILOT, BUILD)

MODE-20 is the owner feature; the current lab camera is not a completed pilot mode.
October 19 owner expansion: control individual drones in both first and third person, with
an optional dedicated mode as a first step. Keep this future work unchecked until playable.

- [ ] **PILOT-01 ★ (P2)** Prototype possession of an eligible individual drone. Define
  entry/exit, unit switching, which squad it belongs to and what order it resumes on release.
  An optional pilot/skirmish mode can prove controls first; then integrate possession into
  the existing campaign while preserving the ongoing battle, hazards and objectives.
- [ ] **PILOT-02 ★ (P2)** Implement controllable pitch/yaw/translation/altitude or the
  selected simplified flight scheme, with clear acceleration and boost limits. Reuse shared
  clearance/collision and world-height rules; flight must not pass through scenery.
- [ ] **PILOT-03 ★ (P2)** Add aiming, valid-target feedback, firing/reload or cooldown and
  weapon effects consistent with unit rules. Confirm friendly/enemy and structure/air/ground
  target handling; visual projectiles must agree with actual damage and line of sight.
- [ ] **PILOT-04 ★ (P2)** Build a readable pilot HUD: health, weapon state, warnings,
  altitude/clearance, objective direction, squad/mission status and a quick return to command.
  Provide switchable first-person onboard and third-person chase cameras, with suitable
  near clipping, obstacle avoidance, readable aiming and adjustable chase distance. Views
  control the same drone and abilities; camera switching must not reset combat state.
- [ ] **PILOT-05 ★ (P2)** Specify autonomy for the rest of the swarm while the player flies:
  retain orders, continue capturing/fighting and issue actionable alerts. Provide quick squad
  commands without accidental camera/input conflicts or unexplained abandoned squads.
- [ ] **PILOT-06 (P2)** Handle drone destruction, loss of control, stun and unavailable
  possession targets gracefully. Return to a valid command view or another allowed drone;
  preserve camera comfort, selected squad and outcome/extraction flow.
- [ ] **PILOT-07 (P2)** Design desktop and touch controls, configurable sensitivity,
  inversion and accessible alternatives. Keep pause/menus from firing weapons or steering;
  clear held inputs when focus changes or the browser hides. Include explicit first/third-
  person toggle, drone switching and return-to-RTS bindings without camera/fire conflicts.
- [ ] **PILOT-08 (P2)** Save/resume mode, controlled unit ID, first/third-person preference
  and necessary view/control state through reviewed schemas. Restore safely paused, validate
  target existence and fall back to command mode when the controlled drone is no longer valid.
- [ ] **PILOT-09 ★ (P2)** Playtest a whole mission that switches between command and pilot
  play in both first and third person, then repeat on a real city district. Record combat
  readability, collision, comfort, difficulty and phone performance before expanding cockpit
  art or pilot-only content.
- [ ] **BUILD-01 ★ (P3)** Clarify the owner's Tank Wars-style builder reference when this
  milestone begins. Agree on editable parts, attachment freedom and intended combat role;
  retain the concept without assuming a specific game's mechanics or copying proprietary assets.
- [ ] **BUILD-02 ★ (P3)** Define versioned part contracts for bodies, propulsion, weapons
  and equipment: sockets, bounds, mass/cost and compatible systems. Reuse stable drone/weapon
  interfaces rather than embedding builder-specific rules in the renderer.
- [ ] **BUILD-03 ★ (P3)** Prototype a useful assembly UI with part selection, attachment,
  rotation, undo/redo, symmetry if appropriate and visible invalid connections. Keep an
  inspectable default craft and explain why a design cannot be launched.
- [ ] **BUILD-04 ★ (P3)** Make cost/performance tradeoffs understandable: mass, maneuvering,
  durability, energy and weapon limits. Test obvious extremes against stock drones and
  campaign supply rules so custom designs do not bypass progression accidentally.
- [ ] **BUILD-05 (P3)** Save/export/import named blueprints with schema validation and
  part-version compatibility. Missing or changed parts need a recoverable explanation;
  preserve older designs and stock-drone access.
- [ ] **BUILD-06 ★ (P3)** Provide a separate flight/weapon test range, then trial reviewed
  designs in a campaign mission. Consider damage variants and versus fairness only after
  assembly, stats, piloting and blueprint persistence are stable.

## 25. Accessibility, settings and device usability (ACCESS)

- [x] **ACCESS-01 (P1) — Claude (October 22)** Ensure essential selection, launch, pause,
  continue/extract and menu actions have keyboard paths and visible focus. Keep shortcuts from
  activating while typing/selecting controls, and explain disabled actions rather than silently
  ignoring them.
  - Keyboard paths: 1-9 and 0 select (a second press brings the camera to the squad), Enter
    orders the selected squads to the middle of the screen (Shift+Enter queues), B opens the
    drop panel with focus on its first usable button, and while picking a zone Enter previews
    pods at the middle of the screen and a second Enter launches. Space pauses; the victory
    dialog, Extract, Squad ▾ and every panel button are reachable with Tab.
  - Safety: shortcuts are off in fields and menus (now including the Squad ▾ menu) and with
    Ctrl, Alt or Cmd held; Space and Enter on a focused button press that button.
  - Visible focus outlines on menus, fields, links and details as well as buttons.
  - Explained: Enter with nothing selected, 0 and missing squad numbers say why nothing happened;
    the drop panel already states why its launch buttons are off.
  - The Field guide has a new Controls section listing every key.
  - `tests/invasion-keyboard.test.mjs` (9 tests, real entry point); checked in the browser with
    real key presses (outline shown, B → Enter launched, 1 → Enter ordered the squad).
  - Screen reader review and touch targets stay under ACCESS-02 and later items.
- [ ] **ACCESS-02 (P1)** Review touch target sizes, pointer cancellation, drag/tap thresholds,
  pinch/rotate and portrait/landscape layout. Confirm panels do not cover the selected squad,
  landing preview or extraction decision on small displays.
- [ ] **ACCESS-03 (P2)** Add independent UI scale/text sizing and persist settings without
  changing campaign state. Test long names, large text and dense squad bars; avoid hiding
  critical information behind clipped or overlapping panels.
- [ ] **ACCESS-04 (P2)** Use icons/shapes/labels as well as color for teams, hazards,
  selected squads, damage and capture progress. Review color contrast in each biome and
  dusk/light mode; minimap markers must remain distinguishable.
- [ ] **ACCESS-05 (P2)** Offer reduced camera shake/flashes, motion intensity and comfortable
  camera speeds. Respect reduced-motion preferences where applicable while retaining clear
  hit, alarm, descent and hazard feedback.
- [ ] **ACCESS-06 (P2)** Pair important audio alerts with readable visual equivalents;
  provide master/effect/music controls and remember choices. Start with AUD-01 through AUD-03
  rather than making sound mandatory for objectives or survival.
- [ ] **ACCESS-07 (P2)** Make confirmation/result dialogs and live status useful to assistive
  technology: meaningful names, sensible focus return, controlled announcements and no focus
  traps. Verify the title-to-galaxy-to-mission loop and lab mode/asset selectors.

## 26. Performance and engineering detail (PERF, TECH continuation)

- [ ] **PERF-07 (P1 for city release)** Set measured device budgets for cold load, frame-time
  percentiles, active drones, draw calls, triangles, texture memory and debris. Record desktop
  and at least one real phone in High/Light; an FPS overlay alone is not acceptance evidence.
- [ ] **PERF-08 (P2)** Record decoded texture/GPU cost per city, not only compressed transfer
  size. Review Phototextured City's 51 material batches/58 embedded images and Skyway's large
  citywide batches; consolidate/atlas/chunk where it measurably improves the target device.
- [ ] **PERF-09 (P2)** Measure resource lifetime across mission restart, lab stage changes,
  city transitions and repeated Dragonfly deployments. Dispose owned geometry/materials while
  retaining intentionally shared textures/templates; test that memory settles rather than grows.
- [ ] **PERF-10 (P2)** Bound expensive visual work: damage preparation, weather, smoke,
  projectiles, debris and distant units. Tune quality/fallback behavior from profiles; move
  work to shaders/workers only when measurements justify the extra system complexity.
- [x] **PERF-11 (P1) — Claude (October 22)** Define gameplay behavior under low frame rate, slow
  loading, browser hide/resume and pause. Preserve simulation meaning and input responsiveness;
  do not let effects, timers or pod releases duplicate when rendering catches up.
  - New `frame-clock.mjs`: each frame's real time becomes battle steps of at most 0.05 s.
  - Low frame rate: a slow frame is caught up in several steps, up to 0.25 s of real time.
    The battle keeps real time down to about 4 frames a second (before, it fell into slow
    motion below 20). Below that it runs in slow motion, and if that lasts about 3 s the
    player is told once and pointed to Graphics.
  - Slow loading, hitches and hide/resume: anything over 0.25 s is dropped, not replayed in a
    burst. A hidden tab still pauses the battle (unchanged).
  - Pause: no battle steps; the camera, edge scroll and follow move by real time.
  - Nothing repeats: steps advance one battle, events are handled once per frame, and pods
    release on battle time. Twenty seconds at 144, 60, 10 and 4 frames a second each give 20 s
    of battle with every pod released once.
  - `tests/invasion-frame-clock.test.mjs` (5 tests, including the real entry point); checked in
    the browser through the page's own frame function.
  - Real phone frame times stay under PERF-01.
- [ ] **TECH-06 (P1)** Separate shared environment/rule queries from Three.js/UI objects.
  Keep wave, victory, damage and possession state plain and testable, and make renderer
  ownership/lifecycle explicit so new features do not expand one global entry module indefinitely.
- [ ] **TECH-07 (P2)** Handle WebGL context loss/restoration, resize/orientation change and
  low-memory/model failure. Recover a usable paused mission or a clear return path without
  overwriting its valid checkpoint. Cover the standalone lab as well as the campaign.
- [ ] **TECH-08 (P2)** Add useful diagnostics for reproduction: seed, game/environment
  version, selected quality and bounded timing counters. Make a player-readable copyable
  report; do not require a hosted account or automatic telemetry to report a local bug.
- [ ] **TECH-09 (P2)** Define reusable content registration and validation for planets,
  drones, weapons, hazards, objectives and environment manifests. Check missing references and
  unreachable/unwinnable combinations before play; document extension points through DOC-02.

## 27. Test, release and preservation detail (TEST, OPS, DOC continuation)

- [x] **TEST-06 (P1) — Codex, October 19** Add focused multi-pod regression fixtures: payload packing, one
  purchase/cooldown, all releases exactly once, unique formation slots, safe positioning and
  save/resume between arrivals. Keep coverage for the existing single-wave API while migrating it.
- [x] **TEST-07 (P1) — Codex, October 19** Add victory/continue settlement scenarios: eligibility, continued
  play, optional objectives, retaken zones, retreat/defeat rules, extraction, double activation
  and reload at the settlement boundary. Verify mission and campaign statistics together.
- [ ] **TEST-08 (P1)** Add geometry/navigation fixtures for a wall, hill, shore, bridge,
  tunnel/stacked surface and blocked goal. Test drones, ground troops, clicks, shots and pod
  corridors against the same intended geometry, not just independently passing mocks.
- [ ] **TEST-09 (P1)** Add environment-version and destruction checkpoint fixtures with
  actual stable IDs. Cover legacy saves, changed layouts, missing structures, settled rubble,
  restored blockers and safe fallback; reject inconsistent state without inventing rewards.
- [ ] **TEST-10 (P1)** Add browser acceptance runs for command/pilot controls as implemented:
  title, resume/new mission, galaxy, drops, orders, capture, pause, continue/extract and debrief.
  Exercise pointer/touch/keyboard and verify that overlays/modals do not leak into the next mission.
- [ ] **TEST-11 (P2)** Record per-map art regressions at repeatable cameras and all four
  damage stages. Review unsupported detail, caps/holes, terrain burial, water and debris on
  actual geometry. Keep prior screenshots so visual changes are deliberate and reversible.
- [ ] **TEST-12 (P1)** Build a target-device review sheet with frame-time/load measurements,
  touch usability and a full mission result. Include low quality, orientation change and
  interrupted browser sessions; lab preview success alone is not a phone playtest.
- [ ] **TEST-13 (P2)** Maintain scenario-based campaign balance records for each released
  rule/content change: time, losses, alarm, matter recovery, control/damage paths and optional
  goals. A deterministic bot is useful regression evidence, not a substitute for human feedback.
- [ ] **OPS-08 (P1)** Define a release checklist: review the intended diff, preserve concurrent
  work, check source/asset paths on a clean checkout, run required tests, confirm the stamped
  public build and exercise game/lab entry routes. Keep a documented previous-build restore path.
- [ ] **OPS-09 (P2)** Maintain exact runtime derivative provenance: source file/hash,
  creator, license/version, modifications, authoring tool and exported dependencies. Resolve
  pending notices before redistribution; keep commercial-authoring readiness separate from a free source license.
- [ ] **OPS-10 (P2)** Back up native derivative projects and external dependencies as well
  as downloaded originals: Blender/Houdini scenes, caches, scripts, reports and reviewed outputs.
  Test a restore/regeneration from preserved inputs; files excluded from Git still need protection.
- [ ] **OPS-11 (P2)** Publish a concise player/lab known-issues and feedback route, with
  build/environment identifiers and reproduction steps. Clearly label prototype art and
  planned features so public visitors do not mistake a preview for a finished game system.
- [ ] **DOC-04 (P1)** Keep one current handoff at the top of this checklist: verified scope,
  release/build/date, worktree notes, next owner priority and open blockers. Archive old status
  rather than carrying obsolete failing-test or local-only claims as current facts.
- [ ] **DOC-05 (P2)** Record gameplay decisions for wave capacity, extraction, objectives,
  pilot handoff, destruction and blueprint parts. Link each rule decision to its tests and UI
  wording; unresolved design choices should not become inconsistent behavior across screens.
- [ ] **DOC-06 (P2)** Maintain a content/readiness inventory that distinguishes source
  backup, inspected asset, art prototype, collision-ready structure, playable district and
  published gameplay feature. Update the five-map matrix and preserve all owner reference directions.

## 28. Reconnaissance, signals and electronic warfare (SENSE)

These are proposed drone-identity experiments from the [RTS/space study](research/swarmfall-design-2026-10-19/README.md),
not existing systems. Prototype a small subset after reliable commands and one playable district.

- [ ] **SENSE-01 (P2)** Define unknown, direct sight, sensor contact and last-known states.
  A contact must not reveal exact type/health without identification. Keep discovered terrain
  and last-known icons legible; define the same information policy for defenders and rivals.
- [ ] **SENSE-02 (P2)** Give Scout/Dragonfly scans a useful decision: active scanning finds
  a marked defense/service quickly but briefly exposes the scanner; passive scouting is slower
  and quieter. Preview radius/cooldown and explain what a scan discovered. Extends DRONE-05/06.
- [ ] **SENSE-03 (P2)** Prototype one optional relay that improves shared intelligence or a
  chosen service over a visible area. Show connected/disconnected squads and coverage before
  placement; rooftop benefit must have a clear exposure/cost tradeoff. Avoid an upkeep puzzle.
- [ ] **SENSE-04 (P2)** Define loss-of-signal autonomy: continue the last safe assignment,
  hold or return according to a chosen policy, with an override and visible reason. Losing a
  relay never invents input lag, permanently strands a squad or erases issued orders.
- [ ] **SENSE-05 (P2)** Add one readable jammer/decoy/EMP interaction before expanding
  electronic warfare. Give it range, duration, warning and at least one affordable counter;
  a fake contact is discoverable evidence, not a random punishment. Reuse DRONE-03 and Link rules.
- [ ] **SENSE-06 (P2)** Save discoveries, contacts and relevant signal state without giving
  stale icons live enemy positions. Bound visibility-query cost and test hidden targets,
  destroyed relays, interference, reload and returning from pilot view; include debug overlays.

## 29. Mechanics that take advantage of being drones (SWARM)

- [ ] **SWARM-01 (P2)** Add assignable squad jobs such as escort, screen, repair or support
  a hacking team. Show each drone's role and why it is idle; cancellation and explicit player
  commands take precedence. Start with one support role, extending CTRL-07 and PILOT-05.
- [ ] **SWARM-02 (P2)** Prototype low sheltered versus high exposed flight policies, with
  visible clearance/threat previews and a safe fallback. Begin with two bands rather than
  unrestricted 3D micromanagement; share geometry with COMBAT/CITY and weather with HAZ-03.
- [ ] **SWARM-03 (P2)** Let formations adapt through narrow spaces and spread against area
  attacks, then reform. Distribute fire by useful target class to limit obvious overkill;
  never silently split a named squad or override a focused player target. Extends CTRL-07.
- [ ] **SWARM-04 (P2)** Make drone size matter at a few authored openings, service passages
  or routes. Mark eligible body sizes and clearance; small scouts gain access while larger
  carriers trade that access for payload. Do not require full building interiors for the prototype.
- [ ] **SWARM-05 (P2)** Prototype a recoverable disabled drone/black box: rescue the body,
  recover its software identity, or salvage matter as explicit mutually exclusive outcomes.
  Prevent duplicate/farmed rewards; recovery is optional, not a second penalty for losing a unit.
  Connect OBJ-01, DRONE-02, veteran ideas and future blueprint persistence.
- [ ] **SWARM-06 (P2)** Give explicitly landed pod hardware one optional second use:
  reclaim it or convert it into a modest relay/service point for a displayed matter cost.
  Reuse DROP wave IDs/placement/save rules; do not anchor a service to a discarded airborne
  backshell. Losing it leaves a recovery/retreat route and does not require constant maintenance.
- [ ] **SWARM-07 (P2)** Test one cooperative precision action: scout tags an antenna,
  Link disables it, assault drones exploit the opening; optional possession can perform a
  more precise approach. Every required goal also has an RTS solution. Show stages, cancellation,
  exposure and recovery rather than require a timed combination the player cannot understand.

## 30. Outer-space identity and planet operations (SPACE)

- [ ] **SPACE-01 (P2)** Give each planet an explicit atmosphere/gravity/propulsion profile
  for gameplay. Future vacuum missions use thrusters/powered landing rather than working
  parachutes/rotors; dense/thin atmospheres can change route and drop choices. Treat values
  as gameplay choices unless sourced, and show compatibility before a loadout is purchased.
- [ ] **SPACE-02 (P2)** Prototype one bounded orbital-support choice, such as a scan pass
  versus reinforcement/repair delivery. Preview capacity, timing, danger and fallback; retain
  an emergency option and avoid idle waiting. Do not add several new orbital resources at once.
- [ ] **SPACE-03 (P2)** Connect planet selection, orbiting Hive, entry/descent and extraction
  through consistent visuals and a short operation log. Keep transition cameras skippable;
  command/pause access stays available and combat never begins unseen during a cinematic.
- [ ] **SPACE-04 (P2)** Give forward sites and supply corridors a purpose with an explicit
  small graph: extend sensor reach, repair access or arrival options. Show consequences before
  abandoning a node; isolated drones retain autonomy. Coordinate ROAM territory rules.
- [ ] **SPACE-05 (P3)** After one planet works, test a small airless ruin, station exterior
  or asteroid site using the established drone rules and surface/collision queries. Start
  with an authored local environment; full space-flight combat is a separate future scope.
- [ ] **SPACE-06 (P2)** Give worlds distinct civilization/biome language: ring infrastructure,
  terrace settlements, elevated transit, industrial districts, sky/moons and local emissions.
  Keep their defenses, services and sound coherent with the setting; palette changes alone
  should not be the only difference. Coordinate CITY-11 and the per-map ART review.

## 31. Immersion and moment-to-moment feedback (IMM)

- [ ] **IMM-01 (P1 for feedback pass)** Acknowledge selection and orders immediately, then
  show moving, blocked, attacking, hacking, repairing and returning states. Make failure reasons
  actionable and brief; consolidate with CTRL alerts rather than adding competing log panels.
- [ ] **IMM-02 (P1 for feedback pass)** Connect visible rotor speed, lean, acceleration and
  landing response to actual motion. Use bounded downwash dust/water and touchdown effects;
  avoid an expensive physics rewrite. Review close pilot views as well as distant RTS icons.
- [ ] **IMM-03 (P1 for feedback pass)** Tie weapon origin, projectile/beam, impact and target
  damage to the same rule event. Distinguish shield hits, blocked shots and destroyed targets;
  restrained recoil/shake is optional and cannot hide the next order or damage warning.
- [ ] **IMM-04 (P1 for feedback pass)** Complete AUD-01/02/03 with spatial motor/weapon/pod
  sounds, load changes and restrained machine acknowledgements. Respect mute/volume, browser
  audio activation and ACCESS settings; pair every critical sound with a visible cue.
- [ ] **IMM-05 (P2)** Give pilot view a useful sensor/gimbal identity: stable horizon/aim,
  readable altitude/clearance, unit ID, health, order and optional modeled sensor overlays.
  Limit static/glare/damage effects and provide reduced-motion settings; ordinary HUD stays usable.
- [ ] **IMM-06 (P2)** Add bounded ambient life appropriate to the world: traffic, aircraft,
  lights, evacuation/shelter movement and wildlife reacting to local alarm/weather. Distinguish
  decorative life from actual interactable units; keep required objectives visually identifiable.
- [ ] **IMM-07 (P2)** Preserve squad names, optional machine call signs and a short history
  of captures, losses/recoveries and changed landmarks. A compact after-action map explains
  consequences and rewards; it must remain useful without voice acting or a long forced scene.
- [ ] **IMM-08 (P2)** Review one complete visual scene across close, street/district and
  strategic scales: consistent drone/door/road size, contact shadows, atmosphere and landmarks.
  Tune cinematic presentation around legibility and frame time; High/Light retain identical information.

## 32. Tactical decisions, mission variety and pacing (TACT)

- [ ] **TACT-01 (P2)** Document a compact counterplay matrix: scout, Link, assault and support
  roles against armor, air defense, jammer, shields and hazards. Telegraph range/weaknesses;
  provide at least two viable compositions/approaches in the first city rather than one required build.
- [ ] **TACT-02 (P2)** Prototype one captured infrastructure node with two mutually exclusive
  service choices, such as disabling radar or powering a safe court. Preview affected structures
  and route changes; destroying the node cannot make the required mission unwinnable.
- [ ] **TACT-03 (P2)** Extend OBJ-01 with a recon, rescue, escort/transfer or service-disable
  objective that uses the same swarm. Avoid making every encounter a capture ring; state
  success/failure/retry and rewards clearly, with no hidden mandatory pilot challenge.
- [ ] **TACT-04 (P2)** Author one distinct scenario per environment using the study's
  map matrix: arcology energy rings, metropolis services, citadel crossings, Skyway arrival
  corridors and Phototextured City signal clues. Start with one, then review before copying rules.
- [ ] **TACT-05 (P2)** Make continued capture after victory meaningful through visible
  optional sites, recovery and exploration, with remaining goals and a persistent extraction
  action. Bound farmable rewards and pressure; the player can end the operation without needless cleanup.
- [ ] **TACT-06 (P2)** Give defenders a few readable responses to observed threats: protect
  a service, investigate a scan, flank a static group or contest a supply court. Announce large
  responses and use the same navigation/information rules; avoid omniscient pressure everywhere.
- [ ] **TACT-07 (P2)** Tune pacing from human sessions: time to first decision, travel/idle
  time, reinforcement cadence, recovery and battle length. Support pause/queued jobs and safe
  staging; add urgency through visible local threats rather than constant unrelated countdowns.

## 33. Builder tradeoffs and design experiments (BUILD, DESIGN)

These extend MODE-21 and BUILD-01 through BUILD-06; they do not replace the future builder request.

- [ ] **BUILD-07 (P3)** Make parts express proven roles: mass/lift, power allocation,
  payload, armor, size/signature and useful sensors. Show a small understandable comparison
  and expected handling; choose one primary constraint first, not several mandatory upkeep meters.
- [ ] **BUILD-08 (P3)** Test limited local module damage with clear effects, such as a
  disabled weapon or reduced maneuvering. Keep core/critical-part placement meaningful,
  allow repair/recovery and avoid unreadable instant-loss chains. Persist only stable part IDs.
- [ ] **BUILD-09 (P2 prototype; P3 full editor)** Try one equipment slot with two meaningful
  choices before arbitrary assembly. Stock drones and saved presets remain competitive;
  unlockable alien modules add tradeoffs rather than universally superior statistics.
- [ ] **BUILD-10 (P3)** Validate custom drones in both RTS and pilot mode: working aim,
  collision envelope, deployment/slot cost, selection, autopilot and equipment rules. Provide
  safe recommended presets and a test range; no build should bypass mission costs through mode switching.
- [ ] **DESIGN-01 (P2)** Run a small comparison of the current loop versus scout/relay/service
  and recovery prototypes. Record alternate approaches, confusion, stalled orders, losses,
  downtime and performance; keep an idea only when it improves decisions or understandable atmosphere.
- [ ] **DESIGN-02 (P2)** Cap the first identity prototype at four or fewer new interacting
  rules and at most one tactical constraint beyond matter. Prototype fog, signal, energy and
  modular damage separately before combining them; retain/defer experiments with recorded reasons.
- [ ] **DESIGN-03 (P3 before full builder)** Confirm the exact Tank Wars title/version and
  desired construction style when builder implementation begins. Keep TerraTech as a researched
  additional comparison, with the owner's original reference intact.
- [ ] **DESIGN-04 (P2)** Keep source-backed game observations separate from Swarmfall
  proposals and implemented features. Update the design study with decisions, screenshots,
  prototype findings and deferred ideas; preserve earlier variants and avoid copying proprietary assets.

## 34. Free-roam planetary conquest (ROAM)

★ Owner, October 19: open planet capture with better graphics, alongside the starting campaign.
This expands MODE-01/02/03. First target: three connected regions on one persistent planet;
a detailed seamless spherical world is a separate future scope. See the [free-roam design](research/swarmfall-design-2026-10-19/README.md#proposed-free-roam-planetary-conquest).

- [ ] **ROAM-01 ★ (P1 for free-roam milestone)** Add a distinct Free Roam entry/profile/world
  slot alongside Campaign. Explain saves and starting choices; existing campaign progress and
  its active checkpoint are retained. Reuse validated rules rather than fork an incompatible game.
- [ ] **ROAM-02 ★ (P1 for free-roam milestone)** Build a lightweight planet/region overview
  showing discovered terrain, territory, landmarks, important services and available landing
  sites. Keep unknown information marked; initial scope is one planet with a stable world ID.
- [ ] **ROAM-03 (P1 for free-roam milestone)** Define a stable seeded region graph and
  versioned manifests: bounds, neighbors, world transforms, biomes, settlement styles, routes,
  capture/service IDs, defenders and safe landing/extraction sites. Validate required reachability.
- [ ] **ROAM-04 ★ (P1 for free-roam milestone)** Author the first three connected regions:
  coast/landing, a city or settlement, and uplink/ruin. Let squads explore outside objective
  rings and choose approaches; keep a consistent physical scale and recognizable world landmarks.
- [ ] **ROAM-05 (P1 for free-roam milestone)** Implement clear region travel with advance
  destination/loading/travel-cost feedback, cancellation and safe arrival. Transfer surviving
  squads/inventory and reconcile invalid local orders; initially use quick explicit transitions.
- [ ] **ROAM-06 (P1 for free-roam milestone)** Load detailed nearby terrain/city chunks and
  a cheaper surrounding horizon. Keep distant territory as compact strategic state; define
  simulation activation boundaries and resource ownership. Continuous crossing follows profiling.
- [ ] **ROAM-07 ★ (P1 for free-roam milestone)** Persist captured sites, discovery, service
  settings, bounded local damage, recovered items and parked/active squads as world deltas.
  Revisit the first region and see those outcomes; prevent full regeneration from resetting progress.
- [ ] **ROAM-08 (P1 for free-roam milestone)** Define territorial ownership through meaningful
  command sites and regional goals, not sweeping every coordinate. Show progress and disputed
  sites; explicitly define how local encounters contribute to planet-wide completion.
- [ ] **ROAM-09 (P2)** Differentiate site benefits: communication, repairs/fabrication,
  shelter, transport and supply access. Preview what capture/destruction changes; prototype
  two functions before building a large infrastructure graph. Coordinate TACT-02 and SPACE-04.
- [ ] **ROAM-10 (P2)** Test bounded, announced defender pressure on important territory.
  Define active/inactive region rules and a strategic clock; pausing or closing the browser
  does not cause unannounced offline losses. Preserve a reachable retreat/recovery option.
- [ ] **ROAM-11 ★ (P1 for free-roam milestone)** Link planetary victory to a declared network/
  command goal, then offer extraction or continued occupation/exploration. List meaningful
  optional sites for 100% completion; settle planetary/campaign rewards once with explicit replay rules.
- [ ] **ROAM-12 (P1 for free-roam milestone)** Define separate persistent-world and current-
  encounter saves, with atomic travel/settlement checkpoints and layout compatibility. Test
  leaving, loading failure, reload during travel, returning to old damage and full storage.
- [ ] **ROAM-13 (P2)** Extend seeded layout generation only after the authored slice works:
  connected terrain/roads, settlements, services and encounters. Reuse city modules within
  placement/support rules; reject unreachable goals, buried architecture and unsafe landing courts.
- [ ] **ROAM-14 (P2)** Make travel/exploration worthwhile with landmarks, scans, recovery,
  local stories and optional encounters. Reveal route/distance choices and allow known-route
  travel options; avoid huge empty distances or mandatory repeated captures just to revisit a place.
- [ ] **ROAM-15 (P3)** Evaluate seamless region crossing and larger planetary coverage after
  the three-region performance/save gate. Measure coordinates/precision and use origin shifting
  only if needed. Full spherical traversal and multi-planet active simulation need separate designs.
- [ ] **ROAM-16 ★ (P1 for free-roam milestone)** Review one whole operation: land, explore,
  capture, move region, return, reload, face a warned response and extract or stay. Test command
  mode first and pilot mode when ready; the original campaign must still work independently.

## 35. Graphics for the larger explorable world (GFX)

- [ ] **GFX-01 ★ (P1 for first region)** Produce one polished playable region using the best
  existing city/terrain assets: fitted foundations, coherent shoreline, detailed foreground,
  landmarks and a full surrounding skyline. Agree on scale and review fixed cameras before expanding.
- [ ] **GFX-02 (P1 for first region)** Unify lighting, material response, color pipeline,
  contact shadows and atmospheric depth. Add source-supported surface detail where useful;
  profile shadows/water effects instead of assuming expensive post-processing will fix basic art.
- [ ] **GFX-03 (P1 for free-roam milestone)** Use nearby detail, district chunks, cheaper
  distant geometry and explicit texture budgets for the travel view. Review streaming pop-in,
  stalls and memory alongside active drones and effects; reuse CITY-08/09 and PERF budgets.
- [ ] **GFX-04 (P2)** Author coherent modular terrain/settlement sets for different planet
  identities, with roads, supports, gateways, service spaces and navigation landmarks. Preserve
  intricate fantasy/alien silhouettes; do not turn every region into the same recolored grid.
- [ ] **GFX-05 (P1 for graphics release)** Review High/Light on desktop and a real phone:
  clear paths/targets, stable frame times, consistent capture information and readable pilot/RTS
  scales. Retain before/after images and measured settings; no photorealism claim from a lab screenshot.
- [ ] **GFX-06 (P2)** Add bounded environmental atmosphere that responds to state: sky/moons,
  weather layers, water, local light activity, smoke and downwash. Prioritize visible gameplay
  cues and scene cohesion; make expensive reflections/volumetrics optional after profiling.

## 36. Weapon sound, explosions, smoke and fire (FX)

★ Owner, October 19: improve weapon firing visuals/sound and add cooler animated explosion,
smoke and fire effects. Extend AUD-01/02 and IMM-03/04; keep their existing IDs.

- [ ] **FX-01 ★ (P2)** Give weapon families distinct muzzle flashes, tracers/beams, impact
  bursts, shock cues and debris, tied to the actual shot/hit event. Keep friendly/hostile
  fire and shield/armor hits readable from pilot and strategic views.
- [ ] **FX-02 ★ (P2)** Add animated explosion-to-smoke transitions, drifting plumes, embers
  and optional lingering fire on damaged structures/wrecks. Use procedural effects or suitable
  licensed sprite/flipbook/VFX assets, record credits and preserve originals. A visual flame
  must not imply unimplemented spreading fire or damage; gameplay burning needs explicit rules.
- [ ] **FX-03 ★ (P2)** Improve weapon/explosion sound layers, mechanical/electronic character,
  distance attenuation and restrained reverberation/occlusion where supported. Mix simultaneous
  shots into bounded voices, distinguish near hits from distant fighting, and retain mute/volume.
- [ ] **FX-04 (P1 for effects release)** Pool and cap fire/smoke/debris/voices, with High/Light
  settings and reduced-flash/shake options. Profile a sustained city fight and verify effects
  pause, expire, clear between missions and never hide required warnings or delay controls.
- [x] **FX-05 ★ (P2) — Codex, October 19; lab implementation and automated checks** Add
  procedural smoke, animated flames, embers and bounded local firelight to all five city
  destruction previews and supported individual architecture assets. Bind emission to actual
  clipped geometry; retain intact originals, credits and historical foundations. Provide
  independent smoke/fire toggles, pause/reduced-motion startup, shareable effect settings and
  High/Light budgets with resource disposal. [Evidence](research/lab-aftermath-2026-10-19/README.md).
  This closes the lab implementation only; FX-02/04 still cover broader gameplay work.
- [ ] **FX-06 (P1 for visual acceptance)** Review smoke/fire placement, transparency, fog,
  dusk light and ember readability on every damaged stage in all five environments and the
  supported architecture inspector. Compile/render shaders in an actual browser, exercise
  toggles/stage switching/pause on desktop and touch, and benchmark a real phone on High/Light.
  **Codex, October 19:** browser access was blocked; no visual, GPU or phone acceptance claimed.
