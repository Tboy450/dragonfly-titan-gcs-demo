import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildFans, buildWarmDuct, buildTrimDevice, airLoopPaths, thermalLoopAsset } from "../dist/thermal-loop.mjs";
import { buildSampleLines, buildBlowers } from "../dist/draco-plumbing.mjs";
import { buildDrill } from "../dist/drills.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";
import { buildSideCameras } from "../dist/side-cameras.mjs";
import { buildNoseCameras } from "../dist/nose-cameras.mjs";
import { buildPowerUnits } from "../dist/power-units.mjs";
import { buildIem } from "../dist/iem.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
const find = (group, name) => { let hit = null; group.traverse(o => { if (!hit && o.name === name) hit = o; }); return hit; };
// Solid parts as boxes; tubes as points sampled along their path (a tube's box is its whole route).
const boxes = group => {
  const out = []; group.updateMatrixWorld(true);
  group.traverse(o => {
    if (!o.isMesh) return;
    const path = o.geometry.parameters?.path;
    if (path) for (let i = 0; i <= 200; i += 1) out.push([o.name, new THREE.Box3().setFromCenterAndSize(path.getPoint(i / 200), new THREE.Vector3(1, 1, 1).multiplyScalar(2 * o.geometry.parameters.radius))]);
    else out.push([o.name, new THREE.Box3().setFromObject(o)]);
  });
  return out;
};
function build() {
  const parent = new THREE.Group();
  const fans = buildFans({ parent, mesh }), duct = buildWarmDuct({ parent, mesh }), trim = buildTrimDevice({ parent, mesh });
  parent.updateMatrixWorld(true);
  return { parent, fans, duct, trim };
}

test("Two fans (A and B) side by side at the MMRTG end, feeding the duct", () => {
  const { fans } = build();
  assert.equal(fans.rotors.length, 2, "Fan-A and Fan-B (TFAWS 2023)");
  for (const name of ["fan-a-housing", "fan-b-housing", "fan-mmrtg-adapter-duct"]) assert.ok(find(fans.group, name), name);
  const [a, b] = thermalLoopAsset.fans.centers;
  assert.ok(a[0] < 0 && b[0] > 0 && a[2] === b[2], "side by side across the centerline");
  assert.ok(a[2] > thermalLoopAsset.duct.back, "aft of the duct, at the MMRTG end");
});

test("The warm duct runs the centerline from the fans to the nose and opens into the body", () => {
  const { duct } = build();
  const d = thermalLoopAsset.duct;
  assert.ok(Math.abs(d.width - 0.14) < 1e-9, "0.14 m wide, from the slide 3 plan view");
  const run = new THREE.Box3().setFromObject(find(duct.group, "warm-duct-run"));
  assert.ok(Math.abs(run.min.x + run.max.x) < 1e-9, "on the centerline");
  assert.ok(run.min.y > -0.345 && run.max.y < -0.25, "under the equipment floor, inside the foam");
  const outlet = new THREE.Box3().setFromObject(find(duct.group, "warm-duct-nose-outlet"));
  assert.ok(outlet.max.y > run.max.y + 0.05 && outlet.min.z < d.front, "turns up into the body below the nose");
});

test("The trim device is a cold bypass duct under the belly between fore and aft diverter flaps", () => {
  const { trim } = build();
  const cold = new THREE.Box3().setFromObject(find(trim.group, "cold-duct-channel"));
  assert.ok(cold.max.y <= thermalLoopAsset.bellyY + 1e-9, "outside the foam, exposed under the belly");
  assert.equal(trim.flaps.length, 2, "front and aft diverter flaps (TFAWS 2024)");
  const { front, aft } = thermalLoopAsset.diverters;
  assert.ok(front > -0.75 && aft < 0.84, "inboard of the forward and aft leg/arm attachments");
  assert.ok(cold.min.z < front + 0.1 && cold.max.z > aft - 0.1, "spans between the diverters");
  assert.deepEqual([trim.ductLayer, trim.housings, trim.valves, trim.actuators].map(g => g.userData.inspectionLayer),
    ["equipment-casings", "insulation", "interfaces", "equipment-casings"]);
});

test("Air paths: the main loop passes the fans and duct; the bypass runs forward through the cold duct", () => {
  const { main, bypass } = airLoopPaths();
  const near = (curve, point, tolerance) => { let best = Infinity; for (let i = 0; i <= 400; i += 1) best = Math.min(best, curve.getPoint(i / 400).distanceTo(point)); return best < tolerance; };
  const [, fy, fz] = thermalLoopAsset.fans.centers[0];
  assert.ok(near(main, new THREE.Vector3(0, fy, fz), 0.01), "through the fans");
  assert.ok(near(main, new THREE.Vector3(0, thermalLoopAsset.duct.y, 0), 0.01), "along the warm duct");
  const c = thermalLoopAsset.coldDuct;
  assert.ok(near(bypass, new THREE.Vector3(0, c.y, 0), 0.01), "through the cold duct");
  assert.ok(bypass.getPoint(0).z > bypass.getPoint(1).z, "flows forward, as in TFAWS 2023 slide 4");
});

test("Fans, ducts and trim device clear every rebuilt part", () => {
  const { parent } = build();
  const mine = boxes(parent);
  const builders = [buildSampleCarousel, buildWonderwall, buildDramsAssembly, buildFrontierRadio, buildIem, buildPowerUnits, buildSideCameras, buildNoseCameras];
  const others = builders.map(b => { const g = new THREE.Group(); b({ parent: g, mesh }); return [b.name, boxes(g)]; });
  const d = new THREE.Group(); for (const side of [-1, 1]) buildDrill({ parent: d, mesh, side }); others.push(["buildDrill", boxes(d)]);
  const p = new THREE.Group(); buildSampleLines({ parent: p, mesh }); buildBlowers({ parent: p, mesh }); others.push(["draco-plumbing", boxes(p)]);
  for (const [name, other] of others) {
    for (const [mn, mb] of mine) {
      const hit = other.find(([, b]) => b.intersectsBox(mb));
      assert.ok(!hit, `${mn} clears ${name}${hit ? ` (${hit[0]})` : ""}`);
    }
  }
});
