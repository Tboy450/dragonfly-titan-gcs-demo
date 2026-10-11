import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState, stepFlight, commandFlight, advanceRest } from "../dist/flight-model.mjs";
import { startSample, canSampleHere, groundTypeAt, groundTypes, gnsUncertainty, scienceModel, samplingSequence, samplingStages } from "../dist/science.mjs";
import { toggleDownlink, linkStatus, startRest, missionAction, surveySite, dampGround, pools, systemsModel } from "../dist/mission-systems.mjs";
import { setWeatherMode } from "../dist/weather.mjs";

const run = (s, seconds, dt = 0.05) => { for (let t = 0; t < seconds; t += dt) stepFlight(s, dt); };
const grounded = () => { const s = createFlightState(); s.auto = false; s.throttle = 0.18; setWeatherMode(s, "fixed"); run(s, 0.1); return s; };

test("Sampling stages are a pure, bounded projection of the existing science clock", () => {
  const s = grounded();
  assert.equal(samplingSequence(s).id, "idle");
  assert.equal(startSample(s), "");
  for (const [seconds, id] of [[0,"drill"], [9.999,"drill"], [10,"transfer"], [17.999,"transfer"], [18,"carousel"], [21.999,"carousel"], [22,"analysis"], [30,"analysis"]]) {
    s.science.sampleSeconds = seconds;
    const before = structuredClone(s);
    const job = samplingSequence(s);
    assert.equal(job.id, id);
    assert.equal(job.part, samplingStages[job.index].part);
    assert.ok(job.phase >= 0 && job.phase <= 1);
    assert.ok(job.drillFeed >= 0 && job.drillFeed <= 0.13);
    assert.deepEqual(s, before, "view derivation changes no state, energy or data");
  }
  s.science.sampleSeconds = 19;
  assert.ok(samplingSequence(s).drillFeed > 0);
  s.science.sampleSeconds = 20;
  assert.equal(samplingSequence(s).drillFeed, 0, "retracted before analysis");
  s.science.sampleSeconds = -5;
  assert.equal(samplingSequence(s).elapsed, 0);
  assert.equal(samplingSequence({}).id, "idle");
});

test("Sampling visualization freezes on pause and clears on interruption without an extra result", () => {
  const s = grounded();
  startSample(s);
  run(s, 12);
  s.hold = true;
  const paused = samplingSequence(s);
  run(s, 3);
  assert.deepEqual(samplingSequence(s), paused);
  s.hold = false;
  commandFlight(s, "takeoff");
  run(s, 5);
  assert.equal(samplingSequence(s).id, "idle");
  assert.equal(samplingSequence(s).drillFeed, 0);
  assert.equal(s.science.samples.length, 0);
  const complete = grounded();
  startSample(complete);
  run(complete, 31);
  assert.equal(samplingSequence(complete).id, "complete");
  assert.equal(samplingSequence(complete).drillFeed, 0);
  assert.equal(samplingSequence(complete).carouselAngle, Math.PI / 2);
  assert.equal(startSample(complete), "");
  assert.equal(samplingSequence(complete).id, "drill");
  assert.equal(samplingSequence(complete).carouselAngle, Math.PI / 2, "next sample retains the last indexed position");
});

test("Ground types follow the training geography", () => {
  assert.equal(groundTypeAt(surveySite.x, surveySite.z), groundTypes.outcrop);
  assert.equal(groundTypeAt(dampGround.x - dampGround.rx * 0.5, dampGround.z), groundTypes.damp);
  assert.equal(groundTypeAt(0, 0), groundTypes.sand);
  assert.equal(groundTypeAt(pools[0].x, pools[0].z), null);
});

