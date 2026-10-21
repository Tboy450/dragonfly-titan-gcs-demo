import test from "node:test";
import assert from "node:assert/strict";
import { createCityLayout, cityQueries, CITY_LAYOUT_VERSION } from "../dist/invasion/city-layout.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { createPlanetTerrain } from "../dist/invasion/planet-terrain.mjs";
import { createBattle, stepBattle, requestDrop, orderSquads } from "../dist/invasion/battle.mjs";
import { missionCheckpoint, restoreMissionCheckpoint, validMissionCheckpoint, checkpointPlanet } from "../dist/invasion/mission-save.mjs";

const spec = { seed: 7, x: 50, z: -40, blocks: 9, pitch: 100, street: 20, peak: 150 };

test("A city layout is seeded and versioned, with buildings only inside blocks and open squares", () => {
  const city = createCityLayout(spec);
  assert.equal(city.version, CITY_LAYOUT_VERSION);
  assert.deepEqual(createCityLayout(spec), city, "same seed, same city");
  assert.notDeepEqual(createCityLayout({ ...spec, seed: 8 }).buildings, city.buildings);
  assert.equal(new Set(city.buildings.map(b => b.id)).size, city.buildings.length, "stable unique IDs");
  assert.equal(city.plazas.length, 5);
  const queries = cityQueries(city);
  for (const plaza of city.plazas) assert.ok(queries.clearAt(plaza.x, plaza.z, plaza.radius - 1), `${plaza.id} is open`);
  for (const park of city.parks) assert.ok(queries.clearAt(park.x, park.z, park.size / 2 - 1), `${park.id} is open`);
  for (const b of city.buildings) {
    // Every building stays inside its block, never on a street.
    const owner = city.blocks.find(k => Math.abs(b.x - k.x) <= k.size / 2 && Math.abs(b.z - k.z) <= k.size / 2);
    assert.ok(owner, b.id);
    assert.ok(Math.abs(b.x - owner.x) + b.w / 2 <= owner.size / 2 + 1e-9 && Math.abs(b.z - owner.z) + b.d / 2 <= owner.size / 2 + 1e-9, `${b.id} inside its block`);
    assert.ok(b.height >= 9 && b.tiers.at(-1).y + b.tiers.at(-1).h <= b.height + 1e-6);
    assert.equal(queries.roofAt(b.x, b.z), Math.max(...city.buildings.filter(o => Math.abs(b.x - o.x) <= o.w / 2 && Math.abs(b.z - o.z) <= o.d / 2).map(o => o.height)));
  }
  assert.equal(queries.roofAt(city.plazas[0].x, city.plazas[0].z), 0);
});

test("Corvan's planetary map holds the city: level ground, blocked buildings, open squares as zones", () => {
  const planet = planetById("corvan"), terrain = createPlanetTerrain(planet), city = terrain.city;
  assert.ok(city && city.buildings.length > 100);
  assert.ok(planet.map.half >= 900, "a larger planetary map around the city");
  for (const [dx, dz] of [[0, 0], [300, 200], [-350, -300]]) assert.equal(terrain.heightAt(city.x + dx, city.z + dz), city.ground);
  const tower = city.buildings[0];
  assert.equal(terrain.walkable(tower.x, tower.z), false);
  assert.equal(terrain.canDropAt(tower.x, tower.z), false);
  assert.ok(terrain.roofAt(tower.x, tower.z) > 0);
  const b = createBattle(planet, { terrain });
  const urban = b.zones.filter(z => z.urban);
  assert.equal(urban.length, city.plazas.length);
  for (const zone of urban) assert.ok(terrain.canDropAt(zone.x, zone.z, { radius: 6 }), `${zone.name} takes pods`);
  for (const zone of b.zones.filter(z => !z.urban && z.kind !== "beachhead")) {
    const { minX, maxX, minZ, maxZ } = city.bounds;
    assert.ok(zone.x < minX - 89 || zone.x > maxX + 89 || zone.z < minZ - 89 || zone.z > maxZ + 89, `${zone.name} is outside the city`);
  }
  assert.ok(b.units.filter(u => u.structure).every(u => terrain.walkable(u.x, u.z)), "no defenses inside buildings");
  for (let t = 0; t < 60; t += 0.1) {
    stepBattle(b, 0.1);
    assert.ok(b.units.filter(u => u.side === "native" && !u.structure).every(u => terrain.walkable(u.x, u.z)), "troops walk around buildings");
  }
});

