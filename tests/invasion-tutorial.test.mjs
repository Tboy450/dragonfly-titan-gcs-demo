import test from "node:test";
import assert from "node:assert/strict";
import { tutorialState, tutorialSteps, hazardStep } from "../dist/invasion/tutorial.mjs";
import { createBattle, stepBattle, requestDrop, orderSquads } from "../dist/invasion/battle.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";

const run = (b, seconds) => { for (let t = 0; t < seconds; t += 0.1) stepBattle(b, 0.1); };
const captureWith = (b, zone) => {
  for (const u of b.units.filter(u => u.side === "swarm" && !u.structure)) { u.x = zone.x; u.z = zone.z; }
  orderSquads(b, [1], { kind: "capture", zone: zone.id, x: zone.x, z: zone.z });
  for (let t = 0; t < 120 && !zone.captured; t += 0.1) stepBattle(b, 0.1);
  assert.ok(zone.captured, `${zone.name} captured`);
};

test("The Titan tutorial follows the player: drop, land, select, move, capture, Dragonfly, win", () => {
  const planet = { ...planetById("titan"), hazards: [] };
  const b = createBattle(planet, { matter: 500, unlocks: ["scout", "link"] });
  const step = (selected = 0) => tutorialState(b, { selected })?.step.id ?? "finished";
  assert.equal(step(), "drop");
  assert.equal(tutorialState(b).step.target, "drop-button", "the Drop wave button is highlighted");
  const home = b.zones.find(z => z.kind === "beachhead");
  assert.ok(requestDrop(b, { x: home.x, z: home.z, payload: { scout: 4, link: 2 } }).ok);
  assert.equal(step(), "land");
  run(b, 15);
  assert.equal(step(), "select");
  assert.equal(step(1), "move");
  orderSquads(b, [1], { kind: "move", x: home.x + 30, z: home.z });
  assert.equal(step(1), "capture");
  const beacons = b.zones.filter(z => z.kind === "beacon");
  captureWith(b, beacons[0]);
  assert.equal(step(1), "dragonfly");
  captureWith(b, b.zones.find(z => z.special === "dragonfly"));
  assert.equal(step(1), "win");
  assert.deepEqual(tutorialState(b, { selected: 1 }).checks, [true, true, true, true, true, true, false]);
  captureWith(b, beacons[1]);
  assert.equal(step(1), "finished");
});

test("Weather interrupts with its own step while the first front passes; other planets have no tutorial", () => {
  const b = createBattle(planetById("titan"), { matter: 500 });
  const home = b.zones.find(z => z.kind === "beachhead");
  requestDrop(b, { x: home.x, z: home.z, payload: { scout: 2 } });
  let seen = false;
  for (let t = 0; t < 200 && !seen; t += 0.1) { stepBattle(b, 0.1); seen = tutorialState(b, { selected: 1 })?.step === hazardStep; }
  assert.ok(seen, "the weather step appears when the first front is warned");
  assert.equal(tutorialState(createBattle(planetById("kepra"))), null);
  assert.equal(tutorialSteps.length, 7);
});
