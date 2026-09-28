import test from "node:test";
import assert from "node:assert/strict";
import { model, createFlightState, deriveFlight, stepFlight, commandFlight, flightPower, takeManualControl } from "../dist/flight-model.mjs";

const near = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const advance = (state, seconds, fps = 60) => {
  for (let i = 0; i < seconds * fps; i++) stepFlight(state, 1 / fps);
};

test("Forward-flight power has a cruise minimum and responds to climb and payload", () => {
  const s = createFlightState();
  const hover = flightPower(s);
  s.speed = 8; const cruise = flightPower(s);
  assert.ok(cruise < hover && cruise > 4000 && cruise < 7000);
  s.speed = 16; assert.ok(flightPower(s) > cruise);
  s.speed = 8; s.verticalSpeed = 2; assert.ok(flightPower(s) > cruise);
  s.verticalSpeed = 0; s.payloadDelta = 60; assert.ok(flightPower(s) > cruise);
  assert.equal(model.bladesPerRotor, 3);
  assert.equal(model.batteryEnergyKwh, 11.5);
});

test("Four coaxial stations count four unique disks", () => {
  const state = createFlightState(), d = deriveFlight(state);
  near(d.totalArea, 4 * Math.PI * 0.675 ** 2);
  near(d.pressureKpa, 146);
  near(d.density, 5.44);
  near(d.idealTitan, d.titanWeight * Math.sqrt(d.titanWeight / (2 * d.density * d.totalArea)));
  state.payloadDelta = 60;
  assert.ok(deriveFlight(state).realisticTitan > d.realisticTitan);
  state.altitude = 1000;
  assert.ok(deriveFlight(state).density < d.density);
});

test("Steep-descent advisory uses a bounded proxy and never triggers on the ground or climb", () => {
  const s = createFlightState(); s.altitude = 50;
  const vh = deriveFlight(s).inducedTitan;
  s.verticalSpeed = -vh; s.speed = 0;
  assert.equal(deriveFlight(s).steepDescentCaution, true);
  s.speed = 10;
  assert.equal(deriveFlight(s).steepDescentCaution, false);
  s.speed = 0; s.verticalSpeed = -0.5 * vh;
  assert.equal(deriveFlight(s).steepDescentCaution, false);
  s.verticalSpeed = -1.5 * vh;
  assert.equal(deriveFlight(s).steepDescentCaution, false);
  s.verticalSpeed = vh;
  assert.equal(deriveFlight(s).steepDescentCaution, false);
  s.verticalSpeed = -vh; s.altitude = 0;
  assert.equal(deriveFlight(s).steepDescentCaution, false);
});

test("Pause freezes flight, rotors, energy and history, and retains auto mode", () => {
  const state = createFlightState();
  advance(state, 3);
  commandFlight(state, "hold");
  const snapshot = structuredClone(state);
  advance(state, 5);
  assert.deepEqual(state, snapshot);
  commandFlight(state, "hold");
  assert.equal(state.auto, true);
  stepFlight(state, 1 / 60);
  assert.ok(state.missionTime > snapshot.missionTime);
});

test("Views cannot reset shared flight, and commands resume a paused flight", () => {
  const state = createFlightState();
  advance(state, 2);
  const before = state.missionTime;
  state.view = "pilot";
  advance(state, 1);
  state.view = "mission";
  assert.ok(state.missionTime > before);
  commandFlight(state, "hold");
  commandFlight(state, "land");
  assert.equal(state.hold, false);
  assert.equal(state.auto, false);
  assert.equal(state.throttle, 0.39);
});

test("Rotor differential reflects control inputs, not decorative random RPM", () => {
  const state = createFlightState();
  state.auto = false;
  state.altitude = 10;
  state.pitchCmd = 0.5;
  state.throttle = 0.55;
  advance(state, 2);
  assert.ok(state.rotorRpm[2] > state.rotorRpm[0]);
  near(state.rotorRpm[0], state.rotorRpm[1]);
  near(state.rotorRpm[0], state.rotorRpm[4]);
  state.yawCmd = 0.8;
  advance(state, 2);
  assert.ok(state.rotorRpm[0] > state.rotorRpm[1]);
  assert.notEqual(state.rotorPhase[0], state.rotorPhase[1]);
});

test("Auto flight converges consistently at 30, 60 and 120 fps", () => {
  const states = [30, 60, 120].map((fps) => {
    const state = createFlightState();
    advance(state, 20, fps);
    return state;
  });
  for (const state of states) {
    near(state.altitude, states[1].altitude, 0.04);
    near(state.distance, states[1].distance, 0.08);
    near(state.battery, states[1].battery, 0.002);
    assert.ok(state.battery < 96);
    assert.ok(state.chart.length >= 39 && state.chart.length <= 41);
  }
});

