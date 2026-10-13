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
const count = (group, name) => { let n = 0; group.traverse(o => { if (o.name === name || o.name.startsWith(name)) n += 1; }); return n; };

test("IEM matches the photographed details: fins parallel to the face, windowed face plate, mated Micro-Ds", () => {
  const { parent, assembly, chassis, mounts, connectors, harness } = fixture();
  assert.equal(parent.userData.assetRevision, iemAsset.revision);
  assert.equal(parent.userData.dimensionConfidence, "EST");
  assert.deepEqual([chassis, mounts, connectors, harness].map(g => g.userData.inspectionLayer),
    ["equipment-casings", "mounts", "interfaces", "harnesses"]);
  const fin = chassis.getObjectByName("iem-top-fin");
  assert.ok(fin.geometry.parameters.width > fin.geometry.parameters.depth * 50, "fins run across the face width");
  assert.ok(count(chassis, "iem-top-fin") > 20 && count(chassis, "iem-top-fastener") >= 20);
  assert.ok(count(chassis, "iem-face-screw") > 30, "face plate fastened round its edge");
  assert.ok(count(chassis, "iem-connector-window") >= 12, "two rows of connector windows");
  const plugs = count(connectors, "iem-micro-d-");
  assert.ok(plugs >= 20);
  assert.equal(count(harness, "iem-harness-backshell"), plugs, "every connector is mated");
  assert.equal(count(harness, "iem-harness-label"), plugs, "every cable is labeled");
  assert.ok(mounts.getObjectByName("iem-ground-strap-braid"), "copper ground strap");
  for (const o of connectors.children) {
    const size = Number(o.name.split("-").pop());
    assert.ok([15, 25, 37, 51].includes(size), "standard Micro-D sizes only");
  }
  assembly.updateMatrixWorld(true);
  const pose = assembly.matrixWorld.clone();
  harness.visible = false; connectors.visible = false; mounts.visible = false;
  assembly.updateMatrixWorld(true);
  assert.ok(assembly.matrixWorld.equals(pose));
});

test("IEM sits on the floor against the port wall, faces inboard and clears the rebuilt set", () => {
  const { parent, chassis } = fixture();
  parent.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(parent);
  const { min, max } = iemAsset.bounds;
  for (const [i, axis] of ["x", "y", "z"].entries()) {
    assert.ok(b.min[axis] >= min[i] && b.max[axis] <= max[i], `${axis}: ${b.min[axis].toFixed(3)}..${b.max[axis].toFixed(3)}`);
  }
  assert.ok(b.min.x > -0.366 && b.min.y > -0.29 && b.max.y < 0.07, "inside the equipment-bay cavity");
  assert.ok(Math.abs(new THREE.Box3().setFromObject(chassis).min.y - iemAsset.position[1]) < 1e-6, "chassis rests on the floor");
  const plate = new THREE.Vector3();
  chassis.getObjectByName("iem-face-plate").getWorldPosition(plate);
  assert.ok(plate.x > iemAsset.position[0] + iemAsset.depthM / 2 - 0.001, "face plate points inboard");
  for (const build of [buildSampleCarousel, buildWonderwall, buildDramsAssembly, buildFrontierRadio]) {
    const g = new THREE.Group(); build({ parent: g, mesh }); g.updateMatrixWorld(true);
    assert.equal(b.intersectsBox(new THREE.Box3().setFromObject(g)), false, `clears ${build.name}`);
  }
});
