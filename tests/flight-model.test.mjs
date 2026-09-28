import test from "node:test";
import assert from "node:assert/strict";
import { model, createFlightState, deriveFlight, stepFlight, commandFlight } from "../dist/flight-model.mjs";

const near = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const advance = (state, seconds, fps = 60) => {
  for (let i = 0; i < seconds * fps; i++) stepFlight(state, 1 / fps);
};

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
  state.pitch = 0.5;
  state.throttle = 0.55;
  advance(state, 2);
  assert.ok(state.rotorRpm[2] > state.rotorRpm[0]);
  near(state.rotorRpm[0], state.rotorRpm[1]);
  near(state.rotorRpm[0], state.rotorRpm[4]);
  state.yaw = 0.8;
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
