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
- **Never throw away replaced work.** Anything replaced (models, terrain, textures, visuals,
  sounds, behavior), even bad or inaccurate versions, goes to `archive/` in the same change,
  with pictures, restore steps and a git tag (house rule 6 in ARCHITECTURE.md).

## Entries

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
