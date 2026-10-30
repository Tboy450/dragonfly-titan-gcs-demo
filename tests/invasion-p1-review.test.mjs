// Fixes from the browser review of the P1 features (October 30): pod and drone counts read
// correctly in the landing log and on the squad card, and a menu left open over one battle does
// not carry over into the next.
import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, stepBattle, requestDrop } from "../dist/invasion/battle.mjs";
import { planetById } from "../dist/invasion/campaign.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

test("The landing log counts one pod and one drone in the singular", () => {
  const b = createBattle({ ...planetById("kepra"), hazards: [] }, { matter: 500, podSlots: 16 });
  const home = b.zones.find(z => z.kind === "beachhead");
  requestDrop(b, { x: home.x, z: home.z, payload: { scout: 7 } }); // pods of 3, 3 and 1
  for (let t = 0; t < 16; t += 0.1) stepBattle(b, 0.1);
  const lines = b.log.map(l => l.text).filter(t => t.startsWith("Squad 1: pod "));
  assert.deepEqual(lines, [
    "Squad 1: pod 1/3 down, 3 drones · 2 pods inbound.",
    "Squad 1: pod 2/3 down, 3 drones · 1 pod inbound.",
    "Squad 1: pod 3/3 down, 1 drone · wave complete.",
  ]);
});

test("The squad card says 1 pod inbound, and a new battle starts without a menu left open", () => {
  const h = harness(null, { renderer: true });
  h.start();
  h.run(`startMission(planetById('kepra')); closeDropPanel(); scene.unload = () => {};
    const b = mission.battle, home = b.zones.find(z => z.kind === 'beachhead');
    requestDrop(b, { x: home.x, z: home.z, payload: { scout: 2 } });
    updateSquadBar();`);
  const card = h.nodes.get("squad-bar").children[0];
  assert.match(card.querySelector("strong").textContent, /^Squad 1 · 0 ready · 1 pod inbound$/);
  h.run(`openPauseMenu();`);
  assert.equal(h.nodes.get("pause-menu").open, true);
  h.run(`startMission(planetById('kepra'));`);
  assert.equal(h.nodes.get("pause-menu").open, false);
});
