import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";

// A minimal stand-in for the browser: canvases whose 2D context accepts every drawing call.
const context2d = new Proxy({}, {
  get: (target, key) => key in target ? target[key]
    : key === "createLinearGradient" ? () => ({ addColorStop() {} }) : () => {},
  set: (target, key, value) => { target[key] = value; return true; },
});
const element = () => ({ style: {}, width: 0, height: 0, getContext: () => context2d, addEventListener() {}, removeEventListener() {}, setAttribute() {} });
globalThis.document ??= { createElement: element, createElementNS: element };
globalThis.window ??= { devicePixelRatio: 1 };

// A renderer that records frames instead of drawing them.
function fakeRenderer() {
  return {
    frames: 0, outputColorSpace: "", shadowMap: { enabled: true, type: 0 }, domElement: element(),
    capabilities: { getMaxAnisotropy: () => 1 },
    setClearColor() {}, setPixelRatio() {}, setSize() {}, setViewport() {},
    render(scene, camera) { scene.updateMatrixWorld(true); camera.updateMatrixWorld(true); this.frames += 1; },
  };
}

test("The 3D scene builds and draws every view, model and antenna pose without errors", async () => {
  const { createChaseRenderer } = await import("../dist/chase-vehicle.mjs");
  const { createFlightState } = await import("../dist/flight-model.mjs");
  const renderer = fakeRenderer();
  const chase = createChaseRenderer({ renderer });
  const state = createFlightState();
  for (const vehicleModel of ["research", "original"]) {
    for (const antennaDeploy of [0, 0.5, 1]) {
      for (const elapsed of [0, 7 * 86400]) {
        Object.assign(state, { vehicleModel, antennaDeploy, elapsed, altitude: 5 });
        chase.draw(context2d, 800, 600, state);
        chase.drawMission(context2d, 800, 600, state);
        assert.equal(chase.models.research.visible, vehicleModel === "research");
        assert.equal(chase.models.original.visible, vehicleModel === "original");
      }
    }
  }
  assert.equal(renderer.frames, 24);
});

test("The research model matches the published 3.85 x 3.85 x 1.75 m envelope", async () => {
  const { createChaseRenderer } = await import("../dist/chase-vehicle.mjs");
  const { createFlightState } = await import("../dist/flight-model.mjs");
  const chase = createChaseRenderer({ renderer: fakeRenderer() });
  const state = { ...createFlightState(), vehicleModel: "research", heading: 0, pitch: 0, roll: 0 };
  // Turn every rotor so a blade points along each axis before measuring the reach.
  const size = (phase) => {
    state.rotorPhase = Array(8).fill(phase);
    chase.draw(context2d, 800, 600, state);
    const research = chase.models.research;
    const inverse = research.parent.matrixWorld.clone().invert();
    const box = new THREE.Box3();
    research.traverse((part) => {
      if (!part.isMesh || part.material.transparent) return;
      part.geometry.computeBoundingBox();
      box.union(part.geometry.boundingBox.clone().applyMatrix4(part.matrixWorld).applyMatrix4(inverse));
    });
    return box.getSize(new THREE.Vector3());
  };
  let width = 0, length = 0, height = 0;
  for (let phase = 0; phase < Math.PI * 2; phase += Math.PI / 36) {
    const s = size(phase);
    width = Math.max(width, s.x); length = Math.max(length, s.z); height = Math.max(height, s.y);
  }
  console.log(`research model envelope: ${width.toFixed(2)} x ${length.toFixed(2)} x ${height.toFixed(2)} m`);
  assert.ok(Math.abs(width - 3.85) < 0.12, `width ${width.toFixed(2)} m`);
  assert.ok(Math.abs(length - 3.85) < 0.12, `length ${length.toFixed(2)} m`);
  assert.ok(Math.abs(height - 1.75) < 0.08, `height ${height.toFixed(2)} m`);
});

test("Every research-model part belongs to a named subsystem with a thermal zone", async () => {
  const { createChaseRenderer } = await import("../dist/chase-vehicle.mjs");
  const chase = createChaseRenderer({ renderer: fakeRenderer() });
  const research = chase.models.research;
  let meshes = 0;
  research.traverse((part) => {
    if (!part.isMesh) return;
    meshes += 1;
    let owner = part.parent;
    while (owner && owner !== research && !owner.userData.subsystem) owner = owner.parent;
    assert.ok(owner && owner !== research, `mesh outside a subsystem (${part.geometry.type})`);
    assert.ok(owner.userData.thermalZone, `${owner.name} has a thermal zone`);
  });
  assert.ok(meshes > 50);
  for (const name of ["fuselage", "attic", "mmrtg", "fins", "arms", "motors", "rotors", "landing-gear", "drills", "high-gain-antenna", "antennas"]) {
    assert.ok(chase.subsystems[name], `${name} subsystem exists`);
  }
});

test("The arrival sequence hardware draws at every phase", async () => {
  const { createChaseRenderer } = await import("../dist/chase-vehicle.mjs");
  const { createFlightState } = await import("../dist/flight-model.mjs");
  const { edlStateAt, edlDuration } = await import("../dist/edl.mjs");
  const renderer = fakeRenderer();
  const chase = createChaseRenderer({ renderer });
  const state = createFlightState();
  for (let t = 0; t <= edlDuration; t += 0.5) {
    state.edl = edlStateAt(t);
    state.altitude = state.edl.renderAltitudeM;
    chase.draw(context2d, 800, 600, state);
  }
  state.edl = null;
  chase.draw(context2d, 800, 600, state);
  assert.equal(renderer.frames, Math.floor(edlDuration / 0.5) + 2);
});
