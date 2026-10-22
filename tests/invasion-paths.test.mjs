import test from "node:test";
import assert from "node:assert/strict";
import { findRoute } from "../dist/invasion/paths.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { createPlanetTerrain } from "../dist/invasion/planet-terrain.mjs";
import { createBattle, stepBattle } from "../dist/invasion/battle.mjs";
import { missionCheckpoint, validMissionCheckpoint, restoreMissionCheckpoint, checkpointPlanet } from "../dist/invasion/mission-save.mjs";

const walkAlong = (route, from, walkable) => {
  let at = from;
  for (const p of route) {
    const steps = Math.ceil(Math.hypot(p.x - at.x, p.z - at.z));
    for (let s = 1; s <= steps; s += 1) assert.ok(walkable(at.x + (p.x - at.x) * s / steps, at.z + (p.z - at.z) * s / steps), "the route never crosses blocked ground");
    at = p;
  }
  return at;
};

test("Routes go round walls, even ones thinner than a grid cell, and are the same every time", () => {
  for (const thickness of [6, 3, 1.5]) {
    const walkable = (x, z) => !(Math.abs(x) < thickness / 2 && z > -50 && z < 50);
    const route = findRoute(walkable, { x: -30, z: 0 }, { x: 30, z: 0 });
    assert.ok(route?.length >= 2);
    assert.deepEqual(walkAlong(route, { x: -30, z: 0 }, walkable), { x: 30, z: 0 });
    assert.deepEqual(findRoute(walkable, { x: -30, z: 0 }, { x: 30, z: 0 }), route, "deterministic");
  }
});

test("An unreachable goal gives a route to the nearest reachable ground, or none", () => {
  const ring = (x, z) => !(Math.abs(x) < 40 && Math.abs(z) < 40 && !(Math.abs(x) < 34 && Math.abs(z) < 34));
  const partial = findRoute(ring, { x: -80, z: 0 }, { x: 0, z: 0 });
  assert.ok(partial && Math.hypot(partial.at(-1).x, partial.at(-1).z) < 80, "it gets closer");
  assert.equal(findRoute(() => false, { x: 0, z: 0 }, { x: 100, z: 0 }), null);
});

test("A rifleman outside Brackenford's walls walks home through a gate, and a save keeps its route", () => {
  const map = { ...planetById("velm-frontier"), hazards: [] }, terrain = createPlanetTerrain(map), b = createBattle(map, { terrain });
  const square = b.zones.find(z => z.urban);
  const trooper = b.units.find(u => u.side === "native" && !u.structure);
  Object.assign(trooper, { home: square.id, x: square.x + 37, z: terrain.city.bounds.minZ - 20 });
  delete trooper.route;
  b.units = [trooper];
  let routed = false, saved = null;
  for (let t = 0; t < 150; t += 0.1) {
    stepBattle(b, 0.1);
    if (trooper.route?.points.length) {
      routed = true;
      saved ??= JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam: { focus: { x: 0, z: 0 }, distance: 200, yaw: 0, pitch: 0.9 } })));
    }
  }
  assert.ok(routed, "it needed a route");
  assert.ok(Math.hypot(trooper.x - square.x, trooper.z - square.z) < square.radius, "it reached its square inside the walls");
  assert.ok(validMissionCheckpoint(saved), "a save mid-route is valid");
  const restored = restoreMissionCheckpoint(saved, createPlanetTerrain(checkpointPlanet(saved)));
  const again = restored.battle.units[0];
  for (let t = 0; t < 120; t += 0.1) stepBattle(restored.battle, 0.1);
  assert.ok(Math.hypot(again.x - square.x, again.z - square.z) < square.radius, "the restored one gets there too");
});
