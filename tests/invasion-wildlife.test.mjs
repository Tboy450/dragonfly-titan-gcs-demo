// Wildlife (HAZ-01): sandworms on Kepra, swamp beasts on Velm and packs of ice crawlers on Corvan.
// They are on no one's side: each roams near its den and attacks drones and troops that come
// close, both fight back, and nothing they do raises the alarm.
import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, stepBattle, requestDrop, wildDenClear, wildZoneClear, wildLeash } from "../dist/invasion/battle.mjs";
import { wildlifeTypes, defenderTypes } from "../dist/invasion/units.mjs";
import { planets, frontiers, planetById } from "../dist/invasion/campaign.mjs";
import { missionCheckpoint, validMissionCheckpoint } from "../dist/invasion/mission-save.mjs";
import { fieldGuide } from "../dist/invasion/field-guide.mjs";
import { newTips } from "../dist/invasion/tips.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

const calm = (id) => createBattle({ ...planetById(id), hazards: [] }, { matter: 2000, podSlots: 24 });
const wild = (b) => b.units.filter(u => u.alive && u.side === "wild");
function run(b, seconds) { for (let t = 0; t < seconds; t += 0.1) stepBattle(b, 0.1); }
// A battle with a wave of Scouts down at the Hive beacon.
function landed(id) {
  const b = calm(id), home = b.zones.find(z => z.kind === "beachhead");
  requestDrop(b, { x: home.x, z: home.z, payload: { scout: 4 } });
  run(b, 16);
  b.ops.next = 1e8; // no mid-mission events while these tests watch
  return b;
}
const scouts = (b) => b.units.filter(u => u.alive && u.side === "swarm" && !u.structure);
const park = (unit, x, z) => Object.assign(unit, { x, z, vx: 0, vz: 0, order: { kind: "hold", x, z } });

test("Kepra has sandworms, Velm swamp beasts and Corvan packs of ice crawlers, well away from the zones", () => {
  const expected = { kepra: ["sandworm", 2], velm: ["swampBeast", 3], corvan: ["iceCrawler", 6] };
  for (const planet of [...planets, ...frontiers]) {
    const b = createBattle(planet, { matter: 100 }), found = wild(b);
    const [type, count] = expected[planet.id] || [null, 0];
    assert.equal(found.length, count, planet.id);
    if (!count) continue;
    assert.ok(found.every(u => u.type === type));
    const home = b.zones.find(z => z.kind === "beachhead");
    const dens = [...new Map(found.map(u => [`${u.den.x},${u.den.z}`, u.den])).values()];
    assert.equal(dens.length, planet.wildlife.dens);
    for (const den of dens) {
      assert.ok(Math.hypot(den.x - home.x, den.z - home.z) >= wildDenClear.beachhead);
      assert.ok(b.zones.every(z => Math.hypot(den.x - z.x, den.z - z.z) >= z.radius + wildZoneClear(wildlifeTypes[type])), `${planet.id} den near a zone`);
      assert.ok(dens.every(o => o === den || Math.hypot(den.x - o.x, den.z - o.z) >= wildDenClear.den));
    }
    // Added last: the zones, garrison and weather match a battle without wildlife.
    const without = createBattle({ ...planet, wildlife: undefined }, { matter: 100 });
    assert.deepEqual(b.zones, without.zones);
    assert.deepEqual(b.units.filter(u => u.side !== "wild"), without.units);
    assert.deepEqual(b.hazards.next, without.hazards.next);
    assert.deepEqual(wild(createBattle(planet, { matter: 100 })).map(u => [u.x, u.z]), found.map(u => [u.x, u.z]), "same seed, same dens");
  }
});

test("A sandworm attacks a drone that comes close; the drone shoots back, and its loss counts with the weather's", () => {
  const b = landed("kepra"), worm = wild(b)[0], scout = scouts(b)[0];
  park(scout, worm.x + 20, worm.z);
  const lost = b.stats.hazardLosses, alarm = b.alarm;
  run(b, 6);
  assert.ok(worm.hp < worm.maxHp, "the scout's needle gun hits it");
  assert.ok(!scout.alive || scout.hp < scout.maxHp, "the lunge reaches a drone flying overhead");
  if (!scout.alive) assert.equal(b.stats.hazardLosses, lost + 1);
  assert.equal(b.alarm, alarm, "no alarm from fighting wildlife");
});

test("Locals and wildlife fight each other, and the public does not blame the swarm", () => {
  const b = calm("velm"), beast = wild(b)[0];
  const rifleman = b.units.find(u => u.alive && u.side === "native" && u.type === defenderTypes.rifleman.id);
  Object.assign(rifleman, { x: beast.x + 15, z: beast.z });
  run(b, 8);
  assert.ok(beast.hp < beast.maxHp, "rifles hit it");
  assert.ok(!rifleman.alive || rifleman.hp < rifleman.maxHp, "it goes for the rifleman");
  assert.equal(b.alarm, 0);
});

