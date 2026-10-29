// Mid-mission events (OBJ-02): every two or three minutes, once the first wave is down, the
// battle announces a Hive supply cache, a militia counter-attack on a held zone, or
// reinforcements for a town the swarm has not taken. Each is announced ahead of time, shown on
// the map, and kept in a battle checkpoint.
import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, stepBattle, requestDrop, announceOperation, operations, cacheMatter } from "../dist/invasion/battle.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { missionCheckpoint, validMissionCheckpoint } from "../dist/invasion/mission-save.mjs";
import { latestAlert } from "../dist/invasion/camera-assist.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

// A battle with its first wave down and the weather switched off.
function landed(id = "kepra") {
  const b = createBattle({ ...planetById(id), hazards: [] }, { matter: 2000, podSlots: 24 });
  const home = b.zones.find(z => z.kind === "beachhead");
  requestDrop(b, { x: home.x, z: home.z, payload: { scout: 4 } });
  run(b, 20);
  return b;
}
function run(b, seconds) { for (let t = 0; t < seconds; t += 0.1) stepBattle(b, 0.1); }
const texts = (b) => b.log.map(l => l.text);
const militia = (b, zone) => b.units.filter(u => u.alive && u.side === "native" && !u.structure && u.home === zone.id);

test("Nothing happens before the first wave; then one event every two or three minutes", () => {
  const b = createBattle({ ...planetById("kepra"), hazards: [] }, { matter: 2000 });
  run(b, operations.firstAt + 30);
  assert.equal(b.ops.pending, null);
  assert.ok(!b.log.some(l => /supply cache|Counter-attack|Reinforcements/.test(l.text)));
  const home = b.zones.find(z => z.kind === "beachhead");
  requestDrop(b, { x: home.x, z: home.z, payload: { scout: 2 } });
  run(b, 1);
  assert.ok(b.ops.pending, "announced right after the first drop");
  assert.ok(operations.gapS[0] <= b.ops.next - b.time + 1 && b.ops.next - b.time <= operations.gapS[1]);
  // Titan has nobody to counter-attack or reinforce: only supply caches.
  const practice = landed("titan");
  for (let i = 0; i < 4; i += 1) {
    practice.ops.caches = [];
    practice.ops.pending = null;
    practice.ops.next = practice.time;
    run(practice, 0.2);
    assert.equal(practice.ops.pending?.kind, "supply");
  }
});

test("A supply cache lands after its warning; the first drone to reach it collects the matter", () => {
  const b = landed();
  announceOperation(b, "supply");
  const pending = b.ops.pending, matter = cacheMatter(b);
  assert.equal(matter, 40 + 15 * b.threat);
  assert.ok(texts(b).includes(`Hive supply cache landing in ${operations.supply.warnS} s: ${matter} matter for the first drone to reach it.`));
  run(b, operations.supply.warnS + 0.2);
  assert.equal(b.ops.pending, null);
  assert.equal(b.ops.caches.length, 1);
  const cache = b.ops.caches[0];
  assert.deepEqual([cache.x, cache.z], [pending.x, pending.z]);
  const bank = b.matter, gathered = b.stats.matterHarvested;
  const drone = b.units.find(u => u.alive && u.side === "swarm" && !u.structure);
  Object.assign(drone, { x: cache.x + 5, z: cache.z });
  run(b, 0.1);
  assert.equal(b.ops.caches.length, 0);
  assert.ok(b.matter >= bank + matter && b.matter < bank + matter + 5, `${b.matter} vs ${bank} + ${matter}`);
  assert.ok(b.stats.matterHarvested >= gathered + matter);
  assert.ok(texts(b).includes(`Supply cache collected: +${matter} matter.`));
  // One nobody reaches is lost after a minute.
  b.ops.next = 1e8;
  announceOperation(b, "supply");
  const far = { x: b.ops.pending.x + 300, z: b.ops.pending.z + 300 };
  for (const unit of b.units) if (unit.side === "swarm") Object.assign(unit, { ...far, order: { kind: "hold", ...far } });
  run(b, operations.supply.warnS + operations.supply.lifeS + 1);
  assert.equal(b.ops.caches.length, 0);
  assert.ok(texts(b).includes("A supply cache was lost: no drone reached it in time."));
});

