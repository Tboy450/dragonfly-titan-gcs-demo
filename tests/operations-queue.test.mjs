import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState, stepFlight, commandFlight, takeManualControl } from "../dist/flight-model.mjs";
import { addOperation, editOperation, runOperations, pauseOperations, clearOperations, canAccelerateOperations, stepOperations, validOperations } from "../dist/operations.mjs";
import { setWeatherMode, startStormTraining } from "../dist/weather.mjs";
import { restoreState, snapshotState } from "../dist/save-game.mjs";
import { cancelSample, startSample } from "../dist/science.mjs";
import { systemsModel } from "../dist/mission-systems.mjs";

function ground() {
  const s = createFlightState(); Object.assign(s, { auto: false, throttle: 0.18 });
  setWeatherMode(s, "fixed"); stepFlight(s, 0.05); return s;
}
function advance(s, seconds, dt = 0.05) { for (let t = 0; t < seconds; t += dt) stepFlight(s, Math.min(dt, seconds - t)); }

test("Queue editing is bounded, ordered and locked during execution", () => {
  const s = ground();
  assert.equal(addOperation(s, "unknown"), false);
  assert.equal(addOperation(s, "recharge", NaN), false);
  addOperation(s, "demo"); addOperation(s, "downlink"); addOperation(s, "recharge", 80);
  assert.equal(editOperation(s, 2, -1), true);
  assert.deepEqual(s.operations.items.map(x => x.kind), ["demo", "recharge", "downlink"]);
  assert.equal(editOperation(s, 0, -1), false);
  assert.equal(editOperation(s, 1), true);
  while (addOperation(s, "demo")) {}
  assert.equal(s.operations.items.length, 12);
  assert.equal(runOperations(s), true);
  assert.equal(runOperations(s), false);
  assert.equal(addOperation(s, "ldms"), false);
  assert.equal(editOperation(s, 1), false);
});

test("Queued sample and downlink complete once through real physics and FIFO data", () => {
  const s = ground();
  addOperation(s, "demo"); addOperation(s, "downlink"); addOperation(s, "recharge", 20);
  runOperations(s); advance(s, 30.1);
  assert.equal(s.science.samples.length, 1);
  assert.equal(s.operations.index, 1);
  assert.equal(s.operations.active.kind, "downlink");
  assert.ok(s.operations.active.endBits >= s.science.samples[0].downlinkEndBits);
  const end = s.operations.active.endBits;
  for (let t = 0; t < 20000 && s.operations.status === "running"; t++) stepFlight(s, 1);
  assert.equal(s.operations.status, "complete", s.operations.message);
  assert.equal(s.operations.index, 3);
  assert.equal(s.science.samples.length, 1);
  assert.ok(s.dataReturnedBits >= end);
  assert.equal(s.downlinkActive, false);
  assert.equal(s.timeWarp, 1);
  assert.equal(s.hibernating, false);
  advance(s, 5); assert.equal(s.science.samples.length, 1);
});

test("Queued extended science charges exactly the same energy as manual science", () => {
  const s = ground(), manual = ground();
  addOperation(s, "ldms"); runOperations(s);
  manual.science.programId = "ldms"; startSample(manual);
  for (let t = 0; t < 601; t += 0.05) { stepFlight(s, 0.05); stepFlight(manual, 0.05); }
  assert.equal(s.operations.status, "complete");
  assert.equal(s.science.samples.length, 1);
  assert.ok(Math.abs(s.battery - manual.battery) < 1e-9);
  assert.ok(Math.abs(s.coreC - manual.coreC) < 1e-9);
});

test("Global pause freezes work; stopping the queue cancels without refund or award", () => {
  const s = ground(); addOperation(s, "gcms"); runOperations(s); advance(s, 5);
  commandFlight(s, "hold"); const before = JSON.stringify(s);
  stepFlight(s, 1); assert.equal(JSON.stringify(s), before);
  commandFlight(s, "hold"); const battery = s.battery;
  pauseOperations(s); assert.equal(s.battery, battery); assert.equal(s.science.sampling, false);
  assert.equal(s.science.samples.length, 0); assert.equal(s.operations.status, "paused");
  advance(s, 5); assert.equal(s.science.sampling, false);
  runOperations(s); stepFlight(s, 0.05); assert.equal(s.science.sampleSeconds, 0.05);
  cancelSample(s); stepFlight(s, 0.05);
  assert.equal(s.operations.status, "paused"); assert.equal(s.operations.index, 0);
});

test("A result already earned at a guard boundary is not queued for duplicate collection", () => {
  const s = ground(); addOperation(s, "demo"); addOperation(s, "ldms"); runOperations(s);
  stepOperations(s);
  s.science.sampling = false; s.science.samples.push({ programId: "demo" }); s.coreC = 41;
  stepOperations(s); assert.equal(s.operations.index, 1); assert.equal(s.operations.items[0].status, "done");
  stepOperations(s); assert.equal(s.operations.status, "paused"); assert.equal(s.operations.index, 1);
});

