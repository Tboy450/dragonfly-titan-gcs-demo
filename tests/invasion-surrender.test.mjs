// Surrender (ENEMY-07): a calm settlement gives up at 60% control. Its troops stand down, its
// defenses join the swarm, and the public stays calm; an alarmed town, one that saw civilians
// caught in crossfire, or a capital fights on.
import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, stepBattle, requestDrop, surrenderControl, surrenderAlarm, canSurrender } from "../dist/invasion/battle.mjs";
import { alarmTooltip } from "../dist/invasion/field-guide.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

// Links parked in the middle of a settlement with troops and a defense; alarm pinned each step.
function siege(alarm, prepare = () => {}) {
  const b = createBattle({ ...planetById("velm"), hazards: [] }, { matter: 2000, podSlots: 44, unlocks: ["scout", "link"] });
  for (const type in b.hazards.next) b.hazards.next[type] = Infinity;
  const home = b.zones.find(z => z.kind === "beachhead");
  requestDrop(b, { x: home.x, z: home.z, payload: { link: 10 } });
  for (let t = 0; t < 14; t += 0.1) stepBattle(b, 0.1);
  const town = b.zones.find(z => z.kind === "settlement" && b.units.some(u => u.side === "native" && u.structure && Math.hypot(u.x - z.x, u.z - z.z) < z.radius)
    && b.units.some(u => u.side === "native" && !u.structure && u.home === z.id));
  const links = b.units.filter(u => u.side === "swarm" && !u.structure);
  prepare(b, town);
  const troops = b.units.filter(u => u.side === "native" && !u.structure && u.home === town.id);
  const defenses = b.units.filter(u => u.side === "native" && u.structure && Math.hypot(u.x - town.x, u.z - town.z) <= town.radius + 4);
  const seen = [];
  let alarmAtCapture = null;
  for (let t = 0; t < 400 && !town.captured; t += 0.1) {
    for (const d of links) { d.hp = d.maxHp = 1e9; d.x = town.x; d.z = town.z; d.vx = d.vz = 0; d.order = { kind: "hold", x: town.x, z: town.z }; }
    b.alarm = alarm;
    stepBattle(b, 0.1);
    seen.push(...b.events.splice(0));
    if (town.captured) alarmAtCapture = b.alarm;
  }
  return { b, town, troops, defenses, seen, alarmAtCapture };
}

test("A calm settlement surrenders at 60%: troops stand down, defenses join, the alarm stays put", () => {
  const { b, town, troops, defenses, seen, alarmAtCapture } = siege(10);
  assert.equal(town.captured, true);
  const event = seen.find(e => e.kind === "surrender");
  assert.ok(event, "a surrender event");
  assert.equal(event.zone, town.id);
  assert.ok(event.troops >= 1);
  assert.ok(troops.every(u => !u.alive), "every militia from the town stood down");
  assert.ok(!b.units.some(u => u.alive && u.side === "native" && !u.structure && u.home === town.id), "including later reinforcements");
  assert.ok(!seen.some(e => e.kind === "destroyed" && troops.some(u => u.id === e.id)), "they were not killed");
  assert.ok(defenses.length >= 1 && defenses.every(u => !u.alive || u.side === "swarm"), "its defenses joined the swarm");
  assert.ok(Math.abs(alarmAtCapture - 10) < 1, `alarm ${alarmAtCapture} stayed calm (no capture bump)`);
  assert.ok(b.log.some(l => l.text.startsWith(`${town.name} surrenders without a fight: `)));
});

test("An alarmed town, one that saw crossfire, or a capital fights on to 100%", () => {
  const loud = siege(surrenderAlarm + 5);
  assert.equal(loud.town.captured, true, "Links still take it");
  assert.ok(!loud.seen.some(e => e.kind === "surrender"));
  const angry = siege(10, (b, town) => { town.crossfire = true; });
  assert.ok(!angry.seen.some(e => e.kind === "surrender"));
  const b = createBattle(planetById("velm"), { matter: 100 });
  for (const zone of b.zones) {
    const calm = { ...zone, captured: false, crossfire: undefined };
    assert.equal(canSurrender({ ...b, alarm: 0 }, calm), zone.kind === "settlement", zone.kind);
  }
  assert.equal(canSurrender({ ...createBattle(planetById("titan"), { matter: 100 }), alarm: 0 }, { kind: "settlement" }), false, "nobody lives on Titan");
  assert.equal(surrenderControl, 60);
});

test("The alarm tooltip and the zone label say when a town will give up", () => {
  const b = createBattle(planetById("velm"), { matter: 100 });
  b.alarm = 10;
  assert.ok(alarmTooltip(b).includes(`Now under ${surrenderAlarm}: settlements surrender at ${surrenderControl}% control, without a fight.`));
  b.alarm = 40;
  assert.ok(alarmTooltip(b).includes(`Under ${surrenderAlarm}: settlements surrender`));
  const h = harness(null, { renderer: true }), texts = [];
  const any = new Proxy(function () {}, { get: (t, k) => (k === "fillText" ? (s) => texts.push(String(s)) : k === Symbol.toPrimitive ? () => 0 : any), apply: () => any, set: () => true });
  for (const node of h.nodes.values()) node.getContext = () => any;
  Object.assign(h.context, { swarmColor: "#5fe3ff", nativeColor: "#ff8a4a" });
  h.start();
  h.run(`startMission(planetById('velm')); closeDropPanel(); scene.heightAt = () => 0; scene.unitPixelSize = () => 12;
    scene.project = () => ({ x: 400, y: 300, visible: true });
    { const town = mission.battle.zones.find(z => z.kind === "settlement"); town.drones = 2; globalThis.townName = town.name;
      mission.battle.alarm = 5; drawOverlay();
      handleEvents([{ kind: "surrender", zone: town.id, x: town.x, z: town.z, troops: 3 }]); }`);
  const name = h.json("townName");
  assert.ok(texts.some(t => t.startsWith(`${name} · `) && t.endsWith(" · surrenders at 60%")), texts.filter(t => t.includes(name)).join(" | "));
  assert.ok(h.nodes.get("toasts").children.some(n => n.textContent === `${name} surrendered without a fight: 3 militia stood down.`));
});
