// Replay challenges (ECON-04): on a conquered planet, Raised threat, Wild weather and On alert
// each make the attempt harder and add bonus matter to the replay reward; every one beaten is
// recorded on the planet, saved, and counted on the title screen.
import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, stepBattle, missionResult, canSurrender } from "../dist/invasion/battle.mjs";
import { replayModifiers, modifiersFor, cleanModifiers, replayReward, alertFloor } from "../dist/invasion/replay.mjs";
import { planetById, frontiers, createProgress, validProgress, applyMissionResult, challengeTally } from "../dist/invasion/campaign.mjs";
import { missionCheckpoint, validMissionCheckpoint } from "../dist/invasion/mission-save.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

const kepra = planetById("kepra"), velm = planetById("velm"), titan = planetById("titan");
const battle = (planet, modifiers) => createBattle(planet, { matter: 500, modifiers });
const nativeHp = (b) => b.units.filter(u => u.side === "native").reduce((sum, u) => sum + u.maxHp, 0);

test("Each planet offers the challenges that fit it, and each adds to the replay reward", () => {
  assert.deepEqual(modifiersFor(titan), ["weather"], "nobody lives on Titan to raise the threat or alarm");
  assert.deepEqual(modifiersFor(kepra), ["threat", "weather", "alert"]);
  assert.deepEqual(modifiersFor(frontiers[0]), [], "frontier maps have no replay reward");
  assert.deepEqual(cleanModifiers(kepra, ["alert", "threat", "alert", "bogus"]), ["threat", "alert"]);
  assert.deepEqual(cleanModifiers(kepra, "threat"), []);
  assert.equal(replayReward(kepra, []), Math.round(kepra.reward.matter * 0.3), "the plain replay pays 30% as before");
  assert.equal(replayReward(kepra, ["threat", "weather", "alert"]), Math.round(kepra.reward.matter * 1.5));
  assert.equal(replayReward(titan, ["threat"]), replayReward(titan, []));
});

test("Raised threat, Wild weather and On alert change the battle", () => {
  const plain = battle(velm, []), raised = battle(velm, ["threat"]);
  assert.deepEqual(plain.modifiers, []);
  assert.equal(raised.threat, plain.threat + 1);
  assert.ok(nativeHp(raised) > nativeHp(plain), `${nativeHp(raised)} vs ${nativeHp(plain)}`);
  assert.ok(raised.log.some(l => l.text === `Replay challenges: ${replayModifiers.threat.name}.`));
  assert.ok(raised.log.some(l => l.text.includes(`threat ${plain.threat + 1}.`)));
  // Wild weather: sooner and harder hazards, still none in the first minute.
  const wild = battle(velm, ["weather"]);
  assert.ok(Math.abs(wild.hazards.severity - plain.hazards.severity * 1.3) < 1e-9);
  assert.ok(Math.abs(wild.hazards.calm - plain.hazards.calm * 0.65) < 1e-9);
  for (const type in plain.hazards.next) assert.equal(wild.hazards.next[type], Math.max(60, plain.hazards.next[type] * 0.65));
  // On alert: the public never calms below the floor, so no town surrenders.
  const alert = battle(velm, ["alert"]);
  for (const type in alert.hazards.next) alert.hazards.next[type] = Infinity;
  for (let t = 0; t < 90; t += 0.5) stepBattle(alert, 0.5);
  assert.equal(alert.alarm, alertFloor);
  assert.ok(alert.log.some(l => l.text.startsWith("The public is uneasy")));
  assert.ok(alert.zones.filter(z => z.kind === "settlement").every(z => !canSurrender(alert, z)));
  // Titan cannot raise its threat; the result carries the challenges to the campaign.
  const practice = battle(titan, ["threat", "weather"]);
  assert.deepEqual(practice.modifiers, ["weather"]);
  assert.equal(practice.threat, 0);
  assert.deepEqual(missionResult(raised).modifiers, ["threat"]);
});

