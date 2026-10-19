import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createBattle, requestDrop, stepBattle, continueCapturing, extractVictory, retreat,
  flatTerrain, missionResult, objectiveStatus, starsEarned } from "../dist/invasion/battle.mjs";
import { createProgress, applyMissionResult, validProgress, planetById, PROGRESS_VERSION } from "../dist/invasion/campaign.mjs";
import { missionCheckpoint, validMissionCheckpoint, restoreMissionCheckpoint, MISSION_SAVE_VERSION } from "../dist/invasion/mission-save.mjs";
import { saveCampaignEnvelope } from "../dist/invasion/progress-store.mjs";

const planet = planetById("titan");
const cam = { focus: { x: 0, z: 0 }, distance: 230, yaw: 0, pitch: 0.9 };
const snapshot = battle => missionCheckpoint({ battle, cam });
const run = (b, seconds) => { for (let i = 0; i < Math.round(seconds * 20); i++) stepBattle(b, 0.05); };
function ready(id = "test-attempt-1", objectives = planet.objectives) {
  const b = createBattle({ ...planet, objectives }, { missionId: id, matter: 1000 });
  const home = b.zones[0];
  assert.ok(requestDrop(b, { x: home.x, z: home.z, payload: { scout: 3 } }).ok);
  run(b, 10.2);
  for (const zone of b.zones.filter(z => z.kind !== "beachhead").slice(0, b.required)) {
    zone.control = 100; zone.captured = true;
  }
  stepBattle(b, 0.05);
  return b;
}

test("Required captures announce victory once and keep the mission playable", () => {
  const b = ready(), at = b.victoryAvailableAt;
  assert.equal(b.victoryAvailable, true);
  assert.equal(b.victoryChoiceMade, false);
  assert.equal(b.outcome, null);
  assert.equal(b.refund, 0);
  assert.equal(continueCapturing(b), true);
  run(b, 2);
  assert.ok(b.time > at);
  assert.equal(b.victoryAvailableAt, at);
  assert.equal(b.events.filter(e => e.kind === "victoryAvailable").length, 1);
  assert.equal(b.outcome, null);
  assert.equal(b.victoryChoiceMade, true);
});

test("Earned victory remains available after retaken zones, including retreat-as-victory", () => {
  const b = ready();
  continueCapturing(b);
  for (const zone of b.zones) if (zone.kind !== "beachhead") { zone.captured = false; zone.control = 0; }
  run(b, 0.1);
  assert.equal(b.victoryAvailable, true);
  assert.equal(objectiveStatus(b)[0].done, true);
  retreat(b);
  assert.equal(b.outcome, "won");
  const money = b.matter;
  assert.equal(extractVictory(b), false);
  retreat(b);
  assert.equal(b.matter, money);
});

test("Continuing still risks defeat; eligibility is not a free victory after losing everything", () => {
  const b = ready(); continueCapturing(b);
  b.units = []; b.pods = []; b.matter = 0;
  stepBattle(b, 0.05);
  assert.equal(b.outcome, "lost");
  assert.equal(extractVictory(b), false);
  assert.equal(starsEarned(b), 0);
});

test("Optional goals and finish time finalize at extraction rather than eligibility", () => {
  const b = ready("timed-attempt", [
    { id: "speed", kind: "timeUnder", value: 12, text: "Finish in 12 s" },
    { id: "losses", kind: "maxLosses", value: 0, text: "No losses" },
  ]);
  assert.ok(b.victoryAvailableAt < 12);
  continueCapturing(b); run(b, 4);
  assert.equal(extractVictory(b), true);
  assert.ok(missionResult(b).time > 12);
  assert.equal(objectiveStatus(b).find(o => o.id === "speed").failed, true);
  assert.equal(starsEarned(b), 2);
});

test("Extraction recalls survivors and refunds unreleased cargo exactly once", () => {
  const b = ready();
  const home = b.zones[0];
  assert.ok(requestDrop(b, { x: home.x, z: home.z, payload: { link: 2 } }).ok);
  const before = b.matter;
  assert.equal(extractVictory(b), true);
  assert.equal(b.refund, 3 * 8 / 2 + 2 * 22);
  assert.equal(b.matter, before + b.refund);
  assert.ok(b.pods.every(p => p.released));
  const money = b.matter;
  run(b, 50); extractVictory(b); retreat(b);
  assert.equal(b.matter, money);
  assert.equal(b.stats.dronesDropped, 3);
});

test("Settlement ledger survives reload and blocks rewards/stats from repeated results", () => {
  const b = ready("unique-conquest"); extractVictory(b);
  const result = missionResult(b), start = createProgress();
  const first = applyMissionResult(start, planet, result);
  const disk = JSON.parse(JSON.stringify({ ...first.progress, activeMission: null }));
  const loaded = validProgress(disk);
  assert.ok(loaded);
  assert.equal(disk.activeMission, null);
  assert.deepEqual(applyMissionResult(loaded, planet, result).progress, first.progress);
  assert.equal(first.progress.stats.missionsPlayed, 1);
  assert.equal(first.progress.stats.missionsWon, 1);
  assert.equal(start.stats.missionsPlayed, 0);
});

test("New attempt gets replay rewards; an older result cannot settle again afterward", () => {
  const a = ready("attempt-a"); extractVictory(a);
  const first = applyMissionResult(createProgress(), planet, missionResult(a));
  const b = ready("attempt-b"); extractVictory(b);
  const second = applyMissionResult(first.progress, planet, missionResult(b));
  assert.equal(second.progress.matter, Math.round(b.matter) + Math.round(planet.reward.matter * 0.3));
  assert.equal(second.progress.stats.missionsWon, 2);
  assert.equal(Object.keys(second.progress.settledMissions).length, 2);
  assert.deepEqual(applyMissionResult(second.progress, planet, missionResult(a)).progress, second.progress);
});

