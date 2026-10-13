import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildPowerUnits, powerUnitsAsset } from "../dist/power-units.mjs";
import { buildIem, iemAsset } from "../dist/iem.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
function fixture() { const parent = new THREE.Group(); return { parent, ...buildPowerUnits({ parent, mesh }) }; }
const count = (group, name) => { let n = 0; group.traverse(o => { if (o.name.startsWith(name)) n += 1; }); return n; };

test("Two PSUs with the photographed face: slices, ribs, mapped D-subs and a mated harness", () => {
  const { parent, units } = fixture();
  assert.equal(units.length, 2, "NASA reports both PSUs");
  assert.equal(parent.userData.assetRevision, powerUnitsAsset.revision);
  assert.equal(parent.userData.dimensionConfidence, "EST");
  for (const { unit, casing, mounts, connectors, harness } of units) {
    assert.deepEqual([casing, mounts, connectors, harness].map(g => g.userData.inspectionLayer),
      ["equipment-casings", "mounts", "interfaces", "harnesses"]);
    assert.equal(count(casing, "psu-slice-divider"), 7, "eight slices");
    assert.equal(count(casing, "psu-face-rib"), 2);
    assert.equal(count(connectors, "psu-dsub-B-flange"), 7, "seven large 25-way D-subs as photographed (four left, three lower right)");
    assert.equal(count(connectors, "psu-uncapped-port"), 1);
    const mated = count(connectors, "psu-dsub-") / 2 + count(connectors, "psu-small-") + count(connectors, "psu-dark-");
    assert.equal(count(harness, "psu-harness-backshell"), mated, "every connector except the port is mated");
    // The upper right of the face is empty in the photo.
    for (const o of connectors.children) {
      const local = o.position;
      assert.ok(!(local.x < -0.02 && local.y > 0.15), `${o.name} stays out of the empty upper right`);
    }
    unit.updateMatrixWorld(true);
    const pose = unit.matrixWorld.clone();
    harness.visible = false; connectors.visible = false; mounts.visible = false;
    unit.updateMatrixWorld(true);
    assert.ok(unit.matrixWorld.equals(pose));
  }
});

test("PSU 1 sits beside the IEM on the same wall, both PSUs face inboard and clear the rebuilt set", () => {
  const { parent, units } = fixture();
  parent.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(parent);
  const { min, max } = powerUnitsAsset.bounds;
  for (const [i, axis] of ["x", "y", "z"].entries()) {
    assert.ok(b.min[axis] >= min[i] && b.max[axis] <= max[i], `${axis}: ${b.min[axis].toFixed(3)}..${b.max[axis].toFixed(3)}`);
  }
  for (const [i, u] of units.entries()) {
    const casing = new THREE.Box3().setFromObject(u.casing);
    assert.ok(Math.abs(casing.min.y - powerUnitsAsset.positions[i][1]) < 1e-6, "casing on the floor");
    assert.ok(casing.min.x > -0.361 && casing.max.x < 0.361, "inside the bay walls");
    const face = new THREE.Vector3();
    u.casing.getObjectByName("psu-slice-faces").getWorldPosition(face);
    const center = powerUnitsAsset.positions[i][0];
    assert.ok(Math.sign(face.x - center) === -Math.sign(center), "connector face points inboard");
  }
  const iem = new THREE.Group(); buildIem({ parent: iem, mesh }); iem.updateMatrixWorld(true);
  const iemBox = new THREE.Box3().setFromObject(iem);
  const psu1 = new THREE.Box3().setFromObject(units[0].casing);
  assert.equal(Math.sign(powerUnitsAsset.positions[0][0]), Math.sign(iemAsset.position[0]), "same wall as the IEM");
  const gap = psu1.min.z - new THREE.Box3().setFromObject(iem.children[0].children[0]).max.z;
  assert.ok(gap > 0.01 && gap < 0.12, `beside the IEM, ${gap.toFixed(3)} m apart`);
  const others = [buildSampleCarousel, buildWonderwall, buildDramsAssembly, buildFrontierRadio].map(build => {
    const g = new THREE.Group(); build({ parent: g, mesh }); g.updateMatrixWorld(true);
    return [build.name, new THREE.Box3().setFromObject(g)];
  }).concat([["buildIem", iemBox]]);
  for (const [n, u] of units.entries()) {
    const box = new THREE.Box3().setFromObject(u.unit);
    for (const [name, other] of others) assert.equal(box.intersectsBox(other), false, `PSU ${n + 1} clears ${name}`);
  }
});
