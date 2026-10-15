import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "../dist/vendor/three/three.module.min.js";
import { buildHgaGimbal, hgaAsset, gimbalAngles, dishTransform, clearsAttic } from "../dist/hga-gimbal.mjs";
import { buildTwta } from "../dist/twta.mjs";
import { buildFrontierRadio } from "../dist/frontier-radio.mjs";
import { buildIem } from "../dist/iem.mjs";
import { buildPowerUnits } from "../dist/power-units.mjs";
import { buildSideCameras } from "../dist/side-cameras.mjs";
import { buildNoseCameras } from "../dist/nose-cameras.mjs";
import { buildDrill } from "../dist/drills.mjs";
import { buildSampleLines, buildBlowers } from "../dist/draco-plumbing.mjs";
import { buildFans, buildWarmDuct, buildTrimDevice } from "../dist/thermal-loop.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";
import { buildDramsAssembly } from "../dist/drams-assembly.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";

function mesh(geometry, material, position, parent) {
  const part = new THREE.Mesh(geometry, material); part.position.fromArray(position); parent.add(part); return part;
}
const find = (group, name) => { let hit = null; group.traverse(o => { if (!hit && o.name === name) hit = o; }); return hit; };
const boxOf = object => { object.updateWorldMatrix(true, true); return new THREE.Box3().setFromObject(object); };
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
function build() {
  const parent = new THREE.Group(), head = new THREE.Group();
  parent.add(head);
  const gimbal = buildHgaGimbal({ parent, mesh, head });
  parent.updateMatrixWorld(true);
  return { parent, head, gimbal };
}
const R = hgaAsset.dishDiameterM / 2;

test("The gimbal sits forward of the stowed dish, just aft of the attic (ICES-2023 p. 2, figs. 1 and 3)", () => {
  const [hx, , hz] = hgaAsset.hinge, dish = hgaAsset.stowedDishCenter;
  assert.equal(hx, 0, "on the centerline");
  assert.ok(hz < dish[2] - R, "forward of the dish rim");
  assert.ok(hz > hgaAsset.attic.aftZ, "behind the attic's aft wall");
  assert.ok(Math.abs(Math.hypot(...hgaAsset.headLocal.map((v, i) => i === 1 ? 0 : v)) - hgaAsset.armLengthM) < 1e-9, "arm length is the hinge-to-dish distance");
  const { parent } = build();
  const dome = boxOf(find(parent, "hga-rohacell-dome"));
  assert.ok(dome.max.z < dish[2] - R + 0.12 && dome.min.z > hgaAsset.attic.aftZ, "foam dome between the dish and the attic");
});

test("Internal portion under the deck, actuators above it under a 5 cm foam dome (ICES-2020 p. 5)", () => {
  const { gimbal } = build();
  assert.ok(boxOf(gimbal.drive).min.y < hgaAsset.deckY && boxOf(find(gimbal.drive, "hga-azimuth-bearing-housing")).max.y <= hgaAsset.deckY + 1e-6, "bearing and drive under the deck");
  const drum = boxOf(find(gimbal.azCasings, "hga-elevation-actuator"));
  assert.ok(drum.min.y > hgaAsset.foamTop, "elevation actuator above the deck foam");
  assert.ok(Math.abs(hgaAsset.domeRadiusM - (drum.max.y - drum.min.y) / 2 - 0.05) < 0.011, "dome about 5 cm thicker than the actuator");
  assert.equal(find(gimbal.dome, "hga-rohacell-dome").userData.shell, true, "dome is see-through in Internal");
});

