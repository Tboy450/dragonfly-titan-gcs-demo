import test from "node:test";
import assert from "node:assert/strict";
import {
  planets, planetById, createProgress, isPlanetUnlocked, nextPlanet, applyMissionResult,
  validProgress, missionMatter, availableDrones,
} from "../dist/invasion/campaign.mjs";
import { achievements, achievementContext, newAchievements, recordAchievements } from "../dist/invasion/achievements.mjs";
import { droneTypes, societies } from "../dist/invasion/units.mjs";
import { hazardTypes } from "../dist/invasion/hazards.mjs";

const win = (stats = {}) => ({ outcome: "won", matter: 50, stars: 2, time: 300, stats: { drops: 2, dronesLost: 3, ...stats }, recovered: [] });

test("The campaign runs in order from the empty practice planet to the spacefaring capital", () => {
  assert.deepEqual(planets.map(p => p.order), planets.map((_, i) => i + 1));
  assert.equal(new Set(planets.map(p => p.id)).size, planets.length);
  assert.equal(planets[0].id, "titan");
  assert.ok(planets[0].practice && planets[0].society === 0, "Titan is the empty practice planet");
  for (let i = 1; i < planets.length; i += 1) {
    assert.ok(planets[i].society >= planets[i - 1].society, "society levels never go down");
    assert.ok(planets[i].threat >= planets[i - 1].threat, "threat levels never go down");
    assert.ok(planets[i].supply >= planets[i - 1].supply, "harder planets get more supply");
  }
  for (const planet of planets) {
    assert.ok(societies[planet.society], planet.id);
    assert.ok(planet.galaxy.x > 0 && planet.galaxy.x < 1 && planet.galaxy.y > 0 && planet.galaxy.y < 1);
    for (const hazard of planet.hazards) assert.ok(hazardTypes[hazard], `${planet.id} ${hazard}`);
    if (planet.reward.unlock) assert.ok(droneTypes[planet.reward.unlock]);
    assert.ok(planet.objectives.length === 2, "two optional goals: three stars at most");
  }
  assert.ok(planets.some(p => p.zones?.some(z => z.special === "dragonfly")), "the Dragonfly is recoverable somewhere");
});

test("Planets unlock one at a time as each is captured", () => {
  const progress = createProgress();
  assert.ok(isPlanetUnlocked(progress, planetById("titan")));
  assert.ok(!isPlanetUnlocked(progress, planetById("kepra")));
  assert.equal(nextPlanet(progress).id, "titan");
  const { progress: after } = applyMissionResult(progress, planetById("titan"), win());
  assert.ok(isPlanetUnlocked(after, planetById("kepra")));
  assert.ok(!isPlanetUnlocked(after, planetById("velm")));
  assert.equal(nextPlanet(after).id, "kepra");
  assert.deepEqual(availableDrones(progress), ["scout", "link"], "the Dragonfly starts locked");
});

test("Mission results pay rewards once, unlock drones and never change the old progress", () => {
  const start = createProgress();
  const titan = planetById("titan");
  const first = applyMissionResult(start, titan, { ...win(), recovered: ["dragonfly"] });
  assert.equal(start.matter, 160, "input untouched");
  assert.equal(first.progress.matter, 50 + titan.reward.matter);
  assert.ok(first.progress.unlocks.includes("striker"));
  assert.ok(first.progress.unlocks.includes("dragonfly"), "the recovered Dragonfly is unlocked");
  assert.equal(first.progress.stars.titan, 2);
  assert.equal(first.progress.stats.missionsWon, 1);
  assert.equal(first.progress.stats.drops, 2);
  const replay = applyMissionResult(first.progress, titan, { ...win(), stars: 1, time: 200 });
  assert.equal(replay.progress.matter, 50 + Math.round(titan.reward.matter * 0.3), "replays pay less");
  assert.equal(replay.progress.stars.titan, 2, "best stars are kept");
  assert.equal(replay.progress.bestTime.titan, 200);
  const kepra = planetById("kepra");
  const pods = applyMissionResult(replay.progress, kepra, win());
  assert.equal(pods.progress.podSlots, 12 + kepra.reward.podSlots);
  const lost = applyMissionResult(pods.progress, planetById("velm"), { outcome: "lost", matter: 3, stats: {} });
  assert.equal(lost.progress.matter, 3);
  assert.equal(missionMatter(lost.progress, planetById("velm")), planetById("velm").supply, "a retry is always resupplied");
  assert.match(lost.notes.join(" "), /resupply/);
});

