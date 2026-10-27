// Zone rings show through hills, trees and houses (FIX-06): each ring has a faint copy drawn on
// top that follows the ring's color, progress and visibility. The real scene, without a GPU
// (the same stand-ins as invasion-scene-smoke.test.mjs).
import test from "node:test";
import assert from "node:assert/strict";
import { createBattle } from "../dist/invasion/battle.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { createPlanetTerrain } from "../dist/invasion/planet-terrain.mjs";

const context2d = new Proxy({}, {
  get: (target, key) => key in target ? target[key] : ["createLinearGradient", "createRadialGradient"].includes(key)
    ? () => ({ addColorStop() {} }) : () => {},
  set: (target, key, value) => { target[key] = value; return true; },
});
const element = () => ({ style: {}, width: 0, height: 0, getContext: () => context2d, addEventListener() {}, setAttribute() {} });
globalThis.document = { createElement: element, createElementNS: element };
globalThis.window = { devicePixelRatio: 1 };
const renderer = () => ({
  capabilities: { getMaxAnisotropy: () => 1 }, setClearColor() {}, setPixelRatio() {}, setSize() {},
  render(scene, camera) { scene.updateMatrixWorld(true); camera.updateMatrixWorld(true); },
});

test("Every zone ring has a faint copy drawn over the ground that follows it", async () => {
  const { createInvasionScene } = await import("../dist/invasion/scene.mjs");
  const view = createInvasionScene(element(), { renderer: renderer() });
  view.resize(800, 600);
  // Ashfall: Katan Citadel's ring runs over a steep hillside.
  const planet = planetById("ashfall"), terrain = createPlanetTerrain(planet);
  const b = createBattle(planet, { terrain, matter: 500 });
  view.load(planet, terrain, b);
  const cam = { focus: { x: b.zones[0].x, z: b.zones[0].z }, distance: 230, yaw: 0.6, pitch: 0.9 };
  view.frame(b, cam, [], 0.05, b.time);
  for (const zone of b.zones) {
    const group = view.scene.getObjectByName(`zone-${zone.id}`);
    const rings = group.children.filter(part => part.material?.uniforms?.progress);
    assert.equal(rings.length, 2, zone.name);
    for (const ring of rings) {
      const ghost = ring.children.find(part => part.name === "ring-ghost");
      assert.ok(ghost, `${zone.name} ring has a copy`);
      assert.equal(ghost.geometry, ring.geometry, "same shape");
      assert.equal(ghost.material.depthTest, false, "drawn over hills and houses");
      assert.equal(ring.material.depthTest, true, "the ring itself still sits in the ground");
      assert.ok(ghost.material.uniforms.fade.value < 0.5 && ring.material.uniforms.fade.value === 1, "faint");
      for (const key of ["color", "progress", "opacity"]) assert.equal(ghost.material.uniforms[key], ring.material.uniforms[key], key);
    }
  }
  // Capture progress and color reach the copy, and a hidden progress ring hides its copy too.
  const zone = b.zones.find(z => z.kind !== "beachhead"), [base, control] = view.scene.getObjectByName(`zone-${zone.id}`).children.filter(part => part.material?.uniforms?.progress);
  zone.control = 40;
  view.frame(b, cam, [], 0.05, b.time);
  assert.equal(control.children[0].material.uniforms.progress.value, 0.4);
  assert.equal(control.visible, true);
  zone.captured = true; zone.control = 100;
  view.frame(b, cam, [], 0.05, b.time);
  assert.equal(control.visible, false, "the copy is the ring's child, so it hides with it");
  assert.equal(base.children[0].material.uniforms.color.value.getHexString(), base.material.uniforms.color.value.getHexString());
  // Unloading disposes each shape once (the copy leaves it to the ring) and each material.
  let shapes = 0;
  for (const ring of [base, control]) ring.geometry.addEventListener("dispose", () => { shapes += 1; });
  view.unload();
  assert.equal(shapes, 2);
});
