import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildMmrtgMeasurement, mmrtgMeasurementAsset as A } from "../dist/mmrtg-measurement.mjs";
import { poseMmrtg } from "../dist/aft-bulkhead.mjs";
import { buildMmrtg, mmrtgAsset } from "../dist/mmrtg.mjs";
import { inspectionGroups } from "../dist/vehicle-inspector.mjs";
import { createInspectionVisibility } from "../dist/inspection-visibility.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
function build() { const parent = new THREE.Group(); const result = buildMmrtgMeasurement({ parent, mesh }); parent.updateMatrixWorld(true); return { parent, ...result }; }
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
// Vertices of the annotation in the generator's own frame.
function localPoints({ frame, mounting }) {
  const inv = frame.matrixWorld.clone().invert(), out = [];
  mounting.traverse(o => {
    if (!o.isMesh) return;
    const p = o.geometry.attributes.position;
    for (let i = 0; i < p.count; i += 1) out.push(new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld).applyMatrix4(inv));
  });
  return out;
}

test("Part21 is a temperature-appropriate RTD family approximation with explicit limits", () => {
  const { parent, body, frame, mounting } = build();
  assert.equal(parent.userData.annotation, false);
  assert.equal(parent.userData.hardwareReconstructed, false);
  assert.equal(parent.userData.hardwareApproximation, true);
  assert.match(parent.userData.referenceFamily, /F2020.*unconfirmed/);
  assert.ok(A.familyRangeC[0] < 157 && A.familyRangeC[1] > 157);
  assert.equal(parent.userData.measurementZone, "mmrtg");
  assert.equal(parent.userData.assetRevision, A.revision);
  assert.equal(body.children.length, 2);
  assert.equal(parent.children.length, 1);
  const world = new THREE.Vector3(0, 0, A.bondThicknessM + A.elementM[2] / 2).applyMatrix4(mounting.matrixWorld);
  assert.ok(parent.userData.labelAnchor.distanceTo(world) < 1e-9);
  parent.traverse(o => { if (o.isMesh) assert.notEqual(o.geometry.type, "TorusGeometry"); });
  assert.equal(frame.children[0], mounting);
});

test("The RTD follows the generator pose and bonds to the cylindrical housing", () => {
  const { frame, mounting } = build();
  const pose = poseMmrtg(new THREE.Group());
  assert.ok(frame.position.distanceTo(pose.position) < 1e-9 && frame.quaternion.angleTo(pose.quaternion) < 1e-9);
  const center = mounting.position, radius = Math.hypot(center.x, center.y);
  assert.ok(Math.abs(radius - A.housingRadiusM) < 1e-9);
  assert.ok(Math.abs(center.z) < 0.31, "within the housing's length");
  const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(mounting.quaternion);
  assert.ok(normal.dot(new THREE.Vector3(center.x, center.y, 0).normalize()) > 0.9999, "tangent to the housing");
  const radii = localPoints(build()).map(p => Math.hypot(p.x, p.y));
  assert.ok(Math.min(...radii) >= A.housingRadiusM - 1e-7, "no housing penetration beyond tessellation tolerance");
  assert.ok(Math.abs(Math.min(...radii) - A.housingRadiusM) < 1e-7, "curved bond touches housing");
});

test("The RTD and leads sit beside the top fin root and clear all eight fins", () => {
  const points = localPoints(build());
  for (let i = 0; i < A.finCount; i += 1) {
    const angle = i / A.finCount * Math.PI * 2;
    // Fin i in its own frame: x across its thickness, y outward from the axis.
    const toFin = new THREE.Matrix4().makeRotationZ(-(angle - Math.PI / 2));
    const hits = points.map(p => p.clone().applyMatrix4(toFin)).filter(p => Math.abs(p.x) < A.finThicknessM / 2 && p.y > 0);
    assert.equal(hits.length, 0, `fin ${i} is not crossed`);
  }
  const c = points.reduce((s, p) => s.add(p), new THREE.Vector3()).divideScalar(points.length);
  assert.ok(Math.abs(THREE.MathUtils.radToDeg(Math.atan2(c.y, c.x)) - 90) < 15, "next to the top fin");
});

