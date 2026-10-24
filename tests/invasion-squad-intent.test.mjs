// Squad intent (COMBAT-04, FIX-05): why a capture is stuck, and attack orders that move on.
import test from "node:test";
import assert from "node:assert/strict";
import { planetById } from "../dist/invasion/campaign.mjs";
import { createBattle, stepBattle, requestDrop, orderSquads, captureBlocker } from "../dist/invasion/battle.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

// Kepra with landed drones of the given payload, and a zone guarded by a watchtower.
function kepra(payload) {
  const b = createBattle(planetById("kepra"), { matter: 2000, podSlots: 44, unlocks: Object.keys(payload) });
  const home = b.zones.find(z => z.kind === "beachhead");
  const drop = requestDrop(b, { x: home.x, z: home.z, payload });
  for (let i = 0; i < 150; i++) stepBattle(b, 0.1);
  for (const type in b.hazards.next) b.hazards.next[type] = Infinity; // no weather
  const zone = b.zones.find(z => z.kind !== "beachhead" && b.units.some(u => u.alive && u.structure && u.side === "native" && Math.hypot(u.x - z.x, u.z - z.z) < z.radius));
  return { b, squad: drop.squad.id, zone, drones: b.units.filter(u => u.side === "swarm" && !u.structure) };
}
const into = (drones, zone) => drones.forEach((d, i) => { d.x = zone.x + (i % 3) * 3; d.z = zone.z + Math.floor(i / 3) * 3; });

test("A capture stuck behind standing defenses says it needs Links; with a Link it goes ahead", () => {
  const { b, zone, drones } = kepra({ scout: 3, link: 1 });
  const scouts = drones.filter(d => d.type === "scout"), link = drones.find(d => d.type === "link");
  into(scouts, zone);
  assert.equal(captureBlocker(b, zone), "links");
  into([...scouts, link], zone);
  assert.equal(captureBlocker(b, zone), null);
  assert.equal(captureBlocker(b, b.zones.find(z => z.kind === "beachhead")), null);
});

test("Jammed and stunned drones are named as the reason", () => {
  const { b, zone, drones } = kepra({ scout: 3, link: 1 });
  into(drones, zone);
  const tower = b.units.find(u => u.alive && u.structure && u.side === "native" && Math.hypot(u.x - zone.x, u.z - zone.z) < zone.radius);
  tower.type = "jammer"; // a jammer standing in the zone (aura 95 m)
  assert.equal(captureBlocker(b, zone), "jammed");
  tower.type = "watchtower";
  b.hazards.effects.stun = true;
  assert.equal(captureBlocker(b, zone), "stunned");
});

test("An attack order whose target falls moves on once per squad, then reports when nothing is left", () => {
  const { b, squad, drones } = kepra({ striker: 4 });
  const natives = b.units.filter(u => u.alive && u.side === "native" && !u.structure);
  const first = natives[0];
  drones.forEach(d => { d.x = first.x + 30; d.z = first.z; });
  orderSquads(b, [squad], { kind: "attack", target: first.id, x: first.x, z: first.z });
  b.events = [];
  first.alive = false; first.hp = 0;
  stepBattle(b, 0.05);
  const moved = b.events.filter(e => e.kind === "retarget");
  assert.equal(moved.length, 1, JSON.stringify(moved));
  assert.equal(moved[0].squad, squad);
  assert.ok(b.units.find(u => u.id === moved[0].target)?.alive);
  for (const u of b.units) if (u.side === "native") { u.alive = false; u.hp = 0; }
  b.events = [];
  stepBattle(b, 0.05);
  assert.equal(b.events.filter(e => e.kind === "attack-done").length, 1);
  assert.equal(b.events.filter(e => e.kind === "retarget").length, 0);
});

// The real entry point; the drawing context records the text it is asked to draw.
function page() {
  const h = harness(null, { renderer: true }), texts = [];
  const any = new Proxy(function () {}, { get: (t, k) => (k === "fillText" ? (s) => texts.push(String(s)) : k === Symbol.toPrimitive ? () => 0 : any), apply: () => any, set: () => true });
  for (const node of h.nodes.values()) node.getContext = () => any;
  Object.assign(h.context, { swarmColor: "#5fe3ff", nativeColor: "#ff8a4a" }); // from scene.mjs, which the harness leaves out
  h.start();
  h.run(`startMission(planetById('kepra')); closeDropPanel(); scene.heightAt = () => 0; mission.battle.matter = 2000;
    const drop = requestDrop(mission.battle, { x: mission.battle.zones[0].x, z: mission.battle.zones[0].z, payload: { scout: 3 } });
    for (let i = 0; i < 150; i++) stepBattle(mission.battle, .1);
    mission.selected = new Set([drop.squad.id]); globalThis.squadId = drop.squad.id;`);
  h.texts = texts;
  h.toasts = () => h.nodes.get("toasts").children.map(n => n.textContent);
  return h;
}

test("Selected squads hear when their attack moves on or ends; others stay quiet", () => {
  const h = page();
  h.run(`handleEvents([{ kind: "retarget", squad: squadId, target: 1, type: "spearman", x: 10, z: 20 },
    { kind: "retarget", squad: squadId + 99, target: 1, type: "spearman", x: 0, z: 0 }]);`);
  const name = h.json("mission.battle.squads.find(s => s.id === squadId).name");
  assert.deepEqual(h.toasts().filter(t => /target down/.test(t)), [`${name}: target down, moving on to a Spear thrower. Tap to look, H to hold.`]);
  h.run(`handleEvents([{ kind: "attack-done", squad: squadId, x: 0, z: 0 }]);`);
  assert.ok(h.toasts().some(t => /no defenders within 110 m/.test(t)));
  h.dispatch("window", "keydown", { key: "h", target: { closest: () => null } });
  assert.ok(h.toasts().some(t => t === `${name} holding here.`));
});

test("A zone label says when a capture needs Links", () => {
  const h = page();
  h.run(`{ const b = mission.battle, zone = b.zones.find(z => z.kind !== "beachhead" && b.units.some(u => u.alive && u.structure && u.side === "native" && Math.hypot(u.x - z.x, u.z - z.z) < z.radius));
    b.units.filter(u => u.side === "swarm" && !u.structure).forEach((d, i) => { d.x = zone.x + i * 3; d.z = zone.z; });
    zone.drones = 3; globalThis.zoneName = zone.name; }
    scene.project = () => ({ x: 400, y: 300, visible: true }); scene.unitPixelSize = () => 12; // everything on screen
    drawOverlay();`);
  const zoneName = h.json("zoneName");
  assert.ok(h.texts.some(t => t.startsWith(`${zoneName} · `) && t.endsWith("needs Links")), h.texts.filter(t => t.includes(zoneName)).join(" | "));
});
