import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildNoseCameras, noseCamerasAsset } from "../dist/nose-cameras.mjs";
import { buildSideCameras } from "../dist/side-cameras.mjs";
import { ecamSizes } from "../dist/ecam.mjs";
import { buildPowerUnits } from "../dist/power-units.mjs";
import { buildIem } from "../dist/iem.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
function fixture() { const parent = new THREE.Group(); const r = buildNoseCameras({ parent, mesh }); parent.updateMatrixWorld(true); return { parent, ...r }; }
const axis = group => new THREE.Vector3(0, 0, 1).applyQuaternion(group.quaternion);
const byName = (cameras, name) => cameras.find(c => c.group.name === name);
const has = (group, name) => { let found = false; group.traverse(o => { if (o.name === name) found = true; }); return found; };

test("Six nose cameras of the published types; with the lower three, nine cameras in all", () => {
  const { cameras, parent } = fixture();
  assert.equal(parent.userData.assetRevision, noseCamerasAsset.revision);
  assert.equal(cameras.length, 6);
  const lower = new THREE.Group(); const { cameras: low } = buildSideCameras({ parent: lower, mesh });
  assert.equal(cameras.length + low.filter(c => c.size).length, 9, "nine cameras on Dragonfly (DragonCam paper)");
  const kinds = noseCamerasAsset.cameras.map(c => c.kind).sort();
  assert.deepEqual(kinds, ["medium", "navcam", "navcam", "wide", "wide", "wide"], "MAC, WAC, two Side, two NavCams");
  for (const k of ["medium", "navcam"]) assert.deepEqual(ecamSizes[k].housing, ecamSizes.wide.housing, "same camera body");
  for (const c of cameras) {
    assert.equal(has(c.casing, "ecam-lens-hood"), c.group.name === "forward-mac", `${c.group.name} hood only on the Forward MAC`);
    assert.equal(has(c.mounts, "navcam-top-plate"), c.group.name.startsWith("navcam"), `${c.group.name} yellow plate only on NavCams`);
  }
});

test("Nose cameras point the right way, sit in front of the camera panel and look through 3 mm windows", () => {
  const { cameras, panel } = fixture();
  const want = {
    "forward-mac": v => v.z < -0.99,
    "port-side-camera": v => v.x < -0.9,
    "starboard-side-camera": v => v.x > 0.9,
    "forward-wac": v => v.z < -0.6 && v.y < -0.6,
    "navcam-a": v => v.y < -0.99,
    "navcam-b": v => v.y < -0.99,
  };
  for (const c of cameras) {
    assert.ok(want[c.group.name](axis(c.group)), `${c.group.name} points as drawn in the figures`);
    // Bodies, mounts and windows sit in front of the panel; cables may pass through it.
    const box = new THREE.Box3();
    for (const g of [c.casing, c.mounts, c.window]) box.union(new THREE.Box3().setFromObject(g));
    assert.ok(box.max.z <= noseCamerasAsset.panelZ + 0.001 && box.min.z > -1.95, `${c.group.name} between the nose tip and the panel`);
    const pane = c.window.getObjectByName("camera-window");
    assert.ok(Math.abs(pane.geometry.parameters.height - 0.003) < 1e-9);
    const pose = c.group.matrixWorld.clone();
    c.window.visible = false; c.harness.visible = false; c.group.updateMatrixWorld(true);
    assert.ok(c.group.matrixWorld.equals(pose));
  }
  assert.equal(panel.userData.inspectionLayer, "mounts");
});

test("Nose cameras clear each other and every rebuilt part", () => {
  const { cameras } = fixture();
  const meshes = c => { const out = []; c.group.traverse(o => { if (o.isMesh) out.push(new THREE.Box3().setFromObject(o)); }); return out; };
  for (let i = 0; i < cameras.length; i += 1) for (let j = i + 1; j < cameras.length; j += 1) {
    const a = meshes(cameras[i]), b = meshes(cameras[j]);
    assert.ok(!a.some(x => b.some(y => x.intersectsBox(y))), `${cameras[i].group.name} clears ${cameras[j].group.name}`);
  }
  const others = [buildSampleCarousel, buildWonderwall, buildDramsAssembly, buildFrontierRadio, buildIem, buildPowerUnits, buildSideCameras].map(build => {
    const g = new THREE.Group(); build({ parent: g, mesh }); g.updateMatrixWorld(true);
    return [build.name, new THREE.Box3().setFromObject(g)];
  });
  for (const c of cameras) {
    const box = new THREE.Box3().setFromObject(c.group);
    for (const [name, other] of others) assert.equal(box.intersectsBox(other), false, `${c.group.name} clears ${name}`);
  }
});