test("The RTD shares the new MMRTG housing and fin dimensions", () => {
  const research = read("../dist/vehicle-research.mjs");
  assert.equal(A.housingRadiusM, mmrtgAsset.housingRadiusM);
  assert.equal(A.finCount, mmrtgAsset.finCount);
  assert.equal(A.finThicknessM, mmrtgAsset.finThicknessM);
  const parent = new THREE.Group(); const { frame } = buildMmrtg({ parent, mesh });
  assert.ok(frame.quaternion.angleTo(build().frame.quaternion) < 1e-9);
  assert.match(research, /buildMmrtg\(\{ parent: buildTarget, mesh \}\)/);
  assert.match(research, /interiorPart\("mmrtg-sensor", "mmrtg", "MMRTG fin-root sensor \(RTD family approximation/);
  assert.match(research, /buildMmrtgMeasurement\(\{ parent: buildTarget, mesh \}\)/);
});

test("Part 21 isolates with the generator and records its evidence limits", () => {
  assert.deepEqual(inspectionGroups("mmrtg-sensor"), ["mmrtg", "mmrtg-sensor"]);
  assert.deepEqual(inspectionGroups("mmrtg"), ["mmrtg", "mmrtg-sensor"]);
  const todo = read("../INTERIOR-REALISM-TODO.md");
  assert.match(todo, /- \[x\] \*\*Codex:\*\* \*\*21 MMRTG fin-root sensor\*\*/);
  assert.match(todo, /- \[ \] \*\*21 follow-up/);
  const ui = read("../dist/ui/layers-panel.mjs");
  assert.match(ui, /Omega F2020 Class B/);
  assert.match(ui, /does not model the fin root or the second controller/);
  assert.match(ui, /mmrtgFacts: \["NASA MMRTG fact sheet/);
});

test("The ceramic/glass package and paired leads retain published physical dimensions", () => {
  const { body, mounting, leads, base, pad } = build();
  const inv = mounting.matrixWorld.clone().invert(), bounds = new THREE.Box3();
  body.traverse(o => { if (o.isMesh) {
    const p = o.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) bounds.expandByPoint(new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld).applyMatrix4(inv));
  } });
  const size = bounds.getSize(new THREE.Vector3());
  size.toArray().forEach((v, i) => assert.ok(Math.abs(v - A.elementM[i]) < 1e-9));
  assert.ok(Math.abs(base.position.z - .00031 - A.bondThicknessM) < 1e-12);
  assert.ok(pad.geometry.type === "ExtrudeGeometry", "bond follows housing rather than floating at a tangent");
  assert.equal(leads.children.length, 2);
  for (const lead of leads.children) {
    assert.ok(Math.abs(lead.userData.lengthM - .010) < 1e-10);
    assert.equal(lead.geometry.parameters.radius * 2, .0002);
    assert.equal(lead.userData.destinationUnmodeled, true);
  }
  for (let i = 0; i <= 100; i++) {
    const paths = leads.children.map(o => o.geometry.parameters.path.getPoint(i / 100));
    assert.ok(paths[0].distanceTo(paths[1]) > .0002);
    assert.ok(paths.every(p => p.z > .0002), "lead clearance above bond/housing");
  }
});

test("RTD casing, bond and leads hide independently and restore without moving", () => {
  const { parent, body, mounts, leads, head } = build(), layers = createInspectionVisibility({ "mmrtg-sensor": parent });
  const before = parent.matrixWorld.toArray();
  for (const [id, target] of [["equipment-casings", body], ["mounts", mounts], ["harnesses", leads]]) {
    assert.equal(layers.available(id, "mmrtg-sensor"), true);
    const previous = new Map(); layers.apply({ hiddenPartLayers: { "mmrtg-sensor": [id] } }, previous);
    for (const g of [body, mounts, leads]) assert.equal(g.visible, g !== target);
    for (const [o, visible] of previous) o.visible = visible;
  }
  assert.equal(layers.available("equipment-covers", "mmrtg-sensor"), false, "glass coating is not a removable lid");
  assert.equal(head.userData.inspectionMinimumRadiusM, .003);
  parent.updateMatrixWorld(true); assert.deepEqual(parent.matrixWorld.toArray(), before);
});