test("Flight, movement and manual jobs cannot be stolen by the surface queue", () => {
  const s = ground(); addOperation(s, "demo"); s.auto = true;
  assert.equal(runOperations(s), false); s.auto = false;
  startSample(s); assert.equal(runOperations(s), false);
  clearOperations(s); assert.equal(s.science.sampling, true, "unowned sample stays active");
  cancelSample(s); addOperation(s, "demo"); runOperations(s); stepFlight(s, 0.05);
  commandFlight(s, "takeoff"); assert.equal(s.operations.status, "paused"); assert.equal(s.science.sampling, false);
  commandFlight(s, "land"); runOperations(s); stepFlight(s, 0.05);
  takeManualControl(s); assert.equal(s.operations.status, "paused");
  s.positionX += 5; assert.equal(runOperations(s), false);
  assert.match(s.operations.message, /another landing site/);
  clearOperations(s); addOperation(s, "demo"); assert.equal(runOperations(s), true);
});

test("Radio waits require explicit resume; it does not automatically restart at daylight", () => {
  const s = ground(); s.elapsed = systemsModel.titanDaySeconds / 2;
  addOperation(s, "downlink"); runOperations(s); stepFlight(s, 0.05);
  assert.equal(s.operations.status, "paused"); assert.match(s.operations.message, /night/);
  s.elapsed = systemsModel.titanDaySeconds; stepFlight(s, 0.05);
  assert.equal(s.downlinkActive, false); runOperations(s); stepFlight(s, 0.05);
  assert.equal(s.downlinkActive, true);
  s.battery = 29; stepFlight(s, 0.05);
  assert.equal(s.operations.status, "paused"); assert.equal(s.operations.index, 0);
});

test("Recharge uses actual net generation and wakes exactly at the target", () => {
  const s = ground(); s.battery = 49.999;
  addOperation(s, "recharge", 50); addOperation(s, "demo"); runOperations(s);
  stepFlight(s, 0.05);
  assert.equal(s.hibernating, true); assert.equal(s.netBatteryW, s.generatedW - 60);
  assert.equal(canAccelerateOperations(s), true);
  for (let t = 0; t < 100 && s.operations.index === 0; t++) stepFlight(s, 1);
  assert.equal(s.operations.index, 1); assert.ok(s.battery >= 50);
  assert.equal(s.hibernating, false); stepFlight(s, 0.05); assert.equal(s.science.sampling, true);
  const weak = ground(); weak.arrivalElectricW = 40;
  addOperation(weak, "recharge", 100); runOperations(weak); stepFlight(weak, 0.05);
  assert.equal(weak.operations.status, "paused"); assert.match(weak.operations.message, /No net charging/);
});

test("Thermal faults and recharge weather warnings stop with no automatic retry", () => {
  const s = ground(); addOperation(s, "recharge", 100); runOperations(s); stepFlight(s, 0.05);
  startStormTraining(s); stepFlight(s, 0.05);
  assert.equal(s.operations.status, "paused"); assert.equal(s.hibernating, false);
  assert.match(s.operations.message, /Weather/);
  setWeatherMode(s, "fixed"); runOperations(s); stepFlight(s, 0.05);
  s.fault = "fan"; stepFlight(s, 0.05);
  assert.equal(s.operations.status, "paused"); assert.equal(s.hibernating, false);
  assert.match(s.operations.message, /circulation/);
  s.fault = "none"; advance(s, 1); assert.equal(s.operations.status, "paused");
});

test("Ordinary weather warning slows science without repeatedly throwing away long analysis", () => {
  const s = ground(); addOperation(s, "gcms"); runOperations(s); stepFlight(s, 0.05);
  s.weather.event = {kind:"gust",seconds:0,warning:60,rise:60,peak:60}; s.timeWarp = 100;
  stepOperations(s);
  assert.equal(s.operations.status, "running"); assert.equal(s.science.sampling, true); assert.equal(s.timeWarp, 1);
});

test("Save/load keeps pending and completed steps but never resumes work; rejects malformed queues atomically", () => {
  const s = ground(); addOperation(s, "demo"); addOperation(s, "gcms"); runOperations(s); advance(s, 35);
  const snapshot = snapshotState(s), restored = ground();
  assert.equal(snapshot.values.operations.active, null);
  assert.equal(validOperations(snapshot.values.operations), true);
  assert.equal(restoreState(restored, snapshot), true);
  assert.equal(restored.operations.status, "paused"); assert.equal(restored.operations.index, 1);
  assert.equal(restored.science.samples.length, 1); assert.equal(restored.science.sampling, false);
  stepFlight(restored, 1); assert.equal(restored.science.samples.length, 1);
  runOperations(restored); stepFlight(restored, 0.05); assert.equal(restored.science.sampleSeconds, 0.05);
  for (const alter of [q=>q.index=100, q=>q.items[0].kind="bad", q=>q.items[0].status="pending", q=>q.active={}, q=>q.anchor.x=null, q=>q.status="running"]) {
    const invalid=structuredClone(snapshot); alter(invalid.values.operations); const fresh=ground(), before=structuredClone(fresh);
    assert.equal(restoreState(fresh, invalid), false); assert.deepEqual(fresh, before);
  }
  const legacy=structuredClone(snapshot); delete legacy.values.operations;
  const fresh=ground(); assert.equal(restoreState(fresh,legacy),true); assert.equal(fresh.operations.items.length,0);
});
