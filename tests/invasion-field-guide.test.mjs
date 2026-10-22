import test from "node:test";
import assert from "node:assert/strict";
import { fieldGuide } from "../dist/invasion/field-guide.mjs";
import { droneTypes, defenderTypes, societies } from "../dist/invasion/units.mjs";
import { hazardTypes } from "../dist/invasion/hazards.mjs";

test("The field guide covers every drone, defender, society and hazard from the rules", () => {
  const guide = Object.fromEntries(fieldGuide().map(({ section, items }) => [section, items]));
  assert.deepEqual(guide.Drones.map(i => i.name).sort(), Object.values(droneTypes).map(d => d.name).sort());
  assert.deepEqual(guide.Defenders.map(i => i.name).sort(), Object.values(defenderTypes).map(d => d.name).sort());
  assert.equal(guide.Societies.length, societies.length);
  assert.deepEqual(guide.Hazards.map(i => i.name).sort(), Object.values(hazardTypes).map(h => h.name).sort());
  for (const items of Object.values(guide)) for (const item of items) assert.ok(item.summary && item.facts.length && item.facts.every(f => typeof f === "string" && f.length));
});

test("Numbers and counters match the rules", () => {
  const guide = Object.fromEntries(fieldGuide().map(({ section, items }) => [section, items]));
  const striker = guide.Drones.find(i => i.name === "Striker");
  assert.ok(striker.facts.some(f => f.startsWith(`${droneTypes.striker.cost} matter`)));
  assert.ok(striker.facts.some(f => f.includes("Rotary cannon: 9/s")));
  // Only Breachers' charges and Strikers' cannons do heavy damage to structures: they top the list.
  const jammer = guide.Defenders.find(i => i.name === "Signal jammer");
  assert.ok(jammer.facts.includes("Beaten by: Breacher (34/s), Striker (9/s)"));
  assert.ok(jammer.facts.some(f => f.includes("Links cannot hack")));
  const flak = guide.Defenders.find(i => i.name === "Flak gun");
  assert.ok(flak.facts.some(f => f.includes("6 m splash")));
});
