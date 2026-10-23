import test from "node:test";
import assert from "node:assert/strict";
import { createDustState, stepDust, dustLimits } from "../dist/invasion/swarm-dust.mjs";

const alive = (state) => state.particles.filter(p => p.alive);

test("Low drones raise dust, more the lower they fly; high ones raise none", () => {
  const low = createDustState(3), high = createDustState(3), lower = createDustState(3);
  for (let k = 0; k < 20; k += 1) {
    stepDust(low, 0.05, [{ x: 0, z: 0, alt: 8 }]);
    stepDust(lower, 0.05, [{ x: 0, z: 0, alt: 1 }]);
    stepDust(high, 0.05, [{ x: 0, z: 0, alt: 22 }]);
  }
  assert.equal(alive(high).length, 0);
  assert.ok(alive(lower).length > alive(low).length && alive(low).length > 0);
});

test("Pod touchdowns burst, dust drifts outward and fades, and water raises none", () => {
  const state = createDustState(5);
  stepDust(state, 0.016, [], [{ x: 100, z: 50 }]);
  assert.equal(alive(state).length, dustLimits.burst);
  const before = alive(state).map(p => Math.hypot(p.x - 100, p.z - 50));
  stepDust(state, 0.5, []);
  const after = alive(state).map(p => Math.hypot(p.x - 100, p.z - 50));
  assert.ok(after.every((d, i) => d > before[i]), "puffs roll outward");
  for (let k = 0; k < 100; k += 1) stepDust(state, 0.1, []);
  assert.equal(alive(state).length, 0, "and fade away");
  stepDust(state, 0.05, [{ x: 0, z: 0, alt: 0 }], [{ x: 0, z: 0 }], () => false);
  assert.equal(alive(state).length, 0, "nothing over water");
  for (let k = 0; k < 50; k += 1) stepDust(state, 0.1, Array.from({ length: 40 }, (_, i) => ({ x: i, z: 0, alt: 0 })), [{ x: 0, z: 0 }]);
  assert.ok(alive(state).length <= dustLimits.particles, "the pool caps the dust");
});