test("Drones climb over city buildings, and a saved mission keeps its city after reloading", () => {
  // Corvan's city with nobody living there, so the flight is not interrupted by combat.
  const planet = { ...planetById("corvan"), society: 0, threat: 0, objectives: [], hazards: [] };
  const terrain = createPlanetTerrain(planet), city = terrain.city;
  const b = createBattle(planet, { terrain, matter: 500, unlocks: ["scout"] });
  const home = b.zones.find(z => z.kind === "beachhead");
  assert.ok(requestDrop(b, { x: home.x, z: home.z, payload: { scout: 6 } }).ok);
  for (let t = 0; t < 30; t += 0.1) stepBattle(b, 0.1);
  const far = { x: city.bounds.maxX - 30, z: city.bounds.minZ + 30 };
  orderSquads(b, b.squads.map(s => s.id), { kind: "move", x: far.x, z: far.z });
  let overRoofs = 0, highest = 0;
  for (let t = 0; t < 120; t += 0.1) {
    stepBattle(b, 0.1);
    for (const u of b.units.filter(u => u.side === "swarm")) {
      const roof = terrain.roofAt(u.x, u.z);
      if (roof > 25) { overRoofs += 1; highest = Math.max(highest, roof); assert.ok(u.alt > roof - 3, `drone at ${u.alt.toFixed(1)} m over a ${roof.toFixed(1)} m roof`); }
    }
  }
  assert.ok(overRoofs > 0 && highest > 40, "the route crossed tall buildings");
  const saved = JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam: { focus: { x: 0, z: 0 }, distance: 300, yaw: 0, pitch: 0.8 } })));
  const restored = restoreMissionCheckpoint(saved, createPlanetTerrain(planet));
  assert.ok(restored, "checkpoint restores");
  const tower = city.buildings[0];
  assert.equal(restored.battle.walkable(tower.x, tower.z), false);
  assert.ok(restored.battle.roofAt(tower.x, tower.z) > 0);
  assert.deepEqual(saved.battle.city, { version: CITY_LAYOUT_VERSION, seed: planet.city.seed });
  assert.equal(validMissionCheckpoint({ ...saved, battle: { ...saved.battle, city: { version: CITY_LAYOUT_VERSION, seed: 1 } } }), null, "a different city is refused");
});

test("A Corvan battle saved before the city existed resumes on its original landscape", () => {
  const corvan = planetById("corvan");
  // Corvan as it was before October 21: no city, a 460 m map and five zones.
  const before = { ...corvan, city: undefined, map: { centerX: 0, centerZ: 0, half: 460 }, zoneCount: 5, required: 4 };
  const terrain = createPlanetTerrain(before), b = createBattle(before, { terrain });
  const home = b.zones.find(z => z.kind === "beachhead");
  assert.ok(requestDrop(b, { x: home.x, z: home.z, payload: { scout: 2, link: 2 } }).ok);
  for (let t = 0; t < 5; t += 0.05) stepBattle(b, 0.05);
  const saved = JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam: { focus: { x: 0, z: 0 }, distance: 230, yaw: 0, pitch: 0.9 } })));
  delete saved.battle.city; // Older saves have no city stamp.
  const planet = checkpointPlanet(saved);
  assert.equal(planet.city, null);
  assert.equal(planet.map.half, 460);
  const fresh = createPlanetTerrain(planet), restored = restoreMissionCheckpoint(saved, fresh);
  assert.ok(restored);
  assert.equal(fresh.city, undefined);
  for (const z of b.zones) assert.equal(fresh.heightAt(z.x, z.z), terrain.heightAt(z.x, z.z));
  for (let t = 0; t < 40; t += 0.05) { stepBattle(b, 0.05); stepBattle(restored.battle, 0.05); }
  const plain = ({ isLand, heightAt, canDropAt, walkable, roofAt, events, city, ...data }) => data;
  assert.deepEqual(plain(restored.battle), plain(b), "the same future as before the city was added");
  // A new Corvan save carries its stamp and rebuilds the city.
  assert.ok(checkpointPlanet(missionCheckpoint({ battle: createBattle(corvan, { terrain: createPlanetTerrain(corvan) }), cam: saved.cam })).city);
});
