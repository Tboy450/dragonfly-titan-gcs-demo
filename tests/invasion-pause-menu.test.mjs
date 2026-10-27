// Pause menu (CTRL-12): Menu or Escape pauses and offers Resume, Restart mission, Quit to the galaxy
// (the battle stays saved and can be resumed from the galaxy), sound, speed and the Field guide.
import test from "node:test";
import assert from "node:assert/strict";
import { SAVE_KEY } from "../dist/invasion/campaign.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

function page() {
  const h = harness(null, { renderer: true }); h.start();
  h.run(`startMission(planetById('kepra')); closeDropPanel(); scene.unload = () => {};
    mission.battle.matter = 1000; mission.paused = false;
    requestDrop(mission.battle, { x: mission.battle.zones[0].x, z: mission.battle.zones[0].z, payload: { scout: 4 } });
    for (let i = 0; i < 200; i++) stepBattle(mission.battle, .1);`);
  h.key = (k) => h.dispatch("window", "keydown", { key: k, target: { closest: () => null } });
  h.open = () => h.nodes.get("pause-menu").open;
  return h;
}

test("Menu and Escape pause the battle; Resume plays on and Escape returns to how it was", async () => {
  const h = page();
  await h.click("menu-button");
  assert.equal(h.open(), true);
  assert.equal(h.json("mission.paused"), true);
  assert.match(h.nodes.get("pause-summary").textContent, /^Kepra · 0:20 · 0 of \d+ zones held$/);
  assert.equal(h.nodes.get("pause-quit").textContent, "Quit to the galaxy");
  await h.click("pause-resume");
  assert.equal(h.open(), false);
  assert.equal(h.json("mission.paused"), false);
  // Paused first, then the menu: Escape (the dialog's cancel) leaves it paused.
  h.run("mission.paused = true;");
  const press = h.key("Escape");
  assert.equal(h.open(), true, "Escape with nothing else to close opens the menu");
  assert.equal(press.defaultPrevented, true, "so the browser does not close the menu with the same key press");
  h.dispatch("pause-menu", "cancel");
  assert.equal(h.open(), false);
  assert.equal(h.json("mission.paused"), true);
});

test("Escape still closes the drop panel, placement and Clean view before it opens the menu", () => {
  const h = page();
  h.run("openDropPanel();");
  h.key("Escape");
  assert.equal(h.open(), false);
  assert.equal(h.nodes.get("drop-panel").hidden, true);
  h.run("setCleanView(true);");
  h.key("Escape");
  assert.equal(h.open(), false);
  assert.equal(h.json("mission.cleanView"), false);
  h.key("Escape");
  assert.equal(h.open(), true);
});

test("Sound and speed change from the menu, and the guide opens from it", async () => {
  const h = page();
  await h.click("menu-button");
  const before = h.nodes.get("pause-sound").textContent;
  await h.click("pause-sound");
  assert.notEqual(h.nodes.get("pause-sound").textContent, before);
  assert.equal(h.nodes.get("sound-button").textContent, h.nodes.get("pause-sound").textContent);
  await h.click("pause-speed");
  assert.equal(h.nodes.get("pause-speed").textContent, "Speed 2×");
  assert.equal(h.json("mission.speed"), 2);
  await h.click("pause-guide");
  assert.equal(h.open(), false);
  assert.equal(h.nodes.get("guide-dialog").open, true);
  assert.equal(h.json("mission.paused"), true, "the battle waits while the guide is open");
  // Closing the guide returns to the menu, which still remembers the battle was running.
  h.nodes.get("guide-dialog").open = false;
  h.dispatch("guide-dialog", "close");
  assert.equal(h.open(), true);
  await h.click("pause-resume");
  assert.equal(h.json("mission.paused"), false);
});

test("Quit to the galaxy keeps the battle saved, and the galaxy offers to resume it", async () => {
  const h = page();
  await h.click("menu-button");
  const time = h.json("mission.battle.time");
  await h.click("pause-quit");
  assert.equal(h.json("mission"), null);
  assert.equal(h.json("current"), "galaxy");
  const saved = JSON.parse(h.data.get(SAVE_KEY)).activeMission;
  assert.equal(saved.battle.planetId, "kepra");
  assert.equal(saved.battle.time, time);
  assert.match(h.nodes.get("planet-panel").innerHTML, /id="galaxy-resume"[^>]*>Resume battle · Kepra</);
  h.run("startMission(planetById(savedMission.battle.planetId), savedMission);");
  assert.equal(h.json("mission.battle.time"), time);
  assert.equal(h.json("mission.paused"), true, "a resumed battle starts paused");
});

test("Restart records the attempt as a retreat and starts a fresh battle; cancelling goes back to the menu", async () => {
  const h = page();
  const played = h.json("progress.stats.missionsPlayed");
  await h.click("menu-button");
  await h.confirmAction("pause-restart", false);
  assert.equal(h.open(), true, "back to the menu");
  assert.ok(h.json("mission.battle.time") > 19);
  await h.confirmAction("pause-restart", true);
  assert.equal(h.json("mission.battle.time"), 0);
  assert.equal(h.json("mission.battle.outcome"), null);
  assert.equal(h.json("progress.stats.missionsPlayed"), played + 1);
  assert.equal(h.nodes.get("debrief").open, false, "no debrief in between");
  assert.equal(h.open(), false);
  assert.ok(h.nodes.get("toasts").children.some(t => /Kepra restarted\. The last attempt was recorded as a retreat\./.test(t.textContent)));
});
