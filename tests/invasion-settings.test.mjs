// Settings (CTRL-10): camera speed, invert drag, UI size and key rebinding. They are kept on this
// device apart from the campaign save, checked field by field when they load, and every key label
// in the game follows the bindings.
import test from "node:test";
import assert from "node:assert/strict";
import { SETTINGS_KEY, keyActions, createSettings, validSettings, bindKey, resetKeys, actionFor, bindable, keyName, fillKeys } from "../dist/invasion/settings.mjs";
import { fieldGuide } from "../dist/invasion/field-guide.mjs";
import { SAVE_KEY } from "../dist/invasion/campaign.mjs";
import { harness } from "./helpers/invasion-ui-harness.mjs";

test("Saved settings are checked field by field; a key is never used twice", () => {
  const defaults = createSettings();
  assert.deepEqual(validSettings(null), defaults);
  assert.deepEqual(validSettings({ cameraSpeed: 7, invertDrag: "yes", uiScale: 3, keys: [] }), defaults);
  const kept = validSettings({ cameraSpeed: 1.5, invertDrag: true, uiScale: 1.3, keys: { hold: "k", pause: "home" } });
  assert.deepEqual([kept.cameraSpeed, kept.invertDrag, kept.uiScale], [1.5, true, 1.3]);
  assert.equal(kept.keys.hold, "k");
  assert.equal(kept.keys.pause, "home");
  assert.equal(kept.keys.resetView, null, "Reset view's default went to Pause, so it has no key");
  // Reserved, unknown and repeated keys fall back.
  const odd = validSettings({ keys: { forward: "enter", back: "5", left: "W", hold: "q", turnLeft: "q", nonsense: "n" } });
  assert.equal(odd.keys.forward, "w");
  assert.equal(odd.keys.back, "s");
  assert.equal(odd.keys.left, "a");
  // Two saved actions on Q: Turn left, listed first, keeps it; Hold goes back to H.
  assert.equal(odd.keys.turnLeft, "q");
  assert.equal(odd.keys.hold, "h");
  assert.equal(Object.hasOwn(odd.keys, "nonsense"), false);
  const used = Object.values(validSettings({ keys: { drop: "h", hold: "b" } }).keys).filter(Boolean);
  assert.equal(new Set(used).size, used.length);
  for (const key of ["enter", "escape", "tab", "shift", "0", "7", "arrowup", "pageup", "+", "-", "=", "f5", "B"]) assert.equal(bindable(key), false, key);
  for (const key of ["k", " ", "home", "delete", ";", "é"]) assert.equal(bindable(key), true, key);
});

test("Binding a key in use swaps the two; the guide and tutorial name the new keys", () => {
  const swap = bindKey(createSettings(), "hold", "b");
  assert.equal(swap.swapped, "drop");
  assert.equal(swap.settings.keys.hold, "b");
  assert.equal(swap.settings.keys.drop, "h");
  assert.equal(actionFor(swap.settings, "b"), "hold");
  assert.equal(bindKey(createSettings(), "hold", "enter"), null);
  assert.equal(bindKey(createSettings(), "nothing", "k"), null);
  assert.deepEqual(resetKeys(swap.settings).keys, createSettings().keys);
  assert.equal(keyName(" "), "Space");
  assert.equal(keyName(null), "none");
  assert.equal(fillKeys("Press {drop}; {turnLeft}/{turnRight}; {other}", swap.settings.keys), "Press H; Q/E; {other}");
  const controls = (keys) => fieldGuide(keys).find(s => s.section === "Controls").items.flatMap(item => item.facts);
  assert.ok(controls().includes("W A S D or the arrow keys pan; Q and E turn; R and F tilt; Z and X (or the wheel) zoom"));
  assert.ok(controls().includes("H holds the selected squads where they are"));
  const moved = bindKey(bindKey(createSettings(), "forward", "i").settings, "pause", "k").settings;
  assert.ok(controls(moved.keys).includes("I A S D or the arrow keys pan; Q and E turn; R and F tilt; Z and X (or the wheel) zoom"));
  assert.ok(controls(moved.keys).includes("K pauses and resumes; M changes the sound"));
  assert.equal(keyActions.length, new Set(keyActions.map(a => a.key)).size, "the defaults never clash");
});

function page(saved) {
  const h = harness(null, { renderer: true }), style = {};
  if (saved) h.data.set(SETTINGS_KEY, JSON.stringify(saved));
  h.context.document.documentElement = { style: { setProperty: (name, value) => { style[name] = value; } } };
  h.start();
  h.style = style;
  h.key = (k, extra = {}) => h.dispatch("window", "keydown", { key: k, target: { closest: () => null }, ...extra });
  h.press = (k, extra = {}) => h.dispatch("settings-dialog", "keydown", { key: k, stopPropagation() {}, ...extra });
  h.keyButton = (id) => h.nodes.get("settings-keys").children.flatMap(row => row.children || []).find(n => n.dataset?.action === id);
  h.mission = () => h.run(`startMission(planetById('kepra')); closeDropPanel(); scene.unload = () => {}; mission.paused = false;`);
  return h;
}

