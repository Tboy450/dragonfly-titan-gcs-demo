import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createBattle, requestDrop, checkDrop, stepBattle, orderSquads, orderHold, battleSummary, flatTerrain } from "../dist/invasion/battle.mjs";
import { planets, planetById } from "../dist/invasion/campaign.mjs";
import { createPlanetTerrain } from "../dist/invasion/planet-terrain.mjs";
import { droneTypes, payloadCost, payloadCount, dropDurationS } from "../dist/invasion/units.mjs";
import { packDropPods, podSpacing, podRadius } from "../dist/invasion/drop-waves.mjs";
import { missionCheckpoint, restoreMissionCheckpoint, validMissionCheckpoint, MISSION_SAVE_VERSION } from "../dist/invasion/mission-save.mjs";

const create = (terrain = flatTerrain) => createBattle(planetById("titan"), { matter: 10000, podSlots: 44, unlocks: Object.keys(droneTypes), terrain });
const atHome = (b, payload) => ({ x: b.zones[0].x, z: b.zones[0].z, payload });
const run = (b, seconds) => { for (let i = 0; i < Math.round(seconds * 20); i++) stepBattle(b, 0.05); };
const drones = b => b.units.filter(u => u.side === "swarm" && !u.structure);
const cam = { focus: { x: 0, z: 0 }, distance: 230, yaw: 0, pitch: 0.9 };
const snapshot = battle => missionCheckpoint({ battle, cam });
const plain = b => { const { isLand, heightAt, canDropAt, events, ...data } = b; return data; };

test("Payload packing preserves mixed types and dedicates one pod to each large Dragonfly", () => {
  for (const count of [1, 2, 3, 4, 44]) {
    const pods = packDropPods({ scout: count });
    assert.equal(pods.length, Math.ceil(count / 3));
    assert.equal(pods.reduce((n, p) => n + payloadCount(p), 0), count);
    assert.ok(pods.every(p => payloadCount(p) >= 1 && payloadCount(p) <= 3));
  }
  const payload = { dragonfly: 2, breacher: 1, link: 2, scout: 4, striker: 1 };
  const pods = packDropPods(payload);
  assert.deepEqual(pods, packDropPods(Object.fromEntries(Object.entries(payload).reverse())));
  for (const [type, count] of Object.entries(payload)) assert.equal(pods.reduce((n, p) => n + (p[type] || 0), 0), count);
  assert.ok(pods.filter(p => p.dragonfly).every(p => payloadCount(p) === 1));
});

test("Wave preview is deterministic, mutation-free and charges one purchase/cooldown", () => {
  const b = create(), request = atHome(b, { scout: 4, link: 2 });
  const before = snapshot(b), first = checkDrop(b, request);
  assert.ok(first.ok, first.reason);
  assert.deepEqual(checkDrop(b, request), first);
  assert.deepEqual(snapshot(b), before);
  const result = requestDrop(b, request);
  assert.ok(result.ok);
  assert.equal(result.pods.length, 2);
  assert.equal(result.pod, result.pods[0], "legacy callers can still read the first pod");
  assert.equal(b.matter, 10000 - payloadCost(request.payload));
  assert.equal(b.stats.drops, 1);
  assert.equal(b.stats.podsLaunched, 2);
  assert.equal(b.squads.length, 1);
  assert.ok(result.pods.every(p => p.squad === result.squad.id && p.waveId === result.waveId));
  assert.equal(new Set([result.waveId, ...result.pods.map(p => p.id)]).size, 3);
  assert.deepEqual(result.pods.map(({ x, z }) => ({ x, z })), first.landings);
  assert.match(checkDrop(b, request).reason, /recharging/);
});

test("Maximum wave fits distinct canopy courts inside the held zone and map", () => {
  const b = create(), result = requestDrop(b, atHome(b, { scout: 44 }));
  assert.ok(result.ok, result.reason);
  assert.equal(result.pods.length, 15);
  for (const a of result.pods) {
    assert.ok(Math.hypot(a.x - b.zones[0].x, a.z - b.zones[0].z) + podRadius <= b.zones[0].radius + 1e-6);
    for (const c of result.pods) if (a !== c) assert.ok(Math.hypot(a.x - c.x, a.z - c.z) >= podSpacing - 1e-6);
  }
  run(b, 12);
  assert.equal(drones(b).length, 44);
  assert.equal(new Set(drones(b).map(u => `${u.slot.dx},${u.slot.dz}`)).size, 44);
  assert.equal(b.stats.dronesDropped, 44);
});

