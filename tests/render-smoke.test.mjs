import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";

// A minimal stand-in for the browser: canvases whose 2D context accepts every drawing call.
const context2d = new Proxy({}, {
  get: (target, key) => key in target ? target[key]
    : key === "createLinearGradient" || key === "createRadialGradient" ? () => ({ addColorStop() {} }) : () => {},
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

test("Weather changes Pilot haze, light and the wet-ground uniform without changing arrival visuals", async () => {
  const { createChaseRenderer } = await import("../dist/chase-vehicle.mjs");
  const { createFlightState } = await import("../dist/flight-model.mjs");
  const { edlStateAt } = await import("../dist/edl.mjs");
  const chase = createChaseRenderer({ renderer: fakeRenderer() });
  const s = createFlightState();
  chase.draw(context2d, 800, 600, s);
  let scene = chase.models.research;
  while (scene.parent) scene = scene.parent;
  const baseline = scene.fog.density;
  const sunlight = scene.children.find(child => child.isDirectionalLight);
  const intensity = sunlight.intensity;
  const ground = scene.getObjectByName("titan-ground");
  const shader = { uniforms: {}, vertexShader: "#include <common>\n#include <begin_vertex>", fragmentShader: "#include <common>\n#include <map_fragment>\n#include <roughnessmap_fragment>" };
  ground.material.onBeforeCompile(shader);
  assert.equal(shader.uniforms.rainWetness.value, 0);
  s.weather.haze = 1; s.weather.wetness = 0.8;
  chase.draw(context2d, 800, 600, s);
  assert.equal(scene.fog.density, baseline * 3.5);
  assert.ok(sunlight.intensity < intensity);
  assert.equal(shader.uniforms.rainWetness.value, 0.8);
  s.edl = edlStateAt(10);
  chase.draw(context2d, 800, 600, s);
  assert.equal(scene.fog.density, baseline);
  assert.equal(sunlight.intensity, intensity);
  assert.equal(shader.uniforms.rainWetness.value, 0);
  s.edl = null;
  chase.draw(context2d, 800, 600, s);
  assert.equal(shader.uniforms.rainWetness.value, 0.8);
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

test("Interior parts fit inside the insulated cavity of the exterior model", async () => {
  const { createChaseRenderer } = await import("../dist/chase-vehicle.mjs");
  const { createFlightState } = await import("../dist/flight-model.mjs");
  const chase = createChaseRenderer({ renderer: fakeRenderer() });
  const state = { ...createFlightState(), vehicleModel: "research", heading: 0, pitch: 0, roll: 0 };
  chase.draw(context2d, 800, 600, state);
  const research = chase.models.research;
  const inverse = research.parent.matrixWorld.clone().invert();
  let checked = 0;
  for (const group of Object.values(chase.subsystems)) {
    if (group.userData.layer !== "interior" || group.name === "airflow") continue;
    group.traverse((part) => {
      if (!part.isMesh) return;
      part.geometry.computeBoundingBox();
      const box = part.geometry.boundingBox.clone().applyMatrix4(part.matrixWorld).applyMatrix4(inverse);
      const where = `${group.name} [${box.min.toArray().map(v => v.toFixed(2))} .. ${box.max.toArray().map(v => v.toFixed(2))}]`;
      // Foam is 7.62 cm thick (ICES-2023): cavity x -/+0.36, floor -0.34, top deck +0.085,
      // up to +0.5 under the attic (z -1.82 to -0.72). Trim chimneys sit in the side walls.
      const halfWidth = group.name === "trim-chimneys" ? 0.46 : 0.37;
      const underAttic = box.min.z >= -1.82 && box.max.z <= -0.72;
      assert.ok(box.min.x >= -halfWidth && box.max.x <= halfWidth, `width: ${where}`);
      // The 43 cm chimneys are built into the side walls, which span the body's outer height.
      const [floor, roof] = group.name === "trim-chimneys" ? [-0.41, 0.15] : [-0.345, underAttic ? 0.5 : 0.085];
      assert.ok(box.min.y >= floor && box.max.y <= roof, `height: ${where}`);
      assert.ok(box.min.z >= -1.9 && box.max.z <= 1.3, `length: ${where}`);
      checked += 1;
    });
  }
  assert.ok(checked >= 30, `checked ${checked} interior meshes`);
});

test("Mission-view layers draw and return callouts for every labeled part", async () => {
  const { createChaseRenderer } = await import("../dist/chase-vehicle.mjs");
  const { createFlightState } = await import("../dist/flight-model.mjs");
  const chase = createChaseRenderer({ renderer: fakeRenderer() });
  const state = createFlightState();
  assert.deepEqual(chase.drawMission(context2d, 800, 600, state, { layer: "exterior" }), []);
  for (const layer of ["internal", "thermal"]) {
    const labels = chase.drawMission(context2d, 800, 600, state, { layer });
    assert.ok(labels.length >= 15, `${layer}: ${labels.length} callouts`);
    for (const label of labels) {
      assert.ok(Number.isFinite(label.x) && Number.isFinite(label.y) && label.label && label.source && label.zone);
      assert.ok(label.x > 0 && label.x < 800 && label.y > 0 && label.y < 600, `${label.name} on screen`);
    }
  }
  // Drawing the pilot view afterwards restores the exterior with the interior hidden.
  chase.draw(context2d, 800, 600, state);
  assert.equal(chase.subsystems.battery.visible, false);
});

test("The original model's Internal and Thermal views are labeled mock-ups and fit its body", async () => {
  const { createChaseRenderer } = await import("../dist/chase-vehicle.mjs");
  const { createFlightState } = await import("../dist/flight-model.mjs");
  const chase = createChaseRenderer({ renderer: fakeRenderer() });
  const state = { ...createFlightState(), vehicleModel: "original" };
  for (const layer of ["internal", "thermal"]) {
    const labels = chase.drawMission(context2d, 800, 600, state, { layer });
    assert.ok(labels.length >= 6, `${layer}: ${labels.length} mock callouts`);
    for (const label of labels) {
      assert.equal(label.mock, true);
      assert.match(label.label, /^Mock-up: /);
      assert.match(label.source, /not based on the real Dragonfly design/);
    }
    assert.equal(chase.models.original.visible, true);
    assert.equal(chase.models.research.visible, false);
    assert.equal(chase.subsystems.battery.visible, false, "the research interior stays hidden");
  }
  // Every mock part sits inside the original body (x -/+0.515, y -/+0.16, z -/+1.1) or its front cab.
  state.heading = 0; state.pitch = 0; state.roll = 0;
  chase.draw(context2d, 800, 600, state);
  const inverse = chase.models.original.parent.matrixWorld.clone().invert();
  for (const group of chase.mockParts) {
    group.traverse((part) => {
      if (!part.isMesh) return;
      part.geometry.computeBoundingBox();
      const box = part.geometry.boundingBox.clone().applyMatrix4(part.matrixWorld).applyMatrix4(inverse);
      const inCab = box.min.z >= -1.1 && box.max.z <= -0.45 && box.max.y <= 0.72;
      assert.ok(box.min.x >= -0.5 && box.max.x <= 0.5 && box.min.y >= -0.16 && box.max.y <= (inCab ? 0.72 : 0.16)
        && box.min.z >= -1.1 && box.max.z <= 1.1, `${group.name} fits`);
    });
  }
  assert.equal(chase.mockParts[0].visible, false, "the pilot view hides the mock interior");
});

test("Thermal mesh colors keep absolute temperature meaning when the legend range changes", async () => {
  const { createChaseRenderer } = await import("../dist/chase-vehicle.mjs");
  const { createFlightState } = await import("../dist/flight-model.mjs");
  const { thermalRgb } = await import("../dist/thermal-scale.mjs");
  const renderer = fakeRenderer();
  const chase = createChaseRenderer({ renderer });
  const state = createFlightState();
  let currentGroup, renderedColor;
  const render = renderer.render.bind(renderer);
  renderer.render = (scene, camera) => {
    render(scene, camera);
    currentGroup.traverse(part => { if (part.isMesh) renderedColor = part.material.color.clone(); });
  };
  for (const vehicleModel of ["research", "original"]) {
    state.vehicleModel = vehicleModel;
    currentGroup = vehicleModel === "research" ? chase.subsystems.battery
      : chase.mockParts.find(part => part.userData.thermalZone === "battery");
    for (const batteryC of [-30, 10, 35]) {
      state.batteryC = batteryC;
      const rgb = thermalRgb(batteryC);
      const expected = new THREE.Color().setRGB(...rgb.map(v => v / 255), THREE.SRGBColorSpace);
      for (const thermalRange of ["full", "inside"]) {
        state.thermalRange = thermalRange;
        chase.drawMission(context2d, 800, 600, state, { layer: "thermal" });
        assert.ok(renderedColor.equals(expected), `${vehicleModel}: ${batteryC} C / ${thermalRange}`);
      }
    }
  }
});

test("The terrain recenters a few rows per frame, and at once after a jump", async () => {
  const { createTitanTerrain } = await import("../dist/titan-terrain.mjs");
  const landscape = createTitanTerrain(new THREE.Scene(), fakeRenderer());
  const ground = landscape.group.getObjectByName("titan-ground").geometry.attributes.position;
  const center = 120 * 241 + 120;
  const anchor = () => [ground.getX(center), ground.getZ(center)];
  assert.deepEqual(anchor(), [0, 0]);
  // Flying across the edge of the 400 m square: the old mesh stays until the new one is ready.
  let frames = 0;
  while (anchor()[0] === 0 && frames < 100) { landscape.update(210, 0); frames++; }
  assert.deepEqual(anchor(), [400, 0]);
  assert.ok(frames > 10 && frames <= 31, `swapped after ${frames} frames`);
  // A jump (restored mission far away) rebuilds immediately.
  landscape.update(1700, -700);
  assert.deepEqual(anchor(), [1600, -800]);
});

test("On a sloping dune flank the lander settles onto all four skid ends", async () => {
  const { createChaseRenderer } = await import("../dist/chase-vehicle.mjs");
  const { createFlightState } = await import("../dist/flight-model.mjs");
  const { terrainHeight } = await import("../dist/titan-terrain.mjs");
  const chase = createChaseRenderer({ renderer: fakeRenderer() });
  for (const [vehicleModel, foot] of [["research", [0.75, -1.3, 1.02]], ["original", [0.77, -1.07, 1.17]]]) {
    for (const heading of [0, 30, 90, 200]) {
      // About 11 degrees of slope, about 1.4 km south of the base.
      const state = { ...createFlightState(), vehicleModel, positionX: 300, positionZ: 1400, altitude: 0, heading, pitch: 0, roll: 0 };
      chase.draw(context2d, 800, 600, state);
      const craft = chase.models.research.parent;
      craft.updateMatrixWorld(true);
      const [halfWidth, front, rear] = foot;
      for (const [lx, lz] of [[-halfWidth, front], [halfWidth, front], [-halfWidth, rear], [halfWidth, rear]]) {
        const end = new THREE.Vector3(lx, -0.86, lz).applyMatrix4(craft.matrixWorld);
        const gap = end.y - terrainHeight(end.x, end.z);
        assert.ok(Math.abs(gap) < 0.12, `${vehicleModel} heading ${heading}: skid end ${gap.toFixed(2)} m off the ground`);
      }
      const tilt = new THREE.Vector3(0, 1, 0).applyQuaternion(craft.quaternion).angleTo(new THREE.Vector3(0, 1, 0));
      assert.ok(tilt > 8 * Math.PI / 180, `${vehicleModel} tilts with the slope`);
    }
  }
});

test("Rotor-wash dust appears when hovering low and clears when high", async () => {
  const { createChaseRenderer } = await import("../dist/chase-vehicle.mjs");
  const { createFlightState } = await import("../dist/flight-model.mjs");
  const chase = createChaseRenderer({ renderer: fakeRenderer() });
  const state = { ...createFlightState(), vehicleModel: "research", positionX: 0, positionZ: 0, altitude: 1.5, heading: 0, rotorRpm: Array(8).fill(780), missionTime: 0 };
  for (let frame = 0; frame < 40; frame++) { state.missionTime += 0.05; chase.draw(context2d, 800, 600, state); }
  assert.ok(chase.downwashDust.activeCount() > 20, `${chase.downwashDust.activeCount()} dust puffs`);
  state.altitude = 40;
  for (let frame = 0; frame < 120; frame++) { state.missionTime += 0.05; chase.draw(context2d, 800, 600, state); }
  assert.equal(chase.downwashDust.activeCount(), 0);
});

test("Dust expires across Mission-view gaps, freezes on pause and clears on a clock reset", async () => {
  const { createDownwashDust } = await import("../dist/downwash-dust.mjs");
  const { createFlightState } = await import("../dist/flight-model.mjs");
  const dust = createDownwashDust(new THREE.Group(), () => 0);
  const state = { ...createFlightState(), altitude: 1.5, rotorRpm: Array(8).fill(780), missionTime: 0 };
  const origin = new THREE.Vector3(0, 2, 0), eye = new THREE.Vector3(0, 4, 10);
  const update = dt => { state.missionTime += dt; dust.update(state, origin, eye); };
  update(0);
  for (let frame = 0; frame < 40; frame++) update(0.05);
  const before = dust.activeCount();
  assert.ok(before > 20);
  const positions = dust.group.children.map(sprite => sprite.position.toArray());
  update(0);
  assert.equal(dust.activeCount(), before, "paused simulation retains dust");
  assert.deepEqual(dust.group.children.map(sprite => sprite.position.toArray()), positions);
  state.rotorRpm.fill(0);
  update(100);
  assert.equal(dust.activeCount(), 0, "old dust expires while Pilot is not rendering");
  assert.ok(dust.group.children.every(sprite => !sprite.visible));
  state.rotorRpm.fill(780);
  for (let frame = 0; frame < 40; frame++) update(0.05);
  assert.ok(dust.activeCount() > 20);
  update(100);
  assert.ok(dust.activeCount() > 0 && dust.activeCount() <= 4, "only a recent frame of fresh dust is emitted");
  state.missionTime = 0;
  update(0);
  assert.equal(dust.activeCount(), 0, "new mission cannot inherit old dust");
});

test("The Internal layer returns the published envelope dimensions for the blueprint", async () => {
  const { createChaseRenderer } = await import("../dist/chase-vehicle.mjs");
  const { createFlightState } = await import("../dist/flight-model.mjs");
  const chase = createChaseRenderer({ renderer: fakeRenderer() });
  const state = { ...createFlightState(), vehicleModel: "research" };
  const labels = chase.drawMission(context2d, 800, 600, state, { layer: "internal" });
  assert.deepEqual(labels.dimensions.map(d => d.text), ["3.85 m", "1.75 m", "3.85 m"]);
  for (const { a, b, extensions } of labels.dimensions) {
    for (const p of [a, b, ...extensions.flat()]) assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
    assert.ok(Math.hypot(b.x - a.x, b.y - a.y) > 40, "visible length on screen");
  }
  const original = chase.drawMission(context2d, 800, 600, { ...state, vehicleModel: "original" }, { layer: "internal" });
  assert.equal(original.dimensions, undefined, "the mock-up model has no published dimensions");
});

test("The air loop follows the fan and the trim flaps", async () => {
  const { createChaseRenderer } = await import("../dist/chase-vehicle.mjs");
  const { createFlightState } = await import("../dist/flight-model.mjs");
  const chase = createChaseRenderer({ renderer: fakeRenderer() });
  const research = chase.models.research;
  const coldArrows = research.getObjectByName("cold-duct-arrows"), warmArrows = research.getObjectByName("warm-loop-arrows");
  const flap = research.getObjectByName("trim-flap-starboard");
  const state = { ...createFlightState(), vehicleModel: "research", gasFlow: 0.052, effectiveTrim: 0, missionTime: 0 };
  chase.drawMission(context2d, 800, 600, state, { layer: "internal" });
  assert.equal(coldArrows.count, 0, "flaps closed: no cold-duct flow");
  assert.equal(flap.rotation.z, 0);
  Object.assign(state, { effectiveTrim: 0.4, missionTime: 1 });
  chase.drawMission(context2d, 800, 600, state, { layer: "internal" });
  assert.equal(coldArrows.count, 20, "fully open: ten arrows through each side");
  assert.ok(Math.abs(flap.rotation.z - 24 * Math.PI / 180) < 1e-9, "flap opens about 24 degrees");
  Object.assign(state, { gasFlow: 0, missionTime: 2 });
  chase.drawMission(context2d, 800, 600, state, { layer: "internal" });
  assert.equal(warmArrows.visible, false, "fan stopped: no loop");
  assert.equal(coldArrows.count, 0);
});
