import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState, stepFlight, commandFlight, model, advanceRest } from "../dist/flight-model.mjs";
import { missionAction, startRest, surveySite, pools, overLiquid, targetDistance, systemsModel } from "../dist/mission-systems.mjs";
const advance = (s, seconds, dt = 0.05) => { for (let t = 0; t < seconds; t += dt) stepFlight(s, dt); };
const grounded = () => { const s = createFlightState(); s.auto = false; s.throttle = 0; return s; };

test("Guided survey can land, sample and return without teleporting", () => {
  const s = grounded();
  missionAction(s);
  assert.equal(s.mission.phase, "outbound");
  missionAction(s);
  let maxMove = 0;
  for (let i = 0; i < 8000 && s.mission.phase === "outbound"; i++) {
    const x = s.positionX, z = s.positionZ;
    stepFlight(s, 0.05);
    maxMove = Math.max(maxMove, Math.hypot(x - s.positionX, z - s.positionZ));
  }
  assert.equal(s.mission.phase, "sample");
  assert.ok(targetDistance(s) <= surveySite.radius);
  assert.ok(maxMove <= 0.251);
  missionAction(s);
  assert.equal(s.mission.phase, "sampling");
  advance(s, 31);
  assert.equal(s.mission.phase, "return");
  assert.equal(s.mission.samples, 1);
  missionAction(s);
  advance(s, 240);
  assert.equal(s.mission.phase, "complete");
  assert.ok(Math.hypot(s.positionX, s.positionZ) <= 12);
});

test("Leaving the target interrupts sample acquisition", () => {
  const s = grounded();
  s.mission.phase = "sample"; s.positionX = surveySite.x; s.positionZ = surveySite.z;
  missionAction(s); advance(s, 5);
  s.altitude = 2; stepFlight(s, 0.05);
  assert.equal(s.mission.phase, "sample");
  assert.equal(s.mission.samples, 0);
  assert.equal(s.mission.sampleSeconds, 0);
});

test("Hibernate charges in day and night; pause freezes all systems", () => {
  const day = grounded(), night = grounded();
  night.elapsed = systemsModel.titanDaySeconds / 2;
  assert.ok(startRest(day, 1)); assert.ok(startRest(night, 1));
  advance(day, 3600, 1); advance(night, 3600, 1);
  assert.ok(day.battery > 96);
  assert.equal(day.battery, night.battery);
  assert.ok(day.coreC > 10 && day.coreC < 20);
  assert.ok(day.batteryC > 5 && day.batteryC < 25);
  commandFlight(day, "hold");
  const frozen = structuredClone(day);
  advance(day, 60, 1);
  assert.deepEqual(day, frozen);
});

test("Thermal faults and battery reserve inhibit takeoff", () => {
  for (const setup of [s => { s.battery = 10; }, s => { s.coreC = 60; }, s => { s.batteryC = -2; }, s => { s.fault = "fan"; stepFlight(s, 0.05); }]) {
    const s = grounded(); setup(s);
    commandFlight(s, "takeoff"); advance(s, 2);
    assert.ok(s.guard); assert.equal(s.altitude, 0);
  }
});

test("Cold duct rejection responds to trim and wind; insulation loss cools the bay", () => {
  const closed = grounded(), open = grounded(), windy = grounded();
  for (const s of [closed, open, windy]) { s.thermalAuto = false; s.wind = 0; }
  open.trim = 1; windy.trim = 1; windy.wind = 2; closed.trim = 0;
  for (const s of [closed, open, windy]) stepFlight(s, 0.05);
  assert.ok(open.heatOutW > closed.heatOutW);
  assert.ok(windy.heatOutW > open.heatOutW);
  const nominal = grounded(), damaged = grounded();
  damaged.fault = "insulation";
  startRest(nominal, 1); startRest(damaged, 1);
  advance(nominal, 3600, 1); advance(damaged, 3600, 1);
  assert.ok(damaged.coreC < nominal.coreC - 3);
});

test("Rest requires dry stationary ground, and liquid cannot become a sample site", () => {
  const s = grounded(); s.altitude = 4;
  assert.equal(startRest(s, 1), false);
  s.altitude = 0; s.positionX = pools[0].x; s.positionZ = pools[0].z;
  assert.ok(overLiquid(s.positionX, s.positionZ));
  assert.equal(startRest(s, 1), false);
  stepFlight(s, 0.05);
  assert.ok(s.altitude >= 2);
  assert.equal(s.mode, "Liquid avoidance");
});

test("Energy accounting includes MMRTG input and finite capacity", () => {
  const s = grounded(); s.battery = 99.99; startRest(s, 1);
  const before = s.battery; stepFlight(s, 1);
  assert.ok(Math.abs(s.battery - before - s.netBatteryW / (model.batteryEnergyKwh * 36000)) < 1e-10);
  advance(s, 3600, 1);
  assert.equal(s.battery, 100);
});

test("Accelerated rest recovers a depleted battery but stops on thermal faults", () => {
  const s = grounded(); s.battery = 10;
  startRest(s, 1);
  for (let i = 0; i < 6; i++) advanceRest(s);
  assert.equal(s.restSeconds, 0);
  assert.ok(s.battery > 10.24);
  assert.equal(s.restNotice, "");
  startRest(s, 8); s.fault = "fan";
  const elapsed = s.elapsed;
  advanceRest(s);
  assert.equal(s.elapsed - elapsed, 1);
  assert.equal(s.restSeconds, 0);
  assert.match(s.restNotice, /inspection/);
});
