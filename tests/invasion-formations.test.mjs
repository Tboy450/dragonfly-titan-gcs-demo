// Formations and stances (CTRL-07): spread, tight and line slots; holding fire for a quiet takeover.
import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, stepBattle, requestDrop, orderSquads, formationSlot, formationOffset, setFormation, setStance, splitSquad } from "../dist/invasion/battle.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { missionCheckpoint, validMissionCheckpoint } from "../dist/invasion/mission-save.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} vs ${b}`);

test("Spread keeps the old slots, tight halves the spacing, a line runs across the direction of travel", () => {
  for (let i = 0; i < 20; i++) assert.deepEqual(formationOffset("spread", i, 7), formationSlot(i, 7));
  close(Math.hypot(formationOffset("tight", 1, 7).dx, formationOffset("tight", 1, 7).dz), 3.5);
  // Heading 0 is travel toward +z: the first rank lies along x, the second rank behind (−z).
  const north = Array.from({ length: 12 }, (_, i) => formationOffset("line", i, 7, 0));
  for (const s of north) close(s.dz, 0);
  assert.deepEqual(north.slice(0, 5).map(s => Math.round(s.dx) + 0), [0, 7, -7, 14, -14]);
  close(formationOffset("line", 12, 7, 0).dz, -8.4);
  // Heading east (+x): the line runs along z.
  for (let i = 0; i < 12; i++) close(formationOffset("line", i, 7, Math.PI / 2).dx, 0);
});

// Kepra with landed Strikers (one squad), standing next to the first defended zone.
function kepra(payload = { striker: 6 }) {
  const b = createBattle({ ...planetById("kepra"), hazards: [] }, { matter: 2000, podSlots: 44, unlocks: Object.keys(payload) });
  const home = b.zones.find(z => z.kind === "beachhead");
  const drop = requestDrop(b, { x: home.x, z: home.z, payload });
  for (let t = 0; t < 15; t += 0.1) stepBattle(b, 0.1);
  return { b, squad: drop.squad.id, drones: b.units.filter(u => u.side === "swarm" && !u.structure) };
}

test("A squad in line formation flies abreast toward its order; changing formation re-forms it on the way", () => {
  const { b, squad, drones } = kepra();
  const cx = drones.reduce((s, u) => s + u.x, 0) / drones.length, cz = drones.reduce((s, u) => s + u.z, 0) / drones.length;
  assert.equal(setFormation(b, [squad], "line"), 1);
  orderSquads(b, [squad], { kind: "move", x: cx + 300, z: cz });
  // Travelling east: the slots spread along z, not along the path.
  for (const d of drones) close(d.slot.dx, 0, 1e-6);
  assert.ok(Math.max(...drones.map(d => Math.abs(d.slot.dz))) >= 14);
  assert.equal(setFormation(b, [squad], "tight"), 1);
  assert.ok(Math.max(...drones.map(d => Math.hypot(d.slot.dx, d.slot.dz))) < 10, "re-formed tight for the same move");
  assert.equal(b.squads.find(s => s.id === squad).order.kind, "move");
  assert.equal(setFormation(b, [squad], "zigzag"), 0);
  // A split squad keeps the formation and stance of the squad it came from.
  setStance(b, [squad], "hold");
  const freshId = splitSquad(b, squad), fresh = b.squads.find(s => s.id === freshId);
  assert.equal(fresh.formation, "tight");
  assert.equal(fresh.stance, "hold");
});

test("Drones holding fire shoot only at a target they were ordered to attack, and skip attack-move", () => {
  const { b, squad, drones } = kepra();
  const natives = b.units.filter(u => u.alive && u.side === "native");
  const target = natives.find(u => u.structure) || natives[0];
  const others = natives.filter(u => u !== target);
  const hp = new Map(natives.map(u => [u.id, u.hp]));
  for (const d of drones) d.hp = d.maxHp = 1e5;
  setStance(b, [squad], "hold");
  for (let t = 0; t < 4; t += 0.1) {
    for (const d of drones) { d.x = target.x + 20; d.z = target.z; d.vx = d.vz = 0; d.order = { kind: "hold", x: d.x, z: d.z }; }
    stepBattle(b, 0.1);
  }
  assert.ok(drones.every(d => d.target === null));
  assert.ok(natives.every(u => u.hp === hp.get(u.id)), "nobody was shot while holding fire");
  // Attack-move does not hunt either.
  orderSquads(b, [squad], { kind: "move", x: target.x + 60, z: target.z, hunt: true });
  for (let t = 0; t < 2; t += 0.1) stepBattle(b, 0.1);
  assert.ok(natives.every(u => u.hp === hp.get(u.id)));
  // An ordered attack still fires, and only at that target.
  // (Checked over a short window, before the target falls and the order moves on, FIX-05.)
  target.hp = target.maxHp = 1e5;
  orderSquads(b, [squad], { kind: "attack", target: target.id, x: target.x, z: target.z });
  for (let t = 0; t < 4; t += 0.1) {
    stepBattle(b, 0.1);
    assert.ok(drones.every(d => d.target === null || d.target === target.id), "no other targets");
  }
  assert.ok(target.hp < 1e5);
  assert.ok(others.length === 0 || drones.every(d => d.target !== null));
});

// The townspeople test's fight (ENEMY-01), with the Strikers holding fire or not.
function townFight(stance) {
  const b = createBattle({ ...planetById("velm"), hazards: [] }, { matter: 800, unlocks: ["scout", "striker"] });
  const home = b.zones.find(z => z.kind === "beachhead");
  const drop = requestDrop(b, { x: home.x, z: home.z, payload: { striker: 6 } });
  for (let t = 0; t < 14; t += 0.1) stepBattle(b, 0.1);
  const town = b.zones.find(z => z.kind === "settlement" && z.population > 0 && b.units.some(u => u.side === "native" && u.home === z.id));
  b.units = b.units.filter(u => u.side === "swarm" || u.home === town.id);
  const drones = b.units.filter(u => u.side === "swarm");
  for (const d of drones) d.hp = d.maxHp = 1e5;
  setStance(b, [drop.squad.id], stance);
  b.alarm = 0;
  for (let t = 0; t < 10; t += 0.1) {
    for (const d of drones) { d.x = town.x; d.z = town.z; d.vx = d.vz = 0; d.order = { kind: "hold", x: town.x, z: town.z }; }
    stepBattle(b, 0.1);
  }
  return { b, town };
}

test("Holding fire inside a defended town avoids the crossfire outrage", () => {
  const fire = townFight("fire"), hold = townFight("hold");
  assert.equal(fire.town.crossfire, true);
  assert.equal(hold.town.crossfire, undefined);
  assert.ok(fire.b.alarm > hold.b.alarm + 3, `${fire.b.alarm.toFixed(1)} vs ${hold.b.alarm.toFixed(1)}`);
  assert.ok(fire.b.log.some(l => /Hold fire \(Y\)/.test(l.text)));
});

test("Saves keep formation and stance and refuse unknown ones", () => {
  const { b, squad } = kepra();
  setFormation(b, [squad], "line");
  setStance(b, [squad], "hold");
  const saved = JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam: { focus: { x: 0, z: 0 }, distance: 200, yaw: 0, pitch: 0.9 } })));
  assert.ok(validMissionCheckpoint(saved));
  const kept = saved.battle.squads.find(s => s.id === squad);
  assert.equal(kept.formation, "line");
  assert.equal(kept.stance, "hold");
  for (const [field, bad] of [["formation", "zigzag"], ["stance", "berserk"]]) {
    const copy = JSON.parse(JSON.stringify(saved));
    copy.battle.squads.find(s => s.id === squad)[field] = bad;
    assert.equal(validMissionCheckpoint(copy), null, field);
  }
});

test("L cycles the selected squads' formation and Y toggles holding fire, each saying what it does", () => {
  const h = harness(null, { renderer: true }); h.start();
  h.run(`startMission(planetById('kepra')); closeDropPanel(); mission.battle.matter = 1000;
    const drop = requestDrop(mission.battle, { x: mission.battle.zones[0].x, z: mission.battle.zones[0].z, payload: { scout: 2 } });
    mission.selected = new Set([drop.squad.id]); globalThis.squadId = drop.squad.id;`);
  const key = (k) => h.dispatch("window", "keydown", { key: k, target: { closest: () => null } });
  const squad = () => h.json("mission.battle.squads.find(s => s.id === squadId)");
  // The newest notice; the box is emptied each time (the harness cannot drop the oldest).
  const said = () => { const box = h.nodes.get("toasts"), text = box.children.at(-1)?.textContent || ""; box.children = []; return text; };
  key("l"); assert.equal(squad().formation, "tight"); assert.match(said(), /Formation: tight/);
  key("l"); assert.equal(squad().formation, "line"); assert.match(said(), /Formation: in a line/);
  key("l"); assert.equal(squad().formation, "spread"); assert.match(said(), /Formation: spread out/);
  key("y"); assert.equal(squad().stance, "hold"); assert.match(said(), /Holding fire/);
  key("y"); assert.equal(squad().stance, "fire"); assert.match(said(), /Firing at will/);
  h.run("mission.selected.clear();");
  key("y"); assert.match(said(), /Select a squad first/);
});
