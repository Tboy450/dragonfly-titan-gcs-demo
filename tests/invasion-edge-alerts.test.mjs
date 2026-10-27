// Off-screen alerts (FIX-12) and the title screen's galaxy beside its card (FIX-10).
import test from "node:test";
import assert from "node:assert/strict";
import { edgeMarker, squadLosses } from "../dist/invasion/camera-assist.mjs";
import { titleGalaxyPlace } from "../dist/invasion/galaxy.mjs";
import { createBattle, stepBattle, requestDrop } from "../dist/invasion/battle.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

test("The title galaxy goes in the space the card leaves, or stays in the middle when there is none", () => {
  // Card on the left of a wide screen: the galaxy sits in the middle of the space to its right.
  const wide = titleGalaxyPlace(1280, 760, { left: 64, right: 584, top: 150, bottom: 610 });
  assert.equal(wide.center[0], (584 + 1280) / 2 / 1280);
  assert.equal(wide.center[1], 0.5);
  assert.ok(wide.radius > 250 && wide.radius <= 760 * 0.48);
  // Card low on a tall phone: the galaxy sits above it.
  const phone = titleGalaxyPlace(375, 812, { left: 16, right: 359, top: 380, bottom: 796 });
  assert.equal(phone.center[0], 0.5);
  assert.equal(phone.center[1], 190 / 812);
  // A card filling the screen (or no card at all) leaves it in the middle, as before.
  for (const card of [{ left: 0, right: 800, top: 0, bottom: 600 }, null]) assert.deepEqual(titleGalaxyPlace(800, 600, card).center, [0.5, 0.55]);
});

test("An alert off screen is marked on the edge of the clear area, pointing toward it", () => {
  const W = 800, H = 600, clear = { top: 70, bottom: 110, side: 30 };
  assert.equal(edgeMarker({ x: 400, y: 300, visible: true }, W, H), null, "on screen: no marker");
  assert.equal(edgeMarker({ x: 790, y: 590, visible: true }, W, H), null, "under the HUD but on screen: no marker");
  // Far to the right, level with the middle of the clear area.
  const right = edgeMarker({ x: 2000, y: 70 + (H - 180) / 2, visible: true }, W, H);
  assert.equal(right.x, W - clear.side);
  assert.equal(right.y, 70 + (H - 180) / 2);
  assert.equal(right.angle, 0);
  // Far up and to the left: clamped inside the margins.
  const corner = edgeMarker({ x: -3000, y: -3000, visible: true }, W, H);
  assert.ok(corner.x >= clear.side - 1e-9 && corner.y >= clear.top - 1e-9);
  assert.ok(corner.angle < -Math.PI / 2);
  // Behind the camera the projection is mirrored: a point that projects to the upper left is
  // really behind and to the right, so the marker sits low on the right.
  const behind = edgeMarker({ x: 100, y: 100, visible: false }, W, H);
  assert.ok(behind.x > W / 2 && behind.y > 70 + (H - 180) / 2);
});

test("A squad whose last drone falls raises one 'lost' alert where it fell; one with drones left or pods inbound does not", () => {
  const b = { time: 42, squads: [{ id: 1, name: "Hammer" }, { id: 2, name: "Anvil" }, { id: 3, name: "Spare" }],
    units: [{ alive: true, side: "swarm", squad: 2, x: 0, z: 0 }], pods: [{ released: false, squad: 3 }] };
  const lost = (squad, x) => ({ kind: "destroyed", side: "swarm", structure: false, squad, x, z: 5 });
  const alerts = squadLosses([lost(1, 10), lost(1, 20), lost(2, 30), lost(3, 40), { kind: "destroyed", side: "native", squad: undefined, x: 0, z: 0 }], b);
  assert.deepEqual(alerts, [{ x: 20, z: 5, at: 42, text: "Hammer was lost" }]);
});

test("In a real battle the destroyed event names the squad, so its loss is reported", () => {
  const b = createBattle({ ...planetById("kepra"), hazards: [] }, { matter: 2000, podSlots: 44, unlocks: ["scout"] });
  const home = b.zones.find(z => z.kind === "beachhead");
  const drop = requestDrop(b, { x: home.x, z: home.z, payload: { scout: 2 } });
  for (let t = 0; t < 15; t += 0.1) stepBattle(b, 0.1);
  b.events.length = 0;
  const target = b.units.find(u => u.alive && u.side === "native" && !u.structure);
  let alerts = [];
  for (let t = 0; t < 60 && !alerts.length; t += 0.1) {
    for (const d of b.units) if (d.side === "swarm" && !d.structure) { d.hp = Math.min(d.hp, 0.5); d.x = target.x + 4; d.z = target.z; }
    stepBattle(b, 0.1);
    const events = b.events.splice(0);
    assert.ok(events.filter(e => e.kind === "destroyed" && e.side === "swarm" && !e.structure).every(e => e.squad === drop.squad.id));
    alerts = squadLosses(events, b);
  }
  assert.equal(alerts.length, 1);
  assert.match(alerts[0].text, new RegExp(`^${drop.squad.name} was lost$`));
});

test("The page draws a tappable arrow for an alert off screen, and Clean view hides it", () => {
  const h = harness(null, { renderer: true }), texts = [];
  const any = new Proxy(function () {}, { get: (t, k) => (k === "fillText" ? (s) => texts.push(String(s)) : k === Symbol.toPrimitive ? () => 0 : any), apply: () => any, set: () => true });
  for (const node of h.nodes.values()) node.getContext = () => any;
  Object.assign(h.context, { swarmColor: "#5fe3ff", nativeColor: "#ff8a4a" }); // from scene.mjs, which the harness leaves out
  h.start();
  // The harness projects world (x, z) straight onto the screen, so z = -900 is far above it.
  h.run(`startMission(planetById('kepra')); closeDropPanel(); scene.heightAt = () => 0; scene.unitPixelSize = () => 12;
    mission.lastAlert = { x: 400, z: -900, at: mission.battle.time, text: "Squad under attack" };
    drawOverlay();`);
  const marks = h.json("mission.edgeMarks.map(m => ({ x: m.x, y: m.y }))");
  assert.equal(marks.length, 1);
  assert.equal(marks[0].x, 400);
  assert.equal(marks[0].y, 70, "pinned to the top of the clear area");
  assert.ok(texts.some(t => /^Squad under attack · \d+ m$/.test(t)), texts.join(" | "));
  // Tapping the arrow looks at the alert, just as J does (the view stays over the map).
  const before = h.json("[mission.cam.focus.x, mission.cam.focus.z]");
  h.run(`tap(${marks[0].x + 5}, ${marks[0].y + 5}, false, "select");`);
  const tapped = h.json("[mission.cam.focus.x, mission.cam.focus.z]");
  assert.notDeepEqual(tapped, before);
  h.run(`mission.cam.focus.x = ${before[0]}; mission.cam.focus.z = ${before[1]}; jumpToAlert();`);
  assert.deepEqual(h.json("[mission.cam.focus.x, mission.cam.focus.z]"), tapped);
  // An old alert (over 20 s) is no longer marked; Clean view clears the marks too.
  h.run(`mission.lastAlert.at = mission.battle.time - 21; drawOverlay();`);
  assert.equal(h.json("mission.edgeMarks.length"), 0);
  h.run(`mission.lastAlert.at = mission.battle.time; mission.cleanView = true; drawOverlay();`);
  assert.equal(h.json("mission.edgeMarks.length"), 0);
});
