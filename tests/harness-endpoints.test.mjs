import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as THREE from "../dist/vendor/three/three.module.min.js?v=dev";
import { buildEndpointAudit } from "../research/harness-endpoints-2026-10-23/audit.mjs";
import { buildMainHarness, mainHarnessAsset as asset } from "../dist/main-harness.mjs";
import { buildSideWall } from "../dist/side-wall.mjs";
import { buildSideCameras } from "../dist/side-cameras.mjs";
import { createInspectionVisibility } from "../dist/inspection-visibility.mjs";

const mesh = (geometry, material, position, parent) => {
  const object = new THREE.Mesh(geometry, material); object.position.fromArray(position); parent.add(object); return object;
};
function fixture(builder, extra = {}) {
  const parent = new THREE.Group(); const result = builder({ parent, mesh, ...extra }); parent.updateMatrixWorld(true); return { parent, ...result };
}
const cameraNames = ["port-down-camera", "starboard-down-camera", "microscopic-camera", "led-array"];

test("Endpoint register covers every existing branch/link and distinguishes model contact from electrical identity", () => {
  const report = buildEndpointAudit();
  assert.equal(report.routes.length, asset.branches.length + asset.crossBundles.length);
  assert.equal(new Set(report.routes.map(row => row.id)).size, report.routes.length);
  assert.deepEqual(report.missing, []);
  for (const row of report.routes) {
    assert.equal(row.confidence, "EST"); assert.equal(row.flightTopologyConfirmed, false);
    assert.ok(row.lengthM > 0 && row.start.length === 3 && row.end.length === 3);
    assert.ok(row.startAttachment.centerlineGapM <= .012, row.id + " peer attachment");
    assert.ok(row.missingSegment && row.supports && row.medium.includes("unassigned"));
  }
  for (const id of ["radio", "navigation-feb-imu", "circulation-fans"]) {
    assert.equal(report.routes.find(row => row.owner === id).status, "mating-interface-unresolved");
  }
  assert.equal(report.decorativeStrands.length, asset.strands.length);
});

test("All four lower-camera routes meet the explicit existing cable ends within one micrometre", () => {
  const report = buildEndpointAudit();
  for (const name of cameraNames) {
    const row = report.routes.find(row => row.owner === name);
    assert.equal(row.status, "geometric-contact-only");
    assert.ok(row.targetStubs[0].centerlineGapM <= .000001, name);
  }
});

test("Only three camera tails and the new port route change; other branch controls, trunk and strands remain exact", async () => {
  const original = await readFile(new URL("../archive/lower-camera-harness-2026-10-23/main-harness.mjs", import.meta.url), "utf8");
  const vendor = new URL("../dist/vendor/three/three.module.min.js?v=dev", import.meta.url).href;
  const before = (await import("data:text/javascript;base64," + Buffer.from(original.replace("./vendor/three/three.module.min.js?v=dev", vendor)).toString("base64"))).mainHarnessAsset;
  assert.deepEqual(asset.trunk, before.trunk); assert.deepEqual(asset.strands, before.strands);
  assert.deepEqual(asset.crossBundles, before.crossBundles); assert.equal(asset.clampSpacingM, before.clampSpacingM);
  assert.equal(asset.branches.length, before.branches.length + 1);
  for (const run of before.branches) {
    const current = asset.branches.find(row => row.name === run.name);
    if(run.name==='navigation-meb')continue; // Specific archive/fit guard in navigation-meb-interface.test.mjs.
    if (!cameraNames.includes(run.name)) assert.deepEqual(current, run);
    else { assert.deepEqual(current.points.slice(0, -1), run.points.slice(0, -1)); assert.equal(current.radiusM, run.radiusM); }
  }
});

function triangles(root) {
  const result = [];
  root.traverse(object => {
    if (!object.isMesh) return;
    const positions = object.geometry.attributes.position, index = object.geometry.index;
    const count = index ? index.count : positions.count;
    for (let i = 0; i < count; i += 3) {
      const vertex = j => new THREE.Vector3().fromBufferAttribute(positions, index ? index.getX(j) : j).applyMatrix4(object.matrixWorld);
      result.push(new THREE.Triangle(vertex(i), vertex(i + 1), vertex(i + 2)));
    }
  });
  return result;
}

test("New bypass uses the existing wall relief without crossing either structural panel", () => {
  const { harness, mounts } = fixture(buildMainHarness), route = harness.getObjectByName("main-harness-port-down-camera");
  const panels = [-1, 1].flatMap(side => triangles(fixture(buildSideWall, { side }).parent));
  const path = route.geometry.parameters.path, radius = route.geometry.parameters.radius, nearest = new THREE.Vector3();
  for (const point of path.getSpacedPoints(800)) for (const triangle of panels) {
    triangle.closestPointToPoint(point, nearest);
    assert.ok(point.distanceTo(nearest) >= radius - .0001, `Wall contact at ${point.toArray()}`);
  }
  const foot = new THREE.Box3().setFromObject(mounts.getObjectByName("main-harness-port-camera-support-foot"));
  assert.ok(Math.abs(foot.max.x - (-.3725)) < 1e-7, "support meets outer wall face");
  const stand = new THREE.Box3().setFromObject(mounts.getObjectByName("main-harness-port-camera-support-stand"));
  assert.ok(foot.intersectsBox(stand), "stand attaches to foot");
  const cablePoint = new THREE.Vector3(-.381, -.12, .25);
  assert.ok(Math.abs(stand.max.y - (cablePoint.y - radius)) < 1e-7, "stand supports cable underside");
});

test("Camera optical corridors remain clear of all harness tubes", () => {
  const { cameras } = fixture(buildSideCameras), { harness } = fixture(buildMainHarness);
  for (const parts of cameras) {
    const port = parts.window.userData.opticalPort;
    for (const [x, y] of [[0, 0], [.6, .6], [-.6, .6], [.6, -.6], [-.6, -.6]]) {
      const start = new THREE.Vector3(x * port.halfWidth, y * port.halfWidth, port.from).applyMatrix4(parts.group.matrixWorld);
      const direction = new THREE.Vector3(0, 0, 1).transformDirection(parts.group.matrixWorld);
      const hits = new THREE.Raycaster(start, direction, 0, port.to - port.from).intersectObject(harness, true);
      assert.deepEqual(hits.map(hit => hit.object.name), [], parts.group.name + " optical ray");
    }
  }
});

test("New unnumbered harness selector, four focuses and independent wire/mount masks restore without moving routes", () => {
  const { parent, harness, mounts } = fixture(buildMainHarness);
  assert.equal(parent.userData.inspectionTitle, "Bay harness (routing estimate)"); assert.equal(parent.userData.label, undefined);
  assert.equal(harness.children.filter(object => object.userData.inspectionLabel).length, 4);
  const controls = createInspectionVisibility({ "main-harness": parent });
  const matrices = harness.children.map(object => object.matrixWorld.toArray());
  const hidden = new Map(); controls.apply({ hiddenPartLayers: { "main-harness": ["harnesses"] } }, hidden);
  assert.equal(harness.visible, false); assert.equal(mounts.visible, true);
  for (const [object, visible] of hidden) object.visible = visible;
  hidden.clear(); controls.apply({ hiddenPartLayers: { "main-harness": ["mounts"] } }, hidden);
  assert.equal(harness.visible, true); assert.equal(mounts.visible, false);
  for (const [object, visible] of hidden) object.visible = visible;
  assert.equal(mounts.visible, true); parent.updateMatrixWorld(true);
  assert.deepEqual(harness.children.map(object => object.matrixWorld.toArray()), matrices);
});
