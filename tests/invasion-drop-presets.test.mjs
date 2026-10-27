// Drop presets (CTRL-09): Assault, Hack team and Scout swarm fill the wave with a mix, and the last
// wave launched on each planet is remembered: offered as "Last wave" and used to start the next
// mission there.
import test from "node:test";
import assert from "node:assert/strict";
import { dropPresets, fillPayload, presetAvailable } from "../dist/invasion/drop-waves.mjs";
import { payloadSlots, payloadCost, droneOrder } from "../dist/invasion/units.mjs";
import { createProgress, validProgress, SAVE_KEY } from "../dist/invasion/campaign.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

const all = { unlocks: [...droneOrder], podSlots: 24, matter: 1000 };
const preset = (id) => dropPresets.find(p => p.id === id);

test("A preset fills the wave in its proportions, within slots and matter", () => {
  assert.deepEqual(fillPayload(preset("assault").want, all, { cap: false }), { striker: 6, breacher: 3, scout: 3 });
  assert.deepEqual(fillPayload(preset("hack").want, { ...all, podSlots: 12 }, { cap: false }), { link: 5, scout: 2 });
  assert.deepEqual(fillPayload(preset("scouts").want, all, { cap: false }), { scout: 24 });
  for (const p of dropPresets) for (const budget of [all, { ...all, podSlots: 12, matter: 60 }, { ...all, podSlots: 44, matter: 220 }]) {
    const payload = fillPayload(p.want, budget, { cap: false });
    assert.ok(payloadSlots(payload) <= budget.podSlots && payloadCost(payload) <= budget.matter, `${p.id} fits`);
  }
  // Drones not unlocked are left out; the Dragonfly keeps its limit of 3.
  assert.deepEqual(fillPayload(preset("assault").want, { ...all, unlocks: ["scout", "link", "striker"] }, { cap: false }), { striker: 9, scout: 6 });
  assert.equal(fillPayload({ dragonfly: 1 }, { ...all, podSlots: 44 }, { cap: false }).dragonfly, 3);
  // Offered once a drone it needs is unlocked.
  assert.deepEqual(dropPresets.filter(p => presetAvailable(p, ["scout", "link"])).map(p => p.id), ["hack", "scouts"]);
});

test("Repeating a wave keeps its counts, and shrinks it in proportion when it no longer fits", () => {
  const wave = { scout: 4, link: 2, striker: 3 };
  assert.deepEqual(fillPayload(wave, all), wave);
  assert.deepEqual(fillPayload(wave, { ...all, podSlots: 12 }), { scout: 4, link: 2, striker: 2 });
  assert.deepEqual(fillPayload(wave, { ...all, matter: 0 }), {});
});

test("Saved progress keeps each planet's last wave and drops anything invalid", () => {
  const raw = { ...createProgress(), lastWaves: {
    kepra: { scout: 4, link: 2 }, velm: { striker: 3, dragonfly: 0 }, nowhere: { scout: 1 },
    corvan: { laser: 2 }, ashfall: { scout: -1 }, halcyon: { scout: 0 }, aurex: [1, 2],
  } };
  assert.deepEqual(validProgress(JSON.parse(JSON.stringify(raw))).lastWaves, { kepra: { scout: 4, link: 2 }, velm: { striker: 3 } });
  assert.deepEqual(validProgress({ ...createProgress(), lastWaves: "x" }).lastWaves, {});
});

test("The drop panel offers presets, launching remembers the wave, and the next mission starts with it", () => {
  const h = harness(null, { renderer: true }); h.start();
  h.run(`startMission(planetById('kepra')); openDropPanel(); updateDropPanel(true);`);
  const presets = () => h.nodes.get("drop-presets").innerHTML;
  // A new campaign has Scouts and Links: no Assault yet.
  assert.ok(presets().includes('data-preset="hack"') && presets().includes('data-preset="scouts"') && !presets().includes("assault"));
  assert.ok(!presets().includes('data-preset="last"'), "nothing launched here yet");
  assert.equal(h.json("applyPreset('hack')"), true);
  const hack = h.json("mission.payload");
  assert.ok(hack.link > hack.scout && hack.scout > 0, JSON.stringify(hack));
  assert.match(presets(), /data-preset="hack" aria-pressed="true"/);
  assert.match(presets(), /data-preset="scouts" aria-pressed="false"/);
  // Launch it: the wave is remembered for Kepra and saved.
  h.run(`{ const home = mission.battle.zones.find(z => z.kind === "beachhead"); launch(home.x, home.z); }`);
  assert.deepEqual(h.json("progress.lastWaves.kepra"), hack);
  assert.deepEqual(JSON.parse(h.data.get(SAVE_KEY)).lastWaves.kepra, hack);
  // The next Kepra mission starts with it and offers "Last wave".
  h.run(`startMission(planetById('kepra')); openDropPanel(); updateDropPanel(true);`);
  assert.deepEqual(h.json("mission.payload"), hack);
  assert.match(presets(), /data-preset="last" aria-pressed="true"/);
  assert.equal(h.json("applyPreset('scouts')"), true);
  assert.equal(h.json("applyPreset('last')"), true);
  assert.deepEqual(h.json("mission.payload"), hack);
  // Another planet keeps its own default.
  h.run(`startMission(planetById('velm'));`);
  assert.notDeepEqual(h.json("mission.payload"), hack);
});
