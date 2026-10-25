import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState } from "../dist/flight-model.mjs";
import { createInspector, inspectionDefaults, inspectionAvailable, inspectionTarget, resetInspector,
  rotateInspector, zoomInspector, wheelZoomInspector, focusInspector, inspectionGroups, inspectionModified } from "../dist/vehicle-inspector.mjs";
import { setInspectionLayer, inspectionLayerVisible, restoreInspectionLayers, hiddenInspectionCount } from "../dist/inspection-visibility.mjs";

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

test("Wheel zoom captures only selected research-model rotation, leaving browser zoom and page scrolling alone", () => {
  const s = state(), wheel = { deltaY: -100, deltaMode: 0 };
  assert.equal(wheelZoomInspector(s, wheel), false);
  s.inspector.rotate = true;
  for (const patch of [{ view: "pilot" }, { missionLayer: "exterior" }, { vehicleModel: "original" }]) {
    assert.equal(wheelZoomInspector({ ...s, ...patch }, wheel), false);
  }
  for (const patch of [{ ctrlKey: true }, { metaKey: true }, { deltaY: NaN }, { deltaY: Infinity }, { deltaY: 0 }]) {
    assert.equal(wheelZoomInspector(s, { ...wheel, ...patch }), false);
  }
  assert.equal(s.inspector.zoom, 1);
  for (const missionLayer of ["internal", "thermal"]) {
    const current = { ...s, missionLayer, inspector: { ...s.inspector } };
    const before = structuredClone(current);
    assert.equal(wheelZoomInspector(current, wheel), true);
    assert.ok(current.inspector.zoom > 1, "wheel up zooms in");
    current.inspector.zoom = before.inspector.zoom;
    assert.deepEqual(current, before, "wheel never changes attitude, flight, science or camera rotation");
  }
});

test("Wheel zoom normalizes line/page units, reverses smoothly and stays captured at its limits", () => {
  const s = state(); s.inspector.rotate = true;
  wheelZoomInspector(s, { deltaY: -3, deltaMode: 1 });
  const lineZoom = s.inspector.zoom;
  s.inspector.zoom = 1;
  wheelZoomInspector(s, { deltaY: -48, deltaMode: 0 });
  assert.equal(s.inspector.zoom, lineZoom);
  wheelZoomInspector(s, { deltaY: 48, deltaMode: 0 });
  assert.ok(Math.abs(s.inspector.zoom - 1) < 1e-12);
  wheelZoomInspector(s, { deltaY: -1, deltaMode: 2 }, 100);
  assert.equal(s.inspector.zoom, Math.exp(.15));
  for (let n = 0; n < 20; n++) wheelZoomInspector(s, { deltaY: -1e9 });
  assert.equal(s.inspector.zoom, 3);
  assert.equal(wheelZoomInspector(s, { deltaY: -100 }), true, "no page-scroll leak at maximum zoom");
  for (let n = 0; n < 20; n++) wheelZoomInspector(s, { deltaY: 1e9 });
  assert.equal(s.inspector.zoom, .6);
  assert.equal(wheelZoomInspector(s, { deltaY: 100 }), true, "no page-scroll leak at minimum zoom");
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
  assert.deepEqual(inspectionGroups("sample-lines"), ["drills", "sample-lines", "sample-flow", "sample-carousel", "drill-blower"], "the lines end at the blowers");
  assert.deepEqual(inspectionGroups("drams"), ["drams"], "neighboring covers must not obscure an isolated instrument");
  assert.deepEqual(inspectionGroups("mmrtg"), ["mmrtg", "mmrtg-sensor"]);
  assert.deepEqual(inspectionGroups(null), []);
});

test("Layer masks stay per component, reset independently of the camera, and never share defaults", () => {
  const s = state(), other = createInspector(), flight = structuredClone(s);
  focusInspector(s, "drams");
  zoomInspector(s.inspector, 1.5);
  rotateInspector(s.inspector, 130, 15, 600, 600);
  const pose = [s.inspector.azimuth, s.inspector.elevation, s.inspector.zoom, s.inspector.focusPart];
  setInspectionLayer(s.inspector, "equipment-covers", false, "drams");
  setInspectionLayer(s.inspector, "equipment-casings", false, "frontier-radio");
  setInspectionLayer(s.inspector, "attic-shell", false);
  setInspectionLayer(s.inspector, "attic-shell", false);
  assert.equal(hiddenInspectionCount(s.inspector), 3, "repeated changes do not accumulate");
  assert.equal(inspectionLayerVisible(s.inspector, "equipment-covers", "drams"), false);
  assert.equal(inspectionLayerVisible(s.inspector, "equipment-covers", "frontier-radio"), true);
  assert.equal(hiddenInspectionCount(other), 0);
  setInspectionLayer(s.inspector, "unknown-layer", false);
  assert.equal(hiddenInspectionCount(s.inspector), 3);
  restoreInspectionLayers(s.inspector);
  assert.deepEqual([s.inspector.azimuth, s.inspector.elevation, s.inspector.zoom, s.inspector.focusPart], pose);
  assert.equal(hiddenInspectionCount(s.inspector), 0);
  setInspectionLayer(s.inspector, "body-shell", false);
  resetInspector(s.inspector);
  assert.deepEqual(s.inspector, { ...inspectionDefaults, resetSerial: 1 });
  delete s.inspector; delete s.selectedPart; delete flight.inspector;
  assert.deepEqual(s, flight, "viewing leaves all simulation values unchanged");
});