test("A replay won with challenges pays the bonus and records them; a first conquest or a loss does not", () => {
  const won = (modifiers) => ({ outcome: "won", matter: 100, stars: 2, time: 300, stats: {}, modifiers });
  const conquered = { ...createProgress(), captured: { titan: true, kepra: true } };
  const first = applyMissionResult(conquered, kepra, won(["threat", "alert"]));
  assert.equal(first.progress.matter, 100 + replayReward(kepra, ["threat", "alert"]));
  assert.deepEqual(first.progress.challenges.kepra, ["threat", "alert"]);
  assert.ok(first.notes.includes(`Replay reward: +${replayReward(kepra, ["threat", "alert"])} matter with Raised threat, On alert.`), first.notes.join(" | "));
  assert.ok(first.notes.includes("Challenges beaten on Kepra: Raised threat, On alert."));
  const second = applyMissionResult(first.progress, kepra, won(["weather", "threat"]));
  assert.deepEqual(second.progress.challenges.kepra, ["threat", "weather", "alert"]);
  assert.ok(second.notes.includes("Challenge beaten on Kepra: Wild weather."));
  assert.deepEqual(challengeTally(second.progress), { beaten: 3, total: 19 });
  // The first conquest ignores challenges (the panel never offers them there).
  const fresh = applyMissionResult({ ...createProgress(), captured: { titan: true } }, kepra, won(["threat"]));
  assert.equal(fresh.progress.matter, 100 + kepra.reward.matter);
  assert.deepEqual(fresh.progress.challenges, {});
  const lost = applyMissionResult(conquered, kepra, { ...won(["threat"]), outcome: "lost" });
  assert.deepEqual(lost.progress.challenges, {});
  // Saved progress keeps known challenges on conquered planets only.
  const clean = validProgress({ ...second.progress, challenges: { kepra: ["alert", "bogus", "alert"], velm: ["threat"], titan: ["threat", "weather"] } });
  assert.deepEqual(clean.challenges, { kepra: ["alert"], titan: ["weather"] });
  assert.deepEqual(validProgress({ ...createProgress(), challenges: "lots" }).challenges, {});
});

test("A battle checkpoint keeps its challenges, and Raised threat on Aurex still loads", () => {
  const cam = { focus: { x: 0, z: 0 }, distance: 200, yaw: 0, pitch: 0.9 };
  const save = (b) => JSON.parse(JSON.stringify(missionCheckpoint({ battle: b, cam })));
  const aurex = planetById("aurex"), saved = save(battle(aurex, ["threat", "alert"]));
  assert.equal(saved.battle.threat, 6);
  assert.ok(validMissionCheckpoint(saved));
  assert.deepEqual(saved.battle.modifiers, ["threat", "alert"]);
  for (const modifiers of [["bogus"], ["alert", "alert"], "threat"]) assert.equal(validMissionCheckpoint({ ...saved, battle: { ...saved.battle, modifiers } }), null, String(modifiers));
  assert.equal(validMissionCheckpoint({ ...save(battle(titan, [])), battle: { ...save(battle(titan, [])).battle, modifiers: ["threat"] } }), null);
  const { modifiers, ...older } = save(battle(kepra, [])).battle;
  assert.deepEqual(modifiers, []);
  assert.ok(validMissionCheckpoint({ ...save(battle(kepra, [])), battle: older }), "battles saved before challenges still load");
});

test("The planet panel toggles challenges; Invade again, the pause menu and restart use them", async () => {
  const progress = { ...createProgress(), captured: { titan: true, kepra: true }, stars: { kepra: 2 }, challenges: { kepra: ["weather"] } };
  const h = harness(JSON.stringify(progress), { renderer: true });
  const Element = h.nodes.get("planet-panel").constructor;
  h.start();
  h.run(`selectedPlanet = 'kepra'; show('galaxy');`);
  const panel = () => h.nodes.get("planet-panel").innerHTML;
  assert.match(panel(), /Replay challenges/);
  assert.match(panel(), /✦ Wild weather · \+53 matter/);
  assert.match(panel(), /✧ Raised threat · \+75 matter/);
  assert.match(panel(), /Replay reward: \+45 matter · 1 of 3 challenges beaten/);
  const toggle = (id) => h.dispatch("planet-panel", "click", { target: { closest: () => ({ dataset: { challenge: id } }) } });
  toggle("threat");
  assert.match(panel(), /data-challenge="threat" aria-pressed="true"/);
  assert.match(panel(), /Replay reward: \+120 matter with Raised threat · 1 of 3/);
  assert.match(panel(), /Invade again · 1 challenge</);
  toggle("alert"); toggle("alert");
  assert.match(panel(), /aria-pressed="true"[^]*aria-pressed="false"[^]*aria-pressed="false"/);
  // Titan was conquered too, but only offers Wild weather.
  h.run(`selectedPlanet = 'titan'; renderPlanetPanel();`);
  assert.doesNotMatch(panel(), /data-challenge="threat"/);
  // The page renders the button with innerHTML; the harness needs a node for it to wire up.
  h.nodes.set("invade-button", new Element("invade-button", "button"));
  h.run(`selectedPlanet = 'kepra'; renderPlanetPanel();`);
  await h.click("invade-button");
  h.run(`closeDropPanel(); scene.unload = () => {};`);
  assert.deepEqual(h.json("mission.battle.modifiers"), ["threat"]);
  assert.equal(h.json("mission.battle.threat"), kepra.threat + 1);
  await h.click("menu-button");
  assert.match(h.nodes.get("pause-summary").textContent, / · Raised threat$/);
  await h.confirmAction("pause-restart", true);
  assert.deepEqual(h.json("mission.battle.modifiers"), ["threat"], "a restart keeps the challenges");
});