test("An edge-selected maximum wave can fall back to the roomier centered layout", () => {
  const b = create(), home = b.zones[0];
  const result = requestDrop(b, { x: home.x + home.radius * 1.5, z: home.z, payload: { scout: 44 } });
  assert.ok(result.ok, result.reason);
  assert.equal(result.pods.length, 15);
  assert.ok(result.pods.every(p => Math.hypot(p.x - home.x, p.z - home.z) + podRadius <= home.radius + 1e-6));
});

test("Invalid payloads/coordinates never mutate matter, IDs, RNG, squads or events", () => {
  for (const payload of [{ scout: -1 }, { scout: 1.5 }, { scout: NaN }, { scout: Infinity }, { scout: 45 }, { unknown: 1 }, { constructor: 1 }, null, []]) {
    const b = create(), before = snapshot(b);
    assert.equal(requestDrop(b, atHome(b, payload)).ok, false);
    assert.deepEqual(snapshot(b), before);
  }
  for (const point of [{}, { x: NaN, z: 0 }, { x: 0, z: Infinity }, { x: 100000, z: 100000 }]) {
    const b = create(), before = snapshot(b);
    assert.equal(requestDrop(b, { ...point, payload: { scout: 1 } }).ok, false);
    assert.deepEqual(snapshot(b), before);
  }
});

test("Water, steep terrain, occupied courts and roof/bridge corridors reject safely", () => {
  for (const terrain of [
    { heightAt: () => 0, isLand: () => false },
    { heightAt: (x) => x * 2, isLand: () => true },
    { heightAt: () => 0, isLand: () => true, canDropAt: () => false },
  ]) {
    const b = create(terrain), before = snapshot(b);
    const result = requestDrop(b, atHome(b, { scout: 4 }));
    assert.equal(result.ok, false);
    assert.match(result.reason, /safe pod courts/);
    assert.deepEqual(snapshot(b), before);
  }
  const b = create();
  b.zones[0].radius = 12;
  assert.equal(requestDrop(b, atHome(b, { scout: 1 })).ok, true);
  run(b, 6.1);
  const before = snapshot(b);
  assert.equal(requestDrop(b, atHome(b, { scout: 1 })).ok, false, "an inbound pod reserves its court");
  assert.deepEqual(snapshot(b), before);
});

test("A partially blocked shoreline/corridor repositions rather than uses the obstacle", () => {
  let corridorChecks = 0;
  const b = create();
  const home = b.zones[0];
  b.isLand = (x) => x < home.x + 12;
  b.canDropAt = (x, z, corridor) => { corridorChecks++; assert.equal(corridor.radius, podRadius); return z < home.z + 12; };
  const result = requestDrop(b, atHome(b, { scout: 6 }));
  assert.ok(result.ok, result.reason);
  assert.ok(corridorChecks >= 2);
  assert.ok(result.pods.every(p => p.x < home.x + 12 && p.z < home.z + 12));
});

test("All campaign terrain pads support safe initial mixed waves", () => {
  for (const planet of planets) {
    const terrain = createPlanetTerrain(planet);
    const b = createBattle(planet, { terrain });
    const result = requestDrop(b, atHome(b, { scout: 6, link: 3 }));
    assert.ok(result.ok, `${planet.id}: ${result.reason}`);
    assert.ok(result.pods.every(p => terrain.isLand(p.x, p.z)));
  }
});

test("Inbound and later-arriving drones follow shared orders with unique slots", () => {
  const b = create(), result = requestDrop(b, atHome(b, { scout: 4, link: 2 }));
  const goal = { kind: "move", x: b.zones[0].x + 100, z: b.zones[0].z };
  assert.equal(orderSquads(b, [result.squad.id], goal), 6, "orders work before the first arrival");
  run(b, 10.05);
  assert.equal(drones(b).length, 3);
  const summary = battleSummary(b).squads[0];
  assert.equal(summary.inboundPods, 1);
  assert.equal(summary.inboundDrones, 3);
  assert.equal(orderSquads(b, [result.squad.id], { ...goal, z: goal.z + 30 }), 6);
  run(b, 0.5);
  assert.equal(drones(b).length, 6);
  assert.ok(drones(b).every(u => u.order.kind === "move" && u.order.z === goal.z + 30));
  assert.equal(new Set(drones(b).map(u => `${u.slot.dx},${u.slot.dz}`)).size, 6);
  assert.equal(battleSummary(b).inboundPods, 0);
});