test("Wildlife chases only near its den, and is killed without salvage or alarm", () => {
  const b = landed("kepra"), worm = wild(b)[0], den = worm.den, roam = wildlifeTypes.sandworm.roam;
  for (const other of wild(b)) if (other !== worm) other.alive = false;
  const [near, far, ...rest] = scouts(b);
  for (const unit of rest) park(unit, den.x - 400, den.z - 400);
  // Prey beyond the leash is ignored, even in sight: the worm turns back towards its den.
  park(far, den.x + roam * wildLeash + 30, den.z);
  park(near, den.x - 500, den.z - 500);
  Object.assign(worm, { x: den.x + roam * wildLeash - 20, z: den.z });
  const start = Math.hypot(worm.x - den.x, worm.z - den.z);
  run(b, 3);
  assert.ok(Math.hypot(worm.x - den.x, worm.z - den.z) < start, "back towards the den");
  // Prey within the leash is chased.
  park(far, den.x - 500, den.z + 500);
  park(near, den.x + 50, den.z); // 70 m away: in sight, and near the den
  Object.assign(worm, { x: den.x - 20, z: den.z });
  run(b, 2);
  assert.ok(worm.x > den.x - 20 + 4, "it goes after the drone");
  // Killed: a log line, nothing else.
  worm.hp = 0.5;
  park(near, worm.x + 15, worm.z);
  const salvage = b.stats.defensesDestroyed, militia = b.stats.militiaDefeated;
  run(b, 2);
  assert.equal(worm.alive, false);
  assert.ok(b.log.some(l => l.text === "Sandworm killed."));
  assert.equal(b.stats.defensesDestroyed, salvage);
  assert.equal(b.stats.militiaDefeated, militia);
  assert.equal(b.alarm, 0);
});

test("Checkpoints keep wildlife and its dens; a creature without a den is refused", () => {
  const b = calm("corvan");
  run(b, 2);
  const cam = { focus: { x: 0, z: 0 }, distance: 200, yaw: 0, pitch: 0.9 };
  const saved = JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam })));
  assert.ok(validMissionCheckpoint(saved));
  assert.equal(saved.battle.units.filter(u => u.side === "wild").length, 6);
  const edit = (change) => validMissionCheckpoint({ ...saved, battle: { ...saved.battle, units: saved.battle.units.map(change) } });
  assert.equal(edit(u => (u.side === "wild" ? { ...u, den: undefined } : u)), null);
  assert.equal(edit(u => (u.side === "wild" ? { ...u, side: "native" } : u)), null);
  assert.equal(edit(u => (u.side === "native" && !u.structure ? { ...u, den: { x: 0, z: 0 } } : u)), null);
});

test("The Field guide, the planet panel and a first-sighting tip describe the wildlife", () => {
  const section = fieldGuide().find(s => s.section === "Wildlife");
  assert.deepEqual(section.items.map(i => i.name), ["Sandworm", "Swamp beast", "Ice crawler"]);
  assert.ok(section.items[0].facts.includes("Lives on Kepra. Attacks drones and troops alike, and both fight back; killing it raises no alarm"));
  assert.ok(section.items[2].facts.some(f => f.startsWith("Leaping bite: 6/s against air, ground out to 30 m")));
  // The tip shows the first time a drone sees one.
  const b = landed("kepra"), worm = wild(b)[0], seen = new Set();
  assert.ok(!newTips(seen, b, []).some(t => t.id === "wildlife:sandworm"));
  park(scouts(b)[0], worm.x + 100, worm.z);
  assert.ok(newTips(seen, b, []).some(t => t.id === "wildlife:sandworm" && t.text.startsWith("Sandworm ahead: wildlife attacks anything")));
  assert.equal(newTips(seen, b, []).length, 0, "once");
  const h = harness(null, { renderer: true });
  h.start();
  for (const [id, text] of [["kepra", "Wildlife: 2 sandworms<"], ["velm", "Wildlife: 3 swamp beasts<"], ["corvan", "Wildlife: 6 ice crawlers in packs of 3<"]]) {
    h.run(`selectedPlanet = '${id}'; show('galaxy');`);
    assert.ok(h.nodes.get("planet-panel").innerHTML.includes(text), id);
  }
  h.run(`selectedPlanet = 'ashfall'; renderPlanetPanel();`);
  assert.ok(!h.nodes.get("planet-panel").innerHTML.includes("Wildlife:"));
});
