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
The existing [Sites copy](https://dragonfly-titan-gcs-demo.tboy450.chatgpt.site/)
is managed separately.

## Assets

Three.js 0.180.0 is included under its [MIT license](dist/vendor/three/LICENSE).
The Titan terrain reference image was supplied for this project. NASA mission
references are linked within the app.

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

The 875 kg mass, 1.35 m rotor diameter, 20 kWh usable battery, 0.75 figure of merit
and 1.15 induced loss factor are illustrative assumptions. Coaxial pairs share
four unique swept disks for the ideal momentum calculation. RPM mixing and the
near-surface atmosphere approximation are educational, not flight-qualified.
There is no chamber CFD, MMRTG charging, battery cutoff, validated aerodynamic
model or actual mission telemetry. Terrain-following altitude is a demo AGL
coordinate, not an inertial vertical-dynamics solution.
