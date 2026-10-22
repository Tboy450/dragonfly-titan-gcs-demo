import test from "node:test";
import assert from "node:assert/strict";
import { createCityLayout, cityQueries, CITY_LAYOUT_VERSION } from "../dist/invasion/city-layout.mjs";
import { planetById, frontiers, missionSupply, applyFrontierResult, createProgress, validProgress } from "../dist/invasion/campaign.mjs";
import { createPlanetTerrain } from "../dist/invasion/planet-terrain.mjs";
import { createBattle, stepBattle, requestDrop, orderSquads, cityFound } from "../dist/invasion/battle.mjs";
import { missionCheckpoint, restoreMissionCheckpoint, validMissionCheckpoint, checkpointPlanet } from "../dist/invasion/mission-save.mjs";
import { defenderTypes } from "../dist/invasion/units.mjs";

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

test("Corvan Frontier: a flat valley among rough mountains holds the city, far from the beacon", () => {
  const map = planetById("corvan-frontier"), terrain = createPlanetTerrain(map), city = terrain.city;
  assert.ok(frontiers.includes(map) && map.frontier && map.map.half >= 2500);
  assert.ok(city && city.buildings.length > 100);
  const { minX, maxX, minZ, maxZ } = city.bounds, floor = map.landform.floor;
  for (const [dx, dz] of [[0, 0], [300, 200], [-350, -300]]) assert.equal(terrain.heightAt(city.x + dx, city.z + dz), city.ground);
  // The valley is about five times the city across and nearly flat; the mountains are not.
  const { x, z, length, angle } = map.landform;
  assert.ok(length * 2 >= 4.5 * (maxX - minX));
  for (const t of [-0.8, -0.4, 0.1]) {
    const h = terrain.heightAt(x + Math.cos(angle) * length * t, z + Math.sin(angle) * length * t);
    assert.ok(Math.abs(h - floor) < 6, `valley floor at ${t}: ${h.toFixed(1)} m`);
  }
  let highest = -Infinity;
  for (let px = -3000; px <= 3000; px += 100) for (let pz = -3000; pz <= 3000; pz += 100) highest = Math.max(highest, terrain.heightAt(px, pz));
  assert.ok(highest > floor + 300, `peaks reach ${highest.toFixed(0)} m`);
  const b = createBattle(map, { terrain, ...missionSupply(createProgress(), map) });
  const home = b.zones.find(zone => zone.kind === "beachhead");
  assert.ok(Math.hypot(home.x - city.x, home.z - city.z) > 3000, "the city is far from the landing");
  assert.ok(Math.abs(terrain.heightAt(home.x, home.z) - floor) < 6, "the beacon sits in a level basin");
  const urban = b.zones.filter(zone => zone.urban);
  assert.equal(urban.length, city.plazas.length);
  for (const zone of urban) assert.ok(terrain.canDropAt(zone.x, zone.z, { radius: 6 }), `${zone.name} takes pods`);
  for (const zone of b.zones.filter(zone => !zone.urban && zone.kind !== "beachhead")) {
    assert.ok(zone.x < minX - 89 || zone.x > maxX + 89 || zone.z < minZ - 89 || zone.z > maxZ + 89, `${zone.name} is outside the city`);
    assert.ok(terrain.siteOK(zone.x, zone.z), `${zone.name} is on gentle ground`);
  }
  assert.ok(b.units.filter(u => u.structure).every(u => terrain.walkable(u.x, u.z)), "no defenses inside buildings");
  for (let t = 0; t < 60; t += 0.1) {
    stepBattle(b, 0.1);
    assert.ok(b.units.filter(u => u.side === "native" && !u.structure).every(u => terrain.walkable(u.x, u.z)), "troops walk around buildings");
  }
  // Nothing but the beacon is known at the start.
  assert.deepEqual(b.zones.filter(zone => zone.scouted).map(zone => zone.kind), ["beachhead"]);
  assert.equal(cityFound(b), false);
});

