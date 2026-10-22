import test from "node:test";
import assert from "node:assert/strict";
import { createProgress, validProgress, hiveUpgrades, buyUpgrade, upgradeLevel, missionSupply, planetById } from "../dist/invasion/campaign.mjs";
import { createBattle, stepBattle, requestDrop, dropReadyIn, upgradeEffects } from "../dist/invasion/battle.mjs";
import { droneTypes } from "../dist/invasion/units.mjs";
import { missionCheckpoint, validMissionCheckpoint } from "../dist/invasion/mission-save.mjs";

test("Upgrades are bought level by level from the bank and saved", () => {
  let progress = { ...createProgress(), matter: 1000 };
  let result = buyUpgrade(progress, "armor");
  assert.ok(result.ok);
  assert.equal(result.progress.matter, 1000 - hiveUpgrades.armor.cost[0]);
  assert.equal(upgradeLevel(result.progress, "armor"), 1);
  assert.equal(progress.matter, 1000, "the old progress is untouched");
  progress = result.progress;
  for (let k = 0; k < 2; k += 1) progress = buyUpgrade(progress, "armor").progress;
  assert.equal(upgradeLevel(progress, "armor"), 3);
  assert.equal(buyUpgrade(progress, "armor").ok, false, "fully upgraded");
  assert.equal(buyUpgrade({ ...createProgress(), matter: 10 }, "weapons").ok, false, "not enough matter");
  assert.equal(buyUpgrade(progress, "nonsense").ok, false);
  assert.deepEqual(validProgress(JSON.parse(JSON.stringify(progress))).upgrades, { armor: 3 });
  assert.deepEqual(validProgress({ ...progress, upgrades: { armor: 9, bogus: 1, launch: 2 } }).upgrades, { launch: 2 });
});

test("A mission gets the upgrades: more wave slots, and levels fixed on the battle", () => {
  let progress = { ...createProgress(), matter: 5000 };
  for (const id of ["pods", "pods", "launch", "armor", "engines", "weapons", "sealing", "firmware"]) progress = buyUpgrade(progress, id).progress;
  const supply = missionSupply(progress, planetById("kepra"));
  assert.equal(supply.podSlots, progress.podSlots + 8);
  assert.deepEqual(supply.upgrades, { launch: 1, armor: 1, engines: 1, weapons: 1, sealing: 1, firmware: 1 });
  assert.ok(missionSupply({ ...progress, podSlots: 44 }, planetById("kepra")).podSlots <= 44, "never past the pod limit");
  const b = createBattle(planetById("kepra"), { ...supply });
  assert.deepEqual(b.upgrades, supply.upgrades);
  const effects = upgradeEffects(b);
  assert.deepEqual([effects.cooldown, effects.health, effects.speed, effects.damage, effects.hazard, effects.hack].map(n => +n.toFixed(2)), [1, 1.1, 1.08, 1.1, 0.8, 1.2]);
  const home = b.zones.find(z => z.kind === "beachhead");
  assert.ok(requestDrop(b, { x: home.x, z: home.z, payload: { scout: 2 } }).ok);
  assert.ok(Math.abs(dropReadyIn(b) - 5) < 1e-9, "one second off the cooldown");
  for (let t = 0; t < 14; t += 0.05) stepBattle(b, 0.05);
  const scout = b.units.find(u => u.type === "scout");
  assert.ok(Math.abs(scout.maxHp - droneTypes.scout.hp * 1.1) < 1e-9 && Math.abs(scout.damageScale - 1.1) < 1e-9);
  const saved = JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam: { focus: { x: 0, z: 0 }, distance: 200, yaw: 0, pitch: 0.9 } })));
  assert.ok(validMissionCheckpoint(saved));
  assert.equal(validMissionCheckpoint({ ...saved, battle: { ...saved.battle, upgrades: { armor: 7 } } }), null);
});

test("Battles without upgrades are exactly as before", () => {
  const b = createBattle(planetById("kepra"));
  assert.deepEqual(b.upgrades, {});
  assert.deepEqual(upgradeEffects(b), { cooldown: 0, health: 1, speed: 1, damage: 1, hazard: 1, hack: 1 });
  assert.deepEqual(upgradeEffects({}), upgradeEffects(b), "older saved battles have no upgrades field");
});
