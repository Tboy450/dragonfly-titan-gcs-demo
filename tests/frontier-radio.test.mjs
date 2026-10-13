import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildFrontierRadio, frontierRadioAsset } from "../dist/frontier-radio.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
function fixture() { const parent = new THREE.Group(); return { parent, ...buildFrontierRadio({ parent, mesh }) }; }

test("Frontier radio keeps the published slice size, volume and four-slice stack", () => {
  const { heightM, lengthM, widthM, slicesM, publishedVolumeCm3, publishedMassKg } = frontierRadioAsset;
  assert.ok(Math.abs(heightM - 0.1016) < 1e-9 && Math.abs(lengthM - 0.1524) < 1e-9, "4 x 6 inch slice face");
  assert.ok(Math.abs(widthM - heightM) < 0.003, "the connector face is about square, as photographed");
  assert.ok(widthM * heightM * lengthM * 1e6 <= publishedVolumeCm3, "not larger than Frontier's published volume");
  assert.equal(publishedMassKg, 2.1);
  assert.equal(slicesM.length, 4);
  assert.ok(Math.abs(slicesM.reduce((a, b) => a + b, 0) - widthM) < 0.001, "slices fill the stack width");
  const { parent, slices } = fixture();
  assert.equal(parent.userData.assetRevision, frontierRadioAsset.revision);
  assert.equal(parent.userData.dimensionConfidence, "PUB+EST");
  for (let i = 1; i <= 4; i += 1) assert.ok(slices.getObjectByName(`frontier-radio-slice-${i}`));
});

test("Frontier radio layers hide independently without moving the installed radio", () => {
  const { assembly, slices, mounts, connectors, lines } = fixture();
  assert.deepEqual([slices, mounts, connectors, lines].map(g => g.userData.inspectionLayer),
    ["equipment-casings", "mounts", "interfaces", "harnesses"]);
  for (const label of ["J11", "J12", "J21", "J22", "J23", "J24", "J31", "J32-cap", "J51"]) {
    assert.ok(connectors.getObjectByName(`frontier-radio-${label}`), `${label} is modeled`);
  }
  assembly.updateMatrixWorld(true);
  const pose = assembly.matrixWorld.clone();
  connectors.visible = false; lines.visible = false; mounts.visible = false;
  assembly.updateMatrixWorld(true);
  assert.ok(assembly.matrixWorld.equals(pose));
  assert.equal(slices.visible, true);
});

test("Frontier radio sits on the bay floor inside its allowance, connectors inboard, clear of the rebuilt set", () => {
  const { parent, connectors, mounts } = fixture();
  parent.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(parent);
  const { min, max } = frontierRadioAsset.bounds;
  for (const [i, axis] of ["x", "y", "z"].entries()) {
    assert.ok(b.min[axis] >= min[i] && b.max[axis] <= max[i], `${axis}: ${b.min[axis].toFixed(3)}..${b.max[axis].toFixed(3)}`);
  }
  assert.ok(b.max.x < 0.36 && b.min.y > -0.29 && b.max.y < 0.07, "inside the equipment-bay cavity");
  assert.ok(Math.abs(new THREE.Box3().setFromObject(mounts).min.y - frontierRadioAsset.position[1]) < 1e-6, "feet rest on the floor");
  const j11 = new THREE.Vector3();
  connectors.getObjectByName("frontier-radio-J11").getWorldPosition(j11);
  assert.ok(j11.x < frontierRadioAsset.position[0] - frontierRadioAsset.lengthM / 2, "connector face points inboard");
  const neighbors = [buildSampleCarousel, buildWonderwall, buildDramsAssembly].map(build => {
    const g = new THREE.Group(); build({ parent: g, mesh }); g.updateMatrixWorld(true); return new THREE.Box3().setFromObject(g);
  });
  for (const other of neighbors) assert.equal(b.intersectsBox(other), false, "clears carousel, Wonderwall and DraMS");
});
