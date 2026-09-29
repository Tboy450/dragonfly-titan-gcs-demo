import test from "node:test";
import assert from "node:assert/strict";
import { createFlightState, stepFlight, commandFlight } from "../dist/flight-model.mjs";
import { batteryAfterHeat, batteryAfterFlight, flightEndurance, systemsModel } from "../dist/mission-systems.mjs";

const latent = systemsModel.pcmMassKg * systemsModel.pcmLatentJPerKg;
const capacity = systemsModel.batteryCapacity;

test("The wax holds the battery at 22.5 C while it melts, then lets it warm again", () => {
  assert.equal(latent, 1.5e6, "7.5 kg x 200 kJ/kg");
  const toMelt = capacity * (systemsModel.pcmMeltC - 20);
  const warming = batteryAfterHeat(20, 0, toMelt / 2);
  assert.ok(Math.abs(warming.c - 21.25) < 1e-9 && warming.melt === 0);
  const halfway = batteryAfterHeat(20, 0, toMelt + latent / 2);
  assert.equal(halfway.c, systemsModel.pcmMeltC);
  assert.ok(Math.abs(halfway.melt - 0.5) < 1e-9);
  const beyond = batteryAfterHeat(20, 0, toMelt + latent + capacity * 3);
  assert.ok(Math.abs(beyond.c - (systemsModel.pcmMeltC + 3)) < 1e-9 && beyond.melt === 1);
  // Cooling refreezes the wax at 22.5 C before the temperature falls.
  const refreezing = batteryAfterHeat(systemsModel.pcmMeltC, 1, -latent / 4);
  assert.equal(refreezing.c, systemsModel.pcmMeltC);
  assert.ok(Math.abs(refreezing.melt - 0.75) < 1e-9);
  const frozen = batteryAfterHeat(systemsModel.pcmMeltC, 0.1, -(0.1 * latent + capacity * 2));
  assert.ok(Math.abs(frozen.c - (systemsModel.pcmMeltC - 2)) < 1e-9 && frozen.melt === 0);
});

test("A long flight plateaus at the melting point instead of heating straight through", () => {
  const s = createFlightState();
  s.auto = false; s.throttle = 0.18;
  stepFlight(s, 0.05);
  s.batteryC = 21;
  commandFlight(s, "takeoff");
  let peakWhileMelting = 0, melted = 0;
  for (let t = 0; t < 1500; t += 0.1) {
    stepFlight(s, 0.1);
    if (s.pcmMelt > 0 && s.pcmMelt < 1) peakWhileMelting = Math.max(peakWhileMelting, s.batteryC);
    melted = s.pcmMelt;
  }
  assert.ok(melted > 0.05, `wax started melting (${(melted * 100).toFixed(0)}%)`);
  assert.ok(peakWhileMelting <= systemsModel.pcmMeltC + 1e-6, "no warming above 22.5 C while wax remains");
});

test("Flight-time and plan estimates count the wax", () => {
  const cool = { batteryC: 10, pcmMelt: 0, battery: 90, power: 6000, generatedW: 90 };
  const withoutWax = (systemsModel.batteryLimitC - 10) / systemsModel.batteryRisePerSecond / 60;
  const estimate = flightEndurance(cool, 11.5).thermalMin;
  const waxMinutes = latent / (capacity * systemsModel.batteryRisePerSecond) / 60;
  assert.ok(Math.abs(estimate - (withoutWax + waxMinutes)) < 1e-6, "thermal limit includes the melt time");
  // A 30 min flight from 20 C ends at the melting point rather than at 30 C.
  const after = batteryAfterFlight({ batteryC: 20, pcmMelt: 0 }, 1800);
  assert.equal(after.c, systemsModel.pcmMeltC);
  assert.ok(after.melt > 0 && after.melt < 1);
});