test("Eligibility and continued choice persist; restore does not replay the eligibility event", () => {
  const b = ready();
  for (const continued of [false, true]) {
    if (continued) continueCapturing(b);
    const restored = restoreMissionCheckpoint(snapshot(b), flatTerrain);
    assert.ok(restored);
    assert.equal(restored.battle.victoryAvailable, true);
    assert.equal(restored.battle.victoryChoiceMade, continued);
    assert.equal(restored.battle.missionId, b.missionId);
    run(restored.battle, 0.5);
    assert.equal(restored.battle.events.filter(e => e.kind === "victoryAvailable").length, 0);
    assert.equal(extractVictory(restored.battle), true);
  }
});

test("Actual v1 and v2 checkpoint fixtures migrate with stable identity and paid payloads", () => {
  for (const name of ["mission-v1-mid-drop.json", "mission-v2-between-arrivals.json"]) {
    const old = JSON.parse(readFileSync(new URL(`./fixtures/invasion/${name}`, import.meta.url)));
    const before = structuredClone(old), a = validMissionCheckpoint(old), c = validMissionCheckpoint(old);
    assert.ok(a, name);
    assert.equal(a.version, MISSION_SAVE_VERSION);
    assert.match(a.battle.missionId, /^legacy-/);
    assert.equal(a.battle.missionId, c.battle.missionId);
    assert.equal(a.battle.victoryAvailable, false);
    assert.equal(a.battle.matter, old.battle.matter);
    assert.deepEqual(old, before);
    const restored = restoreMissionCheckpoint(a, flatTerrain);
    run(restored.battle, 12);
    assert.equal(restored.battle.stats.dronesDropped, name.includes("v1-") ? 9 : 6);
  }
});

test("Invalid eligibility state or mission identity cannot enter a checkpoint", () => {
  const saved = snapshot(ready());
  for (const mutate of [
    b => { b.missionId = ""; }, b => { b.victoryAvailable = "yes"; },
    b => { b.victoryAvailableAt = b.time + 1; }, b => { b.victoryChoiceMade = 1; },
    b => { b.victoryAvailable = false; b.victoryChoiceMade = true; b.victoryAvailableAt = null; },
  ]) {
    const corrupt = structuredClone(saved); mutate(corrupt.battle);
    assert.equal(validMissionCheckpoint(corrupt), null);
  }
  assert.equal(extractVictory(createBattle(planet)), false);
  assert.equal(continueCapturing(createBattle(planet)), false);
});

test("Campaign v1 migration keeps existing conquests, resources and unlocks", () => {
  const legacy = JSON.parse(readFileSync(new URL("./fixtures/invasion/progress-v1-after-titan.json", import.meta.url)));
  const migrated = validProgress(legacy);
  assert.ok(migrated);
  assert.equal(migrated.version, PROGRESS_VERSION);
  for (const key of ["matter", "captured", "unlocks", "stats", "stars", "bestTime", "podSlots"])
    assert.deepEqual(migrated[key], legacy[key]);
  assert.deepEqual(migrated.settledMissions, {});
  assert.equal(legacy.version, 1);
});

test("Only Dragonfly lands to drill; ordinary combat drones remain airborne", () => {
  const b = createBattle(planet, { matter: 1000, unlocks: ["scout", "dragonfly"], podSlots: 12 });
  const home = b.zones[0];
  assert.ok(requestDrop(b, { x: home.x, z: home.z, payload: { scout: 2, dragonfly: 1 } }).ok);
  run(b, 40);
  assert.equal(b.units.find(u => u.type === "dragonfly").landed, true);
  assert.ok(b.units.filter(u => u.type === "scout").every(u => u.landed === false));
  assert.ok(b.stats.matterHarvested > 0);
});

test("Failed result writes retain the old envelope; retries commit totals and clear checkpoint together", () => {
  const b = ready("storage-failure-attempt"), initial = createProgress();
  const checkpoint = snapshot(b);
  let disk = JSON.stringify({ ...initial, activeMission: checkpoint }), reject = true;
  const storage = { setItem(key, value) { if (reject) throw new Error("quota exceeded"); disk = value; } };
  const originalDisk = disk;
  extractVictory(b);
  const settled = applyMissionResult(initial, planet, missionResult(b)).progress;
  assert.equal(saveCampaignEnvelope(storage, settled, null), false);
  assert.equal(disk, originalDisk);
  const recoverable = JSON.parse(disk);
  assert.equal(validProgress(recoverable).stats.missionsWon, 0);
  assert.ok(restoreMissionCheckpoint(recoverable.activeMission, flatTerrain));
  reject = false;
  assert.equal(saveCampaignEnvelope(storage, settled, null), true);
  const committed = JSON.parse(disk);
  assert.equal(committed.activeMission, null);
  assert.equal(committed.stats.missionsWon, 1);
  const afterRetry = disk;
  assert.equal(saveCampaignEnvelope(storage, settled, null), true);
  assert.equal(disk, afterRetry);
  assert.deepEqual(applyMissionResult(validProgress(committed), planet, missionResult(b)).progress, settled);
});

test("Legacy-looking settlement IDs cannot collide with inherited object keys", () => {
  const b = ready("constructor"); extractVictory(b);
  const first = applyMissionResult(createProgress(), planet, missionResult(b)).progress;
  assert.equal(first.stats.missionsWon, 1);
  const loaded = validProgress(JSON.parse(JSON.stringify(first)));
  assert.ok(Object.hasOwn(loaded.settledMissions, "constructor"));
  assert.deepEqual(applyMissionResult(loaded, planet, missionResult(b)).progress, first);
});
