import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState, stepFlight, commandFlight, advanceRest } from "../dist/flight-model.mjs";
import { startSample, canSampleHere, groundTypeAt, groundTypes, gnsUncertainty, scienceModel } from "../dist/science.mjs";
import { toggleDownlink, linkStatus, startRest, surveySite, dampGround, pools, systemsModel } from "../dist/mission-systems.mjs";

const run = (s, seconds, dt = 0.05) => { for (let t = 0; t < seconds; t += dt) stepFlight(s, dt); };
const grounded = () => { const s = createFlightState(); s.auto = false; s.throttle = 0.18; run(s, 0.1); return s; };

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

test("The seismometer records events during long quiet stays", () => {
  const s = grounded();
  assert.ok(startRest(s, 31));
  advanceRest(s, 31 * 3600);
  assert.ok(s.science.seismicEvents >= 1);
  assert.match(s.science.log.map(entry => entry.text).join(" "), /seismometer/);
});
