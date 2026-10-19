import test from "node:test";
import assert from "node:assert/strict";
import { planets, planetById } from "../dist/invasion/campaign.mjs";
import {
  createBattle, stepBattle, requestDrop, checkDrop, orderAt, orderSquads, battleSummary,
  objectiveStatus, starsEarned, missionResult, retreat, zoneById, flatTerrain, extractVictory,
} from "../dist/invasion/battle.mjs";
import { hazardTypes } from "../dist/invasion/hazards.mjs";
import { createPlanetTerrain } from "../dist/invasion/planet-terrain.mjs";
import { droneTypes, payloadCost } from "../dist/invasion/units.mjs";

const run = (b, seconds, dt = 0.1) => { for (let t = 0; t < seconds && !b.outcome; t += dt) stepBattle(b, dt); };
const beachhead = (b) => b.zones.find(z => z.kind === "beachhead");
const drones = (b) => b.units.filter(u => u.alive && u.side === "swarm" && !u.structure);

function dropAndWait(b, payload) {
  const home = beachhead(b);
  const result = requestDrop(b, { x: home.x, z: home.z, payload });
  assert.ok(result.ok, result.reason);
  run(b, 10.5);
  return result.squad;
}

test("Titan practice: drop, capture the beacons, recover the Dragonfly and win", () => {
  const titan = planetById("titan");
  const b = createBattle(titan, { matter: 160, terrain: flatTerrain });
  assert.equal(b.units.length, 0, "an uninhabited planet has no defenders");
  const squad = dropAndWait(b, { scout: 6, link: 3 });
  assert.equal(drones(b).length, 9);
  for (const id of ["relic", "outcrop", "site-a"]) {
    const zone = zoneById(b, id);
    const order = orderAt(b, [squad.id], zone.x, zone.z);
    assert.equal(order.kind, "capture");
    for (let t = 0; t < 120 && !zone.captured; t += 0.1) stepBattle(b, 0.1);
    assert.ok(zone.captured, `${id} captured`);
  }
  assert.equal(b.outcome, null, "required captures make victory available without ending play");
  assert.equal(b.victoryAvailable, true);
  assert.equal(extractVictory(b), true);
  assert.equal(b.outcome, "won");
  assert.ok(b.unlocks.includes("dragonfly"), "the Dragonfly can be dropped as soon as it is recovered");
  const status = objectiveStatus(b);
  assert.ok(status.find(o => o.id === "dragonfly").done);
  assert.ok(status.find(o => o.id === "no-losses").done);
  assert.equal(starsEarned(b), 3);
  const result = missionResult(b);
  assert.deepEqual(result.recovered, ["dragonfly"]);
  assert.ok(result.matter > 160 - payloadCost({ scout: 6, link: 3 }), "zone income and the recall refund add matter");
  assert.equal(b.alarm, 0, "nobody to alarm on Titan");
});

test("Drop checks: matter, pod size, recharge, location, locked types and the Dragonfly limit", () => {
  const b = createBattle(planetById("kepra"), { matter: 100, podSlots: 12, terrain: flatTerrain });
  const home = beachhead(b);
  const at = { x: home.x, z: home.z };
  assert.equal(checkDrop(b, { ...at, payload: {} }).ok, false);
  assert.match(checkDrop(b, { ...at, payload: { striker: 1 } }).reason, /locked/);
  assert.match(checkDrop(b, { ...at, payload: { scout: 13 } }).reason, /slots/);
  assert.match(checkDrop(b, { ...at, payload: { link: 5 } }).reason, /matter/);
  const far = b.zones.find(z => z.kind !== "beachhead");
  assert.match(checkDrop(b, { x: far.x, z: far.z, payload: { scout: 1 } }).reason, /zone you hold/);
  assert.ok(requestDrop(b, { ...at, payload: { scout: 2 } }).ok);
  assert.match(checkDrop(b, { ...at, payload: { scout: 1 } }).reason, /recharging/);
  const rich = createBattle(planetById("kepra"), { matter: 1000, podSlots: 40, unlocks: Object.keys(droneTypes), terrain: flatTerrain });
  const richHome = beachhead(rich);
  assert.match(checkDrop(rich, { x: richHome.x, z: richHome.z, payload: { dragonfly: 4 } }).reason, /At most 3/);
  assert.ok(checkDrop(rich, { x: richHome.x, z: richHome.z, payload: { dragonfly: 3 } }).ok);
});

