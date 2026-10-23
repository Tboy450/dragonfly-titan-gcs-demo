import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, stepBattle, requestDrop } from "../dist/invasion/battle.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { missionCheckpoint, validMissionCheckpoint } from "../dist/invasion/mission-save.mjs";

// ENEMY-01: fighting inside a populated town the swarm does not hold outrages the public.
// Eight Strikers hold in a town: with its defenders there they fight; with none they only watch.
function townFight(defended) {
  const b = createBattle({ ...planetById("velm"), hazards: [] }, { matter: 800, unlocks: ["scout", "striker"] });
  const home = b.zones.find(z => z.kind === "beachhead");
  requestDrop(b, { x: home.x, z: home.z, payload: { striker: 6 } });
  for (let t = 0; t < 14; t += 0.1) stepBattle(b, 0.1);
  const town = b.zones.find(z => z.kind === "settlement" && z.population > 0 && b.units.some(u => u.side === "native" && u.home === z.id));
  b.units = b.units.filter(u => u.side === "swarm" || (defended && u.home === town.id));
  const drones = b.units.filter(u => u.side === "swarm");
  for (const d of drones) d.hp = d.maxHp = 1e5;
  b.alarm = 0;
  for (let t = 0; t < 10; t += 0.1) {
    for (const d of drones) { d.x = town.x; d.z = town.z; d.vx = d.vz = 0; d.order = { kind: "hold", x: town.x, z: town.z }; }
    stepBattle(b, 0.1);
  }
  return { b, town };
}

test("Drones fighting inside a town raise the alarm far faster, with one outraged message per town", () => {
  const quiet = townFight(false), fight = townFight(true);
  assert.ok(fight.b.alarm > quiet.b.alarm + 3, `${fight.b.alarm.toFixed(1)} vs ${quiet.b.alarm.toFixed(1)}`);
  assert.equal(fight.town.crossfire, true);
  assert.equal(quiet.town.crossfire, undefined);
  assert.equal(fight.b.log.filter(l => l.text.includes("crossfire")).length, 1, "said once");
  const saved = JSON.parse(JSON.stringify(missionCheckpoint({ battle: fight.b, cam: { focus: { x: 0, z: 0 }, distance: 200, yaw: 0, pitch: 0.9 } })));
  assert.ok(validMissionCheckpoint(saved));
  saved.battle.zones.find(z => z.id === fight.town.id).crossfire = "yes";
  assert.equal(validMissionCheckpoint(saved), null);
});
