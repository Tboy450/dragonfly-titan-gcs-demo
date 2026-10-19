// Swarmfall entry point: the title, the campaign galaxy, the mission screen (camera, selection,
// orders, drops, HUD, minimap) and the debrief. Game rules live in battle.mjs and campaign.mjs;
// this file only reads them, sends player commands and draws the page.
import {
  planets, planetById, createProgress, validProgress, SAVE_KEY, isPlanetUnlocked, nextPlanet,
  applyMissionResult, missionMatter,
} from "./campaign.mjs?v=dev";
import {
  createBattle, stepBattle, requestDrop, checkDrop, orderAt, orderSquads, orderHold, battleSummary,
  objectiveStatus, starsEarned, missionResult, retreat, publicMood, dropZoneAt,
} from "./battle.mjs?v=dev";
import { droneTypes, droneOrder, defenderTypes, societies, threatNames, payloadSlots, payloadCost } from "./units.mjs?v=dev";
import { hazardTypes, hazardAdvisory } from "./hazards.mjs?v=dev";
import { achievements, achievementContext, newAchievements, recordAchievements } from "./achievements.mjs?v=dev";
import { createPlanetTerrain } from "./planet-terrain.mjs?v=dev";
import { drawGalaxy, drawStarfield } from "./galaxy.mjs?v=dev";
import { createInvasionScene, swarmColor, nativeColor } from "./scene.mjs?v=dev";
import { missionCheckpoint, validMissionCheckpoint, restoreMissionCheckpoint } from "./mission-save.mjs?v=dev";

const $ = (id) => document.getElementById(id);
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
const isDrone = (unit) => unit.alive && unit.side === "swarm" && !unit.structure;

// ---- Saved progress ----
function loadProgress() {
  try { return validProgress(JSON.parse(localStorage.getItem(SAVE_KEY) || "null")) || createProgress(); } catch { return createProgress(); }
}
function saveProgress() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...progress, activeMission: savedMission }));
    return true;
  } catch { return false; }
}
let progress = loadProgress();
let savedMission = null;
try { savedMission = validMissionCheckpoint(JSON.parse(localStorage.getItem(SAVE_KEY) || "null")?.activeMission); } catch { /* unavailable storage or old save */ }

// ---- Screens ----
let current = "title";
function show(name) {
  current = name;
  for (const screen of document.querySelectorAll(".screen")) screen.classList.toggle("active", screen.id === `screen-${name}`);
  if (name === "title") drawTitle();
  if (name === "galaxy") { galaxyCache = null; renderPlanetPanel(); }
}

