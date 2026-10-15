import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildRotorHead, buildHubPlate, rotorHeadAsset } from "../dist/rotor-heads.mjs";
import { model } from "../dist/flight-model.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
const find = (group, re) => { const out = []; group.traverse(o => { if (o.isMesh && re.test(o.name)) out.push(o); }); return out; };
const boxOf = o => { o.updateWorldMatrix(true, true); return new THREE.Box3().setFromObject(o); };
function build(x = 1.25, z = -0.98) {
  const parent = new THREE.Group();
  const head = buildRotorHead({ parent, mesh, x, z, armRoot: [0.42, 0.02, -0.75] });
  parent.updateMatrixWorld(true);
  return { parent, head };
}

test("A coaxial stack: lower drum, collar, upper drum, with the rotors just outside the drums", () => {
  const { parent } = build();
  const A = rotorHeadAsset;
  const lower = boxOf(find(parent, /^rotor-motor-lower$/)[0]), upper = boxOf(find(parent, /^rotor-motor-upper$/)[0]);
  const collar = boxOf(find(parent, /^rotor-head-collar$/)[0]);
  assert.ok(lower.max.y <= collar.min.y + 1e-6 && collar.max.y <= upper.min.y + 1e-6, "lower drum, collar, upper drum, bottom to top");
  assert.ok(A.rotorY[0] < lower.min.y && A.rotorY[1] > upper.max.y, "each rotor sits outside its drum");
  assert.ok(Math.abs(A.rotorY[1] - A.rotorY[0] - 0.36) < 1e-9, "rotor disks 0.36 m apart (about R/2), as before");
  const drumDiameter = lower.max.x - lower.min.x, bladeLength = model.rotorDiameterM / 2;
  assert.ok(drumDiameter > bladeLength * 0.3 && drumDiameter < bladeLength * 0.45, "drum about a third of a blade across, as in the video");
});

test("The collar sits at arm height with a clamp facing the arm root", () => {
  const { parent } = build();
  const clamp = boxOf(find(parent, /^rotor-head-clamp-block$/)[0]).getCenter(new THREE.Vector3());
  assert.ok(Math.abs(clamp.y - 0.02) < 0.01, "at the arm's height");
  const toArm = new THREE.Vector3(0.42 - 1.25, 0, -0.75 + 0.98).normalize();
  const toClamp = new THREE.Vector3(clamp.x - 1.25, 0, clamp.z + 0.98).normalize();
  assert.ok(toClamp.dot(toArm) > 0.99, "clamp faces the arm");
});

test("Drum details from the footage: spoked faces, a band of holes, notch screws; shafts reach the hub plates", () => {
  const { parent } = build();
  for (const side of ["lower", "upper"]) {
    assert.equal(find(parent, new RegExp(`^rotor-motor-${side}-spoke$`)).length, rotorHeadAsset.spokes);
    assert.equal(find(parent, new RegExp(`^rotor-motor-${side}-hole$`)).length, rotorHeadAsset.boltHoles);
    assert.ok(find(parent, new RegExp(`^rotor-motor-${side}-screw$`)).length > 0);
    const shaft = boxOf(find(parent, new RegExp(`^rotor-shaft-${side}$`))[0]);
    const rotorY = rotorHeadAsset.rotorY[side === "lower" ? 0 : 1];
    assert.ok(Math.abs((side === "lower" ? shaft.min.y : shaft.max.y) - rotorY) < 1e-6, "shaft reaches the rotor plane");
  }
});

test("Hub plate scales with the rotor to its real size", () => {
  const rotor = new THREE.Group(); const scale = 0.964;
  rotor.scale.setScalar(scale);
  buildHubPlate({ parent: rotor, mesh, scale, material: new THREE.MeshStandardMaterial() });
  const plate = boxOf(find(rotor, /^rotor-hub-plate$/)[0]);
  assert.ok(Math.abs((plate.max.x - plate.min.x) / 2 - rotorHeadAsset.hubPlateRadiusM) < 1e-6);
});
