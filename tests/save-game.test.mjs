import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState, stepFlight, commandFlight, estimateFlightPlan } from "../dist/flight-model.mjs";
import { addWaypoint, uplinkPlan } from "../dist/flight-plan.mjs";
import { startSample, scienceModel } from "../dist/science.mjs";
import { snapshotState, restoreState, canSave, SAVE_VERSION } from "../dist/save-game.mjs";

const run = (s, seconds, dt = 0.05) => { for (let t = 0; t < seconds; t += dt) stepFlight(s, dt); };
const grounded = () => { const s = createFlightState(); s.auto = false; s.throttle = 0.18; run(s, 0.1); return s; };

test("A landed mission survives a save and reload, resuming on the ground", () => {
  const s = grounded();
  addWaypoint(s, 0, 0, "a");
  addWaypoint(s, 0, 0, "outcrop");
  uplinkPlan(s, estimateFlightPlan(s));
  for (let t = 0; t < 900 && s.plan.status !== "complete"; t += 0.05) stepFlight(s, 0.05);
  assert.equal(s.plan.status, "complete");
  startSample(s);
  run(s, scienceModel.sampleSeconds + 1);
  addWaypoint(s, 0, 0, "base");
  assert.ok(canSave(s));
  const saved = JSON.parse(JSON.stringify(snapshotState(s, 1234)));
  const fresh = createFlightState();
  assert.equal(restoreState(fresh, saved), true);
  for (const key of ["positionX", "positionZ", "heading", "battery", "batteryC", "elapsed", "dataStoredBits", "dataReturnedBits", "preheats"]) {
    assert.equal(fresh[key], s[key], key);
  }
  assert.deepEqual(fresh.scoutedSites, s.scoutedSites);
  assert.equal(fresh.science.samples.length, 1);
  assert.deepEqual(fresh.plan.waypoints, s.plan.waypoints, "the draft plan is kept");
  assert.equal(fresh.auto, false);
  assert.equal(fresh.altitude, 0);
  run(fresh, 10);
  assert.ok(Number.isFinite(fresh.battery) && Number.isFinite(fresh.coreC) && fresh.altitude === 0, "the restored mission runs");
});

test("Only landed, idle states are saved", () => {
  const s = grounded();
  assert.equal(canSave(s), true);
  commandFlight(s, "takeoff");
  run(s, 5);
  assert.equal(canSave(s), false, "not in flight");
  const planning = grounded();
  addWaypoint(planning, 0, 0, "outcrop");
  uplinkPlan(planning, estimateFlightPlan(planning));
  assert.equal(canSave(planning), false, "not while a plan is uplinking or flying");
  const arriving = grounded();
  arriving.edl = { t: 3 };
  assert.equal(canSave(arriving), false, "not during the arrival sequence");
});

test("Old or malformed saves are ignored", () => {
  const s = createFlightState();
  const before = JSON.stringify({ x: s.positionX, b: s.battery });
  assert.equal(restoreState(s, null), false);
  assert.equal(restoreState(s, { version: SAVE_VERSION + 1, values: { positionX: 5, battery: 50 } }), false);
  assert.equal(restoreState(s, { version: SAVE_VERSION, values: { positionX: "x" } }), false);
  assert.equal(JSON.stringify({ x: s.positionX, b: s.battery }), before, "nothing changed");
});
