import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildNoseSensors, noseSensorsAsset as A } from "../dist/nose-sensors.mjs";
import { createFlightState } from "../dist/flight-model.mjs";
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
import { createInspector, focusInspector, inspectionSubassemblies, inspectionSubassembly,
  selectInspectionSubassembly, resetInspector } from "../dist/vehicle-inspector.mjs";

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
  assert.equal(parent.userData.partialRebuild, false, "initial asset pass includes the approved METHAN estimate");
  assert.match(parent.userData.appearanceEvidence, /METHAN.*not photo-matched/);
  assert.deepEqual(parent.userData.labelAnchor.toArray(), A.probes[0].mount, "label stays on the front preamp");
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

test("Front and rear probes can be focused separately without changing geometry or the part ID", () => {
  const { parent, probes } = fixture(); parent.name = "nose-sensors";
  const s = { ...createFlightState(), inspector: createInspector() };
  const pose = probes.map(p => p.group.matrixWorld.clone());
  assert.deepEqual(inspectionSubassemblies(parent).map(p => p.name), ["efield-front", "efield-rear", "methan"]);
  focusInspector(s, parent.name);
  for (const p of probes) {
    selectInspectionSubassembly(s, parent, p.group.name);
    assert.equal(inspectionSubassembly(parent, s.inspector), p.group);
    assert.equal(s.inspector.focusPart, "nose-sensors");
    assert.equal(s.inspector.zoom, 1);
  }
  selectInspectionSubassembly(s, parent, "not-a-part");
  assert.equal(s.inspector.subassembly, "efield-rear", "invalid selection does not change focus");
  selectInspectionSubassembly(s, parent, "");
  assert.equal(inspectionSubassembly(parent, s.inspector), null);
  probes.forEach((p, i) => assert.ok(p.group.matrixWorld.equals(pose[i])));
  selectInspectionSubassembly(s, parent, "efield-front");
  focusInspector(s, "battery");
  assert.equal(s.inspector.subassembly, null);
  resetInspector(s.inspector); assert.equal(s.inspector.subassembly, null);
});

test("All part-22 envelopes stay outside the swept rotor volumes", () => {
  const { probes, methan } = fixture();
  for (const group of [...probes.map(p => p.group), methan]) for (const [name, box] of pieces(group)) {
    for (const x of [-1.25, 1.25]) for (const z of [-0.98, 0.98]) for (const y of [-0.16, 0.20]) {
      if (box.max.y < y - 0.01 || box.min.y > y + 0.01) continue;
      const dx = Math.max(box.min.x - x, x - box.max.x, 0);
      const dz = Math.max(box.min.z - z, z - box.max.z, 0);
      assert.ok(Math.hypot(dx, dz) > 1.35 / 2, `${name} enters a rotor swept volume`);
    }
  }
});

test("Covers, mounts, interfaces and harnesses are removable without moving the installed assembly", () => {
  const { probes } = fixture();
  for (const p of probes) {
    const pose = p.group.matrixWorld.clone(), ballPose = p.ball.matrixWorld.clone();
    assert.deepEqual([p.casings, p.covers, p.mounts, p.interfaces, p.harness].map(g => g.userData.inspectionLayer),
      ["equipment-casings", "equipment-covers", "mounts", "interfaces", "harnesses"]);
    p.covers.visible = false; p.harness.visible = false; p.mounts.visible = false;
    p.group.updateMatrixWorld(true);
    assert.ok(p.group.matrixWorld.equals(pose) && p.ball.matrixWorld.equals(ballPose));
  }
});

test("METHAN is an explicitly estimated cold gas cell with removable filtered covers and a fiber entry, not warm electronics", () => {
  const { methan, methanLayers } = fixture();
  assert.equal(methan.userData.approximation, true);
  assert.equal(methan.userData.geometryBasis, "published-design-estimate");
  assert.match(methan.userData.inspectionLabel, /design estimate/);
  assert.equal(methan.getObjectByName("methan-unverified-housing"), undefined);
  for (const name of ["front", "rear"]) {
    const filter = methan.getObjectByName(`methan-${name}-metal-felt`);
    assert.ok(filter?.material.map?.isDataTexture, "porous-felt cue, not a sealed painted block");
    assert.equal(filter.parent, methanLayers.covers);
  }
  const bundle = methan.getObjectByName("methan-optical-fiber-bundle"), end = bundle.geometry.parameters.path.getPoint(1).applyMatrix4(bundle.matrixWorld);
  assert.ok(end.x < A.methan.skinX && end.x > A.methan.skinX - 0.012, "fiber enters the skin without inventing a route through equipment");
  assert.equal(methan.getObjectByName("light-engine"), undefined, "warm DPU internals not reconstructed outside");
  assert.deepEqual(Object.values(methanLayers).map(g => g.userData.inspectionLayer), ["equipment-casings", "equipment-covers", "mounts", "interfaces", "harnesses"]);
  const box = new THREE.Box3().setFromObject(methanLayers.casings), pose = methan.matrixWorld.clone();
  assert.ok(box.min.x >= A.methan.skinX && box.max.y < 0.1 && box.min.y > -0.4, "cell remains outside the body and above the skids");
  const mountBox = new THREE.Box3().setFromObject(methanLayers.mounts);
  assert.ok(Math.abs(mountBox.min.x - A.methan.skinX) < 1e-8, "mounts meet the hull rather than floating");
  methanLayers.covers.visible = false; methan.updateMatrixWorld(true);
  assert.ok(methan.matrixWorld.equals(pose) && bundle.visible, "removing covers leaves the installed frame and fiber unchanged");
});

test("All part-22 assemblies clear each other and every already rebuilt part", () => {
  const { probes, methan } = fixture();
  const groups = [...probes.map(p => p.group), methan];
  for (let a = 0; a < groups.length; a++) for (let b = a + 1; b < groups.length; b++) {
    for (const [, box] of pieces(groups[a])) assert.ok(!pieces(groups[b]).some(([, other]) => box.intersectsBox(other)), "separate instrument assemblies do not overlap");
  }
  const buildDrills = kit => { for (const side of [-1, 1]) buildDrill({ ...kit, side }); };
  const builders = [buildNoseCameras, buildSideCameras, buildDrills, buildSampleLines, buildBlowers,
    buildSampleCarousel, buildWonderwall, buildDramsAssembly, buildRotorDriveElectronics, buildPowerUnits,
    buildIem, buildFrontierRadio, buildTwta, buildHgaGimbal, buildBattery, buildAftBulkhead, buildFans, buildWarmDuct, buildTrimDevice];
  for (const build of builders) {
    const other = new THREE.Group(); build({ parent: other, mesh });
    const boxes = pieces(other);
    for (const group of groups) for (const [name, box] of pieces(group)) {
      const hit = boxes.find(([, b]) => box.intersectsBox(b));
      assert.ok(!hit, `${group.name}/${name} intersects ${build.name}/${hit?.[0]}`);
    }
  }
});
