import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as T from "../dist/vendor/three/three.module.min.js";
import { buildBatteryMeasurement, batteryMeasurementAsset as A } from "../dist/battery-measurement.mjs";
import { buildBattery, batteryAsset } from "../dist/battery.mjs";
import { inspectionGroups } from "../dist/vehicle-inspector.mjs";
const mesh = (g, m, p, parent) => { const o = new T.Mesh(g, m); o.position.fromArray(p); parent.add(o); return o; };
const fixture = () => { const parent = new T.Group(); const result = buildBatteryMeasurement({ parent, mesh }); parent.updateMatrixWorld(true); return { parent, ...result }; };

test("Part20 is explicitly a battery measurement annotation, not reconstructed flight hardware", () => {
  const { parent, target, ring } = fixture();
  assert.equal(parent.userData.annotation, true); assert.equal(parent.userData.hardwareReconstructed, false);
  assert.equal(parent.userData.measurementZone, "battery");
  assert.equal(parent.userData.assetRevision, A.revision);
  assert.equal(ring.geometry.type, "TorusGeometry");
  assert.equal(target.children.length, 3);
  assert.deepEqual(parent.userData.labelAnchor.toArray(), A.anchor);
  assert.deepEqual(target.position.toArray(), A.anchor);
  assert.equal(parent.children.length, 1);
});

test("Measurement target follows the estimated battery envelope without intersecting its meshes", () => {
  const { parent } = fixture(), battery = new T.Group(); buildBattery({ parent: battery, mesh }); battery.updateMatrixWorld(true);
  assert.equal(A.anchor[0], batteryAsset.center[0] + batteryAsset.enclosure.widthM / 2 + .016);
  assert.equal(A.anchor[2], batteryAsset.center[1] + .07);
  const target = new T.Box3().setFromObject(parent);
  battery.traverse(o => { if (o.isMesh) assert.ok(!target.intersectsBox(new T.Box3().setFromObject(o)), o.name); });
});

test("Part20 isolation includes the battery and keeps the original part identifier", () => {
  assert.deepEqual(inspectionGroups("battery-sensor"), ["battery", "battery-sensor"]);
  assert.deepEqual(inspectionGroups("battery"), ["battery", "battery-sensor"]);
  const builder = readFileSync(new URL("../dist/vehicle-research.mjs", import.meta.url), "utf8");
  assert.match(builder, /interiorPart\("battery-sensor", "battery", "Battery temperature input \(annotation/);
  // Part 21 was later redrawn as its own annotation (Claude, Oct 20; tests/mmrtg-measurement.test.mjs),
  // so this pass's check that it left part 21 unchanged now compares the archived copies.
  const unchanged = raw => { const text = raw.replace(/\r\n/g, "\n"); return text.slice(text.indexOf('  // Kept on the MMRTG'), text.indexOf('  // Externally mounted items')); };
  const prior = readFileSync(new URL("../archive/battery-measurement-2026-10-20/vehicle-research.mjs", import.meta.url), "utf8");
  const afterPart20 = readFileSync(new URL("../archive/mmrtg-sensor-2026-10-20/vehicle-research.mjs", import.meta.url), "utf8");
  assert.equal(unchanged(afterPart20), unchanged(prior), "part21 geometry unchanged by part 20");
});

test("Part20 records evidence limits without claiming a completed hardware rebuild", () => {
  const todo = readFileSync(new URL("../INTERIOR-REALISM-TODO.md", import.meta.url), "utf8");
  assert.match(todo, /- \[ \] \*\*20 Battery temperature sensor/);
  const ui = readFileSync(new URL("../dist/ui/layers-panel.mjs", import.meta.url), "utf8");
  assert.match(ui, /measurement annotation, not a modeled sensor package/);
  assert.match(ui, /one target does not mean one physical sensor/);
});
