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
4. **Don't commit the research PDFs.** They are other people's publications; cite them.
   `RESEARCH-COMPENDIUM.md` records which figure or page each value came from.
5. **Sign the change log**, including what is estimated and what is still open.

## Files

### Simulation (no DOM; covered by tests)
| File | What it does |
|---|---|
| `dist/flight-model.mjs` | Vehicle constants, `createFlightState()`, the flight step (`stepFlight`), power curve, flight commands, autopilot branch, flight-plan estimate helper |
| `dist/mission-systems.mjs` | Thermal and energy model, comms/downlink and antenna, trim device, hibernation, survey mission, training geography (damp ground, puddle, candidate sites), land-now logic, thermal zone temperatures |
| `dist/flight-plan.mjs` | Flight plans: waypoints, GO/NO-GO estimate, uplink delay, autopilot guidance, leapfrog scouting |
| `dist/science.mjs` | Instruments: DragonCam data, DraGMet log and seismometer, DraGNS counting, DrACO/DraMS sampling, ground types |
| `dist/edl.mjs` | Arrival (entry, descent, landing) timeline from the published EDL figure |
| `dist/titan-day.mjs` | Time-scaled Titan day cycle: day number, phase, the day's checklist, sleep until dawn and the morning report |
| `dist/sound-mix.mjs` | Pure mapping from the state to sound levels and pitches (testable without audio) |
| `dist/thermal-scale.mjs` | Temperature color scale shared by the thermal layer and its legend |
| `dist/flight-camera.mjs` | Chase-camera pose and smoothing |
| `dist/save-game.mjs` | Which state fields are saved between visits (a whitelist), when saving is allowed (landed, idle), and restoring onto a fresh state |

### 3D scene (three.js; covered by the render smoke tests with a stand-in renderer)
| File | What it does |
|---|---|
| `dist/chase-vehicle.mjs` | Renderer, lights, the original demo model and its labeled mock-up interior, shared part helpers, Mission-view layers (exterior / internal / thermal) for whichever model is selected, `draw()` for the Pilot view and `drawMission()` for the Mission diagram |
| `dist/vehicle-research.mjs` | The NASA/APL 2023 design (with its own twisted rotor blades, hub caps and rotor blur discs) and its interior, grouped into named subsystems tagged with a thermal zone, label and source. The drawing-to-model mapping (327 px/m from the TFAWS 2023 top view) is in its comments |
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
| `ui/layers-panel.mjs` | Vehicle Layers panel: layer switch, legend, parts list, selection |
| `ui/pilot-hud.mjs` | Pilot-view systems list (same values as the Mission panels) |
| `ui/science-panel.mjs` | Science Payload panel and sampling button |
| `ui/plan-panel.mjs` | Flight Plan dialog, plan status strip, time-speed buttons |
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
| `mission-systems.mjs` | `battery`, `power`, `coreC`, `batteryC`, `trim`, `fan`, `fault`, `hibernating`, `elapsed` (Titan clock), `downlinkActive`, `antennaDeploy`, `motorsCold`, `flightSeconds`, `scoutedSites`, `rdeC`/`twtaC`, `mission` |
| `flight-plan.mjs` | `plan` (waypoints, status, phase, estimate, report) |
| `science.mjs` | `science` (samples, log, counters), `dataStoredBits`, `sciencePowerW` |
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
2. Every 0.1 s: refresh readouts, track, plan strip, layers panel, Pilot list and chart.
3. Draw the Mission or Pilot view. The next frame is requested first, so an error in one frame
   cannot stop the app.

## Tests

| File | Covers |
|---|---|
| `flight-model.test.mjs` | Power, continuous flight model, mode changes without jumps |
| `mission-systems.test.mjs`, `operations.test.mjs` | Thermal/energy model, survey, hibernation, preheat, downlink, antenna, land-now |
| `flight-plan.test.mjs` | Plan checks, full autonomous flight, leapfrog, abort, land-now from 400 m |
| `science.test.mjs` | Instruments, sampling, data store and downlink |
| `edl.test.mjs` | Arrival altitudes and ordering |
| `terrain.test.mjs` | Terrain sampling, damp ground, puddle, level landing sites |
| `render-smoke.test.mjs` | Whole 3D scene with a stand-in renderer: both models, antenna, day/night, arrival hardware, layers and callouts, the published envelope, subsystem tags, and that every interior part fits inside the foam-lined cavity |
| `save-game.test.mjs` | Save and restore round trip after a real flight and sample; only landed states; bad saves ignored |
| `flight-camera.test.mjs`, `cache-version.test.mjs` | Chase camera; `?v=dev` stamps and the build label |

## Local testing tips

- Serve `dist/` over HTTP (see README). On `localhost` only, the page exposes
  `window.dragonflyState`, `window.dragonflyRenderer` and `window.dragonflyTick(now)`, so a script
  can step the real frame loop and read the page even when the browser tab is hidden.
- A `.claude/` folder may exist locally for the Claude desktop preview; it is excluded from git.
