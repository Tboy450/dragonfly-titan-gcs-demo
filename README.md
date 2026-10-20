# Dragonfly Titan GCS

[Open the simulator](https://tboy450.github.io/dragonfly-titan-gcs-demo/)

A browser-based, NASA Dragonfly-inspired flight and telemetry demo. Includes a
3D rotorcraft, continuous Titan terrain, manual flight controls, and fixed and
360-degree free cameras. This is an educational simulation, not an official
NASA flight product or a validated flight dynamics model.

New to the code? Start with [ARCHITECTURE.md](ARCHITECTURE.md) (file map, shared state, house
rules) and the latest entries in [CHANGELOG.md](CHANGELOG.md).
The interior is being redrawn part by part from sources, tracked in the
[Interior realism checklist](INTERIOR-REALISM-TODO.md); every photo, paper page and patent
behind each part is listed in [research/PART-SOURCES.md](research/PART-SOURCES.md). The
part numbers in Internal and Thermal now stay on their parts as the view turns (October 15); a
crowded number moves to a nearby spot with a short leader line back to its part.

October19: [part09 evidence and inspection update](research/rde-inspection-2026-10-19/README.md)
adds individual focus for the two provisional rotor controllers and removable covers/casings/
mounts/interfaces, without changing their estimated geometry or any flight physics. Clearer
hardware imagery is still needed;09 stays open and the initial-pass count remains20/24.

## Swarmfall: Drone Invasion (game)

[Play Swarmfall](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/) (its own page,
`dist/invasion/`; the simulator above is unchanged). A strategy game built from the simulator's
best parts: drop drone swarms on planet after planet in a campaign galaxy and take each world by
force or by quiet control.

- **Campaign:** seven planets invaded in order, from Titan (an empty practice planet on the
  simulator's real Ahmakiq Undae terrain) through rising society levels (tribal, agrarian,
  industrial, networked, spacefaring) and threat levels. Each win opens the next planet and pays
  matter, new drone types or bigger drop pods.
- **Drops:** a squad arrives as a wave of parachute pods carrying **1–3 drones each**; a large
  Dragonfly travels alone. Slot capacity, matter cost and recharge apply once to the whole wave.
  The drop panel shows pod count and courts before launch. Pick a zone, inspect the spaced
  court outlines, then choose **Launch here**. Unsafe/occupied courts refuse the drop without
  charging matter. Drones arriving later retain their squad's orders. Held zones pay matter
  over time and become landing areas. Existing paid single-pod saves keep their original payload.
- **Damage or control:** Strikers and Breachers destroy defenses (salvage pays matter, but the
  public's alarm rises); Links capture under fire, calm the public and turn standing defenses to
  your side. High alarm brings militia raids, stronger defenses and artillery.
- **Hazards:** methane rain, gust fronts, dust storms, acid rain, blizzards, ash clouds,
  eruptions, lightning and solar flares, each announced before it starts. Zones you hold give
  shelter.
- **The Dragonfly** is an unlockable drone: recover NASA's lander from its landing site on Titan
  and it joins every later drop (the simulator's research model, interior removed).
- **Objectives and achievements:** two optional goals per planet (three stars) and twelve
  campaign achievements, saved in the browser. Required captures offer **Leave for victory**
  or **Continue capturing**. Continuing keeps a visible extraction action and remaining-zone
  count. Earned victory remains available if zones are retaken, but total defeat can still lose
  the mission. Stars and time goals finalize on extraction. Recalled survivors refund half
  their cost; unreleased pod cargo is fully refunded. Each attempt's result settles once.
  Watchtower/jammer goals explicitly allow **destroy or capture**, with a live hostile count.
  A defense retaken by the enemy counts against that goal again until neutralized.
- **Mission saves:** active battles save on this device every five seconds and when the page
  is hidden or left. Choose **Resume mission** on the title screen; the restored battle starts
  paused. Starting another mission asks before replacing that save. Browser storage must be
  available; campaign progress and the active battle are saved together.
  Resume retains active/inbound squad selection, camera, draft payload and drop-panel state.
  It shows the HUD at 1×, cancels landing placement and requires a fresh explicit launch.
  Existing issued orders and paid cargo remain in the battle; resuming adds no purchase.
  Earlier mission/progress saves migrate automatically. Results save immediately with the
  completed checkpoint cleared; a storage failure shows a retry action and retains the result
  in memory. If storage stays unavailable, keep the page open until it can save.
  **October 19 — Codex:** resume validation now checks unit/order/zone references, complete
  pod waves, combat/hazard fields and bounded data before restoring. Old v1/v2 checkpoints
  remain supported. **Save files** on the title screen now offers session/original JSON
  downloads, preserved browser backups and retrying storage access. Unsupported/damaged
  saves show a recovery notice; recovering readable campaign data or starting fresh requires
  confirmation and a verified exact-original browser backup before replacement. Failed backup
  or writes retain the original. Browser backups share this device's storage; download a file
  for an external copy. Real browser/download/touch acceptance remains open.
- **Landing and resources:** Scouts, Links, Strikers and Breachers stay airborne. Dragonfly
  lands in a safe held zone to drill matter. A small drill drone and landed-harvest balance are
  planned; this release does not add that unit or increase extraction rates.
- **Controls:** on desktop, left-click a drone to select its squad; right-click the ground
  to move, a ring to capture or a defender to attack. Shift/Ctrl/Meta+click toggles additional
  squads; an empty left-click clears selection. Squad cards also select. On touch or pen, tap
  a drone/card to select, then tap the destination or target to order. Drag to pan, scroll or
  pinch to zoom; right/middle/Alt+drag or Q/E turns. WASD/arrows pan, 1-9 select squads, 0 all,
  H holds, B opens drops and Space pauses. In landing placement, click/tap only previews;
  Launch here confirms the purchase, and right-click or Cancel cancels the preview.
  **Clean view** or **V** hides HUD panels and battlefield labels; the small Show HUD button,
  V or Escape restores them. R/F retain camera pitch. Opening drops or ending a mission restores the HUD.
  At distant zoom, friendly drones below 8 projected CSS pixels receive small squad-colored
  diamonds; selection rings and damage bars remain. Clean view hides these markers too.

All game numbers, the invented worlds and the drone and defender models are gameplay choices,
not physics. Rules are in plain modules with tests (`tests/invasion-*.test.mjs`); see
ARCHITECTURE.md. Later ideas from the owner: a free mode with a galaxy of planets to pick from,
and a local versus mode where players race to take the same planet with drone-vs-drone weapons.
The [Swarmfall prioritized update checklist](SWARMFALL-TODO.md) was expanded October 19 with
ordered milestones, current implementation status and detailed acceptance tasks. Multiple
parachute pods and victory/continue remain first. It also tracks playable cities, destruction,
pilot control, drone-specific tactics, better graphics and a separate persistent free-roam
planet mode alongside the campaign; these are planned features. The [RTS/space design study](research/swarmfall-design-2026-10-19/README.md)
links reference games and proposes connected territories, scouting/relays, recoverable drones
and modular loadouts. Existing task IDs and the full previous checklist are preserved.
Future visual priority **ART-09** reviews and upgrades small assets that lag behind the best
existing work, including unit details, props, icons, textures and effects, while preserving
originals and keeping performance and gameplay readability in view.
Scout's first hull/sensor polish pass is implemented; [before/after and checks](research/scout-polish-2026-10-19/README.md)
record the preserved original and pending real-browser/phone art review.
Inspect it in the lab: [Original Scout](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?asset=drone-scout&scout=original)
/ [Polish pass](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?asset=drone-scout&scout=polished).
Both offer orbit, zoom and turntable controls; the version links reset the camera.

### Asset & Environment Lab

[Open the public Asset & Environment Lab](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/).
Choose **Environments** for the five city tests and their four destruction stages, or **Assets**
to inspect 18 individual models: four Swarmfall drones, five urban buildings/props and nine
fantasy pieces. Each asset has creator/license details, orbit/zoom views and a turntable.
The lab is also linked from the game's title screen. It is separate from campaign progress.
**October 19 — Codex:** damaged city stages now include animated smoke, flame tongues,
embers and warm local firelight. Major destruction burns more intensely; ruins have smaller
residual fires. Use **Smoke**, **Fire & embers** and **Pause effects** independently, or
**Light** quality for fewer particles and no added point lights. Reduced-motion preference
starts the effects paused. Compatible individual architecture assets also offer destruction
previews; the intact originals and drone inspector remain available.
Try [Skyway with smoke/fire](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?scene=cyberpunk&damage=heavy)
or [the alien arcology](https://tboy450.github.io/dragonfly-titan-gcs-demo/invasion/environments/?scene=alien&damage=heavy).
These are visual aftermath studies; spreading fire, combat damage and sound remain future work.
[Implementation and verification](research/lab-aftermath-2026-10-19/README.md).
October 17 publication supersedes the earlier local-preview-only status recorded below;
all existing local links, historical foundation versions and original asset files are retained.

The separate **Asset & Environment Lab** compares city directions without changing campaign planets
or mission saves. Run `python research/fantasy-city-2026-10-16/preview-server.py` from the
repository root, then open [the local gallery](http://127.0.0.1:4201/invasion/environments/).
It serves the gallery on port 4201 with fresh resources; the existing game preview can stay open.
The first three tests are [Alien arcology](http://127.0.0.1:4201/invasion/environments/?scene=alien),
[Metropolis](http://127.0.0.1:4201/invasion/environments/?scene=metropolis) and
[Tidal citadel](http://127.0.0.1:4201/invasion/environments/?scene=citadel).
Two complete Blender-scene tests now supplement those original compositions:
[Cyberpunk City / Skyway megacity](http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk) and
[drone City / Phototextured city](http://127.0.0.1:4201/invasion/environments/?scene=drone).
Skyway is the strongest intricate/alien architecture comparison; Phototextured City provides
the more realistic urban comparison. Both retain the source city layout and use a normalized
2 km span for inspection, not verified real-world dimensions.
Cyberpunk City's new land follows individual architectural contact points, with small footing
pads, coastal slopes, access roads and animated ocean water. **Foundation** frames the ground;
the credits panel links to the retained flat-ground and first two foundation passes. The owner
prefers the second low-coast pass, retained as the baseline; fitting all elevated bases remains open.
The later high terrain envelope was rejected because it swallowed buildings and is archived.
[Foundation tooling shortlist](research/fantasy-city-2026-10-16/FOUNDATION-TOOLS.md) records Blender,
Houdini and Unreal options for future fitting. Skyway megacity and Phototextured city remain the
gallery titles, with original asset names in credits. These are local previews, not a published update.
The [Blender fitting test](http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&foundation=blender)
preserves the earlier underside-fitted structural-fill experiment on that second coast.
[Blender authoring project and tool status](research/fantasy-city-2026-10-16/foundation-authoring/README.md)
record the reusable Geometry Nodes setup, portable Blender and verified SideFX Launcher download.
Houdini 22.0.466 Production is now installed with Apprentice licenses activated (October 17).
The owner rejected the building-extension approach and requested a Houdini terrain fit.
The [Houdini coastal test](http://127.0.0.1:4201/invasion/environments/?scene=cyberpunk&foundation=houdini)
is the current Skyway preview. It uses a connected landscape, projected building bases and constrained terrain steps, with the
second coast's outer shore and animated water. **Rear coast** and **Building bases** add inspection
angles. [Editable Houdini project and measured fit](research/fantasy-city-2026-10-16/houdini-authoring/README.md)
record the native node graph and independent gap/burial checks. Source buildings are unchanged;
the earlier platform, second coast, flat-ground and Blender passes remain available. Terrain
art direction still needs owner review, especially the high rear districts in the source model.
Each offers vista, district and street cameras, orbit/pilot movement, flyover, dusk and a
lighter render setting. These are visual studies; collision, campaign navigation, streaming
and destruction remain checklist work. [Runtime credits](dist/invasion/environments/CREDITS.md)
identify the imported CC0 models and original compositions.

The reusable source library is **`C:\Users\Heemi\Documents\Game Asset Library`**, outside
this repository and available for other projects. Six completed backups total 1,843,813,552
bytes: cyberpunk City, drone City, Downtown City MegaKit Standard, Kenney Fantasy Town Kit,
Spaceship HY-21 and Poly Haven Hidden Alley. Its README and JSON catalog retain source links,
creators, licenses, SHA-256 hashes, archive inventories and pending downloads.
[Backup status and handoff](research/fantasy-city-2026-10-16/ASSET-BACKUPS.md).
All existing work, original archives and Downloads copies are retained; no paid packs were bought.
The first gallery's exact source and screenshot are preserved in
[the v1 archive](archive/environment-lab-v1-2026-10-16/README.md).

The visual target remains large, intricate, less blocky alien/fantasy cities. Minecraft is a
scale/infrastructure reference; Skyrim, Spider-Man, Crackdown, Kakarot and Synty Elven Realm
remain in the [city research](research/fantasy-city-2026-10-16/README.md) and
[complex-scene shortlist](research/fantasy-city-2026-10-16/COMPLEX-SCENES.md).
Spacecraft, orbital stations and planetary/alien architecture are priorities in the download
queue. Future individual-drone control (**MODE-20**, **PILOT-01–09**) includes switchable
first-person onboard and third-person chase views, flight/aim/abilities, and a return to RTS
command while other squads keep their orders. An optional dedicated pilot/skirmish mode
can come first; campaign integration remains the eventual goal. The owner's Ghost Recon /
RTS reference guides the idea; the exact title is unspecified. The later Tank Wars-style
builder (**MODE-21**) also remains planned. Victory extraction/continued capture and multiple
pods carrying 1–3 drones each are now implemented, with browser/device acceptance still open.

**October 17 — progressive destruction artwork:** all five city tests now offer **Intact,
Damaged, Major destruction and Ruins**. Broken facades, jagged tower sections, exposed floors,
bent rods and settled rubble are actual derivative 3D meshes; the original architecture,
terrain, ocean and citadel foundations remain available. Start with the
[alien destruction test](http://127.0.0.1:4201/invasion/environments/?scene=alien&damage=heavy)
and switch maps/stages in the sidebar. These are visual prototypes; battle damage, collision,
save persistence and collapse animation are still open.
[Game integration review and all five test links](research/fantasy-city-2026-10-16/GAME-INTEGRATION.md)
record the measured asset sizes and concrete route into campaign districts. Multiple-pod
delivery remains the next requested gameplay pass; parachutes were not changed here.

## Run Locally

Serve the `dist` folder over HTTP, then open the local URL (the game is at `/invasion/`):

```sh
python -m http.server 4176 --directory dist
```

The app uses JavaScript modules and WebGL 2. Dependencies are included locally;
there is no package installation or build step.

## Checks

```sh
node --test tests/*.test.mjs
```

## Publishing

Pushing to `main` runs the checks and publishes `dist` to GitHub Pages.
Local files reference each other with `?v=dev`. The publish workflow replaces every stamp
with the commit hash and writes the build into the header ("Build 1a2b3c4 · date"), so phones
always fetch fresh files and you can see which version is live. Leave the `?v=dev` stamps as
they are; a test checks them.

Record every change in [CHANGELOG.md](CHANGELOG.md), signed with who made it.
The older [Sites copy](https://dragonfly-titan-gcs-demo.tboy450.chatgpt.site/)
is managed separately and is being retired; `sites-redirect/` holds the page that forwards
its visitors here.

## Assets

The [October 10 NASA/APL source review](research/source-review-2026-10-10.md) records
eight official references, including NASA's printable Dragonfly model, and proposed
realism changes. The [October 11 inspection update](research/vehicle-inspection-2026-10-11.md)
implements the reference viewer, selected geometry corrections and component diagnostics.
[APL model reference assets and credits](research/apl-spacecraft-models/README.md)
preserve the originals; [compact viewing copies](dist/assets/vehicle-references/README.md)
load on demand in the Mission view.

Three.js 0.180.0 is included under its [MIT license](dist/vendor/three/LICENSE).
Inspection toolbar icons are from [Lucide](dist/vendor/lucide/README.md), with their license included.
The Titan terrain reference image was supplied for this project. NASA mission
references are linked within the app.

## Landing Area

The landscape follows the published description of Dragonfly's landing area, **Ahmakiq Undae**
(named by the IAU in September 2026): dunes and interdunes south of Selk crater, reaching to the
edge of a range of hills. The base sits in a flat interdune corridor about 2 km wide between two
long dunes 75-120 m tall that run roughly west to east, with hills beyond the northern dune.
Dune sizes follow published Cassini results; the exact layout is illustrative. Dune sand is dark
and pebble-free; the interdune keeps the Huygens-image ground texture. The previous maps are
archived in [archive/](archive/).

## Flight Controls

- **Pilot** fits the flight box to the available browser height while keeping telemetry,
  the flight graph, science, mission controls and references on the scrollable page below.
  The small fullscreen button expands only the flight box; press it again or Escape to exit.
  Native browser zoom remains available. In **Free** camera, drag to orbit and scroll, pinch or
  use the **+** / **−** buttons to move the camera in (to about 2 m, close enough to see the
  antenna's slots) or out; **Fixed** always uses the normal chase distance. The reset icon beside **Diagnostics** requires
  a second tap to confirm; the footer also retains **Start over from the landing**.
- **Takeoff** climbs to 40 m and hovers. **Cruise** holds altitude (at least 20 m) and
  flies forward at 10 m/s. **Land** descends at up to 1.3 m/s, slows near the ground and
  idles the rotors after touchdown. **Auto** resumes the demo profile from the phase that
  matches the aircraft (takeoff if landed, hover if airborne).
- The **throttle** is a climb-rate command: 50% holds altitude, higher climbs, lower
  descends. By default it is *sticky* and stays where you leave it. The
  "Throttle: sticky / centering" toggle under the stick makes it spring back to 50% on
  release. Yaw, pitch and roll always spring back to center.
- Sticks respond to how far you drag from where your finger lands, so touching a pad
  never jerks the controls. Moving the throttle cancels a button's altitude hold;
  steering does not.
- Attitude, climb rate and forward speed are rate-limited (climb 3 m/s, sink 2.5 m/s,
  about 1 m/s² horizontal), so mode changes never teleport the aircraft. The chase camera
  eases between Fixed and Free instead of snapping.
- Keyboard: W/S throttle, A/D yaw, arrow keys pitch/roll, Space levels off and holds
  altitude.
- **Reverse (sim)** beside **Throttle: sticky** arms a tiny fictional reverse-thrust
  brake, off by default. In manual flight, lower the throttle all the way to **0%**
  above 1 m: the pulse adds up to 0.2 m/s² of downward acceleration, continuing
  through the climb apex until reaching 0.6 m/s descent. It uses a small modeled rotor
  pulse, reversed rotor animation and 50 W extra
  electrical load [EST]. Normal descent speed and the gentle touchdown flare stay
  unchanged. It does not operate in Auto, flight plans, altitude hold, safety descent,
  arrival or over liquid. Both views show off / armed / down thrust, and landed saves
  retain the enabled setting. This is a simulator convenience, **not a capability
  of the real Dragonfly's fixed-pitch rotors**.

## Vehicle Inspection

Mission's **Internal** and **Thermal** layers have an inspection toolbar for the research
model. Choose a component to frame it, optionally isolate its assembly, zoom, or enable
drag rotation. With the canvas focused, arrow keys orbit, +/- zoom and Home resets the
view. These inputs do not steer the vehicle. Native Ctrl browser zoom and page scrolling
remain available; touch rotation is opt-in. The original mock-up keeps its existing view.

**Follow sampling** tracks the shared drill, transfer, carousel and DraMS stages. Manual
component selection ends follow mode. The pause icon pauses the whole simulation, so the
science clock, power and sample results cannot drift apart; the inspection camera remains
usable. Reset restores the whole model. Geometry, stage timing and visual flow markers
are illustrative, not flight CAD or onboard imagery.

The expandable **Inspection layers** section hides the body/attic shells, separately modeled
foam, compartment panels and flow markers. Component casings, covers, mounts, interfaces and
harnesses can be hidden independently where modeled; the component menu marks hidden settings.
**Restore layers** keeps the current camera and selection; the camera reset restores everything.
These are viewing masks on existing geometry, not a verified structural layer stack.

The [two EFIELD probes](research/nose-sensors-2026-10-17/README.md) follow real 2025
engineering-model photos, with published 30 cm carbon-fiber stalks and 5 cm gold electrode
balls. Preamp size and exact installation remain estimated. The
[METHAN cell](research/methan-2026-10-18/README.md) is an owner-approved, labeled design
approximation with removable filtered covers, supports and fiber entry; it is not photo-matched
hardware. Warm DPU sources/detectors and hidden optics are not invented. The subassembly menu
focuses Front EFIELD, Rear EFIELD or METHAN independently. Initial asset pass #22 is complete;
the current count is 20/24, including the later approved navigation approximation. Geometry: Codex.

The [nose bulkhead study](research/nose-bulkhead-2026-10-19/README.md) replaces the old block
with a provisional thin face, perimeter returns and mounts. Real integration photographs,
separately labeled CAD and process renders are saved together. Complete nose-face geometry
and dimensions remain unresolved, so #03 stays unchecked; the current total is 20/24. Hiding
the face shows unmodeled space, not a verified hollow flight panel. Geometry: Codex.

The [part-05 approved navigation approximation](research/ocellus-outer-structure-2026-10-19/README.md)
replaces the plain Ocellus boxes with estimated machined MEB structure and FEB base/returns,
receiver barrel and angled collimator housing, retaining NASA's nominal 2023 envelopes.
Real related-hardware photos inform construction; identified CAD supports scale/layout,
not actual finishes. Both Honeywell space MIMU family models and every installed pose are
unchanged. Four unit focuses plus shelf, independent casings/covers/mounts/IMU interfaces
and original05 anchor retained. All units clear rebuilt neighbors without moving them.
Hidden boards, detailed optics and harness remain unmodeled. #05 initial pass checked as an
owner-approved approximation, not flight verification: 20/24 total (5 Codex,15 Claude).
Exact flight variant/configuration/interfaces remain follow-ups. Geometry: Codex.

The [later Ocellus evidence follow-up](research/ocellus-evidence-2026-10-19/README.md) saves
original NASA SQRLi review slides/hardware photos, identified Ocellus packaging CAD and a
credited real digitizer-test photo. They improve the reuse/layout evidence, not flight-box
photo verification. Research only: the published IMUs/lidar studies and app behavior remain
unchanged in that historical checkpoint. The later approved outer-structure pass above
supersedes its unchecked/count19 status; the evidence limitations still apply.
The [deeper cross-project search](research/ocellus-cross-project-2026-10-19/README.md)
traces predecessor lidar electronics, SpaceCube Mini, real fiber-interface heritage and
supplier leads back to Ocellus. Credited original pages/images and an evidence comparison
are saved. Confirmed family reuse is separated from unverified scanner/processor variants;
no unrelated project's hardware or hidden boards were installed in the model.

The [aft bulkhead](research/aft-bulkhead-2026-10-15/README.md) follows NASA/APL's real structure
photos: gold-colored face, ribbed circular generator interface and pocketed rim. The generator
rises aft at an estimated 25 degrees; the fan collar and aft body profile follow the same
interface. Exact dimensions, coating and internal air passage remain unverified. The source
fixture is explicitly inverted in NASA/APL's caption. Geometry: Claude; closeout: Codex.

**Model assumptions** now separates sourced design references, approximate geometry,
invented training geography, simplified engineering and deliberate simulation additions.
Implementation and limitations: [interactive inspection notes](research/interactive-inspector-2026-10-12.md).

## Arrival at Titan

On a browser's first visit the app opens with a one-minute, time-compressed entry, descent and
landing sequence following the published timeline: entry at 1,270 km, drogue and main
parachutes, heat-shield separation, the lander lowered below the backshell, rotor spin-up,
release at 1,000 m and powered flight to touchdown. **Skip** ends it; "Replay the arrival at
Titan" at the bottom of the page plays it again. The hardware sizes (4.5 m 60-degree aeroshell,
8.25 m disk-gap-band drogue, 16.7 m ringslot main) are published; the textures, plasma glow,
sparks, smoke puffs, haze wisps, touchdown dust and camera moves are artistic. Under the main
parachute the camera looks down past the canopy while the ground emerges from the haze, and
it closes in on the lander within about three seconds of release.

## Sound

Sound is off until you turn it on with the **♪** button next to Mission and Pilot (browsers only
start audio after a click or tap; the choice is remembered). Everything is synthesized, with no
audio files: the rotors' low chop at the blade-pass frequency (rpm / 60 x 3 blades, 35 Hz at
700 rpm) plus a faint motor whine, wind that rises with wind and flight speed, and in the
arrival the entry roar, parachute flutter and a thump at each separation. Pitches follow the
simulation; levels and textures are artistic. Sound pauses when the page is hidden.

**Sound on Titan.** The Huygens probe measured the speed of sound at the surface at about
194 m/s (Earth: 343 m/s), so sound takes about 1.8 times longer to arrive: in the arrival the
separation thumps are heard up to about a second after you see them, depending on how far the
camera is. Titan's air is 4.4 times denser than Earth's, so the same vibrating part radiates
about 2.5 times the sound pressure (about +8 dB), and wind of a given speed is noisier; the wind
sound is weighted for that. Pitches set by rotation (rotor chop, motor whine) are the same as on
Earth; pitches set by air resonance (voices, pipes) would drop to about 0.57 times, but none are
simulated. A sand hiss joins in when the rotor wash raises dust.

## Rotor-Wash Dust

Near the ground the rotor wash lifts sand. In hover the wash is about 4.4 m/s, calculated from
the published mass, Titan's gravity and air density and the rotor size, and sand starts moving
at about 1 m/s. Dust appears when the rotors are working within about 6 m of the ground: more
with more throttle or a hard climb, swept behind in fast forward flight. It rolls outward from
under the rotors, rises and fades, and stays where it was raised as the vehicle moves on. Dune
sand gives the most, the rain-dampened ground and the icy outcrop much less, the puddle none.
The arrival keeps its own touchdown dust. Reach, rates and the look are estimates.

## Vehicle Model

The default 3D model follows the NASA/APL 2023 thermal drawings, with details refined from
APL's 2024 CAD visualization and NASA's 2026 printable-model assembly guide: a long insulated
fuselage, rounded forward "attic", MMRTG between two tail fins, four arms with coaxial three-blade
rotors on machined motor stacks (drawn from APL/NASA's "Revolutionary Rotors" wind-tunnel video), flat landing runners, and a high-gain antenna disc that rises for downlink on its motorized
arm and azimuth/elevation gimbal. The **Model**
button in the vehicle view switches to the original demo model for comparison. Proportions are
measured from the drawings; the overall size matches the published 3.85 x 3.85 x 1.75 m.
Rotor blades are tapered and twisted with a thin cambered section and rounded tips, with hub caps,
and spinning rotors show a faint blur disc that strengthens with rotor speed. Blade chord, twist
and thickness are estimates from the drawings.

Under **Mission > Vehicle Layers > NASA / APL references**, the payload cutaway and rotating
CAD movie retain visible credits, source links and design dates. Compact local copies load
only when opened, and the movie pauses when closed or when switching to Pilot. NASA's
STL/3MF files and assembly/print guides are linked with Gary Allen Backus / Backus Creative
Imaging credited. The simulator still uses lightweight procedural geometry, not imported
flight CAD or the large print meshes.

The updated model has body-side DrACO drill/feed assemblies, estimated pneumatic tube routes,
flanged rotor-arm roots, separate coaxial motor housings and broad skids with shaped supports.
Internal and Thermal distinguish the IEM, two PSUs and Frontier radio. Selecting a component
shows relevant live simulation readings and primary-source links. These share the existing
thermal/system model; there are no invented independent processor or PSU sensor readings.

## First Expedition

**Begin expedition** starts a six-step science exercise across three distinct sites:
collect a dry-sand baseline at base, scout the rain-darkened interdune and return, fly
back to sample it, sample the ice-rich outcrop, return to base, and downlink the records.
The objective explains the next step and its scientific purpose. **Prepare flight**
creates a suggested 40 m route in the existing planner: review its GO / NO-GO checks,
then explicitly uplink it. Use 5x / 20x during flight and up to 100x during downlink.
Recharge or wait for daylight in Diagnostics when necessary; the expedition does not
bypass the energy, thermal, scouting or radio restrictions.

**Science notebook and debrief** is expandable in Mission and Pilot and keeps one new sample from each expedition site, including its
location, time, illustrative composition and onboard/returned status. A record is
returned only after its place in the stored-data queue has actually been transmitted;
earlier downlinks do not count. The final debrief compares the sites and records
elapsed time, flight time, battery energy used (net draw plus preheat) and peak battery
temperature. It remains available after reloading. A reload resumes the last landed
checkpoint and stops any in-progress sample or downlink; resume these explicitly.

Free flight and **Sample here** remain available and can satisfy expedition objectives.
Samples collected before beginning do not count toward a new expedition. The original
short survey is retained under **Optional quick survey / Start over**.

The landscape is an illustrative interpretation of the Ahmakiq Undae landing-area
description: long dunes, broad low interdunes and distant hills, not the previous
mountain basin. Dune spacing (~3.2 km) and heights (75-120 m) follow the published-size
terrain retained during the merge; orientation and site positions are artistic
training choices, not a surveyed elevation model. The
planning map shades the same terrain, with lighter areas representing higher ground.
Both the geology and science results are examples, not actual observations from Titan.

## Quick Survey and Diagnostics

**Surface operations queue** is expandable beneath Science Payload in both views. Queue
up to 12 fresh-sample, downlink or recharge steps, reorder/remove pending steps, then Run.
The queue stays at its starting landing site. Each sample includes acquisition and analysis;
downlink sends the data present when its step begins; recharge hibernates to the chosen
battery percentage using the existing power/thermal model. 1x/20x/100x use the shared clock.

Unsafe conditions, manual takeover or interrupted work stop the queue for explicit review
and Resume. Global Pause freezes the existing job; Stop queue cancels unfinished sampling
without refund. Reloads preserve the plan/completed steps but never start it automatically.
This is training automation, not official flight software. Extended samples still use
estimated timelines. Clear the queue to plan operations at a different landing site.

Science Payload retains the **30-second demo** and offers **LDMS training (10 min)** and
**GCMS training (30 min)**. Extended profiles have distinct stages, instrument loads and
heat coupling to the shared bay; all timings and budgets are **estimates, not flight
procedures**. Their instrument energy is approximately 25.7/129.8 Wh, plus vehicle and
radio loads. Run them at 1x/20x/100x, pause or cancel. Unsafe conditions interrupt the job;
completed records include their mode, site, budget and actual simulated downlink progress.
Reloads stop unfinished jobs without awarding a result.

**Methods, budgets & sources**, **Sample records**, **Science notebook and debrief** and
**Engineering references** are expandable. Section links jump to Flight, Objectives,
Science, Notebook and References without removing any page content. See the
[science-profile source review and limitations](research/science-profiles-2026-10-12.md).

Begin the interdune survey, fly to the dry outcrop manually or with guided flight, land,
collect a sample and return to base. The outcrop sits at the edge of a rain-darkened
interdune: damp ground (darker, safe to land on) around a small methane puddle (no landing).
This matches the kind of ground expected near Dragonfly's equatorial landing area after a
methane storm; it is training geography, not a reconstruction of the real site.

Diagnostics shares the live vehicle state: equipment/battery temperatures,
circulation and insulation integrity, cold-duct trim, electrical load, MMRTG
generation, battery reserve and approximate Titan local time. Hibernation on dry
ground advances thermal/energy calculations with bounded one-second steps and
stops accelerated time on warnings. Generation continues through day and night.

Read [the source audit and model assumptions](RESEARCH.md) for the NASA, APL,
Lockheed Martin and TubeTech references, including claims not supported by the
public sources. The shell-and-tube figures illustrate the liquid-to-liquid exchanger concept
explored in the design study; they are representative industrial designs, not Dragonfly
flight hardware.

The independent liquid-to-liquid exchanger study calculates heat flow and outlet
temperatures from explicit assumptions. It is not part of the flight hardware.
See [the research compendium](RESEARCH-COMPENDIUM.md) and
[the release reconciliation](RESEARCH-FOLLOWUP.md) for follow-up evidence.

## Titan-inspired Weather

New missions get occasional gradual gust events and rarer methane-rain scenarios.
Diagnostics offers **Occasional weather events** or **Fixed wind / events off**.
Moving the surface-wind slider also selects Fixed wind. Automatic events stay within
the 1.6 m/s design maximum; each starts with a visible 60-simulated-second advisory
before building, peaking and recovering. Quiet gaps are 10-20 simulated minutes,
with a 12% rain choice per event. These frequencies and times are **training
assumptions**, not predictions for Titan. Pause freezes weather, and accelerated
hibernation stops at a new advisory instead of silently skipping it.

**Run strong methane-storm training** is optional: 120 seconds of warning, a gradual
build, and gusts up to 4.5 m/s above the flight design envelope. It holds new flight
plan uplinks through recovery, but does not crash the aircraft or automatically
abort an existing flight. Land before strong winds. Select Fixed wind to end an
event; the current wind becomes the fixed setting until you change the slider.

Rain/cloud scenarios gradually thicken the Pilot-view haze, dim the light and add
darkening/gloss to the existing rain-darkened interdune. Additional wetting fades
with a two-hour simulated decay time. These are visual training effects: no flooding,
puddle growth, new landing hazards or altered sample chemistry. Wind feeds the
existing convection and power calculations, so component temperatures can respond;
ambient remains -179.15 C, without invented Earth-style hot/cold fronts. Last-landed
saves preserve event progress, randomness and wetness. Older saves retain fixed wind.

The inspiration is published Cassini observations of [cloud evolution over 11 hours](https://science.nasa.gov/photojournal/pj-watching-summer-clouds-on-titan/),
[equatorial methane-rain wetting](https://science.nasa.gov/resource/titanic-deluge-annotated/),
and [inferred organic dust storms](https://science.nasa.gov/solar-system/dust-storms-on-titan-spotted-for-the-first-time/).
They do not establish these local wind profiles or warning lead times.

## Flight Planning

Real Dragonfly flights are planned on Earth, uplinked and flown autonomously (signals take
73-90 minutes each way). **Plan flight** opens a map: tap waypoints, choose 40 m, 150 m or
400 m cruise altitude and check the GO / NO-GO estimate (energy, time, battery heat, daylight,
landing site). **Uplink plan** sends it; after a short simulated delay the lander flies itself.
Use 1x / 5x / 20x to speed up time during the flight, or **Stop plan** to hold position.

Leapfrog scouting: the last waypoint must be a scouted (green) site. Flying within 60 m of an
amber candidate site at 20 m or higher scouts it, so a later flight may land there.

## Saved Progress

Your mission is saved in the browser while the lander is on the ground and whenever you leave
the page: position, battery and temperatures, the Titan clock, scouted sites, samples, the
science log, expedition notebook/debrief and stored data. Coming back resumes the last landed
checkpoint. **Start over** (under Optional quick survey, or in Diagnostics) clears it and
starts again from the landing sequence. Existing saves remain compatible; their expedition
starts unbegun and their earlier samples remain in the Science Payload panel.

## Vehicle Layers

Under the Mission diagram, **Exterior / Internal / Thermal** switches the vehicle view. Internal
makes the foam shell see-through. Parts already redrawn from their own photos and papers: the
sample carousel, Wonderwall and DraMS in the attic, the Frontier radio, the integrated
electronics module, the two power switching units, and the lower DragonCam cameras (Microscopic
Camera, LED array and Down Cameras in foam cavities), and the nose cameras (Forward MAC and WAC,
two Side Cameras, two NavCams on a camera panel), and the DrACO drills (gold head with percussion
and rotation actuators on a Z-stage rail; the head slides down while only the bit turns), and the
sample-transfer system (flexible hoses, tubes into the attic, a flow diverter on the carousel and
a return line to two blowers behind the port forward arm), and the 100 W radio amplifier (TWTA:
a tube and its power conditioner under the top deck, drawn like published flight TWTAs because
Dragonfly's is not pictured), and the high-gain antenna's gimbal (azimuth turntable and elevation
drum under a foam dome just aft of the attic, the motorized arm and pedestal that raise the dish,
and the launch and flight locks), and the battery (24 upright cells in a ribbed enclosure with an
aluminum upper housing, fans and heat pipes, its look from real photos of APL's test module);
their positions are mostly estimated. The rotor drive electronics are a provisional enclosure
illustration (Codex) until a clear photo turns up. The aft bulkhead and EFIELD assemblies are also
rebuilt; METHAN and Ocellus are approved design estimates, not photo-matched. Remaining placeholders are
the battery/MMRTG temperature sensors; the nose bulkhead remains a provisional
structural illustration, not a completed photo-match. The air loop was redrawn from NASA/APL's
thermal talks: two circulation fans at the MMRTG end, the warm duct forward under the floor into
the nose, and the trim device, a cold bypass duct under the belly between fore and aft diverter
flaps (an earlier side-chimney concept is archived). Arrows follow the warm-air loop from the
MMRTG. The loop is live: its arrows move with the fans' flow and go from MMRTG-warm to bay-cool;
when the diverter flaps open, a share of the flow (blue) runs forward through the exposed cold
duct, and the flaps swing open with the setting. Green dots mark the controller's two temperature inputs (battery and
MMRTG fin root). A "Warm-air loop" panel under the diagram explains, with live values, how the
air moves, how it is regulated (trim 0-40% in 2% steps about every 10 minutes) and how it is
measured. Thermal colors
every part by its live temperature. In either view, expand **Component temperatures** to
see the live readings and their sources; it starts collapsed and is hidden in Exterior.
Tap a diagram number to open the panel and select that part, or select its row by mouse,
touch or keyboard. Both views color the readings with the same temperature scale, shown
inside the panel; **Scale** zooms between whole-lander and inside ranges without changing
the color of any reading or part. Colors are anchored to absolute temperature: blue is cold,
green is the 0-20 C equipment/battery reference band, yellow is warming, and red is 35 C
or higher. These are not fault indicators or certified operating bands for every component:
the cold exterior and hot MMRTG gas have different targets.
The Internal diagram keeps its component materials; Thermal colors the diagram by temperature.
The Pilot view shows the same live battery, temperature,
flight-time, link and plan readouts in a compact strip.

With the **original** model selected, Internal and Thermal show a clearly labeled **mock-up**
interior instead: that model is not based on the real design, so its parts are made up for
illustration (their temperatures still come from the simulator).

Each layer has its own backdrop. **Exterior** offers three, switched with the small **a / b / c**
buttons at the bottom left of the diagram: (a) a cinematic dune panorama cropped from NASA/APL's
Dragonfly animation, preserving the original terrain, lighting and haze; (b) an illustrative
assembly clean room with a gently projected perforated floor, rectangular light reflections,
keep-out tape, purge and tool carts, and larger equipment where space permits; (c) a composite
of real Cassini Saturn and Titan photographs over a restrained star field. Both planets fit
within the canvas, with the vehicle centered between them. A is an artist's concept, and C is
not to scale or a view from Titan's hazy surface. Image credits are linked below the diagram;
source and processing details are in [the asset notes](dist/assets/exterior/README.md).
**Internal** is an engineering blueprint with dimension lines for the
published 3.85 x 3.85 x 1.75 m envelope and a title block; **b** turns it into a black sheet
with a yellow grid and yellow dimensions, title and readouts. **Thermal** offers (a) Titan's
-179 C air in the thermal scale's own color, dimmed so parts at air temperature stay visible,
with a white grid,
(b) light grey with a dark grid, like NASA's published thermal-model figures (the default: the
cold blue parts stand out), and (c) black with a yellow grid. The same a / b / c buttons switch
the backdrop in every layer, and each layer remembers its choice. Readouts turn dark on light
backdrops and yellow in the yellow modes.

## Science Instruments

The Science Payload panel shows each instrument working: DragonCam images in flight,
DraGMet logs weather and occasional quakes, DraGNS measures the ground's makeup while landed
(more precisely the longer it counts), and **Sample here** drills and analyzes the ground with
DrACO and DraMS. Everything they collect is stored on board until a downlink sends it home;
Comms shows how long that will take. Results are illustrative examples, not mission data.

## Operations

- **Motor preheat:** the first liftoff after 30 minutes on the ground charges 60 Wh
  (8 motors x 90 W x 5 min, time-compressed).
- **Comms:** the Direct to Earth link is available only when landed, awake and in daylight.
  The antenna is stowed in flight. "Start downlink" draws an assumed 200 W and counts the
  data returned; it stops at takeoff, at night, in hibernation or below 30% battery.
- **Flight endurance:** Diagnostics shows the minutes left before the 15% reserve or the
  35 C battery limit, plus a 30-minute flight timer. The alert bar warns "Land now"
  near either limit, after 30 minutes, or when flying at night.
- **Wind** above the 1.6 m/s design maximum is labeled a stress test.
- **Titan day cycle (time-scaled):** the Mission view's Titan day strip shows the day number,
  local Titan time, a day/night bar and the day's checklist in the real order of operations:
  send data home, one flight, sample science, then night (recharge, seismic and weather work).
  **Sleep until morning** fast-forwards the rest of the day and the night in a few seconds,
  wakes the lander at 08:00 local (after sunrise, so the scene is lit) and posts a morning report. A real Titan day lasts 382.7 hours (about 16
  Earth days) with about one flight per day. Plans, sampling and downlinks can accelerate the
  shared simulation clock; rest is time-compressed too. A second flight in one Titan day is allowed but flagged.

## Engineering Context

Mission and Pilot share the same vehicle mesh, flight state, eight rotor speeds,
controls and local track. Pause freezes the simulation in both views. The terrain
and slope-aligned rocks sample the same rendered triangles. Far from the vehicle, where the
ground mesh is coarse, the terrain drops detail the mesh cannot show and averages dune shapes
around each mesh cell, so distant ridges stay natural instead of saw-toothed; the ground the
vehicle can reach keeps full detail. When the vehicle flies into a new 400 m square, the
recentered ground is built a few rows per frame and swapped in when complete.

The [APL thermal test report](https://tfaws.nasa.gov/wp-content/uploads/TFAWS2024-AT-02.pdf)
provides the Titan environmental baseline and nitrogen-chamber reference.
The chamber is a thermal facility on Earth, not a Titan-gravity flight chamber.
[APL's rotor testing report](https://www.jhuapl.edu/news/news-releases/260123-engineers-lift-dragonfly)
covers NASA Langley and Sikorsky's aerodynamic work.
[Lockheed Martin](https://www.lockheedmartin.com/en-us/capabilities/space/deep-space-exploration.html)
provides cruise-stage and aeroshell hardware.

NASA publishes the 875 kg mass and 1.35 m rotor diameter baseline. Storage follows
the 11.5 kWh design reported in 2022, not a newly verified flight-pack measurement.
Estimated arrival output is 90 W (selectable 70 W), declining 2.5% per Earth year.
The 0.75 figure of merit, drag area and 1.15 induced loss factor are assumptions. Coaxial pairs share
four unique swept disks for the ideal momentum calculation. RPM mixing and the
near-surface atmosphere approximation are educational, not flight-qualified.
There is no chamber CFD, validated aerodynamic model or actual mission telemetry.
The surface thermal model uses source-informed gas flow, foam and convection;
its capacities, loss paths and PI gains are illustrative. Battery limits use the
2020/2023 designs; protective interlocks remain training logic. The trim closes
in flight and uses 2% commands up to 40% on a 600-second landed control cycle.
Both views use the three-blade design confirmed by the rotor engineer in 2026.
Terrain-following altitude is a demo AGL
coordinate, not an inertial vertical-dynamics solution.
