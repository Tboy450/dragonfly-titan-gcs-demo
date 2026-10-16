import test from "node:test";
import assert from "node:assert/strict";
import { planets } from "../dist/invasion/campaign.mjs";
import { createBattle, stepBattle, requestDrop, checkDrop, orderSquads, flatTerrain } from "../dist/invasion/battle.mjs";
import { createPlanetTerrain } from "../dist/invasion/planet-terrain.mjs";
import { missionCheckpoint, validMissionCheckpoint, restoreMissionCheckpoint } from "../dist/invasion/mission-save.mjs";

const cam = { focus: { x: 0, z: 0 }, distance: 230, yaw: 0, pitch: 0.9 };
const snapshot = battle => missionCheckpoint({ battle, cam });
const advance = (b, seconds) => { for (let i = 0; i < seconds * 20; i++) stepBattle(b, 0.05); };
const comparable = b => { const { isLand, events, ...data } = b; return data; };

test("Save before the first drop restores the unlimited initial cooldown", () => {
  const battle = createBattle(planets[0]);
  const saved = JSON.parse(JSON.stringify(snapshot(battle)));
  assert.equal(saved.battle.lastDropAt, null);
  const restored = restoreMissionCheckpoint(saved, flatTerrain);
  assert.ok(restored);
  assert.equal(restored.battle.lastDropAt, -Infinity);
  assert.equal(checkDrop(restored.battle, { payload: { scout: 1 } }).ok, true);
  assert.deepEqual(restored.cam, cam);
  assert.equal(saved.battle.lastDropAt, null, "restoring never mutates the checkpoint");
});

test("All seven planets resume with the same terrain, zones, units and deterministic future", () => {
  for (const planet of planets) {
    const terrain = createPlanetTerrain(planet);
    const battle = createBattle(planet, { terrain });
    const home = battle.zones[0];
    assert.equal(requestDrop(battle, { x: home.x, z: home.z, payload: { scout: 2, link: 2 } }).ok, true);
    advance(battle, 3); // Save during descent, then run into weather and combat.
    const freshTerrain = createPlanetTerrain(planet);
    const restored = restoreMissionCheckpoint(snapshot(battle), freshTerrain);
    assert.ok(restored, planet.id);
    assert.equal(restored.battle.isLand, freshTerrain.isLand);
    assert.deepEqual(restored.battle.pods, battle.pods);
    for (const z of battle.zones) assert.equal(freshTerrain.heightAt(z.x, z.z), terrain.heightAt(z.x, z.z));
    advance(battle, 100); advance(restored.battle, 100);
    assert.deepEqual(comparable(restored.battle), comparable(battle), planet.id);
    const airborne = restoreMissionCheckpoint(snapshot(battle), createPlanetTerrain(planet));
    assert.ok(airborne, `${planet.id}: save after pod release and hazards`);
    const destination = battle.zones[1];
    for (const b of [battle, airborne.battle]) orderSquads(b, [1], { kind: "capture", zone: destination.id, x: destination.x, z: destination.z });
    advance(battle, 20); advance(airborne.battle, 20);
    assert.deepEqual(comparable(airborne.battle), comparable(battle));
  }
});

test("Bad, incompatible and completed checkpoints are rejected without harming campaign data", () => {
  const saved = snapshot(createBattle(planets[0]));
  for (const bad of [null, {}, { ...saved, version: 999 }, { ...saved, battle: { ...saved.battle, planetId: "missing" } }, { ...saved, battle: { ...saved.battle, zones: [] } }, { ...saved, battle: { ...saved.battle, hazards: {} } }, { ...saved, cam: {} }]) assert.equal(validMissionCheckpoint(bad), null);
  const finished = createBattle(planets[0]); finished.outcome = "won";
  assert.equal(snapshot(finished), null);
  assert.equal(restoreMissionCheckpoint({ ...saved, battle: { ...saved.battle, outcome: "won" } }, flatTerrain), null);
});
