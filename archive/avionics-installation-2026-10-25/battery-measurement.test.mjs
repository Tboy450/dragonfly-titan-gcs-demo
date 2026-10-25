import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as T from "../dist/vendor/three/three.module.min.js";
import { buildBatteryMeasurement, batteryMeasurementAsset as A } from "../dist/battery-measurement.mjs";
import { buildBattery, batteryAsset } from "../dist/battery.mjs";
import { inspectionGroups, inspectionSubassemblies, inspectionFocusRadius, createInspector, selectInspectionSubassembly } from "../dist/vehicle-inspector.mjs";
import { createInspectionVisibility } from "../dist/inspection-visibility.mjs";
const mesh = (g, m, p, parent) => { const o = new T.Mesh(g, m); o.position.fromArray(p); parent.add(o); return o; };
const fixture = () => { const parent = new T.Group(); parent.name = "battery-sensor"; const result = buildBatteryMeasurement({ parent, mesh }); parent.updateMatrixWorld(true); return { parent, ...result }; };
const box = object => new T.Box3().setFromObject(object);

test("Part20 is a family hardware approximation, never identified flight hardware", () => {
  const { parent, bead, tip } = fixture();
  assert.equal(parent.userData.annotation, false); assert.equal(parent.userData.hardwareReconstructed, false);
  assert.equal(parent.userData.hardwareApproximation, true);
  assert.equal(parent.userData.measurementZone, "battery");
  assert.equal(parent.userData.assetRevision, A.revision);
  assert.match(parent.userData.referenceFamily, /44909.*not confirmed/);
  assert.equal(bead.material.color.getHex(), 0x181b1c);
  assert.equal(tip.material.color.getHex(), 0x8b9094);
  assert.deepEqual(parent.userData.labelAnchor.toArray(), A.anchor);
  assert.equal(parent.children.length, 2);
  parent.traverse(o => { if (o.isMesh) assert.notEqual(o.geometry.type, "TorusGeometry", "old target removed"); });
});

test("Sensor is drawn at the manufacturer's maximum envelope, not inflated for visibility", () => {
  const { bead, body } = fixture(), size = box(bead).getSize(new T.Vector3());
  assert.ok(Math.abs(size.y - A.maxDiameterM) < 1e-9);
  assert.ok(Math.abs(size.x - A.bodyDepthM) < 1e-9);
  assert.ok(box(body).getSize(new T.Vector3()).length() < .004);
  assert.equal(A.maxDiameterM, .0024);
});

test("Black body and gray end share one surface with no overlapping triangles", () => {
  const { bead, tip } = fixture(), faces = object => {
    const a = object.geometry.index.array;
    return Array.from({ length: a.length / 3 }, (_, i) => [...a.slice(i * 3, i * 3 + 3)].join(','));
  };
  assert.deepEqual(bead.geometry.attributes.position.array, tip.geometry.attributes.position.array);
  const black = faces(bead), gray = faces(tip), unique = new Set([...black, ...gray]);
  assert.equal(unique.size, black.length + gray.length, "end paint cannot z-fight with a second surface");
  assert.equal(unique.size, new T.SphereGeometry(A.maxDiameterM / 2, 32, 32).index.count / 3);
});

test("Installation bonds to the estimated battery wall without entering the battery or its ribs", () => {
  const { parent, bead, mounts } = fixture(), battery = new T.Group(); buildBattery({ parent: battery, mesh }); battery.updateMatrixWorld(true);
  assert.equal(A.panelX, batteryAsset.center[0] - batteryAsset.enclosure.widthM / 2);
  assert.equal(A.anchor[2], batteryAsset.center[1] + .07);
  assert.ok(Math.abs(box(mounts).max.x - A.panelX) < 1e-8, "pads touch panel, no floating bracket");
  assert.ok(Math.abs(box(bead).max.x - box(mounts.children[0]).min.x) < 1e-8, "bead touches bond pad");
  parent.traverse(o => {
    if (!o.isMesh) return;
    const mine = box(o).expandByScalar(-1e-8);
    battery.traverse(other => { if (other.isMesh) assert.ok(!mine.intersectsBox(box(other)), `${o.name} enters ${other.name}`); });
  });
});

test("Two 32 AWG reference leads retain 3 inches of length and stop without a fabricated connection", () => {
  const { leads } = fixture(); assert.equal(leads.children.length, 2);
  const paths = leads.children.map(lead => {
    assert.ok(Math.abs(lead.userData.lengthM - A.leadLengthM) < 1e-9);
    assert.ok(Math.abs(lead.geometry.parameters.radius * 2 - .000202) < 1e-12);
    assert.equal(lead.userData.destinationUnmodeled, true);
    return lead.geometry.parameters.path;
  });
  for (let i = 0; i <= 200; i++) {
    assert.ok(paths[0].getPoint(i / 200).distanceTo(paths[1].getPoint(i / 200)) > A.leadDiameterM);
    for (const path of paths) assert.ok(path.getPoint(i / 200).x + A.leadDiameterM / 2 < A.panelX);
  }
});

