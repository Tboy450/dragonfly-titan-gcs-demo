import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildAftBulkhead, aftBulkheadAsset, aftFaceZ, poseMmrtg } from "../dist/aft-bulkhead.mjs";
import { buildFans, buildWarmDuct, buildTrimDevice, airLoopPaths } from "../dist/thermal-loop.mjs";
import { buildBattery } from "../dist/battery.mjs";
import { buildTwta } from "../dist/twta.mjs";
import { buildHgaGimbal } from "../dist/hga-gimbal.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildPowerUnits } from "../dist/power-units.mjs";
import { buildSideCameras } from "../dist/side-cameras.mjs";
import { buildRotorDriveElectronics } from "../dist/rotor-drive-electronics.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
const find = (group, re) => { const out = []; group.traverse(o => { if (o.isMesh && re.test(o.name)) out.push(o); }); return out; };
const boxes = (group, frame) => {
  const out = []; group.updateMatrixWorld(true);
  group.traverse(o => {
    if (!o.isMesh) return;
    const path = o.geometry.parameters?.path;
    if (path) for (let i = 0; i <= 200; i += 1) out.push([o.name, new THREE.Box3().setFromCenterAndSize(path.getPoint(i / 200).applyMatrix4(o.matrixWorld).applyMatrix4(frame), new THREE.Vector3(1, 1, 1).multiplyScalar(2 * o.geometry.parameters.radius))]);
    else {
      const box = new THREE.Box3();
      for (const p of worldPoints(o)) box.expandByPoint(p.applyMatrix4(frame));
      out.push([o.name, box]);
    }
  });
  return out;
};
// Points of a mesh's geometry in world space (exact, for thin tilted plates).
const worldPoints = (o) => { o.updateWorldMatrix(true, false); const p = o.geometry.attributes.position, v = []; for (let i = 0; i < p.count; i += 1) v.push(new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld)); return v; };
function build() { const parent = new THREE.Group(); const b = buildAftBulkhead({ parent, mesh }); parent.updateMatrixWorld(true); return { parent, b }; }
// The bulkhead is a tilted plate, so test other parts in its own frame: a box is a hit when, in
// plate coordinates, it overlaps the plate's rectangle and its depth (rim back to ring front).
function plateHits(b, group) {
  const inv = b.assembly.matrixWorld.clone().invert(), hits = [];
  const pieces = [];
  b.assembly.traverse(o => {
    if (!o.isMesh) return;
    const box = new THREE.Box3();
    for (const v of worldPoints(o)) box.expandByPoint(v.applyMatrix4(inv));
    pieces.push(box);
  });
  // Transform vertices directly: rotating a world AABB back expands it a second time,
  // falsely intersecting the adapter whose actual end face clears the plate by 2 mm.
  for (const [name, local] of boxes(group, inv)) {
    if (pieces.some(p => p.intersectsBox(local))) hits.push(name);
  }
  return hits;
}

test("The MMRTG points aft and up 25 degrees from the bulkhead's interface", () => {
  const A = aftBulkheadAsset;
  assert.equal(A.tiltDeg, 25);
  const g = poseMmrtg(new THREE.Group());
  const axis = new THREE.Vector3(0, 0, 1).applyEuler(g.rotation);
  assert.ok(axis.z > 0 && axis.y > 0, "aft and up");
  assert.ok(Math.abs(Math.atan2(axis.y, axis.z) * 180 / Math.PI - 25) < 1e-6);
  assert.ok(new THREE.Vector3(...A.mmrtgBase).sub(new THREE.Vector3(...A.interfaceCenter)).normalize().dot(axis) > 0.9999, "the base sits on the interface, along the axis");
  // The MMRTG (0.66 m long, fins to 0.32 m radius) keeps the plan view's aft-most 1.93 m.
  const end = new THREE.Vector3(...A.mmrtgCenter).addScaledVector(axis, 0.33);
  const down = new THREE.Vector3(0, -Math.cos(25 * Math.PI / 180), Math.sin(25 * Math.PI / 180));
  assert.ok(Math.abs(end.clone().addScaledVector(down, 0.32).z - 1.93) < 0.01, "aft-most point at the plan view's 1.93 m");
  assert.ok(A.interfaceCenter[1] > -0.2 && A.interfaceCenter[1] < 0.07, "axis meets the bulkhead in its upper part, under the deck");
});

test("The bulkhead plate is canted parallel to the body's aft face, top leaning forward", () => {
  const { parent } = build();
  const face = find(parent, /^aft-bulkhead-face$/)[0];
  const pts = worldPoints(face);
  const top = pts.reduce((a, b) => (b.y > a.y ? b : a)), bottom = pts.reduce((a, b) => (b.y < a.y ? b : a));
  assert.ok(top.z < bottom.z, "top forward of bottom");
  assert.ok(top.y <= 0.081 && bottom.y >= -0.33, "between the bay floor and the top deck");
  // The foam face sits a constant distance aft of the plate.
  for (const y of [-0.3, -0.1, 0.05]) {
    const plateZ = aftBulkheadAsset.interfaceCenter[2] - (y - aftBulkheadAsset.interfaceCenter[1]) * Math.tan(25 * Math.PI / 180);
    assert.ok(aftFaceZ(y) > plateZ, `foam face aft of the plate at y ${y}`);
  }
});

test("Details from the photos: rib frame, ribbed circular interface, pockets, labels", () => {
  const { parent, b } = build();
  assert.ok(find(parent, /^aft-bulkhead-rim-rib$/).length > 20);
  assert.equal(find(parent, /^aft-bulkhead-interface-rib$/).length, 4, "a 2 x 2 grid of ribs across the interface");
  assert.equal(find(parent, /^aft-bulkhead-pocket$/).length, 7);
  assert.deepEqual([b.plates, b.interfaces, b.fasteners].map(g => g.userData.inspectionLayer), ["equipment-casings", "interfaces", "mounts"]);
});

test("Fans and their adapter collar sit forward of the bulkhead; the air path runs through the MMRTG", () => {
  const { b } = build();
  const fans = new THREE.Group(); buildFans({ parent: fans, mesh });
  assert.deepEqual(plateHits(b, fans), [], "fans and their adapter stay forward of the bulkhead");
  // The adapter collar reaches the plate's forward face (within 3 mm).
  const adapter = find(fans, /^fan-mmrtg-adapter-duct$/)[0];
  const inv = b.assembly.matrixWorld.clone().invert();
  const back = Math.max(...worldPoints(adapter).map(p => p.applyMatrix4(inv).z));
  assert.ok(back < -aftBulkheadAsset.plate.thickness && back > -aftBulkheadAsset.plate.thickness - 0.003, "collar meets the plate's forward face");
  const { main } = airLoopPaths();
  let best = Infinity; for (let i = 0; i <= 400; i += 1) best = Math.min(best, main.getPoint(i / 400).distanceTo(new THREE.Vector3(...aftBulkheadAsset.mmrtgCenter)));
  assert.ok(best < 0.01, "the air loop passes through the MMRTG");
});

test("The bulkhead clears the other rebuilt parts", () => {
  const { b } = build();
  const builders = [buildBattery, buildTwta, buildHgaGimbal, buildFrontierRadio, buildPowerUnits, buildSideCameras, buildRotorDriveElectronics, buildWarmDuct, buildTrimDevice];
  for (const builder of builders) {
    const g = new THREE.Group(); builder({ parent: g, mesh });
    const hits = plateHits(b, g);
    assert.deepEqual(hits, [], `${builder.name} clears the bulkhead`);
  }
});
