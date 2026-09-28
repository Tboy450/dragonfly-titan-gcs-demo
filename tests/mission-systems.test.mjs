import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState, stepFlight, commandFlight, model, advanceRest } from "../dist/flight-model.mjs";
import { missionAction, startRest, surveySite, pools, overLiquid, targetDistance, systemsModel, surfaceHeatTransfer, liquidExchangerStudy, stepSystems } from "../dist/mission-systems.mjs";
const advance = (s, seconds, dt = 0.05) => { for (let t = 0; t < seconds; t += dt) stepFlight(s, dt); };
const grounded = () => { const s = createFlightState(); s.auto = false; s.throttle = 0; return s; };

test("Hypothetical liquid exchanger conserves heat and rejects invalid inputs", () => {
  const result = liquidExchangerStudy(40, 5, 40, 30, 0.65);
  assert.equal(result.heatW, 682.5);
  assert.equal((40 - result.hotOutletC) * 40, result.heatW);
  assert.equal((result.coldOutletC - 5) * 30, result.heatW);
  assert.equal(liquidExchangerStudy(40, 5, 40, 30, 0).heatW, 0);
  assert.equal(liquidExchangerStudy(5, 5, 40, 30, 1).heatW, 0);
  assert.equal(liquidExchangerStudy(40, 5, 40, 30, 1).coldOutletC, 40);
  for (const args of [[4, 5, 40, 30, 0.65], [40, 5, 0, 30, 0.65], [40, 5, 40, 30, 2], [40, NaN, 40, 30, 0.65]]) assert.equal(liquidExchangerStudy(...args), null);
});

test("Titan convection stays bounded and both heat-transfer paths limit rejection", () => {
  const calm = surfaceHeatTransfer(0, 0, 1), windy = surfaceHeatTransfer(1.6, 0, 1);
  assert.equal(calm.h, 4);
  assert.equal(windy.h, 10.5);
  assert.equal(surfaceHeatTransfer(0, 10, 1).h, 75);
  assert.equal(surfaceHeatTransfer(100, 100, 1).h, 75);
  assert.ok(calm.ductUA > 0);
  assert.ok(windy.ductUA > calm.ductUA);
  assert.ok(windy.ductUA < systemsModel.internalConductance);
  assert.ok(surfaceHeatTransfer(2, 0, 0.35).ductUA < windy.ductUA);
  assert.equal(surfaceHeatTransfer(2, 0, 0).ductUA, 0);
  const stopped = grounded(); stopped.fan = 0; stopped.thermalAuto = false; stopped.trim = 1;
  stepFlight(stopped, 0.05);
  assert.equal(stopped.ductUA, 0);
  assert.ok(stopped.heatOutW > 0, "Passive insulation leakage remains without a fan");
});

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
  assert.ok(Math.abs(day.battery - night.battery) < 0.001, "Only the additional eight days of generator aging affect charge");
  assert.ok(day.coreC > 10 && day.coreC < 20);
  assert.ok(day.batteryC > 5 && day.batteryC < 25);
  commandFlight(day, "hold");
  const frozen = structuredClone(day);
  advance(day, 60, 1);
  assert.deepEqual(day, frozen);
});

test("Thermal source balances, trim is quantized and closes in flight", () => {
  const s = grounded();
  stepFlight(s, 1);
  assert.ok(Math.abs(s.generatorToBayW + s.generatorRejectedW - s.rtgHeatW) < 1e-8);
  assert.ok(Math.abs(s.trim / 0.02 - Math.round(s.trim / 0.02)) < 1e-10);
  assert.ok(s.trim >= 0 && s.trim <= 0.4);
  const previousTrim = s.trim;
  s.batteryC = 19;
  stepFlight(s, 1);
  assert.equal(s.trim, previousTrim, "PI controller does not update every animation frame");
  s.altitude = 40; s.thermalAuto = false; s.trim = 0.4;
  stepFlight(s, 0.05);
  assert.equal(s.effectiveTrim, 0);
  assert.equal(s.trimFlightLocked, true);
});

test("Cold batteries cannot charge and MMRTG ages without a solar dependency", () => {
  const s = grounded(); startRest(s, 1); s.batteryC = -1;
  const charge = s.battery;
  stepFlight(s, 1);
  assert.equal(s.battery, charge);
  assert.equal(s.chargingBlocked, true);
  s.batteryC = 10; s.elapsed = 365.25 * 86400;
  stepFlight(s, 1);
  assert.ok(Math.abs(s.generatedW - 90 * 0.975) < 1e-5);
  assert.ok(s.rtgHeatW < 1800 && s.rtgHeatW > 1780);
  s.arrivalElectricW = 70;
  stepFlight(s, 1);
  assert.ok(Math.abs(s.generatedW - 70 * 0.975) < 1e-5);
});

test("Controller survives calm and windy hibernation; flight heats battery", () => {
  for (const wind of [0, 0.8, 1.6]) {
    const s = grounded(); s.wind = wind; startRest(s, 192);
    for (let i = 0; i < 1152; i++) advanceRest(s);
    assert.equal(s.restNotice, "", `Wind ${wind}: ${s.batteryC}`);
    assert.ok(s.batteryC > 0 && s.batteryC < 20);
  }
  const f = grounded(); f.altitude = 40; f.speed = 8;
  for (let t = 0; t < 1800; t++) { f.power = 6200; stepSystems(f, 1, model.batteryEnergyKwh); }
  assert.ok(f.batteryC > 17 && f.batteryC < 35);
  assert.equal(f.effectiveTrim, 0);
  const controlled = grounded(), closed = grounded();
  controlled.wind = 0; closed.wind = 0; closed.thermalAuto = false; closed.trim = 0;
  startRest(controlled, 24); startRest(closed, 24);
  advance(controlled, 86400, 1); advance(closed, 86400, 1);
  assert.ok(closed.batteryC > controlled.batteryC + 5);
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
  assert.equal(s.mode, "Liquid avoidance");
  // The aircraft climbs clear of the liquid smoothly instead of teleporting to 2 m.
  let previous = s.altitude;
  for (let i = 0; i < 300; i++) {
    stepFlight(s, 1 / 60);
    assert.ok(s.altitude - previous < 0.06, `step ${s.altitude - previous}`);
    previous = s.altitude;
  }
  assert.ok(s.altitude > 1.8);
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
