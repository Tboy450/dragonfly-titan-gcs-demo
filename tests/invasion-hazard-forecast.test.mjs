// Hazard forecast and counters (HAZ-03): the coming hazards with their times, on the HUD badge and
// its tooltip, and the counters (shelter in held zones, Weather sealing) there and on the galaxy.
import test from "node:test";
import assert from "node:assert/strict";
import { hazardForecast, hazardTypes } from "../dist/invasion/hazards.mjs";
import { hazardCounters, forecastTooltip, aboutTime } from "../dist/invasion/field-guide.mjs";
import { createBattle, stepBattle } from "../dist/invasion/battle.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

test("The forecast lists each hazard once, soonest first, from the real schedule", () => {
  const b = createBattle(planetById("ashfall"), { matter: 500 });
  const forecast = hazardForecast(b, 9);
  assert.equal(forecast.length, b.hazards.types.length);
  assert.deepEqual(forecast.map(f => f.type).sort(), [...b.hazards.types].sort());
  for (let i = 1; i < forecast.length; i++) assert.ok(forecast[i - 1].in <= forecast[i].in, "soonest first");
  for (const f of forecast) assert.equal(f.in, b.hazards.next[f.type] + hazardTypes[f.type].warnS - b.time);
  assert.equal(hazardForecast(b, 1).length, 1);
  // A hazard switched off (as tests do) drops out of the forecast.
  b.hazards.next[forecast[0].type] = Infinity;
  assert.ok(!hazardForecast(b, 9).some(f => f.type === forecast[0].type));
});

test("The first forecast hazard strikes when the forecast said it would", () => {
  const b = createBattle(planetById("kepra"), { matter: 500 });
  const [first] = hazardForecast(b, 1), due = b.time + first.in;
  let warned = null;
  while (b.time < due + 1) {
    stepBattle(b, 0.1);
    const event = b.hazards.events.find(e => e.type === first.type);
    if (event && !warned) { warned = b.time; assert.equal(hazardForecast(b, 1)[0].phase, "warning"); }
    if (event?.phase === "active") break;
  }
  const event = b.hazards.events.find(e => e.type === first.type);
  assert.equal(event.phase, "active");
  // Within two 0.1 s steps: the warning starts on the first step past its time, and so does the storm.
  assert.ok(b.time >= due - 1e-9 && b.time - due <= 0.21, `${b.time} vs ${due}`);
  assert.deepEqual(hazardForecast(b, 1)[0], { type: first.type, name: first.name, in: 0, phase: "active" });
});

test("Counters name the shelter and the sealing level, and the tooltip's damage includes sealing", () => {
  assert.match(hazardCounters(0)[0], /^Shelter: drones in zones you hold, or landed, take half weather damage/);
  assert.equal(hazardCounters(0)[1], "Weather sealing (a Hive upgrade) cuts hazard damage by 20% a level.");
  assert.equal(hazardCounters(2)[1], "Weather sealing level 2: 40% less hazard damage.");
  assert.deepEqual([1, 10, 79, 80, 600].map(aboutTime), ["0:10", "0:10", "1:20", "1:20", "10:00"]);
  const b = createBattle(planetById("kepra"), { matter: 500 });
  const plain = forecastTooltip(b, hazardForecast(b, 3));
  assert.match(plain, /^Forecast: Dust storm in about \d+:\d0\./);
  const raw = 0.35 * b.hazards.severity;
  assert.ok(plain.includes(`lose ${Math.round(raw * 100) / 100} health/s`), plain);
  b.upgrades = { sealing: 2 };
  const sealed = forecastTooltip(b, hazardForecast(b, 3));
  assert.ok(sealed.includes(`lose ${Math.round(raw * 0.6 * 100) / 100} health/s`), sealed);
  assert.ok(sealed.endsWith("Weather sealing level 2: 40% less hazard damage."));
});

test("The HUD badge shows the next hazard when nothing is close, and the galaxy shows the counters", () => {
  const h = harness(null, { renderer: true }); h.start();
  h.run(`startMission(planetById('kepra')); updateHud();`);
  const badge = h.nodes.get("hud-hazard");
  assert.equal(badge.hidden, false);
  assert.match(badge.textContent, /^Next: Dust storm ~\d+:\d0$/);
  assert.match(badge.title, /^Forecast: Dust storm in about/);
  // Under way: the badge says so, as before.
  h.run(`for (let i = 0; i < 2000 && !mission.battle.hazards.events.length; i++) stepBattle(mission.battle, .1); updateHud();`);
  assert.match(badge.textContent, /^Dust storm in \d+ s$/);
  // A planet with no hazards has no badge.
  h.run(`startMission(planetById('kepra')); mission.battle.hazards.types = []; updateHud();`);
  assert.equal(badge.hidden, true);
  h.run(`selectedPlanet = 'kepra'; show('galaxy');`);
  assert.match(h.nodes.get("planet-panel").innerHTML, /<p class="hazard-counters">Shelter: drones in zones you hold/);
});
