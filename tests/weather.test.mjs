import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState, stepFlight, advanceRest, estimateFlightPlan } from "../dist/flight-model.mjs";
import { startRest, systemsModel } from "../dist/mission-systems.mjs";
import { addWaypoint } from "../dist/flight-plan.mjs";
import { createWeatherState, stepWeather, setFixedWind, setWeatherMode, startStormTraining, weatherAdvisory, weatherModel, weatherPhase } from "../dist/weather.mjs";
import { snapshotState, restoreState } from "../dist/save-game.mjs";

const grounded = seed => Object.assign(createFlightState({ weatherSeed: seed }), { auto: false, throttle: 0.18 });
const total = event => event.warning + event.rise + event.peak + event.recovery;

test("Seeded weather is reproducible, with different schedules for different seeds", () => {
  const a = grounded(123), b = grounded(123), c = grounded(124);
  assert.notEqual(a.weather.waitSeconds, c.weather.waitSeconds);
  for (let t = 0; t < 3000; t++) { stepWeather(a, 1); stepWeather(b, 1); }
  assert.deepEqual(a.weather, b.weather);
  assert.equal(a.wind, b.wind);
  assert.ok(a.weather.log.length > 0);
});

test("Automatic weather always warns, changes smoothly, and never exceeds normal wind bounds", () => {
  const s = grounded(15);
  const kinds = new Set();
  let previous = s.wind, previousEvent = null;
  for (let t = 0; t < 100000; t += 1) {
    stepWeather(s, 1);
    assert.ok(s.wind >= 0 && s.wind <= systemsModel.maxSurfaceWind);
    for (const key of ["intensity", "haze", "rain", "wetness"]) assert.ok(s.weather[key] >= 0 && s.weather[key] <= 1);
    assert.ok(Math.abs(s.wind - previous) < 0.1, "no sudden wind jump");
    const event = s.weather.event;
    if (event && event !== previousEvent) {
      assert.equal(weatherPhase(s), "warning");
      assert.equal(s.wind, s.weather.baseWind);
      assert.match(weatherAdvisory(s), /compressed training forecast/);
      assert.notEqual(event.kind, "training", "strong stress events never start randomly");
      kinds.add(event.kind);
    }
    previous = s.wind;
    previousEvent = event;
  }
  assert.deepEqual([...kinds].sort(), ["gust", "rain"], "includes rarer rain scenarios, not just gusts");
});

test("Strong storms warn before wind, then build, peak and recover with residual wetting", () => {
  const s = grounded(27);
  assert.equal(startStormTraining(s), "");
  const event = s.weather.event;
  assert.equal(weatherPhase(s), "warning");
  assert.match(weatherAdvisory(s), /land before strong winds/);
  const base = s.wind;
  stepWeather(s, event.warning - 1);
  assert.equal(s.wind, base);
  assert.equal(s.weather.rain, 0);
  stepWeather(s, 2);
  assert.equal(weatherPhase(s), "building");
  assert.ok(s.wind > base && s.wind < base + 0.01);
  stepWeather(s, event.rise);
  assert.equal(weatherPhase(s), "peak");
  assert.ok(s.wind > systemsModel.maxSurfaceWind && s.wind <= weatherModel.trainingMaxWind);
  assert.equal(s.weather.haze, 1);
  assert.equal(s.weather.rain, 1);
  stepWeather(s, event.peak);
  assert.equal(weatherPhase(s), "recovery");
  stepWeather(s, event.recovery);
  assert.equal(weatherPhase(s), "quiet");
  assert.equal(s.wind, base);
  assert.equal(s.weather.haze, 0);
  assert.equal(s.weather.rain, 0);
  const wet = s.weather.wetness;
  assert.ok(wet > 0);
  setWeatherMode(s, "fixed");
  stepWeather(s, weatherModel.drySeconds);
  assert.ok(Math.abs(s.weather.wetness - wet / Math.E) < 1e-10, "wet ground fades gradually rather than vanishing with the cloud");
});

test("Fixed wind disables automatic events and preserves slider/console stress tests", () => {
  const s = grounded(42);
  startStormTraining(s);
  stepWeather(s, 400);
  setFixedWind(s, 3.2);
  stepWeather(s, 5000);
  assert.equal(s.wind, 3.2);
  assert.equal(s.weather.event, null);
  assert.equal(s.weather.mode, "fixed");
  assert.equal(weatherAdvisory(s), "");
  s.wind = 0.5;
  stepWeather(s, 1);
  assert.equal(s.wind, 0.5, "direct wind changes keep the original behavior");
  setWeatherMode(s, "natural");
  assert.equal(s.weather.mode, "natural");
  assert.ok(s.weather.waitSeconds >= weatherModel.quietMinSeconds);
});