test("Damage path: Strikers destroy defenses for salvage but raise the alarm", () => {
  const kepra = planetById("kepra");
  const b = createBattle(kepra, { matter: 400, podSlots: 16, unlocks: ["scout", "link", "striker"], terrain: flatTerrain });
  assert.equal(b.zones.length, kepra.zoneCount + 1);
  assert.ok(b.units.some(u => u.type === "watchtower"), "tribal zones have watchtowers");
  assert.ok(b.units.some(u => u.type === "spearman"), "and spear throwers");
  const squad = dropAndWait(b, { striker: 6 });
  const target = b.units.find(u => u.type === "watchtower");
  const order = orderAt(b, [squad.id], target.x, target.z);
  assert.equal(order.kind, "attack");
  const matterBefore = b.matter;
  for (let t = 0; t < 90 && target.alive; t += 0.1) stepBattle(b, 0.1);
  assert.equal(target.alive, false, "the tower falls");
  assert.ok(b.stats.defensesDestroyed >= 1);
  assert.ok(b.alarm > 0, "violence alarms the public");
  assert.ok(b.matter >= matterBefore + 6 - 1e-9, "salvage pays matter");
});

test("Control path: Links capture under fire and turn the defenses", () => {
  const b = createBattle(planetById("kepra"), { matter: 400, podSlots: 16, terrain: flatTerrain });
  const squad = dropAndWait(b, { link: 8 });
  const zone = b.zones.filter(z => z.kind !== "beachhead").sort((a, c) => Math.hypot(a.x - beachhead(b).x, a.z - beachhead(b).z) - Math.hypot(c.x - beachhead(b).x, c.z - beachhead(b).z))[0];
  const towers = b.units.filter(u => u.structure && u.home === zone.id);
  assert.ok(towers.length >= 1);
  orderSquads(b, [squad.id], { kind: "capture", zone: zone.id, x: zone.x, z: zone.z });
  for (let t = 0; t < 200 && !zone.captured && drones(b).length; t += 0.1) stepBattle(b, 0.1);
  assert.ok(zone.captured, "Links take the zone without destroying its tower");
  assert.ok(towers.filter(t => t.alive).every(t => t.side === "swarm" && t.converted), "standing defenses switch sides");
  assert.equal(b.stats.defensesDestroyed, 0);
});

test("Hazards are announced before they start, and shelter halves weather damage", () => {
  const velm = planetById("velm");
  const b = createBattle(velm, { matter: 300, terrain: flatTerrain });
  const squad = dropAndWait(b, { scout: 10 });
  const home = beachhead(b);
  orderAt(b, [squad.id], home.x + 100, home.z - 100);
  let warned = null, started = null;
  for (let t = 0; t < 200 && !started; t += 0.1) {
    stepBattle(b, 0.1);
    const event = b.hazards.events[0];
    if (event && !warned) warned = { at: b.time, phase: event.phase };
    if (event?.phase === "active") started = b.time;
  }
  assert.ok(warned && started, "an acid rain front arrives");
  assert.equal(warned.phase, "warning");
  assert.ok(started - warned.at >= hazardTypes.acidRain.warnS - 0.2, "with its full warning time");
  assert.ok(b.hazards.effects.damage > 0);
  const exposed = drones(b)[0], before = exposed.hp;
  stepBattle(b, 0.1);
  assert.ok(exposed.hp < before, "drones outside zones corrode");
});

test("Lightning bolts are marked before they land and hit bunched drones", () => {
  const halcyon = planetById("halcyon");
  const b = createBattle(halcyon, { matter: 2000, podSlots: 40, unlocks: Object.keys(droneTypes), terrain: flatTerrain });
  dropAndWait(b, { scout: 20 });
  b.hazards.next.lightning = b.time;
  let marked = null, landed = null;
  for (let t = 0; t < 60 && !landed; t += 0.1) {
    stepBattle(b, 0.1);
    const strike = b.strikes.find(s => s.source === "lightning");
    if (strike && !marked) marked = { ...strike, seenAt: b.time };
    if (strike?.hit) landed = b.time;
  }
  assert.ok(marked, "a bolt is aimed at the swarm");
  assert.ok(marked.hitAt - marked.markedAt >= hazardTypes.lightning.strikeWarnS - 1e-9, "with a visible warning");
  assert.ok(landed >= marked.hitAt);
});

