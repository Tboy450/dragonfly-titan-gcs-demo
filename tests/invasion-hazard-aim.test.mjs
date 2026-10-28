// Where strikes land (HAZ-06) and hazards that hit defenders (HAZ-04): near misses clear the whole
// squad, vents open beside it and only now and then graze its edge, bolts fall on defenders too,
// and the weather's kills pay salvage without raising the alarm.
import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, stepBattle, requestDrop, artilleryNearMiss } from "../dist/invasion/battle.mjs";
import { clearSpot, boltNearMiss, ventGraze, ventStructureDamage, hazardTypes } from "../dist/invasion/hazards.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { droneTypes } from "../dist/invasion/units.mjs";

// A tight squad of 20 Scouts (4 m apart) parked 200 m from the beacon, unkillable, hazards off.
function parked(planetId, seed = 7) {
  const b = createBattle({ ...planetById(planetId), seed }, { matter: 5000, podSlots: 44, unlocks: Object.keys(droneTypes) });
  const home = b.zones.find(z => z.kind === "beachhead");
  requestDrop(b, { x: home.x, z: home.z, payload: { scout: 20 } });
  for (const type in b.hazards.next) b.hazards.next[type] = Infinity;
  for (let t = 0; t < 14; t += 0.1) stepBattle(b, 0.1);
  const dx = b.map.centerX - home.x, dz = b.map.centerZ - home.z, len = Math.hypot(dx, dz) || 1;
  const spot = { x: home.x + dx / len * 200, z: home.z + dz / len * 200 };
  const drones = b.units.filter(u => u.side === "swarm" && !u.structure);
  const hold = () => drones.forEach((d, i) => { d.hp = d.maxHp = 1e9; d.x = spot.x + (i % 5) * 4; d.z = spot.z + Math.floor(i / 5) * 4; d.vx = d.vz = 0; d.order = { kind: "hold", x: d.x, z: d.z }; });
  hold();
  return { b, drones, hold, home };
}
const nearest = (drones, p) => Math.min(...drones.map(d => Math.hypot(d.x - p.x, d.z - p.z)));

test("A clear spot misses every drone, stays on the map, and is null when there is none", () => {
  const { b, drones } = parked("kepra");
  const spot = clearSpot(b, drones[7], 20, 80);
  assert.ok(nearest(drones, spot) >= 20 - 1e-9);
  assert.ok(Math.abs(spot.x - b.map.centerX) < b.map.half && Math.abs(spot.z - b.map.centerZ) < b.map.half);
  assert.equal(clearSpot(b, drones[7], 20, 0), null, "no room without looking further");
  assert.ok(boltNearMiss > 0 && artilleryNearMiss > 0 && ventGraze > 0 && ventGraze < 0.5);
});

test("Vents open beside the squad: most miss it, and a graze reaches only its edge", () => {
  let vents = 0, grazes = 0;
  for (const seed of [3, 5, 8, 13]) {
    const { b, drones, hold, home } = parked("ashfall", seed);
    for (let i = 0; i < 5; i++) {
      b.hazards.next.eruption = b.time;
      for (let t = 0; t < 30; t += 0.1) {
        hold(); stepBattle(b, 0.1); hold();
        const vent = b.hazards.events.find(e => e.type === "eruption" && !e.seen);
        if (!vent) continue;
        vent.seen = true; vents += 1;
        const gap = nearest(drones, vent);
        assert.ok(gap >= vent.radius - 5 - 1e-9, `a vent ${gap.toFixed(1)} m from a drone reaches too deep`);
        if (gap < vent.radius) grazes += 1;
        assert.ok(Math.hypot(vent.x - home.x, vent.z - home.z) > home.radius + 70 - 1e-9, "never under the beacon");
      }
      b.hazards.next.eruption = Infinity;
    }
  }
  assert.equal(vents, 20);
  assert.ok(grazes >= 1 && grazes <= 9, `${grazes} of ${vents} vents grazed the squad`);
});

test("Lightning falls on drones and defenders; near misses clear the whole squad", () => {
  let bolts = 0, misses = 0, atDefenders = 0, direct = 0;
  for (const seed of [2, 4, 6]) {
    const { b, drones, hold } = parked("halcyon", seed);
    b.hazards.next.lightning = b.time;
    for (let t = 0; t < 40; t += 0.1) {
      hold(); stepBattle(b, 0.1); hold(); // measured from the spots the bolts were aimed at
      for (const s of b.strikes) {
        if (s.source !== "lightning" || s.seen) continue;
        s.seen = true; bolts += 1;
        const gap = nearest(drones, s);
        if (s.nearMiss) { misses += 1; assert.ok(gap >= s.radius + 2 - 1e-9, "a near miss lands clear of every drone"); }
        else if (gap <= 6 + 1e-9) direct += 1;
        else atDefenders += 1;
      }
    }
  }
  assert.ok(bolts >= 15, `${bolts} bolts`);
  assert.ok(misses >= 1 && direct >= 1 && atDefenders >= 1, JSON.stringify({ bolts, misses, direct, atDefenders }));
  assert.ok(direct < bolts * 0.6, "most bolts no longer land on the swarm");
});

