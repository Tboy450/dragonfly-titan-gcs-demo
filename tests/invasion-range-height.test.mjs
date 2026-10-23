// Weapon range in 3D (COMBAT-03): firing heights and the ground under each unit count.
import test from "node:test";
import assert from "node:assert/strict";
import { planetById } from "../dist/invasion/campaign.mjs";
import { createBattle, stepBattle, requestDrop, orderHold, shotRange } from "../dist/invasion/battle.mjs";

// Kepra on flat ground: one watchtower (bolt, 70 m, hits air) and one Scout hovering 50 m from it,
// on the side away from the zone so it does not capture. Everything else is cleared.
function towerAndScout() {
  const b = createBattle(planetById("kepra"), { matter: 500, unlocks: ["scout"] });
  const home = b.zones.find(z => z.kind === "beachhead");
  const drop = requestDrop(b, { x: home.x, z: home.z, payload: { scout: 1 } });
  for (let i = 0; i < 150; i++) stepBattle(b, 0.1);
  const tower = b.units.find(u => u.alive && u.type === "watchtower");
  const zone = b.zones.find(z => z.id === tower.home) || b.zones.reduce((best, z) => (Math.hypot(z.x - tower.x, z.z - tower.z) < Math.hypot(best.x - tower.x, best.z - tower.z) ? z : best));
  b.units = b.units.filter(u => u.side === "swarm" || u === tower);
  const scout = b.units.find(u => u.side === "swarm" && u.type === "scout" && u.alive);
  const away = Math.atan2(tower.z - zone.z, tower.x - zone.x);
  scout.x = tower.x + Math.cos(away) * 50; scout.z = tower.z + Math.sin(away) * 50;
  orderHold(b, [drop.squad.id]);
  for (const type in b.hazards.next) b.hazards.next[type] = Infinity; // no weather during the test
  return { b, tower, scout };
}
const run = (b, seconds) => { for (let t = 0; t < seconds; t += 0.1) stepBattle(b, 0.1); };

test("Range counts the height between shooters: a spear reaches a Striker overhead only from nearly underneath", () => {
  const b = createBattle(planetById("kepra"));
  const spearman = { x: 0, z: 0, alt: 0, side: "native" }, striker = { x: 20, z: 0, alt: 28, side: "swarm" };
  // Spear 28 m: flat, 20 m would be in range; with the 27 m height between them it is 33.6 m.
  assert.ok(Math.abs(shotRange(b, spearman, striker) - Math.hypot(20, 27)) < 1e-9);
  assert.ok(shotRange(b, spearman, { ...striker, x: 5 }) < 28);
  // Ground height counts too: the same pair with the Striker over a 40 m ridge.
  b.heightAt = (x) => (x > 10 ? 40 : 0);
  assert.ok(Math.abs(shotRange(b, spearman, striker) - Math.hypot(20, 67)) < 1e-9);
});

test("Street to roof: a drone hovering high over a tower is out of a watchtower's reach until it comes down", () => {
  const { b, tower, scout } = towerAndScout();
  b.roofAt = () => 48; // a 48 m tower under the drone: it climbs to 58 m
  run(b, 4);
  assert.ok(scout.alt > 56, `alt ${scout.alt}`);
  // 50 m away flat, well inside the 70 m bolt; 3D it is about 74 m.
  assert.ok(Math.hypot(scout.x - tower.x, scout.z - tower.z) < 70);
  assert.ok(shotRange(b, tower, scout) > 70);
  const hp = scout.hp;
  run(b, 3);
  assert.equal(scout.hp, hp, "no hits while out of reach above the roof");
  assert.equal(tower.target, null);
  b.roofAt = null; // past the tower: back down to cruise height and into reach
  run(b, 5);
  assert.ok(scout.alt < 30, `alt ${scout.alt}`);
  assert.ok(scout.hp < hp, "hit once it comes down");
  assert.equal(tower.target, scout.id);
});

test("A drone high on a ridge is out of reach of a watchtower in the valley below", () => {
  const { b, tower, scout } = towerAndScout();
  const ridge = (x, z) => Math.hypot(x - tower.x, z - tower.z) > 30 ? 60 : 0;
  b.heightAt = ridge;
  const hp = scout.hp;
  run(b, 3);
  assert.equal(scout.hp, hp);
  b.heightAt = () => 0;
  run(b, 3);
  assert.ok(scout.hp < hp);
});
