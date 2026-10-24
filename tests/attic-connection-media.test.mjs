import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as THREE from "../dist/vendor/three/three.module.min.js?v=dev";
import { buildDramsAssembly, dramsConnectionAsset } from "../dist/drams-assembly.mjs";
import { buildSampleCarousel } from "../dist/sample-carousel.mjs";
import { buildWonderwall } from "../dist/wonderwall.mjs";
import { createInspectionVisibility, applyInspectionAccessPreset } from "../dist/inspection-visibility.mjs";
import { atticEndpointAudit } from "../research/attic-connection-media-2026-10-23/audit.mjs";

const mesh = (geometry, material, at, parent) => { const object = new THREE.Mesh(geometry, material); object.position.fromArray(at); parent.add(object); return object; };
const fixture = builder => { const parent = new THREE.Group(); const result = builder({ parent, mesh }); parent.updateMatrixWorld(true); return { parent, ...result }; };
async function archived(file) {
  let source = await readFile(new URL(`../archive/attic-connection-media-2026-10-23/${file}`, import.meta.url), "utf8");
  for (const relative of ["./vendor/three/three.module.min.js?v=dev", "./wonderwall.mjs?v=dev"]) {
    source = source.replace(relative, new URL(`../dist/${relative.slice(2)}`, import.meta.url).href);
  }
  return import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
}
function manifest(root, exclude = () => false) {
  const rows = []; root.updateMatrixWorld(true);
  root.traverse(object => {
    if (!object.isMesh || exclude(object)) return;
    rows.push(JSON.stringify({ name: object.name, matrix: object.matrixWorld.toArray(),
      positions: Array.from(object.geometry.attributes.position.array), index: object.geometry.index ? Array.from(object.geometry.index.array) : null,
      instances: object.instanceMatrix ? Array.from(object.instanceMatrix.array) : null,
      color: object.material.color?.getHex(), roughness: object.material.roughness, metalness: object.material.metalness }));
  });
  return rows.sort();
}

test("Attic register tracks all eight examples without claiming a circuit, flight medium or main trunk", () => {
  const report = atticEndpointAudit();
  assert.equal(report.rows.length, 8); assert.equal(new Set(report.rows.map(row => row.id)).size, 8);
  assert.equal(report.rows.filter(row => row.medium === "electrical-example").length, 2);
  assert.equal(report.rows.filter(row => row.medium === "gas-sample-example").length, 3);
  assert.equal(report.rows.filter(row => row.medium === "unclassified").length, 3);
  for (const row of report.rows) {
    assert.equal(row.confidence, "EST"); assert.equal(row.flightMatingConfirmed, false);
    assert.equal(row.start.length, 3); assert.equal(row.end.length, 3); assert.ok(row.modeledLengthM > 0);
  }
  assert.deepEqual(report.notReconstructed.map(row => row.id), ["attic-main-trunk", "drams-external-power-data", "carousel-three-warm-drives", "warm-cold-electrical-feedthrough"]);
});

test("Only DraMS short-wire geometry changes; all hardware, existing tubing and carousel geometry/poses remain exact", async () => {
  const oldDrams = fixture((await archived("drams-assembly.mjs")).buildDramsAssembly);
  const oldCarousel = fixture((await archived("sample-carousel.mjs")).buildSampleCarousel);
  const current = fixture(buildDramsAssembly);
  const changed = object => /drams-wire-(bundle|lacing|support-)/.test(object.name);
  assert.deepEqual(manifest(current.parent, changed), manifest(oldDrams.parent, changed));
  assert.deepEqual(manifest(fixture(buildSampleCarousel).parent), manifest(oldCarousel.parent));
  const before = oldDrams.assembly.getObjectByName("drams-wire-bundle").geometry.parameters.path;
  const after = current.assembly.getObjectByName("drams-wire-bundle").geometry.parameters.path;
  assert.ok(before.getPoint(0).distanceTo(after.getPoint(0)) < 1e-12);
  assert.ok(before.getPoint(1).distanceTo(after.getPoint(1)) < 1e-12);
  assert.ok(after.getLength() > before.getLength(), "added local slack, not a new endpoint");
  assert.equal(current.assembly.getObjectByName("drams-wire-bundle").geometry.parameters.radius, .004);
});

