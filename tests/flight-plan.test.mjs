import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState, stepFlight, estimateFlightPlan, takeManualControl, model } from "../dist/flight-model.mjs";
import { addWaypoint, uplinkPlan, planModel, siteById, isScouted, clearPlan } from "../dist/flight-plan.mjs";
import { systemsModel, candidateSites } from "../dist/mission-systems.mjs";

const grounded = () => { const s = createFlightState(); s.auto = false; s.throttle = 0.18; stepFlight(s, 0.05); return s; };
const run = (s, seconds, dt = 0.05, each = () => {}) => { for (let t = 0; t < seconds; t += dt) { stepFlight(s, dt); each(s); } };
const flyUntil = (s, done, limit = 3600, dt = 0.05, each = () => {}) => {
  for (let t = 0; t < limit; t += dt) { stepFlight(s, dt); each(s); if (done(s)) return t; }
  return Infinity;
};
const site = (id) => siteById(id);

test("Plan checks enforce waypoints, leapfrog landing, daylight and energy", () => {
  const s = grounded();
  assert.equal(estimateFlightPlan(s).go, false, "An empty plan is NO-GO");
  addWaypoint(s, 0, 0, "a");
  let estimate = estimateFlightPlan(s);
  assert.equal(estimate.go, false);
  assert.match(estimate.issues.map(i => i.text).join(" "), /scouted site/, "Landing at an unscouted site breaks the leapfrog rule");
  clearPlan(s);
  addWaypoint(s, 0, 0, "a");
  addWaypoint(s, 0, 0, "outcrop");
  estimate = estimateFlightPlan(s);
  assert.equal(estimate.go, true, estimate.issues.map(i => i.text).join("; "));
  assert.deepEqual(estimate.scouts, ["Site A"]);
  assert.ok(estimate.energyWh > 0 && estimate.timeSeconds > 0);

  const night = grounded();
  night.elapsed = systemsModel.titanDaySeconds * 0.5;
  addWaypoint(night, 0, 0, "outcrop");
  assert.match(estimateFlightPlan(night).issues.map(i => i.text).join(" "), /night/);

  const far = grounded();
  far.plan.altitude = 400;
  far.battery = 30;
  for (const id of ["f", "b", "f", "b", "base"]) addWaypoint(far, 0, 0, id);
  const long = estimateFlightPlan(far);
  assert.equal(long.go, false, "A long flight on a low battery breaks the reserve");
  assert.match(long.issues.map(i => i.text).join(" "), /reserve/);
  assert.ok(long.timeSeconds > 20 * 60 && long.timeSeconds < systemsModel.plannedFlightSeconds, "about 12 km at 400 m fits the 30 min limit");
  assert.ok(addWaypoint(far, 0, 0, "outcrop"), "A sixth waypoint is allowed");
  assert.equal(addWaypoint(far, 0, 0, "outcrop"), false, "No more than six waypoints");
});

test("An uplinked plan waits for the signal, flies itself, scouts a site and lands on target", () => {
  const s = grounded();
  addWaypoint(s, 0, 0, "a");
  addWaypoint(s, 0, 0, "outcrop");
  const estimate = estimateFlightPlan(s);
  assert.ok(uplinkPlan(s, estimate));
  run(s, planModel.uplinkSeconds - 1);
  assert.equal(s.plan.status, "uplinking");
  assert.equal(s.altitude, 0, "No liftoff while the plan is in transit");
  let maxAltitude = 0, maxStep = 0, previous = s.altitude;
  const elapsed = flyUntil(s, x => x.plan.status === "complete", 3600, 0.05, (x) => {
    maxAltitude = Math.max(maxAltitude, x.altitude);
    maxStep = Math.max(maxStep, Math.abs(x.altitude - previous));
    previous = x.altitude;
  });
  assert.ok(Number.isFinite(elapsed), `plan completes (status ${s.plan.status}, phase ${s.plan.phase})`);
  assert.ok(maxAltitude > s.plan.altitude - 5 && maxAltitude < s.plan.altitude + 5, `cruise near ${s.plan.altitude} m (max ${maxAltitude.toFixed(1)})`);
  assert.ok(maxStep < 0.2, "altitude never jumps");
  const target = site("outcrop");
  assert.ok(Math.hypot(s.positionX - target.x, s.positionZ - target.z) <= planModel.landingCircle, "lands inside the safe landing circle");
  assert.ok(isScouted(s, "a"), "Site A was scouted on the way");
  assert.deepEqual(s.plan.report.scouted, ["Site A"]);
  const ratio = s.plan.report.energyWh / estimate.energyWh;
  assert.ok(ratio > 0.75 && ratio < 1.35, `actual energy within the estimate's range (ratio ${ratio.toFixed(2)})`);

  // Leapfrog: the scouted site is now a legal landing site.
  addWaypoint(s, 0, 0, "a");
  assert.equal(s.plan.status, "draft", "Adding a waypoint after a flight starts a new plan");
  assert.equal(s.plan.waypoints.length, 1);
  const next = estimateFlightPlan(s);
  assert.equal(next.go, true, next.issues.map(i => i.text).join("; "));
});

