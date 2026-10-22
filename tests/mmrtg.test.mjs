import test from "node:test";
import assert from "node:assert/strict";
import * as T from "../dist/vendor/three/three.module.min.js";
import { buildMmrtg, mmrtgAsset as A } from "../dist/mmrtg.mjs";
import { buildMmrtgMeasurement, mmrtgMeasurementAsset as S } from "../dist/mmrtg-measurement.mjs";
import { poseMmrtg } from "../dist/aft-bulkhead.mjs";
import { createInspectionVisibility } from "../dist/inspection-visibility.mjs";
import { inspectionSubassemblies, inspectionGroups } from "../dist/vehicle-inspector.mjs";

const mesh = (g, m, p, parent) => { const o = new T.Mesh(g, m); o.position.fromArray(p); parent.add(o); return o; };
const build = () => { const parent = new T.Group(); const parts = buildMmrtg({ parent, mesh }); parent.updateMatrixWorld(true); return { parent, ...parts }; };
function points(group, inverse = new T.Matrix4()) {
  const out = [];
  group.traverse(o => { if (o.isMesh) {
    const p = o.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) out.push(new T.Vector3().fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld).applyMatrix4(inverse));
  } }); return out;
}

test("MMRTG retains NASA's64 cm fin span and66 cm axial envelope", () => {
  const { frame } = build(), local = points(frame, frame.matrixWorld.clone().invert());
  const bounds = new T.Box3().setFromPoints(local), size = bounds.getSize(new T.Vector3());
  assert.ok(Math.abs(size.x - .64) < 1e-7 && Math.abs(size.y - .64) < 1e-7);
  assert.ok(Math.abs(size.z - .66) < 1e-7);
  assert.ok(Math.abs(bounds.min.z - A.axialMinM) < 1e-7 && Math.abs(bounds.max.z - A.axialMaxM) < 1e-7);
  local.forEach(p => assert.ok(Number.isFinite(p.length()) && Math.hypot(p.x, p.y) <= .32001));
});

test("Eight thin radiator plates share geometry, retain slots and attach through root rails", () => {
  const { finGroups, roots } = build(); assert.equal(finGroups.length, 8);
  assert.equal(new Set(finGroups.map(g => g.children[0].geometry)).size, 1);
  finGroups.forEach((g, i) => {
    assert.equal(g.rotation.z, i * Math.PI / 4);
    assert.equal(g.children[0].geometry.parameters.options.depth, .0025);
    assert.equal(g.children[0].material.color.getHex(), 0xe6e5d9);
  });
  assert.equal(roots.children.length, 8);
  roots.children.forEach(g => {
    const rail = g.getObjectByName('mmrtg-fin-root-rail'); assert.ok(rail);
    assert.ok(rail.position.x - .009 / 2 < A.housingRadiusM && rail.position.x + .009 / 2 > A.housingRadiusM);
  });
  // Slots are actual cut geometry, not dark lines painted on the plate.
  const plate = finGroups[0].children[0], ray = new T.Raycaster();
  const inv = plate.matrixWorld;
  const direction = new T.Vector3(0, 1, 0).transformDirection(inv);
  ray.set(new T.Vector3(.30, -.05, 0).applyMatrix4(inv), direction);
  assert.equal(ray.intersectObject(plate).length, 0);
  ray.set(new T.Vector3(.30, -.05, .04).applyMatrix4(inv), direction);
  assert.ok(ray.intersectObject(plate).length > 0);
});

test("Generator pose matches the existing aft interface; no shipping fixture becomes flight hardware", () => {
  const { parent, frame, mount } = build(), expected = poseMmrtg(new T.Group());
  assert.ok(frame.position.distanceTo(expected.position) < 1e-12 && frame.quaternion.angleTo(expected.quaternion) < 1e-12);
  assert.equal(parent.userData.label, undefined, "unnumbered exterior assembly does not become part25");
  assert.equal(parent.userData.inspectionTitle, "MMRTG generator body");
  assert.equal(parent.userData.assetRevision, A.revision);
  const ends = points(mount, frame.matrixWorld.clone().invert());
  assert.ok(Math.abs(Math.min(...ends.map(p => p.z)) - A.axialMinM) < 1e-7);
  parent.traverse(o => assert.doesNotMatch(o.name, /fuel-block|plutonium|shipping|hoist|lifting-fixture/));
});

test("Housing, fins and ends focus separately; layers restore without moving installed parts", () => {
  const { parent, frame, housingAssembly, finAssembly, endAssembly } = build();
  assert.deepEqual(inspectionSubassemblies(parent), [housingAssembly, finAssembly, endAssembly]);
  const layers = createInspectionVisibility({ mmrtg: parent }), before = points(frame).map(v => v.toArray());
  for (const id of ["equipment-casings", "equipment-covers", "mounts", "interfaces"]) {
    assert.equal(layers.available(id, "mmrtg"), true);
    const previous = new Map(); layers.apply({ hiddenPartLayers: { mmrtg: [id] } }, previous);
    assert.ok(previous.size); for (const o of previous.keys()) assert.equal(o.visible, false);
    for (const [o, visible] of previous) o.visible = visible;
  }
  assert.equal(layers.available("harnesses", "mmrtg"), false, "no invented external power route");
  assert.deepEqual(points(frame).map(v => v.toArray()), before);
  assert.deepEqual(inspectionGroups("mmrtg"), ["mmrtg", "mmrtg-sensor"]);
});

test("Sensor21 retains its physical package and clears generator features at the refitted radius", () => {
  const { frame, housing } = build(), sensor = new T.Group();
  const s = buildMmrtgMeasurement({ parent: sensor, mesh }); sensor.updateMatrixWorld(true);
  assert.equal(S.housingRadiusM, A.housingRadiusM);
  assert.equal(S.finThicknessM, A.finThicknessM);
  assert.deepEqual(S.elementM, [.002, .002, .0008]);
  const sensorPoints = points(sensor), r = points(s.mounts, frame.matrixWorld.clone().invert()).map(p => Math.hypot(p.x, p.y));
  assert.ok(Math.abs(Math.min(...r) - A.housingRadiusM) < 1e-7, "bond meets revised housing");
  frame.traverse(o => { if (o.isMesh && o.parent !== housing) {
    o.geometry.computeBoundingBox(); const bounds = o.geometry.boundingBox.clone().expandByScalar(-1e-7), inv = o.matrixWorld.clone().invert();
    sensorPoints.forEach(p => assert.ok(!bounds.containsPoint(p.clone().applyMatrix4(inv)), `sensor enters ${o.name}`));
  } });
});

test("Generator rendering budget is bounded and all geometric values are finite", () => {
  const { parent } = build(); let count = 0;
  parent.traverse(o => { if (o.isMesh) {
    count++; assert.ok(Array.from(o.geometry.attributes.position.array).every(Number.isFinite));
  } });
  assert.ok(count > 50 && count < 220);
});