test("A counter-attack marches on a held zone after its warning, unless that zone is lost first", () => {
  const b = landed();
  b.ops.next = 1e8;
  const held = b.zones.find(z => z.kind === "settlement");
  Object.assign(held, { captured: true, control: 100 });
  // Nobody left inside to take it back while the test waits.
  for (const unit of b.units) if (unit.side === "native" && (unit.home === held.id || Math.hypot(unit.x - held.x, unit.z - held.z) <= held.radius + 4)) unit.alive = false;
  announceOperation(b, "counter");
  const pending = b.ops.pending, source = b.zones.find(z => z.id === pending.source);
  assert.equal(pending.zone, held.id);
  assert.equal(pending.count, 3, "2 + threat 1");
  assert.ok(texts(b).includes(`Counter-attack: 3 militia from ${source.name} will march on ${held.name} in ${operations.counter.warnS} s.`));
  const before = militia(b, source).length;
  run(b, operations.counter.warnS + 0.2);
  const marching = b.units.filter(u => u.alive && u.raid === held.id);
  assert.ok(marching.length >= 3, `${marching.length} raiding`);
  assert.ok(militia(b, source).length >= before + 3);
  assert.ok(texts(b).includes(`The counter-attack has begun: 3 militia from ${source.name} march on ${held.name}.`));
  // Called off when the zone is no longer the swarm's.
  announceOperation(b, "counter");
  const target = b.zones.find(z => z.id === b.ops.pending.zone);
  Object.assign(target, { captured: false, control: 0 });
  run(b, operations.counter.warnS + 0.2);
  assert.ok(texts(b).includes(`The counter-attack on ${target.name} was called off.`));
});

test("Reinforcements head for the town closest to falling: fresh militia and repairs, unless it is taken first", () => {
  const b = landed();
  b.ops.next = 1e8;
  const near = (town) => b.units.filter(u => u.alive && u.side === "native" && u.structure && Math.hypot(u.x - town.x, u.z - town.z) <= town.radius + 4);
  const town = b.zones.find(z => (z.kind === "settlement" || z.kind === "capital") && near(z).length);
  assert.ok(town, "a town with a defense to repair");
  town.control = 40;
  const defenses = near(town);
  for (const unit of defenses) unit.hp = 1;
  announceOperation(b, "reinforce");
  assert.equal(b.ops.pending.zone, town.id, "the town the swarm is closest to taking");
  assert.equal(b.ops.pending.count, 2);
  const before = militia(b, town).length;
  run(b, operations.reinforce.warnS + 0.2);
  assert.ok(defenses.every(u => !u.alive || u.hp === u.maxHp), "defenses repaired");
  assert.ok(militia(b, town).length >= before + 2, `${militia(b, town).length} vs ${before}`);
  assert.ok(texts(b).includes(`Reinforcements reached ${town.name}: 2 militia and repaired defenses.`));
  // Taken before they arrive: they turn back.
  announceOperation(b, "reinforce");
  const next = b.zones.find(z => z.id === b.ops.pending.zone);
  Object.assign(next, { captured: true, control: 100 });
  for (const unit of b.units) if (unit.side === "native" && (unit.home === next.id || Math.hypot(unit.x - next.x, unit.z - next.z) <= next.radius + 4)) unit.alive = false;
  run(b, operations.reinforce.warnS + 0.2);
  assert.ok(texts(b).includes(`The reinforcements for ${next.name} turned back: the swarm holds it.`));
});

