import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildRotorDriveElectronics, rdeAsset } from "../dist/rotor-drive-electronics.mjs";
import { buildBattery } from "../dist/battery.mjs";
import { buildTwta } from "../dist/twta.mjs";
import { buildHgaGimbal } from "../dist/hga-gimbal.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildIem } from "../dist/iem.mjs";
import { buildPowerUnits } from "../dist/power-units.mjs";
import { buildSideCameras } from "../dist/side-cameras.mjs";
import { buildNoseCameras } from "../dist/nose-cameras.mjs";
import { buildDrill } from "../dist/drills.mjs";
import { buildSampleLines, buildBlowers } from "../dist/draco-plumbing.mjs";
import { buildFans, buildWarmDuct, buildTrimDevice } from "../dist/thermal-loop.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
function build(builder = buildRotorDriveElectronics) {
  const parent = new THREE.Group(), parts = builder({ parent, mesh });
  parent.updateMatrixWorld(true); return { parent, parts };
}
function boxes(group) {
  const out = []; group.updateMatrixWorld(true);
  group.traverse(o => {
    if (!o.isMesh) return;
    const path = o.geometry.parameters?.path;
    if (path) for (let i = 0; i <= 200; i++) out.push([o.name, new THREE.Box3().setFromCenterAndSize(
      path.getPoint(i / 200).applyMatrix4(o.matrixWorld), new THREE.Vector3(1, 1, 1).multiplyScalar(2 * o.geometry.parameters.radius))]);
    else out.push([o.name, new THREE.Box3().setFromObject(o)]);
  });
  return out;
}

test("RDE keeps two explicitly provisional enclosures and stable layer groups", () => {
  const { parent, parts } = build();
  assert.equal(rdeAsset.unitCount, 2);
  assert.equal(parent.userData.dimensionConfidence, "EST");
  assert.equal(parent.userData.assetRevision, rdeAsset.revision);
  for (const n of [1, 2]) assert.ok(parent.getObjectByName(`rde-${n}-lid`));
  const before = parts.assembly.matrixWorld.clone();
  parts.covers.visible = false;
  parent.updateMatrixWorld(true);
  assert.ok(parts.assembly.matrixWorld.equals(before));
  assert.equal(parts.casings.visible, true);
  assert.equal(parts.covers.userData.inspectionLayer, "equipment-covers");
  assert.equal(parts.mounts.userData.inspectionLayer, "mounts");
  assert.equal(parts.casings.userData.inspectionLayer, "equipment-casings");
  assert.equal(parts.connectors.userData.inspectionLayer, "interfaces");
});

test("RDE mounts rest on the bay floor and stay under the gimbal/deck", () => {
  const { parent } = build(), b = new THREE.Box3().setFromObject(parent);
  assert.ok(Math.abs(b.min.y - rdeAsset.floorY) < 1e-6);
  assert.ok(b.max.y < -0.067 && b.min.x > -0.30 && b.max.x < 0.30);
  assert.ok(b.min.z > -0.70 && b.max.z < -0.40);
});

test("RDE vents are open geometry with internal fans, not opaque painted circles", () => {
  const { parent } = build();
  const panel = parent.getObjectByName("rde-1-vent-panel");
  const [x, z] = rdeAsset.centers[0];
  const cy = (rdeAsset.bottomY + rdeAsset.topY) / 2;
  const ray = new THREE.Raycaster(new THREE.Vector3(x - 0.061, cy, z - 0.2), new THREE.Vector3(0, 0, 1));
  assert.equal(ray.intersectObject(panel).length, 0, "panel has a bore");
  ray.ray.origin.x = x;
  assert.ok(ray.intersectObject(panel).length > 0, "center strip is solid");
  assert.ok(parent.getObjectByName("rde-1-fan-hub"));
  assert.ok(parent.getObjectByName("rde-2-connector-blank"));
});

test("RDE clears rebuilt neighbors including the untouched in-progress battery", () => {
  const mine = boxes(build().parent);
  const builders = [buildBattery, buildTwta, buildHgaGimbal, buildFrontierRadio, buildIem,
    buildPowerUnits, buildSideCameras, buildNoseCameras, buildSampleCarousel, buildDramsAssembly,
    buildWonderwall, buildFans, buildWarmDuct, buildTrimDevice, buildBlowers, buildSampleLines];
  const others = builders.map(b => [b.name, boxes(build(b).parent)]);
  const drills = new THREE.Group();
  for (const side of [-1, 1]) buildDrill({ parent: drills, mesh, side });
  others.push(["drills", boxes(drills)]);
  for (const [name, other] of others) for (const [mn, mb] of mine) {
    const hit = other.find(([, b]) => b.intersectsBox(mb));
    assert.ok(!hit, `${mn} intersects ${name}: ${hit?.[0]}`);
  }
});