function fitCanvas(canvas, scale = Math.min(2, window.devicePixelRatio || 1)) {
  const width = canvas.clientWidth, height = canvas.clientHeight;
  if (canvas.width !== Math.round(width * scale) || canvas.height !== Math.round(height * scale)) {
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  return { ctx, width, height };
}

function drawTitle() {
  const { ctx, width, height } = fitCanvas($("title-stars"));
  drawStarfield(ctx, width, height, { center: [0.5, 0.55] });
  const done = planets.filter(p => progress.captured[p.id]).length;
  const earned = Object.keys(progress.achievements).length;
  $("title-progress").textContent = done || earned ? `${done} of ${planets.length} planets conquered · ${earned} of ${achievements.length} achievements` : "";
  $("play-button").textContent = done || progress.stats.missionsPlayed ? "Continue campaign" : "Play campaign";
  $("resume-button").hidden = !savedMission;
  $("resume-button").textContent = savedMission ? `Resume mission · ${planetById(savedMission.battle.planetId).name}` : "Resume mission";
}

// ---- Galaxy ----
let selectedPlanet = nextPlanet(progress).id;
let galaxySpots = [];
let galaxyCache = null;

function drawGalaxyScreen(time) {
  const canvas = $("galaxy-canvas");
  const { ctx, width, height } = fitCanvas(canvas);
  if (!galaxyCache || galaxyCache.width !== canvas.width) {
    galaxyCache = document.createElement("canvas");
    galaxyCache.width = canvas.width; galaxyCache.height = canvas.height;
    const cacheCtx = galaxyCache.getContext("2d");
    cacheCtx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    drawStarfield(cacheCtx, width, height);
  }
  // The planets spread over the space the planet panel leaves free: left of it on a wide
  // screen, above it on a phone (where the panel is a bottom sheet).
  const narrow = width <= 720;
  const area = narrow ? { x: 0, y: 44, width, height: height * 0.48 - 30 } : { x: 0, y: 40, width: width - 390, height: height - 40 };
  galaxySpots = drawGalaxy(ctx, width, height, progress, { selected: selectedPlanet, time, cache: galaxyCache, area });
}

$("galaxy-canvas").addEventListener("click", (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left, y = event.clientY - rect.top;
  const hit = galaxySpots.map(s => ({ ...s, d: Math.hypot(s.x - x, s.y - y) })).filter(s => s.d < s.r).sort((a, b) => a.d - b.d)[0];
  if (hit) { selectedPlanet = hit.id; renderPlanetPanel(); }
});

function renderPlanetPanel() {
  const planet = planetById(selectedPlanet) || planets[0];
  const society = societies[planet.society];
  const open = isPlanetUnlocked(progress, planet);
  const previous = planets.find(p => p.order === planet.order - 1);
  const stars = progress.stars[planet.id] || 0;
  const best = progress.bestTime[planet.id];
  const reward = [`+${planet.reward.matter} matter`];
  if (planet.reward.unlock) reward.push(`${droneTypes[planet.reward.unlock].name} drones`);
  if (planet.reward.podSlots) reward.push(`+${planet.reward.podSlots} pod slots`);
  const defenders = society.tier === 0 ? "None." : `${defenderTypes[society.militia].name}s; ${society.structures.map(t => defenderTypes[t].name.toLowerCase()).join(", ")}.`;
  $("planet-panel").innerHTML = `
    <h3>${escapeHtml(planet.name)}</h3>
    <p class="subtitle">${escapeHtml(planet.subtitle)}${planet.practice ? " · practice" : ""}</p>
    <div class="badges">
      <span class="badge">Society: ${escapeHtml(society.name)} (level ${society.tier})</span>
      <span class="badge threat">Threat: ${threatNames[planet.threat]} <span class="pips">${"●".repeat(planet.threat)}${"○".repeat(5 - planet.threat)}</span></span>
    </div>
    <p>${escapeHtml(planet.description)}</p>
    <p class="section-title">Environmental threats</p>
    <ul class="hazard-list">${planet.hazards.map(h => `<li><strong>${escapeHtml(hazardTypes[h].name)}</strong><small>${escapeHtml(hazardTypes[h].advice)}</small></li>`).join("")}</ul>
    <p class="section-title">Defenders</p>
    <p>${escapeHtml(defenders)} ${escapeHtml(society.description)}</p>
    <p class="section-title">Objectives</p>
    <ul class="objective-list"><li>Hold ${planet.required} zones (wins the planet, ★)</li>${planet.objectives.map(o => `<li>☆ ${escapeHtml(o.text)}</li>`).join("")}</ul>
    <p class="section-title">Reward for conquest</p>
    <p>${escapeHtml(reward.join(" · "))}</p>
    ${progress.captured[planet.id] ? `<p class="section-title">Your record</p><p>${"★".repeat(stars)}${"☆".repeat(3 - stars)}${best ? ` · best time ${clock(best)}` : ""}</p>` : ""}
    ${open ? `<p class="section-title">Supply for this attempt</p><p>${missionMatter(progress, planet)} matter · pods carry ${progress.podSlots} slots</p>
      <button id="invade-button" class="primary invade" type="button">${progress.captured[planet.id] ? "Invade again" : `Invade ${escapeHtml(planet.name)}`}</button>`
      : `<p class="locked-note">Locked. Conquer ${escapeHtml(previous?.name || "the previous planet")} first.</p>`}
  `;
  $("invade-button")?.addEventListener("click", async () => {
    if (savedMission && !await confirmDialog("Start a new mission and replace your saved battle? Campaign progress will be kept.")) return;
    startMission(planet);
  });
  $("bank-matter").textContent = progress.matter;
  $("bank-pod").textContent = progress.podSlots;
  $("bank-drones").textContent = progress.unlocks.map(t => droneTypes[t].name).join(", ");
  $("achievement-count").textContent = `${Object.keys(progress.achievements).length}/${achievements.length}`;
}

// ---- Dialogs ----
function confirmDialog(text) {
  return new Promise((resolve) => {
    const dialog = $("confirm-dialog");
    $("confirm-text").textContent = text;
    const done = (answer) => { dialog.close(); $("confirm-yes").onclick = $("confirm-no").onclick = null; resolve(answer); };
    $("confirm-yes").onclick = () => done(true);
    $("confirm-no").onclick = () => done(false);
    dialog.onclose = () => resolve(false);
    dialog.showModal();
  });
}

function showAchievements() {
  $("achievement-list").innerHTML = achievements.map(a => {
    const at = progress.achievements[a.id];
    return `<li class="${at ? "earned" : ""}"><strong>${at ? "🏆 " : ""}${escapeHtml(a.name)}</strong><small>${escapeHtml(a.text)}${at ? ` · earned ${new Date(at).toLocaleDateString()}` : ""}</small></li>`;
  }).join("");
  $("achievements-dialog").showModal();
}

$("play-button").addEventListener("click", () => { selectedPlanet = nextPlanet(progress).id; show("galaxy"); });
$("resume-button").addEventListener("click", () => {
  if (savedMission) startMission(planetById(savedMission.battle.planetId), savedMission);
});
$("reset-button").addEventListener("click", async () => {
  if (await confirmDialog("Erase all campaign progress, unlocks and achievements on this device?")) {
    progress = createProgress();
    savedMission = null;
    saveProgress();
    selectedPlanet = nextPlanet(progress).id;
    drawTitle();
  }
});
$("galaxy-back").addEventListener("click", () => show("title"));
$("achievements-button").addEventListener("click", showAchievements);
$("achievements-close").addEventListener("click", () => $("achievements-dialog").close());

// ---- Mission ----
let scene = null;
let mission = null;
const overlay = $("mission-overlay");

function ensureScene() {
  if (scene) return scene;
  try {
    scene = createInvasionScene($("mission-canvas"));
  } catch (error) {
    console.error(error);
    $("no-webgl").hidden = false;
    scene = null;
  }
  return scene;
}

function defaultPayload(b) {
  const want = b.practice ? { scout: 6, link: 3 } : { striker: 3, link: 2, scout: 4 };
  const payload = {};
  for (const type of droneOrder) {
    if (!b.unlocks.includes(type) || !want[type]) continue;
    for (let i = 0; i < want[type]; i += 1) {
      const next = { ...payload, [type]: (payload[type] || 0) + 1 };
      if (payloadSlots(next) > b.podSlots || payloadCost(next) > b.matter) break;
      payload[type] = next[type];
    }
  }
  return payload;
}

function startMission(planet, checkpoint = null) {
  if (!ensureScene()) return;
  $("debrief").open && $("debrief").close();
  const terrain = createPlanetTerrain(planet);
  const restored = checkpoint ? restoreMissionCheckpoint(checkpoint, terrain) : null;
  if (checkpoint && !restored) return;
  const battle = restored?.battle || createBattle(planet, {
    matter: missionMatter(progress, planet), unlocks: progress.unlocks, podSlots: progress.podSlots, terrain, seed: planet.seed,
  });
  scene.load(planet, terrain, battle);
  const home = battle.zones.find(z => z.kind === "beachhead");
  const away = { x: home.x - battle.map.centerX, z: home.z - battle.map.centerZ };
  const length = Math.hypot(away.x, away.z) || 1;
  mission = {
    planet, battle, terrain,
    cam: restored?.cam || { focus: { x: home.x - away.x / length * 70, z: home.z - away.z / length * 70 }, distance: 230, yaw: Math.atan2(away.x, away.z), pitch: 0.9 },
    selected: new Set(), speed: 1, paused: !!restored, payload: defaultPayload(battle), placing: false,
    seenLog: new WeakSet(), ended: false, lastHud: 0, lastMinimap: 0, lastAchievements: 0, cards: new Map(), dropTypes: "",
  };
  $("squad-bar").replaceChildren();
  $("toasts").replaceChildren();
  $("hud-log").replaceChildren();
  $("drop-rows").replaceChildren();
  $("placement-hint").hidden = true;
  $("pause-button").textContent = mission.paused ? "Resume" : "Pause";
  $("speed-button").textContent = "1×";
  show("mission");
  resizeMission();
  openDropPanel();
  updateHud();
  checkpointMission();
  if (restored) toast("Mission restored and paused. Press Resume when ready.", "info", 6000);
}

function checkpointMission() {
  if (!mission || mission.battle.outcome) return;
  savedMission = missionCheckpoint(mission);
  if (!saveProgress() && !mission.saveWarning) {
    mission.saveWarning = true;
    toast("Browser storage is unavailable. This mission cannot be saved on this device.", "warn", 7000);
  }
}
setInterval(checkpointMission, 5000);
window.addEventListener("pagehide", checkpointMission);
document.addEventListener("visibilitychange", () => { if (document.hidden) checkpointMission(); });

function resizeMission() {
  if (!scene) return;
  const canvas = $("mission-canvas");
  scene.resize(canvas.clientWidth, canvas.clientHeight);
  fitCanvas(overlay);
  fitCanvas($("minimap"));
}
window.addEventListener("resize", () => {
  if (current === "mission") resizeMission();
  if (current === "title") drawTitle();
  galaxyCache = null;
});

// ---- Camera ----
const keys = new Set();
function clampCamera() {
  const { cam, battle } = mission;
  const { centerX, centerZ, half } = battle.map;
  cam.focus.x = Math.min(centerX + half * 1.1, Math.max(centerX - half * 1.1, cam.focus.x));
  cam.focus.z = Math.min(centerZ + half * 1.1, Math.max(centerZ - half * 1.1, cam.focus.z));
  cam.distance = Math.min(750, Math.max(35, cam.distance));
  cam.pitch = Math.min(1.45, Math.max(0.3, cam.pitch));
}
function pan(dx, dy) {
  const cam = mission.cam, k = cam.distance * 0.0021;
  const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
  cam.focus.x += (-rx * dx + fx * dy) * k;
  cam.focus.z += (-rz * dx + fz * dy) * k;
  clampCamera();
}
function keyboardCamera(dt) {
  if (!keys.size) return;
  const cam = mission.cam, step = cam.distance * 1.1 * dt / 0.0021 / cam.distance;
  if (keys.has("w") || keys.has("arrowup")) pan(0, step);
  if (keys.has("s") || keys.has("arrowdown")) pan(0, -step);
  if (keys.has("a") || keys.has("arrowleft")) pan(step, 0);
  if (keys.has("d") || keys.has("arrowright")) pan(-step, 0);
  if (keys.has("q")) cam.yaw -= 1.3 * dt;
  if (keys.has("e")) cam.yaw += 1.3 * dt;
  if (keys.has("r")) cam.pitch += 0.8 * dt;
  if (keys.has("f")) cam.pitch -= 0.8 * dt;
  if (keys.has("z") || keys.has("-")) cam.distance *= 1 + 1.2 * dt;
  if (keys.has("x") || keys.has("=") || keys.has("+")) cam.distance /= 1 + 1.2 * dt;
  clampCamera();
}

const pointers = new Map();
let gesture = null;
function pinchState() {
  const [a, b] = [...pointers.values()];
  return { dist: Math.hypot(a.x - b.x, a.y - b.y), angle: Math.atan2(b.y - a.y, b.x - a.x), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
overlay.addEventListener("pointerdown", (event) => {
  if (!mission) return;
  overlay.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointers.size === 1) {
    gesture = { x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, moved: false, rotate: event.button === 2 || event.altKey || event.ctrlKey, shift: event.shiftKey || event.metaKey };
  } else if (pointers.size === 2 && gesture) {
    gesture.moved = true;
    gesture.pinch = pinchState();
  }
});
overlay.addEventListener("pointermove", (event) => {
  if (!mission || !pointers.has(event.pointerId)) return;
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointers.size >= 2 && gesture?.pinch) {
    const now = pinchState(), before = gesture.pinch;
    mission.cam.distance *= before.dist / Math.max(10, now.dist);
    mission.cam.yaw -= now.angle - before.angle;
    pan(now.x - before.x, now.y - before.y);
    gesture.pinch = now;
    return;
  }
  if (!gesture) return;
  const dx = event.clientX - gesture.lastX, dy = event.clientY - gesture.lastY;
  if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 8) gesture.moved = true;
  if (gesture.moved) {
    if (gesture.rotate) { mission.cam.yaw -= dx * 0.006; mission.cam.pitch += dy * 0.004; clampCamera(); } else pan(dx, dy);
  }
  gesture.lastX = event.clientX; gesture.lastY = event.clientY;
});
const endPointer = (event) => {
  if (!pointers.has(event.pointerId)) return;
  pointers.delete(event.pointerId);
  if (pointers.size === 0) {
    if (gesture && !gesture.moved && event.type === "pointerup") tap(event.clientX, event.clientY, gesture.shift);
    gesture = null;
  } else if (gesture) gesture.pinch = null;
};
overlay.addEventListener("pointerup", endPointer);
overlay.addEventListener("pointercancel", endPointer);
overlay.addEventListener("contextmenu", (event) => event.preventDefault());
overlay.addEventListener("wheel", (event) => {
  if (!mission) return;
  event.preventDefault();
  mission.cam.distance *= Math.exp(event.deltaY * 0.0012);
  clampCamera();
}, { passive: false });