test("Weather freezes on pause and during arrival", () => {
  const s = grounded(5);
  startStormTraining(s);
  s.hold = true;
  const before = structuredClone(s.weather);
  stepFlight(s, 1);
  assert.deepEqual(s.weather, before);
  s.hold = false;
  s.edl = { title: "Arrival" };
  assert.match(startStormTraining(s), /Finish arrival/);
  stepFlight(s, 1);
  assert.deepEqual(s.weather, before);
});

test("Gusts feed the real heat balance instead of inventing warm/cold ambient fronts", () => {
  const calm = grounded(1), storm = grounded(1);
  setFixedWind(calm, 0.8);
  startStormTraining(storm);
  storm.weather.event.seconds = storm.weather.event.warning + storm.weather.event.rise;
  for (const s of [calm, storm]) { s.thermalAuto = false; s.trim = 0.4; }
  for (let t = 0; t < 60; t += 0.1) { stepFlight(calm, 0.1); stepFlight(storm, 0.1); }
  assert.ok(storm.convectionH > calm.convectionH);
  assert.ok(storm.ductUA > calm.ductUA);
  assert.ok(storm.coreC < calm.coreC, "wind changes cooling and therefore actual temperature");
  assert.equal(systemsModel.ambientC, -179.15);
});

test("Accelerated rest stops at the first new advisory so it cannot skip the warning", () => {
  const s = grounded(100);
  s.weather.waitSeconds = 2;
  assert.ok(startRest(s, 1));
  advanceRest(s, 600);
  assert.equal(s.restSeconds, 0);
  assert.equal(weatherPhase(s), "warning");
  assert.equal(s.weather.event.seconds, 0);
  assert.match(s.restNotice, /Weather advisory/);
  assert.ok(s.elapsed <= 2);
});

test("Plans hold on optional strong storm warnings, while ordinary gusts remain cautions", () => {
  const s = grounded(1);
  addWaypoint(s, 0, 0, "outcrop");
  assert.ok(estimateFlightPlan(s).go);
  startStormTraining(s);
  const blocked = estimateFlightPlan(s);
  assert.equal(blocked.go, false);
  assert.ok(blocked.issues.some(issue => issue.level === "no-go" && /storm training/.test(issue.text)));
  stepWeather(s, total(s.weather.event));
  assert.ok(estimateFlightPlan(s).go);
  s.weather.waitSeconds = 0;
  stepWeather(s, 1);
  assert.ok(estimateFlightPlan(s).go);
  assert.ok(estimateFlightPlan(s).issues.some(issue => issue.level === "caution" && /Weather advisory/.test(issue.text)));
});

test("Weather phase, random sequence and rain wetness persist; legacy saves retain fixed wind", () => {
  const s = grounded(88);
  startStormTraining(s);
  stepWeather(s, 430);
  const fresh = grounded(99);
  assert.ok(restoreState(fresh, JSON.parse(JSON.stringify(snapshotState(s)))));
  assert.deepEqual(fresh.weather, s.weather);
  assert.equal(fresh.wind, s.wind);
  stepWeather(s, 10); stepWeather(fresh, 10);
  assert.deepEqual(fresh.weather, s.weather);
  const legacy = snapshotState(s);
  delete legacy.values.weather;
  const old = grounded(33);
  assert.ok(restoreState(old, legacy));
  assert.equal(old.weather.mode, "fixed");
  assert.equal(old.wind, s.wind);
  const malformed = snapshotState(s);
  malformed.values.weather.seed = -1;
  const before = JSON.stringify(old);
  assert.equal(restoreState(old, malformed), false);
  assert.equal(JSON.stringify(old), before);
  assert.ok(createWeatherState(1).seed >= 0);
});

test("Ordinary scheduled events save during every phase, including fractional schedule boundaries", () => {
  const s = grounded(450);
  stepWeather(s, Math.ceil(s.weather.waitSeconds));
  for (let i = 0; i < 450; i++) {
    const fresh = grounded(999);
    assert.ok(restoreState(fresh, snapshotState(s)));
    assert.deepEqual(fresh.weather, s.weather);
    stepWeather(s, 1);
  }
  for (const change of [
    values => { values.wind += 0.1; },
    values => { values.weather.baseWind = 4; },
    values => { values.weather.event = { kind: "rain", seconds: 0, warning: 60, rise: 90, peak: 120, recovery: 180, peakWind: 4.5, gustPhase: 0 }; },
  ]) {
    const malformed = snapshotState(s);
    change(malformed.values);
    const fresh = grounded(99), before = JSON.stringify(fresh);
    assert.equal(restoreState(fresh, malformed), false);
    assert.equal(JSON.stringify(fresh), before);
  }
});

test("Large time-warp weather steps match bounded one-second stepping", () => {
  const a = grounded(17), b = grounded(17);
  stepWeather(a, 5400);
  for (let t = 0; t < 5400; t++) stepWeather(b, 1);
  assert.deepEqual(a.weather, b.weather);
  assert.equal(a.wind, b.wind);
});
