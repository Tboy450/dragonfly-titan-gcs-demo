import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
import { createInspectionVisibility } from "../dist/inspection-visibility.mjs";
import { inspectionSubassemblies, createInspector, selectInspectionSubassembly } from "../dist/vehicle-inspector.mjs";
import { mainHarnessAsset } from "../dist/main-harness.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
function build(builder = buildRotorDriveElectronics) {
  const parent = new THREE.Group(); parent.name = "rde";
  const parts = builder({ parent, mesh });
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
  const [first, second] = parts.units;
  first.covers.visible = false;
  parent.updateMatrixWorld(true);
  assert.ok(parts.assembly.matrixWorld.equals(before));
  assert.equal(second.covers.visible, true);
  for (const unit of parts.units) {
    assert.equal(unit.casings.visible, true);
    assert.equal(unit.covers.userData.inspectionLayer, "equipment-covers");
    assert.equal(unit.mounts.userData.inspectionLayer, "mounts");
    assert.equal(unit.casings.userData.inspectionLayer, "equipment-casings");
    assert.equal(unit.cooling.userData.inspectionLayer, "interfaces");
    assert.equal(unit.connectors.userData.inspectionLayer, "interfaces");
    assert.equal(unit.harnesses.userData.inspectionLayer, "harnesses");
  }
});

test("RDE unit focus and removable layers retain installed positions and restore visibility", () => {
  const { parent, parts } = build();
  assert.deepEqual(inspectionSubassemblies(parent).map(g => g.name), ["rde-1", "rde-2"]);
  const state = { inspector: createInspector() }; state.inspector.focusPart = "rde";
  const poses = parts.units.map(u => u.group.matrixWorld.toArray());
  for (const unit of parts.units) {
    selectInspectionSubassembly(state, parent, unit.group.name);
    assert.equal(state.inspector.subassembly, unit.group.name);
    assert.equal(unit.group.userData.flightConfigurationConfirmed, false);
    assert.equal(unit.group.userData.unmodeledInternals, true);
    assert.match(unit.group.userData.inspectionLabel, /approved approximation/);
    assert.ok(unit.group.userData.labelAnchor.y > rdeAsset.topY);
  }
  selectInspectionSubassembly(state, parent, "unknown");
  assert.equal(state.inspector.subassembly, "rde-2");
  const visibility = createInspectionVisibility({ rde: parent });
  for (const [id, key] of [["equipment-covers", "covers"], ["equipment-casings", "casings"], ["mounts", "mounts"], ["interfaces", "cooling"], ["harnesses", "harnesses"]]) {
    const previous = new Map(); visibility.apply({ hiddenPartLayers: { rde: [id] } }, previous);
    for (const unit of parts.units) assert.equal(unit[key].visible, false);
    for (const [object, value] of previous) object.visible = value;
    for (const unit of parts.units) assert.equal(unit[key].visible, true);
  }
  parent.updateMatrixWorld(true);
  assert.deepEqual(parts.units.map(u => u.group.matrixWorld.toArray()), poses);
});

test("RDE inspection regrouping preserves every archived mesh vertex, pose and finish", () => {
  const { parent } = build(), manifest = [];
  parent.traverse(o => { if (o.isMesh) manifest.push({ name: o.name, matrix: o.matrixWorld.toArray(),
    position: Array.from(o.geometry.attributes.position.array), index: o.geometry.index ? Array.from(o.geometry.index.array) : null,
    color: o.material.color.getHex(), metalness: o.material.metalness, roughness: o.material.roughness }); });
  manifest.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const archived = JSON.parse(readFileSync(new URL("../archive/rde-inspection-2026-10-19/before/mesh-manifest.json", import.meta.url), "utf8"));
  // Since the October 21 approximation, the added meshes carry "-approx-"; Codex's own meshes
  // must still match the archive exactly.
  assert.deepEqual(manifest.filter(o => !/-approx-/.test(o.name)), archived);
  assert.ok(manifest.some(o => /-approx-heat-sink-fin/.test(o.name)) && manifest.some(o => /-approx-backshell/.test(o.name)));
  assert.ok(!manifest.some(o => /pcb|circuit|pinout|cable/.test(o.name)));
});

test("RDE is counted as an owner-approved approximation, with no new cooling or flight solver", () => {
  const todo = readFileSync(new URL("../INTERIOR-REALISM-TODO.md", import.meta.url), "utf8");
  assert.match(todo, /- \[x\] \*\*Codex:\*\* \*\*09 /);
  assert.equal(build().parent.userData.approvedApproximation, true);
  assert.equal(build().parent.userData.flightConfigurationConfirmed, false);
});

test("RDE mounts rest on the bay floor and stay under the gimbal/deck", () => {
  const { parent } = build(), b = new THREE.Box3().setFromObject(parent);
  assert.ok(Math.abs(b.min.y - rdeAsset.floorY) < 1e-6);
  assert.ok(b.max.y < -0.067 && b.min.x > -0.30 && b.max.x < 0.30);
  assert.ok(b.min.z > -0.76 && b.max.z < -0.40, "slack leads extend forward of the unchanged enclosures");
});

