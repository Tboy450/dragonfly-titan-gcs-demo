# Architecture and Handoff Guide

A one-page map of the Dragonfly Titan simulator for whoever works on it next (Claude, ChatGPT,
Codex or a person). Read this, then the top entries of [CHANGELOG.md](CHANGELOG.md).

## The short version

- A static web app with **no build step**: everything in `dist/` is served as-is.
  `index.html` loads `app.js`, which imports the other modules.
- **Tests:** `node --test tests/*.test.mjs` (Node 22). They must pass before publishing.
- **Publishing:** push to `main` on GitHub (the local branch is `master`:
  `git push origin master:main`). The workflow runs the tests, stamps versions and publishes
  `dist/` to GitHub Pages.
- **Every change gets a signed entry** at the top of `CHANGELOG.md`.

## House rules

1. **Leave `?v=dev` alone.** Every local import, the stylesheet and the images use `?v=dev`;
   the publish workflow replaces it with the commit hash so phones never mix old and new files.
   A test fails if a stamp is missing, including in `ui/` imports.
2. **Label what is real.** Research values carry tags in comments and docs: [PUB] published,
   [CALC] calculated from published inputs, [EST] estimate or gameplay choice. The app itself
   says "illustrative", "estimate" or "modeled" wherever a value is not published.
3. **Keep logic testable.** Simulation code lives in plain modules with no DOM access and gets
   tests; `ui/` modules only read state and update the page.
4. **Link research PDFs as sources.** Each source README in `research/sources/` gives the PDF
   link and saves the pages a part was built from as images; `research/PART-SOURCES.md` lists
   them per part. `RESEARCH-COMPENDIUM.md` records which figure or page each value came from.
5. **Sign the change log**, including what is estimated and what is still open.
6. **Never throw away replaced work; archive it.** The owner's rule: digital work is kept, even
   bad or inaccurate versions. When a model, texture, terrain, visual, sound or behavior is
   replaced, in the same change add `archive/<name>/` with the old code or files, pictures of how
   it looked and restore steps, tag the last commit that used it (`archive/<name>`), and add a
   row to `archive/README.md`. Mention it in the change-log entry.
