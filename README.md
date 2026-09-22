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
node --test tests/flight-camera.test.mjs
```

## Publishing

Pushing to `main` runs the checks and publishes `dist` to GitHub Pages.
The existing [Sites copy](https://dragonfly-titan-gcs-demo.tboy450.chatgpt.site/)
is managed separately.

## Assets

Three.js 0.180.0 is included under its [MIT license](dist/vendor/three/LICENSE).
The Titan terrain reference image was supplied for this project. NASA mission
references are linked within the app.
