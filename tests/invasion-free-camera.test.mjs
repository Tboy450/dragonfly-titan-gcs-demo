import test from "node:test";
import assert from "node:assert/strict";
import { enterFree, exitFree, placeFree, moveFree, freeSpeed, freeTarget, freeLimits } from "../dist/invasion/free-camera.mjs";

const flat = () => 10;
const map = { centerX: 0, centerZ: 0, half: 1000 };
// A 50 m tower standing over x 100-140, z -20..20.
const roofAt = (x, z) => (x >= 100 && x <= 140 && Math.abs(z) <= 20 ? 50 : 0);
const world = { groundAt: flat, roofAt, map };
const near = (a, b, tolerance = 1e-9) => assert.ok(Math.abs(a - b) <= tolerance, `${a} vs ${b}`);

test("The free camera starts exactly where the orbit camera was, looking the same way", () => {
  const cam = { focus: { x: 50, z: -30 }, distance: 200, yaw: 0.7, pitch: 0.9 };
  const free = enterFree(cam, flat);
  near(free.x, 50 + Math.sin(0.7) * Math.cos(0.9) * 200);
  near(free.z, -30 + Math.cos(0.7) * Math.cos(0.9) * 200);
  near(free.y, 10 + Math.sin(0.9) * 200);
  const look = freeTarget(free), toward = Math.hypot(look.x - free.x, look.z - free.z);
  near(Math.atan2(free.y - look.y, toward), 0.9, 1e-9);
  // Leaving returns to the same orbit.
  const back = exitFree(free, { focus: { x: 0, z: 0 } }, flat, 750);
  near(back.focus.x, 50, 1e-6); near(back.focus.z, -30, 1e-6); near(back.distance, 200, 1e-6);
});

test("It flies up and down freely but never below the ground, above the ceiling or off the map", () => {
  const free = { x: 0, z: 0, y: 30, yaw: 0, pitch: 0.5 };
  moveFree(free, { up: 1 }, 1, world);
  assert.ok(free.y > 30, "rises");
  for (let k = 0; k < 200; k += 1) moveFree(free, { up: -1 }, 0.5, world);
  near(free.y, 10 + freeLimits.clearance);
  for (let k = 0; k < 400; k += 1) moveFree(free, { up: 1, fast: true }, 0.5, world);
  near(free.y, 10 + freeLimits.ceiling);
  placeFree(free, 99999, -99999, free.y, world);
  near(free.x, map.half * freeLimits.edge); near(free.z, -map.half * freeLimits.edge);
  assert.ok(freeSpeed({ x: 0, z: 0, y: 500 }, flat) > freeSpeed({ x: 0, z: 0, y: 20 }, flat), "faster when higher");
});

test("It cannot fly into a building, only over it, and looks up or down within limits", () => {
  // Facing +x (yaw -pi/2 means forward is +x), 20 m up, just short of the 50 m tower.
  const low = { x: 95, z: 0, y: 30, yaw: -Math.PI / 2, pitch: 0 };
  moveFree(low, { forward: 1 }, 0.5, world);
  near(low.x, 95);
  const high = { x: 95, z: 0, y: 75, yaw: -Math.PI / 2, pitch: 0 };
  moveFree(high, { forward: 1 }, 0.5, world);
  assert.ok(high.x > 95 && high.y >= 60);
  // Descending onto the roof stops on top of it.
  for (let k = 0; k < 50; k += 1) moveFree(high, { up: -1 }, 0.2, { ...world, roofAt: () => 50 });
  near(high.y, 10 + 50 + freeLimits.clearance);
  const look = { x: 0, z: 0, y: 50, yaw: 0, pitch: 0 };
  for (let k = 0; k < 100; k += 1) moveFree(look, { look: -1 }, 0.1, world);
  near(look.pitch, freeLimits.lookUp);
  for (let k = 0; k < 100; k += 1) moveFree(look, { look: 1 }, 0.1, world);
  near(look.pitch, freeLimits.lookDown);
});