test("Pause, large frame deltas and subsequent waves do not release drones twice", () => {
  const b = create(); b.paused = true;
  const wave = requestDrop(b, atHome(b, { scout: 6 }));
  stepBattle(b, 100);
  assert.equal(b.time, 0); assert.equal(drones(b).length, 0);
  b.paused = false;
  for (let i = 0; i < 120; i++) stepBattle(b, 1);
  assert.equal(drones(b).length, 6);
  orderHold(b, [wave.squad.id]);
  const second = requestDrop(b, atHome(b, { link: 2 }));
  assert.ok(second.ok);
  assert.notEqual(second.waveId, wave.waveId);
  run(b, 20);
  assert.equal(b.stats.dronesDropped, 8);
  assert.equal(b.stats.drops, 2); assert.equal(b.stats.podsLaunched, 3);
});

test("Current waves resume before, between and after releases without another charge", () => {
  const b = create(); requestDrop(b, atHome(b, { scout: 4, link: 2 }));
  orderSquads(b, [1], { kind: "move", x: b.zones[0].x + 80, z: b.zones[0].z });
  for (const seconds of [0, 10.05, 0.15]) {
    run(b, seconds);
    const saved = snapshot(b), restored = restoreMissionCheckpoint(saved, flatTerrain);
    assert.ok(restored);
    assert.equal(saved.version, MISSION_SAVE_VERSION);
    const money = b.matter;
    run(b, 0.05); run(restored.battle, 0.05);
    assert.deepEqual(plain(restored.battle), plain(b));
    assert.ok(restored.battle.matter >= money);
  }
  run(b, 10);
  assert.equal(b.stats.dronesDropped, 6);
});

test("Real version-1 mid-drop fixture migrates without splitting or repurchasing its old pod", () => {
  const legacy = JSON.parse(readFileSync(new URL("./fixtures/invasion/mission-v1-mid-drop.json", import.meta.url)));
  const before = structuredClone(legacy);
  const restored = restoreMissionCheckpoint(legacy, flatTerrain);
  assert.ok(restored);
  assert.equal(legacy.version, 1);
  assert.deepEqual(legacy, before);
  assert.equal(restored.battle.pods.length, 1);
  assert.equal(payloadCount(restored.battle.pods[0].payload), 9);
  assert.equal(restored.battle.pods[0].legacy, true);
  assert.equal(snapshot(restored.battle).version, MISSION_SAVE_VERSION);
  run(restored.battle, 12);
  assert.equal(restored.battle.stats.dronesDropped, 9);
  assert.equal(restored.battle.stats.drops, 1);
  assert.equal(restored.battle.stats.podsLaunched, 1);
  assert.equal(drones(restored.battle).length, 9);
});

test("Corrupt pod identity, release flags, timers, references and formations are rejected", () => {
  const b = create(); requestDrop(b, atHome(b, { scout: 4 }));
  orderSquads(b, [1], { kind: "move", x: 0, z: 0 });
  const saved = snapshot(b);
  for (const mutate of [
    s => { s.battle.pods[0].released = true; },
    s => { s.battle.pods[1].id = s.battle.pods[0].id; },
    s => { s.battle.pods[0].squad = 99; },
    s => { s.battle.pods[0].waveIndex = 4; },
    s => { s.battle.pods[0].t = 9; },
    s => { s.battle.pods[0].payload.scout = 4; },
    s => { s.battle.pods[0].pendingSlots = []; },
    s => { s.battle.pods[0].pendingSlots[0].dx = Infinity; },
    s => { s.battle.squads[0].order.x = NaN; },
  ]) {
    const corrupt = structuredClone(saved); mutate(corrupt);
    assert.equal(validMissionCheckpoint(corrupt), null);
  }
});
