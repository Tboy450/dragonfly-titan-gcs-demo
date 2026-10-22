import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, stepBattle, requestDrop, orderSquads, mergeSquads, splitSquad, renameSquad } from "../dist/invasion/battle.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { missionCheckpoint, validMissionCheckpoint } from "../dist/invasion/mission-save.mjs";

const cam = { focus: { x: 0, z: 0 }, distance: 230, yaw: 0, pitch: 0.9 };
const run = (b, seconds) => { for (let t = 0; t < seconds; t += 0.05) stepBattle(b, 0.05); };
const members = (b, id) => b.units.filter(u => u.alive && u.side === "swarm" && !u.structure && u.squad === id);
function battleWithTwoSquads() {
  const planet = { ...planetById("titan") };
  const b = createBattle(planet, { matter: 2000, unlocks: ["scout", "link", "striker"], podSlots: 24 });
  const home = b.zones.find(z => z.kind === "beachhead");
  assert.ok(requestDrop(b, { x: home.x, z: home.z, payload: { scout: 3, striker: 2 } }).ok);
  run(b, 8);
  assert.ok(requestDrop(b, { x: home.x, z: home.z, payload: { link: 2, scout: 1 } }).ok);
  run(b, 20);
  return b;
}

test("Merging moves landed drones into the lowest squad, which keeps its order", () => {
  const b = battleWithTwoSquads(), zone = b.zones.find(z => z.kind !== "beachhead");
  orderSquads(b, [1], { kind: "capture", zone: zone.id, x: zone.x, z: zone.z });
  const before = members(b, 1).length + members(b, 2).length;
  assert.equal(mergeSquads(b, [2, 1]), 1);
  assert.equal(members(b, 1).length, before);
  assert.equal(members(b, 2).length, 0);
  assert.ok(members(b, 1).every(u => u.order.kind === "capture" && u.order.zone === zone.id), "all follow squad 1's order");
  assert.equal(mergeSquads(b, [1]), null, "one squad cannot merge");
  assert.ok(validMissionCheckpoint(JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam })))), "the save stays valid");
});

test("Splitting takes the newer half or one drone type into a new squad that holds; rename tidies names", () => {
  const b = battleWithTwoSquads();
  const squad = members(b, 1), strikers = squad.filter(u => u.type === "striker").length;
  const typed = splitSquad(b, 1, "striker");
  assert.equal(typed, 3);
  assert.equal(members(b, 3).length, strikers);
  assert.ok(members(b, 3).every(u => u.type === "striker" && u.order.kind === "hold"));
  assert.equal(splitSquad(b, 3, "striker"), null, "nothing would be left behind");
  const left = members(b, 1).length, half = splitSquad(b, 1);
  assert.equal(members(b, half).length, Math.floor(left / 2));
  assert.equal(members(b, 1).length, Math.ceil(left / 2));
  assert.ok(renameSquad(b, half, "  Hunter   pack  "));
  assert.equal(b.squads.find(s => s.id === half).name, "Hunter pack");
  assert.equal(renameSquad(b, half, "   "), false);
  assert.ok(renameSquad(b, half, "x".repeat(40)) && b.squads.find(s => s.id === half).name.length === 24);
  assert.ok(validMissionCheckpoint(JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam })))), "the save stays valid");
});

test("A merge while a squad's pods are still descending keeps those pods with their own squad", () => {
  const planet = { ...planetById("titan") };
  const b = createBattle(planet, { matter: 2000, unlocks: ["scout"], podSlots: 24 });
  const home = b.zones.find(z => z.kind === "beachhead");
  requestDrop(b, { x: home.x, z: home.z, payload: { scout: 3 } });
  run(b, 15);
  requestDrop(b, { x: home.x, z: home.z, payload: { scout: 6 } });
  run(b, 1);
  assert.ok(b.pods.some(p => p.squad === 2 && !p.released));
  assert.equal(mergeSquads(b, [1, 2]), null, "squad 2 has no landed drones yet");
  run(b, 12);
  assert.equal(mergeSquads(b, [1, 2]), 1);
  assert.ok(validMissionCheckpoint(JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam })))));
});