test("Frontier scouting finds zones and the city; drones climb over its roofs; saves keep the world", () => {
  // Corvan Frontier with nobody living there, so the flight is not interrupted by combat.
  const map = { ...planetById("corvan-frontier"), society: 0, threat: 0, objectives: [], hazards: [] };
  const terrain = createPlanetTerrain(map), city = terrain.city;
  const b = createBattle(map, { terrain, matter: 500, unlocks: ["scout"] });
  const home = b.zones.find(zone => zone.kind === "beachhead");
  assert.ok(requestDrop(b, { x: home.x, z: home.z, payload: { scout: 6 } }).ok);
  for (let t = 0; t < 30; t += 0.1) stepBattle(b, 0.1);
  const swarm = () => b.units.filter(u => u.side === "swarm");
  // An outpost is found when a drone comes near it, and only then.
  const outpost = b.zones.find(zone => !zone.urban && zone.kind !== "beachhead");
  for (const u of swarm()) { u.x = outpost.x + 500; u.z = outpost.z; }
  stepBattle(b, 0.1);
  assert.equal(outpost.scouted, false);
  for (const u of swarm()) u.x = outpost.x + 250;
  stepBattle(b, 0.1);
  assert.equal(outpost.scouted, true);
  assert.ok(b.log.some(entry => entry.text === `Scouts found ${outpost.name}.`));
  // Reaching the edge of the streets reveals every square at once.
  for (const u of swarm()) { u.x = city.bounds.minX - 200; u.z = city.z; }
  stepBattle(b, 0.1);
  assert.equal(cityFound(b), true);
  assert.ok(b.log.some(entry => /^Scouts found Corvan Prime: 5 squares/.test(entry.text)));
  const far = { x: city.bounds.maxX - 30, z: city.bounds.minZ + 30 };
  orderSquads(b, b.squads.map(s => s.id), { kind: "move", x: far.x, z: far.z });
  let overRoofs = 0, highest = 0;
  for (let t = 0; t < 90; t += 0.1) {
    stepBattle(b, 0.1);
    for (const u of swarm()) {
      const roof = terrain.roofAt(u.x, u.z);
      if (roof > 25) { overRoofs += 1; highest = Math.max(highest, roof); assert.ok(u.alt > roof - 3, `drone at ${u.alt.toFixed(1)} m over a ${roof.toFixed(1)} m roof`); }
    }
  }
  assert.ok(overRoofs > 0 && highest > 40, "the route crossed tall buildings");
  const saved = JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam: { focus: { x: 0, z: 0 }, distance: 300, yaw: 0, pitch: 0.8 } })));
  assert.deepEqual(saved.battle.city, { version: CITY_LAYOUT_VERSION, ...map.city });
  assert.deepEqual(saved.battle.landform, map.landform);
  const restored = restoreMissionCheckpoint(saved, createPlanetTerrain(checkpointPlanet(saved)));
  assert.ok(restored, "checkpoint restores");
  const tower = city.buildings[0];
  assert.equal(restored.battle.walkable(tower.x, tower.z), false);
  assert.ok(restored.battle.roofAt(tower.x, tower.z) > 0);
  assert.equal(cityFound(restored.battle), true, "what was scouted stays scouted");
  for (const bad of [{ ...saved.battle.city, blocks: 8 }, { ...saved.battle.city, blocks: 999 }, { ...saved.battle.city, version: 99 }])
    assert.equal(validMissionCheckpoint({ ...saved, battle: { ...saved.battle, city: bad } }), null);
  assert.equal(validMissionCheckpoint({ ...saved, battle: { ...saved.battle, landform: { ...map.landform, kind: "ring" } } }), null);
});

