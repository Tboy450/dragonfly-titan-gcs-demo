import test from "node:test";
import assert from "node:assert/strict";
import { planetById } from "../dist/invasion/campaign.mjs";
import { createPlanetTerrain } from "../dist/invasion/planet-terrain.mjs";
import { createBattle, stepBattle, requestDrop, orderSquads } from "../dist/invasion/battle.mjs";
import { missionCheckpoint, checkpointPlanet, restoreMissionCheckpoint } from "../dist/invasion/mission-save.mjs";

test("Aurex's towers are solid: clear of zones, blocking troops, stopping pods, climbed by drones", () => {
  const planet = planetById("aurex"), terrain = createPlanetTerrain(planet), b = createBattle(planet, { terrain, matter: 2000, unlocks: ["scout"] });
  const towers = terrain.skyline;
  assert.ok(towers.length > 200, `${towers.length} towers`);
  for (const zone of b.zones) assert.ok(towers.every(t => Math.hypot(t.x - zone.x, t.z - zone.z) >= zone.radius + 16 + Math.max(t.w, t.d) / 2 - 1e-9), `${zone.name} stays open`);
  const tall = towers.reduce((best, t) => (t.height > best.height ? t : best));
  assert.equal(terrain.walkable(tall.x, tall.z), false);
  assert.equal(terrain.canDropAt(tall.x, tall.z), false);
  assert.ok(terrain.roofAt(tall.x, tall.z) >= tall.height);
  assert.ok(b.units.filter(u => u.side === "native").every(u => u.alt > 0 || terrain.walkable(u.x, u.z)), "no defenders inside towers");
  // Scouts flying across the skyline stay above the roofs (a peaceful Aurex, so none are shot down).
  const calmPlanet = { ...planet, society: 0, threat: 0, objectives: [], hazards: [] };
  const calmTerrain = createPlanetTerrain(calmPlanet), calm = createBattle(calmPlanet, { terrain: calmTerrain, matter: 500, unlocks: ["scout"] });
  const home = calm.zones.find(z => z.kind === "beachhead");
  assert.ok(requestDrop(calm, { x: home.x, z: home.z, payload: { scout: 4 } }).ok);
  for (let t = 0; t < 15; t += 0.1) stepBattle(calm, 0.1);
  const { centerX, centerZ, half } = calm.map, inside = calmTerrain.skyline.filter(t => Math.abs(t.x - centerX) < half * 0.7 && Math.abs(t.z - centerZ) < half * 0.7);
  const peak = inside.reduce((best, t) => (t.height > best.height ? t : best));
  const drones = calm.units.filter(u => u.side === "swarm" && !u.structure);
  for (const d of drones) { d.x = peak.x - 120; d.z = peak.z; }
  orderSquads(calm, [calm.squads[0].id], { kind: "move", x: peak.x + 120, z: peak.z });
  let over = 0;
  for (let t = 0; t < 20; t += 0.1) {
    stepBattle(calm, 0.1);
    for (const d of drones.filter(u => u.alive)) {
      const roof = calmTerrain.roofAt(d.x, d.z);
      if (roof > 20) { over += 1; assert.ok(d.alt > roof - 3, `drone at ${d.alt.toFixed(1)} m over a ${roof.toFixed(1)} m tower`); }
    }
  }
  assert.ok(over > 0, "the route crossed towers");
});

test("An Aurex battle saved before the towers were solid resumes on open ground", () => {
  const planet = planetById("aurex"), terrain = createPlanetTerrain(planet), b = createBattle(planet, { terrain });
  const saved = JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam: { focus: { x: 0, z: 0 }, distance: 200, yaw: 0, pitch: 0.9 } })));
  assert.equal(saved.battle.skyline, 1);
  assert.equal(createPlanetTerrain(checkpointPlanet(saved)).skyline.length, 0, "towers appear once zones are known");
  const restoredTerrain = createPlanetTerrain(checkpointPlanet(saved));
  assert.ok(restoreMissionCheckpoint(saved, restoredTerrain));
  assert.deepEqual(restoredTerrain.skyline, terrain.skyline, "the same towers after reloading");
  delete saved.battle.skyline;
  const old = createPlanetTerrain(checkpointPlanet(saved));
  assert.ok(restoreMissionCheckpoint(saved, old));
  assert.equal(old.skyline, undefined, "older saves keep their open ground");
});
