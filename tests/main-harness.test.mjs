import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildMainHarness, mainHarnessAsset as A } from "../dist/main-harness.mjs";
import { buildPowerUnits } from "../dist/power-units.mjs";
import { buildIem } from "../dist/iem.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildTwta } from "../dist/twta.mjs";
import { buildBattery } from "../dist/battery.mjs";
import { buildRotorDriveElectronics } from "../dist/rotor-drive-electronics.mjs";
import { buildNoseElectronics } from "../dist/nose-electronics.mjs";
import { buildSideCameras } from "../dist/side-cameras.mjs";
import { buildNoseCameras } from "../dist/nose-cameras.mjs";
import { buildFans, buildWarmDuct, buildTrimDevice } from "../dist/thermal-loop.mjs";
import { buildHgaGimbal } from "../dist/hga-gimbal.mjs";
import { buildAftBulkhead } from "../dist/aft-bulkhead.mjs";
import { buildNoseBulkhead } from "../dist/nose-bulkhead.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildBlowers } from "../dist/draco-plumbing.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
function build() { const parent = new THREE.Group(); const r = buildMainHarness({ parent, mesh }); parent.updateMatrixWorld(true); return { parent, ...r }; }
const bundles = (g) => { const out = []; g.traverse(o => { if (o.isMesh && o.geometry.parameters?.path) out.push(o); }); return out; };
// Sampled centerline points of a tube, with its radius, in world coordinates.
const samples = (o, n = 120) => { const out = []; for (let i = 0; i <= n; i += 1) out.push(o.geometry.parameters.path.getPoint(i / n).applyMatrix4(o.matrixWorld)); return out; };
// Boxes of another part: tubes as sampled spheres, everything else as its mesh box.
function partBoxes(builder) {
  const g = new THREE.Group(); builder({ parent: g, mesh }); g.updateMatrixWorld(true);
  const out = [];
  g.traverse(o => {
    if (!o.isMesh) return;
    const path = o.geometry.parameters?.path;
    if (path) for (const p of samples(o, 60)) out.push([o.name, new THREE.Box3().setFromCenterAndSize(p, new THREE.Vector3(1, 1, 1).multiplyScalar(2 * o.geometry.parameters.radius))]);
    else out.push([o.name, new THREE.Box3().setFromObject(o)]);
  });
  return out;
}
const units = { buildPowerUnits, buildIem, buildFrontierRadio, buildTwta, buildBattery, buildRotorDriveElectronics, buildNoseElectronics, buildSideCameras, buildNoseCameras, buildFans, buildWarmDuct, buildTrimDevice, buildHgaGimbal, buildAftBulkhead, buildNoseBulkhead, buildSampleCarousel, buildWonderwall, buildDramsAssembly, buildBlowers };

test("One trunk and a branch to each unit, silver bundles on the harness layer", () => {
  const { harness, mounts, parent } = build();
  assert.equal(harness.userData.inspectionLayer, "harnesses");
  assert.equal(mounts.userData.inspectionLayer, "mounts");
  assert.equal(parent.userData.assetRevision, A.revision);
  assert.equal(bundles(harness).length, 1 + A.branches.length);
  for (const b of A.branches) {
    const start = new THREE.Vector3(...b.points[0]);
    const trunk = new THREE.CatmullRomCurve3(A.trunk.points.map(p => new THREE.Vector3(...p)));
    let best = Infinity; for (let i = 0; i <= 400; i += 1) best = Math.min(best, trunk.getPoint(i / 400).distanceTo(start));
    const ownStart = A.branches.some(o => o !== b && o.points.some(p => new THREE.Vector3(...p).distanceTo(start) < 0.012));
    assert.ok(best < 0.012 || ownStart, `${b.name} starts on the trunk or on another branch`);
  }
  assert.ok(mounts.children.length > 8, "clamped to the floor along the way");
});

test("Branches meet the cable stubs the unit passes left", () => {
  const ends = Object.fromEntries(A.branches.map(b => [b.name, new THREE.Vector3(...b.points.at(-1))]));
  const stubEnds = (builder, re) => { const g = new THREE.Group(); builder({ parent: g, mesh }); g.updateMatrixWorld(true); const out = []; g.traverse(o => { if (o.isMesh && re.test(o.name) && o.geometry.parameters?.path) out.push(o.geometry.parameters.path.getPoint(1).applyMatrix4(o.matrixWorld)); }); return out; };
  const near = (p, list, d) => list.some(q => q.distanceTo(p) < d);
  const psu = stubEnds(buildPowerUnits, /psu-harness-cable/);
  assert.ok(near(ends["power-unit-1"], psu, 0.02) && near(ends["power-unit-2"], psu, 0.02));
  assert.ok(near(ends.iem, stubEnds(buildIem, /iem-harness-cable/), 0.02));
  assert.ok(near(ends.battery, stubEnds(buildBattery, /battery-cable/), 0.03));
  assert.ok(near(ends["twta-power-supply"], stubEnds(buildTwta, /twta-epc-bus-harness/), 0.02), "meets the TWTA power-supply cable");
  assert.ok(near(ends["antenna-gimbal-drive"], stubEnds(buildHgaGimbal, /hga-drive-harness/), 0.02), "meets the gimbal drive cable");
});

test("The harness stays on the bay floor and inside the cavity", () => {
  const { harness } = build();
  for (const o of bundles(harness)) for (const p of samples(o)) {
    const r = o.geometry.parameters.radius;
    assert.ok(p.y - r >= -0.284, `${o.name} above the floor`);
    assert.ok(Math.abs(p.x) + r <= 0.36, `${o.name} inside the side walls`);
    assert.ok(p.y < 0.07 && p.z > -1.30 && p.z < 1.0);
  }
});

test("The harness clears every rebuilt part except where a branch meets its own unit", () => {
  const { harness } = build();
  const ownUnit = { iem: "buildIem", "power-unit-1": "buildPowerUnits", "power-unit-2": "buildPowerUnits", battery: "buildBattery", radio: "buildFrontierRadio", "rde-1": "buildRotorDriveElectronics", "rde-2": "buildRotorDriveElectronics", "navigation-feb-imu": "buildNoseElectronics", "navigation-meb": "buildNoseElectronics", "starboard-down-camera": "buildSideCameras", "microscopic-camera": "buildSideCameras", "led-array": "buildSideCameras", "twta-power-supply": "buildTwta", "antenna-gimbal-drive": "buildHgaGimbal", "circulation-fans": "buildFans" };
  const hits = [];
  for (const [unitName, builder] of Object.entries(units)) {
    const boxes = partBoxes(builder);
    for (const o of bundles(harness)) {
      const name = o.name.replace("main-harness-", ""), r = o.geometry.parameters.radius;
      const end = samples(o).at(-1);
      for (const p of samples(o)) {
        // The last 3 cm of a branch may touch its own unit (the connector it plugs into).
        if (ownUnit[name] === unitName && p.distanceTo(end) < 0.03) continue;
        const ball = new THREE.Box3().setFromCenterAndSize(p, new THREE.Vector3(1, 1, 1).multiplyScalar(2 * r - 0.002));
        for (const [other, box] of boxes) if (box.intersectsBox(ball)) { hits.push(`${o.name} x ${unitName}/${other}`); break; }
      }
    }
  }
  assert.deepEqual([...new Set(hits)], []);
});