test("Rebinding in the settings saves, relabels the game and changes what the keys do", async () => {
  const h = page(), campaign = h.data.get(SAVE_KEY);
  assert.equal(h.style["--ui-scale"], "1");
  await h.click("settings-button");
  assert.equal(h.nodes.get("settings-dialog").open, true);
  assert.equal(h.keyButton("pause").textContent, "Space");
  await h.keyButton("pause").click();
  assert.equal(h.keyButton("pause").textContent, "Press a key…");
  // A reserved key is refused and the action keeps waiting; Escape cancels without closing.
  const enter = h.press("Enter");
  assert.equal(enter.defaultPrevented, true);
  assert.match(h.nodes.get("settings-note").textContent, /^That key keeps its own job/);
  h.press("Escape");
  assert.equal(h.nodes.get("settings-dialog").open, true);
  assert.equal(h.keyButton("pause").textContent, "Space");
  assert.equal(h.nodes.get("settings-note").textContent, "Pause keeps Space.");
  // K for pause; then H for pause takes it from Hold, which gets K.
  await h.keyButton("pause").click();
  h.press("k");
  assert.equal(h.keyButton("pause").textContent, "K");
  await h.keyButton("pause").click();
  h.press("H", { shiftKey: true });
  assert.equal(h.nodes.get("settings-note").textContent, "Pause: H. Hold position moved to K.");
  assert.deepEqual(JSON.parse(h.data.get(SETTINGS_KEY)).keys.pause, "h");
  assert.equal(h.data.get(SAVE_KEY), campaign, "the campaign save is untouched");
  assert.equal(h.nodes.get("pause-button").title, "Pause (H)");
  assert.equal(h.nodes.get("hold-button").title, "Stop and hold position (K)");
  await h.click("settings-close");
  h.mission();
  h.key(" ");
  assert.equal(h.json("mission.paused"), false, "Space no longer pauses");
  h.key("h");
  assert.equal(h.json("mission.paused"), true, "H pauses now");
  h.run("showFieldGuide()");
  assert.match(h.nodes.get("guide-body").innerHTML, /H pauses and resumes/);
  assert.match(h.nodes.get("guide-body").innerHTML, /K holds the selected squads/);
  // Default keys puts everything back.
  await h.click("settings-button");
  await h.click("settings-reset-keys");
  assert.equal(h.keyButton("pause").textContent, "Space");
  assert.equal(JSON.parse(h.data.get(SETTINGS_KEY)).keys.hold, "h");
});

test("Camera speed, invert drag and UI size load from the device and change the camera and HUD", async () => {
  const h = page({ cameraSpeed: 2, invertDrag: true, uiScale: 1.15, keys: { forward: "i" } });
  assert.equal(h.style["--ui-scale"], "1.15");
  h.mission();
  assert.deepEqual(h.json("dragged(10, -4)"), [-20, 8], "twice as fast, the other way");
  // Keyboard panning uses the bound key and the camera speed.
  const step = (key, speed) => h.json(`(() => { settings = { ...settings, cameraSpeed: ${speed} }; const cam = mission.cam, { centerX, centerZ } = mission.battle.map;
    cam.focus = { x: centerX, z: centerZ }; cam.yaw = 0;
    keys.clear(); keys.add(${JSON.stringify(key)}); keyboardCamera(0.1); keys.clear(); return Math.hypot(cam.focus.x - centerX, cam.focus.z - centerZ); })()`);
  assert.equal(step("w", 1), 0, "W no longer pans forward");
  const slow = step("i", 1), fast = step("i", 2);
  assert.ok(slow > 0);
  assert.ok(Math.abs(fast - 2 * slow) < 1e-6, `${fast} vs ${slow}`);
  assert.ok(step("arrowup", 1) > 0, "the arrow keys always pan");
  await h.click("settings-button");
  assert.equal(h.nodes.get("settings-camera").textContent, "Camera speed 1×");
  await h.click("settings-camera");
  assert.equal(h.nodes.get("settings-camera").textContent, "Camera speed 1.5×");
  await h.click("settings-invert");
  assert.equal(h.nodes.get("settings-invert").textContent, "Invert drag: Off");
  await h.click("settings-ui");
  assert.equal(h.nodes.get("settings-ui").textContent, "UI size 130%");
  assert.equal(h.style["--ui-scale"], "1.3");
  assert.deepEqual(JSON.parse(h.data.get(SETTINGS_KEY)), { ...createSettings(), cameraSpeed: 1.5, uiScale: 1.3, keys: { ...createSettings().keys, forward: "i" } });
  // Storage that fails keeps the change for this visit and says so.
  h.run(`localStorage.setItem = () => { throw new Error('quota'); }`);
  await h.click("settings-ui");
  assert.equal(h.nodes.get("settings-ui").textContent, "UI size 85%");
  assert.match(h.nodes.get("settings-note").textContent, /could not be saved/);
});

test("More settings in the pause menu keeps the battle paused and returns to the menu", async () => {
  const h = page();
  h.mission();
  await h.click("menu-button");
  await h.click("pause-settings-button");
  assert.equal(h.nodes.get("pause-menu").open, false);
  assert.equal(h.nodes.get("settings-dialog").open, true);
  assert.equal(h.json("mission.paused"), true);
  await h.click("settings-close");
  h.dispatch("settings-dialog", "close");
  assert.equal(h.nodes.get("pause-menu").open, true);
  await h.click("pause-resume");
  assert.equal(h.json("mission.paused"), false);
});
