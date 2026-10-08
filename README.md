# Dragonfly Titan GCS

[Open the simulator](https://tboy450.github.io/dragonfly-titan-gcs-demo/)

A browser-based, NASA Dragonfly-inspired flight and telemetry demo. Includes a
3D rotorcraft, continuous Titan terrain, manual flight controls, and fixed and
360-degree free cameras. This is an educational simulation, not an official
NASA flight product or a validated flight dynamics model.

New to the code? Start with [ARCHITECTURE.md](ARCHITECTURE.md) (file map, shared state, house
rules) and the latest entries in [CHANGELOG.md](CHANGELOG.md).

## Run Locally

Serve the `dist` folder over HTTP, then open the local URL:

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

Three.js 0.180.0 is included under its [MIT license](dist/vendor/three/LICENSE).
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

## Vehicle Model

The default 3D model follows the NASA/APL 2023 design drawings: long insulated fuselage,
raised "attic" over the nose, MMRTG between two tail fins, four arms with coaxial three-blade
rotors, wide skids, and a flat high-gain antenna disc that rises for downlink. The **Model**
button in the vehicle view switches to the original demo model for comparison. Proportions are
measured from the drawings; the overall size matches the published 3.85 x 3.85 x 1.75 m.
Rotor blades are tapered and twisted with a thin cambered section and rounded tips, with hub caps,
and spinning rotors show a faint blur disc that strengthens with rotor speed. Blade chord, twist
and thickness are estimates from the drawings.

## Missions and Diagnostics

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
science log and stored data. Coming back resumes where you left off. **Start over** (next to
Begin survey) clears it and starts again from the landing sequence.

## Vehicle Layers

Under the Mission diagram, **Exterior / Internal / Thermal** switches the vehicle view. Internal
makes the foam shell see-through and shows the parts NASA's thermal papers describe, placed where
their figures put them: the cold attic with the sample carousel, DraMS, the battery at the aft
end, the drive electronics, avionics, radio amplifier, circulation fan, under-floor duct and the
trim-device chimneys, with arrows following the warm-air loop from the MMRTG. Thermal colors
every part by its live temperature. Tap a number or a row to see a part's temperature and where
its placement and value come from. The Pilot view shows the same live battery, temperature,
flight-time, link and plan readouts in a compact strip.

With the **original** model selected, Internal and Thermal show a clearly labeled **mock-up**
interior instead: that model is not based on the real design, so its parts are made up for
illustration (their temperatures still come from the simulator).

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

## Engineering Context

Mission and Pilot share the same vehicle mesh, flight state, eight rotor speeds,
controls and local track. Pause freezes the simulation in both views. The terrain
and slope-aligned rocks sample the same rendered triangles. Far from the vehicle, where the
ground mesh is coarse, the terrain drops detail the mesh cannot show and averages ridge shapes
over each mesh cell, so distant ridges stay natural instead of saw-toothed; the ground the
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
