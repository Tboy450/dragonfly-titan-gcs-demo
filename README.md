# Dragonfly Titan GCS

[Open the simulator](https://tboy450.github.io/dragonfly-titan-gcs-demo/)

A browser-based, NASA Dragonfly-inspired flight and telemetry demo. Includes a
3D rotorcraft, continuous Titan terrain, manual flight controls, and fixed and
360-degree free cameras. This is an educational simulation, not an official
NASA flight product or a validated flight dynamics model.

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
The existing [Sites copy](https://dragonfly-titan-gcs-demo.tboy450.chatgpt.site/)
is managed separately.

## Assets

Three.js 0.180.0 is included under its [MIT license](dist/vendor/three/LICENSE).
The Titan terrain reference image was supplied for this project. NASA mission
references are linked within the app.

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

## Missions and Diagnostics

Begin the fictional shoreline survey, fly to the dry outcrop manually or with
guided flight, land, collect a sample and return to base. The nearby hydrocarbon
pool is a training feature, not an actual Dragonfly landing-site reconstruction.

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
and slope-aligned rocks sample the same rendered triangles.

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