test("Artillery sometimes falls beside the swarm; the rest land within 6 m of a drone", () => {
  const { b, drones, hold } = parked("ashfall", 9);
  let shells = 0, misses = 0;
  for (let t = 0; t < 300; t += 0.1) {
    hold(); b.alarm = 95; stepBattle(b, 0.1); hold();
    for (const s of b.strikes) {
      if (s.source !== "artillery" || s.seen) continue;
      s.seen = true; shells += 1;
      if (s.nearMiss) { misses += 1; assert.ok(nearest(drones, s) >= 25 - 1e-9); }
      else assert.ok(drones.some(d => Math.abs(d.x - s.x) <= 6 + 1e-9 && Math.abs(d.z - s.z) <= 6 + 1e-9));
    }
  }
  assert.ok(shells >= 10 && misses >= 1 && misses < shells, `${misses} of ${shells}`);
});

test("Bolts and eruptions hurt defenders; the weather's kills pay salvage and raise no alarm", () => {
  // No drones on the field, so only the weather touches the defenders.
  const b = createBattle(planetById("ashfall"), { matter: 5000 });
  for (const type in b.hazards.next) b.hazards.next[type] = Infinity;
  const tower = b.units.find(u => u.alive && u.side === "native" && u.structure);
  const troop = b.units.find(u => u.alive && u.side === "native" && !u.structure);
  // A bolt on the tower and the trooper, standing apart.
  troop.x = tower.x + 200; troop.z = tower.z;
  const matter = b.matter, hp = tower.hp;
  b.strikes.push({ x: tower.x, z: tower.z, radius: 10, damage: 24, markedAt: b.time, hitAt: b.time, source: "lightning", hit: false });
  stepBattle(b, 0.1);
  assert.equal(tower.hp, hp - 24, "lightning hits a defense");
  // An eruption on both: the trooper takes the full burn, the defense 40%.
  b.hazards.events.push({ id: 99, type: "eruption", name: "Eruption", kind: "eruption", phase: "active", startedAt: b.time, activeAt: b.time, endsAt: b.time + 60, x: troop.x, z: troop.z, radius: 55, windAngle: 0, nextStrike: 0 });
  b.hazards.events.push({ id: 98, type: "eruption", name: "Eruption", kind: "eruption", phase: "active", startedAt: b.time, activeAt: b.time, endsAt: b.time + 60, x: tower.x, z: tower.z, radius: 55, windAngle: 0, nextStrike: 0 });
  b.alarm = 0;
  const troopHp = troop.hp, towerHp = tower.hp;
  stepBattle(b, 0.1);
  const burn = hazardTypes.eruption.damage * b.hazards.severity;
  assert.ok(Math.abs((troopHp - troop.hp) - burn * 0.1) < 1e-6 || !troop.alive, "the trooper burns for one step's damage");
  assert.ok(Math.abs((towerHp - tower.hp) - burn * ventStructureDamage * 0.1) < 1e-6, "the defense takes 40%");
  for (let t = 0; t < 120 && (troop.alive || tower.alive); t += 0.1) stepBattle(b, 0.1);
  assert.equal(troop.alive, false);
  assert.equal(tower.alive, false);
  assert.equal(b.alarm, 0, "the public does not blame the swarm for the weather");
  assert.ok(b.matter >= matter + 6, "the wreck pays salvage");
  assert.ok(b.log.some(l => / destroyed by the weather \(\+6 matter salvage\)\./.test(l.text)));
});

test("Weather sealing softens bolts on drones too", () => {
  const hits = [];
  for (const sealing of [0, 2]) {
    const { b, drones } = parked("halcyon");
    b.upgrades = { sealing };
    const d = drones[0], hp = d.hp;
    b.strikes.push({ x: d.x, z: d.z, radius: 1, damage: 20, markedAt: b.time, hitAt: b.time, source: "lightning", hit: false });
    stepBattle(b, 0.1);
    hits.push(hp - d.hp);
  }
  assert.ok(hits[0] >= 20 - 1e-9 && Math.abs(hits[1] - hits[0] * 0.6) < 1, JSON.stringify(hits));
});