test("Saved progress is validated field by field", () => {
  const { progress } = applyMissionResult(createProgress(), planetById("titan"), { ...win(), recovered: ["dragonfly"] });
  assert.deepEqual(validProgress(JSON.parse(JSON.stringify(progress))), progress);
  assert.equal(validProgress(null), null);
  assert.equal(validProgress({ version: 99 }), null);
  const messy = validProgress({
    version: 1, matter: -5, captured: { titan: true, mars: true, kepra: "yes" }, stars: { titan: 7, kepra: 2 },
    unlocks: ["scout", "nuke", "striker"], podSlots: 9999, achievements: { "<script>": 1, foothold: 5 }, stats: { drops: "lots" },
  });
  assert.equal(messy.matter, 0);
  assert.deepEqual(messy.captured, { titan: true });
  assert.deepEqual(messy.stars, { kepra: 2 });
  assert.deepEqual(messy.unlocks, ["scout", "link", "striker"]);
  assert.equal(messy.podSlots, 44);
  assert.deepEqual(messy.achievements, { foothold: 5 });
  assert.equal(messy.stats.drops, 0);
});

test("Achievements are earned once, from live missions and from the campaign totals", () => {
  assert.equal(new Set(achievements.map(a => a.id)).size, achievements.length);
  const progress = createProgress();
  const titan = planetById("titan");
  const live = { outcome: null, stats: { drops: 1, zonesCaptured: 0, maxAlive: 9 }, recovered: [] };
  const earned = newAchievements(progress, achievementContext(progress, titan, live, true));
  assert.deepEqual(earned.map(a => a.id), ["planetfall"]);
  const recorded = recordAchievements(progress, earned, 1234);
  assert.equal(recorded.achievements.planetfall, 1234);
  assert.equal(progress.achievements.planetfall, undefined);
  assert.deepEqual(newAchievements(recorded, achievementContext(recorded, titan, live, true)), []);
  let all = recorded;
  for (const planet of planets) all = applyMissionResult(all, planet, win()).progress;
  const final = planets.at(-1);
  const context = achievementContext(all, final, { ...win(), stats: { ...win().stats, alarmPeak: 10, maxAlive: 12, hazardEvents: 1 } });
  const ids = newAchievements(all, context).map(a => a.id);
  assert.ok(ids.includes("hive-ascendant"));
  assert.ok(ids.includes("silent-takeover"));
  assert.ok(!ids.includes("dragon-tamer"), "the Dragonfly was never recovered in this run");
});

test("The Swarmfall page parses, carries publish stamps and gets its own build label", async () => {
  const { readFileSync, readdirSync } = await import("node:fs");
  const { spawnSync } = await import("node:child_process");
  const { fileURLToPath } = await import("node:url");
  const dir = new URL("../dist/invasion/", import.meta.url);
  const html = readFileSync(new URL("index.html", dir), "utf8");
  assert.ok(html.includes('src="./main.mjs?v=dev"'));
  assert.ok(html.includes('href="./invasion.css?v=dev"'));
  assert.ok(html.includes("data-build-stamp>Build local<"));
  assert.ok(html.includes('href="../"'), "links back to the simulator");
  const workflow = readFileSync(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
  assert.ok(workflow.includes("dist/invasion/index.html"), "the publish step stamps the game's build label too");
  for (const file of readdirSync(dir).filter(name => name.endsWith(".mjs"))) {
    const result = spawnSync(process.execPath, ["--check", fileURLToPath(new URL(file, dir))], { encoding: "utf8" });
    assert.equal(result.status, 0, `${file}: ${result.stderr}`);
  }
});
