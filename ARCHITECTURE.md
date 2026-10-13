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
| `dist/vehicle-inspector.mjs` | Mission-only orbit/zoom limits, focus/reset, assembly membership and follow target from the shared sampling clock; no flight or saved-state changes |
| `dist/save-game.mjs` | Which state fields are saved between visits (a whitelist), when saving is allowed (landed, idle), and restoring onto a fresh state |

### 3D scene (three.js; covered by the render smoke tests with a stand-in renderer)
| File | What it does |
|---|---|
| `dist/sample-carousel.mjs` | First individually rebuilt interior asset: NASA-photo-referenced SDC casing/fins/ports/drives, explicit estimated scale, stationary enclosure and internal indexing pivot |
| `dist/wonderwall.mjs` | Estimated contoured warm/cold partition, real geometry openings and separate faces/core/mount groups for future inspection layer controls; clears the rebuilt carousel |
| `dist/power-units.mjs` | Part 11: the two PSUs from NASA/APL's March 2026 testing photo; sliced silver connector faces, mated harness, black covers, mounts, in separate inspection-layer groups per unit; size scaled from the photo |
| `dist/iem.mjs` | Part 12: IEM from NASA/APL's March 2026 photos; finned top, nine card fronts with micro-D connectors, plugged-in harness, mounts, in separate inspection-layer groups; size scaled from the photos |
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

### Documents and tooling
| File | What it is |
|---|---|
| `CHANGELOG.md` | Signed record of every change (newest first) |
| `INTERIOR-REALISM-TODO.md` | Owner-requested callout fix, numbered part-by-part asset rebuild and enclosure/insulation views; persistent handoff checklist |
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

## Local testing tips

- Serve `dist/` over HTTP (see README). On `localhost` only, the page exposes
  `window.dragonflyState`, `window.dragonflyRenderer` and `window.dragonflyTick(now)`, so a script
  can step the real frame loop and read the page even when the browser tab is hidden.
- A `.claude/` folder may exist locally for the Claude desktop preview; it is excluded from git.