test("DragonCam fills the data store in flight; DraGNS sharpens with counting time", () => {
  const s = grounded();
  const stored = s.dataStoredBits;
  commandFlight(s, "takeoff");
  run(s, 40);
  assert.ok(s.science.cameraFrames > 5);
  assert.ok(s.dataStoredBits - stored > scienceModel.cameraMbitPerSecond * 1e6 * 10, "flight imagery was stored");
  const landedState = grounded();
  run(landedState, 60);
  const early = gnsUncertainty(landedState);
  run(landedState, 600, 0.5);
  assert.ok(gnsUncertainty(landedState) < early, "longer counting gives a tighter DraGNS result");
});

test("Sampling needs dry, stationary ground, draws power and stores a result", () => {
  const flying = grounded();
  commandFlight(flying, "takeoff");
  run(flying, 5);
  assert.match(canSampleHere(flying), /Land/);
  const s = grounded();
  s.positionX = surveySite.x; s.positionZ = surveySite.z;
  run(s, 0.1);
  const baseline = s.power;
  const stored = s.dataStoredBits;
  assert.equal(startSample(s), "");
  run(s, 1);
  assert.ok(s.power - baseline > scienceModel.sampleW - 5, "DrACO and DraMS draw power");
  run(s, scienceModel.sampleSeconds);
  assert.equal(s.science.sampling, false);
  assert.equal(s.science.samples.at(-1).ground, groundTypes.outcrop.name);
  assert.ok(s.dataStoredBits - stored >= scienceModel.sampleMbit * 1e6);
  const interrupted = grounded();
  startSample(interrupted);
  commandFlight(interrupted, "takeoff");
  run(interrupted, 5);
  assert.equal(interrupted.science.sampling, false);
  assert.equal(interrupted.science.samples.length, 0);
});

test("Downlink sends the stored data and stops when the store is empty", () => {
  const s = grounded();
  s.dataStoredBits = 30000;
  assert.equal(toggleDownlink(s), true);
  run(s, systemsModel.antennaTravelSeconds + 15);
  assert.equal(s.downlinkActive, false, "session ends once everything is sent");
  assert.ok(s.dataStoredBits <= 0.001 + scienceModel.metMbitPerSecond * 1e6 * 20);
  assert.ok(s.dataReturnedBits >= 30000 - 1);
  s.dataStoredBits = 0;
  s.antennaDeploy = 0;
  assert.equal(toggleDownlink(s), false);
  assert.match(linkStatus(s).label, /nothing to send/);
});

test("Both sampling controls share one result, mission progress and instrument energy charge", () => {
  for (const control of ["mission", "science"]) {
    for (const dt of [0.05, 0.7]) {
      const s = grounded();
      s.positionX = surveySite.x; s.positionZ = surveySite.z;
      s.mission.phase = "sample";
      const stored = s.dataStoredBits;
      if (control === "mission") missionAction(s);
      else assert.equal(startSample(s), "");
      assert.equal(s.mission.phase, "sampling");
      assert.match(startSample(s), /already/);
      missionAction(s);
      let elapsed = 0, energy = 0;
      while (s.mission.phase === "sampling" && elapsed < 35) {
        stepFlight(s, dt);
        elapsed += dt;
        energy += s.sciencePowerW * dt;
        assert.equal(s.mission.sampleSeconds, s.science.sampleSeconds);
        assert.ok(Math.abs(s.power - (100 + 15 * s.fan ** 3 + s.sciencePowerW)) < 1e-8, "instrument power is included only once");
      }
      assert.equal(s.mission.phase, "return");
      assert.equal(s.mission.samples, 1);
      assert.equal(s.science.samples.length, 1);
      assert.equal(s.science.samples[0].result, groundTypes.outcrop.sample);
      const background = (scienceModel.metMbitPerSecond + scienceModel.gnsMbitPerSecond) * 1e6 * elapsed;
      assert.ok(Math.abs(s.dataStoredBits - stored - background - scienceModel.sampleMbit * 1e6) < 0.01, "exactly one sample data packet is stored");
      assert.ok(Math.abs(energy - scienceModel.sampleW * scienceModel.sampleSeconds) < 1e-6, "exactly 30 seconds of instrument energy is consumed");
      run(s, 2);
      assert.equal(s.science.samples.length, 1);
      assert.equal(toggleDownlink(s), true);
      run(s, systemsModel.antennaTravelSeconds + 2);
      assert.ok(s.dataReturnedBits > 0, "survey results are available to downlink");
    }
  }
});