// ---- Selection and orders ----
function screenPoint(x, y) {
  const rect = overlay.getBoundingClientRect();
  return { x: x - rect.left, y: y - rect.top, width: rect.width, height: rect.height };
}

function unitAtScreen(x, y, filter, reach = 24) {
  const { width, height } = screenPoint(0, 0);
  let best = null, bestD = reach;
  for (const unit of mission.battle.units) {
    if (!filter(unit)) continue;
    const p = scene.project(unit.x, scene.unitTop(unit) - (unit.structure ? 5 : 2), unit.z, width, height);
    if (!p.visible) continue;
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < bestD) { bestD = d; best = unit; }
  }
  return best;
}

function tap(clientX, clientY, additive) {
  const b = mission.battle;
  const { x, y, width, height } = screenPoint(clientX, clientY);
  if (mission.placing) {
    const ground = scene.pickGround(x / width * 2 - 1, -(y / height) * 2 + 1);
    if (!ground) return;
    if (!dropZoneAt(b, ground.x, ground.z)) { toast("Pods can only land inside a zone you hold (cyan ring).", "warn"); return; }
    launch(ground.x, ground.z);
    return;
  }
  const drone = unitAtScreen(x, y, isDrone);
  if (drone) {
    selectSquad(drone.squad, additive);
    return;
  }
  if (!mission.selected.size) {
    toast("Select a squad first: tap a squad card below or one of your drones.", "warn");
    return;
  }
  const enemy = unitAtScreen(x, y, u => u.alive && u.side === "native", 22);
  if (enemy) {
    orderSquads(b, [...mission.selected], { kind: "attack", target: enemy.id, x: enemy.x, z: enemy.z });
    return;
  }
  const ground = scene.pickGround(x / width * 2 - 1, -(y / height) * 2 + 1);
  if (ground) orderAt(b, [...mission.selected], ground.x, ground.z);
}

