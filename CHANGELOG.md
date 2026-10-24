# Change Log and Handoff Record

Every change or addition to this project is recorded here, newest first, and **signed** by
whoever made it, so the next person or assistant (Claude, ChatGPT, Codex or a human) can see
what was done, why, and what is still open.

## How to add an entry

Add your entry at the top of **Entries** in the same commit as the change:

```
### YYYY-MM-DD: short title
- **Signed:** <assistant or person> (<model / tool>)
- **Commit:** <commit subject> (find it with `git log --grep "<subject>"`)
- **What changed:** plain-language summary
- **Files:** main files touched
- **Assumptions:** anything estimated or invented, and how it is labeled in the app
- **Checks:** tests run and manual checks
- **Open / next:** follow-ups for the next session
```

Notes for every session (see [ARCHITECTURE.md](ARCHITECTURE.md) for the file map and rules):
- The git author on this machine is "Heemi" for all commits, so the signature here (and a
  `Co-Authored-By` line in the commit message) is how authorship is tracked.
- Research sources, tags ([PUB]/[CALC]/[EST]) and the implementation status table live in
  `RESEARCH-COMPENDIUM.md` §0, §7 and §8. Update them when you finish an item there.
- Publishing: pushing to `main` on GitHub runs the tests and publishes `dist` to GitHub Pages.
  The local branch here is `master` tracking `origin/main`: `git push origin master:main`.
- Leave every `?v=dev` stamp and the "Build local" label as they are. The publish workflow
  replaces them with the commit hash (see `.github/workflows/pages.yml`).
- **At the start of a session (or after time away),** read the README and these entries, and
  check every branch for unmerged work: `git fetch origin`, `git branch -r`, then
  `git log --oneline main..origin/<branch>` (house rule 7 in ARCHITECTURE.md). Once per session.
- **Save every source a part is built from** (photos, paper pages, patent drawings) in the
  project with credits, and list it in `research/PART-SOURCES.md`. Page images, not PDFs.
- **Never throw away replaced work.** Anything replaced (models, terrain, textures, visuals,
  sounds, behavior), even bad or inaccurate versions, goes to `archive/` in the same change,
  with pictures, restore steps and a git tag (house rule 6 in ARCHITECTURE.md).

## Entries

### 2026-10-23: Swarmfall shows what squads are doing
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Show squad destinations, reach, defense coverage and why captures stall"
- **What changed:** Checklist COMBAT-04 and FIX-05. Squads now say what they are doing:
  - When an attack target falls and the squad moves on to another defender, a selected squad
    gets a notice naming it; tapping it brings the camera there. When nothing is left, it says
    the squad is holding. H or Hold also says the squad is holding.
  - Selected squads show a dotted line to where they are going and a dotted ring for how far
    their weapons reach troops on the ground.
  - Jammers, shield pylons and radar masts show their coverage as a labeled dashed ring.
  - Zone labels say why drones are not capturing: "needs Links" while defenses stand,
    "jammed" or "drones stunned".
- **Files:** `dist/invasion/battle.mjs`, `dist/invasion/main.mjs`,
  `tests/invasion-squad-intent.test.mjs` (new), `SWARMFALL-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (547 pass); in the browser on Corvan: radar
  coverage ring with its label, the squad's reach ring and destination line, and "needs Links"
  on the zone label. No console errors.

### 2026-10-23: Confirm lower-camera harness publication
- **Signed:** Codex (OpenAI).
- **Commit:** "Record live camera-harness acceptance [skip ci]".
- **Receipt:** releasea4ed215 pushed, Pages40057622872 succeeded;556 tests pass. Normal
  public CUA loads, new Bay harness/port route focus and Open interior render,24 rows,
  no browser errors. Genuine screenshot saved in current research; local preview stopped.
- **Boundary:** earlier loading cause not established; no public-stall claim for this
  successful release. Attic and other wiring families remain open. No app code in receipt.

### 2026-10-23: Audit bay endpoints and connect the lower-camera routing estimates
- **Signed:** Codex (OpenAI).
- **Commit:** "Audit bay endpoints and finish lower-camera harness installation".
- **What:** measured endpoint register; fixed three small camera/LED branch gaps, added
  port Down Camera bypass through existing reliefs around PSU1, one wall stand-off.
  No camera/equipment move, new wall hole or flight/game/thermal changes. Trunk and all
  unrelated routes exact. Bay harness inspection/four focuses and expandable source notes.
- **Sources/limits:** saved real NASA/APL wiring photo and general workmanship pages;
  camera CAD is labeled. All routes/supports estimated, no flight circuits/pinouts.
- **Archive/checks:** exact old source/test/UI/HTML, before pictures/endpoint data, tag;
  rejected collision draft retained.10 focused tests pass including exact endpoints,
  wall triangles,20 optical rays, equipment clearance, masks and route preservation.
  Full suite/visual/publication receipt follows in research.
- **Final local checks:**556 tests pass; actual desktop/mobile app selector/four focuses,
  independent masks/restore,24 rows, source notes and Pilot return pass; no horizontal
  overflow or browser error log. General cavity test's39cm exception is only tagged
  port-camera bypass/support meshes; exact wall/equipment tests still required. Old test archived.
- **Public recheck:** earlier59a03b9 eventually initialized normally without interception;
  Open interior rendered24 rows. Historical failures retained; initial-load cause unknown.
- **Next:** attic local endpoint audit; unresolved radio/navigation/fan mating interfaces,
  then other connection/support families. Global checklist intentionally stays open.

### 2026-10-23: Record insulation publication, harness gaps and incomplete live acceptance
- **Signed:** Codex (OpenAI).
- **Commit:** "Record insulation release and public acceptance limits [skip ci]".
- **Checks:** all550 local tests pass;35 local UI cases and raw sample checks pass.
  Release59a03b9 Pages39899505403 succeeded. Normal public browser showed the new
  badge but a blank model and unresponsive Internal control; warning/error log empty.
  No public UI-pass claim. Screenshot and receipt saved in current research.
- **Documentation:** corrected stale architecture descriptions, updated checklist and
  recorded exact remaining boundary. No model, simulation or wiring changes in this receipt.
- **Next:** investigate unresolved public initialization without rebuilding assets;
  then audit harness endpoints before adding missing connection families. Full local
  foam/blisters/hidden construction remain open and labeled estimated where modeled.

### 2026-10-23: Align the Lab import contract with renderer release stamping
- **Signed:** Codex (OpenAI).
- **Commit:** "Update Lab renderer import contract for release stamps".
- **Why:** the URL-only rewrite exposed one source-contract assertion that required the old
  unversioned wrapper path. It now requires the same relative path plus?v=dev; exports,
  geometry and game behavior assertions are unchanged. Old test archived.
- **Checks:** focused9 tests pass; complete550-test suite rerun before pushing this fix.
  The4930d34 CI failure blocks that deployment, leaving the prior site unchanged.

### 2026-10-23: Stamp every Three.js wrapper reference, not only its core import
- **Signed:** Codex (OpenAI).
- **Commit:** "Version all renderer imports consistently".
- **Why:** the normal c0161c4 public load still stalled, now at the unversioned wrapper.
  The earlier cache-key experiment was not proof of a complete loading fix. Diagnostics
  and failed public acceptance are preserved in current research.
- **Change:** mechanical URL-only `?v=dev` additions to relative Three.js wrapper references
  across simulator and game/Lab modules/import maps. Publish replaces them uniformly.
  No renderer algorithm, library version, flight or game logic changed.
- **Archive/checks:** every original file saved under the current archive's renderer-imports
  subfolder; script preserves paths. New regression checks all wrapper references.
- **Next:** verify the new live deployment without interception before claiming public pass.

### 2026-10-23: Attic/local insulation access, optical ports and open interior
- **Signed:** Codex (OpenAI).
- **Commit:** "Add attic and local insulation access with open interior preset".
- **What:** Five attic surface regions, two HGA dome surfaces, three estimated hollow
  camera-window surrounds, global/component Insulation masks, Open interior/All layers.
  Installed equipment retained; Open interior releases isolation/focus.
- **Optics:**3mm windows meet the actual beveled body; estimated corridors/neighbor reliefs
  clear20 sampled rays. Camera bodies, aim, mounts and HGA mechanism/motion unchanged.
  Rejected rim draft blocked a neighbor sightline and was archived before correction.
- **Loading:** a cache-key experiment isolated the stalled unversioned Three.js core URL.
  Its nested import now gets the release stamp; library algorithms/version/license unchanged.
  Final public acceptance must use no interception/protocol/local-file workaround.
- **Sources/limits:** saved real NASA/APL foam/HGA photos, ICES2020/2023 and DragonCam2026.
  Surface splits/rims/openings estimated; not full flight blisters/inner liner/tile or
  membrane stack. No flight/thermal solver changes.
- **Info audit:** component/source notes, Vehicle/Model assumptions, expandable construction/
  harness coverage, source register, README, architecture/checklist updated. Existing
  wiring not declared complete; coverage register flags missing modeled routes. No wires added.
- **Archive/checks:** baseline ef3b429/tag, exact old files/vendor wrapper, six before views
  and manifests, rejected rim draft. Initial532 tests,35 local browser cases, nine global/
  three component masks, optical checks, restore/source/count24/Pilot and raw pixels pass.
- **Next:** endpoint/harness-family audit and support/penetration work; full local foam
  geometry and separate thermal material audit remain open. Preserve concurrent game work.

### 2026-10-22: Swarmfall keeps real time on slow devices
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Keep battle time real on slow frames and drop stalls"
- **What changed:** Checklist PERF-11. Each frame advanced the battle by at most 0.05 s, so
  below 20 frames a second the whole game, camera included, ran in slow motion. A new frame
  clock (`frame-clock.mjs`) now:
  - catches a slow frame up in steps of at most 0.05 s, so the battle keeps real time down to
    about 4 frames a second;
  - drops anything over 0.25 s (a loading hitch, a frozen or hidden tab) instead of replaying
    it in a burst, so pods, shots and timers never pile up;
  - moves the camera by real time, paused or not;
  - tells the player once, if the device stays too slow for about 3 s, that the battle is in
    slow motion and that lowering Graphics helps.
- **Files:** `dist/invasion/frame-clock.mjs` (new), `dist/invasion/main.mjs`,
  `tests/invasion-frame-clock.test.mjs` (new), `SWARMFALL-TODO.md`, `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (542 pass). In the browser, through the page's own
  frame function: 2 s at 10 fps gave 2 s of battle, a 5 s stall gave 0.25 s, and 2.5 fps gave
  slow motion with one notice. No console errors.

### 2026-10-22: Swarmfall weapon range counts height
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Measure weapon range in 3D between firing heights"
- **What changed:** Checklist COMBAT-03 (progress). Weapon range was measured flat, so troops
  in a street could hit a drone flying 58 m up over a tower as if it were beside them. Now:
  - Range is measured in 3D between the two firing heights, including the ground under each
    unit. Defenses fire from their mount, troops from the shoulder and drones from where they
    fly.
  - Firing, attack-move, attack orders and troops chasing drones all use the same measure, so
    no unit parks where it thinks it can fire but cannot.
  - A drone high over a roof or on a ridge is out of reach of defenders below, and the reverse.
    A spear reaches a Striker overhead only from nearly underneath.
  - Balance check on all 7 campaign planets (two scripted waves each): 11 of 14 fights came out
    the same and the rest differ by one or two drones. Step time is within 0.2 ms of before.
- **Files:** `dist/invasion/battle.mjs`, `tests/invasion-range-height.test.mjs` (new),
  `SWARMFALL-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (537 pass); flat-versus-3D fight comparison and
  timing on the Frontier maps, Aurex and Velm.

### 2026-10-22: Swarmfall keyboard play and safer shortcuts
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add keyboard paths for orders and pods, and keep shortcuts off focused controls"
- **What changed:** Checklist ACCESS-01. A whole mission can now be played from the keyboard:
  - Enter orders the selected squads to the middle of the screen, or attacks the defender
    there; Shift+Enter adds a waypoint.
  - B opens the drop panel with focus on its first usable button, so Enter lands the wave.
    While picking a zone, Enter previews pods at the middle of the screen and Enter again
    launches. Escape closes the panel and returns focus to Drop wave.
  - A squad number selects it; pressing it again brings the camera to it instead of
    deselecting it.
  - Shortcuts no longer fire in the Squad ▾ menu or with Ctrl, Alt or Cmd held, and Space or
    Enter on a focused button now presses that button instead of pausing.
  - Menus, fields and links get the same visible focus outline as buttons.
  - Enter with nothing selected, 0 with no squads and a missing squad number now say why
    nothing happened.
  - The Field guide has a new Controls section with every key.
- **Files:** `dist/invasion/main.mjs`, `dist/invasion/field-guide.mjs`,
  `dist/invasion/invasion.css`, `tests/invasion-keyboard.test.mjs` (new), `SWARMFALL-TODO.md`,
  `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (528 pass); in the browser with real key presses
  on Kepra: the focus outline shows, B then Enter launched the wave, and 1 then Enter ordered
  the squad to the screen center.

### 2026-10-22: Body-insulation release receipt
- **Signed:** Codex (OpenAI).
- **Commit:** "Record body insulation deployment and verification limits [skip ci]".
- **Release:** dc5dee4 / Pages39893875943 succeeded; recovery tag and feature/main pushed.
  Concurrent Claude game/Lab work throughf8e88e3 retained; combined525 tests pass.
- **Public checks:** HTML/module HTTP200, expected build, body notes and revision, stamped
  import verified. Public Edge load event timed out at30/90seconds, before interactions;
  public UI verification incomplete, not passed. Local36 cases and all geometry/mask checks
  passed. Receipt in research/body-foam-2026-10-22/live-dc5dee4. Local preview stopped.
- **Next:** Diagnose public browser load if it recurs; attic/local insulation is the next
  model package. No additional app change or duplicate deployment for this documentation.

### 2026-10-22: Five removable body-insulation inspection surfaces
- **Signed:** Codex (OpenAI).
- **Commit:** "Separate body insulation into five removable inspection surfaces".
- **What changed:** Top/deck, port, starboard, belly and end regions split from the existing
  outer body without changing any base triangle, normal or UV. Five focus choices and masks,
  aggregate body/foam controls; separate structural wall/deck controls retained. Retired and
  archived three legacy solid seam boxes that crossed the bay.
- **Sources:** NASA2025 real foam test photo, credit Johns Hopkins APL/Justin Artis; NASA
  NESC May2026 development slides, Rolando Rodarte/APL. Saved pages/photo and comparison.
  Current body Solimide selection qualified against older Rohacell research.
- **Assumptions:** Surface-only inspection regions, not actual tile cuts, foam volume or
  hidden construction. Nominal source thickness recorded but not applied locally; original
  finish unchanged. No inferred full membrane/vent/tile stack, thermal model or mass change.
- **Archive:** `archive/body-foam-2026-10-22`, source files, before screenshots/manifests,
  restore steps and tag on f14f2f0. Concurrent game/Lab updates through f14f2f0 retained.
- **Checks:** 519 tests pass, including exact triangle/attribute partition, all five masks,
  aggregate masks, restore, finite bounds and unchanged hardware; browser receipt in research.
- **Next:** Attic surfaces, local camera/HGA insulation, then source-backed local sections;
  separately audit selected-material test conditions against legacy thermal assumptions.

### 2026-10-22: Swarmfall townspeople and the crossfire penalty
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Show townspeople who flee drones and penalize fighting in towns"
- **What changed:** Checklist ENEMY-01. The public is now on screen and fighting among them
  costs you:
  - Each populated settlement shows 4 to 14 townspeople in varied clothes. They wander near
    home, run from drones that come within 45 m, and drift back once it is quiet or the town is
    captured. They are hidden in unscouted Frontier towns.
  - Fighting inside an uncaptured, populated town now adds a crossfire penalty to the alarm,
    and the battle log warns once per town that Links capture quietly instead.
  - The townspeople are only drawn [EST]; the crossfire rule lives in the battle rules, so saves
    and replays stay exact. Saves check the new per-town flag.
- **Files:** `dist/invasion/battle.mjs`, `dist/invasion/scene.mjs`, `dist/invasion/models.mjs`,
  `dist/invasion/mission-save.mjs`, `tests/invasion-public.test.mjs` (new), `SWARMFALL-TODO.md`,
  `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (519 pass); in the browser on Kepra, townspeople
  around Dratan moved from 11 to 35 m away from drones to 26 to 46 m within 3 seconds.

### 2026-10-22: Swarmfall scene smoke test on every world
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add a scene smoke test across every planet and frontier map"
- **What changed:** Checklist TEST-01. A new test runs the real Three.js battle scene, with the
  stand-in renderer, on all 7 campaign planets and 3 Frontier maps:
  - Each world builds with real terrain and plays 60 frames: a drop, combat, weather, an
    explosion and an artillery strike.
  - It reveals any city and draws from the free camera.
  - It unloads with nothing left behind (Titan's landscape is kept hidden on purpose).
  - Every game model is also checked for finite geometry.
  `scene.mjs` changed a lot this week, and this catches load or draw crashes before
  publishing.
- **Files:** `tests/invasion-scene-smoke.test.mjs` (new), `SWARMFALL-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (518 pass).

### 2026-10-22: Swarmfall rotor-wash dust
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add rotor-wash dust under low drones and at pod touchdowns"
- **What changed:** Checklist VIS-01.
  - Drones flying below 12 m kick up dust, more the lower they are: the Dragonfly landing to
    drill, and drones just released from their pods.
  - Each pod touchdown raises a burst.
  - Puffs roll outward, rise, grow and fade like the simulator's `downwash-dust.mjs`, tinted a
    little lighter than the planet's ground. None rise over water or lava.
  - 64 pooled puffs for the whole swarm keep it cheap.
- **Files:** `dist/invasion/swarm-dust.mjs` (new), `scene.mjs`, `tests/invasion-dust.test.mjs`
  (new), `SWARMFALL-TODO.md`, `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (516 pass). The new tests cover low against high
  drones, bursts, drift and fade, water, and the pool limit. Browser: two pods on Kepra raised
  20 puffs, with no errors.

### 2026-10-22: Search in the Asset & Environment Lab
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add a search box to the lab's asset inspector"
- **What changed:** The lab's asset picker gets a search box (LAB-05):
  - Every typed word must match an asset's name, category, description or creator ("flak",
    "forge city", "kenney roof").
  - The picker lists only the matches, with a count. The asset on show always stays listed,
    and Enter opens the first match.
  - The list is rebuilt rather than hiding options, so it works on iPhones too.
- **Files:** `dist/invasion/environments/asset-viewer.mjs` (`searchAssets`), `lab.mjs`,
  `index.html`, `lab.css`, `tests/invasion-asset-viewer.test.mjs`, `SWARMFALL-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (514 pass). Browser: on the Flak gun page,
  "roof" showed "6 of 34 match" with the Flak gun kept. No errors.

### 2026-10-22: Swarmfall's own assets in the Asset & Environment Lab
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add Swarmfall defenders, defenses, settlements, city styles and the Dragonfly to the lab"
- **What changed:** The owner assigned bringing Swarmfall's assets into the lab to this chat
  (the local asset studio chat added the Campaign planets world, `a79c25b`). The inspector
  grows from 18 to 34 pieces, each built by the game's own code, so the lab shows exactly what
  battles draw:
  - The **Dragonfly lander drone**.
  - **Defenders:** spear thrower, rifle militia and trooper in their society colors, and the
    interceptor drone.
  - **Defenses:** watchtower, flak gun, radar mast, missile battery, signal jammer, laser
    turret and shield pylon, with the defender glow.
  - **Settlement houses** by society level 1-5.
  - **City styles:** 3 × 3 block samples of metropolis (Corvan Prime), forge (Forgeholm) and
    walled market town (Brackenford).
  They show as intact models (no destruction preview).
- **Files:** `dist/invasion/environments/asset-viewer.mjs`, `lab.mjs` (intact flag),
  `tests/invasion-asset-viewer.test.mjs`, `SWARMFALL-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (506 pass). The new test builds all 12 defenders,
  defenses and settlement pieces. The Dragonfly and city samples draw textures, so they were
  checked in the browser: all four city and Dragonfly views and the laser turret loaded with no
  console errors.

### 2026-10-22: Lab — Campaign planets world with a planet picker
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app), from the asset studio chat
- **Commit:** "Add a Campaign planets world to the Asset & Environment Lab"
- **What changed:** A twelfth lab entry shows Swarmfall's battle maps as the game builds them:
  - Kepra, Velm, Corvan, Ashfall, Halcyon and Aurex, plus the three Frontier maps (Titan already
    has the Titan Hive outpost world). A picker under the description switches planet.
  - Terrain and liquids from `planet-terrain.mjs`, capture zones and Aurex's solid skyline from
    `battle.mjs` with each planet's own seed, colours, fog and light from `scene.mjs`, Frontier
    cities from `city-render.mjs`. True scale (the studio's earlier previews used 4x height).
  - Not drawn: per-battle rocks, trees, ice spikes, defenders and the Hive beacon.
  - Worlds may now return `title`, `description`, `views` and `choices`, applied after build.
- **Files:** `dist/invasion/environments/worlds/planets.mjs` (new), `worlds/index.mjs`,
  `lab.mjs`, `index.html`, `lab.css`, `tests/invasion-lab-planets.test.mjs` (new),
  `archive/lab-campaign-planets-2026-10-22/`, `archive/README.md`, `SWARMFALL-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (505 pass, 5 new: planet list, zones identical to a
  fresh mission, Aurex towers clear of zones, lab wiring, unchanged kit exports and shared
  three.js). Browser: all six planets and a Frontier map loaded without console errors; Walled
  market town and the Scout inspector still load with the picker hidden.
- **Archive:** `archive/lab-campaign-planets-2026-10-22/`, tag `archive/lab-campaign-planets-2026-10-22`.

### 2026-10-22: Swarmfall interactive Titan tutorial
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add an interactive Titan tutorial with checked steps"
- **What changed:** Checklist TUT-01. On Titan the coach box is now a tutorial:
  - Seven checked steps follow what you actually do: drop a wave, watch the landing, select
    the squad, send it somewhere, capture a beacon, recover the Dragonfly, then hold 3 beacons.
  - A weather step appears while the first front passes.
  - The button to press next pulses.
  - **Skip tutorial** hides it. Skipping or finishing is remembered on the device, and
    finishing points to the Field guide.
- **Files:** `dist/invasion/tutorial.mjs` (new), `main.mjs`, `index.html`, `invasion.css`,
  `tests/invasion-tutorial.test.mjs` (new), `SWARMFALL-TODO.md`, `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (500 pass). The new tests walk a real Titan battle
  through every step and the weather interruption. Browser: step 1 with Drop wave pulsing;
  Skip hid it and was remembered. No errors.

### 2026-10-22: Swarmfall box selection
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add drag-box selection: Shift+drag, or hold then drag on touch"
- **What changed:** Checklist CTRL-01.
  - **Shift+drag** with a mouse draws a dashed selection box. Every squad with a living drone
    inside is selected, replacing the selection.
  - On touch, **press and hold, then drag** does the same. Quick drags still pan.
  - An empty box keeps the current selection and never moves the camera.
- **Files:** `dist/invasion/pointer-controls.mjs`, `main.mjs`,
  `tests/invasion-box-select.test.mjs` (new), `tests/invasion-pointer-controls.test.mjs`,
  `SWARMFALL-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (498 pass). In the page harness, Shift+drag picks
  both squads, then one from either corner order, and an empty box changes nothing. The touch
  hold isn't checked on a real phone yet.

### 2026-10-22: Record top-deck public acceptance
- **Signed:** Codex (OpenAI)
- **Commit:** Record top deck public acceptance [skip ci]
- **Release:**43f6e21 and recovery tag pushed; Pages39764147097 succeeded.503 tests pass.
- **Checks:** Public Edge24 viewport/subassembly cases at1440/390/360px, four part/global
  deck masks and restore, source links, original24 rows, installed context and Pilot return
  pass without page/network failures or overflow. Receipt/screenshots in current research
  `live-43f6e21/`. Local preview server stopped. Documentation/screenshots only, no duplicate
  test/deploy cycle. Next: body/deck insulation-region separation, then attic/local foam.

### 2026-10-22: Add top-deck and attic-edge inspection
- **Signed:** Codex (OpenAI)
- **Commit:** Add sourced top deck and attic edge inspection
- **What changed:** Independent unnumbered deck: separate faces, gimbal/dome clearance
  opening, edge closeouts/short attic lip, estimated stow-lock foundations. Three targets,
  four part masks and separate global deck mask. Existing24 equipment, walls/joints and
  combined body/attic foam geometry/poses unchanged; no game/flight/save changes.
- **Sources / limits:** NASA April23 real fit-check/primary-panel thickness; saved ICES2020
  p5 and ICES2023 arrangement/TWTA text, existing HGA arm reference.0.254mm face thickness
  published;12mm depth, outline,121mm opening, foundations/lip/fasteners estimated. Datum
  follows existing HGA/TWTA. No core cells, inserts/bonds/seals, new thermal barrier or
  conduction/strength solver. Old combined foam still needs region separation.
- **Archive:** Baseline1bee304 recovery tag; exact before files/views/manifests. Rejected
  89mm opening module/test/three renders/report retained; final opening clears unchanged
  rotating dome. Existing parts were not moved to make the fit pass.
- **Checks:**503 full tests pass;24 local Edge Internal/Thermal viewport/subassembly cases,
  independent masks/global restore, sources, original24 rows, exact manifests, Pilot return,
  face clearance and three raw/two context nonblank/framed WebGL views pass.15 gimbal
  deploy/pointing states clear faces; foundations meet lock bases, TWTA pads meet underside.
  Real/CAD/model/app comparison visually reviewed; sources and credits saved/reused.
- **Next:** Body/deck insulation regions, then attic/local HGA/camera foam and remaining
  structural/support/connection packages. Initial deck pass checked, overall construction open.

### 2026-10-22: Swarmfall troops find their way round walls and water
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Route troops on foot round water, buildings and town walls"
- **What changed:** Checklist FIX-03. Troops used to walk straight at their goal and stop
  against shores, buildings and walls. Now:
  - A unit on foot that bumps into something plans a route (`paths.mjs`, a grid search on
    walkable ground) and follows it. That means through Brackenford's gates, round Aurex's
    towers, and along Velm's rivers and swamps.
  - Routes are saved with the battle, so a reloaded mission plays out the same.
  - At most 3 searches per step, so a crowd at a wall doesn't stall the game.
  - Unreachable goals are remembered, and the unit slides as before.