test("Sampling elsewhere does not advance the guided survey", () => {
  const s = grounded();
  s.mission.phase = "sample";
  assert.equal(startSample(s), "");
  run(s, 31);
  assert.equal(s.mission.phase, "sample");
  assert.equal(s.mission.samples, 0);
  assert.equal(s.science.samples.length, 1);
  assert.equal(s.science.samples[0].ground, groundTypes.sand.name);
});

test("Hibernation is blocked during either sample job and available after completion", () => {
  for (const control of ["mission", "science"]) {
    const s = grounded();
    if (control === "mission") {
      s.positionX = surveySite.x; s.positionZ = surveySite.z;
      s.mission.phase = "sample";
      missionAction(s);
    } else assert.equal(startSample(s), "");
    assert.equal(startRest(s, 1), false);
    run(s, 5);
    const before = structuredClone(s);
    assert.equal(startRest(s, 192), false);
    assert.deepEqual(s, before);
    assert.equal(s.hibernating, false);
    assert.ok(s.sciencePowerW > 0);
    run(s, 26);
    assert.equal(s.science.samples.length, 1);
    assert.equal(startRest(s, 1), true);
  }
});

test("Interrupted samples reset both clocks without awarding data and can restart", () => {
  for (const interrupt of [s => { s.positionX += surveySite.radius * 2; }, s => { s.batteryC = 36; }, s => { s.hibernating = true; }]) {
    const s = grounded();
    s.positionX = surveySite.x; s.positionZ = surveySite.z;
    s.mission.phase = "sample";
    missionAction(s); run(s, 5);
    const stored = s.dataStoredBits;
    interrupt(s); stepFlight(s, 0.05);
    assert.equal(s.mission.phase, "sample");
    assert.equal(s.mission.samples, 0);
    assert.equal(s.mission.sampleSeconds, 0);
    assert.equal(s.science.sampleSeconds, 0);
    assert.equal(s.science.sampling, false);
    assert.equal(s.science.samples.length, 0);
    assert.ok(s.dataStoredBits - stored < 100, "no sample packet is awarded");
    s.positionX = surveySite.x; s.batteryC = 10; s.hibernating = false;
    assert.equal(startSample(s), "");
    run(s, 31);
    assert.equal(s.mission.phase, "return");
    assert.equal(s.science.samples.length, 1);
  }
});

test("Generic sampling also aborts if hibernation is forced, and cannot start with unsafe conditions", () => {
  const s = grounded();
  assert.equal(startSample(s), ""); run(s, 5);
  s.hibernating = true; stepFlight(s, 0.05);
  assert.equal(s.science.sampling, false);
  assert.equal(s.science.samples.length, 0);
  assert.equal(s.science.sampleSeconds, 0);
  for (const setup of [s => { s.battery = 20; }, s => { s.batteryC = 36; }, s => { s.hold = true; }, s => { s.hibernating = true; }]) {
    const blocked = grounded(); setup(blocked);
    assert.notEqual(startSample(blocked), "");
    assert.equal(blocked.science.sampling, false);
    blocked.mission.phase = "sample";
    blocked.positionX = surveySite.x; blocked.positionZ = surveySite.z;
    missionAction(blocked);
    assert.equal(blocked.mission.phase, "sample");
  }
});

test("The seismometer records events during long quiet stays", () => {
  const s = grounded();
  assert.ok(startRest(s, 31));
  advanceRest(s, 31 * 3600);
  assert.ok(s.science.seismicEvents >= 1);
  assert.match(s.science.log.map(entry => entry.text).join(" "), /seismometer/);
});