function selectSquad(id, additive = false) {
  const selected = mission.selected;
  if (additive) { if (selected.has(id)) selected.delete(id); else selected.add(id); } else if (selected.size === 1 && selected.has(id)) selected.clear(); else { selected.clear(); selected.add(id); }
  updateSquadBar();
}

function selectAll() {
  const summary = battleSummary(mission.battle);
  mission.selected = new Set(summary.squads.filter(s => s.size > 0).map(s => s.id));
  updateSquadBar();
}

function focusSquad(id) {
  const drones = mission.battle.units.filter(u => isDrone(u) && u.squad === id);
  if (!drones.length) return;
  mission.cam.focus.x = drones.reduce((s, u) => s + u.x, 0) / drones.length;
  mission.cam.focus.z = drones.reduce((s, u) => s + u.z, 0) / drones.length;
  clampCamera();
}

$("all-button").addEventListener("click", selectAll);
$("hold-button").addEventListener("click", () => { if (mission?.selected.size) orderHold(mission.battle, [...mission.selected]); });
$("squad-bar").addEventListener("click", (event) => {
  const card = event.target.closest("[data-squad]");
  if (card) selectSquad(Number(card.dataset.squad), event.shiftKey || event.ctrlKey || event.metaKey);
});
$("squad-bar").addEventListener("dblclick", (event) => {
  const card = event.target.closest("[data-squad]");
  if (card) focusSquad(Number(card.dataset.squad));
});

