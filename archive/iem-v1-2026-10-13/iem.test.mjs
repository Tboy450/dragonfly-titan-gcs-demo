import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildIem, iemAsset } from "../dist/iem.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
function fixture() { const parent = new THREE.Group(); return { parent, ...buildIem({ parent, mesh }) }; }

test("IEM has the photographed card face, finned top and separately hideable layers", () => {
  const { parent, assembly, chassis, mounts, connectors, harness } = fixture();
  assert.equal(parent.userData.assetRevision, iemAsset.revision);
  assert.equal(parent.userData.dimensionConfidence, "EST");
  assert.deepEqual([chassis, mounts, connectors, harness].map(g => g.userData.inspectionLayer),
    ["equipment-casings", "mounts", "interfaces", "harnesses"]);
  for (let c = 1; c <= iemAsset.cardCount; c += 1) {
    assert.ok(chassis.getObjectByName(`iem-card-${c}-front`), `card ${c} front`);
    assert.ok(connectors.getObjectByName(`iem-card-${c}-micro-d`), `card ${c} has a connector`);
  }
  let fins = 0; chassis.traverse(o => { if (o.name === "iem-top-fin") fins += 1; });
  assert.ok(fins > 20, "dense fins on the top");
  let backshells = 0, plugs = 0;
  harness.traverse(o => { if (o.name === "iem-harness-backshell") backshells += 1; });
  connectors.traverse(o => { if (o.isMesh) plugs += 1; });
  assert.equal(backshells, plugs, "every connector has a mated harness backshell");
  assembly.updateMatrixWorld(true);
  const pose = assembly.matrixWorld.clone();
  harness.visible = false; connectors.visible = false; mounts.visible = false;
  assembly.updateMatrixWorld(true);
  assert.ok(assembly.matrixWorld.equals(pose));
});

test("IEM sits on the bay floor in its allowance, faces inboard and clears the rebuilt set", () => {
  const { parent, chassis } = fixture();
  parent.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(parent);
  const { min, max } = iemAsset.bounds;
  for (const [i, axis] of ["x", "y", "z"].entries()) {
    assert.ok(b.min[axis] >= min[i] && b.max[axis] <= max[i], `${axis}: ${b.min[axis].toFixed(3)}..${b.max[axis].toFixed(3)}`);
  }
  assert.ok(b.max.x < 0.36 && b.min.y > -0.29 && b.max.y < 0.07, "inside the equipment-bay cavity");
  assert.ok(Math.abs(new THREE.Box3().setFromObject(chassis).min.y - iemAsset.position[1]) < 1e-6, "chassis rests on the floor");
  const card = new THREE.Vector3();
  chassis.getObjectByName("iem-card-1-front").getWorldPosition(card);
  assert.ok(card.x < iemAsset.position[0] - iemAsset.depthM / 2 + 0.001, "card face points inboard");
  for (const build of [buildSampleCarousel, buildWonderwall, buildDramsAssembly, buildFrontierRadio]) {
    const g = new THREE.Group(); build({ parent: g, mesh }); g.updateMatrixWorld(true);
    assert.equal(b.intersectsBox(new THREE.Box3().setFromObject(g)), false, `clears ${build.name}`);
  }
});
