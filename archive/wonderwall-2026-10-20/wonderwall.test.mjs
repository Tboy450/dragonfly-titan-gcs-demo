import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildWonderwall, wonderwallAsset } from "../dist/wonderwall.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material);
  part.position.fromArray(position); parent.add(part); return part;
}
function fixture() {
  const parent = new THREE.Group();
  return { parent, ...buildWonderwall({ parent, mesh }) };
}
test("Wonderwall is a separately layered, explicitly estimated interface", () => {
  const { parent, wall, insulation, coldFace, warmFace, mounts } = fixture();
  assert.equal(parent.userData.assetRevision, wonderwallAsset.revision);
  assert.equal(parent.userData.dimensionConfidence, "EST");
  assert.equal(insulation.userData.inspectionLayer, "insulation");
  assert.equal(coldFace.userData.thermalZone, "cold-attic");
  assert.equal(warmFace.userData.thermalZone, "equipment-bay");
  assert.ok(wonderwallAsset.coreThicknessM < 0.05, "5 cm instrument separation is not used as wall thickness");
  const installed = wall.position.clone();
  insulation.visible = false; coldFace.visible = false; warmFace.visible = false;
  assert.equal(mounts.visible, true, "future peel-away controls can hide faces/core independently");
  assert.deepEqual(wall.position, installed, "hiding a layer never moves the installed assembly");
});
test("The updated Wonderwall clears the updated carousel and fits the attic", () => {
  const { parent: wall } = fixture();
  const carousel = new THREE.Group();
  buildSampleCarousel({ parent: carousel, mesh });
  const a = new THREE.Box3().setFromObject(wall), b = new THREE.Box3().setFromObject(carousel);
  assert.equal(a.intersectsBox(b), false, "rebuilt assemblies do not overlap, including protruding hardware");
  assert.ok(a.min.x - b.max.x > 0.008, "positive modeled clearance, not just coincident surfaces");
  assert.ok(a.min.x > -0.36 && a.max.x < 0.36);
  assert.ok(a.min.y > 0.07 && a.max.y < 0.49);
  assert.ok(a.min.z > -1.57 && a.max.z < -0.94);
  // Roof slopes down at the nose: conservatively check the forward perimeter vertices.
  for (const [z, y] of wonderwallAsset.outline) if (z < -0.2) assert.ok(y + wonderwallAsset.position[1] < 0.42);
});
test("Wonderwall interface openings pass through both faces and the core", () => {
  const { wall } = fixture();
  wall.updateMatrixWorld(true);
  const [u, y] = wonderwallAsset.aperture;
  const ray = new THREE.Raycaster(new THREE.Vector3(-0.5, y + wall.position.y, u + wall.position.z), new THREE.Vector3(1,0,0));
  assert.equal(ray.intersectObject(wall, true).length, 0, "central interface aperture is not painted onto a solid slab");
  ray.ray.origin.y = wall.position.y + 0.30;
  ray.ray.origin.z = wall.position.z - 0.20;
  assert.ok(ray.intersectObject(wall, true).length > 0, "solid panel still encloses the surrounding region");
});
