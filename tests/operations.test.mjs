import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState, stepFlight, commandFlight, model } from "../dist/flight-model.mjs";
import { systemsModel, linkStatus, toggleDownlink, flightEndurance, operationsAdvisory, titanDaylight, startRest } from "../dist/mission-systems.mjs";
const advance = (s, seconds, dt = 0.05) => { for (let t = 0; t < seconds; t += dt) stepFlight(s, dt); };
const grounded = () => { const s = createFlightState(); s.auto = false; s.throttle = 0; return s; };

test("Motor preheat costs 60 Wh once per cold start", () => {
  assert.equal(systemsModel.preheatWh, 60);
  const s = grounded();
  advance(s, 1);
  const before = s.battery;
  assert.equal(s.preheats, 0);
  commandFlight(s, "takeoff");
  advance(s, 3);
  assert.equal(s.preheats, 1);
  assert.equal(s.preheatWh, 60);
  assert.ok(before - s.battery > 60 / (model.batteryEnergyKwh * 10) - 1e-9, "Preheat energy leaves the battery");
  commandFlight(s, "land");
  advance(s, 60);
  assert.equal(s.altitude, 0);
  commandFlight(s, "takeoff");
  advance(s, 3);
  assert.equal(s.preheats, 1, "Motors still warm after a short stop");
  commandFlight(s, "land");
  advance(s, 60);
  advance(s, systemsModel.motorCoolSeconds + 1, 1);
  assert.equal(s.motorsCold, true);
  commandFlight(s, "takeoff");
  advance(s, 3);
  assert.equal(s.preheats, 2);
});

test("Direct-to-Earth downlink needs a daylight landing and costs power", () => {
  const s = grounded();
  advance(s, 1);
  assert.equal(linkStatus(s).available, true);
  const idleLoad = s.power;
  assert.equal(toggleDownlink(s), true);
  advance(s, 10);
  assert.equal(s.downlinkW, systemsModel.downlinkW);
  assert.ok(Math.abs(s.power - idleLoad - systemsModel.downlinkW) < 1);
  const expectedBits = systemsModel.downlinkW * 10 / (systemsModel.downlinkJoulesPerBitAu * systemsModel.earthRangeAu);
  assert.ok(Math.abs(s.dataReturnedBits - expectedBits) / expectedBits < 0.02);
  commandFlight(s, "takeoff");
  advance(s, 3);
  assert.equal(s.downlinkActive, false, "Antenna stows for flight");
  assert.equal(linkStatus(s).available, false);
  assert.equal(toggleDownlink(s), false);

  const night = grounded();
  night.elapsed = systemsModel.titanDaySeconds * 0.5;
  assert.equal(titanDaylight(night), false);
  assert.equal(toggleDownlink(night), false);
  assert.match(linkStatus(night).label, /night/);

  const resting = grounded();
  advance(resting, 1);
  toggleDownlink(resting);
  assert.ok(startRest(resting, 1));
  assert.equal(resting.downlinkActive, false);
});

test("Flight endurance and land-now advisories follow reserve, heat and plan limits", () => {
  const s = grounded();
  commandFlight(s, "takeoff");
  advance(s, 10);
  assert.equal(operationsAdvisory(s, model.batteryEnergyKwh), "");
  const e = flightEndurance(s, model.batteryEnergyKwh);
  assert.ok(e.minutes > 3 && Number.isFinite(e.minutes));
  s.battery = 15.3;
  assert.match(operationsAdvisory(s, model.batteryEnergyKwh), /Land now: battery reserve/);
  s.battery = 90; s.batteryC = 34.5;
  assert.match(operationsAdvisory(s, model.batteryEnergyKwh), /Land now: battery temperature/);
  s.batteryC = 10; s.flightSeconds = systemsModel.plannedFlightSeconds + 1;
  assert.match(operationsAdvisory(s, model.batteryEnergyKwh), /30 min/);
  s.flightSeconds = 0; s.elapsed = systemsModel.titanDaySeconds * 0.5;
  assert.match(operationsAdvisory(s, model.batteryEnergyKwh), /Night flight/);
  commandFlight(s, "land");
  advance(s, 60);
  assert.equal(operationsAdvisory(s, model.batteryEnergyKwh), "");
  assert.equal(s.flightSeconds, 0, "Flight timer resets after touchdown");
});