test("Frontier supply and results stay apart from the campaign bank and conquests", () => {
  const map = planetById("corvan-frontier"), progress = { ...createProgress(), matter: 9000 };
  const supply = missionSupply(progress, map);
  assert.equal(supply.matter, map.supply);
  assert.ok(map.kit.unlocks.every(type => supply.unlocks.includes(type)) && supply.podSlots >= map.kit.podSlots);
  assert.equal(missionSupply(progress, planetById("corvan")).matter, 9000);
  const { progress: next } = applyFrontierResult(progress, map, { outcome: "won", matter: 12, stars: 3, time: 900, stats: { zonesCaptured: 6 }, missionId: "frontier-test-1" });
  assert.equal(next.matter, 9000);
  assert.deepEqual(next.captured, {});
  assert.equal(next.stats.missionsWon, 1);
  assert.equal(next.stats.zonesCaptured, 6);
  assert.equal(applyFrontierResult(next, map, { outcome: "won", stats: { zonesCaptured: 6 }, missionId: "frontier-test-1" }).progress.stats.zonesCaptured, 6, "settled once");
  // Each frontier keeps a record: wins, best stars and fastest win, kept through a save.
  assert.deepEqual(next.frontier[map.id], { wins: 1, stars: 3, best: 900 });
  const faster = applyFrontierResult(next, map, { outcome: "won", stars: 2, time: 700, stats: {}, missionId: "frontier-test-2" });
  assert.deepEqual(faster.progress.frontier[map.id], { wins: 2, stars: 3, best: 700 });
  assert.ok(faster.notes.some(note => /New best time/.test(note)));
  assert.deepEqual(validProgress(JSON.parse(JSON.stringify(faster.progress))).frontier, faster.progress.frontier);
  assert.deepEqual(validProgress({ ...faster.progress, frontier: { [map.id]: { wins: 0, stars: 9, best: -1 }, nowhere: { wins: 1, stars: 1, best: 5 } } }).frontier, {});
});

const cam = { focus: { x: 0, z: 0 }, distance: 230, yaw: 0, pitch: 0.9 };
const plain = ({ isLand, heightAt, canDropAt, walkable, roofAt, lineBlocked, events, ...data }) => data;
function playAndSave(planet) {
  const terrain = createPlanetTerrain(planet), b = createBattle(planet, { terrain });
  const home = b.zones.find(z => z.kind === "beachhead");
  assert.ok(requestDrop(b, { x: home.x, z: home.z, payload: { scout: 2, link: 2 } }).ok);
  for (let t = 0; t < 5; t += 0.05) stepBattle(b, 0.05);
  return { b, saved: JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam }))) };
}
function sameFuture(before, saved) {
  const planet = checkpointPlanet(saved), terrain = createPlanetTerrain(planet);
  const restored = restoreMissionCheckpoint(saved, terrain);
  assert.ok(restored);
  for (const z of before.zones) assert.equal(terrain.heightAt(z.x, z.z), before.heightAt(z.x, z.z));
  for (let t = 0; t < 40; t += 0.05) { stepBattle(before, 0.05); stepBattle(restored.battle, 0.05); }
  assert.deepEqual(plain(restored.battle), plain(before), "the same future after reloading");
  return { planet, terrain };
}

test("Corvan battles saved on older maps resume on the world they were played on", () => {
  const corvan = planetById("corvan");
  assert.equal(corvan.city, undefined, "campaign Corvan is the snowfield again");
  // Saved before the city existed: no city stamp, a 460 m map.
  const early = playAndSave(corvan);
  for (const battle of [early.b, early.saved.battle]) { delete battle.city; delete battle.landform; delete battle.explore; }
  assert.equal(sameFuture(early.b, early.saved).terrain.city, undefined);
  // Saved on the first city version (October 21): a 900 m map, the city stamped { version: 1, seed }.
  const first = { ...corvan, map: { centerX: 0, centerZ: 0, half: 900 }, zoneCount: 7, required: 5,
    city: { style: "metropolis", x: 80, z: -120, blocks: 9, pitch: 100, street: 20, seed: 3109, peak: 150 } };
  const firstCity = playAndSave(first);
  for (const battle of [firstCity.b, firstCity.saved.battle]) { battle.city = { version: 1, seed: 3109 }; delete battle.landform; delete battle.explore; }
  const { planet, terrain } = sameFuture(firstCity.b, firstCity.saved);
  assert.equal(planet.map.half, 900);
  assert.deepEqual([terrain.city.x, terrain.city.z, terrain.city.buildings.length], [80, -120, createCityLayout(first.city).buildings.length]);
  assert.equal(validMissionCheckpoint({ ...firstCity.saved, battle: { ...firstCity.saved.battle, city: { version: 1, seed: 7 } } }), null);
});

