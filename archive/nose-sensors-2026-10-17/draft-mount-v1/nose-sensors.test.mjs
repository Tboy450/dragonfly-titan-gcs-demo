import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildNoseSensors, noseSensorsAsset as A } from "../dist/nose-sensors.mjs";
import { buildNoseCameras } from "../dist/nose-cameras.mjs";
import { buildSideCameras } from "../dist/side-cameras.mjs";
import { buildDrill } from "../dist/drills.mjs";
import { buildSampleLines, buildBlowers } from "../dist/draco-plumbing.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildRotorDriveElectronics } from "../dist/rotor-drive-electronics.mjs";
import { buildPowerUnits } from "../dist/power-units.mjs";
import { buildIem } from "../dist/iem.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildTwta } from "../dist/twta.mjs";
import { buildHgaGimbal } from "../dist/hga-gimbal.mjs";
import { buildBattery } from "../dist/battery.mjs";
import { buildAftBulkhead } from "../dist/aft-bulkhead.mjs";
import { buildFans, buildWarmDuct, buildTrimDevice } from "../dist/thermal-loop.mjs";

function mesh(geometry, material, position, parent) {
  const object = new THREE.Mesh(geometry, material); object.position.fromArray(position); parent.add(object); return object;
}
function fixture() { const parent = new THREE.Group(), result = buildNoseSensors({ parent, mesh }); parent.updateMatrixWorld(true); return { parent, ...result }; }
const pieces = group => {
  const out = []; group.updateMatrixWorld(true);
  group.traverse(o => {
    if (!o.isMesh) return;
    const path = o.geometry.parameters?.path;
    if (path) for (let n = 0; n <= 160; n++) out.push([o.name, new THREE.Box3().setFromCenterAndSize(
      path.getPoint(n / 160).applyMatrix4(o.matrixWorld), new THREE.Vector3().setScalar(o.geometry.parameters.radius * 2))]);
    else out.push([o.name, new THREE.Box3().setFromObject(o)]);
  }); return out;
};

test("Two fixed EFIELD probes use published 30 cm stalks and 5 cm electrodes, with distinct front/rear locations", () => {
  const { parent, probes } = fixture();
  assert.equal(parent.userData.assetRevision, A.revision);
  assert.equal(probes.length, 2);
  assert.equal(parent.userData.partialRebuild, true, "METHAN is not claimed complete");
  for (const p of probes) {
    assert.equal(p.tube.geometry.parameters.height, 0.30);
    assert.equal(p.ball.geometry.parameters.radius * 2, 0.05);
    const axis = new THREE.Vector3(0, 0, 1).applyQuaternion(p.stalkFrame.quaternion);
    assert.ok(p.group.getObjectByName(`${p.group.name}-atmosphere-temperature-probe`));
    assert.ok(p.group.getObjectByName(`${p.group.name}-microphone-housing`));
    if (p.group.name === "efield-front") assert.ok(p.stalkFrame.position.x > 0 && p.stalkFrame.position.y > 0 && axis.z < 0);
    else assert.ok(p.stalkFrame.position.x < 0 && p.stalkFrame.position.y < 0 && axis.z > 0);
    const ballPosition = new THREE.Vector3(); p.ball.getWorldPosition(ballPosition);
    assert.ok(ballPosition.y > -0.6 && Math.abs(ballPosition.x) < 0.85 && Math.abs(ballPosition.z) < 1.95, "inside vehicle footprint, above skids");
  }
});

test("Covers, mounts, interfaces and harnesses are removable without moving the installed assembly", () => {
  const { probes, methan } = fixture();
  for (const p of probes) {
    const pose = p.group.matrixWorld.clone(), ballPose = p.ball.matrixWorld.clone();
    assert.deepEqual([p.casings, p.covers, p.mounts, p.interfaces, p.harness].map(g => g.userData.inspectionLayer),
      ["equipment-casings", "equipment-covers", "mounts", "interfaces", "harnesses"]);
    p.covers.visible = false; p.harness.visible = false; p.mounts.visible = false;
    p.group.updateMatrixWorld(true);
    assert.ok(p.group.matrixWorld.equals(pose) && p.ball.matrixWorld.equals(ballPose));
  }
  assert.equal(methan.userData.provisional, true);
  const housing = methan.getObjectByName("methan-unverified-housing");
  assert.deepEqual(housing.position.toArray(), [0.455, -0.12, -1.66], "existing METHAN placeholder retained");
});

test("The new EFIELD assemblies clear every already rebuilt part", () => {
  const { probes } = fixture();
  const buildDrills = kit => { for (const side of [-1, 1]) buildDrill({ ...kit, side }); };
  const builders = [buildNoseCameras, buildSideCameras, buildDrills, buildSampleLines, buildBlowers,
    buildSampleCarousel, buildWonderwall, buildDramsAssembly, buildRotorDriveElectronics, buildPowerUnits,
    buildIem, buildFrontierRadio, buildTwta, buildHgaGimbal, buildBattery, buildAftBulkhead, buildFans, buildWarmDuct, buildTrimDevice];
  for (const build of builders) {
    const other = new THREE.Group(); build({ parent: other, mesh });
    const boxes = pieces(other);
    for (const p of probes) for (const [name, box] of pieces(p.group)) {
      const hit = boxes.find(([, b]) => box.intersectsBox(b));
      assert.ok(!hit, `${p.group.name}/${name} intersects ${build.name}/${hit?.[0]}`);
    }
  }
});
