import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildPowerUnits, powerUnitsAsset } from "../dist/power-units.mjs";
import { buildIem } from "../dist/iem.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
function fixture() { const parent = new THREE.Group(); return { parent, ...buildPowerUnits({ parent, mesh }) }; }

test("Two PSUs, each with sliced connector faces, mated harness and separately hideable layers", () => {
  const { parent, units } = fixture();
  assert.equal(units.length, 2, "NASA reports both PSUs");
  assert.equal(parent.userData.assetRevision, powerUnitsAsset.revision);
  assert.equal(parent.userData.dimensionConfidence, "EST");
  for (const { unit, casing, mounts, connectors, harness } of units) {
    assert.deepEqual([casing, mounts, connectors, harness].map(g => g.userData.inspectionLayer),
      ["equipment-casings", "mounts", "interfaces", "harnesses"]);
    for (let s = 1; s <= 4; s += 1) assert.ok(casing.getObjectByName(`psu-slice-${s}-face`), `slice ${s}`);
    let plugs = 0, backshells = 0;
    connectors.traverse(o => { if (o.name === "psu-connector") plugs += 1; });
    harness.traverse(o => { if (o.name === "psu-harness-backshell") backshells += 1; });
    assert.ok(plugs >= 12 && backshells === plugs, "every connector is mated");
    unit.updateMatrixWorld(true);
    const pose = unit.matrixWorld.clone();
    harness.visible = false; connectors.visible = false; mounts.visible = false;
    unit.updateMatrixWorld(true);
    assert.ok(unit.matrixWorld.equals(pose));
  }
});

test("PSUs sit on the bay floor in their allowance, face inboard, and clear each other and the rebuilt set", () => {
  const { parent, units } = fixture();
  parent.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(parent);
  const { min, max } = powerUnitsAsset.bounds;
  for (const [i, axis] of ["x", "y", "z"].entries()) {
    assert.ok(b.min[axis] >= min[i] && b.max[axis] <= max[i], `${axis}: ${b.min[axis].toFixed(3)}..${b.max[axis].toFixed(3)}`);
  }
  assert.ok(b.min.x > -0.36 && b.min.y > -0.29 && b.max.y < 0.07, "inside the equipment-bay cavity");
  const [one, two] = units.map(u => new THREE.Box3().setFromObject(u.casing));
  assert.equal(one.intersectsBox(two), false, "the two casings do not touch");
  for (const [i, u] of units.entries()) {
    assert.ok(Math.abs(new THREE.Box3().setFromObject(u.casing).min.y - powerUnitsAsset.positions[i][1]) < 1e-6, "casing on the floor");
    const face = new THREE.Vector3();
    u.casing.getObjectByName("psu-slice-2-face").getWorldPosition(face);
    assert.ok(face.x > powerUnitsAsset.positions[i][0] + powerUnitsAsset.depthM / 2 - 0.001, "connector face points inboard");
  }
  for (const build of [buildSampleCarousel, buildWonderwall, buildDramsAssembly, buildFrontierRadio, buildIem]) {
    const g = new THREE.Group(); build({ parent: g, mesh }); g.updateMatrixWorld(true);
    assert.equal(b.intersectsBox(new THREE.Box3().setFromObject(g)), false, `clears ${build.name}`);
  }
});