test("Manual control or a flight command stops an executing plan", () => {
  const s = grounded();
  addWaypoint(s, 0, 0, "outcrop");
  uplinkPlan(s, estimateFlightPlan(s));
  run(s, planModel.uplinkSeconds + 20);
  assert.equal(s.plan.status, "executing");
  assert.ok(s.altitude > 5);
  takeManualControl(s);
  assert.equal(s.plan.status, "aborted");
  run(s, 1);
  assert.notEqual(s.mode, "Autonomous climb");
});

test("The autopilot lands now when energy is about to run out", () => {
  const s = grounded();
  addWaypoint(s, 0, 0, "outcrop");
  uplinkPlan(s, estimateFlightPlan(s));
  run(s, planModel.uplinkSeconds + 40);
  assert.equal(s.plan.status, "executing");
  s.battery = systemsModel.reservePercent + 3.5;
  flyUntil(s, x => x.plan.status !== "executing", 900);
  assert.equal(s.plan.status, "complete");
  assert.equal(s.plan.report.landNow, true);
  assert.equal(s.altitude, 0);
});

test("Candidate landing sites are level and dry", async () => {
  const { terrainHeight } = await import("../dist/titan-terrain.mjs");
  const { overLiquid } = await import("../dist/mission-systems.mjs");
  for (const candidate of candidateSites.filter(c => !["base", "outcrop"].includes(c.id))) {
    const center = terrainHeight(candidate.x, candidate.z);
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2;
      assert.ok(Math.abs(terrainHeight(candidate.x + Math.cos(a) * 9, candidate.z + Math.sin(a) * 9) - center) < 1e-9, `${candidate.name} is level`);
    }
    assert.equal(overLiquid(candidate.x, candidate.z), false);
  }
  assert.equal(model.batteryEnergyKwh, 11.5);
});

test("Land-now allows for the descent from cruise altitude and lands above the reserve", () => {
  const s = grounded();
  s.plan.altitude = 400;
  addWaypoint(s, 0, 0, "outcrop");
  uplinkPlan(s, estimateFlightPlan(s));
  flyUntil(s, x => x.plan.phase === "cruise", 900);
  assert.ok(s.altitude > 390, `reached cruise altitude (${s.altitude.toFixed(0)} m)`);
  // Enough energy for roughly six minutes: over the old fixed 3-minute trigger, but the
  // ~5-minute descent from 400 m needs it now.
  s.battery = systemsModel.reservePercent + 7;
  run(s, 0.1);
  assert.equal(s.plan.landNow, true, "land-now starts immediately at 400 m");
  let lowest = s.battery;
  flyUntil(s, x => x.plan.status !== "executing", 1200, 0.05, (x) => { lowest = Math.min(lowest, x.battery); });
  assert.equal(s.plan.status, "complete", `plan ${s.plan.status}: ${s.plan.message}`);
  assert.equal(s.altitude, 0);
  assert.ok(lowest > systemsModel.reservePercent, `stays above the reserve (lowest ${lowest.toFixed(2)}%)`);
});