test("Body, mount pads and leads hide independently and restore without moving hardware", () => {
  const { parent, body, mounts, leads } = fixture(), visibility = createInspectionVisibility({ "battery-sensor": parent });
  const before = parent.children.map(c => c.matrixWorld.toArray());
  for (const [layer, target] of [["equipment-casings", body], ["mounts", mounts], ["harnesses", leads]]) {
    assert.equal(visibility.available(layer, "battery-sensor"), true);
    const previous = new Map(); visibility.apply({ hiddenPartLayers: { "battery-sensor": [layer] } }, previous);
    for (const item of [body, mounts, leads]) assert.equal(item.visible, item !== target);
    for (const [o, value] of previous) o.visible = value;
  }
  assert.equal(visibility.available("equipment-covers", "battery-sensor"), false, "no invented removable bead lid");
  parent.updateMatrixWorld(true); assert.deepEqual(parent.children.map(c => c.matrixWorld.toArray()), before);
});

test("Macro inspection is opt-in, bounded, resettable and leaves other parts' framing unchanged", () => {
  const { parent, head, installation } = fixture(), inspector = createInspector();
  assert.deepEqual(inspectionSubassemblies(parent), [head, installation]);
  inspector.focusPart = "battery-sensor";
  selectInspectionSubassembly({ inspector }, parent, head.name);
  assert.equal(inspector.subassembly, head.name); assert.equal(inspector.zoom, 1);
  assert.equal(inspectionFocusRadius(.0018, head), .003);
  assert.equal(inspectionFocusRadius(.04, installation), .04);
  assert.equal(inspectionFocusRadius(.0018), .22);
  assert.equal(inspectionFocusRadius(.4, head), .4, "macro cannot crop larger bounds");
  for (const value of [NaN, Infinity, -1, 0, .0001, 1, "0.003"]) {
    assert.equal(inspectionFocusRadius(.001, { userData: { inspectionMinimumRadiusM: value } }), .22);
  }
  assert.equal(inspectionFocusRadius(NaN), .22);
});

test("Part20 isolation includes the battery and keeps the original part identifier", () => {
  assert.deepEqual(inspectionGroups("battery-sensor"), ["battery", "battery-sensor"]);
  assert.deepEqual(inspectionGroups("battery"), ["battery", "battery-sensor"]);
  const builder = readFileSync(new URL("../dist/vehicle-research.mjs", import.meta.url), "utf8");
  assert.match(builder, /interiorPart\("battery-sensor", "battery", "Battery temperature sensor \(family approximation/);
  // Part 21 was later redrawn as its own annotation (Claude, Oct 20; tests/mmrtg-measurement.test.mjs),
  // so this pass's check that it left part 21 unchanged now compares the archived copies.
  const unchanged = raw => { const text = raw.replace(/\r\n/g, "\n"); return text.slice(text.indexOf('  // Kept on the MMRTG'), text.indexOf('  // Externally mounted items')); };
  const prior = readFileSync(new URL("../archive/battery-measurement-2026-10-20/vehicle-research.mjs", import.meta.url), "utf8");
  const afterPart20 = readFileSync(new URL("../archive/mmrtg-sensor-2026-10-20/vehicle-research.mjs", import.meta.url), "utf8");
  assert.equal(unchanged(afterPart20), unchanged(prior), "part21 geometry unchanged by part 20");
});

test("Part20 completes an initial approximation while flight-specific follow-ups remain open", () => {
  const todo = readFileSync(new URL("../INTERIOR-REALISM-TODO.md", import.meta.url), "utf8");
  assert.match(todo, /- \[x\] \*\*Codex:\*\* \*\*20 Battery temperature sensor/);
  assert.match(todo, /- \[ \] \*\*20 follow-up/);
  const ui = readFileSync(new URL("../dist/ui/layers-panel.mjs", import.meta.url), "utf8");
  assert.match(ui, /not identified Dragonfly flight hardware/);
  assert.match(ui, /one example does not establish the flight sensor count/);
});

test("Battery and the part21 snapshot preserved during part20 match its pre-pass manifests", () => {
  const prior = JSON.parse(readFileSync(new URL("../archive/battery-sensor-2026-10-21/before/mesh-manifest.json", import.meta.url), "utf8"));
  for (const [name, builder] of [["battery", buildBattery]]) {
    const parent = new T.Group(); builder({ parent, mesh }); parent.updateMatrixWorld(true);
    const actual = [];
    parent.traverse(o => { if (o.isMesh) actual.push({ name: o.name, matrix: o.matrixWorld.toArray(), positions: Array.from(o.geometry.attributes.position.array) }); });
    assert.equal(JSON.stringify(actual), JSON.stringify(prior[name]), name);
  }
  // Part21 now has its own rebuild. Its pre-rebuild archive proves that part20
  // preserved Claude's annotation; comparing today's new model would be invalid.
  const before21 = JSON.parse(readFileSync(new URL("../archive/fin-root-sensor-2026-10-21/before/mesh-manifest.json", import.meta.url), "utf8"));
  assert.equal(JSON.stringify(before21['mmrtg-sensor']), JSON.stringify(prior['mmrtg-sensor']));
});
