import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState, advanceRest } from "../dist/flight-model.mjs";
import { systemsModel, operationsAdvisory } from "../dist/mission-systems.mjs";
import { titanDayNumber, hoursUntilDawn, dayPhase, updateDayLog, sleepUntilMorning, finishNight, sleepStepSeconds } from "../dist/titan-day.mjs";
import { titanLocalHour } from "../dist/mission-systems.mjs";
import { setWeatherMode } from "../dist/weather.mjs";

const day = systemsModel.titanDaySeconds;
const landedState = () => Object.assign(createFlightState(), { altitude: 0, speed: 0, verticalSpeed: 0, throttle: 0, auto: false, mode: "Surface" });

test("The operations day runs dawn to dawn from a noon start", () => {
  const state = landedState();
  assert.equal(titanDayNumber(state), 1);
  assert.equal(dayPhase(state), "Afternoon");
  assert.ok(Math.abs(hoursUntilDawn(state) - 0.75 * day / 3600) < 1e-6);
  state.elapsed = 0.75 * day + 1;
  assert.equal(titanDayNumber(state), 2);
  assert.equal(dayPhase(state), "Morning");
  state.elapsed = 0.5 * day;
  assert.equal(dayPhase(state), "Night");
});

test("The day checklist counts flights, downlinks and samples, and resets at dawn", () => {
  const state = landedState();
  updateDayLog(state);
  state.altitude = 20; updateDayLog(state);
  state.altitude = 0; updateDayLog(state);
  assert.equal(state.dayLog.flights, 1);
  state.altitude = 15; updateDayLog(state);
  assert.equal(state.dayLog.flights, 2);
  assert.match(operationsAdvisory(state, 5), /one flight per Titan day/);
  state.altitude = 0;
  state.dataReturnedBits = (state.dataReturnedBits || 0) + 1e6;
  state.science.samples.push({ ground: "test" });
  updateDayLog(state);
  assert.ok(state.dayLog.downlinked && state.dayLog.sampled);
  state.elapsed = 0.75 * day + 10;
  updateDayLog(state);
  assert.equal(state.dayLog.day, 2);
  assert.equal(state.dayLog.flights, 0);
  assert.ok(!state.dayLog.downlinked && !state.dayLog.sampled);
});

test("Sleep until morning recharges, logs the night, wakes at 08:00 and reports", () => {
  const state = landedState();
  setWeatherMode(state, "fixed"); // a calm night (weather can stop fast-forwarding; see below)
  state.battery = 55;
  assert.ok(sleepUntilMorning(state));
  let frames = 0, report = "";
  while (state.wakeAtMorning && frames < 2000) {
    advanceRest(state, sleepStepSeconds);
    report = finishNight(state) || report;
    frames++;
  }
  assert.ok(frames < 500, `took ${frames} frames`);
  assert.equal(state.hibernating, false);
  assert.equal(titanDayNumber(state), 2);
  assert.ok(Math.abs(titanLocalHour(state) - 8) < 0.01, "woke at 08:00 local, after sunrise");
  assert.ok(state.battery > 90);
  assert.match(report, /Morning, Titan day 2: battery 55% to \d+%, \d+ seismic events?/);
});

test("A weather warning stops the night early; the lander stays asleep and the report says why", () => {
  const state = landedState(); // natural weather: the default seed brings an event during the night
  assert.ok(sleepUntilMorning(state));
  let frames = 0, report = "";
  while (state.wakeAtMorning && frames < 2000) {
    advanceRest(state, sleepStepSeconds);
    report = finishNight(state) || report;
    frames++;
  }
  assert.match(state.restNotice, /Accelerated time stopped/);
  assert.equal(state.hibernating, true, "still asleep, for the owner to wake or sleep again");
  assert.match(report, /^Sleep stopped early: .+ The lander is still asleep/);
  assert.equal(state.mission.message, report);
});