test("Battery energy uses seconds, and flight history remains bounded", () => {
  const state = createFlightState();
  const battery = state.battery;
  stepFlight(state, 0.1);
  near(battery - state.battery, -state.netBatteryW * 0.1 / (model.batteryEnergyKwh * 36000));
  advance(state, 600, 30);
  assert.equal(state.chart.length, 180);
  assert.ok(state.track.length <= 600);
  assert.ok(state.chart.at(-1).time - state.chart[0].time > 89);
});

// Runs a command script at 60 fps and reports the largest per-frame changes.
function fly(script, seconds, setup = () => {}) {
  const state = createFlightState(), dt = 1 / 60;
  setup(state);
  const worst = { climb: 0, pitchRate: 0, accel: 0, move: 0 };
  let previous = structuredClone(state);
  for (let i = 0; i < seconds * 60; i++) {
    const t = i * dt;
    for (const [at, action] of script) if (Math.abs(t - at) < dt / 2) action(state);
    stepFlight(state, dt);
    worst.climb = Math.max(worst.climb, Math.abs(state.altitude - previous.altitude) / dt);
    worst.pitchRate = Math.max(worst.pitchRate, Math.abs(state.pitch - previous.pitch) / dt);
    if (state.altitude > 0) worst.accel = Math.max(worst.accel, Math.abs(state.speed - previous.speed) / dt);
    const moved = Math.hypot(state.positionX - previous.positionX, state.positionZ - previous.positionZ);
    worst.move = Math.max(worst.move, moved - previous.speed * dt - 0.02);
    previous = structuredClone(state);
  }
  return { state, worst };
}
const cmd = (mode) => (state) => commandFlight(state, mode);

test("Buttons, Auto re-engagement and the auto loop never jump the aircraft", () => {
  const scripts = [
    [[1, cmd("takeoff")], [6, cmd("cruise")], [14, cmd("land")], [40, cmd("auto")], [70, cmd("land")]],
    [[0.5, cmd("cruise")], [3, cmd("land")], [40, cmd("auto")]],
    [[2, cmd("takeoff")], [9, cmd("auto")], [12, cmd("takeoff")], [13, cmd("land")]],
    [],
  ];
  for (const script of scripts) {
    const { worst } = fly(script, script.length ? 90 : 200);
    assert.ok(worst.climb <= model.maxClimb + 0.05, `vertical speed ${worst.climb}`);
    assert.ok(worst.pitchRate <= 0.91, `pitch rate ${worst.pitchRate}`);
    assert.ok(worst.accel <= model.maxHorizontalAccel + 0.01, `acceleration ${worst.accel}`);
    assert.ok(worst.move <= 0.02, `position jump ${worst.move}`);
  }
});

test("Land reverses a climb promptly and touches down gently; Takeoff holds altitude", () => {
  const climbing = fly([[0.5, cmd("takeoff")]], 8).state;
  assert.ok(climbing.verticalSpeed > 1.5);
  commandFlight(climbing, "land");
  let reversed = null, touchdown = null;
  for (let i = 0; i < 60 * 90; i++) {
    const before = climbing.verticalSpeed;
    stepFlight(climbing, 1 / 60);
    if (reversed === null && climbing.verticalSpeed < 0) reversed = i / 60;
    if (touchdown === null && climbing.altitude === 0) touchdown = before;
  }
  assert.ok(reversed !== null && reversed < 3.5, `still climbing after ${reversed} s`);
  assert.ok(touchdown !== null && touchdown > -0.45, `touchdown at ${touchdown} m/s`);
  assert.equal(climbing.mode, "Surface");
  assert.ok(climbing.rotorRpm.every((rpm) => rpm < 50));

  const hovering = fly([[0.5, cmd("takeoff")]], 60).state;
  near(hovering.altitude, model.takeoffAltitude, 0.3);
  assert.equal(hovering.mode, "Hover");
});

test("Throttle is a sticky climb command: half throttle holds altitude after a handover", () => {
  const { state } = fly([[0.5, cmd("takeoff")], [30, (s) => { takeManualControl(s); s.altitudeHold = null; s.throttle = model.hoverThrottle; }]], 45);
  const held = state.altitude;
  advance(state, 10);
  near(state.altitude, held, 0.05);
  state.throttle = 0.7;
  advance(state, 5);
  assert.ok(state.altitude > held + 5);
  // Handing over from Auto keeps the current climb rate instead of snapping the throttle.
  const auto = createFlightState();
  advance(auto, 8);
  const climb = auto.verticalSpeed;
  takeManualControl(auto);
  stepFlight(auto, 1 / 60);
  near(auto.verticalSpeed, climb, 0.05);
});

test("Re-engaging Auto resumes from the phase that matches the aircraft", () => {
  const grounded = fly([[0.5, cmd("land")]], 40).state;
  commandFlight(grounded, "auto");
  stepFlight(grounded, 1 / 60);
  assert.equal(grounded.mode, "Takeoff");
  assert.ok(grounded.altitude < 0.1);
  const aloft = fly([[0.5, cmd("takeoff")]], 20).state;
  commandFlight(aloft, "auto");
  stepFlight(aloft, 1 / 60);
  assert.equal(aloft.mode, "Hover");
});
