import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildMmrtgMeasurement, mmrtgMeasurementAsset as A } from "../dist/mmrtg-measurement.mjs";
import { poseMmrtg } from "../dist/aft-bulkhead.mjs";
import { inspectionGroups } from "../dist/vehicle-inspector.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
function build() { const parent = new THREE.Group(); const result = buildMmrtgMeasurement({ parent, mesh }); parent.updateMatrixWorld(true); return { parent, ...result }; }
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
// Vertices of the annotation in the generator's own frame.
function localPoints({ frame, target }) {
  const inv = frame.matrixWorld.clone().invert(), out = [];
  target.traverse(o => {
    if (!o.isMesh) return;
    const p = o.geometry.attributes.position;
    for (let i = 0; i < p.count; i += 1) out.push(new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld).applyMatrix4(inv));
  });
  return out;
}

test("Part 21 is explicitly an MMRTG fin-root measurement annotation, not reconstructed hardware", () => {
  const { parent, frame, target, ring } = build();
  assert.equal(parent.userData.annotation, true);
  assert.equal(parent.userData.hardwareReconstructed, false);
  assert.equal(parent.userData.measurementZone, "mmrtg");
  assert.equal(parent.userData.assetRevision, A.revision);
  assert.equal(ring.geometry.type, "TorusGeometry");
  assert.equal(target.children.length, 3);
  assert.equal(parent.children.length, 1);
  const world = new THREE.Vector3().setFromMatrixPosition(target.matrixWorld);
  assert.ok(parent.userData.labelAnchor.distanceTo(world) < 1e-6, "the number sits on the target");
  // No sphere left: the old placeholder looked like a sensor body.
  parent.traverse(o => { if (o.isMesh) assert.notEqual(o.geometry.type, "SphereGeometry"); });
  assert.equal(frame.children[0], target);
});

test("The target follows the generator's pose and lies flat on its housing", () => {
  const { frame, target } = build();
  const pose = poseMmrtg(new THREE.Group());
  assert.ok(frame.position.distanceTo(pose.position) < 1e-9 && frame.quaternion.angleTo(pose.quaternion) < 1e-9);
  const center = target.position, radius = Math.hypot(center.x, center.y);
  assert.ok(Math.abs(radius - (A.housingRadiusM + A.liftM)) < 1e-9);
  assert.ok(Math.abs(center.z) < 0.31, "within the housing's length");
  const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(target.quaternion);
  assert.ok(normal.dot(new THREE.Vector3(center.x, center.y, 0).normalize()) > 0.9999, "tangent to the housing");
  for (const p of localPoints(build())) assert.ok(Math.hypot(p.x, p.y) > A.housingRadiusM, "outside the housing surface");
});

test("The target sits beside the top fin's root without crossing any fin", () => {
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

test("The modeled MMRTG still has the housing and fins the target was placed against", () => {
  const research = read("../dist/vehicle-research.mjs");
  assert.match(research, new RegExp(`CylinderGeometry\\(${A.housingRadiusM}, ${A.housingRadiusM}, 0\\.66, 24\\), rtgMaterial`));
  assert.match(research, new RegExp(`for \\(let i = 0; i < ${A.finCount}; i \\+= 1\\)`));
  assert.match(research, new RegExp(`BoxGeometry\\(${A.finThicknessM}, 0\\.12, 0\\.62\\), rtgMaterial, \\[Math\\.cos\\(angle\\) \\* 0\\.26`));
  assert.match(research, /interiorPart\("mmrtg-sensor", "mmrtg", "MMRTG fin-root temperature input \(annotation/);
  assert.match(research, /buildMmrtgMeasurement\(\{ parent: buildTarget, mesh \}\)/);
});

test("Part 21 isolates with the generator and records its evidence limits", () => {
  assert.deepEqual(inspectionGroups("mmrtg-sensor"), ["mmrtg", "mmrtg-sensor"]);
  assert.deepEqual(inspectionGroups("mmrtg"), ["mmrtg"]);
  const todo = read("../INTERIOR-REALISM-TODO.md");
  assert.match(todo, /- \[ \] \*\*21 MMRTG fin-root sensor\*\*/, "stays unchecked: no hardware evidence");
  const ui = read("../dist/ui/layers-panel.mjs");
  assert.match(ui, /measurement annotation, not a modeled sensor package/);
  assert.match(ui, /does not model the fin root or the second controller/);
  assert.match(ui, /mmrtgFacts: \["NASA MMRTG fact sheet/);
});