test("Stowed: the dish lies flat on its launch lock and two flight locks", () => {
  const { parent, head } = build();
  const c = hgaAsset.stowedDishCenter;
  assert.ok(head.position.distanceTo(new THREE.Vector3(...c)) < 1e-9, "dish center at the stowed position");
  const under = c[1] - hgaAsset.dishThicknessM / 2;
  const cup = boxOf(find(parent, "hga-launch-lock-cup"));
  assert.ok(Math.abs(cup.max.y - under) < 1e-6, "launch-lock cup meets the dish underside");
  assert.ok(Math.hypot(hgaAsset.launchLock[0] - c[0], hgaAsset.launchLock[1] - c[2]) < R, "launch lock under the dish, opposite the hinge");
  let locks = 0;
  parent.traverse(o => {
    if (o.name !== "hga-flight-lock-jaw") return;
    locks += 1;
    const b = boxOf(o), center = b.getCenter(new THREE.Vector3());
    assert.ok(Math.hypot(center.x - c[0], center.z - c[2]) < R && b.max.y < under, "flight lock under the dish");
  });
  assert.equal(locks, 2, "a flight lock on either side of the launch lock");
});

test("Raised, the dish face points at the target; the arm points away from it", () => {
  const n = new THREE.Vector3();
  for (const elevation of [25, 40, 55, 70, 85]) {
    for (let k = 0; k < 24; k += 1) {
      const az = k / 24 * Math.PI * 2, e = THREE.MathUtils.degToRad(elevation);
      const target = new THREE.Vector3(Math.cos(e) * Math.sin(az), Math.sin(e), Math.cos(e) * Math.cos(az));
      const { theta, phi, limited } = gimbalAngles(target);
      assert.ok(theta >= 0 && theta <= Math.PI / 2 + 1e-9, "elevation within 0-90 degrees");
      const { quaternion } = dishTransform(phi, theta);
      n.set(0, 1, 0).applyQuaternion(quaternion);
      if (!limited) assert.ok(n.dot(target) > 0.9999, `points at ${elevation} deg, azimuth ${(az * 180 / Math.PI).toFixed(0)}`);
      else assert.ok(Math.abs(n.y - target.y) < 1e-6, "a limited azimuth keeps the elevation");
    }
  }
});

test("The dish never swings into the attic, at any deploy stage", () => {
  const { gimbal } = build();
  for (let k = 0; k < 36; k += 1) {
    const az = k / 36 * Math.PI * 2, e = THREE.MathUtils.degToRad(55);
    const target = new THREE.Vector3(Math.cos(e) * Math.sin(az), Math.sin(e), Math.cos(e) * Math.cos(az));
    for (const deployed of [0, 0.25, 0.5, 0.75, 1]) {
      const { phi, theta } = gimbal.pose(deployed, target);
      assert.ok(clearsAttic(phi, theta), `clear at azimuth ${k * 10} deg, deployed ${deployed}`);
    }
  }
});

test("Layer groups", () => {
  const { gimbal } = build();
  assert.deepEqual([gimbal.drive, gimbal.mounts, gimbal.ports, gimbal.harness, gimbal.azCasings, gimbal.dome, gimbal.arm, gimbal.feed].map(g => g.userData.inspectionLayer),
    ["equipment-casings", "mounts", "interfaces", "harnesses", "equipment-casings", "insulation", "equipment-casings", "interfaces"]);
});

test("Stowed gimbal clears every rebuilt part (the TWTA waveguide meets only its rotary-joint flange)", () => {
  const { parent } = build();
  const mine = boxes(parent);
  const builders = [buildFrontierRadio, buildIem, buildPowerUnits, buildSideCameras, buildNoseCameras, buildSampleCarousel, buildDramsAssembly, buildWonderwall, buildFans, buildWarmDuct, buildTrimDevice, buildBlowers, buildSampleLines, buildTwta];
  const others = builders.map(b => { const g = new THREE.Group(); b({ parent: g, mesh }); return [b.name, boxes(g)]; });
  const d = new THREE.Group(); for (const side of [-1, 1]) buildDrill({ parent: d, mesh, side }); others.push(["buildDrill", boxes(d)]);
  for (const [name, other] of others) {
    for (const [mn, mb] of mine) {
      const hits = other.filter(([, b]) => b.intersectsBox(mb));
      const allowed = hits.every(([on]) => mn === "hga-rotary-joint-flange" && /twta-waveguide-(run|mitered-bend|joint-flange)/.test(on));
      assert.ok(allowed, `${mn} clears ${name}${hits.length ? ` (${hits.map(h => h[0]).join(", ")})` : ""}`);
    }
  }
});
