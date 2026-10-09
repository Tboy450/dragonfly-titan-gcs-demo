import test from "node:test";
import assert from "node:assert/strict";
import { soundMix } from "../dist/sound-mix.mjs";
import { edlStateAt, edlEvents } from "../dist/edl.mjs";

test("The soundscape is quiet at rest and follows the rotors and the air", () => {
  const rest = soundMix({ rotorRpm: Array(8).fill(0), wind: 0, speed: 0, verticalSpeed: 0, edl: null });
  assert.equal(rest.rotorGain, 0);
  assert.equal(rest.roarGain, 0);
  assert.equal(rest.flutterGain, 0);
  assert.ok(rest.windGain < 0.02);
  const hover = soundMix({ rotorRpm: Array(8).fill(700), wind: 1, speed: 0, verticalSpeed: 0, edl: null });
  assert.ok(Math.abs(hover.rotorHz - 35) < 1e-9, "blade-pass frequency at 700 rpm with three blades");
  assert.ok(hover.rotorGain > 0.2);
  const cruise = soundMix({ rotorRpm: Array(8).fill(760), wind: 1, speed: 10, verticalSpeed: 0, edl: null });
  assert.ok(cruise.windGain > hover.windGain && cruise.windCutoffHz > hover.windCutoffHz);
});

test("The arrival roars during entry, flutters under the parachutes and thumps once per event", () => {
  const at = (title) => edlEvents.find(e => e.title === title).t;
  const entry = soundMix({ rotorRpm: [], edl: edlStateAt(at("Peak heating")) });
  assert.ok(entry.roarGain > 0.3);
  assert.ok(soundMix({ rotorRpm: [], edl: edlStateAt(at("Drogue parachute") + 2) }).flutterGain > 0.1);
  assert.equal(soundMix({ rotorRpm: [], edl: edlStateAt(at("Lander pose")) }).roarGain, 0);
  assert.equal(soundMix({ rotorRpm: [], edl: edlStateAt(at("Main parachute") + 0.05) }).thump, "main");
  assert.equal(soundMix({ rotorRpm: [], edl: edlStateAt(at("Main parachute") + 0.5) }).thump, null);
});

test("Titan's air: thumps arrive at 194 m/s, wind is weighted by density, the wash hisses", async () => {
  const { titanSoundSpeed } = await import("../dist/sound-mix.mjs");
  const at = (title) => edlEvents.find(e => e.title === title).t;
  const main = edlStateAt(at("Main parachute") + 0.05);
  const mix = soundMix({ rotorRpm: [], edl: main });
  assert.ok(Math.abs(mix.thumpDelayS - main.cameraDistance / titanSoundSpeed) < 1e-9);
  assert.ok(mix.thumpDelayS > 0.5, `heard ${mix.thumpDelayS.toFixed(2)} s after it is seen`);
  const calm = soundMix({ rotorRpm: [], wind: 0.5, speed: 0, edl: null });
  const breeze = soundMix({ rotorRpm: [], wind: 1.6, speed: 0, edl: null });
  assert.ok(breeze.windGain > calm.windGain);
  const hover = soundMix({ rotorRpm: Array(8).fill(780), altitude: 1, speed: 0, verticalSpeed: 0, edl: null });
  const high = soundMix({ rotorRpm: Array(8).fill(780), altitude: 30, speed: 0, verticalSpeed: 0, edl: null });
  assert.ok(hover.dustGain > 0.04 && high.dustGain === 0);
});
