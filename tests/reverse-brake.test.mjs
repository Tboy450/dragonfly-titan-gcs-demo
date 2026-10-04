import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState, stepFlight, commandFlight, flightPower, model } from "../dist/flight-model.mjs";
import { pools } from "../dist/mission-systems.mjs";
import { snapshotState, restoreState } from "../dist/save-game.mjs";

const climbing = enabled => Object.assign(createFlightState(), {
  auto: false, throttle: 0, altitude: 10, verticalSpeed: 3, reverseBrakeEnabled: enabled,
});

test("A tiny opt-in reverse pulse measurably arrests upward momentum sooner", () => {
  const normal = climbing(false), brake = climbing(true), dt = 1 / 60;
  assert.equal(createFlightState().reverseBrakeEnabled, false);
  let normalStop = null, brakeStop = null, normalPeak = 10, brakePeak = 10;
  for (let frame = 1; frame <= 240; frame++) {
    const previous = brake.verticalSpeed;
    stepFlight(normal, dt); stepFlight(brake, dt);
    assert.ok(previous - brake.verticalSpeed <= (model.maxSinkAccel + model.reverseBrakeAccel) * dt + 1e-10);
    if (normalStop === null && normal.verticalSpeed <= 0) normalStop = frame * dt;
    if (brakeStop === null && brake.verticalSpeed <= 0) brakeStop = frame * dt;
    normalPeak = Math.max(normalPeak, normal.altitude);
    brakePeak = Math.max(brakePeak, brake.altitude);
  }
  assert.ok(normalStop - brakeStop >= 0.2 && normalStop - brakeStop < 0.5, `${normalStop} vs ${brakeStop} s`);
  assert.ok(normalPeak - brakePeak > 0.3 && normalPeak - brakePeak < 0.9, `${normalPeak} vs ${brakePeak} m`);
  assert.equal(brake.reverseBrakeActive, false, "pulse ends once upward momentum is gone");
  assert.equal(brake.throttle, 0, "the throttle itself never goes negative");
});

test("Reverse braking uses a small rotor pulse and additional battery power, never NaN RPM", () => {
  const normal = climbing(false), brake = climbing(true);
  stepFlight(normal, 0.05); stepFlight(brake, 0.05);
  assert.equal(brake.reverseBrakeActive, true);
  assert.ok(brake.rotorRpm.every(rpm => Number.isFinite(rpm) && rpm > 0 && rpm <= model.reverseBrakeRpm));
  assert.ok(Math.abs((brake.power - normal.power) - (model.reverseBrakePowerW + flightPower(brake) - flightPower(normal))) < 1e-8);
  assert.ok(brake.battery < normal.battery);
  brake.reverseBrakeEnabled = false;
  stepFlight(brake, 0.05);
  assert.equal(brake.reverseBrakeActive, false);
});

test("The pulse cannot activate above zero throttle, while descending, near touchdown or over liquid", () => {
  for (const setup of [
    s => { s.throttle = 0.01; },
    s => { s.verticalSpeed = -0.5; },
    s => { s.verticalSpeed = 0; },
    s => { s.altitude = 0.5; },
    s => { s.altitude = 0; s.verticalSpeed = 0; },
    s => { s.positionX = pools[0].x; s.positionZ = pools[0].z; },
    s => { s.altitudeHold = 0; },
    s => { s.auto = true; },
    s => { s.mission.guidance = true; },
    s => { s.plan.status = "uplinking"; s.plan.uplinkRemaining = 8; },
    s => { s.battery = 5; },
    s => { s.edl = { t: 5 }; },
  ]) {
    const normal = climbing(false), brake = climbing(true);
    setup(normal); setup(brake);
    stepFlight(normal, 0.05); stepFlight(brake, 0.05);
    assert.equal(brake.reverseBrakeActive, false);
    assert.equal(brake.altitude, normal.altitude);
    assert.equal(brake.verticalSpeed, normal.verticalSpeed);
    assert.equal(brake.power, normal.power);
  }
});

test("Braking remains rate-limited at different frame rates and keeps the normal gentle touchdown", () => {
  for (const dt of [1 / 120, 1 / 60, 0.05]) {
    const s = climbing(true), normal = climbing(false);
    let touchdown = null, touchdownTime = null, normalTouchdownTime = null;
    for (let t = 0; t < 40; t += dt) {
      const before = s.verticalSpeed;
      stepFlight(s, dt); stepFlight(normal, dt);
      assert.ok(s.verticalSpeed >= -1.31, "the landing descent limit is unchanged");
      assert.ok(s.altitude >= 0);
      assert.ok(s.rotorRpm.every(Number.isFinite));
      if (touchdown === null && s.altitude === 0) { touchdown = before; touchdownTime = t + dt; }
      if (normalTouchdownTime === null && normal.altitude === 0) normalTouchdownTime = t + dt;
    }
    assert.ok(touchdown !== null && touchdown > -0.45, `touchdown at ${touchdown} m/s`);
    assert.ok(normalTouchdownTime - touchdownTime >= 0.5 && normalTouchdownTime - touchdownTime < 2,
      `landing ${normalTouchdownTime - touchdownTime} s sooner at dt=${dt}`);
    assert.equal(s.reverseBrakeActive, false);
    assert.ok(s.rotorRpm.every(rpm => rpm < 1));
  }
});

test("Pause freezes an active pulse and flight commands disengage it without disabling the toggle", () => {
  const s = climbing(true);
  stepFlight(s, 0.05);
  s.hold = true;
  const before = structuredClone(s);
  stepFlight(s, 5);
  assert.deepEqual(s, before);
  s.hold = false;
  commandFlight(s, "land");
  stepFlight(s, 0.05);
  assert.equal(s.reverseBrakeActive, false);
  assert.equal(s.reverseBrakeEnabled, true);
});

test("Landed saves keep the enabled setting, never an active pulse; legacy saves default off", () => {
  const s = createFlightState();
  s.reverseBrakeEnabled = true;
  s.reverseBrakeActive = true;
  const saved = snapshotState(s);
  assert.equal(saved.values.reverseBrakeActive, undefined);
  const fresh = createFlightState();
  assert.ok(restoreState(fresh, saved));
  assert.equal(fresh.reverseBrakeEnabled, true);
  assert.equal(fresh.reverseBrakeActive, false);
  const legacy = structuredClone(saved);
  delete legacy.values.reverseBrakeEnabled;
  const old = createFlightState();
  assert.ok(restoreState(old, legacy));
  assert.equal(old.reverseBrakeEnabled, false);
  saved.values.reverseBrakeEnabled = "true";
  const before = JSON.stringify(fresh);
  assert.equal(restoreState(fresh, saved), false);
  assert.equal(JSON.stringify(fresh), before);
});