test("RDE harness mask removes only leads and ties, independently from connector interfaces", () => {
  const { parent, parts } = build(), visibility = createInspectionVisibility({ rde: parent });
  assert.equal(visibility.available("harnesses", "rde"), true);
  const poses = parts.units.map(u => u.group.matrixWorld.toArray()), previous = new Map();
  visibility.apply({ hiddenPartLayers: { rde: ["harnesses"] } }, previous);
  for (const unit of parts.units) {
    assert.equal(unit.harnesses.visible, false); assert.equal(unit.connectors.visible, true);
    assert.equal(unit.cooling.visible, true); assert.equal(unit.covers.visible, true);
    assert.equal(unit.casings.visible, true);
  }
  for (const [o, v] of previous) o.visible = v;
  visibility.apply({ hiddenPartLayers: { rde: ["interfaces"] } }, new Map());
  for (const unit of parts.units) { assert.equal(unit.harnesses.visible, true); assert.equal(unit.connectors.visible, false); }
  parent.updateMatrixWorld(true); assert.deepEqual(parts.units.map(u => u.group.matrixWorld.toArray()), poses);
});

test("Four estimated RDE slack leads retain their original connector and trunk endpoints", () => {
  const { parent } = build(), leads = [];
  parent.traverse(o => { if (/-approx-lead$/.test(o.name)) leads.push(o); });
  assert.equal(leads.length, 4);
  leads.forEach((lead, i) => {
    const [x, z] = rdeAsset.centers[Math.floor(i / 2)], dx = i % 2 ? .06 : -.06;
    const face = z - rdeAsset.depthM / 2 - .007, curve = lead.geometry.parameters.path;
    assert.deepEqual(curve.getPoint(0).toArray(), [x + dx, rdeAsset.bottomY + .016, face - .008]);
    assert.deepEqual(curve.getPoint(1).toArray(), [x, -.252, face - .01]);
    assert.equal(curve.type, "CubicBezierCurve3");
    assert.equal(lead.userData.routeConfidence, "EST");
    const branch = mainHarnessAsset.branches.find(b => b.name === `rde-${Math.floor(i / 2) + 1}`);
    assert.ok(curve.getPoint(1).distanceTo(new THREE.Vector3(...branch.points.at(-1))) < branch.radiusM + rdeAsset.leadRadiusM,
      "lead ends inside the unchanged main-harness branch, not in empty space");
    assert.ok(curve.getLength() > curve.getPoint(0).distanceTo(curve.getPoint(1)) * 1.8, "visible slack, not a taut cable");
    for (let n = 0; n <= 200; n++) {
      const p = curve.getPoint(n / 200);
      assert.ok(p.y - rdeAsset.leadRadiusM > rdeAsset.floorY);
      assert.ok(p.z < z - rdeAsset.depthM / 2 && p.z > -.76);
    }
  });
});

test("RDE slack leads clear both cases and plugs except their own backshell entry", () => {
  const { parent } = build(), leads = [], solids = [];
  parent.traverse(o => {
    if (!o.isMesh) return;
    if (/-approx-lead$/.test(o.name)) leads.push(o);
    else if (!/-approx-lead-tie$/.test(o.name)) solids.push(o);
  });
  for (const lead of leads) {
    const curve = lead.geometry.parameters.path, start = curve.getPoint(0);
    for (let i = 0; i <= 250; i++) {
      const p = curve.getPoint(i / 250), b = new THREE.Box3().setFromCenterAndSize(p, new THREE.Vector3().setScalar(rdeAsset.leadRadiusM * 2));
      for (const other of solids) {
        if (/-approx-backshell$/.test(other.name) && p.distanceTo(start) < .008) continue;
        assert.ok(!b.intersectsBox(new THREE.Box3().setFromObject(other)), `${lead.name} intersects ${other.name}`);
      }
    }
  }
});

test("Service-loop update preserves Claude's non-wire RDE geometry and finish exactly", () => {
  const { parent } = build(), actual = [];
  parent.traverse(o => { if (o.isMesh && !/-approx-lead(?:-tie)?$/.test(o.name)) actual.push({
    name: o.name, matrix: o.matrixWorld.toArray(), position: Array.from(o.geometry.attributes.position.array),
    index: o.geometry.index ? Array.from(o.geometry.index.array) : null,
    color: o.material.color.getHex(), metalness: o.material.metalness, roughness: o.material.roughness,
  }); });
  const prior = JSON.parse(readFileSync(new URL("../archive/rde-service-loops-2026-10-21/before/mesh-manifest.json", import.meta.url), "utf8"))
    .filter(o => !/-approx-lead$/.test(o.name));
  const sort = values => values.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  assert.equal(JSON.stringify(sort(actual)), JSON.stringify(sort(prior)));
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