7. **At the start of a session (or after time away), check for other assistants' work.** Read
   the README and the newest `CHANGELOG.md` entries, then `git fetch origin`, list
   `git branch -r`, and run `git log --oneline main..origin/<branch>` for each branch. Merge or
   raise any unmerged work with the owner before starting. Once per session, not before every
   request. (Added 2026-10-09 after a week of work on `main` missed
   GitHub Copilot's unmerged branch.)

## Files

### Simulation (no DOM; covered by tests)
| File | What it does |
|---|---|
| `dist/flight-model.mjs` | Vehicle constants, `createFlightState()`, the flight step (`stepFlight`), power curve, flight commands, autopilot branch, flight-plan estimate helper |
| `dist/mission-systems.mjs` | Thermal and energy model, comms/downlink and antenna, trim device, hibernation, survey mission, training geography (damp ground, puddle, candidate sites), land-now logic, thermal zone temperatures |
| `dist/flight-plan.mjs` | Flight plans: waypoints, GO/NO-GO estimate, uplink delay, autopilot guidance, leapfrog scouting |
| `dist/science.mjs` | Instruments: DragonCam data, DraGMet log and seismometer, DraGNS counting, DrACO/DraMS sampling, ground types; pure `samplingSequence()` projects the existing job clock into illustrative drill/transfer/carousel/analysis stages |
| `dist/science-programs.mjs` | Estimated demo/LDMS/GCMS stage profiles, exact stage energy integration and validation of added save fields; separate from DOM and hardware geometry |
| `dist/operations.mjs` | Stationary surface queue: existing sample/radio/hibernation orchestration, explicit manual interruption, FIFO completion, bounded editing and paused save normalization; never advances time or adds energy |
| `dist/expedition.mjs` | First expedition objectives, suggested flight drafts, site-linked notebook, FIFO sample downlink status, frozen debrief and validation of the optional save field |
| `dist/weather.mjs` | Seeded, compressed training gust/rain events, advance advisories, optional strong storm, fixed wind, wetting/drying, plan restrictions and weather save validation |
| `dist/edl.mjs` | Arrival (entry, descent, landing) timeline from the published EDL figure |
| `dist/titan-day.mjs` | Time-scaled Titan day cycle: day number, phase, the day's checklist, sleep until morning and the morning report |
| `dist/downwash.mjs` | Rotor wash at the ground: wash speed and dust strength from rotor speed, height, climb, forward speed and ground kind |
| `dist/sound-mix.mjs` | Pure mapping from the state to sound levels and pitches (testable without audio) |
| `dist/thermal-scale.mjs` | Fixed absolute-temperature colors shared by both reading lists and the Thermal mesh; range selection zooms only the legend, with 0-20 C equipment/battery reference green and 35 C+ red (not universal operating limits) |
| `dist/flight-camera.mjs` | Chase-camera pose and smoothing |
| `dist/vehicle-presentation.mjs` | Pure parked portrait state for the clean room; never changes the simulation |
| `dist/vehicle-inspector.mjs` | Mission-only orbit/zoom limits, focus/reset, assembly membership and follow target from the shared sampling clock. Optional subassembly `inspectionMinimumRadiusM` enables macro framing between .003 and .22 m; absent/invalid metadata keeps the original .22 m floor. No physical scaling, flight or saved-state changes |
| `dist/inspection-visibility.mjs` | Indexed visibility masks for existing shell/foam/panel meshes and per-component casing/cover/mount/interface/harness groups; draw-time restoration, stable framing and shared UI definitions |
| `dist/save-game.mjs` | Which state fields are saved between visits (a whitelist), when saving is allowed (landed, idle), and restoring onto a fresh state |

### 3D scene (three.js; covered by the render smoke tests with a stand-in renderer)
| File | What it does |
|---|---|
| `dist/sample-carousel.mjs` | First individually rebuilt interior asset: NASA-photo-referenced SDC casing/fins/ports/drives, explicit estimated scale, stationary enclosure and internal indexing pivot |
| `dist/rotor-drive-electronics.mjs` | Approved two-box RDE approximation; `rde-1`/`rde-2` independently selectable identity roots, per-unit casings/covers/mounts/interfaces/harnesses. Returns `{assembly,units}`. Four estimated slack leads/lacing in wire-only masks, original endpoints preserved. Not flight-photo geometry or certified wiring; no new cooling/electrical solver |
| `dist/aft-bulkhead.mjs` | Claude's photo-referenced canted aft plate, generator-interface detail and estimated 25-degree MMRTG pose; shared constants keep aft foam, fan collar and airflow aligned |
| `dist/nose-bulkhead.mjs` | Provisional part-03 thin panel, perimeter returns and mounts, independently hidden by inspection masks; real structure finish/joints only, exact nose face and hidden layup unresolved; not a completed rebuild |
| `dist/nose-electronics.mjs` | Part05 owner-approved Ocellus outer-structure approximation at nominal2023 scale, plus unchanged Honeywell MIMU family models. MEB frame/stiffeners/lid and FEB base/returns/receiver/collimator housings [EST], not exact flight units. Four unit focuses plus shelf; independent casings/covers/mounts/IMU interfaces. Original anchor/poses retained, new-to-new clearances; no hidden boards/optical train/harness or physics changes. Initial pass complete; exact flight follow-ups open |
| `dist/nose-sensors.mjs` | Codex's photo-referenced EFIELD probes and approved METHAN design estimate; removable filtered covers, skin mounts and short fiber entry, no invented warm DPU internals. Initial #22 pass complete, exact hardware follow-ups remain |
| Part-22 subassembly metadata | Tagged child `userData.inspectionLabel` exposes Front/Rear EFIELD and METHAN (design estimate); original part ID retained, bounds/isolation are viewing-only, label anchors use the existing vehicle frame |
| `dist/wonderwall.mjs` | Estimated contoured warm/cold partition, real geometry openings and separate faces/core/mount groups for future inspection layer controls; clears the rebuilt carousel |
| `dist/ecam.mjs` | Shared Malin ECAM camera heads from the DragonCam paper's figures (P50 wide, P50 Forward MAC with lens hood, NavCam with top plate, L50 Microscopic Camera) and `mountEcam` to place and aim one |
| `dist/thermal-loop.mjs` | Parts 17-19: two circulation fans, the warm under-floor duct and the cold bypass duct under the belly with fore and aft diverter flaps (TFAWS 2023/2024); supplies the air-loop arrow paths |
| `dist/draco-plumbing.mjs` | Parts 02 and 24: DrACO pneumatic transport per LPSC 2022 fig. 1 (hoses that follow the drill feed, transfer tubes, carousel flow diverter, return line, blower diverter, forward and aft centrifugal blowers); supplies the sampling animation's particle paths |
| `dist/drills.mjs` | Part 01: DrACO drills from LPSC 2022 fig. 2 (gold head, percussion and rotation actuators, Z-stage rail and motor, swivel port, hollow bit); the carriage slides for drilling and only the bit turns (`carriage.userData.bit`) |
| `dist/nose-cameras.mjs` | Part 04: Forward MAC, Forward WAC, two Side Cameras and two NavCams on a camera panel behind the nose cap, positioned from DragonCam figs. 2-3 |
| `dist/side-cameras.mjs` | Part 23: Microscopic Camera placed from its published 986 mm / 52 degree geometry to the port drill site, LED array, two Down Cameras, windows and foam cavities, in inspection-layer groups |
| `dist/power-units.mjs` | Part 11: the two PSUs from NASA/APL's March 2026 testing photo; sliced silver connector faces, mated harness, black covers, mounts, in separate inspection-layer groups per unit; size scaled from the photo |
| `dist/iem.mjs` | Part 12: IEM from NASA/APL's March 2026 photos; finned top, nine card fronts with micro-D connectors, plugged-in harness, mounts, in separate inspection-layer groups; size scaled from the photos |
| `dist/main-harness.mjs` | Main wiring harness, first pass: silver bundles on the bay floor (centerline trunk, branches to the units' cable stubs and connector faces), lacing ties, floor clamps; routes estimated from NASA/APL's September 2026 wiring photo. Unnumbered `main-harness` subsystem |
| `dist/arm-shoulder.mjs` | Arm shoulder fitting from NASA/APL's May 2026 frame photo: six-sided ribbed collar along each arm, round 12-bolt flange; returns where the arm fairing starts |
| `dist/rotor-heads.mjs` | Rotor heads: the coaxial motor stack at each arm end (collar with arm clamp between upper and lower machined motor drums) and each rotor's bolted hub plate, from the Revolutionary Rotors video and NASA/APL's flight-frame photo; sizes estimated |
| `dist/battery.mjs` | Part 15: the battery: 24 upright cells (GS Yuasa 134 Ah, inferred), fins, heat pipes in three directions and bus straps in a ribbed lower section with a bare aluminum upper housing, fans and round connectors, its look from real photos of APL's test module (ICES-2022); layout and placement estimated |
| `dist/mmrtg.mjs` | Photo-referenced MMRTG exterior;64 x66 cm envelope, detailed profile/finish estimated. Shared housing/fin dimensions used by21; fixed bulkhead pose. `inspectionTitle` exposes an unnumbered assembly in the existing selector; housing/fins/ends targets and independent casing/cover/mount/interface masks. No hidden fuel or generator internals |
| `dist/side-wall.mjs` | First starboard structural panel: published 0.254 mm aluminum faces; outline, 12 mm separation, closeouts, fasteners/tape and camera relief estimated. Unnumbered structural assembly, three focuses and independent Covers/Casings/Mounts plus global Structural wall panels mask. Core cells/layup unmodeled; older combined foam untouched. Physical structure exists under the exterior shell, not equipment inside the bay; no simulation changes |
| `dist/mmrtg-measurement.mjs` | Part21 Omega F2020 Class B family approximation, 2 x2 x0.8 mm with two10 mm leads. Bond/placement estimated, generator pose from `poseMmrtg`; shared `mmrtgAsset` dimensions refit21 to the new housing. Original ID/zone/gas reading kept. Flight adoption/count/point unconfirmed; no fin-root solver |
| `dist/battery-measurement.mjs` | Part20 TE44909-family approximation at a 2.4 mm maximum envelope with paired leads and estimated wall bonding. Flight adoption/count/placement unknown. Casings/Mounts/Harnesses masks, bead and installation macro targets. Original ID/zone/reading and battery context retained; no sensor lag/noise or thermal/flight changes |
| `dist/hga-gimbal.mjs` | Part 10: the high-gain antenna gimbal: under-deck azimuth drive and rotary joint, turntable and elevation drum under a foam dome, motorized arm and pedestal, launch and flight locks; poses the dish (azimuth/elevation toward Earth, kept out of the attic) for the research model (ICES-2023/2020, APL arm photo) |
| `dist/twta.mjs` | Part 14: the 100 W X-band TWTA under the top deck: conduction-cooled tube, EPC, high-voltage umbilical, waveguide forward under the deck to the antenna gimbal's rotary joint, input coax and bus harness, drawn after published flight TWTAs (LRO, MRO, Stellant); sizes scaled and placement estimated |
| `dist/frontier-radio.mjs` | Part 13: APL Frontier radio from APL's photo and published 4 x 6 in slice size; four slices, labeled connectors, feet and top coax in separate inspection-layer groups; placement estimated |
| `dist/drams-assembly.mjs` | Estimated warm-side DraMS casings, covers, frame and interface keyed to Wonderwall's aperture; no invented hidden instrument internals |
| `dist/chase-vehicle.mjs` | Renderer, lights, the original demo model and its labeled mock-up interior, shared part helpers, Mission-view layers (exterior / internal / thermal) for whichever model is selected, `draw()` for the Pilot view and `drawMission()` for the Mission diagram |
| `dist/vehicle-research.mjs` | NASA/APL 2023 thermal layout refined with APL CAD and NASA's 2026 print guide: rounded attic, body-side DrACO, flat skids, motor pods and separate IEM/PSU/radio groups. Parts own a thermal zone, label and source. The drawing-to-model mapping (327 px/m from TFAWS 2023) is in its comments |
| `dist/downwash-dust.mjs` | Rotor-wash dust sprites near the ground (flight view; a child of the landscape group) |
| `dist/arrival-hardware.mjs` | Aeroshell, heat shield, parachutes, bridles and descent effects (plasma, sparks, haze wisps, smoke, dust) for the arrival sequence |
| `dist/titan-terrain.mjs` | Ahmakiq Undae dunes, interdunes and hills (with far level of detail and progressive recentering), dune-sand shading, sky, fog and arrival sky dome, damp ground, the puddle, landing-site rings |

### Page (`dist/ui/`, one module per panel)
| File | What it does |
|---|---|
| `dist/app.js` | Entry point and frame loop: steps the simulation, refreshes readouts every 0.1 s, draws |
| `ui/context.mjs` | The shared `state` object, `$()` and small helpers, the 3D renderer instance |
| `ui/flight-view.mjs` | Draws the Mission and Pilot views (3D, or the 2D fallback without WebGL), part callouts |
| `ui/chart.mjs` | Flight profile chart |
| `ui/readouts.mjs` | Status strip, telemetry, rotor tiles, Diagnostics values, local track map |
| `ui/part-label-layout.mjs` | Mission-view part numbers: each on its part's fixed anchor; crowded numbers move to the nearest free spot with a leader and keep it while free, easing there; keeps clear of the readouts |
| `ui/layers-panel.mjs` | Vehicle Layers panel: layer switch, expandable live component temperatures (Internal/Thermal), legend, keyboard-accessible parts list, selection |
| `ui/vehicle-references.mjs` | On-demand APL payload/CAD viewer with keyboard tabs, retry states, source credits and video pause on closing/hiding. Compact assets are in `dist/assets/vehicle-references/`; originals stay in `research/` |
| `ui/vehicle-inspector.mjs` | Internal/Thermal inspection controls, opt-in pointer rotation, keyboard orbit, zoom/focus/isolation, sampling follow and shared pause; native browser zoom and default scrolling preserved |
| `ui/mission-backdrop.mjs` | Mission diagram backdrops per layer, picked with the a/b/c buttons (Exterior: Titan / clean room / poster; Internal: blueprint / yellow grid with dimensions; Thermal: Titan air / light grey / yellow grid) and the backdrop-matched readout colors |
| `ui/exterior-scenes.mjs` | Cached photo-based Exterior A/C painting: NASA/APL dune panorama and responsively placed Cassini portraits; local images and credits in `dist/assets/exterior/` |
| `ui/pilot-hud.mjs` | Pilot-view systems list (same values as the Mission panels) |
| `ui/science-panel.mjs` | Science Payload panel and sampling button |
| `ui/operations-panel.mjs` | Expandable queue editor, status, run/stop, recharge estimate and manual-command handoff |
| `ui/plan-panel.mjs` | Flight Plan dialog, plan status strip, time-speed buttons |
| `ui/expedition-panel.mjs` | Guided objective and suggested-route actions, persistent notebook and debrief; compact in Pilot view |
| `ui/controls.mjs` | Flight buttons, sticks, keyboard, camera modes, view switch, other controls |
| `ui/arrival.mjs` | Arrival sequence: start, step, skip, replay, caption |
| `ui/day-strip.mjs` | The Mission view's Titan day strip and its "Sleep until dawn" button |
| `ui/sound.mjs` | Optional Web Audio soundscape (off by default) and the ♪ button; `updateSound()` runs each frame |
| `ui/persistence.mjs` | Saves progress in the browser (every 5 s while landed and when the page is left), restores it on load, "Start a new mission" |
| `dist/index.html`, `dist/styles.css` | Markup and styles. The phone Pilot-view overrides are in the last section of `styles.css` |

### Swarmfall drone invasion game (`dist/invasion/`, its own page)
A strategy game that reuses the simulator's Titan terrain, arrival hardware and research model.
It imports those modules read-only and never touches the simulator's state. Rules follow the
same split as the simulator: plain modules with tests, plus a page layer.
| File | What it does |
|---|---|
| `invasion/units.mjs` | Drone, defender and society types; weapons per target class (ground, structure, air) so drones can later carry different arms against rival drones; pod slots and costs |
| `invasion/campaign.mjs` | The seven planets in campaign order, rewards, per-planet supply, saved progress (validated field by field) and `applyMissionResult`; Frontier maps (`frontiers`), `missionSupply` and `applyFrontierResult`, which never touch the campaign bank |
| `invasion/mission-save.mjs` | Versioned JSON battle checkpoints, validation and terrain callback/pad restoration; stored with campaign progress by the page; battles record their map, city and landform, and `checkpointPlanet` rebuilds exactly that world (older Corvan saves included) |
| `invasion/battle.mjs` | One mission: zones, drops, orders (group pace, attack-move), movement, combat, capture (damage or control path, converted defenses), public alarm, reinforcements, artillery, income, objectives, stars, outcome; frontier scouting (`cityFound`, `hiddenUnits` for the page); direct fire needs a clear line past city buildings |
| `invasion/hazards.mjs` | Seeded environmental threats with advance warning; shelter in held zones |
| `invasion/achievements.mjs` | Twelve campaign achievements, checked live and at the end of a mission |
| `invasion/planet-terrain.mjs` | Ground height per planet: Titan reuses `terrainHeight`; the other worlds are invented noise landscapes with liquid levels and level zone pads; a planet with `city` gets level city ground, `walkable`, `roofAt` and a building-aware `canDropAt`; a `landform` (frontier valley) gives ridged mountains, a flat valley, the beacon's basin and a pass, optional lava channels and volcano cones, plus `siteOK` for gentle zone sites |
| `invasion/city-layout.mjs` | A seeded, versioned city district (blocks, lots, tiered buildings, streets, squares, parks) and fast `buildingAt` / `roofAt` / `clearAt` / `lineBlocked` queries; the one source for city rules and drawing; styles "metropolis", "forge" (halls, smokestacks, cooling towers) and "town" (houses, keep, walls with gates, turrets) |
| `invasion/city-render.mjs` | Draws a city layout with the Environment Lab kit: streets, sidewalks, squares, parks, merged facade buildings and rooftop gear; forge cities get halls, stacks, towers, slag yards and animated smoke; towns get tile-roofed houses, a keep and crenellated walls |
| `invasion/random.mjs` | Seeded random numbers stored on the battle (reproducible missions) |
| `invasion/models.mjs` | Procedural drone, defender, structure and building geometry (vertex colors, merged for instancing) and the compacted Dragonfly research model |
| `invasion/scene.mjs` | three.js view: planet ground/sky/liquid/decor (Titan via `createTitanTerrain`), zone rings, instanced units, shots, explosions, strike markers, weather particles, pods via `createArrivalHardware` + `edlStateAt` |
| `invasion/galaxy.mjs` | The campaign galaxy drawing |
| `invasion/battle-sound.mjs` | What the optional sound should be: hum, rain, wind and rumble levels from the battle and view, one-shot cues from events, and the sound levels |
| `invasion/sound.mjs` | Plays it with Web Audio (no sound files): beds, shots, explosions, chimes, sirens, thunder, pod entry and parachutes; off by default |
| `invasion/quality.mjs` | Graphics quality levels (decor, city detail, ground, pixel ratio) and adaptive resolution from frame time |
| `invasion/tips.mjs` | First-time tips: first defenders in sight, each kind of defense, alarm stages, first artillery and captured defense |
| `invasion/field-guide.mjs` | The Field guide: every drone, defender, society and hazard with numbers and counters, generated from the rules |
| `invasion/camera-assist.mjs` | Follow the selected squads' center, the newest alert to jump to, edge scrolling and the starting view |
| `invasion/free-camera.mjs` | The free camera's movement: start from and return to the orbit camera, fly with limits (ground, roofs, ceiling, map edge, no flying into buildings) |
| `invasion/main.mjs` | Screens, saving, the mission loop, camera and touch controls, selection, orders, drop panel, HUD, minimap, debrief |
| `invasion/index.html`, `invasion/invasion.css` | Markup and styles (phone layout in the last section) |

Balance was checked with a scripted bot that plays the whole campaign (all seven planets won on
first tries, losses rising from 0 to about 150 drones); real playtesting is still needed.

### Documents and tooling
| File | What it is |
|---|---|
| `CHANGELOG.md` | Signed record of every change (newest first) |
| `INTERIOR-REALISM-TODO.md` | Owner-requested callout fix, numbered part-by-part asset rebuild and enclosure/insulation views; persistent handoff checklist |
| `SWARMFALL-TODO.md` | The game's update checklist: known problems, owner requests (free mode, local versus, planet threats) and planned work by area, with item IDs and priorities |
| `RESEARCH-COMPENDIUM.md` | Research reference: sources, values with tags, implementation status (§7), next steps (§8), future requests |
| `RESEARCH.md`, `RESEARCH-FOLLOWUP.md` | Earlier source audit and GPT/Codex review notes |
| `research/titan_physics.py` | Script behind the [CALC] values |
| `tests/` | Node tests (see below) |
| `.github/workflows/pages.yml` | Test, stamp and publish to GitHub Pages |
| `sites-redirect/` | Page for retiring the old ChatGPT Sites copy (not yet published) |

## The shared state

There is one live `state` object (`ui/context.mjs`). Each part of the simulation owns its fields:

| Owner | Fields (examples) |
|---|---|
| `flight-model.mjs` | `altitude`, `verticalSpeed`, `speed`, `heading`, `pitch`/`roll`/`yaw`, `throttle`, `altitudeHold`, `auto`, `mode`, `rotorRpm`, `missionTime`, `positionX/Z`, `timeWarp` |
| `flight-model.mjs` (fictional opt-in assist) | `reverseBrakeEnabled` (saved), `reverseBrakeActive` (transient); a zero-throttle upward-momentum brake only in manual flight above 1 m, never a negative throttle value |
| `mission-systems.mjs` | `battery`, `power`, `coreC`, `batteryC`, `trim`, `fan`, `fault`, `hibernating`, `elapsed` (Titan clock), `downlinkActive`, `antennaDeploy`, `motorsCold`, `flightSeconds`, `scoutedSites`, `rdeC`/`twtaC`, `mission` |
| `flight-plan.mjs` | `plan` (waypoints, status, phase, estimate, report) |
| `science.mjs` | `science` (samples, log, counters, selected/active profile, job energy), `dataStoredBits`, `sciencePowerW`, `scienceHeatW` |
| `operations.mjs` | `operations` (ordered items, cursor, anchored landing site, execution state and transient ownership); saved without active execution |
| `expedition.mjs` | `expedition` (status, step, start/end clocks, next sample index, three-site notebook, energy/flight/temperature metrics) |
| `weather.mjs` | `weather` (seed, mode, clocks, baseline/last wind, event, intensity, haze, rain, wetness, six recent advisories), effective `wind` |
| `ui/arrival.mjs` | `edl`, `edlTime` (only while the arrival plays) |
| `ui/*` (page only) | `view`, `cameraMode`, `vehicleModel`, `missionLayer`, `thermalRange`, `selectedPart`, `throttleSpring`, `renderPose` |

Both sampling controls use the DrACO/DraMS job in `science.mjs`. The survey button requests
it through `mission.phase = "sampling"`; the science step owns its timer, result, data and
instrument power, and completes the survey acquisition when applicable. Hibernation is
blocked during either sampling path. `stepScience()` runs before `stepSystems()` so the
instrument load is included in the energy budget once.

**Saved between visits:** only the fields listed in `save-game.mjs`. When you add state that
should survive a reload, add it there (and bump `SAVE_VERSION` if old saves would break).

## One frame (`app.js`)

1. Step the simulation: the arrival sequence, hibernation fast-forward, or `stepFlight()` once per
   time-speed step (1x, or 5x/20x/100x during a flight plan or downlink).
   `stepFlight()` steps weather before flight/system calculations, then updates expedition progress after the science and systems steps. Weather uses bounded one-second substeps; rest stops at a new warning. The UI seeds new missions with browser randomness; the model factory uses a deterministic default for tests. Sample
   records have a cumulative `downlinkEndBits` boundary (returned + queued data at collection),
   so their transmission status is independent of later imagery or weather data.
2. Every 0.1 s: refresh readouts, track, plan strip, layers panel, Pilot list and chart.
3. Draw the Mission or Pilot view. The next frame is requested first, so an error in one frame
   cannot stop the app.

## Tests

| File | Covers |
|---|---|
| `flight-model.test.mjs` | Power, continuous flight model, mode changes without jumps |
| `reverse-brake.test.mjs` | Earlier climb arrest, bounded tiny pulse, RPM/power accounting, manual-only gates, liquid/flare protections, frame-rate consistency, pause and validated/legacy saves |
| `mission-systems.test.mjs`, `operations.test.mjs` | Thermal/energy model, survey, hibernation, preheat, downlink, antenna, land-now |
| `flight-plan.test.mjs` | Plan checks, full autonomous flight, leapfrog, abort, land-now from 400 m |
| `science.test.mjs` | Instruments, sampling, data store and downlink |
| `expedition.test.mjs` | Complete multi-flight expedition and radio transfer, sample attribution, interrupted sampling, idle rotors after autonomous landing, legacy save compatibility and persistent debrief |
| `edl.test.mjs` | Arrival altitudes and ordering |
| `terrain.test.mjs` | Terrain sampling, damp ground, puddle, level landing sites |
| `render-smoke.test.mjs` | Whole 3D scene with a stand-in renderer: both models, antenna, day/night, arrival hardware, layers and callouts, the published envelope, subsystem tags, and that every interior part fits inside the foam-lined cavity |
| `save-game.test.mjs` | Save and restore round trip after a real flight and sample; only landed states; bad saves ignored |
| `flight-camera.test.mjs`, `cache-version.test.mjs` | Chase camera; `?v=dev` stamps and the build label |
| `thermal-scale.test.mjs` | Fixed cold/reference/hot colors, continuous interpolation and accurate temperature anchors in both legend windows |
| `weather.test.mjs` | Seeded scheduling, advance warnings, smooth/bounded gusts, rain and drying, optional strong storm, fixed wind, pause/arrival, real convection, rest warning stop, planner cautions/restrictions, save validation and legacy migration |
| `invasion-battle.test.mjs`, `invasion-campaign.test.mjs` | Swarmfall: practice win and Dragonfly recovery, drop checks, damage and control paths, hazard warnings, lightning, solar flares, loss and retreat, generated planets on dry level ground, determinism, campaign order and rewards, save validation, achievements, page stamps |

## Local testing tips

- Serve `dist/` over HTTP (see README). On `localhost` only, the page exposes
  `window.dragonflyState`, `window.dragonflyRenderer` and `window.dragonflyTick(now)`, so a script
  can step the real frame loop and read the page even when the browser tab is hidden.
- A `.claude/` folder may exist locally for the Claude desktop preview; it is excluded from git.
