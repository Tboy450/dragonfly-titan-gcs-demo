import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildSideCameras, sideCamerasAsset } from "../dist/side-cameras.mjs";
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
function fixture() { const parent = new THREE.Group(); const r = buildSideCameras({ parent, mesh }); parent.updateMatrixWorld(true); return { parent, ...r }; }
const named = (cameras, name) => cameras.find(c => c.group.name === name);
const axis = group => new THREE.Vector3(0, 0, 1).applyQuaternion(group.quaternion);

test("Microscopic Camera keeps the published geometry: 986 mm from the port drill site at 52 degrees", () => {
  const { cameras, parent } = fixture();
  assert.equal(parent.userData.assetRevision, sideCamerasAsset.revision);
  const mi = named(cameras, "microscopic-camera");
  const site = new THREE.Vector3(...sideCamerasAsset.drillSite);
  const toSite = site.clone().sub(mi.group.position);
  assert.ok(Math.abs(toSite.length() - 0.986) < 0.001, `distance ${toSite.length().toFixed(4)}`);
  const fromVertical = THREE.MathUtils.radToDeg(Math.acos(-toSite.y / toSite.length()));
  assert.ok(Math.abs(fromVertical - 52) < 0.5, `${fromVertical.toFixed(2)} deg from the surface normal`);
  assert.ok(axis(mi.group).angleTo(toSite) < 1e-6, "lens aimed at the drill site");
  assert.ok(mi.group.position.x < 0 && mi.group.position.z > site.z, "port side, aft of the drill");
  const { housing, lensLength } = ecamSizes.microscope;
  assert.ok(Math.abs(housing[2] + lensLength - 0.155) < 0.002, "155 mm long as published");
  assert.ok(housing[0] <= 0.105 && housing[1] <= 0.09, "inside the published 105 x 90 mm section");
  const led = named(cameras, "led-array");
  assert.ok(axis(led.group).angleTo(site.clone().sub(led.group.position)) < 1e-6, "LED array co-aligned with the camera");
  assert.ok(led.casing.getObjectByName("led-uv-365nm"), "UV emitter for fluorescence");
});

test("Down Cameras look straight down; every camera has a 3 mm window at the foam surface and separate layers", () => {
  const { cameras } = fixture();
  for (const name of ["port-down-camera", "starboard-down-camera"]) {
    const cam = named(cameras, name);
    assert.ok(axis(cam.group).angleTo(new THREE.Vector3(0, -1, 0)) < 1e-6, `${name} looks down`);
    const w = new THREE.Vector3(); cam.window.getObjectByName("camera-window").getWorldPosition(w);
    assert.ok(w.y < -0.355 && w.y > -0.362, `${name} window in the bottom surface (${w.y.toFixed(3)})`);
  }
  for (const cam of cameras) {
    const pane = cam.window.getObjectByName("camera-window");
    assert.ok(Math.abs(pane.geometry.parameters.height - 0.003) < 1e-9, "3 mm window");
    const w = new THREE.Vector3(); pane.getWorldPosition(w);
    const onBottom = Math.abs(w.y + 0.36) < 0.006, onSide = Math.abs(Math.abs(w.x) - 0.43) < 0.006;
    assert.ok(onBottom || onSide, `${cam.group.name} window at the outer foam (${w.toArray().map(v => v.toFixed(3))})`);
    assert.deepEqual([cam.casing, cam.mounts, cam.connectors, cam.harness, cam.window, cam.cavity].map(g => g.userData.inspectionLayer),
      ["equipment-casings", "mounts", "interfaces", "harnesses", "equipment-covers", "insulation"]);
    const pose = cam.group.matrixWorld.clone();
    cam.window.visible = false; cam.cavity.visible = false; cam.harness.visible = false;
    cam.group.updateMatrixWorld(true);
    assert.ok(cam.group.matrixWorld.equals(pose));
  }
});

test("Lower cameras clear every rebuilt part", () => {
  const { cameras } = fixture();
  const others = [buildSampleCarousel, buildWonderwall, buildDramsAssembly, buildFrontierRadio, buildIem, buildPowerUnits].map(build => {
    const g = new THREE.Group(); build({ parent: g, mesh }); g.updateMatrixWorld(true);
    const boxes = [];
    g.traverse(o => { if (o.isMesh) boxes.push(new THREE.Box3().setFromObject(o)); });
    return [build.name, boxes];
  });
  for (const cam of cameras) {
    const parts = [];
    cam.group.traverse(o => { if (o.isMesh) parts.push(new THREE.Box3().setFromObject(o)); });
    for (const [name, boxes] of others) {
      for (const p of parts) assert.ok(!boxes.some(b => b.intersectsBox(p)), `${cam.group.name} clears ${name}`);
    }
  }
});