// ---- Drops ----
function openDropPanel() {
  $("drop-panel").hidden = false;
  updateDropPanel(true);
}
function closeDropPanel() { $("drop-panel").hidden = true; }
$("drop-button").addEventListener("click", () => ($("drop-panel").hidden ? openDropPanel() : closeDropPanel()));
$("drop-close").addEventListener("click", closeDropPanel);

function updateDropPanel(rebuild = false) {
  if (!mission || $("drop-panel").hidden) return;
  const b = mission.battle;
  const types = droneOrder.filter(t => b.unlocks.includes(t));
  if (rebuild || mission.dropTypes !== types.join()) {
    mission.dropTypes = types.join();
    $("drop-rows").innerHTML = types.map(type => {
      const d = droneTypes[type];
      return `<div class="drop-row" data-type="${type}">
        <span class="name">${escapeHtml(d.name)}</span>
        <span class="meta">${d.cost} matter · ${d.slots} slot${d.slots > 1 ? "s" : ""}${d.limit ? ` · max ${d.limit}` : ""} · ${escapeHtml(d.role)}</span>
        <span class="stepper"><button type="button" data-step="-1" aria-label="One fewer ${escapeHtml(d.name)}">−</button><output>0</output><button type="button" data-step="1" aria-label="One more ${escapeHtml(d.name)}">+</button></span>
      </div>`;
    }).join("");
  }
  for (const row of $("drop-rows").querySelectorAll(".drop-row")) row.querySelector("output").textContent = mission.payload[row.dataset.type] || 0;
  const slots = payloadSlots(mission.payload), cost = payloadCost(mission.payload);
  $("drop-summary").textContent = `Slots ${slots}/${b.podSlots} · cost ${cost} of ${Math.floor(b.matter)} matter`;
  const check = checkDrop(b, { payload: mission.payload });
  $("drop-reason").textContent = check.ok ? "" : check.reason;
  $("drop-home").disabled = !check.ok;
  $("drop-pick").disabled = !check.ok;
}

$("drop-rows").addEventListener("click", (event) => {
  const button = event.target.closest("[data-step]");
  if (!button || !mission) return;
  const type = button.closest("[data-type]").dataset.type;
  const next = Math.max(0, (mission.payload[type] || 0) + Number(button.dataset.step));
  mission.payload = { ...mission.payload, [type]: next };
  updateDropPanel();
});

function launch(x, z) {
  const result = requestDrop(mission.battle, { x, z, payload: mission.payload });
  if (!result.ok) { toast(result.reason, "warn"); return; }
  mission.placing = false;
  $("placement-hint").hidden = true;
  closeDropPanel();
}
$("drop-home").addEventListener("click", () => {
  const home = mission.battle.zones.find(z => z.kind === "beachhead");
  launch(home.x, home.z);
});
$("drop-pick").addEventListener("click", () => {
  mission.placing = true;
  closeDropPanel();
  $("placement-hint").hidden = false;
});
$("placement-cancel").addEventListener("click", () => { mission.placing = false; $("placement-hint").hidden = true; });

// ---- Pause, speed, retreat ----
$("pause-button").addEventListener("click", () => { if (mission) mission.paused = !mission.paused; updateHud(); });
$("speed-button").addEventListener("click", () => { if (mission) { mission.speed = mission.speed % 3 + 1; updateHud(); } });
$("retreat-button").addEventListener("click", async () => {
  if (!mission || mission.battle.outcome) return;
  const wasPaused = mission.paused;
  mission.paused = true;
  if (await confirmDialog("Retreat? The surviving drones return to the Hive and half their cost comes back as matter.")) retreat(mission.battle);
  else mission.paused = wasPaused;
});
document.addEventListener("visibilitychange", () => { if (document.hidden && mission && !mission.battle.outcome) { mission.paused = true; updateHud(); } });

