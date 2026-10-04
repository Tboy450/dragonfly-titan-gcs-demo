import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState, stepFlight, estimateFlightPlan, commandFlight } from "../dist/flight-model.mjs";
import { beginExpedition, prepareExpeditionRoute, atExpeditionSite, sampleReturned, sampleRemainingBits } from "../dist/expedition.mjs";
import { uplinkPlan } from "../dist/flight-plan.mjs";
import { startSample, scienceModel } from "../dist/science.mjs";
import { startRest, toggleDownlink } from "../dist/mission-systems.mjs";
import { snapshotState, restoreState } from "../dist/save-game.mjs";

const grounded = () => Object.assign(createFlightState(), { auto: false, throttle: 0.18 });
function until(state, predicate, limit = 900, dt = 0.1) {
  for (let t = 0; t < limit && !predicate(); t += dt) stepFlight(state, dt);
  assert.ok(predicate(), `Timed out: stage ${state.expedition.step}, plan ${state.plan.status}, ${state.plan.message}, battery ${state.battery}, temperature ${state.batteryC}`);
}
function collect(state) {
  const count = state.science.samples.length;
  assert.equal(startSample(state), "");
  until(state, () => state.science.samples.length > count, 40);
}
function flyRoute(state) {
  assert.equal(prepareExpeditionRoute(state), "");
  const estimate = estimateFlightPlan(state);
  assert.ok(estimate.go, JSON.stringify(estimate.issues));
  assert.ok(uplinkPlan(state, estimate));
  until(state, () => state.plan.status === "complete");
  assert.ok(state.throttle < 0.3, "completed plan idles the rotors without a reload");
  stepFlight(state, 0.1);
  assert.ok(state.power < 500, "surface operations must not keep drawing flight power");
}
function reload(state) {
  const fresh = createFlightState();
  assert.ok(restoreState(fresh, JSON.parse(JSON.stringify(snapshotState(state)))));
  return fresh;
}

test("First expedition flies, scouts, samples three sites, reloads and downlinks actual records", () => {
  let s = grounded();
  assert.equal(beginExpedition(s), "");
  collect(s);
  assert.equal(s.expedition.step, 1);
  assert.equal(s.expedition.notebook[0].siteId, "base");
  assert.equal(prepareExpeditionRoute(s), "");
  assert.deepEqual(s.plan.waypoints.map(p => p.siteId), ["damp", "base"]);
  assert.ok(uplinkPlan(s, estimateFlightPlan(s)));
  until(s, () => s.expedition.step === 2);
  assert.ok(s.scoutedSites.includes("damp"));
  assert.ok(atExpeditionSite(s, "base"), "scouting flight returned to known ground");

  s = reload(s);
  assert.equal(s.expedition.step, 2);
  flyRoute(s);
  assert.ok(atExpeditionSite(s, "damp"));
  collect(s);
  assert.equal(s.expedition.step, 3);
  flyRoute(s);
  assert.ok(atExpeditionSite(s, "outcrop"));
  collect(s);
  assert.equal(s.expedition.step, 4);
  flyRoute(s);
  assert.equal(s.expedition.step, 5);
  assert.ok(atExpeditionSite(s, "base"));
  assert.deepEqual(s.expedition.notebook.map(r => r.ice), [12, 8, 60]);
  assert.deepEqual(s.expedition.notebook.map(r => r.siteId), ["base", "damp", "outcrop"]);
  assert.ok(s.expedition.notebook.every(r => !sampleReturned(s, r)), "collection alone does not finish the expedition");
  assert.ok(toggleDownlink(s));
  until(s, () => s.dataReturnedBits > 1e6, 1000, 1);
  s = reload(s);
  assert.equal(s.expedition.status, "active");
  assert.equal(s.downlinkActive, false, "reloaded mission must explicitly resume its link");
  assert.ok(toggleDownlink(s));
  until(s, () => s.expedition.status === "complete", 120000, 1);
  assert.ok(s.expedition.notebook.every(r => sampleReturned(s, r)));
  assert.ok(s.expedition.energyWh > 0 && s.expedition.flightSeconds > 100);
  assert.ok(s.expedition.peakBatteryC >= 10 && s.expedition.finishedAt > s.expedition.startedAt);
  const report = structuredClone(s.expedition);
  s = reload(s);
  stepFlight(s, 1);
  assert.deepEqual(s.expedition, report, "completed debrief remains frozen after reload");
});

test("Only new site-linked samples count; interruption and hibernation cannot create a sample", () => {
  const s = grounded();
  collect(s);
  assert.equal(beginExpedition(s), "");
  stepFlight(s, 0.1);
  assert.equal(s.expedition.notebook.length, 0, "earlier free-flight samples are not retroactively awarded");
  assert.equal(startSample(s), "");
  assert.equal(startRest(s, 1), false, "hibernation cannot bypass the sampling energy cost");
  commandFlight(s, "takeoff");
  until(s, () => !s.science.sampling, 10);
  assert.equal(s.expedition.notebook.length, 0);
  s.hold = true;
  const before = structuredClone(s.expedition);
  stepFlight(s, 1);
  assert.deepEqual(s.expedition, before, "pause freezes expedition metrics");
  assert.match(prepareExpeditionRoute(s), /Land/);
});

test("Sample FIFO boundaries exclude old returned data and count partial downlinks", () => {
  const s = grounded();
  s.dataReturnedBits = 9e9;
  assert.equal(beginExpedition(s), "");
  collect(s);
  const record = s.expedition.notebook[0];
  assert.ok(record.downlinkEndBits > 9e9 + scienceModel.sampleMbit * 1e6);
  assert.equal(sampleReturned(s, record), false);
  assert.equal(sampleRemainingBits(s, record), scienceModel.sampleMbit * 1e6);
  s.dataReturnedBits = record.downlinkEndBits - 10e6;
  assert.equal(sampleRemainingBits(s, record), 10e6);
  assert.equal(sampleReturned(s, record), false);
  s.dataReturnedBits = record.downlinkEndBits;
  assert.equal(sampleRemainingBits(s, record), 0);
  assert.equal(sampleReturned(s, record), true);
});

test("Expedition save extension accepts legacy saves and rejects malformed new progress atomically", () => {
  const s = grounded();
  const old = snapshotState(s);
  delete old.values.expedition;
  const fresh = createFlightState();
  assert.ok(restoreState(fresh, old));
  assert.equal(fresh.expedition.status, "idle");
  const malformed = snapshotState(s);
  malformed.values.expedition.step = 99;
  const before = JSON.stringify(fresh);
  assert.equal(restoreState(fresh, malformed), false);
  assert.equal(JSON.stringify(fresh), before);
  malformed.values.expedition = null;
  assert.equal(restoreState(fresh, malformed), false);
});
