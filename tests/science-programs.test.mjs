import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState, stepFlight, commandFlight } from "../dist/flight-model.mjs";
import { sciencePrograms, scienceEnergyBetween } from "../dist/science-programs.mjs";
import { selectScienceProgram, startSample, cancelSample, samplingSequence, stepScience, canAccelerateScience, sampleTransmission } from "../dist/science.mjs";
import { snapshotState, restoreState } from "../dist/save-game.mjs";
import { missionAction, surveySite } from "../dist/mission-systems.mjs";
import { setWeatherMode } from "../dist/weather.mjs";
import { inspectionTarget, createInspector } from "../dist/vehicle-inspector.mjs";

const grounded = () => {
  const s = createFlightState(); Object.assign(s, { auto: false, throttle: 0.18 });
  setWeatherMode(s, "fixed"); stepFlight(s, 0.05); return s;
};
const near = (actual, expected, tolerance = 1e-7) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} vs ${expected}`);

test("Training profiles have contiguous stages and exact budgets, including cross-boundary steps", () => {
  for (const p of Object.values(sciencePrograms)) {
    assert.equal(p.stages[0].start, 0);
    p.stages.forEach((stage, i) => { assert.ok(stage.end > stage.start); if (i) assert.equal(stage.start, p.stages[i - 1].end); });
    near(scienceEnergyBetween(p, 0, p.seconds + 100), p.energyWh * 3600);
    const s = grounded(); selectScienceProgram(s, p.id); startSample(s);
    let joules = 0;
    while (s.science.sampling) { stepScience(s, 137); joules += s.sciencePowerW * 137; }
    near(joules, p.energyWh * 3600);
    near(s.science.jobEnergyWh, p.energyWh);
    assert.equal(s.science.samples.length, 1);
    assert.equal(s.science.samples[0].programId, p.id);
    assert.equal(s.science.samples[0].durationSeconds, p.seconds);
    assert.equal(samplingSequence(s).complete, true);
    stepScience(s, 137);
    assert.equal(s.sciencePowerW, 0);
    assert.equal(s.scienceHeatW, 0);
    assert.equal(s.science.samples.length, 1);
  }
});

test("LDMS and GCMS run through real flight/system steps with one power charge and bay heat", () => {
  for (const id of ["ldms", "gcms"]) {
    const s = grounded(), control = structuredClone(s), p = sciencePrograms[id];
    selectScienceProgram(s, id); assert.equal(startSample(s), "");
    let joules = 0, sawAnalysis = false, sawCooldown = false, peakExtraBayC = 0;
    for (let t = 0; t < p.seconds + 0.05; t += 0.05) {
      const job = samplingSequence(s);
      sawAnalysis ||= job.id === "analysis"; sawCooldown ||= job.id === "cooldown";
      stepFlight(s, 0.05); stepFlight(control, 0.05);
      joules += s.sciencePowerW * 0.05;
      peakExtraBayC = Math.max(peakExtraBayC, s.coreC - control.coreC);
      near(s.power, 100 + 15 * s.fan ** 3 + s.sciencePowerW);
      near(s.scienceHeatW, s.sciencePowerW * p.heatFraction);
      near(s.heatInW - s.generatorToBayW, (s.power - s.sciencePowerW) * 0.025 + s.scienceHeatW);
    }
    near(joules / 3600, p.energyWh, 1e-6);
    assert.ok(sawAnalysis && sawCooldown);
    assert.equal(s.science.samples.length, 1);
    assert.ok(s.battery < control.battery);
    assert.ok(peakExtraBayC > 0.05, "instrument heat reaches the bay before its controller compensates");
    assert.ok(s.batteryC < 35 && s.coreC < 55);
  }
});

test("Profiles are locked during a job; cancellation never creates a sample or restores spent energy", () => {
  const s = grounded();
  assert.equal(selectScienceProgram(s, "unknown"), false);
  selectScienceProgram(s, "gcms"); startSample(s);
  assert.equal(selectScienceProgram(s, "ldms"), false);
  for (let i = 0; i < 100; i++) stepFlight(s, 0.05);
  const battery = s.battery, spent = s.science.jobEnergyWh;
  s.timeWarp = 100;
  assert.equal(cancelSample(s), true);
  assert.equal(cancelSample(s), false);
  assert.equal(s.timeWarp, 1);
  assert.equal(s.battery, battery);
  assert.equal(s.science.jobEnergyWh, spent);
  assert.equal(s.science.samples.length, 0);
  stepFlight(s, 0.05);
  assert.equal(s.sciencePowerW, 0);
  assert.equal(selectScienceProgram(s, "ldms"), true);
});

test("Pause, faults, movement and flight commands safely interrupt extended operations", () => {
  const paused = grounded(); selectScienceProgram(paused, "ldms"); startSample(paused);
  paused.hold = true; const before = structuredClone(paused); stepFlight(paused, 5); assert.deepEqual(paused, before);
  for (const change of [s => s.battery = 19, s => s.batteryC = 36, s => s.coreC = 60,
    s => s.positionX += 2, s => s.hibernating = true, s => commandFlight(s, "takeoff")]) {
    const s = grounded(); selectScienceProgram(s, "gcms"); startSample(s); change(s);
    for (let i = 0; i < 40 && s.science.sampling; i++) stepFlight(s, 0.05);
    assert.equal(s.science.sampling, false);
    assert.equal(s.science.samples.length, 0);
    assert.equal(canAccelerateScience(s), false);
  }
  assert.equal(canAccelerateScience(paused), true, "hold freezes steps without forgetting the job");
  paused.auto = true; assert.equal(canAccelerateScience(paused), false);
});

test("Mission sampling uses the selected profile and keeps its original site and one data boundary", () => {
  const s = grounded(); s.positionX = surveySite.x; s.positionZ = surveySite.z; s.mission.phase = "sample";
  selectScienceProgram(s, "gcms"); missionAction(s);
  assert.equal(s.mission.phase, "sampling");
  stepScience(s, 900); assert.equal(s.science.sampling, true);
  assert.equal(s.mission.sampleSeconds, s.science.sampleSeconds);
  stepScience(s, 900);
  assert.equal(s.mission.phase, "return"); assert.equal(s.mission.samples, 1);
  const sample = s.science.samples[0];
  assert.equal(sample.siteId, "outcrop"); assert.equal(sample.x, surveySite.x);
  assert.equal(sampleTransmission(s, sample), "Queued for downlink");
  s.dataReturnedBits = sample.downlinkEndBits - sample.dataMbit * 1e6 / 2;
  assert.equal(sampleTransmission(s, sample), "50% transmitted");
  s.dataReturnedBits = sample.downlinkEndBits;
  assert.equal(sampleTransmission(s, sample), "Sent to Earth");
  assert.match(sampleTransmission(s, {}), /unavailable/);
});

test("Camera follow and visual phases use extended stages, including preparation and cooldown", () => {
  const s = grounded(); selectScienceProgram(s, "gcms"); startSample(s);
  s.inspector = { ...createInspector(), followSampling: true };
  for (const stage of sciencePrograms.gcms.stages) {
    s.science.sampleSeconds = (stage.start + stage.end) / 2;
    const job = samplingSequence(s);
    assert.equal(job.id, stage.id); assert.equal(inspectionTarget(s), stage.part);
    near(job.phase, 0.5);
    if (stage.start >= 210) { assert.equal(job.drillFeed, 0); near(job.carouselAngle, Math.PI / 2); }
  }
});

test("Saved selections and records survive, active work aborts on reload, and malformed extensions fail atomically", () => {
  const s = grounded(); selectScienceProgram(s, "gcms"); startSample(s); stepScience(s, 1800);
  const saved = snapshotState(s), fresh = grounded();
  assert.equal(restoreState(fresh, saved), true);
  assert.deepEqual(fresh.science.samples, s.science.samples); assert.equal(fresh.science.programId, "gcms");
  startSample(s); stepScience(s, 100);
  assert.equal(restoreState(fresh, snapshotState(s)), true);
  assert.equal(fresh.science.sampling, false); assert.equal(fresh.science.sampleSeconds, 0);
  assert.equal(fresh.science.samples.length, 1); assert.equal(fresh.sciencePowerW, 0);
  const legacy = structuredClone(saved);
  for (const key of ["programId", "jobProgram", "jobEnergyWh", "sampleOrigin"]) delete legacy.values.science[key];
  legacy.values.science.samples = [];
  assert.equal(restoreState(fresh, legacy), true); assert.equal(fresh.science.programId, "demo");
  for (const change of [s => s.programId = "bad", s => s.jobEnergyWh = -1, s => s.sampleOrigin = { x: "bad" }, s => s.samples[0].energyWh = "x"]) {
    const broken = structuredClone(saved); change(broken.values.science);
    const before = structuredClone(fresh); assert.equal(restoreState(fresh, broken), false); assert.deepEqual(fresh, before);
  }
});
