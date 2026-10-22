import test from "node:test";
import assert from "node:assert/strict";
import { qualityLevels, qualityOrder, nextQuality, createAdaptive, adaptFrame } from "../dist/invasion/quality.mjs";

test("Graphics quality levels cycle low, medium, high and scale detail down in order", () => {
  assert.deepEqual([nextQuality("low"), nextQuality("medium"), nextQuality("high")], ["medium", "high", "low"]);
  const [low, medium, high] = qualityOrder.map(name => qualityLevels[name]);
  for (const key of ["decor", "ratio", "ground"]) assert.ok(low[key] < medium[key] && medium[key] < high[key], key);
  assert.equal(low.city, false);
});

test("Adaptive resolution steps down on slow frames, back up on fast ones, within limits", () => {
  const state = createAdaptive();
  let changes = 0;
  for (let t = 0; t < 3; t += 1 / 30) if (adaptFrame(state, 33)) changes += 1;
  assert.equal(state.scale, 0.85, "30 fps for 3 s: one step down");
  for (let t = 0; t < 20; t += 1 / 20) adaptFrame(state, 50);
  assert.equal(state.scale, 0.5, "never below half");
  for (let t = 0; t < 60; t += 1 / 60) adaptFrame(state, 16);
  assert.equal(state.scale, 1, "fast frames restore full resolution");
  for (let t = 0; t < 30; t += 1) adaptFrame(state, 1000);
  assert.equal(state.scale, 1, "long gaps (a hidden tab) are ignored");
  assert.ok(changes >= 1);
});
