import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildArmShoulder, armShoulderAsset as A } from "../dist/arm-shoulder.mjs";
import { rotorHeadAsset } from "../dist/rotor-heads.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
// The four arms as vehicle-research.mjs builds them.
const arms = [];
for (const x of [-1.25, 1.25]) for (const [i, z] of [-0.98, 0.98].entries()) arms.push({ root: [Math.sign(x) * 0.42, 0.02, [-0.75, 0.84][i]], hub: [x, 0.02, z] });
function build(arm) { const parent = new THREE.Group(); const end = buildArmShoulder({ parent, mesh, ...arm }); parent.updateMatrixWorld(true); return { parent, end, fitting: parent.children[0] }; }
const worldPoints = o => { const p = o.geometry.attributes.position, v = []; for (let i = 0; i < p.count; i += 1) v.push(new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld)); return v; };
const named = (g, name) => { const out = []; g.traverse(o => { if (o.isMesh && o.name === name) out.push(o); }); return out; };

test("A six-sided collar narrowing outward, then a round flange with a ring of bolts (May 2026 photo)", () => {
  const { parent } = build(arms[1]);
  const [collar] = named(parent, "arm-shoulder-collar"), [flange] = named(parent, "arm-shoulder-flange");
  assert.equal(collar.geometry.parameters.radialSegments, 6);
  assert.ok(collar.geometry.parameters.radiusTop < collar.geometry.parameters.radiusBottom, "narrows outward");
  assert.ok(flange.geometry.parameters.radialSegments >= 24, "the flange is round");
  assert.equal(named(parent, "arm-shoulder-bolt").length, A.bolts);
  assert.equal(named(parent, "arm-shoulder-rib").length, 6);
});

test("Each fitting starts at the body's foam surface and points along its arm, flats up and down", () => {
  for (const arm of arms) {
    const { fitting, end } = build(arm);
    const along = new THREE.Vector3(...arm.hub).sub(new THREE.Vector3(...arm.root)).normalize();
    assert.ok(new THREE.Vector3(0, 1, 0).applyQuaternion(fitting.quaternion).dot(along) > 0.9999, "along the arm, not straight out");
    assert.ok(Math.abs(fitting.position.x) <= A.skinX, "seated at the foam surface");
    assert.ok(Math.abs(end[0]) > A.skinX + 0.05, "stands out of the foam");
    const [collar] = named(fitting, "arm-shoulder-collar");
    const top = Math.max(...worldPoints(collar).map(p => p.y)) - arm.root[1];
    assert.ok(Math.abs(top - A.baseAcrossFlatsM / 2) < 0.006, "a flat on top, as photographed");
  }
});

test("The fittings stay between the rotor planes and clear of the rotor heads", () => {
  for (const arm of arms) {
    const box = new THREE.Box3().setFromObject(build(arm).parent);
    assert.ok(box.min.y > rotorHeadAsset.rotorY[0] && box.max.y < rotorHeadAsset.rotorY[1]);
    const hub = new THREE.Vector3(...arm.hub);
    assert.ok(box.distanceToPoint(hub) > 0.5, "well inboard of the motor stack");
  }
});

test("The research model uses the fitting on all four arms; the round foam ring is gone", () => {
  const research = readFileSync(new URL("../dist/vehicle-research.mjs", import.meta.url), "utf8");
  assert.match(research, /const flangeEnd = buildArmShoulder\(\{ parent: buildTarget, mesh, root, hub \}\);/);
  assert.match(research, /taper\(flangeEnd, fairingEnd/);
  assert.doesNotMatch(research, /CylinderGeometry\(0\.13, 0\.13, 0\.075, 20\), foamSeam/);
  const todo = readFileSync(new URL("../INTERIOR-REALISM-TODO.md", import.meta.url), "utf8");
  assert.match(todo, /- \[x\] \*\*Claude:\*\* \*\*Arm shoulder joint/);
});
