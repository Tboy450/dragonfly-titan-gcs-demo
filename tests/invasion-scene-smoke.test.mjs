import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, requestDrop, stepBattle } from "../dist/invasion/battle.mjs";
import { planets, frontiers } from "../dist/invasion/campaign.mjs";
import { createPlanetTerrain } from "../dist/invasion/planet-terrain.mjs";
import { droneModels, structureModels, figureModel, interceptorModel, buildingModels } from "../dist/invasion/models.mjs";

// TEST-01: the real Three.js battle scene on every campaign planet and frontier map, without a
// browser or GPU (the same stand-ins as invasion-render.test.mjs). It checks that each world
// builds, plays frames with drops, combat, explosions, strikes and weather, draws from the free
// camera, and releases everything on unload. It does not certify appearance or speed.
const context2d = new Proxy({}, {
  get: (target, key) => key in target ? target[key] : ["createLinearGradient", "createRadialGradient"].includes(key)
    ? () => ({ addColorStop() {} }) : () => {},
  set: (target, key, value) => { target[key] = value; return true; },
});
const element = () => ({ style: {}, width: 0, height: 0, getContext: () => context2d, addEventListener() {}, setAttribute() {} });
globalThis.document = { createElement: element, createElementNS: element };
globalThis.window = { devicePixelRatio: 1 };
const renderer = () => ({
  frames: 0, capabilities: { getMaxAnisotropy: () => 1 }, setClearColor() {}, setPixelRatio() {}, setSize() {},
  render(scene, camera) { scene.updateMatrixWorld(true); camera.updateMatrixWorld(true); this.frames++; },
});

test("Every game model builds finite geometry", () => {
  const finite = (geometry, name) => assert.ok([...geometry.attributes.position.array].every(Number.isFinite), name);
  for (const [type, model] of Object.entries(droneModels())) { finite(model.body, type); finite(model.glow, type); assert.ok(model.rotors.length > 0); }
  for (const [type, model] of Object.entries(structureModels())) { finite(model.body, type); finite(model.glow, type); }
  finite(figureModel(), "figure"); finite(interceptorModel(), "interceptor");
  for (const [type, geometry] of Object.entries(buildingModels())) finite(geometry, type);
});

test("Every campaign planet and frontier map builds, plays, draws from both cameras and unloads cleanly", async () => {
  const { createInvasionScene } = await import("../dist/invasion/scene.mjs");
  const engine = renderer(), view = createInvasionScene(element(), { renderer: engine });
  view.resize(800, 600);
  const baseline = view.scene.children.length;
  for (const planet of [...planets, ...frontiers]) {
    const terrain = createPlanetTerrain(planet);
    const b = createBattle(planet, { terrain, matter: 3000, unlocks: ["scout", "link", "striker", "breacher"], podSlots: 24 });
    view.load(planet, terrain, b);
    const home = b.zones.find(z => z.kind === "beachhead");
    assert.ok(requestDrop(b, { x: home.x, z: home.z, payload: { scout: 4, striker: 2 } }).ok, planet.id);
    const cam = { focus: { x: home.x, z: home.z }, distance: 230, yaw: 0.6, pitch: 0.9 };
    const frames = engine.frames;
    for (let step = 0; step < 300; step += 1) {
      stepBattle(b, 0.05);
      if (step % 5) continue;
      const events = b.events.splice(0);
      if (step === 250) events.push({ kind: "destroyed", id: -1, side: "native", type: "flak", structure: true, x: home.x, z: home.z, alt: 0 },
        { kind: "strike", source: "artillery", x: home.x, z: home.z, radius: 20 });
      view.frame(b, cam, events, 0.25, b.time);
    }
    // Reveal a frontier city, then look from the free camera low over the ground.
    for (const zone of b.zones) if (zone.scouted === false) zone.scouted = true;
    view.frame(b, { ...cam, free: { x: home.x + 40, y: terrain.heightAt(home.x + 40, home.z) + 12, z: home.z, yaw: 1.2, pitch: -0.2 } }, [], 0.05, b.time);
    assert.equal(engine.frames - frames, 61, `${planet.id} drew every frame`);
    const p = view.project(home.x, terrain.heightAt(home.x, home.z), home.z, 800, 600);
    assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y), `${planet.id} projects points`);
    view.unload();
    // Titan's landscape is built once and kept hidden for the next Titan mission, by design.
    const kept = view.scene.children.filter(child => child.name !== "titan-landscape");
    assert.equal(kept.length, baseline, `${planet.id} leaves nothing behind`);
    assert.ok(view.scene.children.every(child => child.name !== "titan-landscape" || !child.visible), "Titan's kept landscape is hidden");
  }
});