// Saved battles rebuild their city from its spec, so a new style must never move an old city.
test("Existing metropolis cities are unchanged by later styles", () => {
  const fingerprint = city => [city.buildings.length, city.buildings.reduce((sum, b) => sum + b.height * 7 + b.x * 3 + b.z + b.w + b.d + b.tiers.length + b.variant, 0).toFixed(6)];
  const metropolis = { style: "metropolis", blocks: 9, pitch: 100, street: 20, seed: 3109, peak: 150, ground: 0 };
  assert.deepEqual(fingerprint(createCityLayout({ ...metropolis, x: 1300, z: 100 })), [184, "760667.722123"], "Corvan Prime (Corvan Frontier)");
  assert.deepEqual(fingerprint(createCityLayout({ ...metropolis, x: 80, z: -120 })), [184, "46747.722123"], "the first Corvan city");
});

test("A forge city has foundry halls, smokestacks rising through them and cooling towers", () => {
  const city = createCityLayout({ style: "forge", seed: 4441, x: 0, z: 0, blocks: 9, pitch: 100, street: 20, peak: 110 }), queries = cityQueries(city);
  const kinds = kind => city.buildings.filter(b => b.kind === kind);
  assert.ok(kinds("hall").length > 50 && kinds("stack").length > 30 && kinds("tower").length > 3);
  assert.equal(kinds("hall").length + kinds("stack").length + kinds("tower").length, city.buildings.length);
  for (const b of city.buildings) {
    const owner = city.blocks.find(k => Math.abs(b.x - k.x) <= k.size / 2 && Math.abs(b.z - k.z) <= k.size / 2);
    assert.ok(owner && Math.abs(b.x - owner.x) + b.w / 2 <= owner.size / 2 + 1e-9 && Math.abs(b.z - owner.z) + b.d / 2 <= owner.size / 2 + 1e-9, `${b.id} inside its block`);
  }
  for (const stack of kinds("stack")) {
    assert.ok(kinds("hall").some(h => Math.abs(stack.x - h.x) + stack.w / 2 <= h.w / 2 + 1e-9 && Math.abs(stack.z - h.z) + stack.d / 2 <= h.d / 2 + 1e-9), `${stack.id} stands inside a hall`);
    assert.ok(stack.height > 45 && queries.roofAt(stack.x, stack.z) === stack.height, "drones climb over the stack");
  }
  for (const plaza of city.plazas) assert.ok(queries.clearAt(plaza.x, plaza.z, plaza.radius - 1));
  for (const yard of city.parks) assert.ok(queries.clearAt(yard.x, yard.z, yard.size / 2 - 1));
});

test("Ashfall Frontier: a lava-veined valley among volcanoes holds a forge city far from the beacon", () => {
  const map = planetById("ashfall-frontier"), terrain = createPlanetTerrain(map), city = terrain.city;
  assert.ok(map.frontier && city.style === "forge" && city.buildings.length > 100);
  const b = createBattle(map, { terrain, ...missionSupply(createProgress(), map) });
  const home = b.zones.find(zone => zone.kind === "beachhead");
  assert.ok(Math.hypot(home.x - city.x, home.z - city.z) > 3000);
  assert.ok(terrain.isLand(home.x, home.z) && terrain.isLand(city.x, city.z) && city.ground > terrain.liquid + 1);
  for (const zone of b.zones) assert.ok(terrain.isLand(zone.x, zone.z), `${zone.name} is on solid ground`);
  for (const zone of b.zones.filter(zone => !zone.urban && zone.kind !== "beachhead")) assert.ok(terrain.siteOK(zone.x, zone.z));
  let lava = 0, highest = -Infinity;
  for (let x = -3000; x <= 3000; x += 50) for (let z = -3000; z <= 3000; z += 50) {
    if (!terrain.isLand(x, z)) lava += 1;
    highest = Math.max(highest, terrain.heightAt(x, z));
  }
  assert.ok(lava > 100, "lava channels cross the low ground");
  assert.ok(highest > map.landform.floor + 600, `volcanoes reach ${highest.toFixed(0)} m`);
  const stack = city.buildings.find(building => building.kind === "stack");
  assert.ok(terrain.roofAt(stack.x, stack.z) >= stack.height && !terrain.walkable(stack.x, stack.z));
  const saved = JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam })));
  assert.deepEqual(saved.battle.landform, map.landform);
  const rebuilt = createPlanetTerrain(checkpointPlanet(saved));
  assert.ok(restoreMissionCheckpoint(saved, rebuilt));
  for (const [x, z] of [[home.x, home.z], [stack.x, stack.z], [-1325, -651], [1500, -2500]]) assert.equal(rebuilt.heightAt(x, z), terrain.heightAt(x, z));
  assert.equal(validMissionCheckpoint({ ...saved, battle: { ...saved.battle, landform: { ...map.landform, volcanoes: 99 } } }), null);
});