- **Assumptions:** Cell size, search limits and the step budget are invented [EST].
- **Files:** `dist/invasion/paths.mjs` (new), `battle.mjs`, `mission-save.mjs`,
  `tests/invasion-paths.test.mjs` (new), `SWARMFALL-TODO.md`, `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (496 pass). The new tests cover walls 6, 3 and
  1.5 m thick, identical routes on repeat, unreachable goals, and a rifleman going from 187 m
  outside Brackenford's wall to its square, also after a save mid-route. Four-wave battles on
  Halcyon, Velm, Aurex and two Frontier maps stay under 3.5 ms for the worst step.

### 2026-10-22: Swarmfall Aurex towers are solid; smoother climbing
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Make Aurex's skyline solid and look further ahead when climbing"
- **What changed:** Checklist FIX-02. Aurex's ~420 towers used to be scenery: drones flew
  through them, troops walked through them and shots went through them. Now:
  - The towers are rules data (`planet-terrain.mjs` `attachSkyline`): seeded from the planet
    with the old spread and sizes, kept clear of zones, and drawn from the same data.
  - Drones climb over them, troops walk round them, pods avoid them, and they block direct
    fire.
  - Drones check five points along the next 3 s of flight for roofs, instead of two, so they
    no longer clip narrow towers. This also helps the Frontier cities.
  - Battles record `skyline: 1`; Aurex saves made before resume on open ground.
- **Archive:** `archive/swarmfall-aurex-skyline-2026-10-22/` (tag on `ce9b949`), with before
  and after pictures.
- **Files:** `dist/invasion/planet-terrain.mjs`, `battle.mjs`, `mission-save.mjs`, `scene.mjs`,
  `main.mjs` (minimap footprints), `tests/invasion-skyline.test.mjs` (new),
  `tests/invasion-mission-save.test.mjs`, `SWARMFALL-TODO.md`, `archive/`
- **Checks:** `node --test tests/*.test.mjs` (493 pass). The new tests cover zones staying
  clear, towers blocking troops and pods, drones staying above towers (this caught the clipping
  bug), skylines matching after reloading, and older saves keeping open ground. In the browser
  Aurex shows 420 towers, with no errors.

### 2026-10-22: Swarmfall Hive upgrades
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add Hive upgrades bought with banked matter"
- **What changed:** Checklist ECON-01. **Upgrades** on the galaxy screen spends banked matter.
  There are seven lines with three levels each (the effect is per level):
  - Bigger pods: +4 wave slots.
  - Fast launch: -1 s between drop waves.
  - Armor plating: +10% drone health.
  - Engines: +8% drone speed.
  - Weapons: +10% drone damage.
  - Weather sealing: -20% hazard damage.
  - Link firmware: +20% Link capture speed.
  Every new mission, Frontier ones included, gets them. Levels are saved with progress and fixed
  on each battle, so checkpoints resume exactly; older battles have none and play as before.
- **Assumptions:** Effects and costs (100-420 matter) are invented [EST]. Because each planet
  guarantees a minimum supply, spending the bank early costs little. It's flagged for
  playtesting.
- **Files:** `dist/invasion/campaign.mjs`, `battle.mjs`, `mission-save.mjs`, `main.mjs`,
  `index.html`, `invasion.css`, `tests/invasion-upgrades.test.mjs` (new), `SWARMFALL-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (491 pass). The new tests cover buying, limits,
  saving, mission supply (slots capped at 44), battle effects (cooldown, health, damage) and
  checkpoint validation. Browser: the dialog lists all seven with prices, with no errors.

### 2026-10-22: Swarmfall waypoints, patrol and attack-move
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add waypoint queues, patrol and attack-move orders"
- **What changed:** Checklist CTRL-03.
  - **Waypoints:** Shift+right-click (or "Queue next order" in the Squad ▾ menu, for touch)
    adds up to 8 orders after the current one. Each starts when the one before is done: zone
    captured, target destroyed, or every drone in place. Selected squads show them as a
    dashed line with numbered stops.
  - **Patrol (P):** circles the waypoints. Finished captures come back as moves.
  - **Attack-move (T, then click or tap):** armed drones fight whatever defenders they see on
    the way.
  - A new immediate order or Hold replaces the waypoints. Saves keep it all, within limits
    (at most 8 queued orders).
- **Files:** `dist/invasion/battle.mjs`, `mission-save.mjs`, `main.mjs`,
  `tests/invasion-waypoints.test.mjs` (new), `SWARMFALL-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (480 pass). The new tests cover queues in order,
  patrol going round, attack-move dealing far more damage than passing at 100 m, and saves.
  Browser: the waypoint loop drew and P toggled patrol (the menu label bug was fixed). No
  errors.

### 2026-10-22: Swarmfall squad tools
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add squad tools: merge, split in half or by type, rename"
- **What changed:** Checklist CTRL-02. A **Squad ▾** menu next to Hold (a native picker,
  phone-friendly) offers, depending on the selection:
  - **Merge** the selected squads: landed drones join the lowest-numbered squad and take its
    order. Pods still descending land in their own squad.
  - **Split in half**, or **Split off** one drone type into a new squad holding in place.
  - **Rename** a squad (1-24 characters).
  Saves stay valid after every change.
- **Files:** `dist/invasion/battle.mjs`, `main.mjs`, `index.html`, `invasion.css`,
  `tests/invasion-squad-tools.test.mjs` (new), `SWARMFALL-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (476 pass). Browser: on Titan, merging two squads
  then splitting off the Link gave the expected squads, with no errors.

### 2026-10-22: Record port-wall and joint public acceptance
- **Signed:** Codex (OpenAI)
- **Commit:** Record port wall and joint public acceptance [skip ci]
- **Release:**d1343f2 and recovery tag pushed; Pages39731139711 succeeded.481 tests pass.
- **Checks:** Public Edge42 viewport/subassembly cases (24 port/18 joints) at1440/390/360px,
  independent part/global masks and restore, original24 numbered rows, sources, installed
  context and Pilot return pass without page/network failures or overflow. Receipts and
  screenshots in current research `live-d1343f2-port/` and `live-d1343f2-joints/`.
  Local preview stopped. Documentation/screenshots only; no duplicate test/deployment cycle.
- **Next:** Deck/attic boundary, then separate insulation regions and local camera blisters.

### 2026-10-22: Add port wall and estimated end-joint inspection
- **Signed:** Codex (OpenAI)
- **Commit:** Add port structural wall and estimated end joints
- **What changed:** Shared panel builder adds a distinct port wall with two camera reliefs;
  new side webs/returns bridge existing nose/canted-aft edges. Separate unnumbered selector
  entries, outer/inner/edge and nose/aft focuses, independent part/global masks and source
  notes. Exact numbered24 and existing starboard geometry/poses unchanged; no game edits.
- **Evidence / assumptions:** Rechecked NASA April23/APL July9 reports, reused real April/May
  photos and saved CAD/DragonCam pages. Aluminum face thickness published; outlines, reliefs,
  12 mm separation,1.5 mm joint thickness/fasteners and connections estimated. No hidden
  core, inserts, seals, bondlines or qualified structural/electrical-bond performance invented.
  IEM bolt tips meet inner face; prior1.46 mm strap endpoint embedding recorded as bounded
  estimated installation contact, not hidden by moving hardware or waiving other collisions.
- **Checks:**481 full tests pass;42 local Edge Internal/Thermal viewport/subassembly cases,
  independent masks/restore, sources, original24 rows, Pilot return, exact manifests, camera
  rays and visualization clearance pass. Tube broad-phase candidates use actual centerline/
  radius narrow phase; no routes moved. Three raw views per assembly plus two contextual
  detail views pass nonblank/framed pixels; real/CAD/model/app comparison visually reviewed.
- **Archive:** Exact before files/views/manifests, baseline8ac4e59 recovery tag and tube
  candidate report. No rejected geometry draft; helper tolerances/IDs/text checks corrected.
- **Next:** Deck/attic boundary, separate insulation regions/blisters, shoulder/mount/seal
  follow-ups and broader connection/layer/UI packages. Overall construction item stays open.

### 2026-10-22: Swarmfall field guide
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add a field guide generated from the rules"
- **What changed:** Checklist TUT-03. **Field guide** on the title screen lists every drone,
  defender, society and hazard with its numbers and what beats it:
  - Drones: cost, slots, health, speed, height, sight, capture and weapons, plus the defenses
    most dangerous to them.
  - Defenders: health, weapons and effect auras, plus the two drones that hit them hardest.
  - Societies: troops, defenses, capture speed and whether artillery answers.
  - Hazards: warning time, duration and advice.
  It's generated from `units.mjs` and `hazards.mjs`, so it changes when the rules do.
- **Files:** `dist/invasion/field-guide.mjs` (new), `main.mjs`, `index.html`, `invasion.css`,
  `tests/invasion-field-guide.test.mjs` (new), `SWARMFALL-TODO.md`, `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (468 pass). The browser shows 31 entries in 4
  sections, with no errors.

### 2026-10-22: Swarmfall combat searches nearby only (same results, faster)
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Search for targets and splash victims in a spatial grid"
- **What changed:** Checklist PERF-05. Each unit used to check every enemy each step. Now
  target and splash searches use 60 m buckets and look only within the unit's longest weapon
  range or the splash radius. They visit candidates in their original order, so the same
  targets are chosen and battles play out exactly as before.
- **Files:** `dist/invasion/battle.mjs`, `SWARMFALL-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (466 pass). Identical battle state compared with
  the previous code on Halcyon, Aurex and Corvan Frontier (four drop waves and a capture
  push). Step time is 25-42% lower: 614 → 453 ms, 368 → 283 ms and 1194 → 695 ms over each
  run.

### 2026-10-22: Swarmfall first-time tips; publish warnings cleared
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add first-time tips for defenders, alarm stages, artillery and captures"
- **What changed:**
  - **Tips** (checklist TUT-02, `tips.mjs`) appear as gold-edged toasts, once per device:
    - the first time a drone sees any defender;
    - for each new kind of defense (watchtower, flak, radar, missile battery, jammer, laser,
      shield pylon, interceptor), with how to beat it;
    - at each alarm stage, the first artillery and the first captured defense.
  - **OPS-02** checked off: the first publish run on the Node 24 actions (`22e7df8`) showed no
    Node 20 warning.
- **Files:** `dist/invasion/tips.mjs` (new), `main.mjs`, `invasion.css`,
  `tests/invasion-tips.test.mjs` (new), `SWARMFALL-TODO.md`, `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (466 pass). In the browser on Kepra, the
  defenders and watchtower tips appeared once and were remembered. No errors.

### 2026-10-22: Record structural-wall public acceptance
- **Signed:** Codex (OpenAI)
- **Commit:** Record structural wall public acceptance [skip ci]
- **Release:** Model25a1dae, combined1d05c6d, Pages39729103197 succeeded; recovery tag
  pushed. Concurrent changes through22e7df8 intact; combined469 tests pass.
- **Checks:** Public Edge24 Internal/Thermal viewport/subassembly cases at1440/390/360px,
  three part masks and global structural-wall mask/restore, original24 numbered rows,
  source links and Pilot return passed without page/network failures or overflow. Receipt
  and screenshots in `research/side-wall-2026-10-22/live-1d05c6d/`; local server stopped.
- **Scope:** Documentation, acceptance helper and screenshots only. App unchanged; no
  duplicate deployment/test cycle. Next: opposite side/end joints, deck and foam separation.

### 2026-10-22: Add the first independently inspectable structural wall
- **Signed:** Codex (OpenAI)
- **Commit:** Add sourced starboard structural wall inspection
- **What changed:** Standalone starboard wall, two published-thickness 0.254 mm aluminum
  faces, estimated closeouts/fasteners/tape and actual open relief around the unchanged Down
  Camera installation. Three focuses and per-part Covers/Casings/Mounts masks, plus global
  Structural wall panels control. Physical structure under the body shell, not interior
  equipment. Original 24 numbered parts and their geometry/poses unchanged.
- **Sources / limits:** NASA April23 primary-structure article confirms aluminum facesheet
  thickness and honeycomb construction; real May frame/April fit-check photos inform finish
  and joints, credited NASA/Johns Hopkins APL/Ed Whitman. CAD is arrangement-only. Panel
  outline, 12 mm separation, details and camera relief estimated. Core cells, bonds/inserts,
  hidden connections unmodeled; older combined foam remains unchanged. No new solver.
- **Archive:** Baseline b4559dc, tag `archive/side-wall-2026-10-22`; exact prior files, before
  views and numbered-part manifests. Inboard draft crossing PSU/TWTA harness saved with
  code/pictures/failures; final wall alone moved 9.5 mm outward to clear the completed parts.
- **Checks:** 463 full tests pass. Local Edge 24 Internal/Thermal viewport/subassembly cases,
  masks/restore, source links, unchanged numbered geometry, wall-face/neighbor/shoulder
  clearance, Pilot return and three nonblank/framed raw model views passed. Comparison
  visually reviewed; evidence in `research/side-wall-2026-10-22/`. No game code changed.
- **Next:** Opposite wall/end connections, deck/attic boundary and independent foam regions.
  First-panel initial pass checked off; broader construction package stays open.
- **Concurrent work:** Preserved remote game/workflow commits through22e7df8 intact;
  both log blocks retained. Combined469 tests pass (`merged-tests.txt`), no manual edits
  to game or workflow code. Simulator implementation unchanged by merge.

### 2026-10-22: Swarmfall graphics quality and adaptive resolution
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add a graphics quality setting and adaptive resolution"
- **What changed:** Checklist PERF-04.
  - **Graphics: Low / Medium / High** on the title screen, remembered on the device. It sets
    decor density, city detail (park trees, forge smoke), the ground detail of frontier maps
    and the sharpest pixel ratio. High is today's look.
  - Resolution also adapts during a mission: about 2 s of slow frames (under ~40 fps) steps it
    down, to half at most, and 5 s of fast frames steps it back up. A hidden tab is ignored.
- **Assumptions:** Thresholds and per-level values are invented [EST]. Not yet measured on a
  real phone (PERF-01).
- **Files:** `dist/invasion/quality.mjs` (new), `scene.mjs`, `main.mjs`, `index.html`,
  `tests/invasion-quality.test.mjs` (new), `SWARMFALL-TODO.md`, `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (458 pass). Browser: the button cycles and is
  remembered. Velm Frontier on Low draws about 126 k triangles at 0.75 pixel ratio, about half
  of High. No console errors.

### 2026-10-22: Swarmfall sound
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add optional generated sound to Swarmfall"
- **What changed:** The game was silent (checklist AUD-01 to AUD-03). A **♪** button in the
  mission bar (or M) cycles sound off, quiet, medium and loud. It's off by default, remembered
  on the device, and starts only after a click or tap. Everything is generated with Web Audio,
  with no sound files:
  - The swarm's hum grows with the drones in view.
  - Shots have a sound per weapon, limited so steady fire rattles rather than roars.
  - Explosions are sized by what was destroyed. There's a capture chime, a loss tone, and
    alarm sirens by stage.
  - Weather: rain, wind, thunder on lightning strikes, and an eruption rumble that grows
    nearer the view.
  - Pods: an entry roar on each drop, and parachute flutter at nearby landings.
  As in the simulator, a pure module decides the sound (`battle-sound.mjs`) and a player plays
  it (`sound.mjs`).
- **Assumptions:** All sounds and levels are artistic [EST].
- **Files:** `dist/invasion/battle-sound.mjs` (new), `sound.mjs` (new), `main.mjs`,
  `index.html`, `tests/invasion-sound.test.mjs` (new), `SWARMFALL-TODO.md`, `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (456 pass). Browser: the button switched sound on
  and saved the level, with no errors. Not yet listened to on real speakers.

### 2026-10-22: Publish workflow on Node 24 actions
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Move the publish workflow to the Node 24 Pages actions"
- **What changed:** GitHub warned that the Pages actions still ran on the deprecated Node 20
  (checklist OPS-02). Updated `actions/configure-pages` v5 → v6, `actions/upload-pages-artifact`
  v4 → v5 and `actions/deploy-pages` v4 → v5. Their release notes show only the Node 24
  upgrade and an optional new input, so nothing else in the workflow changes.
- **Files:** `.github/workflows/pages.yml`, `SWARMFALL-TODO.md`
- **Checks:** Release notes reviewed. The first publish run after pushing confirms it.

### 2026-10-22: Swarmfall alerts: squad under attack, zone being retaken, tappable warnings
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Alert on squads under fire and zones being retaken; tap warnings to jump"
- **What changed:** Checklist CTRL-06.
  - The newest alert (J or the Alert button, plus the red minimap ring) now also covers drones
    under enemy fire and held zones being retaken.
  - A zone being retaken raises its own warning toast, once until it is back at full control.
  - Warning toasts are tappable and jump the camera to the alert.
- **Files:** `dist/invasion/camera-assist.mjs`, `main.mjs`, `invasion.css`,
  `tests/invasion-camera-assist.test.mjs`, `SWARMFALL-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (453 pass). In the browser the "being retaken"
  toast appeared as a button, and tapping it centered the view on the zone. No console errors.

### 2026-10-22: Record MMRTG public acceptance
- **Signed:** Codex (OpenAI)
- **Commit:** Record MMRTG public acceptance [skip ci]
- **Release:**4449203, Pages39726749517 succeeded; recovery tag pushed. Concurrent game
  work through2190944 retained, combined458 tests pass.
- **Checks:** Public Edge24 Internal/Thermal viewport/subassembly cases at1440/390/360px,
  stamped module,24 numbered rows, masks/restore, sensor21 refit, source links and Pilot
  return passed without page/network failures or overflow. Receipt/screenshots saved in
  `research/mmrtg-body-2026-10-22/live-4449203/`. Local server stopped.
- **Scope:** Evidence/checklist records only; app unchanged, no duplicate test/deploy run.
- **Next:** First structural side-wall panel; keep unknown construction details labeled.

### 2026-10-22: Rebuild the MMRTG exterior from photographed hardware
- **Signed:** Codex (OpenAI)
- **Commit:** Rebuild MMRTG exterior and add generator inspection
- **What changed:** Standalone `mmrtg.mjs` replaces the dark cylinder/thick fins with pale
  thin slotted plates, narrower housing, root attachments, stepped metal covers/collar and
  a covered connector example. NASA64 x66 cm envelope/fixed bulkhead pose retained; detailed
  sizes, finish and Dragonfly variant estimated.21 shares body dimensions and is refitted
  without scaling its physical package. No thermal/energy/controller changes.
- **Inspection:** Unnumbered MMRTG body option, housing/fins/end targets and independent
  Casings/Covers/Mounts/Interfaces masks; component/source details. Original24 numbers and
  credits preserved. Open covers reveal unmodeled internals, not an empty flight chamber.
- **Evidence:** Original real PIA23306 photo and complete NASA technical p15 saved/inspected;
  technical cutaway kept distinct from hardware photo. Internal historical argon versus
  external Titan nitrogen-rich circulation explained. No fuel, internal thermoelectrics,
  Mars liquid-loop operation or ground shipping/handling fixtures invented.
- **Archive:** Exact prior files and fresh local before pictures/manifests; recovery tag on
 6276276. UI/pure inspector snapshots have distinct restore names.
- **Checks:**450 full tests pass, saved in current research `tests.txt`. Envelope, eight shared thin plates/open slots, root contacts, pose, masks,
  unchanged part numbers, finite/bounded geometry, sensor fit;24 local browser cases and raw
  three-view pixel/framing, source links/Pilot return, numbered/stabilizer clearance pass.
- **Next:** First structural side wall; detailed connections, construction/layer presets and
  whole-project UI/source audit remain in the checklist. Count24/24 initial passes unchanged.
- **Concurrent work:** Preserved game commits through2190944 intact; shared log retains both
  entries. Combined458 tests pass (`merged-tests.txt`); no game code manually edited.

### 2026-10-21: Swarmfall camera assist (follow, alerts, edge-scroll, reset)
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add camera follow, jump to alert, edge-scroll and view reset"
- **What changed:** Checklist CTRL-05.
  - **Follow · G** keeps the camera on the selected squads until you pan.
  - **Alert · J** jumps to the newest alert (a lost drone, artillery or lightning marked, an
    eruption), which also shows as a red ring on the minimap for 20 s.
  - A mouse resting at the screen edge scrolls the view.
  - **Home** returns to the starting view over the Hive beacon.
  - Both buttons sit under the minimap. Follow and alert jumps also work with the free camera.
- **Files:** `dist/invasion/camera-assist.mjs` (new), `main.mjs`, `index.html`, `invasion.css`,
  `tests/invasion-camera-assist.test.mjs` (new), `SWARMFALL-TODO.md`, `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (450 pass). Browser checks:
  - J with no alert says so, and J jumps to an alert.
  - G refuses with no squad selected and follows once one is.
  - Home resets the view.
  - No console errors.
  Edge scrolling isn't checked in the browser.

### 2026-10-21: Swarmfall Velm Frontier and the walled market town
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add Velm Frontier with the walled market town Brackenford"
- **What changed:** The third Frontier map.
  - **Velm Frontier:** jungle hills around a 4.2 km swamp valley with rivers (the landform's
    new `rivers` option, water instead of lava). The Hive beacon is about 3.3 km from the
    town. Agrarian society, threat 2, acid rain. Supply: 600 matter.
  - **Town style** (`city-layout.mjs` "town", drawn by `buildTown`):
    - About 530 small houses with plastered or brick walls and red tile roofs around
      courtyards, plus garden blocks with trees.
    - A stone keep with corner towers, battlements and a flag.
    - A crenellated 10 m town wall outside the streets, with two gates per side and four
      conical-roofed turrets. The wall blocks troops and line of sight; the gates are open,
      and drones climb over the wall.
  - **Lighter jungle on big maps:** fewer, simpler trees, so a frontier jungle doesn't cost
    millions of triangles.
  - Existing cities are unchanged (fingerprint test).
- **Assumptions:** All sizes, the 9-zone / 6-required balance and the supply are invented
  [EST]. Not yet playtested.
- **Files:** `dist/invasion/city-layout.mjs`, `city-render.mjs`, `planet-terrain.mjs`,
  `mission-save.mjs`, `scene.mjs`, `campaign.mjs`, `tests/invasion-city.test.mjs`,
  `SWARMFALL-TODO.md`, `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (447 pass). The new test covers houses in blocks,
  the keep above the roofs, a mostly solid wall with gates, gates walkable and the wall not,
  rivers, dry zones, and a save round trip. In the browser the town renders (64 draw calls,
  about 337 k triangles) with no console errors.

### 2026-10-21: Swarmfall Frontier records
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Keep a record for each Frontier map"
- **What changed:** Each Frontier map now remembers your wins, best stars and fastest win.
  The Frontier list shows them ("Your record: ★★☆ · best 12:30 · 2 wins", or "Not yet won").
  The debrief notes a first win or a new best time. Records are saved with campaign progress,
  checked field by field (unknown maps and bad values are dropped). The campaign bank and
  conquests are still untouched by frontier results.
- **Files:** `dist/invasion/campaign.mjs`, `main.mjs`, `invasion.css`,
  `tests/invasion-city.test.mjs`, `SWARMFALL-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (446 pass). The new checks cover a first win, a
  faster win, a save round trip and bad records being dropped.

### 2026-10-21: Swarmfall free camera, ridges blocking sight, blocked-shot lines
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add a free camera, ridge line of sight and blocked-shot lines"
- **What changed:**
  - **Free camera** (the owner asked for one that moves up and down freely). **Free cam · C**
    under the minimap switches between the orbit camera and a camera that flies anywhere:
    - Keys: W A S D fly, R/F or Page Up/Down rise and fall, Q/E turn, Z/X look up and down,
      Shift faster.
    - Mouse: the wheel rises and falls, right-drag looks around.
    - Touch: spread or twist two fingers. Phones get ▲ ▼ ◠ ◡ buttons.
    - It stays above the ground and roofs and out of buildings once the city is found. Speed
      grows with height.
    - Tapping still gives orders, and leaving returns to orbiting the point ahead.
  - **Ridges block sight** on frontier maps: direct fire across a mountain is blocked.
    Campaign maps are unchanged.
  - **Blocked shots are visible:** a selected drone's attack target gets a faint line when it
    can fire, and a dashed red one with "No clear shot" while a building or ridge is in the way.
- **Assumptions:** Camera speeds and limits are invented [EST]. Ground sight is sampled every
  ~30 m and ignores lines under 40 m.
- **Files:** `dist/invasion/free-camera.mjs` (new), `scene.mjs`, `main.mjs`, `index.html`,
  `invasion.css`, `battle.mjs` (`shotBlocked`), `planet-terrain.mjs` (ground sight),
  `tests/invasion-free-camera.test.mjs` (new), `tests/invasion-city.test.mjs`,
  `SWARMFALL-TODO.md` (CTRL-14, COMBAT-03), `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (446 pass). Browser:
  - The free camera at street level in Corvan Prime, looking up between towers.
  - The C key and the button both toggle it, and the phone buttons appear.
  - R and W moved it 45 m in one second of frames.
  - No console errors.
  The wheel, touch gestures and the blocked-shot line weren't driven in the browser (the
  pane was in the background).
- **Open / next:** Try the free camera on a real phone; camera speed settings (CTRL-10).

### 2026-10-21: Record fin-root sensor public acceptance
- **Signed:** Codex (OpenAI)
- **Commit:** Record fin-root public acceptance [skip ci]
- **Checks:** Release6189cd8/tag pushed; Pages39639698393 succeeded. Public Edge18
  desktop/mobile layer/subassembly cases, masks/restore, source/count/revision/module stamp,
  battery covers and Pilot return pass with no page/network failures or overflow. Screenshots
  and JSON saved in the part21 research folder. Local444-test record retained; preview stopped.
- **Handoff:** All24 initial numbered passes complete; generator body and first wall next.
  Source leads recorded for generator photos/cutaway. Receipt-only commit skips another
  identical deployment; live app remains verified6189cd8. No app/game/test files changed.

### 2026-10-21: Complete fin-root RTD example and initial numbered parts
- **Signed:** Codex (OpenAI)
- **Commit:** Add reference-based fin-root RTD and close initial part list
- **What changed:** Part21 annotation replaced with a labeled Omega F2020 Class B example
  at nominal2 x2 x0.8 mm, paired10 mm x0.2 mm leads and an estimated curved bond on the
  current generator housing. Independent Casings/Mounts/Harnesses and actual-scale macro
  selectors. Pose follows canted MMRTG. App/checklist now24/24 initial passes (9 Codex/15 Claude).
- **Evidence:** Original Omega catalog hardware photographs/drawing/rating pages saved and
  inspected; separate construction illustration labeled. Class B range covers157 C but is
  not evidence of flight qualification or Dragonfly adoption. Exact type/count/mount/route
  unknown; lead ends explicitly unmodeled. No hidden circuit or new temperature/controller
  solver. Thermal retains existing gas reading. Generator/battery/part20 geometry unchanged.
- **Archive:** Exact pre21 files and fresh before screenshots/manifests, tag on5bf3431.
  Historic part20 test now compares the archived pre21 annotation because21 has its own pass.
- **Checks:**444 full tests pass (`research/fin-root-sensor-2026-10-21/tests.txt`). Package/lead scale, curved contact, eight fins, pose/label, masks and assumptions
  unit checks; actual Edge local viewport/detail/macro and preserved-neighbor checks.
- **Next:** MMRTG body, first structural wall, then detailed connections/layer/UI packages.
  Initial pass count is not a claim of a complete or flight-verified engineering model.

### 2026-10-21: Swarmfall city buildings block line of sight
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Make city buildings block line of sight and give cover"
- **What changed:** Shots used to pass straight through skyscrapers and foundry halls. Now:
  - Direct fire needs a clear line between the shooter's weapon height and the target.
    Defenses fire from a 4 m mount, troops from 1.6 m, and drones and interceptors from
    where they fly.
  - Buildings in between give cover. A drone behind a tower is safe from a square's flak gun
    and is hit once it moves into the open.
  - Drones on an attack order, and troops chasing drones, close in when a building is in the
    way. Drones climb over roofs on the way, as before.
  - Artillery strikes stay indirect.
  - Saves are unchanged; the check is rebuilt from the city like the other terrain helpers.
- **Assumptions:** Weapon mount heights are invented [EST]. Buildings are solid boxes up to
  their top tier; terrain (hills) doesn't block sight yet.
- **Files:** `dist/invasion/city-layout.mjs` (`lineBlocked`), `planet-terrain.mjs`,
  `battle.mjs`, `mission-save.mjs`, `tests/invasion-city.test.mjs`,
  `tests/invasion-mission-save.test.mjs`, `SWARMFALL-TODO.md`, `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (442 pass). New test: cover, a hit in the open,
  an attack order finding a clear line, and lines down a street and over a roof. A 56-drone
  fight inside each frontier city runs under 1 ms per step. The game page loads with no
  console errors.
- **Open / next:** Show the player when a shot is blocked; terrain blocking sight; bridges and
  multi-level surfaces (COMBAT-03).

### 2026-10-21: Verify public battery sensor and record efficient continuation
- **Signed:** Codex (OpenAI)
- **Commit:** Record battery sensor public acceptance [skip ci]
- **Checks:** Release83ff28a/tag pushed; Pages39636392679 succeeded. Concurrent game build
  dde1292 contains the unchanged sensor release. Public Edge18 desktop/mobile Internal/Thermal
  and subassembly cases, independent masks/restore, source links/count/module revision, covers
  and Pilot return pass with no overflow/page/network errors. Saved `live-dde1292/` receipt.
  Local438-test record retained; no additional simulator changes. Preview server stopped.
- **Handoff:**21 next, then generator and wall layers. Owner asks for batched steps and fewer
  repeated audits. Separate local debug helper from production UI verification. Receipt and
  research-helper-only commit skips another identical deployment; verified live builddde1292.

### 2026-10-21: Swarmfall Ashfall Frontier and the forge city style
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add Ashfall Frontier with the forge city Forgeholm"
- **What changed:** The second Frontier map, from the checklist's next step (MODE-22).
  - **Ashfall Frontier:**
    - A 6 km volcanic map with black ridged mountains and three cratered volcano cones up to
      about 810 m.
    - A 4.6 km valley veined with lava channels, which stay away from the beacon.
    - The Hive beacon lands in a basin of its own.
    - Forgeholm is about 4 km away at the valley's far end, hidden until scouted.
    - Threat 4, with eruptions and ash. Supply: 750 matter.
  - **Forge city style** (`city-layout.mjs`, drawn in `city-render.mjs` after the lab's forge
    world):
    - Foundry halls with glowing furnace doors.
    - Smokestacks rising 50-95 m through the hall roofs, so drones must climb over them.
    - Cooling towers, and slag yards with ore heaps.
    - Smoke from the tallest stacks and every tower.
  - **Landform options:** `lava` (channels) and `volcanoes` (cones). Checkpoints record and
    validate both.
- **Assumptions:** All sizes, heights, the 9-zone / 6-required balance and the supply are
  invented gameplay choices [EST]. Not yet playtested.
- **Files:** `dist/invasion/city-layout.mjs`, `city-render.mjs`, `planet-terrain.mjs`,
  `campaign.mjs`, `mission-save.mjs`, `scene.mjs` (city animation), `tests/invasion-city.test.mjs`,
  `SWARMFALL-TODO.md`, `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (431 pass). A fingerprint test proves both earlier
  metropolis cities are unchanged. Browser checks:
  - The Frontier list shows both maps, and Ashfall Frontier starts from the button.
  - The city is hidden at the start.
  - Phone (375 px): no sideways scroll, no console errors.
  - With the city showing: about 274 k triangles and 150 draw calls (smoke trimmed from 240
    sprites to 88).
- **Open / next:** A walled market town and Skyway frontier maps, owner playtest, frame rate on
  a real phone, line of sight through buildings.

### 2026-10-21: Model battery sensor example and expand the remaining interior roadmap
- **Signed:** Codex (OpenAI)
- **Commit:** Add reference-based battery sensor and detailed interior roadmap
- **What changed:** Part20 becomes a real-photo-referenced TE44909-family approximation,
  using the published maximum envelope and paired lead dimensions. Estimated bond pads,
  tacks and battery-side installation; smooth gray-end coating. Independent body/mount/wire
  masks and opt-in macro subassembly framing at actual physical scale. Count23/24 initial
  passes;21 remains annotation-only. Whole battery and Claude's part21 geometry preserved.
- **Evidence:** Archived manufacturer DS0059/DS0050 photos, dimensional drawing and rating
  table; existing NASA/APL controller/test-module evidence retained. TE adoption on Dragonfly
  is unconfirmed. One example is not a sensor-count claim. No electrical/thermal solver added;
  the example's range is unsuitable for ambient Titan or MMRTG fin-root service.
- **Roadmap:** Owner requested more extensive planning. Added detailed connection register,
  harness/thermal/sample/RF/camera/arm/support packages, construction layers and access views,
  and a final whole-project tabs/content/assumptions/mobile/source audit. This is future work,
  separate from the numbered-part count; existing completed work and credits retained.
- **Archive:** Old annotation/source/UI/test and fresh baseline pictures under
  `archive/battery-sensor-2026-10-21`, tag onf1c6129; unpublished first finish draft retained.
- **Checks:** All438 tests pass (`research/battery-sensor-2026-10-21/tests.txt`);
  local Edge18 viewport/selector cases, four orbit angles,
  three masks/restore, covers/Pilot return, nonblank raw macro/full-installation renders,
  installed-frame clearance checks and exact battery/part21 mesh comparisons passed.
- **Open / next:**21 fin-root sensor, MMRTG body, then first structural wall. Flight-specific
  sensor package/count/mounting/routing remain open. No game or flight-physics edits.

### 2026-10-21: Verify published RDE wire-layer and service-loop pass
- **Signed:** Codex (OpenAI)
- **Commit:** Record public RDE service-loop acceptance
- **Checks:** Model/source/archive releasee7f7993 and tag pushed; Pages39558352175 succeeded.
  Actual public Edge build e7f7993 passes six1440/390/360 Internal/Thermal cases, independent
  Harnesses/Interfaces masks and restoration, both unit focuses, source links/count22,
  stamped module/revision and Pilot return. No page/network failures or overflow. Twelve
  public pictures/JSON in current research `live-e7f7993/`; full local suite432pass.
- **Scope:** Verification/handoff only; no app/game/physics changes. Preview server stopped.

### 2026-10-21: RDE connector slack loops and independent wire inspection
- **Signed:** Codex (OpenAI)
- **Commit:** Add RDE service loops and independent harness inspection
- **What changed:** Four existing RDE leads gain estimated slack bows/lacing and a Harnesses
  layer independent of connector/cooling Interfaces. Original endpoints/anchors/casing poses
  preserved; Claude's non-wire meshes/materials match baseline exactly. Main trunk unchanged.
  Checklist and RDE app text now distinguish completed approved initial passes from flight
  follow-ups. Count22/24 unchanged;20/21 remain annotations.
- **Evidence:** Existing NASA/APL/Ed Whitman flight wiring photo plus original NASA-STD8739.4A
  Change4 pages29-31 saved/inspected. General appearance/principles, not qualified flight routing,
  cable construction or bend-radius compliance. No hidden pins/circuits or physics changes.
- **Archive:** Exact prior module/test/UI, fresh renders/manifest and restore notes; tag
  `archive/rde-service-loops-2026-10-21` on5f9e1bb. No model draft discarded.
- **Checks:** Focused masks, stable geometry/endpoints, own-case/neighbor clearance tests pass;
  real Edge18viewport/layer/unit cases plus independent mask checks at1440/390/360 Internal/
  Thermal, cover restoration/Pilot and nonblank/raw-pixel framing pass.432full tests pass,
  output in current research folder. Public receipt recorded after deployment. No game source edited.
- **Next:** Other units' connector loops, attic wiring and ghostable wall panels remain separate
  scoped installation work; do not reopen completed initial assets without new evidence.

### 2026-10-21: Swarmfall Frontier mode and Corvan Frontier
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add Frontier mode with Corvan Frontier and return campaign Corvan to its snowfield"
- **What changed:** The owner found the city on campaign Corvan took up most of the map and
  was visible from the start. They asked for rougher terrain, a flat valley five times bigger,
  an even bigger map, and suggested large city maps become their own mode. Now:
  - **Frontier maps** on the title screen lists large maps apart from the campaign. Results
    count toward statistics and achievements, never the campaign bank or conquests.
  - **Corvan Frontier:**
    - A 6 km map with ridged ice mountains up to about 450 m.
    - A flat valley 4.5 km long, five times the city across.
    - Corvan Prime's 900 m district sits deep in the valley, about 3.8 km from the Hive
      beacon. The beacon is in its own basin, with a lower pass into the valley.
    - Only the beacon is known at the start. Outposts and the city appear on screen and on
      the minimap once a drone comes within its sight plus 200 m. Defenders of unscouted
      zones aren't drawn.
    - The minimap shows shaded relief. The camera pulls back at most 1.8 km, and the haze
      hides what lies kilometers away. Steep faces show dark rock.
    - Supply: 650 matter, at least Scout, Link and Striker, and 16 wave slots.
  - **Campaign Corvan** is its original snowfield again, so its balance and fog are as before.
  - **Saves:** checkpoints now record the whole world (map, city spec, landform). Saves made
    on the snowfield, on the first city version, or on a frontier all resume on the world
    they were played on.
- **Assumptions:** Every size, height, distance, the 9-zone / 6-required balance and the
  supply are invented gameplay choices [EST]. Not yet playtested.
- **Archive:** `archive/swarmfall-corvan-city-2026-10-21/` (tag on `fbf08c1`). The snowfield
  archive notes its return.
- **Files:** `dist/invasion/campaign.mjs`, `planet-terrain.mjs` (valley landform),
  `battle.mjs` (scouting, world record), `mission-save.mjs`, `scene.mjs`, `main.mjs`,
  `index.html`, `invasion.css`, `tests/invasion-city.test.mjs`, `archive/`
- **Checks:** `node --test tests/*.test.mjs` (428 pass). Browser checks:
  - The title button and list work, and a Corvan Frontier mission starts and resumes.
  - The city stays hidden until scouted, along with the 14 defenders at unscouted outposts.
  - A real save from the first city version resumes on its 900 m map.
  - Phone (375 px): no sideways scroll, no console errors. About 250 k triangles at the start,
    about 380 k with the city.
- **Open / next:** More frontier maps (market town, forge city, Skyway), owner playtest, a
  frontier record, frame rate on a real phone, line of sight through buildings and troop
  routes (VIS-18, MODE-22 in `SWARMFALL-TODO.md`).

### 2026-10-21: Part 09 rotor drive electronics closed out as an approved approximation
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Close out the rotor drive electronics as an owner-approved approximation"
- **What changed:** Second of the two approved approximations. Codex's enclosures are kept
  mesh-for-mesh; added in the style of APL's photographed avionics on this vehicle (APL builds
  the RDE): black finned heat-sink tops, side slice seams, mated plugs with backshells and short
  leads to the main harness. Part 09 counted: 22 of 24 (7 Codex, 15 Claude); only 20 and 21
  (temperature annotations) remain open. Credit stays with Codex, closeout noted.
- **Tests:** Codex's RDE manifest check now covers Codex's meshes exactly and the new
  `-approx-` meshes separately; the unchecked test became the approximation test.
- **Archive:** `archive/rde-2026-10-21/` (tag on `e26d133`).
- **Files:** `dist/rotor-drive-electronics.mjs`, `dist/index.html`, `dist/ui/layers-panel.mjs`,
  `tests/rotor-drive-electronics.test.mjs`, `tests/nose-electronics.test.mjs`,
  `research/rde-2026-10-21/` (new), `INTERIOR-REALISM-TODO.md`, `archive/`
- **Checks:** `node --test tests/*.test.mjs` (428 pass; the first fins touched the TWTA waveguide
  flange and were shortened 2 mm); isolated, in-context and Thermal renders.
- **Open / next:** 20 and 21 stay annotations until the flight sensors are documented.

### 2026-10-21: Part 03 nose bulkhead closed out as an approved approximation
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Close out the nose bulkhead as an owner-approved approximation"
- **What changed:** The owner approved labeled approximations for 03 and 09. Codex's provisional
  panel is kept; its bay side gains the construction the flight structure shows elsewhere: a
  pocketed machined edge frame, a bolted center stiffener and crosswise rib, edge fastener rows
  and gold tape tabs. No apertures (unpublished). Part 03 is counted: 21 of 24 (6 Codex, 15
  Claude); credit stays with Codex for the panel, with Claude's closeout noted.
- **Tests:** Codex's nose-bulkhead tests moved from provisional to approximation (flag, count,
  new construction test); Codex's part-05 test no longer hard-codes "20 of the 24".
- **Archive:** `archive/nose-bulkhead-2026-10-21/` (tag on `46c4814`).
- **Files:** `dist/nose-bulkhead.mjs`, `dist/index.html`, `dist/ui/layers-panel.mjs`,
  `tests/nose-bulkhead.test.mjs`, `tests/nose-electronics.test.mjs`,
  `research/nose-bulkhead-2026-10-21/` (new), `research/PART-SOURCES.md`,
  `INTERIOR-REALISM-TODO.md`, `archive/`
- **Checks:** `node --test tests/*.test.mjs` (428 pass); isolated and in-context renders.
- **Open / next:** 09 rotor drive electronics as an approximation.

### 2026-10-21: Main wiring harness, third pass (strands and cross bundles)
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Lay strands with the harness trunk and add two cross-floor bundles"
- **What changed:** `dist/main-harness.mjs` (revision `main-harness-2026-10-21c`): three thinner
  strands laid with the trunk and two more cross-floor bundles between units, toward the grouped
  bundles in NASA/APL's September 2026 wiring photo.
- **Assumptions:** estimated, like the earlier passes.
- **Files:** `dist/main-harness.mjs`, `tests/main-harness.test.mjs`,
  `research/main-harness-2026-10-21/`, `INTERIOR-REALISM-TODO.md`
- **Checks:** harness tests pass (the first cross-bundle route cut through drive-electronics
  box 1 and was moved). Full suite 423/426: the three failures are Swarmfall Corvan-city tests
  from that chat's uncommitted work at the same time, not this change.
- **Open / next:** service loops, wall panels (notes in the checklist), attic harness.

### 2026-10-21: Sample carousel top hardware (part 06)
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add the carousel's photographed foil-wrapped unit, valve block and wiring"
- **What changed:** From the Connections and Installation list. Codex's carousel is kept; added
  from NASA's SVS 15003 photo: a foil-wrapped unit with Kapton and gold bands on the lid (fins
  left out under it), a valve block with bolted round flanges on the cross-link and a white wire
  loop between them. The handling fixture's posts are not drawn. Part stays credited to Codex.
- **Assumptions:** identities unknown; positions and sizes [EST].
- **Archive:** `archive/carousel-2026-10-21/` (tag on `fbf08c1`).
- **Files:** `dist/sample-carousel.mjs`, `dist/index.html`, `dist/ui/layers-panel.mjs`,
  `research/carousel-detail-2026-10-21/` (new), `research/PART-SOURCES.md`,
  `INTERIOR-REALISM-TODO.md`, `archive/`
- **Checks:** `node --test tests/*.test.mjs` (426 pass; the first wire route touched the DrACO
  manifold and was moved); isolated and in-context renders.
- **Open / next:** remaining connection items: attic harness, open-frame wall panels, brackets.

### 2026-10-21: Main wiring harness, second pass (walls, fans, neighbors)
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Extend the harness up the walls to the TWTA and gimbal and back to the fans"
- **What changed:** `dist/main-harness.mjs` (revision `main-harness-2026-10-21b`) adds bundles
  beside the trunk between neighboring units, a starboard-wall riser to the TWTA power supply's
  cable end, a port-wall riser to the antenna gimbal drive's cable end under the deck, and a run
  along the starboard wall beside the battery to the circulation fans, following the wall runs
  in NASA/APL's September 2026 wiring photo.
- **Assumptions:** routes [EST], as in the first pass.
- **Files:** `dist/main-harness.mjs`, `tests/main-harness.test.mjs`,
  `research/main-harness-2026-10-21/`, `INTERIOR-REALISM-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (426 pass); the risers meet the TWTA and gimbal
  cable ends; clearance now also against the TWTA, gimbal and fans. Renders from three angles.
- **Open / next:** attic harness, brace runs, more density, the port down camera.

### 2026-10-21: Main wiring harness, first pass (bay floor)
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Lay the main wiring harness on the bay floor from the September wiring photo"
- **What changed:** Last item of the owner-approved order after the Wonderwall and DraMS passes.
  New `dist/main-harness.mjs`: silver-sheathed bundles on the equipment-bay floor, a centerline
  trunk from the navigation units to the battery and branches that meet the cable stubs earlier
  passes left (power units, IEM, battery) or end at connector faces (radio, drive electronics,
  navigation units, lower-camera pass-throughs); blue-green lacing ties and floor clamps.
  Registered as the unnumbered `main-harness` subsystem (Internal and Thermal).
- **Assumptions:** routes, sizes, topology [EST]; no pin or signal assignment. Much sparser than
  the photo; walls, brace, attic and the port down camera are next (checklist).
- **Archive:** none needed (nothing replaced).
- **Files:** `dist/main-harness.mjs` (new), `dist/vehicle-research.mjs`, `dist/index.html`,
  `tests/main-harness.test.mjs` (new), `research/main-harness-2026-10-21/` (new),
  `research/PART-SOURCES.md`, `INTERIOR-REALISM-TODO.md`, `ARCHITECTURE.md`, `README.md`
- **Checks:** `node --test tests/*.test.mjs` (426 pass; 4 new: topology, stub meeting points,
  floor and wall bounds, clearance with 19 rebuilt parts). Renders from above and in the app.
- **Open / next:** harness density, wall and attic runs.

### 2026-10-21: Swarmfall city district on Corvan's planetary map
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Build a city district into Corvan's planetary map"
- **What changed:** The owner said the cities were meant to sit inside the larger planetary
  maps. Corvan, the industrial world, now has a 900 m district (9 × 9 blocks, 184 buildings)
  inside a map twice as wide (half-size 460 → 900 m). One seeded, versioned layout
  (`city-layout.mjs`) drives both the rules and the drawing:
  - Ground is level under the city and blends back into the snowfields.
  - Troops walk around buildings, and defenses are never placed inside one.
  - Drones climb over roofs.
  - Pods land only on open ground.
  - The five open squares are capture zones (the central one is the capital).
  - Two more zones lie in the countryside.
  - The minimap shows building footprints.
  - Fog and camera zoom scale with the bigger map.
  The renderer (`city-render.mjs`) reuses the Environment Lab kit: streets, sidewalks, paved
  squares, parks with trees, tiered buildings with procedural facades, and rooftop gear.
  Each battle records its city layout. A Corvan battle saved before this change resumes on the
  landscape it was saved on; a checkpoint with a different city is refused.
- **Assumptions:** City size, block and street sizes, heights and the 7-zone / 5-required
  balance are invented gameplay choices [EST]. Balance is not playtested.
- **Archive:** `archive/swarmfall-corvan-map-2026-10-21/` (tag on `52dc4a8`).
- **Files:** `dist/invasion/city-layout.mjs` (new), `dist/invasion/city-render.mjs` (new),
  `planet-terrain.mjs`, `battle.mjs`, `mission-save.mjs`, `campaign.mjs`, `scene.mjs`, `main.mjs`,
  `environments/kit/core.mjs` (imports three.js by path so the game page can use the kit),
  `tests/invasion-city.test.mjs` (new), `tests/invasion-mission-save.test.mjs`
- **Checks:** All 426 tests ran. 425 pass; the one failure is `tests/main-harness.test.mjs`,
  another session's harness work in progress, not this change. Browser checks:
  - The city renders on Corvan at desktop and phone size (375 px), with no console errors.
  - Phone size: no sideways scroll; 72 draw calls and about 133,000 triangles.
  - Drones held 79 m over a 69 m roof.
  - The lab's Metropolis still loads.
- **Open / next:** Shots still pass through buildings (line of sight). Ground troops slide
  along walls rather than path-finding (FIX-03). Buildings can't be destroyed yet. Other planets
  could get their own city types (market town on Velm, forge city on Ashfall). See VIS-18 in
  `SWARMFALL-TODO.md`.

### 2026-10-20: DraMS visible hardware (part 08)
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add DraMS's photographed blanket, valves, brass cylinder and wiring"
- **What changed:** Second half of the owner's attic note. Codex's DraMS is kept; added from
  NASA's SVS 15003 photo: a copper-gold insulation blanket over the analyzer, three valve bodies
  with lines into the gas chromatograph enclosure, a brass cylinder and a wire bundle. The
  photo's tan connector table and rising foil-wrapped cables are clean-room test equipment and
  are not drawn; nor are the blue protective caps. Part stays credited to Codex.
- **Assumptions:** identities, positions and sizes [EST]; no hidden internals.
- **Archive:** `archive/drams-2026-10-20/` (tag on `28197a2`).
- **Files:** `dist/drams-assembly.mjs`, `dist/index.html`, `dist/ui/layers-panel.mjs`,
  `research/drams-detail-2026-10-20/` (new), `research/PART-SOURCES.md`,
  `INTERIOR-REALISM-TODO.md`, `archive/`
- **Checks:** DraMS, Wonderwall and carousel tests pass; full suite 417/418, the failure is the
  Swarmfall chat's in-progress save test, not this change. Renders isolated, in context, Thermal.
- **Open / next:** the main wiring harness (Connections and Installation in the checklist).

### 2026-10-20: Wonderwall photo detail (part 07)
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add the photographed frame, port fitting, Kapton and clips to the Wonderwall"
- **What changed:** The owner felt something was missing from the attic apparatus. Compared
  with NASA's SVS 15003 photos, Codex's Wonderwall was a plain panel. Kept Codex's panel and
  added what the photos show: khaki facesheets, a machined pocketed frame around the port on the
  carousel side, the port's spoked fitting (middle left open for the DraMS neck), orange Kapton
  (replacing a small amber patch) and clip tabs along the edges. Part stays credited to Codex.
- **Assumptions:** All traced on the photos [EST]. The photos put the port lower than drawn;
  not moved, because DraMS is keyed to it (follow-up).
- **Archive:** `archive/wonderwall-2026-10-20/` (tag on `9c2eaef`).
- **Files:** `dist/wonderwall.mjs`, `dist/index.html`, `dist/ui/layers-panel.mjs`,
  `research/wonderwall-detail-2026-10-20/` (new), `research/PART-SOURCES.md`,
  `INTERIOR-REALISM-TODO.md`, `archive/`
- **Checks:** `node --test tests/*.test.mjs` (418 pass); carousel gap 14 mm (8 required);
  isolated and in-context renders, carousel and DraMS sides.
- **Open / next:** DraMS visible hardware (harness bundles, tubes, valves), then the main
  wiring harness.

### 2026-10-20: Market town and forge city join the lab
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add the walled market town and forge city to the lab"
- **What changed:** Two more kit-built worlds. **Walled market town:** about 400 houses built cell by
  cell from Kenney Fantasy Town Kit wall panels (stone ground floors, timber upper floors, street
  doors, eaves, banners) with drawn tiled gable roofs and lamplit interiors at dusk, a market
  square with stalls, carts, fountain and lanterns, town walls with towers and a gate, a castle on
  its hill, a windmill and a watermill with Kenney's sails and wheel turning, a river, bridge,
  fields, trees and haystacks. **Forge city:** basalt terraces and flowing lava, about 600
  foundries, stacks, blast furnaces and cooling towers, smoke and embers, bridges, an ore railway
  and volcanoes (a setting for Ashfall).
- **Checks:** both load in the browser with no errors (town about 1.5 M triangles, forge 0.2 M);
  every module parses; game and page tests pass.
- **Open / next:** VIS-20 (the ring decision; phone/Light-mode measurements; destruction support).

### 2026-10-20: Arm shoulders drawn as the machined fittings in the flight-frame photo
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Draw the arm shoulders as the machined hexagonal fittings from the frame photo"
- **What changed:** The owner's October 15 note ("looks more like a little hexagon at the
  shoulder"), done after part 21 while the other open parts wait on evidence. Each arm root's
  round foam ring and round flange (turned straight across the body) is replaced by the fitting
  in NASA/APL's May 2026 frame photo: a dark six-sided collar with ribs, narrowing along the arm
  to a round flange with 12 bolts; the arm's fairing starts at the flange.
- **Assumptions:** Sizes [EST] from the photo against the arm tube; the base plate (under the
  foam) and the lifting lug (possibly ground-handling) are not drawn.
- **Archive:** `archive/arm-shoulder-2026-10-20/` (tag on `8dad2ea`) with four close renders.
- **Files:** `dist/arm-shoulder.mjs` (new), `dist/vehicle-research.mjs`, `dist/index.html`,
  `tests/arm-shoulder.test.mjs` (new), `research/arm-shoulder-2026-10-20/` (new),
  `research/PART-SOURCES.md`, `INTERIOR-REALISM-TODO.md`, `ARCHITECTURE.md`, `archive/`
- **Checks:** `node --test tests/*.test.mjs` (418 pass, 4 new); close renders from four
  angles; Pilot view and phone width checked in the app.
- **Open / next:** bare flight arm and harness; 03, 09, 20, 21 still wait on evidence or the
  owner's choice of approved approximations.

### 2026-10-20: Kit-built lab worlds: varied Metropolis, orbital ring, asteroid colony, Titan outpost
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add kit-built lab worlds and rebuild Metropolis from modular parts"
- **What changed:** At the owner's request for many detailed environments from our assets and
  original art, and because the first Metropolis was "a tad too identical in places":
  - New shared kit `dist/invasion/environments/kit/` (instancing, merged facades with meter UVs,
    generated facade/ground textures with dusk windows, horizon mountains, water, stars, planets,
    trees, moving traffic) and on-demand worlds in `worlds/` registered in `worlds/index.mjs`.
  - **Metropolis (new):** 40 downtown buildings assembled panel by panel from all 150 Downtown
    City MegaKit parts (CC0), each with its own style, size, height, window rhythm, storefronts,
    entrance, setback and rooftop; walls facing a neighbor use flat matching facades to keep the
    triangle count near 4 M (was 11 M). About 1,700 procedural buildings in 8 facade styles, 10
    one-off towers, river and bridges, elevated rail, park, stadium, harbor, 420 moving cars.
    Codex's first version stays as `?scene=metropolis-classic`.
  - **Orbital ring:** a habitat wheel (towns on its inner floor, hub, solar wings, shuttles) over a
    gas giant. Owner feedback: cool, but not yet placed in the story and too small for a battle
    map; labeled as a visual study pending that decision (see VIS-20).
  - **Asteroid colony:** cratered asteroid, habitat ring, mining rigs, refinery, debris field,
    haulers and the game's own Scout drones.
  - **Titan Hive outpost:** the simulator's Titan terrain and haze, its aeroshell/parachute
    hardware landing pods on a loop, two Dragonfly research models (one flying) and the game's
    drone squads around an original Hive spire, pads, domes and sheds.
  - Small generic hooks in Codex's `lab.mjs` (load a registered world, worlds with their own sky,
    per-world fog/flyover/pilot limits, dusk handler, opt-out of the destruction study) and a
    localhost-only `window.labDebug`. Kit copies prepared by
    `research/fantasy-city-2026-10-16/prepare-environment-kits.py` (textures reduced to 512 px).
- **Assumptions:** all layouts, sizes and procedural art are invented visual studies [EST]; no
  collision, routes or game rules. Kit worlds opt out of the destruction preview for now.
- **Incident:** a computer crash left two OneDrive conflict copies (`*-LAPTOP-VIAE0F3D.mjs`) holding
  the newest edits while older copies kept the real names; the newest versions were restored and
  the copies removed. Check for such copies after any crash.
- **Checks:** every module parses; all tests pass; each new world loaded in the browser with no
  errors. Phone/Light-mode frame times are not yet measured.
- **Open / next:** VIS-20 in the checklist (market town and forge city were started in the plan
  but not built, and are not in the menu).

### 2026-10-20: Part 21 MMRTG fin-root temperature shown as an annotation on the generator
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Show part 21 as a fin-root annotation on the MMRTG instead of a floating sphere"
- **What changed:** The owner asked Claude to check Codex's work and continue with several
  parts. Review: Codex's October 16-20 simulator passes (#22, #05, provisional #03, #09
  inspection, #20 annotation) are committed and published; 409 tests passed. Claude's unpublished
  #22 research draft was dropped, since Codex's #22 covers it. Part 21's green sphere passed
  through the MMRTG's top fin and, isolated, floated alone. Following Codex's part 20 treatment,
  it is now a labeled measurement annotation (ring and crosshair) lying on the generator's
  housing beside the top fin's root, posed with the generator. Isolating 21 shows the MMRTG. The
  part has its own text (published input, 157 C rating, what is not known, that the shown
  temperature is the modeled gas), sources and a live line (fans, flow, generation).
- **Sources:** TFAWS 2023 slides 7/9 (fin-root temperature as the second controller input,
  driving the fans); NASA MMRTG fact sheet (157 C fin-root rating; pages saved); Pioneer RTG
  fin-root sensors (Toth and Turyshev 2007; pages saved; context only).
- **Assumptions:** The target's position and size are [EST]; it is not a sensor package, point
  or count. No flight sensor evidence was found (NASA blog has nothing after September 2, APL
  nothing after July 9). 21 stays unchecked; count stays 20 of 24 (5 Codex, 15 Claude).
- **Codex's part 20 test:** its check that part 21 was left unchanged now compares the two
  archived copies (part 20's pass did leave it unchanged) and ignores line endings.
- **Archive:** `archive/mmrtg-sensor-2026-10-20/` (tag on `d016f12`): exact files, pictures,
  real-Edge baseline.
- **Files:** `dist/mmrtg-measurement.mjs` (new), `dist/vehicle-research.mjs`,
  `dist/vehicle-inspector.mjs`, `dist/ui/layers-panel.mjs`, `dist/index.html`,
  `tests/mmrtg-measurement.test.mjs` (new), `tests/battery-measurement.test.mjs`,
  `research/mmrtg-measurement-2026-10-20/` (new), `research/sources/nasa-mmrtg-factsheet/`,
  `research/sources/pioneer-rtg-fin-root-2007/` (new), `research/sources/tfaws2023-battery-feedback/README.md`,
  `research/PART-SOURCES.md`, `INTERIOR-REALISM-TODO.md`, `README.md`, `ARCHITECTURE.md`,
  `RESEARCH-COMPENDIUM.md`, `archive/`
- **Checks:** `node --test tests/*.test.mjs` (414 pass, 5 new). Real Edge (Playwright):
  isolated Internal/Thermal at 1440/390/360 px, no overflow, four angles, close view, part text
  and sources, Pilot return, no page errors; the same for the old build as a baseline.
- **Open / next:** 03, 09, 20 and 21 all wait on evidence; the owner chooses between approved,
  labeled approximations and waiting for new photos.

### 2026-10-20: FIX-07 phone HUD decluttering
- **Signed:** Codex (OpenAI)
- **Commit:** Collapse phone battlefield panels after first capture
- **What changed:** Objectives and Battle log collapse once after a capture on narrow
  screens, with independent native summary controls. Manual reopening persists during
  the mission; new missions reset, captured resumes start compact on phones. Logs keep
  updating and warning toasts remain active. Focus inside closing panels moves to summary.
- **Files:** invasion entry/HTML/CSS, DOM harness, five focused tests, checklist/README,
  evidence and exact-original archive with dated historical picture and restore steps.
- **Checks:** 405 tests pass. Entry-point tests cover capture, manual choices, viewport
  changes, new/resumed missions, warnings and keyboard controls. DOM harness corrected
  to recognize only actual dialog elements as modal. Canonical checklist:27/305 checked.
  Concurrent battery-annotation changes through21ded4e retained; combined suite409pass
  (`research/swarmfall-phone-hud-2026-10-20/merged-test-results.txt`).
- **Assumptions:** 720px uses the existing phone CSS breakpoint; collapse preference is
  mission-local UI state and does not change save format or game rules.
- **Open / next:** Browser/touch/screen-reader and real-phone visual acceptance remain
  open; prior browser restriction retained. No environment lab or independent studio edits.

### 2026-10-20: Verify public battery-measurement correction
- **Signed:** Codex (OpenAI)
- **Commit:** Record public battery annotation verification
- **Checks:** Published2810746, Pages39382667705 success; real Edge1440/390/360 Internal/
  Thermal, stamped module/revision, original part20/count20, source links, covers hide/restore
  and Pilot return pass. No page/network failures or overflow. Seven public pictures/JSON
  saved in `research/battery-measurement-2026-10-20/live/`. Combined full suite404pass.
- **Scope:** Evidence/handoff only, no new app changes.20 remains open hardware, no photo-match
  claimed. Battery/21 and game changes preserved. Model/source/archive release3ff49b5/2810746.

### 2026-10-20: Correct battery-temperature placeholder as a measurement annotation
- **Signed:** Codex (OpenAI)
- **Commit:** Clarify battery temperature annotation and inspection context
- **What changed:** Part20 green sphere intersecting the battery replaced with open target;
  explicitly an annotation, not a flight sensor package/mounting/count. Focus includes battery.
  Expandable details/source links/assumptions updated; hardware rebuild remains unchecked.
- **Evidence:** Original NASA/APL TFAWS2023 pages7-9 inspected/saved; existing real ICES2022
  ground-test photos and CAD differentiated. TE/Juno/Landsat and DrEAM heritage not copied as
  this part. Real/CAD/controller/model comparison saved. No invented hardware or wiring.
- **Archive:** Exact prior builder/inspector/panel/HTML, fresh baseline pictures/manifest,
  restore steps and recovery tag `archive/battery-measurement-2026-10-20` on5220223.
- **Checks:**394tests pass including4new tests; actual Edge six viewport/layer cases,
  four orbit angles, cover hide/restore, Pilot return and raw nonblank/framing checks.
  Battery and part21 exact geometry/transform manifests match baseline. No app/page errors
  or horizontal overflow. No physics/game changes;20/24 unchanged.
- **Next:** Identified flight sensor photo/type/mount/count needed. Public release checked
  after deployment; local screenshots alone are not publication proof.
- **Concurrent work:** Preserved minimap releasea7261bb intact, retained both log/archive
  entries; combined suite404pass (`research/battery-measurement-2026-10-20/merged-tests.txt`).

### 2026-10-20: CTRL-08 minimap squad orders
- **Signed:** Codex (OpenAI)
- **Commit:** Give squad orders from the minimap
- **What changed:** Default View taps keep camera navigation; desktop right-click orders
  selected squads. Map: Orders enables touch/pen primary tap orders via existing attack/
  capture/move rules, with a short target pulse. Paused commands work; pointer interruption,
  drag/chord/multi-touch and synthetic clicks cannot issue stray/duplicate orders. Order
  input cancels active landing placement without a purchase; new/resumed missions start
  with View mode/no transient pulse. Clean view hides the full map/toggle panel.
- **Files:** invasion entry/HTML/CSS, plain map coordinate helper, focused controls tests,
  signed master checklist/README and preserved baseline/evidence folders.
- **Checks:** 400 tests pass including10 new real entry-point/rule checks with DOM/renderer/
  capture stand-ins. Current save formats, battlefield controls, selection and battle rules
  remain compatible. Original source preserved/tagged. Neither environment lab changed.
- **Open / next:** Native browser/touch/phone visual acceptance remains open; prior browser
  automation restriction not retried. CTRL-08 implementation complete; checklist26/305.
  [Evidence](research/swarmfall-minimap-orders-2026-10-20/README.md).

### 2026-10-19: FIX-11 guidance for Hold without selection
- **Signed:** Codex (OpenAI)
- **Commit:** Explain Hold when no squad is selected
- **What changed:** Hold and H share an empty-selection hint that restores the HUD when
  needed. H repeat events are ignored; selected-squad Hold and Clean view behavior remain.
  Ended missions receive no Hold command or hint. Both environment labs and studio unchanged.
- **Files:** invasion entry point, signed checklist/README and evidence/archive folders.
- **Checks:** 390 tests pass plus focused actual entry-point button/key checks using existing
  DOM/renderer stand-ins; empty guidance/no battle mutation, H/repeat/HUD, selected real drone
  Hold and ended-mission paths pass. Original source archived and recovery tag created.
- **Open / next:** Native browser/touch review remains open; prior restriction not retried.
  FIX-11 implementation complete; canonical checklist 25/305.
  [Evidence](research/swarmfall-hold-hint-2026-10-19/README.md).

### 2026-10-19: FIX-04 tiny-drone squad markers
- **Signed:** Codex (OpenAI)
- **Commit:** Keep tiny friendly drones visible with squad markers
- **What changed:** Added squad-colored, dark-outlined overlay diamonds for living friendly
  drones below 8 projected CSS pixels. Cached actual body/rotor bounds and camera-space depth
  drive the threshold. Selection rings/health bars remain; Clean view hides markers. No unit
  scale/rules/hit tests/saves changed. Both environment labs remain untouched; the other
  project owns standalone studio expansion.
- **Files:** invasion main/scene, plain marker helper, automated marker/camera coverage,
  master checklist/README and preserved baseline/evidence folders.
- **Checks:** 390 combined tests pass, preserving concurrent simulator RDE work through
  11c0b31 (initial game pass387). Four new projection, viewport, actual overlay wiring and
  real-camera/model-bound checks use renderer/DOM stand-ins. Unit state remains unchanged.
- **Open / next:** Native browser/phone/occlusion readability acceptance remains open; prior
  browser automation restriction was not retried. FIX-04 closes implementation/automated
  scope; checklist 24/305. Original-source archive hashes verified and recovery tag created
  on 7ab195e; public deployment is checked after push.
  [Evidence](research/swarmfall-drone-markers-2026-10-19/README.md).

### 2026-10-19: Verify published individual RDE inspection
- **Signed:** Codex (OpenAI)
- **Commit:** Record public RDE inspection acceptance
- **Checks:** Release5d85fd0 and recovery tag pushed; Pages39355386898 succeeded.
  Public real-Edge stamped module/revision, part09/count20, both selectors at1440/390/360,
  source links, cover hide/restore across Thermal and Pilot return pass. No page/network
  failures or horizontal overflow. Six public screenshots/JSON and repeatable script saved.
- **Scope:** Acceptance/documentation only; no application, geometry, physics or game edits.
 386 tests from the model release pass.09 remains provisional;20/24 unchanged.

### 2026-10-19: Individual provisional RDE inspection and source audit
- **Signed:** Codex (OpenAI)
- **Commit:** Add individual RDE inspection and supplier evidence
- **What changed:** Two unit focus/isolation targets under original part09; independent
  casing/cover/mount/interface groups. Geometry, materials and installed coordinates unchanged.
  Expandable detail cites AAC current-sensor supply and APL WBG abstract; no flight casing claim.
- **Evidence:** Saved original AAC page, retained real CAPS test photo and identified CAD,
  real/CAD/actual-model comparison and access/reuse audit. Related X-57 is not copied.
- **Assumptions:** Existing provisional enclosure dimensions/appearance/install remain EST;
  hidden electronics are unmodeled.09unchecked,20/24 unchanged. No physics or game edits.
- **Archive:** Exact prior module/UI/test, fresh pictures/mesh manifest; recovery tag
  `archive/rde-inspection-2026-10-19` on7ab195e. No shape drafts created/discarded.
- **Checks:** 386 tests pass, including7RDE tests; exact archived mesh/material/pose comparison,
  rebuilt-neighbor clearances. Real Edge18selector/layer/width checks at1440/390/360,
  cover hide/restore, Pilot return and raw nonblank/framing checks pass; no page errors.
- **Open / next:** Resolve actual RDE appearance/scale before checking off09.03/20/21 also
  open. Public release acceptance follows deployment; local pictures are not live proof.

### 2026-10-19: Add public original/polished Scout inspection links
- **Signed:** Codex (OpenAI)
- **Commit:** Add original and polished Scout lab comparison
- **What changed:** Added a Scout-only Original / Polish pass selector to the existing
  Asset & Environment Lab. Shareable query links use its orbit/zoom/turntable controls,
  lighting and stand scale; title labels the selected version. Catalog stays at 18 assets,
  unknown versions fall back to polished, and campaign/save state is unaffected. Loader
  disposes unused drone templates; historical Scout module is loaded only for the old view.
- **Files:** asset-viewer/lab/HTML, historical Scout generator, tests, credits, evidence,
  preserved inspector baseline/tag and master checklist/README links.
- **Checks:** 383 tests pass. Historical geometry exactly matches archived body/glow data,
  normals/colors/anchors/scale; both displays share stand scale and XZ footprint. Current
  Scout remains584 body triangles, original432; no additional drone redesign.
- **Open / next:** Actual browser/touch/phone and owner art acceptance remain open. Prior
  browser restriction was not retried. ART-09 stays unchecked; canonical count23/305.
  [Comparison links/evidence](research/scout-lab-comparison-2026-10-19/README.md).

### 2026-10-19: ART-09 A1 Scout hull and sensor polish
- **Signed:** Codex (OpenAI)
- **Commit:** Refine Scout hull and recessed sensor housing
- **What changed:** Replaced Scout's rectangular hull/sensor sphere with chamfered hull
  bands, open rim/recessed lens, deck grooves/trim and capped motors. Original gameplay art;
  scale, rotor anchors/radii, squad-light data, prior envelope and instancing path retained.
  Other models, statistics, flight, orders and save formats remain unchanged.
- **Files:** invasion models, Scout invariant test, research CPU preview/geometry/scripts,
  archive/source/picture/draft/tag, master checklist and README handoff.
- **Checks:** 381 tests pass including old envelope/anchors/lights/normals/budget and existing
  scene allocation/drop/disposal. New fixed-view CPU comparison inspected; body/glow620
  triangles vs468, +32.5% shared template geometry, no new material/mesh batch. Not a GPU benchmark.
- **Open / next:** Owner/browser visual acceptance, High/Light/phone review; previous browser
  restriction was not retried. Link follows Scout feedback. ART-09 remains open; count23/305.
  [Evidence](research/scout-polish-2026-10-19/README.md),
  [original and restore steps](archive/scout-polish-2026-10-19/README.md).

### 2026-10-19: Prepare two small ART-09 follow-up steps
- **Signed:** Codex (OpenAI)
- **Commit:** Prepare small asset batches and geometry baseline
- **What changed:** Split future polish into Scout, Link, defender/interceptor and later
  props/UI/effects batches. Built an unchanged six-template CPU geometry inventory and
  recorded source evidence, scope boundaries and a Scout-only next-session handoff.
- **Files:** research/swarmfall-small-assets-2026-10-19 and ART-09 evidence link.
- **Checks:** Inventory script builds six templates, checks nonempty/finite positions and
  records triangles, local bounds, rotor counts and CPU attribute bytes; documentation diff
  and canonical task count checked. No runtime changes or new full suite needed.
- **Open / next:** Scout cosmetic prototype, preserved original, real visual comparison and
  relevant checks. No asset upgraded/approved yet; ART-09 remains open and count stays 23/305.

### 2026-10-19: Prioritize smaller assets below the project visual standard
- **Signed:** Codex (OpenAI)
- **Commit:** Prioritize future small asset visual upgrades
- **What changed:** Added owner-requested ART-09 as a future P2 visual priority, linked from
  roadmap milestone 9. Review small unit details, props, icons, textures, decals and effect
  elements against the strongest existing work; upgrade weak spots in tracked batches with
  coherent style, RTS/pilot readability, performance checks and preserved originals.
- **Files:** SWARMFALL-TODO.md and README.md; all prior tasks/history retained.
- **Checks:** Documentation diff and unique task IDs/count checked. Documentation only;
  no assets changed or claimed approved, no runtime tests needed. Count now 23/305 checked.
- **Open / next:** Identify and review the actual assets before implementing upgrades.

### 2026-10-19: Expand future pilot control to first and third person
- **Signed:** Codex (OpenAI)
- **Commit:** Record individual drone first and third person mode
- **What changed:** Expanded existing MODE-20/PILOT tasks for individual-drone possession,
  switchable onboard/chase cameras, drone abilities, unit switching and return to RTS with
  other squads retaining orders. Optional dedicated pilot/skirmish mode can be the first
  playable step; eventual campaign handoff remains required. Owner reference recorded as
  Ghost Recon / RTS-style control without assuming an exact title or its mechanics.
- **Files:** SWARMFALL-TODO.md and README.md; existing task IDs retained and kept unchecked.
- **Checks:** Documentation diff, unique task IDs and checkbox count verified; no runtime
  changes or new test run. Latest implementation suite remains 380 passing tests.
- **Open / next:** Future design/implementation, not a playable mode yet. Count stays 23/304.

### 2026-10-19: CTRL-04 desktop selection and order controls
- **Signed:** Codex (OpenAI)
- **Commit:** Separate desktop selection from battlefield orders
- **What changed:** Left-click selects and right-click orders attacks/captures/movement;
  modifier clicks toggle additional squads and empty left-click clears selection. Touch/pen
  keep smart taps, camera drags/pinch remain, and interrupted gestures cannot release an order.
  Right-click cancels landing placement; stale previews clear without launching or spending.
- **Files:** invasion main/HTML and plain pointer-intent module; shared entry-point test harness,
  pointer coverage, README, master checklist and evidence/archive folders.
- **Assumptions:** Input thresholds/gestures are UI design choices; battle rules, saves, paid
  cargo and campaign art remain compatible. Concurrent simulator work through 514241b retained.
- **Checks:** 380 tests pass, including 13 new pointer/wiring tests using actual battle rules
  with DOM/projection/capture stand-ins; preserved sources verified against baseline tag.
- **Open / next:** Real browser/touch/capture acceptance remains open; prior browser restriction
  was not retried. CTRL-01/03 selection tools/queues remain open. Checklist now 23/304 checked.
  [Evidence](research/swarmfall-pointer-controls-2026-10-19/README.md),
  [preserved behavior and historical picture](archive/swarmfall-pointer-controls-2026-10-19/README.md).

### 2026-10-19: Verify published Ocellus approximation
- **Signed:** Codex (OpenAI).
- **Commit:** Record live Ocellus model verification.
- **Release:** model/archive51d063d and recovery tag pushed; Pages39322730880 succeeded.
  Real Edge verified build stamp, module/revision, count20, source links, all selectors,
  FEB at1440/390/360, cover hide/restore across Internal/Thermal and reset/Pilot return.
  No page/network errors or horizontal overflow; screenshots/JSON/check script saved.
- **Scope:** evidence/handoff only; no app changes. Full model suite367 pass. Public builds
  omit local debug globals, so live script checks published module and UI instead. Initial
  #05 pass complete as an approved estimate; exact flight hardware remains a follow-up.

### 2026-10-19: Approved Ocellus outer-structure asset pass
- **Signed:** Codex (OpenAI).
- **Commit:** Add approved Ocellus outer-structure approximation.
- **Owner direction:** "same as last 2 parts" to the explicit approximation/wait choice.
  Same labeled-estimate approach as METHAN/MIMU; not permission to assert hidden flight detail.
- **Geometry:** replace plain lidar boxes with estimated MEB frame/stiffeners/removable lid
  and FEB base/returns/receiver barrel/angled collimator housing/removable caps. Retain exact
  nominal2023 envelopes, all poses, original05 anchor/five focuses and independent masks.
  Both MIMU models and support geometry unchanged, asserted against exact archived module.
  No hidden boards, detailed optics, mirror, pinouts or flight harness; no physics changes.
- **Evidence:** real related SQRLi/Kodiak construction and identified Ocellus CAD scale/layout,
  not photo-matched Ocellus. Related board's EVAL ONLY marking confirmed by original TI table,
  saved/credited; not treated as a qualified flight board. New source links in Component text.
- **Archive:** exact prior module/test/UI/HTML/builder, historical same-geometry box renders,
  original panel-count test and two uncommitted stiffener drafts saved with restore steps.
  Recovery tag `archive/ocellus-outer-structure-2026-10-19` on f28fe8b. No draft tags.
- **Checklist:** #05 initial pass checked as approved approximation; 20/24 (5 Codex,15 Claude),
  not flight verification. Exact flight configuration/optical/electrical interfaces stay open.
  Updated app assumptions, root/readme/research/source index/architecture/handoff; older
  research explicitly marked historical. Panel03 remains unchecked; test no longer pins
  unrelated global count19. No separate game edits.
- **Checks:** **367 tests pass,0 fail**. Real Edge:30 unit/layer/viewport combinations,
  eight installed angles, eight raw nonblank/framed pixel checks, cap hide/restore and Pilot
  return pass at1440/390/360. Original sources and real/CAD/current-model comparison inspected.
  Publication verification recorded in current part README when complete.

### 2026-10-19: Deeper Ocellus cross-project hardware lineage
- **Signed:** Codex (OpenAI).
- **Commit:** Trace Ocellus hardware families across related NASA projects.
- **Scope:** Owner-requested research only. Followed predecessor lidar electronics, SQRLi,
  SpaceCube Mini and GSFC fiber interfaces through other projects, then back to Ocellus.
  Saved 9 original source-page images and 1 original supplier JPG with credits/limits.
- **Findings:** NASA confirms family/development links, not identical flight packaging.
  Real v2.0 Mini boards do not identify Ocellus generation; NASA1064nm seed-laser program
  quantity is not installed count. Supplier distinguishes test MiniAVIM from mission
  MicroAVIM. Optotune procurement and Mirrorcle architecture leads do not establish Ocellus
  scanner adoption. Original SAM/old supplier PDF gaps explicitly retained.
- **Files:** Cross-project matrix/source records/reproducible labeled comparison, root
  README, research compendium/index and continuation notes. Current IMU/lidar app geometry,
  behavior and constants unchanged; #05 open/count19. No replacement archive required.
- **Preservation:** Main matched0fc30b7 after fetch; priorities branch has no unmerged work.
  No separate game edits. No unsupported supplier finish, hidden boards or fiber routes added.
  A concurrent save-state update ede71e4 reached main during publication; merged it intact,
  retaining both change-log entries. No force push or manual game-source edits.
  Further concurrent objective clarification564f000 also merged intact before main publication.
- **Checks:** Originals and comparison visually inspected; all 10 focused model/checklist
  tests and the full test suite pass; whitespace check clean. No new app render/live geometry claimed.
  After preserving ede71e4, full suite rerun: **360 pass, 0 fail**.
  Final combined suite after564f000: **366 pass, 0 fail**; dist matches main exactly.
- **Next:** Identify dated/scale-bearing ETU/flight enclosure and installed board/optics
  photos before claiming exact reconstruction. Archive current asset before any replacement.

### 2026-10-19: Explicit neutralization goals and live-hostile progress
- **Signed:** Codex (OpenAI).
- **Commit:** `Clarify Swarmfall neutralization objectives`.
- **What changed:** tower/jammer goals now explicitly say “Neutralize every … (destroy or
  capture)” in briefings and live/debrief presentation. Progress counts live native targets
  and says “N hostile remaining”. Converted defenses satisfy the goal; an enemy retaking
  them makes them outstanding again. Stars still finalize on extraction.
- **Compatibility:** retains the existing `destroyType` key and its conversion-compatible
  meaning. Shared text clarifies old checkpoint wording without mutating battle data or
  changing mission identity/checkpoint schema. No weapon/jammer/capture balance changes.
- **Checks:** **366 tests pass**, including six new rule tests covering campaign wording,
  real combat kills and zone conversion/retaking for both targets, legacy reload, final-state
  stars and loss/alarm/time/recovery boundaries. Isolated fixtures defer reinforcements/weather;
  they do not prove whole-mission quiet-route balance. Evidence:
  `research/swarmfall-objective-rules-2026-10-19/README.md`.
- **Preservation:** previous runtime/coverage files and dated historical picture under
  `archive/swarmfall-objective-rules-2026-10-19/`, tag on `ede71e4`. All assets and task IDs kept.
- **Previous release / open:** SAVE-04 `ede71e4` deployed successfully; live build and command
  module verified. OBJ-08 checked/signed Codex. Browser access was previously blocked and
  not retried; actual desktop/touch/visual and human balance checks remain open.

### 2026-10-19: Retain command intent while resuming safely paused
- **Signed:** Codex (OpenAI).
- **Commit:** `Preserve Swarmfall command state across resume`.
- **What changed:** optional version-1 command metadata on checkpoint v3 retains active/
  inbound squad selection, camera, draft payload and open/closed drop panel. Restore starts
  paused at 1× with the HUD shown. Landing coordinates/gesture/cached authorization are not
  saved; a restored panel computes a fresh preview and requires an explicit launch. Existing
  orders and paid wave cargo remain battle-owned. Steppers respect the existing 44/type cap.
- **Compatibility:** absent/future/malformed optional UI metadata falls back without dropping
  a valid battle. Invalid/locked draft types and unavailable squad references are filtered;
  empty/zero and over-budget drafts are preserved safely. Existing v1/v2 fixtures migrate.
- **Checks:** **360 tests pass**, including seven new plain-state tests and two actual Resume
  entry-point tests with DOM/renderer stand-ins. Selection/payload/camera/pause/panel round
  trips, old fixtures, sibling-release boundaries and no stale launch/charge are covered.
  Evidence: `research/swarmfall-command-resume-2026-10-19/README.md`.
- **Preservation:** exact prior main/checkpoint/UI test plus a dated historical mission picture
  under `archive/swarmfall-command-resume-2026-10-19/`, tag on `0fc30b7`. Concurrent Ocellus
  research was fast-forwarded first. All source assets, kit drafts and task IDs retained.
- **Checklist / open:** SAVE-04 checked/signed Codex. Browser access was previously blocked
  and not retried; actual browser/touch/device reload and storage-fault acceptance remain
  SAVE-03/SAVE-06. City-bound checkpoint identity remains SAVE-05 after CITY contracts.

### 2026-10-19: Ocellus hardware-photo and reuse evidence audit
- **Signed:** Codex (OpenAI).
- **Commit:** Record inspected Ocellus and SQRLi hardware evidence.
- **Scope:** Research only. Original NASA SQRLi2024 six-slide review inspected, source
  slides1/4 and embedded hardware/CAD images retained. NASA Optics2023 p13 explicitly
  identified Ocellus packaging CAD saved; ERAU real digitizer-test photo saved/credited.
- **Findings:** Stronger sister-project MEB qualification relationship, not identical flight
  packaging. SQRLi exposed optical hardware/FOV differs; digitizer largely occluded. No
  identified complete Ocellus flight-box photo; no source colors/hidden boards copied.
- **Model:** No mesh, app behavior or physics changes; no replacement archive needed.
  MIMU family assets preserved. #05 unchecked/count19. Labeled approximation question
  presented to owner; no answer assumed. Sources/index/compendium/README/handoff reconciled.
- **Preservation:** Clean isolated worktree fast-forwarded to published81177ed; no separate
  game edits. Original PDF/PPTX outside Git, relevant unaltered source imagery retained.
- **Checks:** 10 focused navigation-model/checklist tests pass; diff check clean. Originals
  and source-gap comparison visually inspected. No new app render claimed for research only.

### 2026-10-19: Protected save recovery and downloadable originals
- **Signed:** Codex (OpenAI).
- **Commit:** `Add protected Swarmfall save recovery and export`.
- **What changed:** title-screen Save files dialog exports in-memory sessions, exact original
  saved strings and preserved browser backups. Unsupported/damaged files show a visible notice
  and block replacement until confirmed recovery/fresh start. Readable campaign progress can
  be recovered without its damaged battle. Supported v1/v2 migration remains available.
- **Preservation:** reading never writes; protected originals are verified in a separate
  browser backup before recovery, legacy migration or reset. Backup failures refuse replacement;
  failed final writes retain the primary/backup. Observed another-tab changes refuse overwrite.
  Storage denial offers explicit temporary play and read retry. Reset adopts fresh in-memory
  state only after its write succeeds. Invalid/inherited unlock types are ignored safely.
- **Checks:** **351 tests pass**, including 12 storage/data and seven actual entry-point wiring
  tests with DOM/Blob/storage stand-ins. They cover real legacy fixtures, exact export bytes,
  confirm/cancel, blocked downloads, quota/write failures, backup collisions, settled missions, access retry,
  cross-tab conflict and unchanged campaign totals. Evidence:
  `research/swarmfall-save-recovery-2026-10-19/README.md`.
- **Archive:** exact prior UI/campaign files and dated historical mission picture under
  `archive/swarmfall-save-recovery-2026-10-19/`, tag on `e6bb497`. Concurrent publication records
  `ac2ba15/e6bb497` were fast-forwarded before starting. All assets, kit drafts and task IDs kept.
- **Checklist / open:** SAVE-02 checked/signed Codex. Browser backups share local quota;
  download an external copy. File import is future work. Browser access was previously blocked
  and not retried; native downloads, focus/touch/phone and real storage faults remain under
  SAVE-03/SAVE-06. No game balance, drone landing or lab-art changes.

### 2026-10-19: Validate checkpoint rules and references before resuming
- **Signed:** Codex (OpenAI).
- **Commit:** `Harden Swarmfall checkpoint validation`.
- **What changed:** resumed missions now require bounded JSON data, complete counters/flags,
  valid unit classes/ownership/combat fields, real squad/zone/objective references, consistent
  sibling pod clocks/cargo/slots and valid strikes/hazard internals. Reject nonfinite Hold
  fields before legacy cloning can hide them. All validation is read-only and leaves the
  surrounding campaign progress intact. Checkpoint v3 and existing v1/v2 migrations remain.
- **Compatibility:** destroyed attack targets remain legal for retargeting; converted
  structures retain ownership; released backshells can expire independently. No new unit,
  art, battle balance or interface changes. Recovery limits are estimates above normal saves.
- **Checks:** **325 tests pass**, including eleven new validation tests. The focused set has
  41 passing save/drop/victory tests; all seven planets validate through 220 simulated seconds
  of weather and supported artillery/lightning. Eight invalid examples accepted by the prior
  production validator are rejected now. Evidence: `research/swarmfall-checkpoint-validation-2026-10-19/`.
  Before publication, merged concurrent simulator work `9e647ba`; the combined **332 tests pass**.
  Both implementations, signed entries and archive-index rows are preserved.
- **Preservation:** exact prior validator/test and dated historical mission picture under
  `archive/swarmfall-checkpoint-validation-2026-10-19/`, tag on `cf4c866`. Original assets,
  unfinished kit work and every existing checklist ID are retained. SAVE-01 checked/signed.
- **Open / next:** SAVE-02 recovery explanation/backup/export and SAVE-03 browser storage-fault
  acceptance remain open, along with pod/victory/lab visual and device checks. Browser access
  was previously blocked and was not retried. Flight clearance/routes follow save reliability.

### 2026-10-19: Photo-referenced MIMU family assets and nominal Ocellus envelopes
- **Signed:** Codex (OpenAI).
- **Commit:** Add photo-referenced MIMU family assets and Ocellus dimension study.
- **What changed:** Two old IMU cubes replaced with ribbed Honeywell space MIMU FAMILY
  models, shallow rounded removable caps, side covers, external connector shells/flanges.
  Four unit inspection entries plus separately selectable estimated support shelf; independent
  casing/cover/mount/interface masks. Two lidar boxes now retain NASA's nominal 2023 MEB/FEB
  design envelopes. Original number 05/thermal zone retained. No physics constants changed.
- **Evidence/limits:** Real supplier hardware image and both June 2026 datasheet pages
  inspected/saved, exploded image labeled CAD. NASA/APL Uranus appendix pp184-185 links MIMU
  to Dragonfly, not exact flight variant/options/install. Family upper-envelope scale,
  exterior proportions/support/coordinates [EST]; Ocellus housings NOT photo-matched. No
  hidden boards/gyros/optics/connector pins/flight harness invented. #05 unchecked, count19/24.
- **Fit:** All four units clear each other and rebuilt neighbors at source-envelope scale;
  legacy IMU/FEB overlaps resolved without moving/shrinking completed parts. Estimated shelf
  intentionally contacts bases; not asserted flight mounting. No supplier mass/power imported.
- **Archive:** Original blocks/UI/pictures, central-flat/upright rejected poses, pre-MIMU
  dimension study and shelf-focus draft retained with restore instructions. Baseline/tag
  `archive/nose-electronics-2026-10-19` on `cf4c866`. Real/CAD/model comparisons credited
  separately; source index, assumptions, checklist/handoff/architecture updated together.
- **Checks:** 321 tests pass (seven focused new tests); 30 Edge/WebGL selector checks across
  Internal/Thermal and 1440/390/360 px. Four angles per layer nonblank/framed, no page errors
  or horizontal overflow. Envelopes, independent masks/anchors, rebuilt-neighbor clearance,
  omitted internals and unchanged completion count tested. Published model commit `9e647ba`;
  Pages run39301658664 succeeded. Public Edge checks passed at 1440/390/360 px, stamped module,
  five selectors, source links, cover masks/restore across both views and Pilot return; no
  page/network errors or overflow. Dated live JSON/screenshots saved in the part research folder.
- **Next:** Find current Ocellus hardware photos; SQRLi/SpaceCube leads do not establish
  identical housings/boards. Seek mission-specific MIMU variant/dimensions/install. Already
  published game work preserved; no game source edits. Other open parts #03/#09/#20/#21.

### 2026-10-19: Smoke, fire and embers on lab destruction previews
- **Signed:** Codex (OpenAI).
- **Commit:** `Add smoke and fire to lab destruction previews`.
- **What changed:** all five city studies now emit animated procedural smoke, flame tongues,
  embers and bounded warm firelight from real clipped fracture geometry. Damaged / Major
  destruction / Ruins have distinct activity levels. Compatible individual architecture
  assets also offer destruction previews. Added independent smoke/fire controls, effect
  pause, reduced-motion startup, shareable options and High/Light budgets. Intact assets,
  source credits, terrain, foundation history and campaign saves are retained.
- **Preservation:** exact previous lab/damage files and a dated historical October 17
  picture are in `archive/lab-aftermath-2026-10-19/`; tag of the same name on `f1ad919`.
- **Checks:** **314/314 repository tests pass**, including eight new aftermath tests.
  The offline geometry probe confirms usable
  sites across all 15 real city/stage combinations and 11 individual architecture assets.
  Full test output and scope are recorded in
  `research/lab-aftermath-2026-10-19/README.md`; shader checks are static contracts, not GPU rendering.
- **Assumptions / open:** invented visual aftermath, not physical fire or gameplay burning.
  No image-generation service or downloaded VFX art used. Browser access was blocked; visual,
  shader/GPU, desktop/touch and real-phone acceptance remain FX-06. Weapon/explosion sound,
  combat effects, spreading fire and campaign integration remain future checklist work.

### 2026-10-19: Continue capturing or claim victory, with one-time result settlement
- **Signed:** Codex (OpenAI)
- **Commit:** Offer victory extraction and settle mission results once.
- **What changed:** Required captures earn persisted victory eligibility instead of ending
  the battle. A paused choice offers Leave for victory or Continue capturing. Continuing
  retains an extraction action and remaining-zone count; the prompt is not repeated. Eligibility
  survives retaken zones, but total defeat can still lose. Stars/time goals finalize on exit.
  Survivors refund half cost and unreleased pod cargo is cancelled/refunded once.
- **Persistence:** Each UI attempt has a unique ID; deterministic rule simulations accept an
  injected ID. Progress v2 stores a settlement ledger; mission v3 saves eligibility/choice.
  Real v1/v2 mission and v1 campaign fixtures migrate without losing paid cargo or old conquests.
  Result totals/ledger and the cleared active checkpoint commit in one storage write, immediately
  rather than after a debrief delay. Failed writes retain old disk data, show a retry action and
  keep retrying the in-memory result while the page stays open. Duplicate settlement adds nothing.
- **Owner steering:** Dragonfly remains the only landed drilling unit; all other current drones
  remain airborne. Added DRONE-10 for a later small drill specialist and landed-harvest balance;
  no new unit or extraction-rate buff. Clarified the environment matrix's Visual review meaning.
- **Preservation:** Exact previous automatic-win behavior/UI/checkpoint/campaign/tests under
  `archive/swarmfall-victory-choice-2026-10-19/`, tag on `5b05c32`. Existing assets/kit drafts
  retained. Also added a bounded center fallback for edge-selected multi-pod landing previews.
- **Checks:** **306 tests passed**, including eligibility, continued play, retaken zones, defeat, final stars/time,
  recall/cargo refunds, reload/ledger/replay and failed-write/retry tests. Source/build checks
  and full-suite results are recorded in `research/swarmfall-design-2026-10-19/victory-test-results.txt`.
  Browser policy blocked the local preview, so visual/touch/phone acceptance remains open.
- **Previous release verified:** Multi-pod/Clean view `5b05c32` passed GitHub Pages deployment;
  the public HTML build and stamped drop import were verified. Source receipt in the design folder.
- **Checklist:** Completed OBJ-09/10/11, TECH-03 (current schemas) and TEST-07 signed Codex.
  Broad OBJ-07, UI/device review and SAVE-03 browser fault injection remain explicitly open.
- **Open / next:** Visual review of pods/Clean view/victory, then flight clearance and ground
  routes. Real imported-city battle integration, the drill drone and upgraded effects remain future work.

### 2026-10-19: Multi-pod squad waves, checkpoint migration and Clean view
- **Signed:** Codex (OpenAI)
- **Commit:** Deliver multi-pod squad waves and clean battlefield view.
- **What changed:** Split new deliveries into deterministic 1–3 drone pods (Dragonflies solo)
  with stable wave/pod IDs, one squad, one cost/cooldown and distinct wave/pod counts. Preview
  spaced courts before launch; reject water, steep/bounded/occupied/blocked courts without
  charging. Support orders before/between arrivals and dynamic rendering beyond three pods.
  Current generated terrain pads now agree with the land query used by drop/ground rules.
- **Saves:** Mission checkpoint v2 migrates real v1 saves, retaining already paid whole-squad
  legacy pods. Persists placement, stagger, release flags and incoming orders; validates IDs,
  payloads, timers and references. Campaign progress stays version 1; broader campaign schema
  migration remains TECH-03 work. New wave purchases are checkpointed immediately.
- **Interface:** Added Clean view (V; Escape/restore button to exit) for HUD panels, minimap,
  toasts and battlefield text; kept R/F camera pitch. Drop controls/end-of-mission restore HUD.
  Fixed the lingering drop panel/placement hint under debrief. Clearer inbound squad counts.
- **Checklist:** Codex signatures on completed DROP-02/03/05/07 and TEST-06. DROP-01/04/06/08
  and CTRL-13 retain browser acceptance notes. Renamed the environment matrix's approval column
  to Visual review and explained that it is not a permission gate. Added owner FX-01–04 for
  future weapon sound, animated explosions, smoke/fire, licensed assets and effect budgets.
- **Preservation:** Exact original code/tests in `archive/swarmfall-drop-waves-2026-10-19/`,
  baseline/tag `f122c36`; dated historical game picture reused with its original date. A real
  v1 mid-descent fixture was generated before editing. All unrelated kit/assets remain intact.
- **Checks:** All **291 tests passed**; focused wave/checkpoint scenarios and real Three.js scene with a stand-in
  renderer: 15 visible pods/44 payload bodies, no hidden excess pods, disposal and reload.
  Full-suite log: `research/swarmfall-design-2026-10-19/drop-wave-test-results.txt`.
  Syntax/diff checks before push; public stamped-file verification follows deployment.
  Browser tooling rejected local preview access; no visual, touch or phone review is claimed.
- **Open / next:** Browser acceptance of waves/Clean view; victory versus continue (OBJ-07)
  with one-time settlement and compatible saves. Imported cities still need authored collision.

### 2026-10-19: Extensive Swarmfall priorities, drone identity and free-roam planet design
- **Signed:** Codex (OpenAI)
- **Commit:** Record Swarmfall priorities and free-roam design.
- **What changed:** Expanded the master checklist to 296 unique tracked tasks across 35
  numbered sections, retaining all 129 previous task IDs and adding 167 detailed tasks.
  Added ordered milestones, acceptance gates, a per-environment readiness matrix and current
  implementation status. Multiple pods and victory/continue remain first; campaign pilot,
  local destruction, playable cities and builder requests remain explicit.
- **Design additions:** Researched seven RTS/construction references through official or
  publisher material. Added proposed scouting/relay/electronic warfare, drone recovery,
  pod reuse, squad cooperation, space operations and useful sensory feedback. Designed a
  separate persistent free-roam mode: first three connected regions on one planet, capture
  and return travel, saved world changes and a measured graphics/streaming plan. These are
  candidates and milestones, not implemented game features or promised photorealism.
- **Preservation:** Saved the complete previous checklist in
  `archive/swarmfall-checklist-2026-10-19/`, with baseline and restore instructions; added its
  archive index entry. Old requests, source references, downloaded assets, previous art and
  unfinished modular-kit work are retained. No runtime code, assets or saves changed.
- **Status reconciliation:** Corrected stale local-only lab and prior aft-bulkhead failure
  notes. The last game/lab release baseline is fb2e5b6 (October 17; 270 tests at that release).
  Fetched remote main 9f3fea1; its two newer simulator part-22 commits do not change the game
  or its tests and are separate from this documentation-only work.
- **Files:** SWARMFALL-TODO.md, README, this log, archive index/snapshot/readme,
  `research/swarmfall-design-2026-10-19/README.md`, city integration status header.
- **Checks:** Task-ID uniqueness and preservation, explicit task references, local document
  links, archived checklist versus its tracked baseline, and `git diff --check`. No new full
  application test run is claimed for these Markdown-only changes. Reference research was a
  documentation review, not an installed-game playtest.
- **Open / next:** DROP-01 through DROP-08 and OBJ-07/09/10/11 with compatible checkpoints;
  then reliable commands, one playable district and the gated free-roam/drone experiments.
### 2026-10-19: Provisional nose-panel study with real/CAD/process comparison
- **Signed:** Codex (OpenAI)
- **Commit:** Improve provisional nose panel and record real CAD model comparison
- **What changed:** Assessed next unfinished part 03; real 2026 integration/structure photos
  inform finish and joints, not a complete nose-face reconstruction. Replaced the block
  with a thin face representation, perimeter returns, mounting feet, joint fasteners and
  separately removable inspection groups. Preserved original part ID, center, width/height,
  thermal zone and neighboring parts. Label anchor now sits on the upper perimeter.
- **Assumptions:** All dimensions/details remain [EST]. No hidden core/layup, apertures or
  electronics invented. Removing the face does not assert a real hatch or hollow panel.
  #03 stays unchecked and the completed count remains 19/24 (4 Codex, 15 Claude).
- **Sources/samples:** Credited original NASA/APL September harness and July suspended-test
  photos saved; separately labeled APL 2024/ICES-2023 CAD compared with actual WebGL closed,
  rear and face-hidden samples in `research/nose-bulkhead-2026-10-19/`. No image generation.
- **Archive:** Old builder/UI and before pictures saved in `archive/nose-bulkhead-2026-10-19/`;
  restore tag on `9f3fea1`. Source index, checklist/handoff, README, architecture, compendium
  and expandable app assumptions updated together. Separate game/city work untouched.
- **Checks:** 278 Node tests pass, including five focused panel tests, rebuilt-neighbor
  clearances and unchanged completion count. Edge/WebGL Internal/Thermal at 1440/390/360 px
  and four raw angles: framed nonblank pixels, no page errors or horizontal overflow.
- **Open / next:** Identify unobscured nose-face hardware and a reliable scale before
  checking off #03 or adding structural apertures. #05/#09/#20/#21 remain independent
  research tasks. Include real/CAD/process images with future part updates.

### 2026-10-18: Complete part 22 with the approved labeled METHAN approximation
- **Signed:** Codex (OpenAI)
- **Commit:** Complete part 22 with approved METHAN design approximation
- **Owner decision:** "Build a labeled approximation" after the hardware-photo search.
- **What changed:** Replaced the last part-22 placeholder with a chamfered cold-cell frame,
  removable metal-felt filter covers, supports, fiber feedthrough and short jacketed entry.
  The split between exterior cell and warm DPU sources/detectors follows Lorenz et al.,
  IPM 2025 pp. 184-185. Diagram outline only; all METHAN sizes, finish, filter layout,
  detailed fittings and installation remain [EST], explicitly NOT photo-matched hardware.
  No hidden mirrors, optical path or DPU electronics invented. EFIELD geometry unchanged.
- **Inspection:** Publishes the prior feature-branch checkpoint too: separately focus Front
  EFIELD, Rear EFIELD or METHAN (design estimate), same component ID 22, independent layers
  and draw-time visibility restoration. No flight, science, power or thermal constants changed.
- **Records:** Initial #22 asset pass checked off; current count 19/24 (4 Codex, 15 Claude).
  Real hardware/exact-dimension follow-ups stay open. Component text, expandable assumptions,
  source list, README, architecture and handoff updated together.
- **Archive:** Previous exact module/UI/test, all subassembly views, banded-texture draft and
  rectangular-frame draft retained under `archive/methan-placeholder-2026-10-18/`; tag on
  `e133dbf`. Sources, parameter table and comparison in `research/methan-2026-10-18/`.
- **Checks:** 273 Node tests pass. Real Edge/WebGL checks at 1440/390/360 px, both layers,
  all subassemblies/four angles; nonblank framed pixels, no browser errors or page overflow.
  Rebuilt-neighbor/rotor clearances, skin mounting, cavity/filter/fiber construction, labels,
  masks and completion counts tested. Visual comparison refined the frame/texture before release.
- **Open / next:** Obtain actual METHAN photos and flight dimensions when available. Keep
  the exception limited to this approved model; preserve the normal real-photo-first rule.
  Other incomplete numbered parts remain on the checklist. Other chat's city/game files untouched.

### 2026-10-18: Inspect individual part-22 probes and record the METHAN reference gap
- **Signed:** Codex (OpenAI)
- **Commit:** Inspect individual part-22 probes and record METHAN reference gap
- **Release:** Checkpoint on `codex/dragonfly-nose-sensors-publish`; not merged to main or published to the app.
- **What changed:** Both EFIELD assemblies existed already. Added a compact Subassembly menu
  to focus/temporarily isolate Front EFIELD, Rear EFIELD or the provisional METHAN housing.
  Retained component number 22; its anchor follows selected hardware. Selection resets on
  component change, camera reset or Follow sampling, persists across Internal/Thermal, and
  does not leak visibility changes into ordinary views or after a failed render. No geometry,
  flight or thermal constants changed. Shortened the part's selector label to fit phone width.
- **Research:** Lorenz et al., IPM 2025 pp. 184-185 identifies the cold mirrored gas cell,
  dust filtration and fiber connection through foam to the warm DPU light engine. Saved
  original pages and the poster index with credits. Reviewed primary sources do not establish
  a photo-matched METHAN casing; awaiting owner's choice about a labeled approximation.
- **Checks:** 272 Node tests pass; real Edge/WebGL checks at 1440/390/360 px, Internal/Thermal,
  and all three subassemblies at four angles. No page errors or horizontal overflow.
- **Archive:** exact prior files and screenshots at `archive/part22-inspection-2026-10-18/`;
  restore tag on published baseline `fb2e5b6`. Old EFIELD geometry is unchanged.
- **Open / next:** #22 remains partial, 18/24 total. Preserve the real-photo-first rule and
  do not call the placeholder or CAD photo-matched. New evidence/handoff in
  `research/part22-2026-10-18/README.md`. Shared city work left untouched.

### 2026-10-17: Publish the Asset and Environment Lab with individual model inspection
- **Signed:** Codex (OpenAI)
- **Commit:** Publish Asset and Environment Lab with asset inspection
- **What changed:** Renamed the lab to Asset & Environment Lab, retained the five environments
  and destruction controls, and added an Assets mode with 18 bundled models: four game drones,
  five urban buildings/props and nine fantasy pieces. Grouped selector, creator/license links,
  fit-to-view inspection stand/cameras and turntable. Added a game-title link and release build
  stamp; existing environment URLs and historical versions remain available.
- **Files:** asset-viewer.mjs, lab UI/styles/loader, game index, Pages workflow, three inspector
  tests, README/checklist/credits. Release also includes the preceding Houdini terrain and
  progressive destruction work, their scripts, reports and tests.
- **Assumptions:** Inspection display scale is normalized, not a physical size claim. The lab
  remains an art/testing area separate from campaign saves. Source licenses retained; local
  editable authoring caches and unfinished modular-kit work are excluded from publication.
- **Checks:** Asset catalog dependencies, geometry framing and all four drone previews tested;
  full project suite and local browser review before push. GitHub Pages runs the suite again
  and stamps the deployed build; public verification is performed after deployment.
- **Public URL:** https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/
- **Release coordination:** Main advanced to the independently published EFIELD update
  `7d62738` during preparation. Merged it without overwriting simulator changes; retained both
  change-log sections and every archive-table entry. Reran the combined test suite before push.
- **Open / next:** Multiple parachutes (DROP-01); gameplay collision and damage integration.

### 2026-10-17: Review game integration and draw progressive destruction for all five cities
- **Signed:** Codex (OpenAI)
- **Commit:** Uncommitted local work; no push or deployment.
- **What changed:** Added Intact, Damaged, Major destruction and Ruins comparisons to Alien
  arcology, Metropolis, Tidal citadel, Skyway megacity and Phototextured city. Derivative meshes
  clip the actual architecture, cap solid broken sections and add rods/settled roof and facade
  rubble. Group roof ornaments with supporting towers; avoid caps spanning open transit rings.
  Landscape, ocean, natural rock and citadel terraces are protected; original sources retained.
  Reviewed current terrain, movement, combat, loading, zone placement and checkpoint code;
  recorded a concrete district-first game integration plan and measured current GLB budgets.
- **Files:** Environment Lab controls/styles/loader/world metadata, new `city-damage.mjs`,
  `tests/invasion-city-damage.test.mjs`, GAME-INTEGRATION.md, README, checklist and credits.
- **Assumptions:** Invented art stages and heuristic structural families [EST]. These are
  code-authored browser 3D variants, not newly saved Houdini damage scenes or collapse physics.
  Game rules, campaign saves and pod/parachute behavior are unchanged.
- **Checks:** 263 Node tests passed; syntax checks passed. All five Major destruction views
  inspected in the browser; alien Ruins also inspected. Screenshots saved under research.
- **Open / next:** Owner art review; finer facade/bridge/ornament/debris cleanup (ENV-06),
  campaign environment integration (VIS-18), weapon-triggered local damage/collision/saves
  (ENV-01 through ENV-04). Multiple pods of 1–3 drones per pod (DROP-01) remain the requested
  next gameplay pass. Houdini terrain art review remains open under VIS-16.

### 2026-10-16: Implement Blender underside-fitted city foundations
- **Signed:** Codex (OpenAI)
- **Commit:** Implement Blender raycast foundations on the preferred low coast
- **What changed:** Downloaded and verified official portable Blender 4.5.14 LTS and the
  signed SideFX Launcher 22.0.466. Used Blender to author a reusable Geometry Nodes Raycast
  setup and bake fitted structural support under actual city undersides. Kept the second
  coast unchanged and separately selectable; new Blender-supported test is Skyway's default.
  Joined contact cells remove internal-wall overdraw; clamp prevents support bottoms rising
  above their tops where source bases already lie below the baseline land.
- **Files:** foundation authoring/input scripts, local editable .blend and report, exported
  foundation GLB, gallery loader/comparisons/credits, README and Swarmfall checklist.
- **Assumptions:** Visual construction, normalized preview units. Selected major underside
  faces are proxies for actual support needs; no collision or structural certification.
- **Checks:** Blender evaluated 23,885 top/bottom pairs: no ray misses, no top shifts,
  bottom embed error <0.001 and underside distance <0.2. Pre-existing baseline burial is
  reported (1,012 vertices); terrain was not changed. Node suite and browser views checked.
- **Preserved:** Original coast, city, first two platform screenshots, rejected high envelope,
  first Blender prism draft and editable projects. No deletion or public deployment.
- **Open / next:** Owner visual review, classification/polish for remaining city components,
  retaining/tunnel details, collision/navigation and campaign integration. Houdini Launcher is
  downloaded to Downloads; full Houdini installation/license remains unconfirmed.

### 2026-10-16: Source-city previews, preserved foundation passes and fitting-tool shortlist
- **Signed:** Codex (OpenAI)
- **Commit:** Add source-city previews and preserve reviewed coastal foundation drafts
- **What changed:** Converted complete Cyberpunk City and drone City scenes into separate
  Skyway megacity / Phototextured city previews; restored those titles at the owner's request.
  Added coast, water, roads and foundation comparisons. Owner prefers the second low-coast
  pass, now default; the later high terrain envelope was rejected for swallowing buildings.
  Preserved all drafts, re-rendered pictures of the first two passes, and added Blender,
  Houdini and Unreal fitting-tool research as VIS-17. VIS-16 remains open for full fitted support.
  Completed six reusable library backups with provenance, hashes and inventories.
- **Files:** README, SWARMFALL-TODO, environment gallery and source GLBs, archive/environment-lab-v1,
  research/fantasy-city-2026-10-16 tooling, source receipts, conversion and foundation handoffs.
- **Assumptions:** Dimensions, terrain and support selection are visual estimates. Source
  cities normalized to 2 km; no real-world scale or structural analysis implied.
- **Checks:** Node suite and local browser previews; saved test output and screenshots in
  research/archive. Gap-only checks were insufficient for the rejected terrain, documented
  explicitly so future fitting must also check burial. No public deployment in this continuation.
- **Open / next:** Finish underside-aware fitting with bounded land contours and separate
  foundations. Keep coast low, preserve bridges, inspect all districts. Hidden Alley conversion,
  space/alien queue, collision/navigation/streaming, pilot campaign and destruction remain open.
  Claude's unfinished kit expansion remains untouched. Original downloads/source scenes retained.

### 2026-10-16: Swarmfall Environment Lab, first version (Codex)
- **Signed:** Codex (OpenAI), the work; recorded by Claude (Anthropic Claude Opus 5.5), because
  Codex reached its usage limit before logging or committing it.
- **Commit:** "Add Codex's Swarmfall Environment Lab and city research"
- **What changed:** At the owner's request for links to environment tests, a separate gallery at
  `dist/invasion/environments/` with three visual studies: Alien arcology (original procedural
  towers, rings, bridges), Metropolis (five Quaternius Downtown City MegaKit models, CC0, with
  textures reduced to 512 px, on an original street grid) and Tidal citadel (Kenney Fantasy Town
  Kit wall pieces, CC0, in original terraces and spires). Orbit, pilot, flyover and dusk
  controls; a light render mode; phone layout. Unchanged three.js r180 addons (GLTFLoader,
  OrbitControls, BufferGeometryUtils, MIT) added under `dist/vendor/three/addons/`. Codex's city
  research, asset catalog scripts and the extracted Kenney kit are in
  `research/fantasy-city-2026-10-16/`; the large source backups stay in the owner's local
  `Documents/Game Asset Library`.
- **Assumptions:** all compositions are invented visual studies with no collision or game rules.
- **Files:** `dist/invasion/environments/`, `dist/vendor/three/addons/`, `dist/vendor/three/README.md`,
  `research/fantasy-city-2026-10-16/`, `.gitignore` (keeps the duplicate Kenney zip and the
  three.js npm package local), `SWARMFALL-TODO.md`
- **Checks (Claude's review):** all 248 tests pass with these files; licenses in the asset
  folders read CC0; each test loads with no console errors.
- **Open / next:** Claude's expansion of the lab follows in the next entry.
### 2026-10-17: Rebuild the two EFIELD probes from engineering-model photographs
- **Signed:** Codex (OpenAI)
- **Commit:** Rebuild EFIELD probes from published engineering-model references
- **What changed:** Part 22 now includes both fixed EFIELD assemblies, following Seese et al.,
  IPM 2025's real hardware photo and published 30 cm carbon stalk / 5 cm gold electrode sizes.
  Front upper starboard and rear lower port locations follow the paper; exact mounts, preamp
  envelopes, pointing and harness stubs remain [EST]. TEMP/MICRO are co-mounted as photographed.
  Independent inspection groups and a front-preamp label anchor preserve the layer workflow.
  METHAN remains the old unverified box; #22 stays unchecked and count stays 18/24.
- **Sources/archive:** Original page images, credit, model comparison and handoff in
  `research/nose-sensors-2026-10-17/`; baseline `eed63b1` and the rejected overlapping mount
  draft preserved in `archive/nose-sensors-2026-10-17/`. Matching archive tag on baseline.
- **Files:** new `dist/nose-sensors.mjs`, research-model integration, component/reference and
  assumptions text, focused tests, source index, README, architecture, research and checklist.
- **Checks:** All 252 Node tests pass. Desktop/390/360 px WebGL views and four-angle
  Internal/Thermal screenshots are nonblank, framed and error-free. Focused tests cover
  published dimensions, stable label, independent layers, rebuilt-part and rotor clearance.
- **Scope:** No flight/thermal constants or other parts changed. Work isolated from the
  shared checkout's unpublished city commits and dirty files; those remain untouched.
- **Open / next:** Find a real METHAN hardware photo and scale reference. No hidden preamp
  electronics or final-flight fit claims. Check public deployment against the new commit.

### 2026-10-16: Close out Claude's aft bulkhead and publish inspection layers
- **Signed:** Claude (Anthropic Claude Opus 5.5), geometry; Codex (OpenAI), verification,
  archive, documentation and release closeout.
- **Commit:** "Complete Claude's aft bulkhead and independent inspection layers"
- **What changed:** Preserved Claude's gold-colored aft panel, pocketed rim, ribbed generator
  interface, estimated 25-degree aft/up MMRTG, matching aft foam, forward fans and short collar.
  NASA/APL's July caption explicitly confirms the test structure was inverted. A full-resolution
  photo, credits and model comparison are saved. Updated component sources/assumptions and the
  checklist to 18 of 24 (3 Codex, 15 Claude). Inspection controls from the earlier local entry
  are included in this release; that entry's pending #16 status is superseded here.
- **Assumptions:** Real photos inform appearance; CAD cross-checks orientation/layout only.
  Angle, sizes, coating, final flight configuration and gas passage remain estimated/unknown.
  No invented opening, hidden generator channel, new physics or thermal constants. No imagegen.
- **Archive:** Previous panel, level generator, aft body and fan layout saved with exact originals,
  before pictures and restore guides at `archive/aft-bulkhead-2026-10-15/` and
  `archive/fans-v1-2026-10-15/`; tags at `f216162`. Inspection baseline/tag at `8b2399b`.
  Unpublished draft retained separately. Claude retains part #16 checklist credit.
- **Checks:** All 248 Node tests; source/checklist attribution and counts; installed and isolated
  Internal/Thermal at four angles, 1440/390/360 px, rendered-pixel framing and no script errors.
  New-to-new clearance uses the tilted plate frame; the adapter has 2 mm model clearance.
- **Next:** Parts 03, 05, 09 and 20-22 remain open. Choose a clear real hardware reference;
  retain construction-layer and far-side label follow-ups. Unrelated pending game/city files
  and their new change-log entries are excluded from this simulator commit.

### 2026-10-16: Refine the city shortlist toward intricate editable scenes
- **Signed:** Codex (OpenAI)
- **What changed:** Recorded the owner's higher complexity target and why Elven Realm reads
  as elaborate. Added a separate shortlist of complete city scenes and a reusable architecture
  inventory, with inspected previews for cyberpunk City, drone City, City 1 and Elven Realm.
  Added VIS-12 and revised the earlier basic-kit ranking's status.
- **Sources / limits:** CC0/CC-BY sources distinguished from paid examples, noncommercial
  assets, license-conflicted listings and inaccessible downloads. No source scene imported yet.
- **Files:** `research/fantasy-city-2026-10-16/COMPLEX-SCENES.md`, research index/previews,
  `SWARMFALL-TODO.md`, `CHANGELOG.md`.
- **Checks:** Creator descriptions, licenses and available previews reviewed; documentation
  only. Exact archive license versions/content still need validation before runtime integration.

### 2026-10-16: Compare city references, shortlist reusable assets and plan destruction
- **Signed:** Codex (OpenAI)
- **What changed:** Researched all owner references: Skyrim, non-blocky Minecraft megacity
  scale, Spider-Man, Crackdown/Crackdown 3 destruction, Kakarot world map/West City/destruction,
  and elven/fantasy cities. Saved and visually inspected six reference screenshots (including
  Kakarot's official map/city images), ranked nine reusable asset options with license/access
  limits, and downloaded Kenney's unchanged CC0 Fantasy Town Kit archive for evaluation.
  Added VIS-11 city implementation and ENV destruction tasks to the Swarmfall checklist.
- **Sources / limits:** Crackdown 3's full cloud destruction is specifically Wrecking Zone;
  Kakarot's official destruction description does not prove citywide persistent collapse.
  Free subsets, paid licenses, UE-only assets and texture exceptions are distinguished.
- **Files:** `research/fantasy-city-2026-10-16/`, `SWARMFALL-TODO.md`, `CHANGELOG.md`
- **Checks:** Source links, creator licenses and saved images reviewed; documentation only.
  No runtime city or destruction system implemented, no paid purchase and no game files ripped.
- **Next:** VIS-11, then ENV-01 through ENV-04 in measured stages.

### 2026-10-16: Finish independent inspection layer controls and review the pending bulkhead
- **Signed:** Codex (OpenAI)
- **What changed:** Compact expandable Inspection layers controls for body/attic shells,
  existing foam, compartment panels and flow markers; per-component casings, covers, mounts,
  interfaces and harnesses. Component choices are retained and marked in the menu. Restore
  Layers keeps the camera; camera reset restores all layers. Masks are restored after every
  draw, including errors, and hidden hardware keeps its original number without a marker.
- **Review:** Claude's battery, rotor heads, pilot zoom and label fixes are committed. The
  local aft-bulkhead draft is still unfinished. Its adapter's actual 2 mm clearance was
  rejected by a test that expanded a bounding box twice; the corrected test uses mesh vertices
  in the plate frame. No geometry was moved. Source qualifications and completion tasks recorded.
- **Assumptions:** Existing geometry only; body/attic skins and foam are not separated into
  a verified construction stack. Removing cases does not reconstruct undisclosed internals.
  #16 remains unchecked and the completed count stays 17; no publication in this continuation.
- **Files:** `inspection-visibility.mjs` (new), inspector state/UI, Mission renderer, HTML/CSS,
  relevant tests, README, architecture, checklist, research/archives.
- **Archive:** `archive/inspection-visibility-2026-10-16/` with code, screenshots and local
  tag at `8b2399b`; unpublished bulkhead review draft retained separately.
- **Checks:** All 248 Node tests pass, including new mask independence, framing, identity,
  unchanged state and error-cleanup cases. Edge/WebGL: four-angle Internal/Thermal screenshots,
  rendered-pixel changes, keyboard controls and 1440/390/360 px layouts, no script errors.
- **Open / next:** Complete the aft-bulkhead source/orientation, archive and app documentation;
  actual structural construction layers and far-side label occlusion remain open.

### 2026-10-16: Record the large alien/fantasy city direction
- **Signed:** Codex (OpenAI)
- **What changed:** Added VIS-10 to the Swarmfall checklist. Minecraft megacities reference
  scale and intricacy only; the owner wants a less blocky, non-voxel alien/fantasy city.
  Recorded candidate modular asset sources, district/skyline approach, license checks and
  dependencies on pilot controls, building collisions, navigation and rendering performance.
- **Files:** `SWARMFALL-TODO.md`, `CHANGELOG.md`
- **Checks:** Documentation-only; candidate pack descriptions/licenses checked on creator
  websites. No assets imported and no game behavior changed.

### 2026-10-16: Resume active Swarmfall missions and record the next campaign requests
- **Signed:** Codex (OpenAI)
- **Commit:** "Save and resume Swarmfall missions and expand campaign checklist"
- **What changed:** FIX-01 adds versioned battle checkpoints every five seconds and on page
  hiding/exit. The title offers Resume mission with the planet name. Restore rebuilds terrain
  callbacks/pads, preserves the camera and full battle state, and pauses until the player resumes.
  Campaign progress and the checkpoint use one localStorage write; finishing/resetting clears
  the checkpoint, and starting a replacement mission asks first. Storage failure shows a warning.
  Old campaign saves still load; incompatible/broken checkpoints are ignored. Added the owner's
  pilot campaign (MODE-20), later Tank Wars-style drone builder (MODE-21), optional victory
  extraction (OBJ-07) and 1–3 drones per pod/multiple-pod waves (DROP-01) to the checklist only.
- **Files:** `invasion/mission-save.mjs`, `invasion/main.mjs`, `invasion/index.html`,
  `tests/invasion-mission-save.test.mjs`, checklist, README and architecture/archive indexes.
- **Archive:** `archive/swarmfall-mission-save-2026-10-16/`: original page code, before/after
  title and restored-mission screenshots, restore instructions; baseline `8b2399b`.
- **Checks:** 245 tests pass in the current workspace, including the unrelated local interior
  tests. New tests compare uninterrupted and resumed simulations on all seven planets through
  descending pods, release, orders and hazards, plus initial cooldown and invalid saves.
  Browser reload restores Titan at 0:36, 46 matter and 9 drones, paused.
- **Open / next:** FIX-02 flight clearance; the four new owner requests remain unchecked.
  Public deployment is not verified by these local checks. Other sessions' interior files
  are excluded from this game change.

### 2026-10-16: Swarmfall update checklist
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add the Swarmfall update checklist"
- **What changed:** At the owner's request, `SWARMFALL-TODO.md` lists everything the game still
  needs: 108 open items (28 P1, 62 P2, 18 P3; 8 asked for by the owner) in 15 areas (known problems, tutorial, controls, economy, drones,
  defenders and the public, planet threats, objectives, the owner's free and versus modes, look,
  sound, performance, engineering and tests, publishing, documentation), each with an ID, a
  priority and the files involved, plus a "built so far" baseline and suggested milestones.
  Linked from README and ARCHITECTURE.md.
- **Files:** `SWARMFALL-TODO.md` (new), `README.md`, `ARCHITECTURE.md`
- **Checks:** known-problem items checked against the code and the October 15-16 browser runs.
- **Open / next:** Milestone 1 in the checklist.

### 2026-10-16: A forgiving not-found page that leads mistyped game links to the game
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Send mistyped or decorated game links to the game from a site-wide 404 page"
- **What changed:** The owner got a 404 on a phone. The game link was live and public (200 for
  a logged-out phone), but GitHub Pages is case-sensitive and exact, so `/Invasion/`, a link
  with `**` left over from a chat message, or a stray `)` all hit GitHub's generic 404. A new
  `dist/404.html` (served by Pages for any missing address) sends any address that mentions the
  game (`invasion` or `swarmfall`, any case, extra characters) to `/invasion/`, and otherwise
  shows links to the simulator and the game. The repository name itself still has to be typed
  in lowercase: GitHub answers a wrongly cased repository name before this page is reached.
- **Files:** `dist/404.html` (new), `tests/invasion-campaign.test.mjs`
- **Checks:** `node --test` on the committed tree (redirect test covers the failing addresses);
  the live site checked with phone user agents before and after.
- **Open / next:** none.

### 2026-10-15: Swarmfall, a drone invasion game built from the simulator
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add Swarmfall, a drone invasion campaign game built from the simulator"
- **What changed:** At the owner's request, a new game on its own page (`dist/invasion/`, its own
  public link once published). It reuses the Titan terrain, the arrival hardware (every drop pod
  comes down under the simulator's aeroshell and parachutes) and the research model. A campaign
  galaxy of seven planets is invaded in order: Titan is an empty practice planet, then tribal,
  agrarian, industrial (two), networked and spacefaring worlds with rising threat. Pods drop
  whole squads paid for in matter. Zones fall by damage (Strikers and Breachers, salvage, rising
  public alarm) or by control (Links capture under fire, calm the public and turn defenses).
  Alarm brings militia raids, stronger defenses and artillery. There are nine environmental
  hazards, each with a warning, and shelter in held zones. The Dragonfly is unlockable by
  recovering it on Titan. Two optional objectives per planet (stars), twelve achievements and
  saved progress. Weapons are defined per target class, ready for the owner's later
  drone-vs-drone versus mode.
- **Simulator change:** `titan-terrain.mjs` now resolves its ground texture from the module's
  own URL (same file, same result for the simulator) so the game's subfolder page finds it.
- **Assumptions:** everything in the game is a gameplay choice [EST]: the invented worlds,
  societies, drone and defender models (drawn about 4x life size for the strategy camera) and all
  numbers. Titan's terrain and the Dragonfly model are the simulator's own.
- **Files:** `dist/invasion/*` (new), `dist/titan-terrain.mjs`, `.github/workflows/pages.yml`
  (stamps the game's build label), `tests/invasion-battle.test.mjs`,
  `tests/invasion-campaign.test.mjs` (new), `README.md`, `ARCHITECTURE.md`
- **Checks:** `node --test` on the committed tree (16 new tests); a scripted bot won all seven
  planets on first tries after balance passes; played in the browser: title, galaxy, Titan drop
  under parachute, capture, Dragonfly recovery and drop, Kepra tower attack in a dust storm,
  retreat and debrief, Velm, Ashfall, Halcyon and Aurex scenes, phone layout.
- **Open / next:** real playtesting and balance (Aurex is hardest); sound; free mode with a
  galaxy to pick from; local versus mode with drone-vs-drone weapons; terrain-aware paths for
  troops (they stop at shorelines for now).

### 2026-10-15: Part numbers stay on their parts as the view turns
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Pin the part numbers to their parts and stop them jumping as the view turns"
- **What changed:** At the owner's request, the Internal/Thermal part numbers no longer chain and
  jump. Each number sits on a fixed anchor on its part's own hardware (computed once; a part with
  separated pieces is numbered on its largest piece, not the empty space between them). When
  numbers would overlap, the farther one moves to the nearest free spot around its anchor with a
  short leader line back, keeps that spot while it stays free, and eases there; the selected part
  keeps its anchor; the ALT/V/S/SPD and ROLL/PITCH/WIND readouts are kept clear; phones use
  slightly smaller circles. Clicking a number still selects its part.
- **Measured** over a full turn in 2-degree steps: jumps over 12 px 263 -> 12 (Internal), 202 -> 19
  (Thermal from above); largest 150 -> 19 px. At 390 px: 11 jumps, largest 17 px.
- **Open:** numbers for parts on the far side are still drawn like the rest (checklist item).
- **Archive:** `archive/part-labels-2026-10-15/` (tag at `f1e9072`), with before/after pictures.
- **Files:** `dist/ui/part-label-layout.mjs` (new), `dist/ui/flight-view.mjs`,
  `dist/chase-vehicle.mjs`, `tests/part-label-layout.test.mjs` (new), `ARCHITECTURE.md`,
  `README.md`, `INTERIOR-REALISM-TODO.md`, `archive/`
- **Checks:** `node --test tests/*.test.mjs` (220 pass, 7 new); full-orbit measurements above;
  settled frames at several angles; phone width; click-to-select on a displaced number.
- **Open / next:** continue the interior parts (03, 05, 16, 20-22).

### 2026-10-15: Rotor heads redrawn from the "Revolutionary Rotors" video
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Redraw the rotor heads from the Revolutionary Rotors video"
- **What changed:** At the owner's request, the motor stacks and rotor hubs at the four arm ends
  follow real footage: APL/NASA's *Revolutionary Rotors* video (the full-scale wind-tunnel model
  with flight-like rotors at NASA Langley and the spin test at APL), NASA's tunnel photos, and
  NASA/APL's May 2026 photo of the flight lander frame. Each head is now a collar with an arm
  clamp between an upper and a lower machined aluminum motor drum (groove, band of radial holes,
  notch screws, spoked face toward the rotor), and each rotor bolts on with a flat hub plate; the
  white pods, gold hub cylinders and spinner domes are archived. Blades are bright machined
  aluminum (each rotor is machined from one block). Visible in the pilot view (now zoomable) and
  the Exterior views, including B.
- **Estimated:** drum size (about 0.24 m across, scaled from the video against the 1.35 m rotor),
  hole and spoke counts, clamp shape. The arms keep their foam-covered shape (ICES-2023).
- **Sources saved:** video frames and contact sheets (the 500 MB video is linked, not kept), NASA
  photos, the flight-frame photo, a model-vs-sources sheet: `research/rotor-heads-2026-10-15/`.
- **Archive:** `archive/rotor-heads-2026-10-15/` (tag at `92ab0c4`).
- **Files:** `dist/rotor-heads.mjs` (new), `dist/vehicle-research.mjs`, `dist/index.html`,
  `tests/rotor-heads.test.mjs` (new), `research/`, `archive/`, `ARCHITECTURE.md`, `README.md`
- **Checks:** `node --test tests/*.test.mjs` (213 pass, 4 new). Pilot view at four angles and
  Fixed; Exterior B; no console errors.
- **Open / next:** the bare flight arm and its harness; the owner's note that the arm meets a small
  hexagonal fitting at the shoulder rather than going straight in (recorded in the checklist as a
  future update); interior parts 03, 05, 16, 20-22.

### 2026-10-15: Zoom for the pilot view's free camera
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add scroll, pinch and button zoom to the pilot view's free camera"
- **What changed:** At the owner's request (seeing the antenna's detail in the pilot view), the
  free camera now zooms: mouse wheel, two-finger pinch on the flight view, or new **+** / **−**
  buttons beside Fixed/Free (shown only in Free). It moves in to 0.17 of the chase distance
  (about 2 m) and out to 1.6x, easing like the orbit. Fixed mode and the arrival sequence keep
  their distances. Nothing is saved; the simulation is unchanged.
- **Files:** `dist/flight-camera.mjs`, `dist/chase-vehicle.mjs`, `dist/ui/controls.mjs`,
  `dist/index.html`, `dist/styles.css`, `tests/flight-camera.test.mjs`, `README.md`
- **Checks:** 209 tests pass (2 new: zoom range and Fixed ignoring it; easing without jumps).
  Pilot view zoomed in on the antenna shows the spiral slot pattern; buttons appear in Free.
- **Open / next:** rotor arms from the "Revolutionary Rotors" video.

### 2026-10-15: Rebuild part 15, the battery; review and publish Codex's provisional RDE pass
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Rebuild the battery from APL's test-module photos; add Codex's provisional RDE enclosures"
- **What changed:** The olive battery box is replaced by `dist/battery.mjs`: 24 upright cells
  (published count) of GS Yuasa's 134 Ah LSE134 (inferred from 134 Ah, GS Yuasa and 24 cells;
  130 x 50 x 271 mm), four across and six deep, with aluminum fin plates, copper heat pipes in
  three directions and series bus straps, in an enclosure whose look follows the **real photos**
  of APL's 9-cell thermal test module (ICES-2022 figs. 10, 11, 13): a cream ribbed lower section,
  a flange, a bare aluminum upper housing with three 2 in fans on each end, 1 in fans on the
  lower walls, and round connectors including a large four-pin one. The paper's CAD figures are
  used only for the internal arrangement (owner's rule today: real photos first, CGI mainly for
  dimensions and placement). Placed from the TFAWS 2023 plan view on pads over the warm duct.
- **Estimated:** the cell model, 4 x 6 layout, enclosure size, fan and connector positions,
  placement. The test module is not flight hardware. The phase-change wax is not drawn (its place
  is not published). The simulator keeps the published 11.5 kWh (24 x 496 Wh would be 11.9).
- **Also:** the warm duct is 7.5 mm lower (its joint flanges were above the floor line, where one
  met the battery base); the battery sits 1 cm further aft than the first draft so its flange
  clears the TWTA's high-voltage cable. The unpublished first draft (CAD look) is archived.
- **Codex's work:** Codex's provisional RDE enclosures (part 09, entries below) are included in
  this commit unchanged, with Codex's attribution; part 09 stays unchecked. Claude's review: the
  sources and labels hold; no RDE photo exists in APL's gallery or NASA's pages; ICES-2023 fig. 4
  shows the two hot boxes side by side on one side, not split across the centerline (noted as a
  follow-up, not changed).
- **Sources saved:** ICES-2022-256 pp. 1-4, 6-7 (real test photos); GS Yuasa LSE Gen III
  datasheet; photo crops and a model-vs-sources sheet in `research/battery-2026-10-15/`.
- **Archive:** `archive/battery-2026-10-15/` (with the CAD-look draft) and
  `archive/warm-duct-v1-2026-10-15/`, both tagged at `b2ac24a`; Codex's `archive/rde-2026-10-15`
  tag pushed with them.
- **Files:** `dist/battery.mjs` (new), `dist/thermal-loop.mjs`, `dist/vehicle-research.mjs`,
  `dist/ui/layers-panel.mjs`, `dist/index.html`, `tests/battery.test.mjs` (new), plus Codex's
  `dist/rotor-drive-electronics.mjs` and `tests/rotor-drive-electronics.test.mjs`; `research/`,
  `archive/`, `INTERIOR-REALISM-TODO.md`, `ARCHITECTURE.md`, `RESEARCH-COMPENDIUM.md`, `README.md`
- **Checks:** `node --test tests/*.test.mjs` (207 pass). Internal isolated and installed, Thermal,
  at 1280 and 390 px; no console errors; no sideways scroll.
- **Open / next:** the owner's request to redraw the rotor arms from the "Revolutionary Rotors"
  video; scroll/pinch zoom for the pilot view.

### 2026-10-15: Provisional RDE enclosures while deferring the battery
- **Signed:** Codex (OpenAI).
- **Status:** Local working update; not committed or published. Battery module, test,
  research and thermal-loop changes from Claude are preserved unchanged.
- **What changed:** Part 09's two solid blocks now have hollow casings, separate lids/mounts,
  open vents and illustrative internal fans. Stable `rde` identity and existing thermal model
  retained. Source limitations are visible in the component description and expandable assumptions.
- **Evidence/limits:** ICES-2023 documents two boxes with internal fans. Saved the real RDE
  test photograph on CAPS 2024 slide 27, but it is obscured; appearance/dimensions remain
  estimates, not a hardware replica. No CGI appearance copied, no boards or pinout invented.
  The owner's real-photo-first rule is recorded. Part 09 remains unchecked; 16 completed passes.
- **Archive:** `archive/rde-2026-10-15`, baseline tag at `b2ac24a`, pre-change working copies
  and desktop/mobile/multi-angle images. An unpublished lid/waveguide-overlap draft is preserved.
  Snapshot contains pre-existing battery integration; restore notes warn against whole-file rollback.
- **Checks:** 207 Node tests passed, including four RDE tests. Per-mesh and sampled-tube
  clearance against rebuilt parts and pending battery. Playwright desktop/360 px, four angles
  Internal/Thermal, nonblank/framed canvas pixels, no horizontal overflow or page exceptions;
  rendered desktop and phone images inspected. `git diff --check` passed.
- **Open / next:** Clear RDE flight/engineering-model photo and dimensions; otherwise move to
  another better-documented part. Battery remains deferred per owner; no mixed unfinished publish.

### 2026-10-15: Refresh interior context and interrupted battery handoff
- **Signed:** Codex (OpenAI).
- **Status:** Documentation update only; no application changes or publication in this pass.
- **What changed:** Reconciled the checklist with 16 committed part passes and Claude's
  uncommitted battery/duct work. Recorded completed artifacts, exact resume parameters,
  remaining app text/source/archive/release tasks, and deferred label/layer controls.
  Preserved Claude's implementation and attribution; the battery remains unchecked.
- **Files:** `INTERIOR-REALISM-TODO.md`, `README.md`, `CHANGELOG.md`.
- **Checks:** Fresh origin fetch; HEAD and origin/main both `b2ac24a`; inspected branch
  differences and working changes. Current working tree: 203 tests passed, zero failed.
  No independent browser or live-deployment verification in this documentation pass.
- **Open / next:** Finish battery disclosure/indexing and visual verification, then commit
  and publish the complete battery change. Exact flight configuration remains unverified.

### 2026-10-14: HGA dish face: sheen and sharper slots at grazing angles
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Give the antenna face a Kapton sheen and keep its slots sharp at grazing angles"
- **What changed:** At the owner's request (seeing the detail in the pilot view as the view turns),
  the dish face gets a roughness map (glossy Kapton, matte slots) and a slight bump map (slots
  recessed), drawn from the same slot layout, and anisotropic filtering on all three maps.
- **Limit:** at the pilot camera's distance the dish is about 70 px across and each slot is under
  a pixel, so the pattern still reads as a solid orange disc there; it shows when the view is close.
- **Files:** `dist/vehicle-research.mjs`
- **Checks:** 198 tests pass; pilot view in fixed and free camera, stowed and raised.
- **Open / next:** #15 battery casing.

### 2026-10-14: HGA dish face: the spiral slot layout from NASA's photo
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Draw the antenna's spiral slot pattern from NASA's test-chamber photo"
- **What changed:** At the owner's request, the dish face now follows the slot layout read from
  NASA's full-resolution test-chamber photo instead of rings of touching V pairs: one continuous
  spiral about 2.7 cm per turn (about 16 turns), perpendicular slot pairs turned by half their
  angle around the disc (the classic circularly polarized radial-line-slot layout), the two slots
  of each pair side by side along the spiral (the herringbone near the rim), slots growing from
  about 0.9 to 1.7 cm, seven round spots around the feed. Drawn on a 1,024 px canvas.
- **Estimated:** counts and spacing are measured on the photo (the dish's 87.4 cm as the scale);
  Dragonfly's slot design is not published. The spots are read as fasteners under the Kapton.
- **Archive:** `archive/hga-dish-rings-2026-10-14/` (tag at `f20648c`).
- **Files:** `dist/vehicle-research.mjs`, `research/hga-actuators-2026-10-14/`, `archive/`
- **Checks:** `node --test tests/*.test.mjs` (198 pass); texture compared side by side with the
  photo; Exterior view renders; no console errors.
- **Open / next:** #15 battery casing.

### 2026-10-14: Rebuild part 10, the high-gain antenna gimbal; the dish rises on its arm
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Rebuild the antenna gimbal and arm from the thermal papers and APL's arm photo"
- **What changed:** The blue actuator placeholder under the deck and the dish's vertical pole are
  replaced by the gimbal the sources describe (`dist/hga-gimbal.mjs`): an internal portion under
  the deck (azimuth bearing, drive, rotary joint) and, above it under a 5 cm Rohacell dome, a
  stacked turntable and a gold elevation drum, just aft of the attic and forward of the stowed
  dish (ICES-2023 p. 2, figs. 1 and 3; ICES-2020 p. 5); the motorized arm, a gray truss pedestal,
  thermal isolator and flexible feed to the dish center (APL's July 2026 photo); a launch lock
  under the dish's aft rim and a flight lock either side. The dish now rises on the arm and turns
  in azimuth to point at Earth. Its face is orange Kapton with slot pairs (NASA's June 2026
  test-chamber photo) and it sits 4 cm higher, on the pedestal.
- **Estimated:** sizes; the 0.6 m arm and the hinge at z -0.55 (measured on ICES-2023 fig. 1
  with the dish's 87.4 cm as the ruler); lock shapes and colors; the pedestal height (the flight
  one is taller). The azimuth range is not published: here the dish stops before it would swing
  into the attic, so at the simulator's 55-degree Earth elevation it points straight at Earth only
  when Earth is roughly ahead of the nose. Downlink rate does not depend on pointing.
- **Also:** the TWTA's output waveguide now runs forward under the deck to the gimbal's rotary
  joint instead of bending up into the deck (revision `twta-2026-10-14b`; first route archived).
  The foam dome is see-through in Internal (`applyLayer` now also ghosts parts marked
  `userData.shell`). Isolating part 10 shows the dish too. The README's Vehicle Layers paragraph
  no longer lists the sample carousel and DraMS as placeholders (Codex redrew them October 12);
  the dropped clause is archived. Vehicle part assumptions gains part 10 (16 of 24).
- **Sources saved:** APL arm photo, NASA test-chamber photo (2048 px; full size linked), ICES-2023
  fig. 1 and 3 crops; NASA printable-model guide pages as cross-reference only.
- **Archive:** `archive/hga-actuators-2026-10-14/` and `archive/twta-waveguide-v1-2026-10-14/`
  (both tagged at `e43fc85`).
- **Files:** `dist/hga-gimbal.mjs` (new), `dist/vehicle-research.mjs`, `dist/chase-vehicle.mjs`,
  `dist/twta.mjs`, `dist/vehicle-inspector.mjs`, `dist/ui/layers-panel.mjs`, `dist/index.html`,
  `tests/hga-gimbal.test.mjs` (new), `tests/twta.test.mjs`, `research/`, `archive/`,
  `INTERIOR-REALISM-TODO.md`, `ARCHITECTURE.md`, `RESEARCH-COMPENDIUM.md`, `README.md`
- **Checks:** `node --test tests/*.test.mjs` (198 pass, 7 new). Internal isolated, stowed, raised
  and half-raised; installed; Exterior stowed and raised; pilot view raised; phone width.
- **Open / next:** #15 battery casing.

### 2026-10-14: Add Vehicle part assumptions, the part-by-part list
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add a part-by-part assumptions list to the engineering references"
- **What changed:** At the owner's request, the app now has both a summary and the full list.
  A new **Vehicle part assumptions** section under Engineering references (next to Vehicle part
  references) gives one entry per redrawn part (15 of 24: 3 by Codex, 12 by Claude), each saying
  what is published and what is estimated, plus a line for the parts not yet redrawn. **Model
  assumptions** stays the summary and now points to it, with the count. Nothing was removed.
- **Files:** `dist/index.html`, `tests/part-assumptions.test.mjs` (new),
  `INTERIOR-REALISM-TODO.md` (process step 11), `CHANGELOG.md`
- **Checks:** `node --test tests/*.test.mjs` (191 pass, 3 new: the list matches the checklist's
  ticked parts and credits, counts agree, placeholders list the rest). Viewed at narrow width.
- **Open / next:** #10 HGA actuators.

### 2026-10-14: Rebuild part 14, the 100 W X-band TWTA under the top deck
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Rebuild the TWTA after published flight amplifiers"
- **What changed:** The orange placeholder box is replaced by a traveling-wave tube amplifier
  drawn like published flight TWTAs, because Dragonfly's own unit is not pictured or sized in any
  source found. Published for Dragonfly: one 100 W TWTA (NASA's spacecraft page; ICES-2023), on
  the underside of the top deck with heat going into the deck (ICES-2020, ICES-2023). Drawn: a
  black conduction-cooled tube on a wider silver baseplate with eight bolted ears per side, red
  staked screws and the label set seen on LRO's flight tube (NASA/TM-2010-216262 fig. 1); a
  separate power conditioner (EPC) with corner ears, a bus D-sub and a high-voltage gland; a
  braided umbilical between them (LRO and Stellant photos); a WR-112 waveguide from the
  collector end up through the deck toward the antenna; an input coax down to the radio's J31;
  the EPC harness to the starboard wall. Thermal pads sit between both units and the deck.
- **Sizes:** tube 33 x 7.5 x 7.5 cm and EPC 21 x 7.5 x 11 cm [EST], scaled from LRO's units
  (37 x 9 x 9 cm, 1.5 kg; 20 x 7 x 11 cm, 1.3 kg) to the X-band masses of MRO (two tubes 1.9 kg,
  two EPCs 3.0 kg) and Stellant (895 g tube).
- **Placement:** under the starboard deck above the Frontier radio and aft of PSU 2, near the
  antenna mast [EST]. ICES-2020 says "TWTAs"; one is drawn, as NASA and ICES-2023 name one.
- **Also:** the part's panel text keeps its two earlier sentences and adds what is published and
  estimated, with links to ICES 2020, the LRO report, the MRO telecom report and Stellant. The
  sampled-tube clearance helper in `tests/thermal-loop.test.mjs` and `tests/draco-plumbing.test.mjs`
  now applies each mesh's world transform (cables inside rotated parts were checked in local
  coordinates); both tests still pass. The checklist's suggested order is rewritten without the
  parts already done, with a note.
- **Sources saved:** ICES-2020-160 pp. 1, 4, 5; NASA/TM-2010-216262 pp. 5-6; DESCANSO MRO pp. 2,
  25, 27, 32, 33; Stellant sheet pp. 1-2 and brochure p. 2; patent US 11,854,759 B2 (Thales,
  background); photo crops and a model-vs-sources sheet in `research/twta-2026-10-14/`.
- **Archive:** `archive/twta-2026-10-14/` (tag at `caec79e`), including the old app text.
- **Files:** `dist/twta.mjs` (new), `dist/vehicle-research.mjs`, `dist/ui/layers-panel.mjs`,
  `dist/index.html`, `tests/twta.test.mjs` (new), `tests/thermal-loop.test.mjs`,
  `tests/draco-plumbing.test.mjs`, `research/`, `archive/`, `INTERIOR-REALISM-TODO.md`,
  `ARCHITECTURE.md`, `RESEARCH-COMPENDIUM.md`, `README.md`
- **Checks:** `node --test tests/*.test.mjs` (188 pass, 5 new). Isolated views at four angles in
  Internal and Thermal, four views from below, installed view; phone width (375 px, no sideways
  scroll); the panel text and its six source links render.
- **Open / next:** #10 HGA actuators (the waveguide stops at the deck where the gimbal would be).

### 2026-10-14: Rebuild parts 17-19: circulation fans, warm duct and the cold-duct trim device
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Rebuild the fans, warm duct and trim device from the TFAWS thermal talks"
- **What changed:** The one fan cylinder, the duct box and the side "chimneys" are replaced by the
  air loop in NASA/APL's TFAWS 2023 and 2024 talks: two fans (A and B) side by side at the MMRTG
  end, with rotors that turn with the flow; a warm duct 0.14 m wide on the centerline (scaled from
  the 2023 plan view) from the fan transition to the nose, turning up into the body below the
  nose; and the trim device as a cold bypass duct under the belly, outside the foam, between fore
  and aft diverter flaps in foam-wrapped housings, opening up to 24 degrees with the trim setting.
  The flow arrows now run through the fans and duct and, at trim, forward through the cold duct.
- **Why the trim device changed shape:** ICES-2023 describes side chimneys with foam caps; the
  later TFAWS 2023 and 2024 talks describe and test a cold duct with fore and aft diverters. The
  newer design is drawn; the chimney drawing is archived. The part keeps its durable id.
- **Also:** the "Warm-air loop" panel says "two fans" and "fore and aft diverter flaps ... under
  the belly"; its duct-speed estimate uses the 0.14 m width. Clamps in `draco-plumbing.mjs` and the
  new tapers are oriented with explicit math instead of `lookAt`. A compendium line about side
  flaps on linear actuators is kept with a note that its source was not found.
- **Sources saved:** TFAWS 2023 slide 4 and the slide 3 plan view; TFAWS 2024 slides 13, 15, 16.
- **Noted, not fixed:** old drive-electronics, battery, nose-electronics and aft-bulkhead blocks
  reach into the duct zone.
- **Archive:** `archive/thermal-loop-2026-10-14/` (tag at `cceb29a`).
- **Files:** `dist/thermal-loop.mjs` (new), `dist/vehicle-research.mjs`, `dist/draco-plumbing.mjs`,
  `dist/ui/layers-panel.mjs`, `dist/index.html`, `tests/thermal-loop.test.mjs` (new),
  `tests/render-smoke.test.mjs`, `research/`, `archive/`, `INTERIOR-REALISM-TODO.md`,
  `ARCHITECTURE.md`, `RESEARCH-COMPENDIUM.md`, `README.md`
- **Checks:** `node --test tests/*.test.mjs` (183 pass, 5 new). Isolated and installed views, trim
  open; phone width; no console errors.
- **Open / next:** #14 TWTA.

### 2026-10-14: Rebuild parts 02 and 24, the DrACO sample lines and blowers
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Rebuild the DrACO sample lines and blowers from the DrACO layout figure"
- **What changed:** The single tube per side and the one-cylinder blower are replaced by the
  cross-strapped pneumatic transport in the DrACO paper's fig. 1: a flexible hose from each
  drill's pneumatic port (it now follows the drill head down while drilling), rigid tubes
  forward under the body edges and up the nose into the cold attic, a flow-diverter manifold on
  the carousel's sample inlet, a return line down the port side, an inlet flow diverter and the
  forward and aft centrifugal blowers behind the port forward arm (ICES-2023), exhausting
  outboard and down. The sampling particles follow the new route. Isolating the lines now shows
  the blowers too.
- **Sources:** DrACO LPSC 2022 fig. 1 and schematic, Honeybee slides, NASA "Playing Lacrosse",
  ICES-2023 p. 4-7 (page 4 saved). At the owner's direction, APL's cutaway and 2024 CAD movie
  frames are saved only as a cross-reference (`research/draco-plumbing-2026-10-14/`).
- **Assumptions:** routes, the 13 mm tube size, clamps, diverter and blower shapes [EST]; the
  carousel's single inlet stands in for the LDMS and GCMS elevators.
- **App text:** Model assumptions, Vehicle part references and both Component texts updated;
  README matches. Local frame-capture tooling for the video lives outside the repo.
- **Archive:** `archive/draco-plumbing-2026-10-14/` (tag at `7a78f8f`).
- **Files:** `dist/draco-plumbing.mjs` (new), `dist/drills.mjs` (hose attach point),
  `dist/vehicle-research.mjs`, `dist/vehicle-inspector.mjs`, `dist/ui/layers-panel.mjs`,
  `dist/index.html`, `tests/draco-plumbing.test.mjs` (new), `tests/vehicle-inspector.test.mjs`,
  `research/`, `archive/`, `INTERIOR-REALISM-TODO.md`, `ARCHITECTURE.md`,
  `RESEARCH-COMPENDIUM.md`, `README.md`
- **Checks:** `node --test tests/*.test.mjs` (178 pass, 4 new). Isolated, close, blower, installed
  and exterior views; phone width; no console errors.
- **Open / next:** #19 trim device, #17 fan, #18 duct.

### 2026-10-13: Rebuild part 01, the DrACO drills, from the 2022 DrACO paper
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Rebuild the DrACO drills from the LPSC 2022 drill figure"
- **What changed:** Codex's simplified drills are replaced by the Sample Acquisition Drill in
  the DrACO paper's fig. 2: a gold drill head with percussion (top) and rotation (front)
  actuators and the percussion spring, riding a red Z-stage rail with its motor, lead screw and
  lower bracket; a swivel with an angled pneumatic port; and a hollow bit with a side opening and
  a slotted crown. While drilling, the whole head now slides down the rail and only the bit
  turns (before, the feed group spun as one piece); the sampling animation and Codex's sampling
  test were updated for this. A full stroke drills 5.8 cm, inside the published 6 cm.
- **Placement check:** the APL cutaway, NASA's printable model (assembly step 3) and DragonCam
  fig. 3 all put the drill just aft of the forward leg, 0.34-0.45 m forward of center; the model
  keeps 0.43 m.
- **Sources saved:** DrACO test-hardware photos from Tighe Costa's portfolio (metadata removed),
  NASA's lab photo and print-model page (`research/drills-2026-10-13/`); no drill patent found.
- **Noted, not fixed:** the old transfer line (#02) still starts at the old head position.
- **App text:** Model assumptions, Vehicle part references and the drill's Component text
  updated; README matches.
  The drill's Component sources also link the DrACO paper.
- **Archive:** `archive/drills-2026-10-13/` (old code, sampling test, pictures; tag at `16b1f10`).
- **Files:** `dist/drills.mjs` (new), `dist/vehicle-research.mjs`, `dist/ui/layers-panel.mjs`,
  `dist/index.html`, `tests/drills.test.mjs` (new), `tests/render-smoke.test.mjs`, `research/`,
  `archive/`, `INTERIOR-REALISM-TODO.md`, `ARCHITECTURE.md`, `RESEARCH-COMPENDIUM.md`, `README.md`
- **Checks:** `node --test tests/*.test.mjs` (174 pass, 4 new). Close views, mid-drilling view,
  Thermal; phone width; no console errors.
- **Open / next:** #02 sample lines and #24 blowers.

### 2026-10-13: Rebuild part 04, the nose cameras, from the DragonCam paper
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Rebuild the nose cameras from the DragonCam paper"
- **What changed:** The three placeholder boxes are replaced by the six nose cameras the paper
  names and places in the nose: Forward MAC (12.6 mm lens), Forward WAC and two Side Cameras
  (5.8 mm lenses), and two redundant NavCams, on a camera panel behind the nose cap, each behind
  a window. With the lower three, the model now has the paper's nine cameras. At the owner's
  question, fig. 1 was checked camera by camera: it is a CGI image of one body seen from
  different angles; the only real differences are one hooded lens (drawn on the Forward MAC, the
  one camera with a different lens: an inference) and the NavCams' yellow top plates. The shared
  camera code (`dist/ecam.mjs`) gains those two variants and a `mountEcam` helper.
- **Correction:** the previous entry said the paper's side view confirms the model's drill
  position. Scaled properly (nose tip to MMRTG end), fig. 3 puts the drill about 0.36 m forward
  of center, about 7 cm aft of the model's 0.43 m. Fixed in the code comment, the part-23 notes
  and the placement table; the Microscopic Camera follows the drill when part 01 is redrawn.
- **Assumptions:** positions read from figs. 2-3; pointing angles, which low unit is the WAC or
  the NavCams, panel size, windows and harness [EST]. Noted, not fixed: the 2026 CAD's chin is
  fuller than the model's older nose shell, so the low cameras stand out of it.
- **App text:** Model assumptions and Vehicle part references updated (nose cameras redrawn);
  README matches.
- **Archive:** `archive/nose-cameras-2026-10-13/` (tag at `8dfe691`).
- **Files:** `dist/nose-cameras.mjs` (new), `dist/ecam.mjs`, `dist/side-cameras.mjs`,
  `dist/vehicle-research.mjs`, `dist/ui/layers-panel.mjs`, `dist/index.html`,
  `tests/nose-cameras.test.mjs` (new), `research/`, `archive/`, `INTERIOR-REALISM-TODO.md`,
  `ARCHITECTURE.md`, `RESEARCH-COMPENDIUM.md`, `README.md`
- **Checks:** `node --test tests/*.test.mjs` (170 pass, 3 new). Internal and Thermal views of the
  camera panel and installed nose; phone width; no console errors.
- **Open / next:** #01 drills (DrACO paper figures; the drill position correction above).

### 2026-10-13: Update the model assumptions, footer and engineering references
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Update model assumptions, footer and part references"
- **What changed:** At the owner's request, before the next part: the app's **Model assumptions**
  no longer mention the replaced 24-cup carousel; they explain the part-by-part rebuild (which
  parts are redrawn and by whom, what their sizes come from, that positions are mostly
  estimated, which parts are still placeholders). **Engineering references** gains a "Vehicle
  part references" list: DragonCam paper, DrACO LPSC 2022, SciTech 2024 interface paper and NASA
  integration photos, the March 2026 electronics photos and connector standards, the Frontier
  photo, iCubeSat paper and patent, ICES-2023, TFAWS 2023 and 2024, and the top-deck fit check,
  with links to the part-sources list and the rebuild checklist. The **footer** adds APL's
  Dragonfly site and "Part sources & credits". README's intro and Vehicle Layers text match.
  Process step 11 now keeps these current with every part. Follow-up: the original
  approximations sentence (dimensions, placement, tube routing, cutter shape) and the README's
  numbered-callout note were restored, and the exact earlier wording is archived in
  `archive/app-text-2026-10-13/` so nothing from the original is lost.
- **Files:** `dist/index.html`, `dist/styles.css`, `README.md`, `CHANGELOG.md`
- **Checks:** all tests; page checked at desktop and phone width.

### 2026-10-13: Rebuild part 23, the lower DragonCam cameras, from the 2026 camera paper
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Rebuild the lower DragonCam cameras from the 2026 camera paper"
- **What changed:** The two placeholder boxes are replaced by the cameras in Malin's 2026
  DragonCam paper: the Microscopic Camera on the port side, placed from its published geometry
  (986 mm from the drill site at 52 degrees to the surface, lens aimed at it; 105 x 155 x 90 mm),
  APL's LED array beside it with a 365 nm UV emitter, and a Down Camera on each side looking
  straight down. Camera heads (new shared `dist/ecam.mjs`) follow the paper's figures: stacked
  black housing, orange side panels, feet, top connector with flex lead, stepped black lens
  with an orange ring; the Microscopic Camera adds its focus motor. Each sits in a foam cavity
  behind a 3 mm window, with its bracket on the bay wall's outer face and its harness passing
  through. (Corrected in the next entry: the paper's side view puts the drill about 7 cm aft of
  the model's, not exactly at it.)
- **Checklist:** every checked item now names who did it (Codex or Claude), as the owner asked;
  handoff notes record that and the overlap rule (fix overlaps between rebuilt parts; only note
  overlaps with parts not yet redrawn).
- **Sources saved:** DragonCam paper pages, DrACO LPSC 2022, Honeybee KISS slides 20-22, TFAWS
  2024 test-article slides (`research/sources/`), for this part and the next ones.
- **Assumptions:** Down Camera position, head size, brackets and harness [EST]. The Microscopic
  Camera is thicker than the average foam, so the foam must be locally thicker; no blister is
  drawn. Noted, not fixed: overlap with the old trim-chimney placeholder (#19).
- **Archive:** `archive/side-cameras-2026-10-13/` (tag at `d40180f`).
- **Files:** `dist/ecam.mjs`, `dist/side-cameras.mjs` (new), `dist/vehicle-research.mjs`,
  `dist/ui/layers-panel.mjs`, `tests/side-cameras.test.mjs` (new), `research/`, `archive/`,
  `INTERIOR-REALISM-TODO.md`, `ARCHITECTURE.md`, `RESEARCH-COMPENDIUM.md`
- **Checks:** `node --test tests/*.test.mjs` (167 pass, 3 new). Internal and Thermal close-ups and
  installed views; 375 px phone width; no console errors.
- **Open / next:** #04 nose cameras from the same paper.

### 2026-10-13: Process notes: detail capture, true scale and placement
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commits:** "Describe detail capture as the goal, with techniques as examples" and
  "Add the placement rule and placement status table"
- **What changed:** In `INTERIOR-REALISM-TODO.md`, process step 3 now states the goal (capture
  what the sources show and replicate it, so parts look as distinct or alike as the real
  hardware), with the IEM/PSU techniques given as examples rather than fixed steps. Step 6 adds
  the owner's rule that, where possible, scale and placement also come from sources so parts
  fit together like the real vehicle; positions without a source are marked [EST]. A new
  "Placement Status of Rebuilt Parts" table lists the size and position basis of parts 06, 07,
  08, 11, 12 and 13 and the layout sources for a placement pass. Documentation only.
- **Files:** `INTERIOR-REALISM-TODO.md`, `CHANGELOG.md`

### 2026-10-13: Correct the IEM and PSUs from the full-resolution photos
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Correct the IEM and PSUs from full-resolution photos and connector standards"
- **Why:** The owner noticed the new IEM and PSUs looked like copies of each other, with the same
  evenly spaced connector rows, and asked for more sources and for details captured properly.
  NASA's image server has the testing photo at 6723 x 4480 and the harness photo at 3000 x 3996;
  the first versions were drawn from 1280-pixel copies.
- **IEM:** heat-sink fins now run parallel to the face, with rows of fasteners; copper ground
  strap; silver face plate bolted round its edge; black connector windows in two rows across
  eight columns; Micro-D connectors at standard sizes, each mated to a labeled, thicker
  silver-wrapped cable; yellow tape strips; mounted with its back to the port wall. About
  28 x 28 x 22 cm, scaled from the Micro-D plugs (was 26 x 22 x 24).
- **PSUs:** the face is mapped connector by connector from the photo and checked by drawing the
  map over it: eight slices, two ribs, seven 25-way D-subs (four left, three lower right), a small
  cluster, an uncapped port, screw posts, an empty upper right. About 20 x 24 x 19 cm from the
  D-sub sizes (was 24 x 22 x 20). PSU 1 now sits beside the IEM on the same wall, on its left as
  seen from inside, as photographed; PSU 2 is on the starboard wall, drawn the same (only one
  PSU is photographed).
- **New sources saved:** full-resolution photos; connector standards
  (`research/sources/connector-standards/`); the April 2026 top-deck fit-check photo
  (`research/lander-structure-2026/`) for later structure work. `research/PART-SOURCES.md` and
  process step 3 updated (full resolution, standard parts as rulers, overlay check).
- **Archive:** both first versions in `archive/iem-v1-2026-10-13/` and
  `archive/power-units-v1-2026-10-13/` with pictures; tags at `c36db54`.
- **Files:** `dist/iem.mjs`, `dist/power-units.mjs`, `dist/ui/layers-panel.mjs`,
  `dist/vehicle-research.mjs`, `tests/iem.test.mjs`, `tests/power-units.test.mjs`, `research/`,
  `archive/`, `INTERIOR-REALISM-TODO.md`
- **Checks:** `node --test tests/*.test.mjs` (164 pass). Face, close and installed views in
  Internal and Thermal; overlay of the PSU map on the photo; 375 px phone width; no console
  errors.
- **Open / next:** an uncovered view of the IEM face; the second PSU; #14 TWTA.

### 2026-10-13: Rebuild part 11, the two power switching units, from NASA/APL's photo
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Rebuild the power switching units from NASA/APL's testing photo"
- **What changed:** The two green placeholder boxes are replaced by the two PSUs as
  photographed in March 2026 testing: a silver connector face built from four horizontal
  slices with rows of connectors (mated to the harness; the photo shows pink test caps), black
  top and side covers, a backshell and silver-wrapped cable on every connector gathering
  toward the gap between the units, Kapton-taped ties and bolted base flanges. Own module with
  per-unit casing, mounts, connectors and harness groups. Part text and source links updated.
  Physics unchanged.
- **Sources:** NASA/APL testing photo (Ed Whitman) and a PSU crop in
  `research/power-units-2026-10-13/`; NASA's March 2026 blog ("both PSUs").
- **Assumptions:** two units [PUB]; size about 24 x 22 x 20 cm each scaled from the photo [EST];
  slice heights, connector rows, cable routes, flanges and placement (old centers, on the floor,
  faces inboard) [EST]. Red handling handles left out.
- **Archive:** `archive/power-units-2026-10-13/` (old code, eight angle pictures, context view;
  tag at `c36db54`).
- **Files:** `dist/power-units.mjs` (new), `dist/vehicle-research.mjs`,
  `dist/ui/layers-panel.mjs`, `tests/power-units.test.mjs` (new),
  `research/power-units-2026-10-13/`, `research/PART-SOURCES.md`, `archive/`,
  `INTERIOR-REALISM-TODO.md`, `ARCHITECTURE.md`, `RESEARCH-COMPENDIUM.md`
- **Checks:** `node --test tests/*.test.mjs` (164 pass, 2 new). Internal and Thermal isolated at
  four angles, face-on and in context; 375 px phone width; no console errors.
- **Open / next:** #14 TWTA.

### 2026-10-13: Reword house rule 4 on research PDFs
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Reword the research-PDF house rule"
- **What changed:** House rule 4 in `ARCHITECTURE.md` now reads "Link research PDFs as sources":
  each source README gives the PDF link, and the pages a part is built from are saved as
  images in `research/sources/`. Documentation only.
- **Files:** `ARCHITECTURE.md`, `CHANGELOG.md`

### 2026-10-13: Rebuild part 12, the Integrated Electronics Module, from NASA/APL photos
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Rebuild the IEM from NASA/APL integration photos"
- **What changed:** The teal placeholder box is replaced by the IEM as photographed during
  integration in March 2026: a dark chassis with a black finned top, nine silver card fronts
  with gold micro-D connectors and captive screws, a mated harness backshell on every
  connector with silver-wrapped cables dropping to the floor and gathering at one end
  (Kapton-taped ties), and bolted base flanges. Its own module with separate casing, mounts,
  connectors and harness groups for the future hide/show controls. Part text and source links
  updated. Physics unchanged.
- **Sources:** two NASA/APL photos (engineering model on the harness; IEM and PSU testing) and
  APL's video cover, saved in `research/iem-2026-10-13/`.
- **Assumptions:** no size is published; about 26 x 22 x 24 cm scaled from the engineers' hands
  [EST]. Card count, connectors, cable routes, flanges and placement (old center, on the floor,
  card face inboard) are estimates. The photos show it fastened to a vertical structural panel
  that the model does not have yet. Red handling handles left out.
- **Archive:** `archive/iem-2026-10-13/` (old code, eight angle pictures, context view; tag at
  `1820799`).
- **Files:** `dist/iem.mjs` (new), `dist/vehicle-research.mjs`, `dist/ui/layers-panel.mjs`,
  `tests/iem.test.mjs` (new), `research/iem-2026-10-13/`, `research/PART-SOURCES.md`,
  `archive/`, `INTERIOR-REALISM-TODO.md`, `ARCHITECTURE.md`, `RESEARCH-COMPENDIUM.md`
- **Checks:** `node --test tests/*.test.mjs` (162 pass, 2 new). Internal and Thermal isolated at
  four angles and in context; 375 px phone width; no console errors, no sideways scrolling.
- **Open / next:** #11 power switching units.

### 2026-10-13: Save every photo, figure and patent used for the rebuilt parts
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Save the paper figures and patent drawings behind the rebuilt parts"
- **What changed:** The owner asked that all photos and sources used for each part be saved in
  the project. Photos for parts 06, 08 and 13 were already saved; the paper figures that parts
  06, 07 and 08 were built from (and the coordinate calibration slide) were only linked. Now
  saved as page images in `research/sources/`: SciTech 2024 (pp. 2, 3, 5, 7, 8), ICES-2023-389
  (pp. 3, 5, 6, 7), TFAWS 2023 slide 3, iCubeSat 2019 p. 2, and the drawing sheets of patent
  US 8,417,859 (Johns Hopkins University's slice-based software-defined radio, for part 13).
  New index `research/PART-SOURCES.md` lists, for each part, its saved photos, figures,
  patents and link-only sources, plus patent leads. Process step 3 now requires this.
- **Files:** `research/sources/` (new), `research/PART-SOURCES.md` (new),
  `research/frontier-radio-2026-10-13/README.md`, `INTERIOR-REALISM-TODO.md`, `CHANGELOG.md`
- **Checks:** documentation and reference images only.
- **Open / next:** #12 IEM and #11 power switching units.

### 2026-10-13: Rebuild part 13, the Frontier radio, from APL's photo
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Rebuild the Frontier radio from APL's photo and published slice size"
- **What changed:** The green 0.18 m cube is replaced by APL's Frontier software-defined radio
  as photographed: a black anodized stack of four slices on bolted feet, connectors J11 to J32
  where the photo shows them (D-subs, SMA ports, a capped port on a chain), staked screws and
  semi-rigid coax on top, one run wrapped in foil. About 10 x 10 x 15 cm instead of 18 cm on
  every side. Its own module with separate casing, mounts, connectors and coax groups for the
  future hide/show controls. Part text and source links updated. Physics unchanged.
- **Sources:** APL photo on NASA's Dragonfly pages; "four or more 4 x 6 inch packaged slices"
  (O'Neill et al., SmallSat 2016); 2,050 cm3 and 2.1 kg (APL, iCubeSat 2019; eoPortal).
- **Assumptions:** stack width (about 4 in) and slice split read from the photo; connector
  sizes, coax routes, rear feet and placement (old spot, on the floor, connectors inboard) are
  estimates. One radio drawn; a second unit is not confirmed. The photo may show a Frontier
  unit from another mission.
- **Archive:** `archive/frontier-radio-2026-10-13/` (old code, eight angle pictures, context
  and phone views; tag at `abba3af`). Two unpublished drafts kept with pictures: a mirrored
  connector face and a stack sized from the 2,050 cm3 figure (13.2 cm, too wide for the photo).
- **Files:** `dist/frontier-radio.mjs` (new), `dist/vehicle-research.mjs`,
  `dist/ui/layers-panel.mjs`, `tests/frontier-radio.test.mjs` (new),
  `research/frontier-radio-2026-10-13/`, `archive/`, `INTERIOR-REALISM-TODO.md`,
  `ARCHITECTURE.md`, `RESEARCH-COMPENDIUM.md`
- **Checks:** `node --test tests/*.test.mjs` (160 pass, 3 new). Internal and Thermal, isolated
  at four angles and in context, 1280 x 800 and 375 px phone width; no console errors, no
  sideways scrolling.
- **Open / next:** #12 IEM and #11 power switching units (NASA's March 2026 photos); radio
  count, real location and cable runs.

### 2026-10-13: Write down the part-rebuild process and the Claude handoff
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Record the interior part-rebuild process and handoff notes"
- **What changed:** The owner asked Codex to write the process used for the interior part
  rebuilds into the checklist, tick what is done and leave handoff notes for Claude; Codex hit
  a usage limit before saving it. `INTERIOR-REALISM-TODO.md` now has "The Process (one part
  per pass)", twelve steps taken from how parts 06-08 were built (research and credit,
  archive first, one module per part with inspection-layer groups, fit rules, honesty in the
  app text, inspector, tests, visual checks, write-up, publish), and "Handoff Notes" (current
  state, rebuilt-set assets, suggested order, local viewing, owner preferences, open items).
  Parts 06, 07 and 08 were already ticked. Documentation only.
- **Files:** `INTERIOR-REALISM-TODO.md`, `CHANGELOG.md`
- **Checks:** none needed (no code changes).
- **Open / next:** #13 Frontier radio, using the official APL photo.

### 2026-10-12: Rebuild DraMS enclosures and align the warm-side interface
- **Signed:** Codex (OpenAI).
- **Commit:** `Rebuild DraMS enclosures and aligned inspection interface`.
- **Reference follow-up:** `Refresh rebuilt instrument neighbor notes` removes stale
  descriptions of the now-replaced adjacent DraMS placeholders; no geometry changes.
- **What changed:** Part 08 replaces generic blocks with a cylindrical analyzer illustration,
  enclosed electronics/laser/GC units, frame, local lines, separate service covers and a
  schematic fan casing. Interface follows the Wonderwall aperture; analysis cue follows
  the new analyzer. Isolated DraMS no longer includes obscuring neighboring parts.
- **Assumptions:** Educational reconstruction, not flight CAD. Dimensions/finishes/routes
  remain estimates; hidden electrodes, optics, columns, oven and exact seals are unmodeled.
  No physics changes and no movement/rescaling of the previously rebuilt carousel or wall.
- **Archive:** `archive/drams-2026-10-12`, tag at `ade916f`, old source/tests and matched
  screenshots. An unpublished occluded-isolation draft is also preserved with pictures.
- **Checks:** 157 Node tests passed; three-part clearance, aperture fit, layer separation,
  analyzer marker and existing rendering/simulation checks. Playwright desktop/360 px,
  four angles Internal/Thermal, framed nonblank pixels, no overflow or browser exceptions.
- **Open / next:** Exact dimensions and instrument internals; independent layer controls
  and label stacking remain tracked. Frontier radio has a useful official photo for the next pass.

### 2026-10-12: Rebuild the Wonderwall interface and preserve removable-layer boundaries
- **Signed:** Codex (OpenAI).
- **Commit:** `Rebuild Wonderwall interface with separate inspection layers`.
- **What changed:** Part 07 is now a contoured longitudinal warm/cold interface with true
  geometry openings, facings, an estimated core and mounts. Removed the old transverse
  slab that overlapped the updated carousel. No carousel, flight or science changes.
- **Assumptions:** Detail geometry and material appearances remain estimated. ICES-2023's
  approximately 5 cm instrument separation is not wall thickness. The displayed apertures
  do not imply unsealed flight penetrations; actual connectors await the DraMS pass.
- **Layers:** Separate faces/core/mount groups prepare independent visibility controls;
  the owner's shell/foam/casing hide/show reminder is explicitly tracked, not yet shipped as UI.
- **Archive:** `archive/wonderwall-2026-10-12` contains exact previous code, desktop/phone,
  four-angle images and restore instructions; tag at `3387a30`.
- **Checks:** 154 Node tests passed; modeled attic envelope and rebuilt-carousel clearance,
  aperture ray tests, independent layer groups. Playwright desktop/mobile and multi-angle
  Internal/Thermal renders, pixel bounds, no overflow/errors; both faces and context inspected.
- **Open / next:** #08 DraMS casing/interfaces. Exact component dimensions/materials,
  independent layer UI and the global callout layout remain on the checklist.

### 2026-10-12: Rebuild the first interior part from carousel integration references
- **Signed:** Codex (OpenAI).
- **Commit:** `Rebuild sample carousel from NASA integration references`.
- **What changed:** Part 06 now has an enclosed silver/amber drum, instanced cooling fins,
  top fittings and warm-side drive bodies. The casing stays fixed while an internal
  indexing cue follows science. Flow cue endpoint follows the new inlet. Thermal colors
  distinguish the cold assembly from warm drives without changing simulation physics.
- **Files:** `dist/sample-carousel.mjs`, `dist/vehicle-research.mjs`, `dist/ui/layers-panel.mjs`,
  carousel tests, research notes/photos and `INTERIOR-REALISM-TODO.md`.
- **Assumptions:** Photo-referenced procedural geometry, not imported CAD. No public
  dimensioned SDC drawing found; 0.36 m drum, fittings and location remain labeled estimates.
  Legacy Wonderwall/DraMS/transfer-line interfaces await separate replacement. No resizing
  to avoid legacy placeholders; structural envelope checked. Large ground-handling frame omitted.
- **Archive:** `archive/sample-carousel-2026-10-12`, exact previous source, desktop/phone
  and multi-angle screenshots, restore instructions and tag at `0886e40`.
- **Checks:** 151 Node tests passed. Playwright Internal/Thermal pixel checks across three
  angles at desktop/phone sizes; no clipping, overflow or browser exceptions. Reference,
  isolated and installed-context images visually inspected.
- **Open / next:** Only this part rebuilt. Research #07 Wonderwall/interface next; keep
  exact-scale verification, global callout layout and enclosure-layer views on the checklist.

### 2026-10-12: Add a surface operations queue and record the interior rebuild plan
- **Signed:** Codex (OpenAI).
- **Commit:** `Add surface operations queue and interior realism checklist`.
- **What changed:** Expandable queue for up to 12 fresh-sample, downlink and recharge steps;
  add/reorder/remove, explicit run/resume/stop, shared physics and time acceleration.
  Radio steps drain their starting FIFO boundary, recharge uses real simulated net power,
  and finished/remaining steps survive landed checkpoints without unattended restart.
- **Safety behavior:** Manual flight/competing commands and unsafe conditions stop the queue.
  Ordinary weather warnings slow it to 1x; recharge and strong-storm warnings stop for review.
  Global Pause preserves the job. Stop queue cancels an unfinished sample without refund.
- **Assumptions:** This is local training automation, not flight software or a verified
  uploaded schedule. Existing science timing/thermal assumptions remain unchanged.
- **Owner follow-up:** Reviewed `1000046285.mp4`; numbered markers visibly stack while
  orbiting. Code confirms one-axis screen-Y collision nudges without anchor leaders.
  `INTERIOR-REALISM-TODO.md` records the label fix, all 24 numbered assemblies, enclosure/
  insulation research and future layered views. No asset rebuild or label fix claimed yet.
- **Archive:** Prior 1ab20bc files/screenshots in `archive/operations-queue-2026-10-12`.
- **Checks:** All 148 Node tests pass, including 11 queue tests and existing motor/radio/
  endurance tests. Browser checks cover queue ordering, actual sampling, downlink manual
  stop, real recharge, pause/reload and 1440/390/360 px layouts with no page errors.
- **Next:** Fix annotation anchoring/occlusion first, then rebuild the carousel and remaining
  assemblies one at a time, with sourced casing and construction detail.

### 2026-10-12: Add science training profiles and compact mission sections
- **Signed:** Codex (OpenAI).
- **Commit:** `Add science profiles and expandable mission sections`.
- **What changed:** Retained the 30-second demo and added selectable LDMS/GCMS training
  profiles with staged power, shared thermal coupling, cancel, bounded time acceleration,
  component-follow progression and persistent per-sample budgets/downlink status.
- **Layout:** Science notebook and debrief is a native expandable section in both views.
  Records, methods/budgets and engineering references start collapsed. Page-section links
  improve navigation without removing controls/content or changing normal page scrolling.
  Opening the notebook no longer changes Pilot to Mission; flight auto-fit includes the nav.
- **Files:** `science-programs.mjs`, `science.mjs`, `mission-systems.mjs`, `save-game.mjs`,
  `app.js`, science/expedition/inspection readouts, markup/styles, tests and research notes.
- **Assumptions:** 10/30-minute timelines, stage loads, heat fractions and 40 Mbit record
  sizes are estimated training settings, not flight procedures. No chemistry, cup inventory
  or resolved oven temperature is claimed. See `research/science-profiles-2026-10-12.md`.
- **Archive:** Affected a115d4a files and desktop/phone screenshots preserved under
  `archive/science-profiles-2026-10-12` with matching tag.
- **Checks:** 137 Node tests including new UI syntax coverage. Browser checks at 1440,
  390 and 360 px cover real accelerated LDMS completion, bounded GCMS stages, one record
  per run, energy accounting, save/reload, collapsed defaults, keyboard notebook access,
  unique IDs and page overflow. No page errors in the profile workflow.
- **Open / next:** Verified full science schedules, cup inventory and an operations queue
  remain future work. Do not present solver compute times as real sample-processing times.

### 2026-10-12: Add interactive inspection and clarify simulation assumptions
- **Signed:** Codex (OpenAI).
- **Commit:** `Add interactive inspection and bounded reverse assist`.
- **What changed:** Mission Internal/Thermal now supports component focus, bounded zoom,
  opt-in orbit, assembly isolation and reset. Sampling-follow tracks the existing four
  science stages; pause uses the shared simulation hold. Camera controls do not steer the
  aircraft and the full model returns in Pilot/Exterior. Touch rotation is opt-in and
  native page scrolling/browser zoom remain available. Added local, credited Lucide icons.
- **Owner additions:** Expanded Model assumptions into sourced/approximate geometry,
  illustrative environment, simplified engineering and deliberate simulation additions.
  Corrected the fictional reverse assist to add a slight downward push through the climb
  apex, with reversed rotor animation. The extra acceleration is bounded at 0.2 m/s2 and
  cuts off at 0.6 m/s descent or below the existing 1 m clearance gate. The existing 50 W
  extra load and other manual-flight guards are retained; the ordinary landing flare stays.
- **Assumptions:** Inspection geometry and sample motion remain illustrative, not flight
  CAD or onboard imagery. Reverse assist remains explicitly fictional and off by default.
  No new science/thermal performance values or duplicate sampling clocks were introduced.
  Details: `research/interactive-inspector-2026-10-12.md`.
- **Archive:** Prior affected sources and desktop/phone screenshots preserved under
  `archive/interactive-inspector-2026-10-11`, from `8b12b3c` with matching archive tag.
- **Checks:** All 129 Node tests pass. Edge/Playwright checks cover desktop and 360/390 px
  phones, real canvas pixels/framing/orbit, isolation restoration, shared pause/follow,
  keyboard/pointer separation from flight, Ctrl zoom passthrough, icons and page errors.
  Screenshot review also removed the irrelevant rotor-diameter caption from close-ups.
- **Open / next:** Separately sourced LD/GC modes and realistic science scheduling remain
  future work; this milestone keeps the existing short educational sampling job.

### 2026-10-11: Animate the shared drill-to-lab sampling sequence
- **Signed:** Codex (OpenAI).
- **Commit:** `Animate state-linked Dragonfly sampling sequence`.
- **What changed:** The existing science clock now drives drill feed/rotation, pneumatic
  flow markers, carousel positioning and a DraMS activity cue. Science readouts identify
  the current stage instead of showing drilling and analysis simultaneously. Added a
  four-stage progress strip, pause status and an Inspect sample shortcut to the relevant
  Internal-view component. Mission and Pilot use the same job; the clean-room portrait
  stays stowed. Flow/activity markers do not alter Thermal colors.
- **Research / assumptions:** Rechecked NASA's Playing Lacrosse on Titan and April 2026
  carousel/DraMS integration report. Acquisition order is sourced; stage durations, cutter
  shape, 13 cm feed, slowed rotation, quarter-turn and flow markers are [EST]. The app labels
  these illustrative. The existing 30 s / 160 W job, data award, sampling guards, saved state,
  thermal model, flight physics and cameras are unchanged. Details and limits are recorded
  in `research/sampling-sequence-2026-10-11.md`.
- **Archive:** Prior affected sources and desktop/phone screenshots are in
  `archive/sampling-sequence-2026-10-11`, at `03ac4cf` and the matching archive tag.
- **Checks:** All 123 Node tests pass. Edge/Playwright verified actual sampling/inspection
  controls, pause, each stage via deterministic flight/science stepping, one result, Pilot
  and Mission access, and 360/390 px phone layouts. Desktop/phone canvas-pixel checks show
  visible, framed and moving flow markers. Screenshots reviewed; no page errors. Previous
  model/reference viewer tests also pass, including CAD playback and error/retry behavior.
- **Open / next:** Separate LD/GC science modes and realistic operation scheduling require
  additional sourcing; this remains a shortened educational sequence, not flight software.

### 2026-10-11: Refine the vehicle and add an official-reference viewer
- **Signed:** Codex (OpenAI GPT-6).
- **Commit:** `Refine Dragonfly inspection model and add credited references`.
- **What changed:** Mission now includes a collapsible NASA/APL reference viewer with the
  payload cutaway, full rotating CAD movie, design-date labels, source credits and NASA
  STL/3MF/guide links. Compact local viewing copies load on demand (about 4.3 MB total).
  Refined the curved forward cover, front apertures, arm flanges, coaxial motor housings,
  flat landing runners and shaped legs. Vertical body-side DrACO/feed assemblies and
  illustrative pneumatic lines replace the small skid-mounted drill nubs. The carousel
  now resembles the published pan-shaped assembly. IEM, two PSUs and Frontier radio are
  separately inspectable, with relevant live readings and primary-source links.
- **Assumptions:** Detail dimensions, exact placement, routing and 24 drawn carousel cups
  remain illustrative [EST]. Existing thermal zones provide the readings; no independent
  processor/PSU temperatures or currents were added. The procedural model was compared
  with APL references and NASA's assembly guide; no print meshes or flight CAD imported.
  The animated drill-to-lab sequence remains the next proposed milestone.
- **Archive:** Previous model, renderer, layer panel and desktop/phone images are in
  `archive/vehicle-inspection-2026-10-11`, tied to `231b221` and the matching archive tag.
- **Checks:** All 120 Node tests pass. Desktop/phone browser checks verified nonblank
  Exterior/Internal/Thermal rendering, framing, rotor movement, component selection,
  live updates without keyboard-focus loss, no horizontal overflow, lazy media loading,
  actual image/video decoding, playback pause, retry recovery and mock-model labels.
  APL browser requests reset during testing, so compact credited copies of the already
  preserved originals serve the viewer locally. No runtime browser errors.
- **Files:** `dist/vehicle-research.mjs`, Mission layer/reference UI, `dist/index.html`,
  `dist/styles.css`, reference assets/preparation script, render regression, research
  record, README, architecture and archive. No flight/camera/energy/thermal behavior changed.

### 2026-10-10: Record NASA/APL sources and preserve model reference media
- **Signed:** GPT/Codex (OpenAI, Codex desktop app)
- **Commit:** `Record official Dragonfly sources and model references`.
- **What changed:** Reviewed and indexed all eight owner-supplied links, noted existing
  citations, source conflicts and prioritized proposed improvements. Saved the APL
  rotating CAD video and payload PNG independently of the webpage, plus two video
  previews and attribution/source records. Added NASA's printable STL/3MF model and
  guides as a credited reference (Gary Allen Backus/Backus Creative Imaging).
  Added research links to README/compendium. Owner requested commit and push.
- **Files:** `research/source-review-2026-10-10.md`, `research/apl-spacecraft-models/`,
  `README.md`, `RESEARCH-COMPENDIUM.md`, `CHANGELOG.md`.
- **Assumptions:** Media are rendered references, not editable 3D meshes or verified
  final-flight CAD. No permissive asset license established; review before publishing.
- **Checks:** Original media opened; video decoded and multi-angle preview inspected;
  original SHA-256 hashes recorded; `git diff --check` clean and all 119 tests pass.
  No `dist/` or simulation/test changes.
- **Open / next:** Owner review of proposed changes; app implementation remains pending.

### 2026-10-10: Sparse mountains and a parked clean-room portrait
- **Signed:** Codex (OpenAI)
- **Commit:** Add sparse mountain landmarks and park the clean-room portrait
- **What changed:** Four isolated mountains, two with pointed summits, retain broad dune corridors
  and unchanged terrain around all existing landing sites. The same terrain height drives mesh,
  rocks and collision. Exterior B now shows a level, fixed-heading vehicle with stopped rotors
  and stowed antenna. Parked labels replace flight telemetry within that portrait only.
  Added projected skid contact shadows, purge-cart retaining band, handwheel and hose coupling,
  plus a small tool mat and tools on the red cart. The existing gentle floor perspective stays.
- **Assumptions:** Mountain positions and heights are illustrative [EST], not surveyed Titan
  topography. The assembly-room portrait does not pause or alter the live simulation.
- **Archive:** Previous terrain and live-pose room preserved with pictures and restore steps in
  `archive/sparse-mountains-and-parked-room`, with a tag at `19c0556`.
- **Checks:** Terrain footprint and landing-site regression tests; both vehicle models tested
  for stationary parked rendering and restoration of live attitude on other backdrops.
  All 119 tests pass. Browser-checked desktop and 390px phone layouts, plus the rendered skyline.
- **Open / next:** Further scenery adjustments only after reviewing the sparse layout in flight.

### 2026-10-09: Replace Exterior A/C with NASA imagery and refine the clean room
- **Signed:** Codex (OpenAI GPT-6).
- **Commit:** "Use cinematic NASA imagery for Exterior backdrops"
- **What changed:** Exterior A now uses a high-resolution still from NASA/APL's Dragonfly
  dune animation, cropped to exclude the animated aircraft. It preserves the original
  terrain and lighting and fits without stretching. Exterior C replaces the oversized
  painted Titan and cartoon Saturn with actual Cassini photographs: the full ring system
  and a small Titan atmospheric crescent, positioned within the canvas around the live
  model. The sparse illustrative star field stays within the frame. Exterior B retains
  the corrected floor perspective and adds projected ceiling-light reflections, epoxy
  grain, recessed perforation highlights, brushed equipment finishes, a purge gauge and
  casters. Phone carts stay above the bottom controls; larger equipment is reserved for
  wider views. Outlined telemetry remains legible against A's bright sky.
- **Files:** `dist/ui/{mission-backdrop,exterior-scenes,flight-view}.mjs`, `dist/index.html`,
  `dist/styles.css`, local images/credits in `dist/assets/exterior/`, preparation script and
  original NASA downloads in `research/`, README, ARCHITECTURE and archives.
- **Assumptions:** A is explicitly credited as an artist's concept, not a Titan photograph;
  C is a photographic composite, not to scale, with illustrative stars. B remains an
  illustrative room, not a real NASA/APL facility. No new simulation assumptions.
  No image-generation service was used. Images total about 511 KiB, served locally and cached.
- **Checks:** All 117 Node tests pass. Desktop (1440x900) and phone (390x844) screenshots of
  each scene reviewed; contrast and phone equipment overlaps corrected. No browser errors.
- **Archive:** `archive/exterior-backdrops-v2/`, including old code, desktop/phone pictures,
  intermediate composition checks and restore instructions. Tag at `aaf1349`.
- **Open / next:** Pilot terrain and mountain-ridge proposals remain unchanged.

### 2026-10-09: Restore scrollable Pilot page and finish reviewed fixes
- **Signed:** Codex (OpenAI coding agent); clean-room projection by Claude, preserved and reviewed by Codex.
- **Commit:** "Restore scrollable Pilot page and finish review fixes"
- **What changed:** Only the Pilot flight box fits the available browser height. All telemetry,
  live flight graphs, vehicle/environment controls, rotor/science/comms data, mission sections,
  day checklist and footer remain below it on desktop and mobile. Optional fullscreen expands
  only the flight box, with an in-tab fallback when the native API is denied. Mission keeps its
  existing layout. Browser Ctrl/Meta shortcuts bypass flight keys. Reset is visible beside
  Diagnostics, still uses tap-twice confirmation, and remains available at the footer.
- **Other fixes:** One flight is counted until actual touchdown, not each low-hover crossing.
  Dust expires across long gaps outside Pilot without backfilling emissions; pause and clock
  reset remain correct. Narrow Mission thermal/internal labels and background controls no
  longer collide. Claude's gentler clean-room floor perspective keeps the detailed tiles and
  equipment. README's duplicate smaller-dune description was corrected to the retained terrain.
- **Files:** `dist/ui/pilot-layout.mjs` (new), `dist/styles.css`, `dist/index.html`, `dist/app.js`,
  `dist/ui/{controls,persistence,chart,mission-backdrop}.mjs`, `dist/titan-day.mjs`,
  `dist/downwash-dust.mjs`, regression tests, README and archive records.
- **Assumptions:** No new flight, thermal or environmental assumptions. Existing illustrative
  backdrops, merged weather/expedition behavior and explicitly fictional reverse brake retained.
- **Checks:** All 117 Node tests pass. New counter and dust regressions failed before the fixes
  and pass after them. Browser checks covered desktop and narrow phone Mission labels, fitted
  Pilot, scrolling to graph and footer, fullscreen entry/exit and switching back to Mission.
  Reset confirmation was checked without deleting the user's saved progress.
- **Archive:** `archive/cleanroom-steep-floor/` and `archive/pre-review-fixes-2026-10-09/`,
  with pictures, restore steps and corresponding tags at `665a669`.
- **Open / next:** Mountain ridge and mixed-terrain ideas remain pending approval, unchanged.

### 2026-10-09: More detailed Exterior backdrops a / b / c
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Make the Exterior backdrops more detailed"
- **What changed:** The owner asked for the three Exterior backdrops to be "a lot cooler" with
  more detail. (a) Titan ground: a lit dune with ripples and a bright crest fading into haze,
  bright and dark ground patches, wind streaks, gravel, rounded icy cobbles with highlights and
  shadows, a rain-dampened patch and thin ground fog. (b) Clean room: perforated raised floor
  with light reflections, striped KEEP OUT tape, a nitrogen purge cart hosed to the vehicle, tool
  cart, work stand, ladder, crate, cable cover, ESD ground strap, and a wall with an observation
  window, grilles and a sign; on a phone the equipment moves off the tape. (c) Poster: the Milky
  Way with dust lanes, colored and spiked stars, Saturn with bands, the C/B/A rings, Cassini
  Division and Encke Gap and the ring shadow, a small moon, and Titan with haze mottling, methane
  clouds, the north polar hood, a night side and the detached blue haze layer. Saturn no longer
  sits under the telemetry text.
- **Archive:** the first versions are in `archive/exterior-backdrops-v1/` (pictures at desktop
  and phone size, code, tag `archive/exterior-backdrops-v1` at 3b0dfc3). Two drafts fixed before
  publishing (gear under the telemetry text; gear on the tape and Saturn by the title on a
  phone) are in `archive/mission-backdrop-drafts/`.
- **Files:** `dist/ui/mission-backdrop.mjs`, `archive/exterior-backdrops-v1/` (new),
  `archive/mission-backdrop-drafts/`, `archive/README.md`, `README.md`
- **Assumptions:** the clean-room equipment, signs and layout are generic illustrations, not
  the real Dragonfly facility (no logos). Ground fog and cobble sizes are artistic, based on the
  Huygens surface images.
- **Checks:** `node --test tests/*.test.mjs` (115 pass). All three viewed at 1280x800 and phone
  size (375x812); no console errors from the app.
- **Open / next:** the semi-jagged mountain ridge request; the hybrid terrain suggestion.

### 2026-10-09: White grid on the Thermal "Titan air" backdrop
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add a white grid to the Titan-air thermal backdrop"
- **What changed:** The owner noticed Thermal option a had no visible grid. It now has a white
  grid at the same weights as the yellow one (1 px at 20% every 12 px, 2 px at 60% every 60 px).
  The grid drawing is shared by all the grid backdrops. The gridless look is archived in
  `archive/thermal-air-no-grid/` (tag `archive/thermal-air-no-grid`, commit fb9b232). House rule 7
  reworded at the owner's request: check the README, change log and branches once at the start
  of a session or after time away, not before every request.
- **Files:** `dist/ui/mission-backdrop.mjs`, `archive/thermal-air-no-grid/` (new),
  `archive/README.md`, `README.md`, `ARCHITECTURE.md`
- **Checks:** `node --test tests/*.test.mjs` (115 pass). Thermal a viewed at 1280x800; no console
  errors.
- **Open / next:** the semi-jagged mountain ridge request; the hybrid terrain suggestion.

### 2026-10-09: Merged GitHub Copilot's branch (Reverse brake, weather, first expedition, temperature views)
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Merge Copilot's reverse brake, weather, expedition and temperature views"
- **What changed:** The owner found their "Reverse (sim)" button missing. It was on the unmerged
  branch `tboy450-project-improvement-priorities` (GitHub Copilot, 2026-10-04, commits 5a5b98e and
  0c9e506; their entries are below, dated 2026-10-04). At the owner's request the whole branch
  was merged into `main`: the Reverse (sim) climb brake beside "Throttle: sticky", Titan weather
  (gusts, methane-rain events with warnings, storm training), the First expedition, fixed
  temperature colors and the collapsible Component temperatures panel.
- **Conflict decisions:**
  - Terrain: kept the published-size Ahmakiq Undae dunes (75-120 m tall, ~3.2 km apart) over
    Copilot's own dune field (35-60 m, ~620 m apart). Copilot's landscape is archived with
    pictures and its test in `archive/copilot-dune-terrain/`. Copilot's weather wetness, storm
    haze, outcrop greying and base landing pad were added to our terrain by hand.
  - Thermal colors: adopted Copilot's fixed anchors (a temperature keeps its color in every
    range); the previous range-relative scale and open parts list are archived in
    `archive/thermal-scale-range-relative/`. The air loop panel sits after the new collapsible
    panel; the thermal "Titan air" backdrop now uses the fixed color.
  - Sampling: kept Codex's 2026-10-04 interruption rules (thermal/energy restriction, leaving
    the target) and added Copilot's battery-margin stop. Saves keep both the day log and the
    expedition. Landing message mentions both the interdune and the First expedition.
  - Weather vs. the day cycle: a storm warning now stops "Sleep until morning"; the lander stays
    asleep and the report says why (new test). The calm-night test uses fixed weather.
  - Copilot's dune-corridor test was adapted to our layout (its original is archived).
- **Process lesson:** this week of work on `main` started without checking other branches. A
  start-of-session branch check is now house rule 7 and in the notes above.
- **Files:** all of the branch's files, plus `dist/titan-terrain.mjs`, `dist/titan-day.mjs`,
  `dist/ui/mission-backdrop.mjs`, tests, archives, `ARCHITECTURE.md`, `RESEARCH-COMPENDIUM.md`
- **Checks:** `node --test tests/*.test.mjs` (115 pass, including Copilot's reverse-brake,
  weather and expedition tests). Browser: Reverse buttons beside both throttle buttons, weather,
  expedition, component temperatures, air loop, day strip and sound all present at phone size
  with no console errors. Same-viewpoint terrain comparison pictures were made for the owner.
- **Open / next:** the owner asked for a semi-jagged mountain ridge in at least one place on the
  local map, labeled as not realistically located (see RESEARCH-COMPENDIUM "Future update
  requests"). Suggested to the owner, awaiting an answer: our dune sizes with Copilot's subdued
  ground texture and stronger dune contrast.

### 2026-10-09: Thermal and Internal backdrop choices (light grey, yellow grid)
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add light-grey and yellow-grid backdrops for Thermal and Internal"
- **What changed:** The owner noted that cold (blue) parts are hard to see on the thermal
  background, and that recoloring them would misstate their temperature. Instead:
  - Thermal gets the a / b / c picker: (a) Titan air (the previous one), (b) light grey with a
    dark grid, the style of NASA's published thermal-model figures, now the default, (c) black
    with a yellow grid, made thicker and brighter at the owner's request (1 px at 20% and 2 px at
    60% instead of 1 px at 7% and 22%).
  - Internal gets a / b: (a) the blueprint, (b) black with a yellow grid and yellow dimension
    lines, labels, title block and readouts.
  - Readouts (ALT, V/S, SPD, ROLL, PITCH, WIND) take their colors from the backdrop: dark with a
    light halo on light grounds (light grey, clean room), yellow in the yellow modes.
  - The picker shows in every layer, hides its third button where there are two choices, and
    each layer remembers its choice. The title block and the mock-up note moved up above it.
  - Nothing published was replaced (Titan air stays as option a). The two unpublished drafts
    (faint yellow grid, white text on light grey) were archived in
    `archive/mission-backdrop-drafts/` with pictures and code.
- **Files:** `dist/ui/mission-backdrop.mjs`, `dist/ui/flight-view.mjs`, `dist/index.html`,
  `dist/styles.css`, `archive/mission-backdrop-drafts/`, `archive/README.md`, `README.md`
- **Checks:** `node --test tests/*.test.mjs` (86 pass). At 1280x800: Thermal b and c and
  Internal b render with readable readouts; the Internal picker shows a / b only; no console
  errors.
- **Open / next:** the "Reverse (sim)" brake, Titan weather and first expedition still wait on the
  unmerged branch `tboy450-project-improvement-priorities`.

### 2026-10-08: Realistic air loop in the Internal diagram
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Show how the warm-air loop moves, is regulated and is measured"
- **What changed:** The owner asked for more realistic airflow: how it moves, how it is regulated
  and how it is measured. In the Internal layer:
  - Moves: 40 arrows around the published loop (MMRTG, fan, under-floor duct, nose, bay), their
    speed following the modeled flow (0.052 kg/s x fan setting x fan health) and their color going
    from MMRTG-warm to bay-cool; slowed for viewing.
  - Regulated: when the trim device opens, up to 10 arrows per side take the cold-duct bypass
    through each side chimney and turn blue; the foam-covered flaps swing open with the trim
    setting (40% flow at about 24 degrees [EST], near the 23.7 degrees of the 2024 test [PUB]).
  - Measured: two green sensor dots, the battery temperature and the MMRTG fin-root temperature,
    the published controller inputs, are new numbered parts with live temperatures.
  - Arrows are drawn over the parts so the paths through boxes and chimneys stay visible.
  - A live "Warm-air loop" panel under the diagram: flow, MMRTG gas and bay temperatures, duct
    gas speed (~4 m/s, estimated from the modeled duct section), trim share and heat dumped, the
    next controller adjustment, and an honest note that Dragonfly uses two alternating
    controllers while this simulator uses one simplified loop; plus the ground test's 203
    thermocouples and 15 air-velocity sensors.
  - The blueprint's "1.75 m" label now stays clear of the telemetry readouts.
  - Archived first (house rule 6): `archive/airflow-arrows-v1/`, tag `archive/airflow-arrows-v1`
    (commit c6a7f07).
- **Files:** `dist/vehicle-research.mjs`, `dist/chase-vehicle.mjs`, `dist/ui/layers-panel.mjs`,
  `dist/ui/mission-backdrop.mjs`, `dist/index.html`, `dist/styles.css`,
  `tests/render-smoke.test.mjs`, `archive/airflow-arrows-v1/` (new), `archive/README.md`,
  `README.md`
- **Assumptions:** loop route, flow rate, trim range and steps, controller inputs and test
  instrumentation are published [PUB]; the bypass path, flap-angle mapping, sensor placement,
  duct gas speed and arrow look are estimates [EST].
- **Checks:** `node --test tests/*.test.mjs` (86 pass; new test: no cold-duct arrows with the
  flaps closed, ten per side and a 24-degree flap fully open, no loop with the fan stopped).
  Browser at 1280x800: arrows over the parts, blue bypass at 30% trim, live panel text; no
  console errors.
- **Open / next:** the owner's "Reverse (sim)" brake, Titan weather and first expedition are on
  the unmerged GitHub branch `tboy450-project-improvement-priorities` (GitHub Copilot, Oct 4).

### 2026-10-08: Archived the Mission backdrop drafts
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Archive the Mission backdrop drafts"
- **What changed:** The owner asked to archive the in-between states of the new backdrops as well.
  `archive/mission-backdrop-drafts/` keeps the blueprint with its "1.75 m" label cut off, the
  tiled ground photo with seams, and the true-color thermal background where parts at air
  temperature blend in (rendered once for the archive, then reverted; never published), each
  with its code and pictures next to the published versions. The archive rule now says drafts
  fixed before publishing are kept too.
- **Files:** `archive/mission-backdrop-drafts/` (new), `archive/README.md`, `CHANGELOG.md`
- **Checks:** no app code changed (the temporary render setting was reverted; `git diff` clean
  before this commit).
- **Open / next:** none.

### 2026-10-08: Mission diagram backdrops per layer, with an a/b/c picker
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Give each Mission layer its own backdrop"
- **What changed:** The owner chose new backgrounds behind the vehicle diagram:
  - Exterior, picked with small a / b / c buttons at the bottom left (choice remembered):
    (a) Titan landing area from above: Huygens-image ground, icy pebbles, a dune and haze at the
    far edge, a soft shadow; (b) an assembly clean room (perspective floor tiles, keep-out line,
    panel wall, work stands; generic, no logos); (c) a Titan-and-Saturn poster, labeled as
    illustrative because Saturn is hidden by haze from the surface.
  - Internal: an engineering blueprint grid with dimension lines for the published envelope
    (3.85 m long, 3.85 m wide, 1.75 m tall), projected from the model so they line up, and a
    title block. The mock-up original model gets no dimensions.
  - Thermal: the thermal scale's color for Titan's -179 C air, dimmed so parts at air
    temperature stay visible (noted on screen), with drifting cold-air streaks.
  - Telemetry text now has a dark halo so it reads on the light clean-room floor.
  - Archived first (house rule 6): `archive/mission-grid-backdrop/` with the old drawing code and
    pictures of all three layers at desktop and phone size; tag `archive/mission-grid-backdrop`
    (commit 417c91b). The unused grid function was then removed.
- **Files:** `dist/ui/mission-backdrop.mjs` (new), `dist/ui/flight-view.mjs`,
  `dist/chase-vehicle.mjs`, `dist/app.js`, `dist/index.html`, `dist/styles.css`,
  `tests/render-smoke.test.mjs`, `archive/mission-grid-backdrop/` (new), `archive/README.md`,
  `README.md`, `ARCHITECTURE.md`
- **Assumptions:** the envelope dimensions are published [PUB]; the scenes are artistic [EST].
- **Checks:** `node --test tests/*.test.mjs` (85 pass; new test that the Internal layer returns
  the three published dimensions with visible on-screen lengths, and none for the mock-up model).
  All five backdrops viewed at 1280x800 and phone size; the picker shows only in the Exterior
  layer of the Mission view; no console errors.
- **Open / next:** none.

### 2026-10-08: Rotor-wash dust and Titan acoustics
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add rotor-wash dust and Titan acoustics"
- **What changed:**
  - Dust: the owner asked for landing dust when close to the ground with the throttle up. Hover
    wash at the ground is about 4.4 m/s [CALC: sqrt(W / 2 rho A) from the published mass,
    gravity, density and rotor size]; sand moves above about 1 m/s. Dust strength follows
    rotor speed, fades to zero by about 6 m up, grows with a hard climb, is swept behind in fast
    flight, and depends on the ground (dune 1.3, interdune 1, outcrop 0.4, damp 0.2, puddle 0).
    Up to 48 soft sprites roll outward, rise and fade, staying where they were raised; dust
    between the camera and the vehicle is kept thin. The arrival's touchdown dust is unchanged
    (nothing replaced, so nothing to archive).
  - Acoustics, after the owner asked whether Titan would change the sound: speed of sound 194 m/s
    at the surface [PUB, Huygens Surface Science Package], so arrival thumps are delayed by
    camera distance / 194 m/s (about 0.6-1 s at 120-190 m); wind noise weighted by Titan's air
    density (dynamic pressure); a sand hiss with the rotor-wash dust. Pitches set by rotation
    are unchanged. The ~2.5x sound pressure from denser air (+8 dB) is documented but levels
    stay artistic.
- **Files:** `dist/downwash.mjs` (new), `dist/downwash-dust.mjs` (new), `dist/chase-vehicle.mjs`,
  `dist/sound-mix.mjs`, `dist/ui/sound.mjs`, `tests/downwash.test.mjs` (new),
  `tests/sound.test.mjs`, `tests/render-smoke.test.mjs`, `README.md`, `ARCHITECTURE.md`
- **Assumptions:** the 6 m reach, the 1 m/s sand threshold (order of the published Titan
  threshold wind), the ground factors, particle counts and look are estimates [EST].
- **Checks:** `node --test tests/*.test.mjs` (84 pass; new tests for the hover wash value, dust
  only near the ground with the rotors working, more with throttle and climb, less in fast flight,
  ground kinds, dust appearing and clearing in the renderer, the 194 m/s thump delay, density-
  weighted wind and the dust hiss). Browser at phone size: dust when hovering at 1.5 m on the
  interdune and on a dune, none at 30 m; no console errors.
- **Open / next:** the owner asked for ideas for the Mission diagram backgrounds.

### 2026-10-08: House rule: archive replaced work
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add the archive-everything house rule"
- **What changed:** The owner set a standing rule: "we always store replaced assets in archive;
  we don't throw away digital work, even bad or inaccurate work". Added as house rule 6 in
  ARCHITECTURE.md, to the notes for every session above, and to `archive/README.md`.
- **Files:** `ARCHITECTURE.md`, `CHANGELOG.md`, `archive/README.md`
- **Checks:** documentation only.
- **Open / next:** earlier replacements that live only in git history could be archived the
  same way (see the list in `archive/README.md`).

### 2026-10-08: Lander settles onto sloped ground; sleep until morning
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Settle the lander onto sloped ground and wake after sunrise"
- **What changed:**
  - Landing angle: near the ground the vehicle now rests on its skids. The rendered ground
    under the four skid ends defines a plane; the vehicle pitches and rolls to match it (fully
    on the ground, fading out by 3 m up) and its height follows that plane, so every skid end
    touches the ground on slopes such as the dune flanks (about 10-12 degrees). Both models,
    each with its own skid footprint.
  - Day cycle: "Sleep until dawn" became "Sleep until morning" and wakes at 08:00 local instead
    of 06:00. At dawn the sun is at the horizon and the scene was nearly black, against the
    owner's wish to keep the light visible; at 08:00 it is well lit. The operations day still
    rolls over at 06:00.
- **Files:** `dist/chase-vehicle.mjs`, `dist/titan-day.mjs`, `dist/ui/day-strip.mjs`,
  `dist/app.js`, `dist/index.html`, `tests/render-smoke.test.mjs`, `tests/titan-day.test.mjs`,
  `README.md`
- **Assumptions:** the skid footprints are taken from each model's own geometry; the 3 m
  blend and the 08:00 wake-up are simulator choices [EST]. Flight physics is unchanged (only
  the drawn attitude settles onto the ground).
- **Checks:** `node --test tests/*.test.mjs` (79 pass; new test: on an 11-degree dune flank all
  four skid ends of both models are within 12 cm of the ground at four headings, and the
  vehicle tilts more than 8 degrees; before this change the ends were about 0.2 m off). Frames
  at phone size, midday, on the flank across and up the slope.
- **Open / next:** none.

### 2026-10-08: Archived the paddle rotor blades as an asset
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Archive the paddle rotor blades as an asset"
- **What changed:** At the owner's request, the NASA model's former flat "paddle" blades are
  archived next to the old terrain: `archive/paddle-blades/` with the blade and a three-blade
  rotor as OBJ files (metres, at the published 1.35 m rotor scale), before/after pictures, and
  restore steps; git tag `archive/paddle-blades` (commit 775b502, the last version using them on
  the NASA model). New `archive/README.md` lists every archived item.
- **Files:** `archive/paddle-blades/` (new), `archive/README.md` (new)
- **Checks:** OBJ files checked by reading them back; no app code changed.
- **Open / next:** none.

### 2026-10-08: Time-scaled Titan day cycle
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add a time-scaled Titan day cycle"
- **What changed:** The owner asked for the real mission rhythm as a scaled, interactive cycle
  with shorter literal cycles, stated somewhere.
  - A Titan day strip in the Mission view (hidden in Pilot view): day number, local Titan time
    and phase, a day/night bar with a marker, and the day's checklist in the published order:
    send data home, one flight, sample science, then night (recharge, seismic and weather).
  - **Sleep until dawn:** hibernates through the rest of the day and the night at 2,400
    simulated seconds per frame (about 7 s at 60 fps), wakes at 06:00 and posts a morning
    report (battery before and after, seismic events, data waiting).
  - A second flight in one Titan day is allowed; the alert bar says "Extra flight: the plan is
    one flight per Titan day".
  - The time scale is stated on the strip and in the README.
  - The day's checklist is saved with the mission (`dayLog`).
- **Files:** `dist/titan-day.mjs` (new), `dist/ui/day-strip.mjs` (new), `dist/app.js`,
  `dist/mission-systems.mjs`, `dist/save-game.mjs`, `dist/index.html`, `dist/styles.css`,
  `tests/titan-day.test.mjs` (new), `README.md`, `ARCHITECTURE.md`, `RESEARCH-COMPENDIUM.md`
- **Assumptions:** the cadence (about one daylight flight per Titan day; recharge, seismic and
  weather work at night) and the 382.7 h day are published [PUB]; the dawn-to-dawn day, the
  phase names, the compression rate and the report wording are simulator choices [EST].
- **Checks:** `node --test tests/*.test.mjs` (78 pass; new tests for the day boundaries, the
  checklist and its reset at dawn, the extra-flight advisory, and a full sleep that recharges,
  logs the night and wakes at dawn). In the browser at phone size: the strip renders, "Sleep
  until dawn" ran 431 frames (about 3 ms each), woke at 06:00 on day 2 with the report shown.
- **Open / next:** none of the approved list remains. Optional later: a real-browser check on
  publish; dimmer, softer Titan lighting (on hold by the owner).

### 2026-10-08: Optional sound
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add an optional synthesized soundscape"
- **What changed:** The owner agreed sound "isn't a terrible idea". A **♪ Off / ♪ On** button sits
  next to Mission and Pilot; sound is off by default and the choice is remembered (a remembered
  "on" starts at the next click or tap, as browsers require). All synthesized with Web Audio, no
  files: rotor chop pulsed at the blade-pass frequency with its low tone, a faint motor whine,
  wind that rises with wind, flight and climb speed, and in the arrival the entry roar,
  parachute flutter and a thump (low boom plus crack) at each separation. Sound pauses when the
  page is hidden. Localhost-only debug hook `window.dragonflySound()`.
- **Files:** `dist/sound-mix.mjs` (new), `dist/ui/sound.mjs` (new), `dist/app.js`,
  `dist/index.html`, `dist/styles.css`, `tests/sound.test.mjs` (new), `README.md`, `ARCHITECTURE.md`
- **Assumptions:** blade-pass frequency follows the simulated rpm and the published three
  blades [PUB/CALC]; the 7 pole pairs, levels, filters and arrival sounds are artistic [EST].
- **Checks:** `node --test tests/*.test.mjs` (75 pass; new tests for quiet at rest, rotor pitch
  and gain, wind with speed, entry roar, parachute flutter and one thump per event). In the
  browser: off by default, the button toggles and is remembered, a remembered "on" waits for a
  tap, then the audio runs (rotors silent at rest, faint wind); off again suspends it; no console
  errors. Header fits on a phone in both views. Sound itself was not listened to on this machine.
- **Open / next:** time-scaled mission rhythm.

### 2026-10-08: Refined NASA drone model (blades, hubs, blur discs, fins, skids)
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Refine the NASA model's rotors, fins and skids"
- **What changed:** The owner approved refining the NASA/APL 2023 model, whose rotor blades were
  flat paddles.
  - Blades: a real 3D blade per rotor arm, tapered (chord 0.115 to 0.075 units, rounded tip,
    slim root cuff), twisted (17 to 5 degrees), with a thin cambered section. The blade is
    mirrored on counter-rotating rotors so the leading edge always leads.
  - Hub caps on every rotor, facing away from the motor.
  - Spinning rotors: a faint disc, denser toward the tips, fades in with rotor speed (replaces
    the ghost-blade trails on this model; hidden in the Mission diagram layers).
  - Fins with softly beveled edges; skids with rounded bends and tips.
  - The original demo model is unchanged.
- **Files:** `dist/vehicle-research.mjs`, `dist/chase-vehicle.mjs`, `README.md`, `ARCHITECTURE.md`
- **Assumptions:** blade chord, twist, thickness and camber are estimates from the 2023 drawings
  and common rotor practice [EST]; the three-blade, 1.35 m rotors and the overall envelope are
  published [PUB].
- **Checks:** `node --test tests/*.test.mjs` (73 pass). Envelope still 3.85 x 3.96 x 1.74 m
  (published 3.85 x 3.85 x 1.75; test tolerance 0.12 m). Before/after frames of the Mission
  diagram (exterior and internal) and the flight view at rest and with rotors at 720 rpm.
- **Open / next:** optional sound; time-scaled mission rhythm.

### 2026-10-08: Landing area Ahmakiq Undae finished and published
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Finish the Ahmakiq Undae landing area"
- **What changed:** Completed the landscape change started on Sep 30 (code committed by Codex on
  Oct 4 as "Commit landing-area dunes and arrival camera framing"). The landscape follows the
  published description of Dragonfly's landing area, Ahmakiq Undae (IAU, Sept 2026; NASA
  Dragonfly blog 2026-09-02): dunes and interdunes south of Selk crater, reaching to hills.
  - Terrain: the base sits in a ~2 km interdune corridor between linear dunes 75-120 m tall,
    ~1.2 km wide and 3.2 km apart, trending 8 degrees north of east, with the archived map's
    photo-textured hills beyond the northern dune. Interdune floor: broad swells, low hummocks
    and gravel. The dry outcrop pad now sits 0.8 m above the local ground instead of a fixed
    1.4 m.
  - Look: dark dune sand with long streaks and fine ripples; no pebbles on dunes; the interdune
    keeps the Huygens-image texture.
  - Arrival: under the main parachute the camera swings to look north across the dunes and back
    before release (`cameraAzimuth` in `edl.mjs`).
  - Wording: the in-app note on geography, the landing message ("Landed in an interdune of
    Ahmakiq Undae"), the site-layout comment, README (new "Landing Area" section), ARCHITECTURE,
    the research audit table, and the classic-peaks archive's restore note.
- **Files:** `dist/index.html`, `dist/ui/arrival.mjs`, `dist/mission-systems.mjs` (comment),
  `README.md`, `ARCHITECTURE.md`, `RESEARCH-COMPENDIUM.md`, `archive/classic-peaks-terrain/README.md`
  (terrain, camera and shading code are in Codex's Oct 4 commit)
- **Assumptions:** the name, the dune/interdune setting, the hills and the dune sizes are
  published [PUB]; the exact layout, sand colors, outcrop and sites are illustrative [EST]. The
  owner said landing sites do not need to stay away from dunes, so there is no such rule.
- **Checks:** `node --test tests/*.test.mjs` (73 pass). Frames at 1280x800 and phone size: the
  northern dune as a long ridge with hills beyond during the descent, the interdune from 60 m
  looking south, and a dune flank close up.
- **Open / next:** drone model refinement, optional sound, and a time-scaled mission rhythm.
  This push also publishes Codex's Oct 4 survey-sampling fixes.

### 2026-10-04: Unify survey sampling and block analysis during hibernation
- **Signed:** Codex (OpenAI, Codex desktop app)
- **Commit:** "Fix survey science results and sampling hibernation guards"
- **What changed:** Guided survey acquisition and Sample here now use one DrACO/DraMS job. Both produce one lab result and one sample data packet; sampling at the active survey target also advances the objective. Instrument power is counted once and the last time step is prorated. Hibernation is blocked during analysis, with matching disabled buttons and a status message. Leaving the target or losing safe thermal/energy conditions interrupts acquisition without awarding a result; forced hibernation also aborts it.
- **Files:** `dist/science.mjs`, `dist/mission-systems.mjs`, `dist/ui/readouts.mjs`, sampling tests and `ARCHITECTURE.md`
- **Assumptions:** Existing illustrative 30 s, 160 W and 40 Mbit sample parameters are unchanged; these are not published mission performance.
- **Checks:** All 73 Node tests passed. New regressions cover both controls, data/results, single power accounting at different time steps, interruption/restart, hibernation guards and downlink availability. The local browser showed a 275 W sampling load, a completed result with 40 Mbit added, enabled hibernation again after completion, disabled both buttons during the next analysis with the new status message, and reported no console errors.
- **Open / next:** These fixes and the preceding terrain/camera commit are local commits, not yet pushed or deployed.

### 2026-10-04: Commit the existing landing-area terrain and arrival camera
- **Signed:** Codex (OpenAI GPT-6, Codex desktop app; reviewed and committed existing edits)
- **Commit:** "Commit landing-area dunes and arrival camera framing"
- **What changed:** Preserved the local Ahmakiq Undae terrain update: an interdune corridor between long dunes, hills farther north, dark sand shading, fewer exposed rocks on dunes, and a raised dry outcrop. Preserved the arrival camera's northward sweep under the main parachute and return before release.
- **Files:** `dist/titan-terrain.mjs`, `dist/edl.mjs`, `dist/app.js`
- **Assumptions:** The dune layout, sand appearance and camera motion remain illustrative [EST]. The previous mountain-basin map remains archived.
- **Checks:** The preceding review passed all 68 tests and checked the local browser for rendering errors.
- **Open / next:** Fix the separate survey/science and sampling/hibernation issues identified in the review.
### 2026-10-04: Tiny opt-in simulated reverse-thrust climb brake
- **Signed:** GitHub Copilot (GPT-6.1 Sol / Copilot App)
- - **Commit:** "Add Titan weather and optional reverse braking"
- **What changed:** Added synchronized "Reverse (sim)" toggle buttons beside
  "Throttle: sticky" in Mission and Pilot. Off by default, with off / armed / braking
  states. At exactly 0% manual throttle while still rising above 1 m, the fictional
  pulse adds a small downward acceleration to arrest upward momentum sooner. It
  stops once upward motion is gone; it cannot add downward speed or alter the gentle
  landing flare. Auto, guidance, flight plans/uplink, altitude hold, safety descent,
  arrival, liquid avoidance and pause retain their existing behavior. Rotor readings
  show a small pulse without negative-throttle square roots; the pulse's extra electrical
  load reaches the energy/thermal model. Landed saves retain the setting, not an active pulse.
- **Files:** Flight model, save module, controls/readouts, markup/styles,
  `tests/reverse-brake.test.mjs`, README, architecture and research compendium.
- **Assumptions:** Explicitly fictional training convenience, not real Dragonfly
  reverse thrust. Extra braking 0.2 m/s², nominal pulse 160 RPM and extra load 50 W
  are [EST]. The normal 0-100% throttle range and descent/touchdown limits are unchanged.
- **Checks:** Flight/save regressions, measured earlier climb arrest and touchdown,
  finite RPM, bounded acceleration, power cost, all activation gates, multiple frame
  rates, pause, saved setting and atomic rejection of malformed settings. Real
  Edge/WebGL checked synchronized buttons, keyboard and stick zero throttle, phone
  taps, portrait/landscape placement, landing and reload; no browser errors.
- **Open / next:** Feature-branch change; GitHub Pages is unchanged until merged
  into `main`.

### 2026-10-04: Titan-inspired gust and methane-rain training weather
- **Signed:** GitHub Copilot (GPT-6.1 Sol / Copilot App)
- **Commit:** "Add Titan weather and optional reverse braking"
- **What changed:** Added seeded occasional gusts and rarer methane-rain scenarios with
  advance advisories, gradual build/peak/recovery and fixed-wind controls. New missions
  receive browser-random seeds; old saves retain their fixed wind. Diagnostics offers an
  explicit stronger methane-storm stress scenario, and new flight plans are NO-GO until
  it finishes. Existing flights are not automatically aborted. Slider edits select fixed
  wind, which also ends an active event. Pause freezes weather; accelerated rest stops
  at a new warning. Landed checkpoints retain the phase, RNG, recent advisories and wetness.
  Weather drives existing wind/convection/power calculations rather than inventing
  ambient hot/cold fronts. Pilot haze thickens, lighting dims and the existing damp
  interdune darkens/glosses after rain; it dries gradually without new puddles or hazards.
  Added compact Pilot warnings and a short-landscape HUD arrangement to keep the warning
  and systems readings clear of the flight controls.
- **Files:** `dist/weather.mjs`, flight model/planner, save module, terrain/renderer,
  UI controls/readouts/Pilot HUD/fallback, markup/styles, weather and rendering tests,
  README, architecture and research compendium.
- **Assumptions:** All event frequencies, wind profiles, warning lead times, compressed
  durations and visual effects are [EST], clearly labeled. Automatic events stay within
  1.6 m/s; only explicit strong training reaches up to 4.5 m/s. Cassini's methane-cloud,
  equatorial rain and inferred dust-storm observations motivate the scenarios, but do not
  establish local forecasts or those values. Ambient stays -179.15 C. No validated storm
  aerodynamics, atmospheric fronts, flooding or sample-chemistry changes are claimed.
- **Checks:** All 96 Node tests pass, including simulation/save/planner/renderer regressions, warning lead,
  bounded smooth winds, seed continuity, weather-dependent heat rejection, legacy and
  malformed saves, rain drying, pause/arrival isolation and accelerated-rest warning stop.
  Real Edge/WebGL exercised controls, warnings/peak, actual shader compilation, fog/wetness,
  paused/save/restored weather, legacy startup and phone portrait/landscape layouts;
  higher-priority thermal alerts remain visible alongside weather.
- **Open / next:** Feature-branch change, not a Pages deployment. Maintained browser CI,
  portable saves/status and actual landing-hazard assessment remain separate backlog work.

### 2026-10-04: Stable temperature colors when zooming the legend
- **Signed:** GitHub Copilot (GPT-6.1 Sol / Copilot App)
- **Commit:** "Add first expedition and improve temperature views"
- **What changed:** Removed range-relative color normalization. Both readings and the Thermal
  mesh now use fixed temperature anchors: cold blue, green at 0-20 C, warming yellow and
  red from 35 C. Whole-lander/inside changes only the visible legend window; its gradient
  positions follow the same temperature anchors, so a 10 C part stays green in both ranges.
- **Files:** `dist/thermal-scale.mjs`, layers panel, renderer, flight view, markup, README.
- **Assumptions:** Green uses the documented landed battery/equipment reference band, not a
  universal optimum. The panel explicitly explains that exterior parts and MMRTG gas have
  different targets and that colors are not fault indicators.
- **Checks:** All 78 Node tests pass, including fixed color anchors, legend positions and
  actual mesh-material colors for both models. Edge/WebGL verified both panels, both ranges,
  cold/middle/hot readings and the shared gradient logic.

### 2026-10-04: Shared temperature colors and scale in Internal and Thermal
- **Signed:** GitHub Copilot (GPT-6.1 Sol / Copilot App)
- **Commit:** "Add first expedition and improve temperature views"
- **What changed:** Internal temperature readings now use the same live color mapping as
  Thermal instead of always-green text. The existing gradient bar and whole-lander/inside
  range control appear in both expandable panels. The palette, thermal diagram and
  Internal model materials are unchanged.
- **Files:** `dist/ui/layers-panel.mjs`, README.
- **Assumptions:** The shared absolute-temperature scale is not a component-specific
  optimal/safe operating band.

### 2026-10-04: Expandable component temperatures in Internal and Thermal
- **Signed:** GitHub Copilot (GPT-6.1 Sol / Copilot App)
- **Commit:** "Add first expedition and improve temperature views"
- **What changed:** Live component readings, source details and the Thermal color scale now
  sit in a native expandable "Component temperatures" panel. It starts collapsed, appears
  only in Internal/Thermal, and opens when a diagram number is selected. Temperature rows
  are keyboard-accessible buttons. Both the research and original mock-up models retain
  their labels, live temperatures and selection behavior.
- **Files:** `dist/index.html`, `dist/styles.css`, `dist/ui/layers-panel.mjs`, README and architecture.
- **Assumptions:** No new temperature values or model changes; existing source labels remain.
- **Checks:** All 74 Node tests pass. Edge/WebGL exercised collapsed/expanded states,
  both models and layers, live values, scale changes, diagram selection, keyboard controls
  and phone layout. Research-only placement notes remain hidden for the mock-up model.

### 2026-10-04: First expedition through a dune/interdune landscape
- **Signed:** GitHub Copilot (GPT-6 Astra / Copilot App)
- **Commit:** "Add first expedition and improve temperature views"
- **What changed:** Added a guided dry-sand baseline, scout-and-return flight, rain-darkened
  site sample, ice-rich outcrop sample, return to base and downlink. Suggested routes are drafts
  for the existing GO/NO-GO planner, not automatic uplinks. The persistent notebook records
  site, location, time and illustrative composition; each record tracks its real position in
  the simulated data queue. The debrief freezes elapsed/flight time, net battery energy used
  including preheat, and peak battery temperature. Existing saves, manual flight, sampling and
  the optional quick survey remain available.
- **Terrain:** Replaced the mountain-basin height field with long dunes, broad interdunes and
  distant hills; kept continuous mesh sampling, progressive recentering, dry landing circles,
  the methane puddle and arrival haze. The planning map now shades the shared elevation field.
- **Related fixes:** An autonomous touchdown now commands rotor idle immediately; otherwise
  a residual throttle just over 30% could consume flight power on the ground during downlink.
  Sampling cannot start during an active flight plan or pause, and hibernation cannot bypass
  its energy cost. Hidden speed controls and completed reports no longer crowd the Pilot view.
- **Files:** `dist/expedition.mjs`, `dist/ui/expedition-panel.mjs`, flight/science/save modules,
  terrain, planner, app/UI, expedition and terrain tests, README, architecture and research audit.
- **Assumptions:** Six-step exercise and suggested routes, dune spacing (~620 m), relief
  (35-60 m), orientation, hills and site positions are training choices [EST]. Science remains
  explicitly illustrative. This is not an exact reconstruction of Ahmakiq Undae or a
  flight-qualified autonomous landing/hazard model.
- **Checks:** All 74 Node tests pass. Real Edge/WebGL browser exercised arrival/skip, all four
  expedition flights and three samples, a saved reload, full downlink and debrief; phone
  portrait and landscape layouts checked without JavaScript or shader errors.
- **Open / next:** Actual terrain hazard assessment and additional expedition scenarios remain
  future work. Browser checks used isolated local tooling, not a new build/runtime dependency.

### 2026-09-30: Archived the mountain-basin map
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Archive the mountain-basin map before the landing-area change"
- **What changed:** Before reshaping the landscape to match the real landing area (Ahmakiq
  Undae), the working map was archived at the owner's request: git tag
  `archive/mountain-basin-map` (commit 8ec910b) and `archive/mountain-basin-map/` with the
  terrain and site-layout code as they were, six pictures, and restore steps.
- **Files:** `archive/mountain-basin-map/` (new)
- **Checks:** no app code changed.
- **Open / next:** the landing-area change itself follows in the next commit.

### 2026-09-29: Archived the classic sharp-peak terrain style
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Archive the classic sharp-peak terrain style"
- **What changed:** The owner liked the old sharp mountain tops but agreed realism is the goal,
  so the smoothed far terrain stays live and the old look is archived: git tag
  `archive/classic-peaks-terrain` (commit 63eb373, the last version before the smoothing), and
  `archive/classic-peaks-terrain/` with before/after pictures and a one-line way to bring the
  peaks back in the current app. The archive folder is outside `dist`, so it is not published
  on the website.
- **Files:** `archive/classic-peaks-terrain/README.md` and six pictures (new)
- **Checks:** no app code changed.
- **Open / next:** none.

### 2026-09-29: Natural far mountains (terrain level of detail)
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Smooth the far terrain and recenter it without a stall"
- **What changed:** The owner asked to improve the distant mountains, which showed saw-tooth
  peaks (most visible after the lander's release and from high up). Cause: the ground mesh
  gets coarse away from its center (up to ~80 m between points), so sharp ridge crests and
  fine bumps sampled that coarsely stood up as triangular teeth. Now, only where the spacing
  is over 20 m, fine noise layers fade to their average and the ridge shape is averaged over
  each mesh cell (center and four corners). Same ranges, same average height (33.0 m vs
  33.0 m in the test sample), same photo texture; roughness at 60 m spacing drops by about a
  third. Everything the vehicle can reach (spacing up to 20 m) is bit-for-bit unchanged.
  The extra work made a full rebuild slower (~115 ms vs ~71 ms in Node), so recentering now
  builds the new mesh 8 rows per frame into a spare buffer and swaps it in when complete
  (~31 frames). Normal flight no longer has one long rebuild frame (measured: 7.7 ms typical,
  36 ms on the swap frame). Jumps (start-up, restored mission, arrival) still rebuild at once.
- **Files:** `dist/titan-terrain.mjs`, `tests/terrain.test.mjs`, `tests/render-smoke.test.mjs`,
  `README.md`, `ARCHITECTURE.md`
- **Assumptions:** none new; the terrain function itself is unchanged near the vehicle.
- **Checks:** `node --test tests/*.test.mjs` (68 pass; new tests for far detail and progressive
  recentering). Compared 20,000 points against the previous version: identical wherever the
  spacing is 20 m or less. Before/after frames at phone size: arrival after release (t = 43.5 s,
  50 s) and a 120 m view near Site F; crossing into a new square renders normally.
- **Open / next:** none.

### 2026-09-29: Start over confirms with a second tap
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Confirm Start over with a second tap instead of a popup"
- **What changed:** The owner reported that Start over did nothing in the Claude app's built-in
  browser. It asked for confirmation with a browser popup (`window.confirm`), which that
  browser (and some other in-app browsers) dismisses automatically, so the reset never ran.
  Both Start over buttons now ask for a second tap on the same button instead: the first tap
  turns it amber with "Sure? Tap again" for 4 seconds; a second tap clears the save and replays
  the landing.
- **Files:** `dist/ui/persistence.mjs`, `dist/styles.css`
- **Checks:** `node --test tests/*.test.mjs` (66 pass). In the built-in browser: one tap shows
  the prompt, a second tap reloads with the save cleared and the arrival playing.
- **Open / next:** none.

### 2026-09-29: Arrival sequence graphics, realism and animation
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Rework the arrival sequence graphics and camera"
- **What changed:** The owner asked for better graphics and realism in the drop-in sequence,
  more artistic detail and animation on the capsule and parachutes, and a quicker zoom onto the
  drone after release.
  - Camera: closes from 190 m to 16 m within 3 s of release (then 12 m). Under the main
    parachute it rises to look down past the canopy, so the ground slowly emerges from the haze.
    A brief jolt when a mortar fires or a parachute snatches open.
  - Capsule: sphere-cone heat shield with ablative tile texture that glows during entry; tan
    cork-textured backshell with seams, rim ring, parachute mortar and four thruster pods.
  - Entry: flickering shock-layer glow, a tapering plasma wake, ablation sparks, warm light on
    the shell, faint speed streaks (entry only), dark sky above the hazy limb.
  - Parachutes: disk-gap-band drogue and ringslot main (open slot rings) with orange/white gores,
    crown vents, lines to a confluence point and a riser. They inflate from a slim bag with a
    small overshoot, breathe and sway. The drogue is cut away, flying off and fading as the main
    opens. The heat shield drifts and tumbles as it falls.
  - Atmosphere: haze wisps drift up past the capsule; the scene haze thins with altitude during
    the arrival (never enough to show the terrain edge); a direction-based sky dome during the
    arrival keeps the horizon seamless when the camera looks down.
  - Smoke puffs at mortar fire, heat-shield release and lander release; dust rolls out from the
    rotor downwash at touchdown (kept thin between the camera and the lander).
- **Files:** `dist/arrival-hardware.mjs` (rewritten), `dist/edl.mjs` (camera, `speedCue`,
  `drogueAway`, `touchdownDust`, `pyro`), `dist/titan-terrain.mjs` (`arrivalHazeDensity`,
  arrival sky dome), `dist/chase-vehicle.mjs`, `tests/terrain.test.mjs`,
  `tests/render-smoke.test.mjs`, `README.md`, `ARCHITECTURE.md`
- **Assumptions:** hardware sizes are published [PUB]; nose radius, backshell profile, canopy
  and line proportions, colors, textures, all effects and camera moves are artistic [EST]
  (noted at the top of `arrival-hardware.mjs` and in the README).
- **Checks:** `node --test tests/*.test.mjs` (66 pass, including a new haze-visibility test).
  Rendered frames at phone size (375x812) and 1280x800 through the whole sequence: entry,
  drogue deploy, main inflation and drogue cut-away, heat-shield release, pose, release, zoom,
  touchdown.
- **Open / next:** the far mountain ridges are coarse (large terrain cells far out), which shows
  as a saw-tooth skyline at low altitude; a smoother far-terrain level of detail would help.

### 2026-09-29: Search-engine basics
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add search metadata and a sitemap"
- **What changed:** The owner could not find the site on Google. Added a descriptive page title
  and description, `robots` index/follow, a canonical URL, link-preview (Open Graph) tags and
  `dist/sitemap.xml` (served at `/dragonfly-titan-gcs-demo/sitemap.xml`) for Google Search
  Console. Listing still depends on Google crawling the site; the owner can speed it up with
  Search Console (verify the URL-prefix property, submit the sitemap, request indexing).
- **Files:** `dist/index.html`, `dist/sitemap.xml` (new)
- **Findings:** the site and repository are public. `https://tboy450.github.io/` has no page
  (no user-site repository), and the path is case-sensitive (`/Dragonfly-...` gives 404).
- **Follow-up (same day, owner approved):** created the public repository
  [Tboy450.github.io](https://github.com/Tboy450/Tboy450.github.io): `https://tboy450.github.io/`
  now lists the owner's 14 public projects (private ones deliberately left out), redirects
  mistyped capitals such as `/Dragonfly-titan-gcs-demo/` to the right site, and serves a root
  `robots.txt` and `sitemap.xml` covering the home page and the four project sites. That
  repository keeps its own signed `CHANGELOG.md`.

### 2026-09-29: Mock-up internal and thermal views for the original model
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add labeled mock-up internal and thermal views for the original model"
- **What changed:** At the owner's request the original demo model now has its own Internal and
  Thermal views instead of switching to the NASA 2023 model. Its body, deck, cab and dish turn
  see-through and seven mock parts appear (battery pack, flight computers and power boxes, rotor
  drive electronics, science instruments in the front cab, cold sample store, a heat source
  "this model has no MMRTG", warm-air duct), sized to fit its own body. They reuse the simulator's
  thermal zones so the thermal colors stay live. Everything is labeled as faux: each part name
  starts "Mock-up:", each source reads "not based on the real Dragonfly design", the diagram
  carries a "MOCK-UP: original demo model, not the real layout" watermark, and the layers panel
  shows a banner pointing to the NASA 2023 model for the research-based views.
- **Files:** `dist/chase-vehicle.mjs`, `dist/ui/layers-panel.mjs`, `dist/ui/flight-view.mjs`,
  `dist/index.html`, `dist/styles.css`, `tests/render-smoke.test.mjs`, `README.md`,
  `ARCHITECTURE.md`
- **Assumptions:** the mock interior is invented for illustration [EST]; only the temperatures
  come from the simulator.
- **Checks:** 65 tests pass (new: mock labels on every callout, research interior hidden, every
  mock part fits the original body or cab, the Pilot view hides it). Internal and Thermal
  captures checked in the page.

### 2026-09-29: Battery phase-change (wax) buffer
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Model the battery's phase-change wax buffer"
- **What changed:** The battery now carries the published 7.5 kg of wax melting at 22.5 C,
  modeled as one enthalpy: below 22.5 C only the temperature changes; at 22.5 C heat melts (or,
  when cooling, refreezes) wax at constant temperature; once melted the battery warms again. The
  flight-time estimate and the flight-plan battery check count the remaining wax, a save keeps the
  melt fraction, and Diagnostics shows "% melted".
- **Files:** `dist/mission-systems.mjs`, `dist/flight-plan.mjs`, `dist/save-game.mjs`,
  `dist/ui/readouts.mjs`, `dist/index.html`, `tests/battery-pcm.test.mjs` (new),
  `RESEARCH-COMPENDIUM.md`
- **Assumptions:** [PUB] 7.5 kg, 22.5 C melting point (ICES-2023). [EST] latent heat 200 kJ/kg
  (mid-range of 150-250 kJ/kg for paraffins; the actual wax is not published), so 1.5 MJ.
- **Checks:** 64 tests pass (new: melt/refreeze plateau, a long hover plateaus at 22.5 C,
  estimates include the melt time).

### 2026-09-29: Start over from the landing
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add a Start over button that replays the landing"
- **What changed:** From owner feedback that there was no visible way to reset: a **Start over**
  button now sits in the survey strip (visible in both views, next to Begin survey). After a
  confirmation it clears the saved mission and the "arrival seen" flag, then reloads into the
  landing sequence with a fresh mission. The footer link does the same. On phones the Pilot
  view's survey strip stays two slim lines with both buttons on the right.
- **Files:** `dist/index.html`, `dist/ui/persistence.mjs`, `dist/styles.css`, `README.md`
- **Checks:** 61 tests pass; at 375 x 812 the strip stays 44 px, cancelling keeps the mission,
  confirming reloads into "Entry interface" with no saved progress.

### 2026-09-29: Saved progress between visits
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Save mission progress in the browser"
- **What changed:** The mission now survives a reload: position and heading, battery and
  temperatures, Titan clock, scouted sites and log, survey progress, samples and results, science
  log, stored and returned data, settings (wind, payload, MMRTG, fan, trim, faults) and a draft
  flight plan. Saved every 5 s while landed and idle and when the page is hidden or left; if you
  leave in flight, the last landed moment is kept, so a mission never resumes in mid-air. On
  return a "Welcome back" message appears and the arrival sequence does not replay. "Start a new
  mission" in the footer clears the save after a confirmation.
- **Files:** `dist/save-game.mjs` (new), `dist/ui/persistence.mjs` (new), `dist/ui/arrival.mjs`,
  `dist/app.js`, `dist/index.html`, `tests/save-game.test.mjs` (new), `ARCHITECTURE.md`, `README.md`
- **Checks:** 61 tests pass (new: round trip after a real planned flight and sample, only
  landed states saved, old or malformed saves ignored). In the page: progress saved, reload
  restored position/heading/sample with the welcome message, reset started a fresh mission.
- **Open / next:** saves live in one browser only (no sync between phone and computer).

### 2026-09-29: Architecture and handoff guide
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add an architecture and handoff guide"
- **What changed:** New `ARCHITECTURE.md`: house rules, a map of every file, which module owns
  which fields of the shared state, what one frame does, what each test file covers, and local
  testing tips. Linked from the README and from the notes at the top of this log.
- **Files:** `ARCHITECTURE.md`, `README.md`, `CHANGELOG.md`

### 2026-09-29: Pilot view layout: see-through panels, nothing covering the vehicle
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Make the Pilot view panels see-through and compact on phones"
- **What changed:** From the owner's phone screenshot: the Fixed/Free switch overlapped the Model
  button, the systems box sat on the drone, and solid stick, attitude and rotor panels plus a tall
  header left little of the scene. Now: camera switch top-left, Model button top-right, the
  systems list is a see-through right-aligned list under it (clear of the vehicle); stick pads,
  attitude ball and rotor readout are see-through; rotor speeds are one slim row on phones; the
  header puts the six status values in one row and all flight buttons share one compact size
  (Plan flight had been larger). All rules are in one section at the end of `styles.css`.
- **Files:** `dist/styles.css`
- **Checks:** 58 tests pass; measured at 375 x 812: no overlapping overlays, systems list clear of
  the vehicle, rotor row 22 px, the scene starts ~55 px higher, no sideways scrolling.

### 2026-09-29: Code split for safer handoffs
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commits:** "Split app.js into focused ui/ modules without changing behavior";
  "Move the research model and arrival hardware out of chase-vehicle.mjs"
- **What changed:** `app.js` (1,681 lines) is now a 60-line entry point plus `dist/ui/`
  modules (context, flight-view, chart, readouts, layers-panel, pilot-hud, science-panel,
  plan-panel, controls, arrival). `chase-vehicle.mjs` (760 lines) keeps the renderer, original
  model and layers; `vehicle-research.mjs` builds the NASA 2023 model and interior and
  `arrival-hardware.mjs` builds the aeroshell and parachutes. Code moved verbatim by script;
  only imports/exports were added. The Sample button no longer forces an immediate readout
  refresh (the regular 0.1 s refresh covers it), which removed an import cycle.
- **Checks:** 58 tests pass (the version-stamp test now covers subfolders and `../` imports).
  A scripted run of the page (arrival, layers, planned flight, sampling, downlink, Pilot view,
  model toggle) produced byte-identical readouts before and after both splits, with no errors.

### 2026-09-29: Fix: the app could freeze when the view had no size
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Keep the frame loop running when the view has no size"
- **What changed:** When the vehicle view or chart had zero width or height (a hidden tab, a
  collapsed layout, possibly a phone mid-rotation), drawing threw an error before the next frame
  was scheduled, which stopped the whole app until a reload. Drawing now skips zero-size views,
  and the next frame is requested before anything is drawn (at most one pending), so an error in
  one frame can no longer stop the loop.
- **Files:** `dist/app.js`
- **Checks:** 58 tests pass; a scripted run of the page (arrival, layers, planned flight,
  sampling, downlink, pilot view, model toggle) went from 14 errors to none.

### 2026-09-29: Arrival sequence framing for phones
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Zoom out on the parachute phases of the arrival sequence"
- **What changed:** While the parachutes are out the camera now pulls back about 3x (drogue
  40 -> 120 m, main 66 -> 190 m; entry capsule 16 -> 30 m), so the whole ~40 m capsule-and-parachute
  rig fits on a phone screen at about a third of its former size. After release at 1 km the camera
  eases back in to the lander (12 m) as it flies down. During the arrival the scene is centered in
  the space above the caption strip instead of being shifted up for the (hidden) pilot controls,
  which had pushed the parachute off the top of phone screens.
- **Files:** `dist/edl.mjs`, `dist/chase-vehicle.mjs`
- **Checks:** 58 tests pass; frames captured at 375 x 812 at entry, drogue, main, pose,
  pre-release, after release and near touchdown.

### 2026-09-29: Internal-parts and thermal layers, shared Mission/Pilot readouts, slimmer arrival caption
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add internal and thermal vehicle layers and link Mission and Pilot readouts"
- **What changed:**
  - **Vehicle Layers panel** under the Mission diagram: Exterior / Internal / Thermal.
    Internal and Thermal show the NASA 2023 design in a fixed three-quarter view with the nose to
    the left (like the published thermal figures); the foam shell and HGA disc turn see-through.
  - **Interior (18 labeled parts)** placed from ICES-2023-389 (text p2-p7, figs. 3-4) and the TFAWS
    2023 top view, in the same coordinates as the exterior: nose bulkhead; navigation/forward
    cameras in the unheated nose; IMUs and lidar FEB/MEB at the base of the nose; cold attic with
    the DrACO sample carousel; the insulating "wonderwall"; warm attic with DraMS (mass spectrometer
    and laser with fan); two rotorcraft drive electronics boxes; HGA az/el actuators; avionics,
    power and radio boxes; the TWTA under the top deck; the battery (11.5 kWh, 7.5 kg PCM, heat
    pipes) at the aft end; aft bulkhead; circulation fan; under-floor duct; trim-device chimneys
    (43 x 34 cm, both sides); plus the METHAN/E-field sensors, side camera suites and DrACO blower
    outside. Animated arrows follow the published air loop: MMRTG -> fan -> under-floor duct ->
    into the body below the nose -> aft through the bay -> back into the MMRTG.
  - **Thermal layer** colors every part by live temperature on a whole-lander (-180 to +40 C) or
    inside (-30 to +40 C) scale with a legend. New display-only nodes for the RDEs, TWTA and nose
    electronics are calibrated to the published end-of-leapfrog figure (RDEs near 300 K, nothing
    above 35 C); cold-attic, nose-camera and actuator temperatures are placed relative to the bay
    from the hot-hibernation figure. Each value is tagged modeled / estimate / published.
  - Numbered callouts on the diagram (nudged apart) and a parts list with live temperatures;
    tapping either highlights a part and shows its temperature, value source and placement source.
  - **Linked readouts:** a compact systems strip in the Pilot view (battery % and temperature, bay
    air, flight time left, link, plan status) reads the same live values as the Mission panels.
  - **Arrival caption** is now a slim see-through strip along the bottom (one line plus at most
    two lines of detail on phones; about 20% of the view on a 375 px screen) with a small Skip.
- **Files:** `dist/chase-vehicle.mjs`, `dist/mission-systems.mjs`, `dist/thermal-scale.mjs` (new),
  `dist/app.js`, `dist/index.html`, `dist/styles.css`, `tests/render-smoke.test.mjs`,
  `README.md`, `RESEARCH-COMPENDIUM.md`
- **Assumptions:** [PUB] part list and their described locations, air loop, foam thickness,
  chimney size, fan flow, battery PCM, "nothing exceeds 35 C", "internal components no colder than
  -20 C", published temperature ranges in figs. 3-4. [EST] exact box sizes and positions where the
  papers give only a region (read from the figures), and the display-node heat inputs, time
  constants and zone offsets. Unnamed boxes in NASA's figures are not drawn.
- **Checks:** 58 tests pass (new: every interior part fits inside the 7.62 cm-foam cavity of the
  exterior, attic parts under the attic roof, chimneys in the side walls; layers return on-screen
  callouts for all labeled parts and the pilot view restores the exterior). Checked in the page by
  stepping the real frame loop: Internal and Thermal captures at desktop size, parts list and
  selection, and the arrival caption and Pilot strip at 375 x 812.

### 2026-09-29: Working science instruments and data return
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Make the science instruments produce data, samples and results"
- **What changed:**
  - **DragonCam** images in flight (frame count) and fills an onboard data store.
  - **DraGMet** shows temperature, pressure, wind and methane humidity; its seismometer
    records an occasional event during long quiet stays on the ground (science log).
  - **DraGNS** counts while landed and shows the ground's bulk makeup (water ice vs organics)
    with an uncertainty that shrinks with counting time; moving starts a new measurement.
  - **Sample here (DrACO + DraMS)** drills anywhere on dry, stationary ground: 30 s, ~160 W,
    +40 Mbit, and a result that depends on the ground (ice-rich outcrop, rain-dampened sand,
    organic interdune sand). The survey mission's own sampling is unchanged.
  - **Downlink** now sends stored data (Comms shows stored, returned and time to send) and ends
    when the store is empty; a 1x / 20x / 100x speed control appears during a downlink, because
    at ~4 kbit/s data return, not flying, is the bottleneck [PUB §3.5].
  - Local copies only: `window.dragonflyTick` exposes the frame loop for testing while the
    browser tab is hidden (not defined on the published site).
- **Files:** `dist/science.mjs` (new), `dist/flight-model.mjs`, `dist/mission-systems.mjs`,
  `dist/app.js`, `dist/index.html`, `dist/styles.css`, `tests/science.test.mjs` (new),
  `README.md`, `RESEARCH-COMPENDIUM.md`
- **Assumptions:** [PUB] instrument roles (compendium §2.3), DraMS electronics ~120 W, the data
  bottleneck. [EST] every data rate and volume, the 30 s sample time, the seismic event rate,
  ~45% methane humidity shown, the ground types and every result text (labeled in the app as
  illustrative examples, not mission data).
- **Checks:** 56 tests pass (new: ground types, camera data, DraGNS precision, sampling rules,
  power and interruption, downlink drain and stop, seismometer). Checked in the page by
  stepping the real frame loop: sampling at the outcrop, science log, downlink at 100x.

### 2026-09-29: Arrival at Titan opening sequence (entry, descent and landing)
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add the arrival-at-Titan entry, descent and landing sequence"
- **What changed:** A one-minute, time-compressed opening sequence plays on a browser's first
  visit (Skip button; "Replay the arrival at Titan" in the footer). It follows the published EDL
  timeline: entry interface at 1,270 km with the capsule spinning at 2 rpm, peak heating
  (245 km, heat-shield glow), peak deceleration, the 8.25 m drogue at 143 km, the 16.7 m main
  at 4.8 km, heat-shield separation at 4.4 km, thermal-loop switch, lander pose (lowered on
  bridles below the backshell), despin with rotor spin-up, lidar ground lock, release at 1,000 m
  at 2.9 m/s, then powered flight away from the backshell to touchdown at base. A caption panel
  shows each step with the real altitude and time since entry; the sky darkens toward black at
  high altitude. The research model's exterior was also refined to the TFAWS 2023 top view at
  327 px/m (fuselage and MMRTG ~13 cm further aft; body 3.85 m nose to MMRTG end), with the
  pixel-to-model mapping written in `chase-vehicle.mjs` so the planned internal-parts layer
  can be placed from the same drawing and fit the exterior.
- **Files:** `dist/edl.mjs` (new), `dist/chase-vehicle.mjs`, `dist/titan-terrain.mjs`,
  `dist/app.js`, `dist/index.html`, `dist/styles.css`, `tests/edl.test.mjs` (new),
  `tests/render-smoke.test.mjs`, `README.md`, `RESEARCH-COMPENDIUM.md`
- **Assumptions:** [PUB] every altitude, time since entry, parachute size, aeroshell size and
  mass, release window and rate (SciTech 2025 EDL overview fig. 1; compendium §2.4). [EST] the
  time compression, capsule/parachute colors, riser and bridle lengths, the backshell shape,
  the spin shown at one third of 2 rpm, the powered-descent profile and touchdown at base. The
  lander is hidden while enclosed because its tail fins would poke through the simplified shell.
- **Checks:** 51 tests pass (new: published altitudes, monotonic descent without jumps, ordered
  hardware events, 3D smoke test through every phase). Frames rendered in the browser at entry,
  drogue, main/heat-shield separation, pose, lidar lock and powered flight.

### 2026-09-29: Research-based 3D vehicle model, land-now fix, 3D smoke tests
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add a research-based Dragonfly model and fix land-now timing"
- **What changed:**
  - New default 3D model built from the NASA/APL design drawings in the supplied PDFs
    (TFAWS 2023 "Dragonfly Lander Overview" slide 3 with labeled parts and a top view;
    ICES-2020-160 fig. 1; ICES-2023-389 fig. 1; TFAWS 2024 slide 3): long insulated fuselage,
    rounded "attic" over the nose, finned MMRTG at the tail between two tall splayed fins, four
    arms angled toward the ends carrying the coaxial three-blade rotors (disks ~R/2 apart), wide
    thick skids on legs with a drill housing on each, a flat 0.874 m radial-line-slot HGA disc
    (stowed flat, raised and aimed for downlink), LGA and MGA, nose cameras/lidar and two
    instrument booms. A **Model** button in the vehicle view switches to the original model for
    comparison (remembered per browser).
  - Measured envelope in the tests: 3.87 x 3.83 x 1.81 m vs published 3.85 x 3.85 x 1.75 m.
  - Parts are grouped into named subsystems, each tagged with a thermal zone, to prepare for
    the planned Mission-view exterior/thermal/internal layers (design notes in
    `RESEARCH-COMPENDIUM.md` "Future update requests").
  - Fixes from the Codex review (2026-09-28): (1) the half-finished model edit called a removed
    `poseAntenna()` and stopped rendering; fixed. (2) "Land now" used a fixed 3-minute trigger
    that ignored descent time (a 400 m descent at 1.3 m/s takes ~5 min); it now triggers when
    flight time left falls below the descent time plus 1.5 min (never below 3 min), both for the
    autopilot and the manual-flight advisory.
  - New tests drive the whole 3D scene without a GPU (stand-in renderer), so a rendering crash
    like (1) now fails the test suite.
- **Files:** `dist/chase-vehicle.mjs`, `dist/app.js`, `dist/index.html`, `dist/styles.css`,
  `dist/mission-systems.mjs`, `dist/flight-plan.mjs`, `tests/render-smoke.test.mjs` (new),
  `tests/flight-plan.test.mjs`, `RESEARCH-COMPENDIUM.md`, `README.md`
- **Assumptions:** [PUB] envelope, rotor count/diameter/blades, coaxial spacing, MMRTG size, HGA
  diameter, the labeled part layout. [EST] exact proportions (measured from the drawings using
  the MMRTG as scale, ~317 px/m), colors, fin outline, boom positions, arm sweep. Rotors keep
  three blades per the 2026 engineer interview although the 2023 drawings show two.
- **Checks:** 48 tests pass (new: 3D smoke test over both models, antenna poses, day/night and
  both views; envelope check; subsystem tagging; land-now from 400 m lands above the reserve).
  Frames rendered in the browser and compared with the NASA drawings (quarter, side, top,
  Mission view).

### 2026-09-28: Future Mission vehicle-layer views requested
- **Signed:** Codex (OpenAI, Codex desktop app)
- **What changed:** Added the user's future-update request for exterior, thermal, and internal-parts/cutaway views in the Mission vehicle window to `RESEARCH-COMPENDIUM.md`.
- **Scope:** Backlog documentation only. No simulator changes, commit, or deployment in this review.
- **Open / next:** Implement later; distinguish modeled thermal values and illustrative internals from verified hardware details.

### 2026-09-28: Mission planning mode and leapfrog scouting
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add autonomous flight planning with leapfrog scouting"
- **What changed:**
  - New **Plan flight** button opens a map: tap up to 6 waypoints (tap a site to snap to it),
    pick 40 m hop / 150 m scouting / 400 m cruise (nominal) altitude, and read a live estimate
    (distance, time, energy incl. preheat, battery % and temperature at landing, sites it will
    scout) with a GO / NO-GO verdict and reasons.
  - **Uplink plan** simulates the signal delay (8 s here, 73-90 min for real), then the lander
    flies itself: climb, cruise through the waypoints, descend and land. A strip under the
    mission bar shows progress, a 1x / 5x / 20x time-speed control and **Stop plan** (holds
    position). Afterwards it reports actual vs estimated time and energy.
  - **Leapfrog rule:** the last waypoint must be a scouted site. Base and the Dry outcrop start
    scouted; six candidate interdune sites (A-F, 0.3-1.9 km out, chosen for low relief and
    given level 10 m landing circles) turn from amber to green when any flight passes within
    60 m of them at 20 m or higher. The 3D view shows each site's 10 m safe landing circle.
  - **Land-now fault response:** during a plan, if flight time left drops under 3 minutes
    (energy reserve or 35 C battery), the autopilot descends where it is.
  - Manual control, any flight command, the guided survey or a safety restriction stops a plan.
  - The flight-profile chart's altitude scale now grows with the flight instead of clipping at 65 m.
- **Files:** `dist/flight-plan.mjs` (new), `dist/flight-model.mjs`, `dist/mission-systems.mjs`,
  `dist/titan-terrain.mjs`, `dist/chase-vehicle.mjs`, `dist/app.js`, `dist/index.html`,
  `dist/styles.css`, `tests/flight-plan.test.mjs` (new), `README.md`, `RESEARCH-COMPENDIUM.md`
- **Assumptions:** [PUB] no real-time piloting, uplinked autonomous flights, leapfrog scouting,
  ~10 m safe landing circle, ~400 m nominal cruise, ~30 min longest flights, land-now fault
  response. [EST] 2.5 m/s planned climb, 10 m/s cruise, 60 m scouting radius at 20 m+,
  8 s compressed uplink, candidate site positions, the 3-minute land-now trigger. Descent is
  limited to the simulator's existing 1.3 m/s landing profile.
- **Checks:** 44 tests pass, including a full autonomous flight (uplink wait, climb to 150 m,
  scouting Site A, landing inside the 10 m circle, energy within 0.75-1.35x of the estimate),
  leapfrog follow-up, abort, land-now and level/dry site checks. Planning dialog checked in the
  browser (sites, GO/NO-GO, estimate). The flight itself was not watched in the browser because
  the browser pane was hidden; it is covered by the tests.
- **Open / next:** no uplink of plans at Titan night (real ops) is modeled only as a NO-GO check.

### 2026-09-28: Redirect page to retire the ChatGPT Sites copy (prepared, not yet published)
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add a redirect page for retiring the ChatGPT Sites copy"
- **What changed:** Added `sites-redirect/index.html`, a small page that forwards visitors
  from the old chatgpt.site copy to the GitHub Pages version, with publishing instructions in
  `sites-redirect/README.md`. GitHub Pages is unaffected.
- **Findings:** the `sites` git remote's latest commit (`6890413`, Sep 21) does not match what
  the chatgpt.site URL serves, so that site is published through ChatGPT's own pipeline;
  pushing to the remote alone may not change it.
- **Open / next:** publish the redirect from ChatGPT (or push it to the `sites` remote) once the
  owner approves.

### 2026-09-28: Rain-darkened interdune replaces the fictional lake
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Replace the fictional lake with a rain-darkened interdune and methane puddle"
- **What changed:** The large hydrocarbon pool is gone. In its place: a broad patch of
  rain-darkened damp ground (darker, slightly glossy, ragged edge; safe to land on) around a
  small methane puddle (about 22 x 15 m; still a no-landing zone). The puddle's surface is set
  just below the lowest surrounding ground so liquid never floats above its banks. The survey
  is renamed "Interdune survey"; the target is the "Dry outcrop" at the patch's edge, kept dry.
  The small track map now shows the damp area (dashed) and the puddle.
- **Files:** `dist/mission-systems.mjs`, `dist/titan-terrain.mjs`, `dist/flight-model.mjs`,
  `dist/app.js`, `dist/index.html`, `tests/terrain.test.mjs`, `README.md`
- **Assumptions:** geography and sizes are training choices [EST]. Basis [PUB]: Dragonfly lands
  near the equator, far from the polar seas; methane storms darkened ~500,000 km² of
  equatorial ground in 2010 (JPL 2011). See `RESEARCH-COMPENDIUM.md` §5 "Realism note".
- **Checks:** 39 tests pass (new: damp ground landable, puddle below its banks); visual check
  of the puddle and damp ground in the pilot view.

### 2026-09-28: Titan haze lighting and a moving high-gain antenna
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add Titan haze lighting and a raise-and-stow high-gain antenna"
- **What changed:**
  - 3D pilot view lighting now reads as Titan: an orange sky dome carries most of the light,
    direct sunlight is weak (faint, soft shadows), the sky is a gradient (bright orange
    horizon, deeper amber overhead), and night is much darker. The Mission view's vehicle
    portrait keeps neutral lighting.
  - The high-gain antenna now sits on a motorized arm. "Start downlink" raises it (about 6 s)
    and aims it along the sunlight (Earth stays within ~6 deg of the Sun from Titan); data only
    flows once it is fully raised. Any flight command ends the downlink, the vehicle shows
    "Stowing antenna" and lifts off once the arm is down. The takeoff command is kept.
  - Local copies only (localhost): `window.dragonflyState` exposes the live state for
    debugging. It is not defined on the published site.
- **Files:** `dist/chase-vehicle.mjs`, `dist/titan-terrain.mjs`, `dist/mission-systems.mjs`,
  `dist/flight-model.mjs`, `dist/app.js`, `tests/operations.test.mjs`
- **Assumptions:** light colors and intensities are an artistic rendering [EST], kept bright
  enough for phones (real surface light is ~1/1,000 of Earth's [PUB]). Fog gives ~3.6 km
  visibility instead of the published ~10 km so the 4.9 km terrain edge stays hidden [EST].
  The 6 s antenna travel time is [EST]; the raise-for-comms, stow-for-flight behavior is [PUB].
- **Checks:** 38 tests pass (downlink test now covers the raise delay, stow-before-liftoff and
  the kept takeoff command); checked in the browser at desktop size.
- **Open / next:** the Mission view's 2D top-down drawing does not show the raised antenna.

### 2026-09-28: Signed change log, on-screen build label, automatic version stamping
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** "Add signed change log, build label and automatic version stamping"
- **What changed:**
  - Added this change log with entries back-filled for today's earlier Claude commits.
  - The header now shows the live build ("Build 1a2b3c4 · 2026-09-28") next to the
    "New Frontiers Demo" tag, so a phone shows at a glance which version it has. Local copies
    show "Build local".
  - All cache-busting stamps in the source are now `?v=dev`. The GitHub publish step replaces
    them with the commit hash on every release, so nobody has to bump version numbers by hand.
- **Files:** `CHANGELOG.md`, `.github/workflows/pages.yml`, `dist/index.html`,
  `dist/styles.css`, `dist/*.mjs`, `dist/app.js`, `tests/cache-version.test.mjs`, `README.md`
- **Assumptions:** none (build date uses US Eastern time).
- **Checks:** 38 tests pass; the stamp step was run on a copy of `dist` (all 14 references
  stamped, vendor files untouched).
- **Open / next:** see the entries above this one as they are added.

### 2026-09-28: Clean up heat-exchanger reference images
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** `9ac134f` "Clean up heat-exchanger reference images"
- **What changed:** Removed phone and Google Lens interface elements from the two
  shell-and-tube reference images (status strip, app header, Lens button, Visit buttons,
  truncating ellipsis). Restored the "Channel" and "Tubeside" labels the Lens button covered
  ("Tubeside" and the "Fl" of "Flow In" were copied from the matching labels in the same
  drawing; "Channel" was redrawn in Segoe UI Semibold).
- **Files:** `dist/assets/heat-exchanger-reference.jpg`, `dist/assets/tubetech-reference.jpg`,
  `dist/index.html`
- **Checks:** visual comparison at 3x zoom; the originals remain in git history (`b724b4b`).

### 2026-09-28: Professional wording for the exchanger figures
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** `b724b4b` "Reword heat-exchanger figure captions and study notes"
- **What changed:** Replaced "User-supplied ..." captions and alt text with neutral figure
  captions. Reworded the Lockheed Martin note and the "claims ... not corroborated" line so
  they state what the public sources do and do not describe, without implying a user error.
- **Files:** `dist/index.html`, `README.md`

### 2026-09-28: Cache-busting stamps for phones
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** `31827cd` "Version module and stylesheet URLs so phones load fresh files"
- **What changed:** Added `?v=` stamps to every module import, the stylesheet and `app.js`,
  so phones stop mixing cached old modules with new ones (the cause of the "stuck on an old
  version" reports). Superseded by the automatic stamping entry above.
- **Files:** `dist/*`, `tests/cache-version.test.mjs`, `README.md`

### 2026-09-28: Motor preheat, daylight comms, flight endurance, wind stress labels
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** `1030402` "Add motor preheat, daylight comms, flight endurance and wind stress labels"
- **What changed:** 60 Wh motor preheat per cold start; Direct-to-Earth link only when landed,
  awake and in daylight (antenna stowed in flight), with a manual 200 W downlink and data
  counter; flight time left (battery reserve vs 35 C battery limit), 30-minute flight timer and
  "Land now" / night-flight advisories; wind above 1.6 m/s labeled as a stress test.
- **Files:** `dist/mission-systems.mjs`, `dist/app.js`, `dist/index.html`,
  `tests/operations.test.mjs`, `RESEARCH-COMPENDIUM.md`, `README.md`
- **Assumptions:** 200 W DC downlink draw, 9.5 AU Earth range and 30-minute motor cool-down
  are [EST]; data rate uses the 2018 concept's ~5 mJ/bit/AU [PUB].

### 2026-09-28: Smooth flight controls, mode-change fixes, phone layouts
- **Signed:** Claude (Anthropic Claude Opus 5.5, Claude Code desktop app)
- **Commit:** `3bb6cd4` "Smooth flight controls, fix mode-change jumps, and rebuild phone layouts"
- **What changed:** One rate-limited flight model for all modes, sticky/centering throttle,
  Auto resumes from the matching phase, no terrain re-centering jumps, eased chase camera,
  new portrait and landscape phone layouts. Details in `RESEARCH-COMPENDIUM.md` §0.

### Earlier history (unsigned)
Commits before `3bb6cd4` carry no assistant signature. Per `RESEARCH-COMPENDIUM.md` §0,
`74ed2c4` ("Refine Titan thermal and flight models from published research") was made by
GPT/Codex. `RESEARCH-FOLLOWUP.md` records the GPT/Codex review of Claude's research handoff.
