import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState } from "../dist/flight-model.mjs";
import { createInspector, inspectionDefaults, inspectionAvailable, inspectionTarget, resetInspector,
  rotateInspector, zoomInspector, focusInspector, inspectionGroups, inspectionModified } from "../dist/vehicle-inspector.mjs";

const state = () => ({ ...createFlightState(), view: "mission", missionLayer: "internal", vehicleModel: "research", inspector: createInspector() });

test("Inspection is Mission-only and leaves the flight and science state alone", () => {
  const s = state(), before = structuredClone(s);
  assert.equal(inspectionAvailable(s), true);
  for (const patch of [{ view: "pilot" }, { missionLayer: "exterior" }, { vehicleModel: "original" }]) {
    assert.equal(inspectionAvailable({ ...s, ...patch }), false);
  }
  focusInspector(s, "battery");
  rotateInspector(s.inspector, 200, 80, 800, 600);
  zoomInspector(s.inspector, 1.2);
  s.inspector.isolate = true;
  assert.equal(inspectionTarget(s), "battery");
  assert.equal(inspectionModified(s.inspector, inspectionTarget(s)), true);
  const { inspector, selectedPart, ...flight } = s;
  const { inspector: oldInspector, ...oldFlight } = before;
  assert.deepEqual(flight, oldFlight);
  resetInspector(inspector);
  assert.deepEqual(inspector, { ...inspectionDefaults, resetSerial: 1 });
  assert.equal(inspectionModified(inspector, null), false);
});

test("Orbit and zoom are bounded and ignore invalid input", () => {
  const i = createInspector();
  rotateInspector(i, 100000, 100000, 360, 480);
  assert.ok(i.azimuth >= 0 && i.azimuth < Math.PI * 2);
  assert.equal(i.elevation, 1.35);
  rotateInspector(i, 0, -100000, 360, 480);
  assert.equal(i.elevation, -1.35);
  zoomInspector(i, 1000); assert.equal(i.zoom, 3);
  zoomInspector(i, 0.001); assert.equal(i.zoom, 0.6);
  const before = { ...i };
  for (const factor of [NaN, Infinity, -1, 0]) zoomInspector(i, factor);
  rotateInspector(i, NaN, 0, 600, 600);
  rotateInspector(i, 1, 1, 0, 600);
  assert.deepEqual(i, before);
});

test("Follow sampling uses the shared clock, releases completed jobs, and permits manual inspection", () => {
  const s = state();
  s.inspector.followSampling = true;
  assert.equal(inspectionTarget(s), null);
  s.science.sampling = true;
  for (const [seconds, target] of [[5, "drills"], [14, "sample-lines"], [20, "sample-carousel"], [26, "drams"]]) {
    s.science.sampleSeconds = seconds;
    s.hold = true;
    assert.equal(inspectionTarget(s), target, "paused sampling keeps its target");
    assert.equal(inspectionTarget(s), target, "viewing never advances the clock");
  }
  s.science.sampling = false;
  assert.equal(inspectionTarget(s), null);
  s.science.sampling = true;
  focusInspector(s, "battery");
  assert.equal(s.inspector.followSampling, false);
  assert.equal(inspectionTarget(s), "battery");
  s.inspector.isolate = true;
  focusInspector(s, null);
  assert.equal(s.inspector.isolate, false);
  assert.equal(inspectionTarget(s), null);
});

test("Isolation includes the related transfer and sensor assemblies", () => {
  assert.deepEqual(inspectionGroups("battery"), ["battery", "battery-sensor"]);
  assert.deepEqual(inspectionGroups("sample-lines"), ["drills", "sample-lines", "sample-flow", "sample-carousel"]);
  assert.deepEqual(inspectionGroups("drams"), ["drams"], "neighboring covers must not obscure an isolated instrument");
  assert.deepEqual(inspectionGroups("mmrtg"), ["mmrtg"]);
  assert.deepEqual(inspectionGroups(null), []);
});