test("Checkpoints keep events; damaged event state is refused; older battles load and play on", () => {
  const b = landed();
  b.ops.next = 1e8;
  announceOperation(b, "supply");
  run(b, operations.supply.warnS + 0.2);
  for (const unit of b.units) if (unit.side === "swarm") Object.assign(unit, { x: b.ops.caches[0].x + 300, z: b.ops.caches[0].z + 300 });
  announceOperation(b, "reinforce");
  const cam = { focus: { x: 0, z: 0 }, distance: 200, yaw: 0, pitch: 0.9 };
  const saved = JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam })));
  assert.ok(validMissionCheckpoint(saved));
  assert.equal(saved.battle.ops.caches.length, 1);
  assert.equal(saved.battle.ops.pending.kind, "reinforce");
  const broken = (ops) => validMissionCheckpoint({ ...saved, battle: { ...saved.battle, ops: { ...saved.battle.ops, ...ops } } });
  assert.equal(broken({ pending: { ...saved.battle.ops.pending, kind: "invasion" } }), null);
  assert.equal(broken({ pending: { ...saved.battle.ops.pending, zone: "nowhere" } }), null);
  assert.equal(broken({ caches: [{ ...saved.battle.ops.caches[0], id: saved.battle.ops.serial }] }), null);
  assert.equal(broken({ caches: "lots" }), null);
  const { ops, ...older } = saved.battle;
  assert.ok(validMissionCheckpoint({ ...saved, battle: older }), "battles saved before events still load");
  const resumed = landed();
  delete resumed.ops;
  run(resumed, 300);
  assert.equal(resumed.ops, undefined, "and simply have no events");
});

test("The page names what is coming on the map, points to caches and toasts arrivals", () => {
  const h = harness(null, { renderer: true }), drawn = [];
  const any = new Proxy(function () {}, { get: (t, k) => (k === "fillText" ? (s) => drawn.push(String(s)) : k === "strokeStyle" || k === "fillStyle" ? undefined : k === Symbol.toPrimitive ? () => 0 : any), apply: () => any, set: () => true });
  for (const node of h.nodes.values()) node.getContext = () => any;
  Object.assign(h.context, { swarmColor: "#5fe3ff", nativeColor: "#ff8a4a" });
  h.start();
  h.run(`startMission(planetById('kepra')); closeDropPanel(); scene.heightAt = () => 0; scene.unitPixelSize = () => 12;
    scene.project = (x, y, z) => ({ x: x < 5000 ? 400 : 5000, y: 300, visible: true });
    const b = mission.battle, town = b.zones.find(z => z.kind === 'settlement');
    globalThis.townName = town.name;
    b.ops.pending = { kind: 'reinforce', at: b.time + 12, x: town.x, z: town.z, zone: town.id, count: 2 };
    b.ops.caches = [{ id: 1, x: 10, z: 0, matter: 55, until: b.time + 41 }, { id: 2, x: 6000, z: 0, matter: 55, until: b.time + 50 }];
    b.ops.serial = 3;
    drawOverlay();
    handleEvents([{ kind: 'operation', type: 'supply', phase: 'landed', x: 10, z: 20, matter: 55 }, { kind: 'operation', type: 'supply', phase: 'collected', x: 10, z: 20, matter: 55 }]);`);
  const name = h.json("townName");
  assert.ok(drawn.some(t => t.startsWith(`${name} · `) && t.endsWith(" · reinforcements in 12 s")), drawn.filter(t => t.includes(name)).join(" | "));
  assert.ok(drawn.includes("Supply · 55 matter · 41 s"), drawn.join(" | "));
  assert.ok(drawn.some(t => /^Supply cache · \d+ m$/.test(t)), "an arrow points to the cache off screen");
  const toasts = h.nodes.get("toasts").children.map(n => n.textContent);
  assert.ok(toasts.includes("Supply cache down: 55 matter for the first drone to reach it. Tap to look."), toasts.join(" | "));
  assert.ok(toasts.includes("+55 matter from the supply cache."));
  // The jump-to-alert target follows announcements and landings.
  const alert = latestAlert(null, [{ kind: "operation", type: "counter", phase: "announced", x: 3, z: 4 }], { strikes: [], hazards: { events: [] }, units: [], time: 9 });
  assert.deepEqual(alert, { x: 3, z: 4, at: 9, text: "Counter-attack" });
});
