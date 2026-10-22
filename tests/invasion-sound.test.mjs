import test from "node:test";
import assert from "node:assert/strict";
import { battleMix, soundCues, soundLevels, nextSoundLevel } from "../dist/invasion/battle-sound.mjs";

const view = { x: 0, z: 0, radius: 300 };
const drone = (x, z) => ({ alive: true, side: "swarm", structure: false, x, z });

test("The swarm's hum grows with the drones in view; weather and eruptions are heard", () => {
  const quiet = battleMix({ units: [], hazards: { events: [] } }, view);
  assert.equal(quiet.humGain, 0);
  assert.ok(quiet.windGain > 0 && quiet.rainGain === 0, "a faint wind is always there");
  const few = battleMix({ units: [drone(10, 10), drone(2000, 0)], hazards: { events: [] } }, view);
  const many = battleMix({ units: Array.from({ length: 80 }, (_, i) => drone(i, 0)), hazards: { events: [] } }, view);
  assert.ok(few.humGain > 0 && many.humGain > few.humGain && many.humHz > few.humHz);
  assert.ok(many.humGain <= 0.12 + 1e-9, "never louder than full");
  const storm = battleMix({ units: [], hazards: { events: [
    { type: "acidRain", kind: "weather", phase: "active" },
    { type: "blizzard", kind: "weather", phase: "warning" },
    { type: "eruption", kind: "eruption", phase: "active", x: 100, z: 0 },
  ] } }, view);
  assert.ok(storm.rainGain > 0 && storm.windGain === quiet.windGain && storm.rumbleGain > 0, "only active weather sounds");
});

test("One-shot cues: near explosions, captures, alarms, strikes, drops and one per weapon", () => {
  const cues = soundCues([
    { kind: "destroyed", structure: true, side: "native", x: 10, z: 0 },
    { kind: "destroyed", structure: false, side: "swarm", x: 5000, z: 0 },
    { kind: "captured", x: 0, z: 0 },
    { kind: "alarm", stage: 2 },
    { kind: "strike", source: "lightning", x: 20, z: 0 },
    { kind: "drop", x: -900, z: 0 },
    { kind: "shot", fx: "flak" }, { kind: "shot", fx: "flak" }, { kind: "shot", fx: "laser" },
  ], view);
  assert.deepEqual(cues.map(c => c.type), ["boom", "chime", "siren", "thunder", "entry", "shot", "shot"]);
  assert.deepEqual(cues.filter(c => c.type === "shot").map(c => c.fx), ["flak", "laser"]);
  assert.equal(soundCues(Array.from({ length: 30 }, () => ({ kind: "captured" })), view).length, 8, "capped");
});

test("The sound button cycles off, quiet, medium, loud and back to off", () => {
  assert.equal(soundLevels[0], 0, "off by default");
  let level = 0;
  const seen = [];
  for (let k = 0; k < 4; k += 1) { level = nextSoundLevel(level); seen.push(soundLevels[level]); }
  assert.deepEqual(seen, [0.35, 0.65, 1, 0]);
});
