import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildBattery, batteryAsset } from "../dist/battery.mjs";
import { buildTwta } from "../dist/twta.mjs";
import { buildHgaGimbal } from "../dist/hga-gimbal.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildIem } from "../dist/iem.mjs";
import { buildPowerUnits } from "../dist/power-units.mjs";
import { buildSideCameras } from "../dist/side-cameras.mjs";
import { buildNoseCameras } from "../dist/nose-cameras.mjs";
import { buildDrill } from "../dist/drills.mjs";
import { buildSampleLines, buildBlowers } from "../dist/draco-plumbing.mjs";
import { buildFans, buildWarmDuct, buildTrimDevice, thermalLoopAsset } from "../dist/thermal-loop.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
const count = (group, re) => { let n = 0; group.traverse(o => { if (o.isMesh && re.test(o.name)) n += 1; }); return n; };
const boxOf = o => { o.updateWorldMatrix(true, true); return new THREE.Box3().setFromObject(o); };
const boxes = group => {
  const out = []; group.updateMatrixWorld(true);
  group.traverse(o => {
    if (!o.isMesh) return;
    const path = o.geometry.parameters?.path;
    if (path) for (let i = 0; i <= 200; i += 1) out.push([o.name, new THREE.Box3().setFromCenterAndSize(path.getPoint(i / 200).applyMatrix4(o.matrixWorld), new THREE.Vector3(1, 1, 1).multiplyScalar(2 * o.geometry.parameters.radius))]);
    else out.push([o.name, new THREE.Box3().setFromObject(o)]);
  });
  return out;
};
function build() { const parent = new THREE.Group(); const battery = buildBattery({ parent, mesh }); parent.updateMatrixWorld(true); return { parent, battery }; }

test("24 cells of the size that matches 134 Ah, GS Yuasa and the published 11.5 kWh", () => {
  const { battery } = build();
  assert.equal(count(battery.cells, /^battery-cell-\d+$/), batteryAsset.cellCount);
  assert.equal(batteryAsset.cellCount, 24, "ICES-2022-256: a 24-cell battery system");
  const nameplate = batteryAsset.cellCount * batteryAsset.cell.wh / 1000;
  assert.ok(Math.abs(nameplate - batteryAsset.publishedKwh) / batteryAsset.publishedKwh < 0.05, `24 x 496 Wh = ${nameplate.toFixed(1)} kWh`);
  const cell = boxOf(battery.cells.children.find(o => o.name === "battery-cell-1"));
  const size = cell.getSize(new THREE.Vector3());
  assert.ok(Math.abs(size.x - 0.13) < 1e-6 && Math.abs(size.z - 0.05) < 1e-6 && Math.abs(size.y - 0.271) < 1e-6, "130 x 50 x 271 mm, upright");
  const [mx, my, mz] = batteryAsset.testModuleM;
  assert.ok(3 * 0.13 <= mx && 3 * 0.05 <= my && 0.271 <= mz, "APL's 9-cell test module holds three by three of these cells");
});

test("Placed across the bay forward of the aft arm roots, on pads, under the deck and clear of the duct", () => {
  const { battery } = build();
  const all = boxOf(battery.assembly), body = boxOf(battery.covers).union(boxOf(battery.mounts));
  assert.ok(Math.abs(all.min.y - batteryAsset.floorY) < 1e-6, "pads on the bay floor");
  assert.ok(all.max.y < 0.07, "under the top deck");
  assert.ok(body.min.z > 0.33 && body.max.z < 0.79 && Math.abs(body.min.x) < 0.34 && body.max.x < 0.34, "inside the block in the TFAWS 2023 plan view");
  const d = thermalLoopAsset.duct, ductTop = d.y + d.height / 2;
  const base = boxOf(battery.mounts.children.find(o => o.name === "battery-base-plate"));
  assert.ok(base.min.y > ductTop, "base plate above the warm duct");
  battery.mounts.traverse(o => { if (o.name === "battery-mounting-pad") assert.ok(Math.abs(boxOf(o).getCenter(new THREE.Vector3()).x) > d.width / 2, "pads beside the duct"); });
});

test("Inside: fin plates between the rows, heat pipes in three directions, bus bars; fans on the end walls", () => {
  const { battery } = build();
  assert.equal(count(battery.cells, /^battery-fin-plate$/), batteryAsset.rows + 1);
  for (const axis of ["x", "y", "z"]) assert.ok(count(battery.cells, new RegExp(`^battery-heat-pipe-${axis}$`)) > 0, `heat pipes along ${axis}`);
  assert.ok(count(battery.bus, /^battery-bus-(bar|link)$/) >= batteryAsset.cellCount - 1, "enough straps for a series string");
  assert.equal(count(battery.covers, /^battery-fan-2in$/), 6, "six 2 in fans, as on the test module");
  assert.equal(count(battery.covers, /^battery-fan-1in$/), 8, "eight 1 in fans");
  const enclosure = boxOf(battery.covers), cellsBox = boxOf(battery.cells);
  assert.ok(enclosure.containsBox(cellsBox), "cells inside the enclosure");
  assert.equal(battery.lid.userData.shell, true, "lid see-through in Internal");
});

test("Layer groups", () => {
  const { battery } = build();
  assert.deepEqual([battery.mounts, battery.covers, battery.cells, battery.bus, battery.ports].map(g => g.userData.inspectionLayer),
    ["mounts", "equipment-covers", "equipment-casings", "harnesses", "interfaces"]);
});

test("The battery clears every rebuilt part", () => {
  const { parent } = build();
  const mine = boxes(parent);
  const builders = [buildTwta, buildHgaGimbal, buildFrontierRadio, buildIem, buildPowerUnits, buildSideCameras, buildNoseCameras, buildSampleCarousel, buildDramsAssembly, buildWonderwall, buildFans, buildWarmDuct, buildTrimDevice, buildBlowers, buildSampleLines];
  const others = builders.map(b => { const g = new THREE.Group(); b({ parent: g, mesh }); return [b.name, boxes(g)]; });
  const d = new THREE.Group(); for (const side of [-1, 1]) buildDrill({ parent: d, mesh, side }); others.push(["buildDrill", boxes(d)]);
  for (const [name, other] of others) {
    for (const [mn, mb] of mine) {
      const hit = other.find(([, b]) => b.intersectsBox(mb));
      assert.ok(!hit, `${mn} clears ${name}${hit ? ` (${hit[0]})` : ""}`);
    }
  }
});
