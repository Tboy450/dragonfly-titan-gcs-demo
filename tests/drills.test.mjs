import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildDrill, drillAsset } from "../dist/drills.mjs";
import { buildSideCameras } from "../dist/side-cameras.mjs";
import { buildNoseCameras } from "../dist/nose-cameras.mjs";
import { buildPowerUnits } from "../dist/power-units.mjs";
import { buildIem } from "../dist/iem.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
function drills() {
  const parent = new THREE.Group();
  const both = [-1, 1].map(side => buildDrill({ parent, mesh, side }));
  parent.updateMatrixWorld(true);
  return { parent, both };
}
const find = (group, name) => { let hit = null; group.traverse(o => { if (!hit && o.name === name) hit = o; }); return hit; };
const box = o => new THREE.Box3().setFromObject(o);

test("Each drill has the LPSC 2022 fig. 2 parts", () => {
  const { both } = drills();
  for (const d of both) {
    for (const name of ["drill-head-housing", "drill-percussion-actuator", "drill-rotation-actuator", "drill-percussion-spring",
      "drill-z-rail", "drill-lead-screw", "drill-z-motor", "drill-lower-bracket", "drill-swivel", "drill-port-fitting",
      "drill-bit-tube", "drill-bit-opening", "drill-bit-crown", "drill-bit-tooth", "drill-body-mount"]) {
      assert.ok(find(d.drill, name), `${d.drill.name} has ${name}`);
    }
    assert.deepEqual([d.stage, d.head, d.port, d.leads].map(g => g.userData.inspectionLayer), ["mounts", "equipment-casings", "interfaces", "harnesses"]);
  }
});

test("The carriage rides the rail through the full stroke; only the bit turns", () => {
  const { both, parent } = drills();
  const d = both[0];
  const rail = box(find(d.stage, "drill-z-rail"));
  for (const feed of [0, 0.13]) {
    d.carriage.position.y = drillAsset.stowedY - feed;
    parent.updateMatrixWorld(true);
    const bracket = box(find(d.head, "drill-carriage-bracket"));
    assert.ok(bracket.min.y >= rail.min.y - 1e-9 && bracket.max.y <= rail.max.y + 1e-9, `bracket on the rail at feed ${feed}`);
  }
  const headBefore = find(d.head, "drill-head-housing").matrixWorld.clone();
  d.bit.rotation.y = 1.2;
  parent.updateMatrixWorld(true);
  assert.ok(find(d.head, "drill-head-housing").matrixWorld.equals(headBefore), "head does not turn with the bit");
  assert.equal(d.carriage.userData.bit, d.bit);
});

test("Stowed bits clear the ground and a full stroke stays within the published 6 cm depth", () => {
  const { both, parent } = drills();
  const ground = -0.85;
  for (const d of both) {
    const tip = () => box(d.bit).min.y;
    d.carriage.position.y = drillAsset.stowedY; parent.updateMatrixWorld(true);
    assert.ok(tip() > ground + 0.04, `stowed tip ${tip().toFixed(3)}`);
    d.carriage.position.y = drillAsset.stowedY - 0.13; parent.updateMatrixWorld(true);
    const depth = ground - tip();
    assert.ok(depth > 0.03 && depth <= drillAsset.maxDepthM + 1e-6, `drills ${(depth * 100).toFixed(1)} cm deep`);
  }
});

test("Drills sit beside the body just aft of the forward leg, inboard of the runners, clear of the rebuilt parts", () => {
  const { both } = drills();
  assert.ok(drillAsset.foreAftM >= -0.45 && drillAsset.foreAftM <= -0.34, "within the sources' 0.34-0.45 m forward of center");
  for (const d of both) {
    const b = box(d.drill);
    assert.ok(Math.abs(b.max.x) < 0.68 && Math.abs(b.min.x) < 0.68, "inboard of the runners");
    const mount = box(find(d.stage, "drill-body-mount"));
    const nearBody = Math.min(Math.abs(mount.min.x), Math.abs(mount.max.x));
    assert.ok(Math.abs(nearBody - drillAsset.bodyOuterX) < 0.002, "mounts reach the body side");
  }
  const others = [buildSampleCarousel, buildWonderwall, buildDramsAssembly, buildFrontierRadio, buildIem, buildPowerUnits, buildSideCameras, buildNoseCameras].map(build => {
    const g = new THREE.Group(); build({ parent: g, mesh }); g.updateMatrixWorld(true);
    const boxes = []; g.traverse(o => { if (o.isMesh) boxes.push(box(o)); });
    return [build.name, boxes];
  });
  for (const d of both) {
    const parts = []; d.drill.traverse(o => { if (o.isMesh) parts.push(box(o)); });
    for (const [name, boxes] of others) assert.ok(!parts.some(p => boxes.some(b => b.intersectsBox(p))), `${d.drill.name} clears ${name}`);
  }
});