test("A solar flare stuns drones outside held zones only", () => {
  // Titan's empty map with Aurex's flares, so no defenders interfere with the comparison.
  const b = createBattle({ ...planetById("titan"), hazards: ["solarFlare"] }, { matter: 2000, podSlots: 40, unlocks: Object.keys(droneTypes), terrain: flatTerrain });
  const squad = dropAndWait(b, { scout: 4 });
  const second = dropAndWait(b, { scout: 4 });
  const home = beachhead(b);
  orderAt(b, [squad.id], home.x + 160, home.z - 40);
  run(b, 15);
  b.hazards.events = [{ id: 99, type: "solarFlare", name: "Solar flare", kind: "flare", phase: "active", startedAt: b.time, activeAt: b.time, endsAt: b.time + 30 }];
  stepBattle(b, 0.1);
  assert.equal(b.hazards.effects.stun, true);
  const outside = drones(b).filter(u => u.squad === squad.id);
  const inside = drones(b).filter(u => u.squad === second.id);
  orderAt(b, [squad.id, second.id], home.x + 300, home.z - 300);
  const start = new Map(drones(b).map(u => [u.id, { x: u.x, z: u.z }]));
  run(b, 1);
  const moved = (u) => Math.hypot(u.x - start.get(u.id).x, u.z - start.get(u.id).z);
  const avg = (list) => list.reduce((s, u) => s + moved(u), 0) / list.length;
  assert.ok(avg(outside) < avg(inside) * 0.6, "stunned drones barely move");
});

test("Losing every drone with no matter left ends the mission; retreat recalls survivors", () => {
  const b = createBattle(planetById("kepra"), { matter: 8, terrain: flatTerrain });
  dropAndWait(b, { scout: 1 });
  for (const unit of drones(b)) unit.hp = 0.0001;
  b.units.filter(u => u.side === "swarm").forEach(u => { u.x = b.zones[1].x; u.z = b.zones[1].z; });
  run(b, 20);
  assert.equal(b.outcome, "lost");
  const r = createBattle(planetById("kepra"), { matter: 80, terrain: flatTerrain });
  dropAndWait(r, { scout: 4 });
  const before = r.matter;
  retreat(r);
  assert.equal(r.outcome, "retreated");
  assert.equal(r.matter, before + 4 * droneTypes.scout.cost * 0.5);
  assert.equal(missionResult(r).stars, 0);
});

test("Generated planets place every zone on dry, level ground and are reproducible", () => {
  for (const planet of planets.filter(p => !p.zones)) {
    const terrain = createPlanetTerrain(planet);
    const b = createBattle(planet, { terrain });
    assert.equal(b.zones.length, planet.zoneCount + 1, planet.id);
    for (const zone of b.zones) {
      assert.ok(terrain.isLand(zone.x, zone.z), `${planet.id} ${zone.name} on land`);
      const center = terrain.heightAt(zone.x, zone.z);
      assert.ok(Math.abs(terrain.heightAt(zone.x + zone.radius * 0.5, zone.z) - center) < 0.01, `${planet.id} ${zone.name} pad is level`);
      if (terrain.liquid !== null && !terrain.solidLiquid) assert.ok(center > terrain.liquid + 1, `${planet.id} ${zone.name} above liquid`);
    }
    for (let i = 1; i < b.zones.length; i += 1) for (let j = 0; j < i; j += 1) {
      assert.ok(Math.hypot(b.zones[i].x - b.zones[j].x, b.zones[i].z - b.zones[j].z) > 100, `${planet.id} zones are spread out`);
    }
    for (const objective of planet.objectives.filter(o => o.kind === "destroyType")) {
      assert.ok(b.units.some(u => u.type === objective.type), `${planet.id} has a ${objective.type} to destroy`);
    }
    const again = createBattle(planet, { terrain: createPlanetTerrain(planet) });
    assert.deepEqual(again.zones.map(z => [z.x, z.z, z.name]), b.zones.map(z => [z.x, z.z, z.name]));
  }
});

test("A whole mission is deterministic for a given seed", () => {
  const play = () => {
    const b = createBattle(planetById("corvan"), { matter: 600, podSlots: 20, unlocks: ["scout", "link", "striker", "breacher"], terrain: flatTerrain });
    const squad = dropAndWait(b, { striker: 4, breacher: 2, link: 2 });
    const zone = b.zones[1];
    orderAt(b, [squad.id], zone.x, zone.z);
    run(b, 90);
    return JSON.stringify({ units: b.units.map(u => [u.id, u.x.toFixed(3), u.hp.toFixed(3)]), alarm: b.alarm.toFixed(4), summary: battleSummary(b) });
  };
  assert.equal(play(), play());
});
