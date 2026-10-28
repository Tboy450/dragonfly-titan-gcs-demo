// Difficulty levels (OBJ-05): Easy, Normal and Hard scale defenders, reinforcements, hazards and
// each planet's guaranteed supply; the choice is saved with the campaign and every battle keeps
// its own.
import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, stepBattle } from "../dist/invasion/battle.mjs";
import { difficulties, difficultyOf } from "../dist/invasion/units.mjs";
import { planetById, frontiers, createProgress, validProgress, missionSupply, missionMatter, SAVE_KEY } from "../dist/invasion/campaign.mjs";
import { missionCheckpoint, validMissionCheckpoint } from "../dist/invasion/mission-save.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} vs ${b}`);
const battle = (difficulty) => createBattle(planetById("ashfall"), { matter: 500, difficulty });

test("Defenders, hazards and reinforcements scale with the difficulty", () => {
  const [easy, normal, hard] = ["easy", "normal", "hard"].map(battle);
  assert.deepEqual([easy, normal, hard].map(b => b.difficulty), ["easy", "normal", "hard"]);
  // The same seed places the same defenders; only their strength changes.
  for (const [b, level] of [[easy, difficulties.easy], [hard, difficulties.hard]]) {
    b.units.forEach((u, i) => {
      close(u.maxHp, normal.units[i].maxHp * level.hp, 1e-6);
      close(u.damageScale, normal.units[i].damageScale * level.damage, 1e-9);
    });
    close(b.hazards.severity, normal.hazards.severity * level.hazards, 1e-9);
  }
  // The wait for the next militia shortens on Hard and lengthens on Easy.
  for (const b of [easy, normal, hard]) { for (const type in b.hazards.next) b.hazards.next[type] = Infinity; b.reinforceIn = 0; stepBattle(b, 0.1); }
  close(easy.reinforceIn * difficulties.easy.reinforce, normal.reinforceIn, 1e-6);
  close(hard.reinforceIn * difficulties.hard.reinforce, normal.reinforceIn, 1e-6);
  // Anything unknown plays as Normal.
  assert.equal(battle("nightmare").difficulty, "normal");
  assert.equal(difficultyOf(undefined), difficulties.normal);
});

test("Each planet's guaranteed supply scales; a bigger bank is untouched", () => {
  const kepra = planetById("kepra"), poor = { ...createProgress(), matter: 0 };
  for (const id of ["easy", "normal", "hard"]) {
    const progress = { ...poor, difficulty: id };
    assert.equal(missionMatter(progress, kepra), Math.round(kepra.supply * difficulties[id].supply));
    const supply = missionSupply(progress, kepra);
    assert.equal(supply.difficulty, id);
    assert.equal(supply.matter, missionMatter(progress, kepra));
    assert.equal(missionMatter({ ...progress, matter: 5000 }, kepra), 5000);
    const map = frontiers[0];
    assert.equal(missionSupply(progress, map).matter, Math.round(map.supply * difficulties[id].supply));
  }
  assert.equal(missionSupply(createProgress(), kepra).difficulty, "normal");
});

test("The campaign save keeps the difficulty; battle checkpoints keep theirs", () => {
  assert.equal(createProgress().difficulty, "normal");
  assert.equal(validProgress({ ...createProgress(), difficulty: "hard" }).difficulty, "hard");
  assert.equal(validProgress({ ...createProgress(), difficulty: "nightmare" }).difficulty, "normal");
  assert.equal(validProgress({ ...createProgress(), difficulty: undefined }).difficulty, "normal");
  const b = battle("hard");
  const saved = JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam: { focus: { x: 0, z: 0 }, distance: 200, yaw: 0, pitch: 0.9 } })));
  assert.ok(validMissionCheckpoint(saved));
  assert.equal(saved.battle.difficulty, "hard");
  assert.equal(validMissionCheckpoint({ ...saved, battle: { ...saved.battle, difficulty: "nightmare" } }), null);
  // A battle saved before difficulties existed has none and still loads.
  const { difficulty, ...older } = saved.battle;
  assert.equal(difficulty, "hard");
  assert.ok(validMissionCheckpoint({ ...saved, battle: older }));
});

test("The title button cycles the difficulty, saves it, and new missions use it", async () => {
  const h = harness(null, { renderer: true }); h.start();
  const button = () => h.nodes.get("difficulty-button");
  assert.equal(button().textContent, "Difficulty: Normal");
  await h.click("difficulty-button");
  assert.equal(button().textContent, "Difficulty: Hard");
  assert.match(button().title, /^Defenders have 25% more health/);
  assert.equal(JSON.parse(h.data.get(SAVE_KEY)).difficulty, "hard");
  h.run(`selectedPlanet = 'titan'; show('galaxy');`); // open from the start
  assert.match(h.nodes.get("planet-panel").innerHTML, /1–3 drones per pod · Hard difficulty/);
  h.run(`startMission(planetById('kepra')); closeDropPanel(); scene.unload = () => {};`);
  assert.equal(h.json("mission.battle.difficulty"), "hard");
  await h.click("menu-button");
  assert.match(h.nodes.get("pause-summary").textContent, / · Hard$/);
  await h.click("pause-resume");
  await h.click("difficulty-button");
  assert.equal(button().textContent, "Difficulty: Easy");
  assert.equal(h.json("mission.battle.difficulty"), "hard", "a battle under way keeps its own");
  await h.click("difficulty-button");
  assert.equal(button().textContent, "Difficulty: Normal");
});