window.addEventListener("keydown", (event) => {
  if (current !== "mission" || !mission || event.target.closest?.("input, textarea") || document.querySelector("dialog[open]")) return;
  const key = event.key.toLowerCase();
  if (key === " ") { mission.paused = !mission.paused; updateHud(); event.preventDefault(); return; }
  if (key === "escape") { mission.placing = false; $("placement-hint").hidden = true; closeDropPanel(); return; }
  if (key === "b") { $("drop-panel").hidden ? openDropPanel() : closeDropPanel(); return; }
  if (key === "h") { if (mission.selected.size) orderHold(mission.battle, [...mission.selected]); return; }
  if (key === "0") { selectAll(); return; }
  if (/^[1-9]$/.test(key)) {
    const squads = battleSummary(mission.battle).squads.filter(s => s.size > 0 || s.inbound);
    const squad = squads[Number(key) - 1];
    if (squad) selectSquad(squad.id, event.shiftKey);
    return;
  }
  keys.add(key);
  if (key.startsWith("arrow")) event.preventDefault();
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener("blur", () => keys.clear());

// ---- HUD ----
function toast(text, tone = "info", ms = 3600) {
  const box = $("toasts");
  const item = document.createElement("div");
  item.className = `toast ${tone}`;
  item.textContent = text;
  box.append(item);
  while (box.children.length > 4) box.firstElementChild.remove();
  setTimeout(() => item.remove(), ms);
}

function coachText(b) {
  if (!b.practice) return "";
  if (b.stats.drops === 0) return "Press Drop pod, choose a few Scouts and Links, then land them on the Hive beacon.";
  if (!b.units.some(isDrone)) return "The pod is coming down under its parachute. The drones are released just above the ground.";
  if (!mission.selected.size) return "Tap a squad card at the bottom (or one of your drones) to select it.";
  if (b.stats.zonesCaptured === 0) return "Now tap inside a white beacon ring: the squad flies there and captures it. Drag to move the view, scroll or pinch to zoom, right-drag or Q/E to turn.";
  return "Hold 3 beacons to win. Optional: capture the Dragonfly landing site to unlock NASA's Dragonfly as a drone.";
}

function updateSquadBar() {
  if (!mission) return;
  const b = mission.battle;
  const summary = battleSummary(b);
  const bar = $("squad-bar");
  const drones = b.units.filter(isDrone);
  for (const id of mission.selected) if (!summary.squads.find(s => s.id === id && (s.size || s.inbound))) mission.selected.delete(id);
  for (const squad of summary.squads) {
    let card = mission.cards.get(squad.id);
    const alive = squad.size > 0 || squad.inbound;
    if (!alive) { card?.remove(); mission.cards.delete(squad.id); continue; }
    if (!card) {
      card = document.createElement("button");
      card.type = "button";
      card.className = "squad-card";
      card.dataset.squad = squad.id;
      card.style.setProperty("--squad", squad.color);
      card.innerHTML = `<strong></strong><span class="mix"></span><div class="health"><i></i></div>`;
      bar.append(card);
      mission.cards.set(squad.id, card);
    }
    const members = drones.filter(u => u.squad === squad.id);
    const mix = {};
    for (const unit of members) mix[unit.type] = (mix[unit.type] || 0) + 1;
    const health = members.length ? members.reduce((s, u) => s + u.hp / u.maxHp, 0) / members.length : 1;
    card.querySelector("strong").textContent = `${squad.name} · ${squad.inbound ? "landing" : members.length}`;
    card.querySelector(".mix").textContent = Object.entries(mix).map(([t, n]) => `${n} ${droneTypes[t].name}`).join(", ") || "in the pod";
    card.querySelector(".health i").style.width = `${Math.round(health * 100)}%`;
    card.setAttribute("aria-pressed", String(mission.selected.has(squad.id)));
  }
}

function updateHud() {
  if (!mission) return;
  const b = mission.battle, summary = battleSummary(b);
  $("hud-planet").textContent = mission.planet.name;
  $("hud-zones").textContent = `${summary.held}/${summary.required} zones held (${summary.total} in all)`;
  $("hud-matter").textContent = Math.floor(b.matter);
  if (b.tier === 0) {
    $("hud-mood").textContent = "nobody here";
    $("hud-alarm").style.width = "0%";
  } else {
    $("hud-mood").textContent = `${publicMood(b.alarm)} (${Math.round(b.alarm)})`;
    $("hud-alarm").style.width = `${b.alarm}%`;
  }
  const advisory = hazardAdvisory(b);
  $("hud-hazard").hidden = !advisory;
  if (advisory) { $("hud-hazard").textContent = advisory.text; $("hud-hazard").classList.toggle("active", advisory.tone === "active"); }
  $("hud-time").textContent = clock(b.time);
  $("pause-button").textContent = mission.paused ? "Resume" : "Pause";
  $("pause-button").setAttribute("aria-pressed", String(mission.paused));
  $("speed-button").textContent = `${mission.speed}×`;
  const wait = summary.dropReadyIn;
  $("drop-button").textContent = wait > 0 ? `Drop pod (${Math.ceil(wait)} s)` : "Drop pod";
  $("objective-list").innerHTML = objectiveStatus(b).map(o => {
    const state = o.done ? "done" : o.failed ? "failed" : "";
    return `<li class="${state}"><span class="mark">${o.done ? "✓" : o.failed ? "✗" : o.primary ? "•" : "☆"}</span><span>${escapeHtml(o.text)}</span>${o.progress ? `<small>${escapeHtml(o.progress)}</small>` : ""}</li>`;
  }).join("");
  const coach = coachText(b);
  $("coach").hidden = !coach;
  $("coach").textContent = coach;
  $("hud-log").innerHTML = b.log.slice(-4).map(entry => `<li class="${entry.tone}">${escapeHtml(entry.text)}</li>`).join("");
  updateSquadBar();
  updateDropPanel();
}

// ---- Overlay and minimap ----
function drawOverlay() {
  const { ctx, width, height } = fitCanvas(overlay);
  ctx.clearRect(0, 0, width, height);
  const b = mission.battle;
  ctx.font = "600 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  for (const zone of b.zones) {
    const p = scene.project(zone.x, scene.heightAt(zone.x, zone.z) + (zone.kind === "beachhead" ? 28 : 18), zone.z, width, height);
    if (!p.visible || p.x < -80 || p.x > width + 80 || p.y < -20 || p.y > height + 20) continue;
    const status = zone.kind === "beachhead" ? "Hive beacon" : zone.captured ? "held" : `${Math.round(zone.control)}%${zone.contested ? " · contested" : ""}`;
    const text = zone.kind === "beachhead" ? status : `${zone.name} · ${status}`;
    const w = ctx.measureText(text).width + 14;
    ctx.fillStyle = "rgba(6, 8, 16, 0.72)";
    ctx.beginPath();
    ctx.roundRect(p.x - w / 2, p.y - 11, w, 20, 10);
    ctx.fill();
    ctx.strokeStyle = zone.captured ? swarmColor : zone.kind === "beacon" || zone.kind === "relic" || b.tier === 0 ? "#e8e2d0" : nativeColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#f1f4ff";
    ctx.fillText(text, p.x, p.y + 4);
    if (mission.placing && zone.captured) {
      ctx.fillStyle = swarmColor;
      ctx.fillText("tap to land here", p.x, p.y + 22);
    }
  }
  const squadColor = new Map(b.squads.map(s => [s.id, s.color]));
  for (const unit of b.units) {
    const selected = isDrone(unit) && mission.selected.has(unit.squad);
    const damaged = unit.hp < unit.maxHp - 0.5;
    if (!selected && !damaged) continue;
    const p = scene.project(unit.x, scene.unitTop(unit), unit.z, width, height);
    if (!p.visible || p.x < 0 || p.x > width || p.y < 0 || p.y > height) continue;
    if (selected) {
      ctx.strokeStyle = squadColor.get(unit.squad) || swarmColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y + 8, 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (damaged) {
      const w = unit.structure ? 30 : 18, f = Math.max(0, unit.hp / unit.maxHp);
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(p.x - w / 2 - 1, p.y - 6, w + 2, 5);
      ctx.fillStyle = unit.side === "swarm" ? (f > 0.4 ? "#8dffb0" : "#ffd479") : "#ff7a5a";
      ctx.fillRect(p.x - w / 2, p.y - 5, w * f, 3);
    }
  }
}

function drawMinimap() {
  const canvas = $("minimap");
  const { ctx, width, height } = fitCanvas(canvas);
  const b = mission.battle, { centerX, centerZ, half } = b.map;
  const sx = (x) => (x - (centerX - half)) / (half * 2) * width, sz = (z) => (z - (centerZ - half)) / (half * 2) * height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(10, 14, 24, 0.85)";
  ctx.fillRect(0, 0, width, height);
  if (mission.terrain.liquid !== null && !mission.terrain.solidLiquid) {
    if (!mission.liquidMap) {
      const map = document.createElement("canvas");
      map.width = map.height = 64;
      const m = map.getContext("2d");
      for (let i = 0; i < 64; i += 1) for (let j = 0; j < 64; j += 1) {
        const x = centerX - half + (i + 0.5) / 64 * half * 2, z = centerZ - half + (j + 0.5) / 64 * half * 2;
        if (!mission.terrain.isLand(x, z)) { m.fillStyle = mission.planet.biome === "volcanic" ? "rgba(255,90,26,0.45)" : "rgba(60,110,170,0.45)"; m.fillRect(i, j, 1, 1); }
      }
      mission.liquidMap = map;
    }
    ctx.drawImage(mission.liquidMap, 0, 0, width, height);
  }
  for (const zone of b.zones) {
    ctx.strokeStyle = zone.captured ? swarmColor : zone.kind === "beacon" || zone.kind === "relic" || b.tier === 0 ? "#e8e2d0" : nativeColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx(zone.x), sz(zone.z), Math.max(3, zone.radius / (half * 2) * width), 0, Math.PI * 2);
    ctx.stroke();
  }
  const squadColor = new Map(b.squads.map(s => [s.id, s.color]));
  for (const unit of b.units) {
    ctx.fillStyle = unit.side === "swarm" ? (squadColor.get(unit.squad) || swarmColor) : nativeColor;
    const s = unit.structure ? 3 : 2;
    ctx.fillRect(sx(unit.x) - s / 2, sz(unit.z) - s / 2, s, s);
  }
  for (const strike of b.strikes) {
    if (strike.hit) continue;
    ctx.strokeStyle = "#ff4a3a";
    ctx.beginPath(); ctx.arc(sx(strike.x), sz(strike.z), 4, 0, Math.PI * 2); ctx.stroke();
  }
  for (const event of b.hazards.events) {
    if (event.kind !== "eruption") continue;
    ctx.strokeStyle = "#ff3a1a";
    ctx.beginPath(); ctx.arc(sx(event.x), sz(event.z), event.radius / (half * 2) * width, 0, Math.PI * 2); ctx.stroke();
  }
  const { focus, yaw } = mission.cam;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const fx = sx(focus.x), fz = sz(focus.z);
  ctx.moveTo(fx - Math.sin(yaw) * 10, fz - Math.cos(yaw) * 10);
  ctx.lineTo(fx + Math.sin(yaw) * 6 + Math.cos(yaw) * 6, fz + Math.cos(yaw) * 6 - Math.sin(yaw) * 6);
  ctx.lineTo(fx + Math.sin(yaw) * 6 - Math.cos(yaw) * 6, fz + Math.cos(yaw) * 6 + Math.sin(yaw) * 6);
  ctx.closePath();
  ctx.stroke();
}

$("minimap").addEventListener("click", (event) => {
  if (!mission) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const { centerX, centerZ, half } = mission.battle.map;
  mission.cam.focus.x = centerX - half + (event.clientX - rect.left) / rect.width * half * 2;
  mission.cam.focus.z = centerZ - half + (event.clientY - rect.top) / rect.height * half * 2;
  clampCamera();
});

// ---- Events, achievements and the end of a mission ----
function handleEvents(events) {
  const b = mission.battle;
  for (const event of events) {
    if (event.kind === "release" && !mission.selected.size) {
      const pod = b.pods.find(p => p.id === event.pod);
      if (pod) { mission.selected.add(pod.squad); updateSquadBar(); }
    }
    if (event.kind === "recovered") toast(`${droneTypes[event.unlock]?.name || event.unlock} recovered! It is in your drop menu now.`, "achievement", 6000);
  }
  for (const entry of b.log) {
    if (mission.seenLog.has(entry)) continue;
    mission.seenLog.add(entry);
    if (entry.tone === "warn" || entry.tone === "bad") toast(entry.text, entry.tone);
  }
}

function checkLiveAchievements() {
  const result = missionResult(mission.battle);
  const earned = newAchievements(progress, achievementContext(progress, mission.planet, { ...result, outcome: mission.battle.outcome }, true));
  if (!earned.length) return;
  progress = recordAchievements(progress, earned);
  saveProgress();
  for (const a of earned) toast(`Achievement: ${a.name}. ${a.text}`, "achievement", 5000);
}

function finishMission() {
  const b = mission.battle, planet = mission.planet;
  const result = missionResult(b);
  const objectives = objectiveStatus(b);
  const applied = applyMissionResult(progress, planet, result);
  const earned = newAchievements(applied.progress, achievementContext(applied.progress, planet, result, false));
  progress = recordAchievements(applied.progress, earned);
  savedMission = null;
  saveProgress();
  const titles = { won: `${planet.name} conquered`, lost: "The swarm was destroyed", retreated: "Swarm withdrawn" };
  $("debrief-title").textContent = titles[result.outcome];
  $("debrief-stars").textContent = result.outcome === "won" ? "★".repeat(result.stars) + "☆".repeat(3 - result.stars) : "";
  $("debrief-objectives").innerHTML = objectives.map(o => `<li>${o.done ? "✓" : o.failed || result.outcome !== "won" ? "✗" : "•"} ${escapeHtml(o.text)}${o.progress ? ` <small>(${escapeHtml(o.progress)})</small>` : ""}</li>`).join("");
  const s = result.stats;
  const rows = [
    ["Time", clock(result.time)], ["Drops", s.drops], ["Drones dropped", s.dronesDropped], ["Drones lost", s.dronesLost],
    ["Lost to hazards", s.hazardLosses], ["Zones captured", s.zonesCaptured], ["Defenses destroyed", s.defensesDestroyed],
    ["Matter gathered", Math.round(s.matterHarvested)], ["Hazards weathered", s.hazardEvents], ["Peak alarm", Math.round(s.alarmPeak)],
    ["Recalled drones refund", `${b.refund} matter`], ["Matter in the bank", progress.matter],
  ];
  $("debrief-stats").innerHTML = rows.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join("");
  $("debrief-notes").innerHTML = [...applied.notes, ...earned.map(a => `Achievement: ${a.name}`)].map(n => `<li>${escapeHtml(n)}</li>`).join("");
  $("debrief-retry").textContent = result.outcome === "won" ? "Play again" : "Try again";
  $("debrief").showModal();
}

$("debrief-retry").addEventListener("click", () => { const planet = mission.planet; $("debrief").close(); startMission(planet); });
$("debrief-galaxy").addEventListener("click", () => {
  $("debrief").close();
  selectedPlanet = nextPlanet(progress).id;
  mission = null;
  scene?.unload();
  show("galaxy");
});

// ---- Frame loop ----
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  tick(now);
}
function tick(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (current === "galaxy") drawGalaxyScreen(now / 1000);
  if (current !== "mission" || !mission || !scene) return;
  const b = mission.battle;
  if (!mission.paused) for (let i = 0; i < mission.speed; i += 1) stepBattle(b, dt);
  keyboardCamera(dt);
  const events = b.events.splice(0);
  handleEvents(events);
  scene.frame(b, mission.cam, events, mission.paused ? 0 : dt * mission.speed, now / 1000);
  drawOverlay();
  if (now - mission.lastHud > 120) { updateHud(); mission.lastHud = now; }
  if (now - mission.lastMinimap > 150) { drawMinimap(); mission.lastMinimap = now; }
  if (now - mission.lastAchievements > 1000) { checkLiveAchievements(); mission.lastAchievements = now; }
  if (b.outcome && !mission.ended) {
    mission.ended = true;
    updateHud();
    setTimeout(finishMission, 1600);
  }
}

show("title");
requestAnimationFrame(frame);
if (["localhost", "127.0.0.1"].includes(location.hostname)) {
  window.swarmfall = { get progress() { return progress; }, get mission() { return mission; }, get scene() { return scene; }, startMission, planetById, tick, show };
}