test("Electrical, gas/sample and unclassified controls hide independently and restore without shifting installed geometry", () => {
  const drams = fixture(buildDramsAssembly), carousel = fixture(buildSampleCarousel);
  const masks = createInspectionVisibility({ drams: drams.parent, "sample-carousel": carousel.parent });
  const before = manifest(drams.parent), coldBefore = manifest(carousel.parent);
  for (const layer of ["harnesses", "plumbing", "unclassified-lines"]) {
    const previous = new Map(); masks.apply({ hiddenPartLayers: { drams: [layer] } }, previous);
    assert.equal(drams.harness.visible, layer !== "harnesses");
    assert.equal(drams.plumbing.visible, layer !== "plumbing");
    assert.equal(drams.schematic.visible, layer !== "unclassified-lines");
    assert.equal(drams.fittings.visible, true, "valve hardware is not hidden with tubing");
    for (const [object, visible] of previous) object.visible = visible;
  }
  const previous = new Map(); masks.apply({ hiddenPartLayers: { "sample-carousel": ["unclassified-lines"] } }, previous);
  assert.equal(carousel.assembly.getObjectByName("carousel-unclassified-lines").visible, false);
  assert.equal(carousel.assembly.getObjectByName("carousel-top-hardware").visible, true);
  for (const [object, visible] of previous) object.visible = visible;
  const inspector = {}; applyInspectionAccessPreset(inspector, "open"); masks.apply(inspector, new Map());
  assert.equal(drams.harness.visible, true); assert.equal(drams.plumbing.visible, true); assert.equal(drams.schematic.visible, true);
  assert.deepEqual(manifest(drams.parent), before); assert.deepEqual(manifest(carousel.parent), coldBefore);
});

test("Wire lacing/support meet the unchanged enclosure, with no enlarged attic allowance", () => {
  const { assembly, harness, frame } = fixture(buildDramsAssembly);
  assert.equal(harness.getObjectByName("drams-wire-example").children.filter(object => object.name === "drams-wire-lacing").length, 2);
  const lead = assembly.getObjectByName("drams-wire-bundle"), path = lead.geometry.parameters.path;
  const p = path.getPointAt(dramsConnectionAsset.supportFraction);
  const foot = new THREE.Box3().setFromObject(frame.getObjectByName("drams-wire-support-foot"));
  const stand = new THREE.Box3().setFromObject(frame.getObjectByName("drams-wire-support-stand"));
  assert.ok(Math.abs(foot.min.x - .332) < 1e-7, "touches electronics enclosure side");
  assert.ok(foot.intersectsBox(stand), "stand meets foot");
  assert.ok(Math.abs(stand.max.y - (p.y - .004)) < 1e-7, "supports wire underside");
  for (const point of path.getSpacedPoints(300)) {
    assert.ok(point.x - .004 >= .332 - 1e-10 && point.x + .004 < .35, "outside side wall and inside old envelope");
  }
});

test("DraMS inspection targets are non-nested so choosing the macro wire cannot hide its own parent", () => {
  const { assembly } = fixture(buildDramsAssembly);
  const targets = [];
  assembly.traverse(object => { if (object.userData.inspectionLabel) targets.push(object); });
  assert.equal(targets.length, 4);
  for (const target of targets) for (let parent = target.parent; parent; parent = parent.parent) {
    assert.equal(parent.userData.inspectionLabel, undefined, target.name + " has no labeled ancestor");
  }
  const wire = assembly.getObjectByName("drams-wire-example");
  assert.equal(wire.userData.inspectionMinimumRadiusM, .03);
  assert.ok(wire.getObjectByName("drams-wire-bundle"));
});

test("Short wire clears installed attic surfaces except its explicit local endpoint contacts", () => {
  const { parent, assembly } = fixture(buildDramsAssembly);
  const lead = assembly.getObjectByName("drams-wire-bundle"), path = lead.geometry.parameters.path;
  const obstacles = [];
  for (const root of [parent, fixture(buildSampleCarousel).parent, fixture(buildWonderwall).parent]) root.traverse(object => {
    if (!object.isMesh || /drams-wire-(bundle|lacing|support-)/.test(object.name)) return;
    const triangles = [], positions = object.geometry.attributes.position, index = object.geometry.index;
    const count = index ? index.count : positions.count;
    for (let i = 0; i < count; i += 3) {
      const vertex = n => new THREE.Vector3().fromBufferAttribute(positions, index ? index.getX(n) : n).applyMatrix4(object.matrixWorld);
      triangles.push(new THREE.Triangle(vertex(i), vertex(i + 1), vertex(i + 2)));
    }
    obstacles.push({ object, box: new THREE.Box3().setFromObject(object), triangles });
  });
  const nearest = new THREE.Vector3(), radius = dramsConnectionAsset.wireRadiusM;
  for (const point of path.getSpacedPoints(320)) for (const { object, box, triangles } of obstacles) {
    if (box.distanceToPoint(point) > radius) continue;
    if (object.name === "drams-brass-cylinder" && point.distanceTo(path.getPoint(0)) < .012) continue;
    if (object.name === "drams-connector" && point.distanceTo(path.getPoint(1)) < .012) continue;
    for (const triangle of triangles) {
      triangle.closestPointToPoint(point, nearest);
      assert.ok(point.distanceTo(nearest) >= radius - .00015, `${object.name} at ${point.toArray()}`);
    }
  }
});