test("On frontier maps ridges block line of sight; the valley floor does not; campaign maps are unchanged", () => {
  const map = planetById("corvan-frontier"), terrain = createPlanetTerrain(map);
  let peak = null;
  for (let x = -2800; x <= 2800; x += 100) for (let z = -2800; z <= 2800; z += 100) {
    const h = terrain.heightAt(x, z);
    if (!peak || h > peak.h) peak = { x, z, h };
  }
  assert.equal(terrain.lineBlocked(peak.x - 120, peak.z, 1.6, peak.x + 120, peak.z, 1.6), true, "across the highest peak");
  assert.equal(terrain.lineBlocked(peak.x - 120, peak.z, peak.h + 20, peak.x + 120, peak.z, peak.h + 20), false, "high above it");
  const { x, z } = map.landform;
  assert.equal(terrain.lineBlocked(x, z, 4, x + 120, z - 60, 22.6), false, "a gun and a drone across the valley floor");
  assert.equal(createPlanetTerrain(planetById("corvan")).lineBlocked, undefined, "campaign Corvan has no sight checks");
});

test("Buildings block line of sight: cover from city defenses, and an attack order closes in", () => {
  const city = createCityLayout(spec), queries = cityQueries(city);
  const tall = city.buildings.reduce((best, b) => (b.height > best.height ? b : best));
  const west = tall.x - tall.w / 2 - 15, east = tall.x + tall.w / 2 + 15;
  assert.equal(queries.lineBlocked(west, tall.z, 2, east, tall.z, 2), true, "through the tallest tower");
  assert.equal(queries.lineBlocked(west, tall.z, tall.height + 5, east, tall.z, tall.height + 5), false, "over its roof");
  const street = city.streets.find(s => s.id === "street-x1");
  assert.equal(queries.lineBlocked(street.x1 + 5, street.z1, 2, street.x2 - 5, street.z1, 2), false, "down an open street");

  const map = { ...planetById("corvan-frontier"), hazards: [] };
  const terrain = createPlanetTerrain(map), b = createBattle(map, { terrain, matter: 500, unlocks: ["scout"] });
  const home = b.zones.find(zone => zone.kind === "beachhead");
  assert.ok(requestDrop(b, { x: home.x, z: home.z, payload: { scout: 1 } }).ok);
  for (let t = 0; t < 30; t += 0.1) stepBattle(b, 0.1);
  const drone = b.units.find(u => u.side === "swarm" && !u.structure);
  const flak = b.units.find(u => u.type === "flak" && b.zones.find(zone => zone.id === u.home)?.urban);
  assert.ok(drone && flak);
  b.units = [flak, drone];
  // Over open street (so the drone keeps its cruise height), in flak range: one spot behind a
  // building, one in the open.
  let hidden = null, open = null;
  for (const share of [0.6, 0.5, 0.4, 0.7]) for (let a = 0; a < 360; a += 2) {
    const x = flak.x + Math.cos(a * Math.PI / 180) * defenderTypes.flak.range * share, z = flak.z + Math.sin(a * Math.PI / 180) * defenderTypes.flak.range * share;
    if (terrain.roofAt(x, z, 8) > 0) continue;
    if (terrain.lineBlocked(flak.x, flak.z, 4, x, z, drone.alt + 0.6)) hidden ||= { x, z }; else open ||= { x, z };
  }
  assert.ok(hidden && open);
  const place = spot => Object.assign(drone, { x: spot.x, z: spot.z, vx: 0, vz: 0, order: { kind: "hold", x: spot.x, z: spot.z }, slot: { dx: 0, dz: 0 } });
  const hp = drone.hp;
  place(hidden);
  for (let t = 0; t < 2; t += 0.1) stepBattle(b, 0.1);
  assert.equal(drone.hp, hp, "the building gives cover");
  place(open);
  for (let t = 0; t < 2; t += 0.1) stepBattle(b, 0.1);
  assert.ok(drone.hp < hp, "in the open the flak hits");
  // Ordered to attack from cover, the drone moves until it has a clear line.
  flak.damageScale = 1e-6;
  place(hidden);
  orderSquads(b, [drone.squad], { kind: "attack", target: flak.id, x: flak.x, z: flak.z });
  for (let t = 0; t < 15; t += 0.1) stepBattle(b, 0.1);
  assert.ok(drone.alive && !b.lineBlocked(drone.x, drone.z, drone.alt + 0.6, flak.x, flak.z, 4), "a clear line to the target");
});

