// Tooltips on the drop panel and HUD (TUT-04): drone numbers, hazard effects, alarm thresholds and
// matter income, built from the rules so they match the Field guide and the game.
import test from "node:test";
import assert from "node:assert/strict";
import { droneFacts, droneTooltip, hazardEffects, hazardTooltip, alarmTooltip, matterTooltip, fieldGuide } from "../dist/invasion/field-guide.mjs";
import { createBattle, stepBattle, zoneIncome, alarmStages, artilleryAlarm } from "../dist/invasion/battle.mjs";
import { droneTypes, droneOrder } from "../dist/invasion/units.mjs";
import { hazardTypes } from "../dist/invasion/hazards.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

test("A drone's tooltip is its Field guide entry: role, cost, health, weapons and threats", () => {
  const guide = fieldGuide().find(s => s.section === "Drones").items;
  for (const id of droneOrder) {
    const d = droneTypes[id], text = droneTooltip(id);
    assert.ok(text.startsWith(`${d.name}: ${d.role}\n`), id);
    assert.match(text, new RegExp(`${d.cost} matter · ${d.slots} wave`));
    for (const w of d.weapons) assert.ok(text.includes(`${w.name}: ${w.damage}/s`), `${id} ${w.name}`);
    assert.deepEqual(guide.find(item => item.name === d.name).facts, droneFacts(id), "same facts as the guide");
  }
});

test("A hazard's tooltip lists what it does, scaled by the planet's severity", () => {
  assert.deepEqual(hazardEffects("dustStorm", 1), ["20% slower", "see 55% less", "weapons reach 30% less",
    "lose 0.35 health/s outside your zones (half inside)", "wind pushes drones up to 5 m/s"]);
  assert.ok(hazardEffects("dustStorm", 2).includes("lose 0.7 health/s outside your zones (half inside)"));
  assert.deepEqual(hazardEffects("eruption", 0.5), ["7.5 damage/s inside a 55 m circle, to defenders too (defenses take 40%)"]);
  assert.deepEqual(hazardEffects("solarFlare"), ["drones outside your zones are stunned"]);
  assert.ok(hazardEffects("lightning").some(e => e.startsWith("bolts every 3.5 s on drones and defenders alike, 24 damage")));
  for (const type of Object.keys(hazardTypes)) {
    const text = hazardTooltip(type, 1);
    assert.ok(text.startsWith(`${hazardTypes[type].name}: ${hazardTypes[type].advice}\nWhile it lasts: `), type);
    assert.ok(hazardEffects(type).length > 0, `${type} has effects`);
  }
  assert.equal(hazardTooltip("nothing"), "");
});

test("The alarm tooltip gives the level and each threshold, with artillery only where it exists", () => {
  const titan = createBattle(planetById("titan"), { matter: 100 });
  assert.match(alarmTooltip(titan), /nobody lives here/);
  const kepra = createBattle(planetById("kepra"), { matter: 100 });
  kepra.alarm = 30;
  const lines = alarmTooltip(kepra).split("\n");
  assert.equal(lines[0], "Public alarm: 30 of 100 (Uneasy).");
  assert.ok(lines.includes(`Now 25: ${alarmStages[0].text}`));
  assert.ok(lines.includes(`At 50: ${alarmStages[1].text}`));
  assert.ok(!lines.some(l => /Artillery/.test(l)), "tribal worlds have no artillery");
  const ashfall = createBattle(planetById("ashfall"), { matter: 100 });
  ashfall.alarm = 72;
  const atAshfall = alarmTooltip(ashfall).split("\n");
  assert.ok(atAshfall.includes(`Now ${artilleryAlarm}: Artillery shells your drones.`));
  // Thresholds in order: 25, 50, 70, 75.
  assert.deepEqual(atAshfall.slice(3).map(l => Number(l.match(/^(?:Now|At) (\d+)/)[1])), [25, 50, 70, 75]);
});

test("The matter tooltip's income matches what the battle pays", () => {
  const b = createBattle({ ...planetById("kepra"), hazards: [] }, { matter: 500 }); // enough to stay in the fight
  const zones = b.zones.filter(z => z.kind !== "beachhead" && z.value).slice(0, 2);
  for (const z of zones) { z.captured = true; z.control = 100; }
  const rate = b.zones.filter(z => z.captured && z.value).reduce((s, z) => s + zoneIncome(b, z), 0);
  assert.match(matterTooltip(b), new RegExp(`Income now ${Math.round(rate * 10) / 10}/s`));
  b.units = b.units.filter(u => u.side !== "native"); // nobody to retake the zones
  const before = b.matter;
  for (let t = 0; t < 10; t += 0.1) stepBattle(b, 0.1);
  assert.ok(Math.abs((b.matter - before) - rate * 10) < rate * 0.2, `${b.matter - before} vs ${rate * 10}`);
  assert.match(matterTooltip(b), /6 salvage/);
});

test("The page puts the tooltips on drop rows, the wave summary, matter, alarm and hazard", () => {
  const h = harness(null, { renderer: true }); h.start();
  h.run(`startMission(planetById('kepra')); openDropPanel(); updateDropPanel(true);
    mission.battle.alarm = 55; updateHud();`);
  const rows = h.nodes.get("drop-rows").innerHTML;
  assert.ok(rows.includes(`title="${droneTypes.scout.name}: `), "a drone row has its tooltip");
  assert.match(h.nodes.get("drop-summary").title, /first pod lands/);
  assert.match(h.nodes.get("hud-matter-box").title, /^Matter pays for drop waves/);
  assert.match(h.nodes.get("hud-alarm-box").title, /^Public alarm: 55 of 100 \(Alarmed\)/);
  // A hazard on its way: its badge explains it.
  h.run(`mission.battle.hazards.events.push({ type: "dustStorm", name: "Dust storm", phase: "warning", activeAt: mission.battle.time + 9 }); updateHud();`);
  // The forecast leads (HAZ-03), then what the hazard does.
  assert.match(h.nodes.get("hud-hazard").title, /^Forecast: Dust storm in about 0:10\.\nDust storm: .*\nWhile it lasts: 20% slower/);
});
