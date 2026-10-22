import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, stepBattle, requestDrop, queueOrder, replaceOrders, setPatrol, orderHold, maxQueue } from "../dist/invasion/battle.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { missionCheckpoint, validMissionCheckpoint } from "../dist/invasion/mission-save.mjs";

const cam = { focus: { x: 0, z: 0 }, distance: 230, yaw: 0, pitch: 0.9 };
const run = (b, seconds, each) => { for (let t = 0; t < seconds; t += 0.05) { stepBattle(b, 0.05); each?.(); } };
function titanSquad() {
  const b = createBattle(planetById("titan"), { matter: 500, unlocks: ["scout"] });
  const home = b.zones.find(z => z.kind === "beachhead");
  assert.ok(requestDrop(b, { x: home.x, z: home.z, payload: { scout: 3 } }).ok);
  run(b, 15);
  return { b, home, squad: b.squads[0] };
}

test("Queued waypoints run one after another; an idle squad starts a queued order at once", () => {
  const { b, home, squad } = titanSquad();
  const a = { kind: "move", x: home.x + 60, z: home.z }, c = { kind: "move", x: home.x + 60, z: home.z - 60 };
  assert.equal(queueOrder(b, [squad.id], a), 0, "idle: given now");
  assert.equal(squad.order.x, a.x);
  assert.equal(queueOrder(b, [squad.id], c), 1);
  const seen = new Set();
  run(b, 40, () => seen.add(`${squad.order.x},${squad.order.z}`));
  assert.ok(seen.has(`${a.x},${a.z}`) && seen.has(`${c.x},${c.z}`));
  assert.equal(squad.order.x, c.x);
  assert.equal(squad.queue.length, 0);
  for (let k = 0; k < maxQueue + 3; k += 1) queueOrder(b, [squad.id], { kind: "move", x: home.x + k, z: home.z });
  assert.ok(squad.queue.length <= maxQueue);
  replaceOrders(b, [squad.id], a);
  assert.equal(squad.queue, undefined, "a new order replaces the waypoints");
});

test("Patrol circles the waypoints and re-queues finished captures as moves; Hold stops it", () => {
  const { b, home, squad } = titanSquad();
  const beacon = b.zones.find(z => z.kind === "beacon");
  replaceOrders(b, [squad.id], { kind: "move", x: home.x + 40, z: home.z });
  queueOrder(b, [squad.id], { kind: "capture", zone: beacon.id, x: beacon.x, z: beacon.z });
  setPatrol(b, [squad.id], true);
  const kinds = [];
  let last = null;
  run(b, 240, () => { const key = `${squad.order.kind}@${Math.round(squad.order.x)}`; if (key !== last) { kinds.push(key); last = key; } });
  assert.ok(beacon.captured, "the patrol captured the beacon on the way");
  assert.ok(kinds.length >= 3, `the squad went round: ${kinds.join(" → ")}`);
  assert.ok(squad.queue.every(o => o.kind === "move"), "finished orders come back as moves");
  orderHold(b, [squad.id]);
  assert.equal(squad.patrol, undefined);
});

test("Attack-move turns armed drones on defenders they meet; plain moves fly past", () => {
  const outcome = (hunt) => {
    const planet = planetById("kepra");
    const b = createBattle(planet, { matter: 800, unlocks: ["scout", "striker"] });
    const home = b.zones.find(z => z.kind === "beachhead");
    requestDrop(b, { x: home.x, z: home.z, payload: { striker: 4 } });
    run(b, 14);
    const tower = b.units.find(u => u.side === "native" && u.structure);
    const drones = b.units.filter(u => u.side === "swarm" && !u.structure);
    // A route 100 m to the side of the tower: out of weapon range (75 m), within sight (130 m).
    for (const [i, d] of drones.entries()) { d.x = tower.x - 200; d.z = tower.z + 100 + i * 4; }
    replaceOrders(b, [b.squads[0].id], { kind: "move", x: tower.x + 300, z: tower.z + 100, ...(hunt ? { hunt: true } : {}) });
    const start = b.stats.damageDealt;
    run(b, 25);
    return b.stats.damageDealt - start;
  };
  const passing = outcome(false), hunting = outcome(true);
  assert.ok(hunting > 50 && hunting > passing * 2, `hunting ${hunting.toFixed(0)} vs passing ${passing.toFixed(0)}`);
});

test("Saves keep queues, patrol and attack-move, within limits", () => {
  const { b, home, squad } = titanSquad();
  replaceOrders(b, [squad.id], { kind: "move", x: home.x + 80, z: home.z, hunt: true });
  queueOrder(b, [squad.id], { kind: "move", x: home.x, z: home.z + 80 });
  setPatrol(b, [squad.id], true);
  const saved = JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam })));
  const valid = validMissionCheckpoint(saved);
  assert.ok(valid);
  assert.equal(valid.battle.squads[0].queue.length, 1);
  assert.equal(valid.battle.squads[0].patrol, true);
  const tooMany = structuredClone(saved);
  tooMany.battle.squads[0].queue = Array.from({ length: 9 }, () => ({ kind: "move", x: 0, z: 0 }));
  assert.equal(validMissionCheckpoint(tooMany), null);
  const badHunt = structuredClone(saved);
  badHunt.battle.squads[0].order.hunt = "yes";
  assert.equal(validMissionCheckpoint(badHunt), null);
});