test("Velm Frontier: a walled market town where troops use the gates and drones fly over the walls", () => {
  const map = planetById("velm-frontier"), terrain = createPlanetTerrain(map), city = terrain.city;
  const kinds = kind => city.buildings.filter(b => b.kind === kind);
  assert.ok(city.style === "town" && kinds("house").length > 300 && kinds("keep").length === 1 && kinds("turret").length === 4 && kinds("wall").length >= 8);
  const keep = kinds("keep")[0];
  assert.ok(keep.height > Math.max(...kinds("house").map(h => h.height)), "the keep stands over the roofs");
  for (const house of kinds("house")) {
    assert.ok(house.height > house.eaves && house.eaves >= 5);
    const owner = city.blocks.find(k => Math.abs(house.x - k.x) + house.w / 2 <= k.size / 2 + 1e-9 && Math.abs(house.z - k.z) + house.d / 2 <= k.size / 2 + 1e-9);
    assert.ok(owner, `${house.id} inside its block`);
  }
  // The wall rings the town outside its streets, inside the city bounds, with gaps for gates.
  const queries = cityQueries(city), { minX, maxX, minZ, maxZ } = city.bounds;
  for (const wall of kinds("wall")) assert.ok(wall.x - wall.w / 2 >= minX && wall.x + wall.w / 2 <= maxX && wall.z - wall.d / 2 >= minZ && wall.z + wall.d / 2 <= maxZ);
  const southWall = kinds("wall").filter(w => w.d === 3 && w.z < city.z);
  const wallZ = southWall[0].z;
  let gaps = 0, blocked = 0;
  for (let x = minX + 12; x < maxX - 12; x += 2) (queries.buildingAt(x, wallZ) ? blocked++ : gaps++);
  assert.ok(blocked > gaps * 5 && gaps >= 8, "mostly wall, with gates");
  assert.ok(terrain.walkable(city.x - city.half + 3 * city.pitch, wallZ), "a gate is open to troops");
  assert.ok(!terrain.walkable(southWall[0].x, wallZ) && terrain.roofAt(southWall[0].x, wallZ) === 10, "the wall is not, and drones climb 10 m over it");
  // The map: far from the beacon, rivers in the valley, zones on dry ground.
  const b = createBattle(map, { terrain, ...missionSupply(createProgress(), map) });
  const home = b.zones.find(zone => zone.kind === "beachhead");
  assert.ok(Math.hypot(home.x - city.x, home.z - city.z) > 3000);
  for (const zone of b.zones) assert.ok(terrain.isLand(zone.x, zone.z), `${zone.name} is dry`);
  let water = 0;
  for (let x = -3000; x <= 3000; x += 50) for (let z = -3000; z <= 3000; z += 50) if (!terrain.isLand(x, z)) water += 1;
  assert.ok(water > 50, "rivers run through the valley");
  assert.equal(b.zones.filter(zone => zone.urban).length, 5);
  const saved = JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam })));
  assert.ok(restoreMissionCheckpoint(saved, createPlanetTerrain(checkpointPlanet(saved))));
});
