import test from "node:test";
import assert from "node:assert/strict";
import { squadCenter, latestAlert, zoneAlerts, edgeScroll, homeView } from "../dist/invasion/camera-assist.mjs";
import { createBattle } from "../dist/invasion/battle.mjs";
import { planets } from "../dist/invasion/campaign.mjs";

test("Follow targets the middle of the selected squads' living drones", () => {
  const units = [
    { alive: true, side: "swarm", structure: false, squad: 1, x: 0, z: 0 },
    { alive: true, side: "swarm", structure: false, squad: 1, x: 10, z: 20 },
    { alive: false, side: "swarm", structure: false, squad: 1, x: 999, z: 999 },
    { alive: true, side: "swarm", structure: false, squad: 2, x: 500, z: 500 },
    { alive: true, side: "native", structure: false, squad: null, x: -50, z: -50 },
  ];
  assert.deepEqual(squadCenter(units, new Set([1])), { x: 5, z: 10 });
  assert.equal(squadCenter(units, new Set([7])), null);
});

test("The newest alert wins: a marked strike, an eruption or a drone lost this frame", () => {
  const b = { time: 50, strikes: [], hazards: { events: [] } };
  assert.equal(latestAlert(null, [], b), null);
  b.strikes.push({ x: 1, z: 2, markedAt: 40, hit: false, source: "artillery" });
  let alert = latestAlert(null, [], b);
  assert.deepEqual(alert, { x: 1, z: 2, at: 40, text: "Artillery incoming" });
  alert = latestAlert(alert, [{ kind: "destroyed", side: "swarm", structure: false, x: 9, z: 9 }], b);
  assert.deepEqual(alert, { x: 9, z: 9, at: 50, text: "Drone lost" });
  alert = latestAlert(alert, [{ kind: "destroyed", side: "native", structure: false, x: 3, z: 3 }], b);
  assert.equal(alert.text, "Drone lost", "a defender lost is not an alert, and an older strike does not replace it");
  b.time = 60; b.hazards.events.push({ kind: "eruption", x: 7, z: 8, startedAt: 58, name: "Eruption" });
  alert = latestAlert(alert, [], b);
  assert.deepEqual(alert, { x: 7, z: 8, at: 58, text: "Eruption" });
  b.time = 61; b.units = [{ id: 4, side: "swarm", structure: false, x: 30, z: 40 }, { id: 5, side: "native", structure: true, x: 0, z: 0 }];
  assert.deepEqual(latestAlert(alert, [{ kind: "shot", side: "native", from: 5, to: 4 }], b), { x: 30, z: 40, at: 61, text: "Squad under attack" });
  assert.deepEqual(latestAlert(alert, [{ kind: "shot", side: "swarm", from: 4, to: 5 }], b), alert, "the swarm firing is no alert");
});

test("A held zone being retaken raises one alert until it is back at full control", () => {
  const zone = { id: "z1", name: "Ithro", kind: "settlement", x: 5, z: 6, captured: true, control: 100 };
  const b = { time: 10, zones: [{ id: "beachhead", kind: "beachhead", captured: true, control: 100 }, zone] }, watch = new Set();
  assert.deepEqual(zoneAlerts(watch, b), []);
  zone.control = 90;
  assert.deepEqual(zoneAlerts(watch, b), [{ x: 5, z: 6, at: 10, text: "Ithro is being retaken" }]);
  zone.control = 60;
  assert.deepEqual(zoneAlerts(watch, b), [], "only once while it falls");
  zone.control = 100;
  zoneAlerts(watch, b);
  zone.control = 95; b.time = 20;
  assert.equal(zoneAlerts(watch, b).length, 1, "again after recovering");
  zone.captured = false;
  assert.deepEqual(zoneAlerts(watch, b), [], "a lost zone is no longer watched");
});

test("Edge scrolling and the starting view", () => {
  assert.deepEqual(edgeScroll(5, 300, 800, 600), { dx: 1, dy: 0 });
  assert.deepEqual(edgeScroll(795, 595, 800, 600), { dx: -1, dy: -1 });
  assert.deepEqual(edgeScroll(400, 300, 800, 600), { dx: 0, dy: 0 });
  const b = createBattle(planets[1]), home = b.zones.find(zone => zone.kind === "beachhead"), view = homeView(b);
  assert.ok(Math.hypot(view.focus.x - home.x, view.focus.z - home.z) - 70 < 1e-9);
  assert.equal(view.distance, 230);
});
