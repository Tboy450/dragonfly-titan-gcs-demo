// Swarmfall entry point: the title, the campaign galaxy, the mission screen (camera, selection,
// orders, drops, HUD, minimap) and the debrief. Game rules live in battle.mjs and campaign.mjs;
// this file only reads them, sends player commands and draws the page.
import {
  planets, planetById, createProgress, isPlanetUnlocked, nextPlanet,
  applyMissionResult, missionMatter, frontiers, missionSupply, applyFrontierResult,
} from "./campaign.mjs?v=dev";
import {
  createBattle, stepBattle, requestDrop, checkDrop, orderAt, orderSquads, orderHold, battleSummary,
  objectiveStatus, starsEarned, missionResult, retreat, publicMood, dropZoneAt, extractVictory, continueCapturing,
  cityFound, hiddenUnits, shotBlocked,
} from "./battle.mjs?v=dev";
import { droneTypes, droneOrder, defenderTypes, societies, threatNames, payloadSlots, payloadCost, dropDurationS } from "./units.mjs?v=dev";
import { packDropPods, podRadius, podStaggerS } from "./drop-waves.mjs?v=dev";
import { hazardTypes, hazardAdvisory } from "./hazards.mjs?v=dev";
import { achievements, achievementContext, newAchievements, recordAchievements } from "./achievements.mjs?v=dev";
import { createPlanetTerrain } from "./planet-terrain.mjs?v=dev";
import { drawGalaxy, drawStarfield } from "./galaxy.mjs?v=dev";
import { createInvasionScene, swarmColor, nativeColor } from "./scene.mjs?v=dev";
import { missionCheckpoint, restoreMissionCheckpoint, checkpointPlanet } from "./mission-save.mjs?v=dev";
import { pointerIntent, exceedsTapSlop } from './pointer-controls.mjs?v=dev';
import { tinyDroneMarker } from './drone-markers.mjs?v=dev';
import { enterFree, exitFree, placeFree, moveFree, freeLimits } from "./free-camera.mjs?v=dev";
import { squadCenter, latestAlert, zoneAlerts, edgeScroll, homeView } from "./camera-assist.mjs?v=dev";
import { cycleSound, soundLabel, updateBattleSound, quietSound } from "./sound.mjs?v=dev";
import { minimapWorldPoint } from './minimap-controls.mjs?v=dev';
import { readCampaignSave, writeCampaignSave, recoveryFailureMessage, listRecoveryBackups } from './save-recovery.mjs?v=dev';

const $ = (id) => document.getElementById(id);
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
const isDrone = (unit) => unit.alive && unit.side === "swarm" && !unit.structure;

// ---- Saved progress ----
let resultSavePending = false;
const storageAccess = () => localStorage;
let saveState = readCampaignSave(storageAccess), lastSaveError = '', sessionDirty = false, preservedBackups = [];
let progress = saveState.progress, savedMission = saveState.activeMission;
function saveProgress() {
  const result = writeCampaignSave(storageAccess, progress, savedMission, saveState);
  if (!result.ok) { lastSaveError = result.reason; sessionDirty = true; return false; }
  saveState = result.state; lastSaveError = ''; sessionDirty = false; resultSavePending = false;
  return true;
}

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
  renderSaveRecovery();
}

// ---- Save files and protected recovery ----
function renderSaveRecovery() {
  const protectedSave = saveState.status === 'recovery';
  const message = lastSaveError ? recoveryFailureMessage(lastSaveError) : saveState.issue?.message || '';
  $('save-notice').hidden = !message; $('save-notice-text').textContent = message;
  $('play-button').disabled = protectedSave || lastSaveError === 'changed';
  $('reset-button').disabled = protectedSave || saveState.status === 'unavailable';
  $('resume-button').disabled = protectedSave;
  if (saveState.status === 'unavailable') $('play-button').textContent = 'Play without saving';
  $('save-summary').textContent = message || (saveState.needsBackup
    ? 'This older save is supported. Its original file will be preserved before the migrated save is written.'
    : 'Download a copy of this session or the saved file on this device. Browser backups stay on this device.');
  $('save-record').textContent = `${Object.keys(progress.captured).length} planets conquered · ${Math.round(progress.matter)} matter${savedMission ? ' · active battle available' : ''}`;
  $('save-download-original').disabled = saveState.raw === null;
  $('save-resolve').hidden = !protectedSave;
  $('save-resolve').textContent = saveState.issue?.canKeepCampaign ? 'Recover campaign data' : 'Start fresh with backup';
}
function openSaveFiles() {
  preservedBackups = listRecoveryBackups(storageAccess);
  $('save-backup-choice').replaceChildren();
  preservedBackups.forEach((copy, i) => {
    const option = document.createElement('option'); option.value = String(i);
    option.textContent = `Preserved backup ${i + 1} · ${Math.ceil(copy.raw.length / 1024)} KB`;
    $('save-backup-choice').append(option);
  });
  $('save-backups').hidden = !preservedBackups.length;
  $('save-action-status').textContent = ''; renderSaveRecovery(); resetPointers(); $('save-dialog').showModal();
}
function downloadSave(raw, name) {
  let url, link;
  try {
    url = URL.createObjectURL(new Blob([raw], { type: 'application/json;charset=utf-8' }));
    link = document.createElement('a'); link.href = url; link.download = name; document.body.append(link); link.click();
    $('save-action-status').textContent = 'Backup download requested. Check your browser downloads.';
  } catch { $('save-action-status').textContent = 'The download could not start. Your saved file is unchanged. Try a browser that allows downloads.'; }
  finally { link?.remove(); if (url) setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
function adoptSavedState(state) {
  saveState = state; progress = state.progress; savedMission = state.activeMission;
  lastSaveError = ''; sessionDirty = false; resultSavePending = false;
  selectedPlanet = nextPlanet(progress).id; drawTitle();
}
$('save-files-button').addEventListener('click', openSaveFiles);
$('save-review').addEventListener('click', openSaveFiles);
$('save-close').addEventListener('click', () => $('save-dialog').close());
$('save-download-session').addEventListener('click', () => downloadSave(JSON.stringify({ ...progress, activeMission: savedMission }, null, 2), 'swarmfall-session.json'));
$('save-download-original').addEventListener('click', () => { if (saveState.raw !== null) downloadSave(saveState.raw, 'swarmfall-original-save.json'); });
$('save-download-backup').addEventListener('click', () => {
  const copy = preservedBackups[Number($('save-backup-choice').value)];
  if (copy) downloadSave(copy.raw, copy.key + '.json');
});
$('save-retry-read').addEventListener('click', async () => {
  if (sessionDirty && !await confirmDialog('Reload saved data and replace this session’s unsaved changes? Download this session first if you want to keep it.')) return;
  const state = readCampaignSave(storageAccess);
  if (state.status === 'unavailable') { $('save-action-status').textContent = state.issue.message; return; }
  adoptSavedState(state); $('save-action-status').textContent = 'Saved data rechecked. No file was overwritten.';
});
$('save-resolve').addEventListener('click', async () => {
  if (saveState.status !== 'recovery') return;
  const keep = saveState.issue.canKeepCampaign;
  if (!await confirmDialog(keep
    ? 'Recover the readable campaign data without its saved battle? The exact original will be kept as a browser backup before replacement.'
    : 'Start a fresh campaign? The exact original will be kept as a browser backup before replacement.')) return;
  const result = writeCampaignSave(storageAccess, keep ? progress : createProgress(), null, saveState, { resolve: true });
  if (!result.ok) { lastSaveError = result.reason; renderSaveRecovery(); return; }
  adoptSavedState(result.state); $('save-dialog').close(); openSaveFiles();
  $('save-action-status').textContent = 'Campaign ready. The original is retained below as a preserved browser backup.';
});

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
    <ul class="objective-list"><li>Hold ${planet.required} zones, then leave for victory or continue capturing (★)</li>${planet.objectives.map(o => `<li>☆ ${escapeHtml(o.text)}</li>`).join("")}</ul>
    <p class="section-title">Reward for conquest</p>
    <p>${escapeHtml(reward.join(" · "))}</p>
    ${progress.captured[planet.id] ? `<p class="section-title">Your record</p><p>${"★".repeat(stars)}${"☆".repeat(3 - stars)}${best ? ` · best time ${clock(best)}` : ""}</p>` : ""}
    ${open ? `<p class="section-title">Supply for this attempt</p><p>${missionMatter(progress, planet)} matter · ${progress.podSlots} slots per wave · 1–3 drones per pod</p>
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
    resetPointers();
    dialog.showModal();
  });
}

function showAchievements() {
  $("achievement-list").innerHTML = achievements.map(a => {
    const at = progress.achievements[a.id];
    return `<li class="${at ? "earned" : ""}"><strong>${at ? "🏆 " : ""}${escapeHtml(a.name)}</strong><small>${escapeHtml(a.text)}${at ? ` · earned ${new Date(at).toLocaleDateString()}` : ""}</small></li>`;
  }).join("");
  resetPointers();
  $("achievements-dialog").showModal();
}

$("play-button").addEventListener("click", () => { selectedPlanet = nextPlanet(progress).id; show("galaxy"); });
$("resume-button").addEventListener("click", () => {
  if (savedMission) startMission(planetById(savedMission.battle.planetId), savedMission);
});
$("reset-button").addEventListener("click", async () => {
  if (await confirmDialog("Reset the campaign, unlocks and achievements? The current saved file will be retained as a browser backup.")) {
    const protectedState = { ...saveState, needsBackup: saveState.raw !== null };
    const result = writeCampaignSave(storageAccess, createProgress(), null, protectedState);
    if (result.ok) adoptSavedState(result.state);
    else { lastSaveError = result.reason; openSaveFiles(); }
  }
});
$("galaxy-back").addEventListener("click", () => show("title"));
$("achievements-button").addEventListener("click", showAchievements);
$("achievements-close").addEventListener("click", () => $("achievements-dialog").close());

// ---- Frontier maps (large worlds apart from the campaign) ----
function showFrontiers() {
  $("frontier-list").innerHTML = frontiers.map(map => {
    const society = societies[map.society], supply = missionSupply(progress, map), record = progress.frontier?.[map.id];
    return `<li><strong>${escapeHtml(map.name)}</strong>
      <small>${escapeHtml(map.subtitle)} · ${(map.map.half * 2 / 1000).toFixed(0)} km across · ${escapeHtml(society.name)} society · threat ${escapeHtml(threatNames[map.threat])}</small>
      <p>${escapeHtml(map.description)}</p>
      <small>Hold ${map.required} of ${map.zoneCount} zones · ${supply.matter} matter · ${supply.podSlots} slots per wave · ${escapeHtml(supply.unlocks.map(t => droneTypes[t].name).join(", "))}</small>
      <small class="frontier-record">${record ? `Your record: ${"★".repeat(record.stars)}${"☆".repeat(3 - record.stars)} · best ${clock(record.best)} · ${record.wins} ${record.wins === 1 ? "win" : "wins"}` : "Not yet won"}</small>
      <button class="primary" type="button" data-frontier="${escapeHtml(map.id)}">Land on ${escapeHtml(map.name)}</button></li>`;
  }).join("");
  for (const button of $("frontier-list").querySelectorAll("[data-frontier]")) {
    button.addEventListener("click", async () => {
      const map = planetById(button.dataset.frontier);
      $("frontier-dialog").close();
      if (savedMission && !await confirmDialog("Start a new mission and replace your saved battle? Campaign progress will be kept.")) return;
      startMission(map);
    });
  }
  resetPointers();
  $("frontier-dialog").showModal();
}
$("frontier-button").addEventListener("click", showFrontiers);
$("frontier-close").addEventListener("click", () => $("frontier-dialog").close());

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
  resetPointers();
  $("debrief").open && $("debrief").close();
  $("victory-dialog").open && $("victory-dialog").close();
  // A battle saved before its planet gained a city resumes on the landscape it was saved on.
  const terrain = createPlanetTerrain(checkpoint && checkpointPlanet(checkpoint) || planet);
  const restored = checkpoint ? restoreMissionCheckpoint(checkpoint, terrain) : null;
  if (checkpoint && !restored) return;
  const battle = restored?.battle || createBattle(planet, {
    ...missionSupply(progress, planet), terrain, seed: planet.seed,
    missionId: globalThis.crypto?.randomUUID?.() || `attempt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
  });
  scene.load(planet, terrain, battle);
  mission = {
    planet, battle, terrain, follow: false, lastAlert: null, mouse: null, zoneWatch: new Set(),
    cam: restored?.cam || homeView(battle),
    selected: new Set(restored?.command.selected || []), speed: 1, paused: !!restored,
    payload: restored?.command.payload ?? defaultPayload(battle), placing: false, dropPoint: null, dropPreview: null, dropPanelOpen: false,
    cleanView: false, minimapOrders: false, minimapPing: null, phoneHudCollapsed: false, freeCam: null, freeInput: { up: 0, look: 0 },
    seenLog: new WeakSet(), ended: false, lastHud: 0, lastMinimap: 0, lastAchievements: 0, cards: new Map(), dropTypes: "",
  };
  $("squad-bar").replaceChildren();
  $("toasts").replaceChildren();
  $("hud-log").replaceChildren();
  $("objectives-box").open = true;
  $("log-box").open = true;
  $("drop-rows").replaceChildren();
  $("placement-hint").hidden = true;
  $('placement-launch').disabled = true;
  clampCamera();
  setCleanView(false);
  updateFreeCameraUi();
  updateFollowUi();
  $("pause-button").textContent = mission.paused ? "Resume" : "Pause";
  $("speed-button").textContent = "1×";
  show("mission");
  setMinimapOrders(false);
  resizeMission();
  if (!restored || restored.command.dropPanelOpen) openDropPanel(); else closeDropPanel();
  updateHud();
  checkpointMission();
  if (restored) toast("Mission restored and paused. Landing previews are cancelled; choose a fresh drop location. Press Resume when ready.", "info", 6000);
  offerVictoryChoice();
}

function checkpointMission() {
  if (resultSavePending && (!mission || mission.battle.outcome)) { retrySettlementSave(); return; }
  if (!mission) return;
  if (mission.battle.outcome) return;
  savedMission = missionCheckpoint(mission);
  if (!saveProgress() && !mission.saveWarning) {
    mission.saveWarning = true;
    toast(recoveryFailureMessage(lastSaveError), "warn", 7000);
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
  // A frontier map sets how far the camera may pull back (map.view): far enough to take in a
  // valley, never the whole map at once, so the minimap and scouting still matter.
  cam.distance = Math.min(battle.map.view || 750, Math.max(35, cam.distance));
  cam.pitch = Math.min(1.45, Math.max(0.3, cam.pitch));
}
// ---- Free camera (free-camera.mjs): fly anywhere, up and down, and look around ----
const groundAt = (x, z) => mission.terrain.heightAt(x, z);
// Buildings stop the free camera only once the city has been found (no peeking through them).
const freeWorld = () => ({ groundAt, map: mission.battle.map, roofAt: cityFound(mission.battle) && mission.battle.roofAt ? (x, z) => mission.battle.roofAt(x, z, 1) : null });
function nudgeFree(forward, right, up) {
  const f = mission.freeCam;
  placeFree(f, f.x - Math.sin(f.yaw) * forward + Math.cos(f.yaw) * right, f.z - Math.cos(f.yaw) * forward - Math.sin(f.yaw) * right, f.y + up, freeWorld());
}
const freeScale = () => Math.max(4, mission.freeCam.y - groundAt(mission.freeCam.x, mission.freeCam.z)) * 0.0021;
function lookFree(dx, dy) {
  const f = mission.freeCam;
  f.yaw -= dx * 0.006;
  f.pitch = Math.min(freeLimits.lookDown, Math.max(freeLimits.lookUp, f.pitch + dy * 0.004));
}
function updateFreeCameraUi() {
  const on = !!mission?.freeCam;
  $("free-camera").setAttribute("aria-pressed", String(on));
  $("free-camera").textContent = on ? "Orbit cam · C" : "Free cam · C";
  $("free-controls").hidden = !on;
}
function setFreeCamera(enabled) {
  if (!mission || !!mission.freeCam === enabled) return;
  if (enabled) mission.freeCam = enterFree(mission.cam, groundAt);
  else {
    exitFree(mission.freeCam, mission.cam, groundAt, mission.battle.map.view || 750);
    mission.freeCam = null;
    clampCamera();
  }
  mission.freeInput = { up: 0, look: 0 };
  updateFreeCameraUi();
}
// The minimap and squad focus move cam.focus; the free camera follows such jumps, and otherwise
// cam.focus tracks the point under the free camera so the minimap marker stays right.
function syncFreeFocus() {
  const f = mission.freeCam, cam = mission.cam;
  if (f.syncX !== undefined && (cam.focus.x !== f.syncX || cam.focus.z !== f.syncZ)) placeFree(f, cam.focus.x, cam.focus.z, f.y, freeWorld());
  cam.focus.x = f.syncX = f.x;
  cam.focus.z = f.syncZ = f.z;
  cam.yaw = f.yaw;
}
$("free-camera").addEventListener("click", () => setFreeCamera(!mission?.freeCam));
for (const button of document.querySelectorAll("#free-controls [data-free]")) {
  const [axis, value] = { up: ["up", 1], down: ["up", -1], lookup: ["look", -1], lookdown: ["look", 1] }[button.dataset.free];
  const release = () => { if (mission) mission.freeInput[axis] = 0; };
  button.addEventListener("pointerdown", (event) => { if (!mission?.freeCam) return; event.preventDefault(); button.setPointerCapture(event.pointerId); mission.freeInput[axis] = value; });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) button.addEventListener(type, release);
}

// ---- Camera assist (camera-assist.mjs): follow squads, jump to alerts, edge-scroll, reset ----
function updateFollowUi() {
  $("follow-button").setAttribute("aria-pressed", String(!!mission?.follow));
}
function setFollow(enabled) {
  if (!mission) return;
  if (enabled && !mission.selected.size) { toast("Select a squad to follow.", "info"); enabled = false; }
  mission.follow = enabled;
  updateFollowUi();
}
function lookAt(x, z) {
  if (mission.freeCam) placeFree(mission.freeCam, x, z, mission.freeCam.y, freeWorld());
  else { mission.cam.focus = { x, z }; clampCamera(); }
}
function jumpToAlert() {
  const alert = mission?.lastAlert;
  if (!alert) { toast("No alerts yet.", "info"); return; }
  setFollow(false);
  lookAt(alert.x, alert.z);
  mission.minimapPing = { x: alert.x, z: alert.z, at: performance.now() };
}
function resetView() {
  setFreeCamera(false);
  setFollow(false);
  mission.cam = homeView(mission.battle);
  clampCamera();
}
// Each frame: follow the selected squads, and scroll when a mouse rests at the screen edge.
function assistCamera(dt) {
  if (mission.follow && !mission.freeCam) {
    const center = squadCenter(mission.battle.units, mission.selected), cam = mission.cam;
    if (center) {
      const k = Math.min(1, dt * 3);
      cam.focus = { x: cam.focus.x + (center.x - cam.focus.x) * k, z: cam.focus.z + (center.z - cam.focus.z) * k };
      clampCamera();
    }
  }
  const mouse = mission.mouse;
  if (mouse && !gesture && document.hasFocus()) {
    const { dx, dy } = edgeScroll(mouse.x, mouse.y, overlay.clientWidth, overlay.clientHeight);
    if (dx || dy) pan(dx * 700 * dt, dy * 700 * dt);
  }
}
$("follow-button").addEventListener("click", () => setFollow(!mission?.follow));
$("sound-button").addEventListener("click", () => { $("sound-button").textContent = cycleSound(); });
$("sound-button").textContent = soundLabel();
$("alert-button").addEventListener("click", jumpToAlert);

function pan(dx, dy) {
  if (mission.follow) setFollow(false);
  if (mission.freeCam) {
    const k = freeScale();
    nudgeFree(dy * k, -dx * k, 0);
    return;
  }
  const cam = mission.cam, k = cam.distance * 0.0021;
  const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
  cam.focus.x += (-rx * dx + fx * dy) * k;
  cam.focus.z += (-rz * dx + fz * dy) * k;
  clampCamera();
}
function keyboardCamera(dt) {
  if (mission.freeCam) {
    const on = (...names) => (names.some(name => keys.has(name)) ? 1 : 0);
    const input = {
      forward: on("w", "arrowup") - on("s", "arrowdown"), right: on("d", "arrowright") - on("a", "arrowleft"),
      up: on("r", "pageup") - on("f", "pagedown") + mission.freeInput.up, turn: on("e") - on("q"),
      look: on("x") - on("z") + mission.freeInput.look, fast: keys.has("shift"),
    };
    if (input.forward || input.right || input.up || input.turn || input.look) moveFree(mission.freeCam, input, dt, freeWorld());
    return;
  }
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
function battlefieldActive() {
  return current === "mission" && mission && !mission.battle.outcome && !document.hidden && !document.querySelector("dialog[open]");
}
function resetPointers() {
  resetMinimapPointers();
  const captured = [...pointers.keys()];
  pointers.clear(); gesture = null;
  for (const id of captured) if (overlay.hasPointerCapture(id)) overlay.releasePointerCapture(id);
}
function pinchState() {
  const [a, b] = [...pointers.values()];
  return { dist: Math.hypot(a.x - b.x, a.y - b.y), angle: Math.atan2(b.y - a.y, b.x - a.x), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
overlay.addEventListener("pointerdown", (event) => {
  if (!battlefieldActive()) return;
  const intent = pointerIntent(event);
  if (!intent) return;
  if (pointers.has(event.pointerId)) { if (gesture) gesture.moved = true; return; }
  overlay.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointers.size === 1) {
    gesture = { ...intent, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY,
      moved: event.buttons !== undefined && event.buttons !== intent.buttons };
  } else if (gesture) {
    gesture.moved = true;
    gesture.pinch = pinchState();
  }
});
overlay.addEventListener("pointermove", (event) => {
  if (event.pointerType === "mouse" && mission) {
    const rect = overlay.getBoundingClientRect();
    mission.mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  if (!pointers.has(event.pointerId)) return;
  if (!battlefieldActive()) { resetPointers(); return; }
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  // A mouse-button chord must never become a command when its final button is released.
  if (gesture && event.buttons !== undefined && event.buttons !== gesture.buttons) gesture.moved = true;
  if (pointers.size >= 2 && gesture?.pinch) {
    const now = pinchState(), before = gesture.pinch;
    if (mission.freeCam) {
      // Free camera: spread to fly forward, pinch to back away, twist to turn, drag to slide.
      mission.freeCam.yaw -= now.angle - before.angle;
      nudgeFree((now.dist - before.dist) * freeScale() * 2, 0, 0);
      pan(now.x - before.x, now.y - before.y);
      gesture.pinch = now;
      return;
    }
    mission.cam.distance *= Math.max(10, before.dist) / Math.max(10, now.dist);
    mission.cam.yaw -= now.angle - before.angle;
    pan(now.x - before.x, now.y - before.y);
    gesture.pinch = now;
    return;
  }
  if (!gesture) return;
  const dx = event.clientX - gesture.lastX, dy = event.clientY - gesture.lastY;
  if (exceedsTapSlop(gesture, event)) gesture.moved = true;
  if (gesture.moved) {
    if (gesture.rotate && mission.freeCam) lookFree(dx, dy);
    else if (gesture.rotate) { mission.cam.yaw -= dx * 0.006; mission.cam.pitch += dy * 0.004; clampCamera(); } else pan(dx, dy);
  }
  gesture.lastX = event.clientX; gesture.lastY = event.clientY;
});
const endPointer = (event) => {
  if (!pointers.has(event.pointerId)) return;
  if (event.type !== "pointerup" || !battlefieldActive()) { resetPointers(); return; }
  pointers.delete(event.pointerId);
  const finished = gesture;
  if (pointers.size === 0) {
    gesture = null;
    if (finished && !finished.moved && !exceedsTapSlop(finished, event) && finished.action)
      tap(event.clientX, event.clientY, finished.additive, finished.action);
  } else if (gesture) {
    gesture.moved = true;
    gesture.pinch = pointers.size >= 2 ? pinchState() : null;
    const remaining = pointers.values().next().value;
    gesture.lastX = remaining.x; gesture.lastY = remaining.y;
  }
};
overlay.addEventListener("pointerup", endPointer);
overlay.addEventListener("pointercancel", endPointer);
overlay.addEventListener("lostpointercapture", (event) => { if (pointers.has(event.pointerId)) resetPointers(); });
overlay.addEventListener("contextmenu", (event) => event.preventDefault());
overlay.addEventListener("pointerleave", () => { if (mission) mission.mouse = null; });
overlay.addEventListener("wheel", (event) => {
  if (!battlefieldActive()) return;
  event.preventDefault();
  // The wheel raises and lowers the free camera; it zooms the orbit camera.
  if (mission.freeCam) { nudgeFree(0, 0, event.deltaY * (0.15 + freeScale() * 0.9)); return; }
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

function tap(clientX, clientY, additive, action = "smart") {
  const b = mission.battle;
  const { x, y, width, height } = screenPoint(clientX, clientY);
  if (mission.placing) {
    if (action === "order") { cancelPlacement(); return; }
    const ground = scene.pickGround(x / width * 2 - 1, -(y / height) * 2 + 1);
    if (!ground) return;
    if (!dropZoneAt(b, ground.x, ground.z)) { toast("Pods can only land inside a zone you hold (cyan ring).", "warn"); return; }
    mission.dropPoint = { x: ground.x, z: ground.z };
    updateDropPreview();
    return;
  }
  const drone = action === "order" ? null : unitAtScreen(x, y, isDrone);
  if (drone) {
    if (action === "select" && !additive && mission.selected.size === 1 && mission.selected.has(drone.squad)) return;
    selectSquad(drone.squad, additive);
    return;
  }
  if (action === "select") {
    if (!additive) { mission.selected.clear(); updateSquadBar(); }
    return;
  }
  if (!mission.selected.size) {
    toast("Select a squad first: click or tap a squad card below or one of your drones.", "warn");
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
  mission.selected = new Set(summary.squads.filter(s => s.size > 0 || s.inbound).map(s => s.id));
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
function holdSelected() {
  if (!mission || mission.battle.outcome) return;
  if (!mission.selected.size) {
    setCleanView(false);
    toast("Select a squad first: click or tap a drone or a squad card, then choose Hold.", "warn");
    return;
  }
  orderHold(mission.battle, [...mission.selected]);
}
$("hold-button").addEventListener("click", holdSelected);
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
  if (!mission || mission.battle.outcome) return;
  setCleanView(false);
  mission.dropPanelOpen = true;
  $("drop-panel").hidden = false;
  updateDropPanel(true);
}
function closeDropPanel() { $("drop-panel").hidden = true; if (mission) { mission.dropPreview = null; mission.dropPanelOpen = false; } }
function updateDropPreview() {
  if (!mission) return;
  const b = mission.battle;
  const point = mission.placing ? mission.dropPoint : !$("drop-panel").hidden ? b.zones.find(z => z.kind === "beachhead") : null;
  mission.dropPreview = point ? checkDrop(b, { x: point.x, z: point.z, payload: mission.payload }) : null;
  $("placement-launch").disabled = !mission.placing || !mission.dropPreview?.ok;
  $("placement-text").textContent = !point ? "Click or tap a held zone to preview courts. Right-click or Cancel to stop." : mission.dropPreview?.ok
    ? `${mission.dropPreview.landings.length} spaced pods ready. Launch here or tap another point.` : mission.dropPreview?.reason;
}
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
  const podCount = packDropPods(mission.payload).length;
  $("drop-summary").textContent = `${podCount} pod${podCount === 1 ? "" : "s"} · wave slots ${slots}/${b.podSlots} · cost ${cost} of ${Math.floor(b.matter)} matter · arrivals ${(dropDurationS + Math.max(0, podCount - 1) * podStaggerS).toFixed(1)} s`;
  const check = checkDrop(b, { payload: mission.payload });
  const home = b.zones.find(z => z.kind === "beachhead");
  const homeCheck = checkDrop(b, { x: home.x, z: home.z, payload: mission.payload });
  $("drop-reason").textContent = !check.ok ? check.reason : !homeCheck.ok ? `Hive court: ${homeCheck.reason}` : "Up to 3 drones per pod; each Dragonfly travels alone. One squad and one purchase for the wave.";
  $("drop-home").disabled = !homeCheck.ok;
  $("drop-pick").disabled = !check.ok;
}

$("drop-rows").addEventListener("click", (event) => {
  const button = event.target.closest("[data-step]");
  if (!button || !mission) return;
  const type = button.closest("[data-type]").dataset.type;
  const next = Math.min(44, Math.max(0, (mission.payload[type] || 0) + Number(button.dataset.step)));
  mission.payload = { ...mission.payload, [type]: next };
  updateDropPanel();
});

function launch(x, z) {
  const result = requestDrop(mission.battle, { x, z, payload: mission.payload });
  if (!result.ok) { toast(result.reason, "warn"); return; }
  mission.placing = false;
  $("placement-hint").hidden = true;
  closeDropPanel();
  mission.selected = new Set([result.squad.id]);
  updateSquadBar();
  checkpointMission();
}
$("drop-home").addEventListener("click", () => {
  const home = mission.battle.zones.find(z => z.kind === "beachhead");
  launch(home.x, home.z);
});
$("drop-pick").addEventListener("click", () => {
  mission.placing = true;
  mission.dropPoint = null;
  closeDropPanel();
  $("placement-hint").hidden = false;
  updateDropPreview();
});
$("placement-launch").addEventListener("click", () => { if (mission?.placing && mission.dropPoint) launch(mission.dropPoint.x, mission.dropPoint.z); });
function cancelPlacement() {
  if (!mission) return;
  mission.placing = false; mission.dropPoint = null; mission.dropPreview = null;
  $("placement-launch").disabled = true;
  $("placement-hint").hidden = true;
}
$("placement-cancel").addEventListener("click", cancelPlacement);

// ---- Pause, speed, retreat ----
function setCleanView(enabled) {
  if (!mission) return;
  mission.cleanView = enabled;
  if (enabled) { resetMinimapPointers(); cancelPlacement(); closeDropPanel(); }
  $("screen-mission").classList.toggle("clean-view", enabled);
  $("clean-view-button").textContent = enabled ? "Show HUD · V" : "Clean view · V";
  $("clean-view-button").setAttribute("aria-pressed", String(enabled));
  $("clean-view-button").title = enabled ? "Restore panels and labels (V or Escape)" : "Hide panels and labels (V)";
  if (enabled && document.activeElement !== $("clean-view-button") && $("screen-mission").contains(document.activeElement))
    $("clean-view-button").focus({ preventScroll: true });
}
$("clean-view-button").addEventListener("click", () => { if (mission) setCleanView(!mission.cleanView); });
$("pause-button").addEventListener("click", () => { if (mission) mission.paused = !mission.paused; updateHud(); });
$("speed-button").addEventListener("click", () => { if (mission) { mission.speed = mission.speed % 3 + 1; updateHud(); } });
$("retreat-button").addEventListener("click", async () => {
  if (!mission || mission.battle.outcome) return;
  const wasPaused = mission.paused;
  mission.paused = true;
  if (await confirmDialog("Retreat? Surviving drones return for half their cost; unreleased pod cargo is fully refunded.")) retreat(mission.battle);
  else mission.paused = wasPaused;
});

function offerVictoryChoice() {
  if (!mission || mission.battle.outcome || !mission.battle.victoryAvailable || mission.battle.victoryChoiceMade || $("victory-dialog").open) return;
  mission.victoryWasPaused = mission.paused;
  mission.paused = true;
  setCleanView(false);
  closeDropPanel();
  mission.placing = false;
  $("placement-hint").hidden = true;
  const summary = battleSummary(mission.battle);
  $("victory-remaining").textContent = `${summary.held} of ${summary.total} zones held; ${summary.total - summary.held} remain. Leave now, or keep playing and use Leave for victory later.`;
  checkpointMission();
  resetPointers();
  $("victory-dialog").showModal();
}
function keepCapturing() {
  if (!mission || !continueCapturing(mission.battle)) return;
  $("victory-dialog").close();
  mission.paused = mission.victoryWasPaused ?? mission.paused;
  checkpointMission();
  updateHud();
}
function leaveForVictory() {
  if (!mission || !extractVictory(mission.battle)) return;
  if ($("victory-dialog").open) $("victory-dialog").close();
  finishMission(); // Settle/save immediately; do not leave a vulnerable debrief-delay window.
}
$("victory-continue").addEventListener("click", keepCapturing);
$("victory-leave").addEventListener("click", leaveForVictory);
$("extract-button").addEventListener("click", leaveForVictory);
$("victory-dialog").addEventListener("cancel", event => { event.preventDefault(); keepCapturing(); });
document.addEventListener("visibilitychange", () => { if (document.hidden && mission && !mission.battle.outcome) { mission.paused = true; updateHud(); } });

window.addEventListener("keydown", (event) => {
  if (current !== "mission" || !mission || event.target.closest?.("input, textarea") || document.querySelector("dialog[open]")) return;
  const key = event.key.toLowerCase();
  if (key === "v" && !event.repeat) { setCleanView(!mission.cleanView); event.preventDefault(); return; }
  if (key === "c" && !event.repeat) { setFreeCamera(!mission.freeCam); event.preventDefault(); return; }
  if (key === "g" && !event.repeat) { setFollow(!mission.follow); return; }
  if (key === "m" && !event.repeat) { $("sound-button").textContent = cycleSound(); return; }
  if (key === "j" && !event.repeat) { jumpToAlert(); return; }
  if (key === "home") { resetView(); event.preventDefault(); return; }
  if (key === " ") { mission.paused = !mission.paused; updateHud(); event.preventDefault(); return; }
  if (key === "escape") { resetPointers(); setCleanView(false); cancelPlacement(); closeDropPanel(); return; }
  if (key === "b") { $("drop-panel").hidden ? openDropPanel() : closeDropPanel(); return; }
  if (key === "h") { if (!event.repeat) holdSelected(); return; }
  if (key === "0") { selectAll(); return; }
  if (/^[1-9]$/.test(key)) {
    const squads = battleSummary(mission.battle).squads.filter(s => s.size > 0 || s.inbound);
    const squad = squads[Number(key) - 1];
    if (squad) selectSquad(squad.id, event.shiftKey);
    return;
  }
  keys.add(key);
  if (key.startsWith("arrow") || key.startsWith("page")) event.preventDefault();
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener("blur", () => { keys.clear(); resetPointers(); });
document.addEventListener("visibilitychange", () => { if (document.hidden) resetPointers(); });

// ---- HUD ----
// onClick makes the toast tappable (warnings jump the camera to the newest alert).
function toast(text, tone = "info", ms = 3600, onClick = null) {
  const box = $("toasts");
  const item = document.createElement(onClick ? "button" : "div");
  item.className = `toast ${tone}${onClick ? " clickable" : ""}`;
  item.textContent = text;
  if (onClick) { item.type = "button"; item.addEventListener("click", () => { onClick(); item.remove(); }); }
  box.append(item);
  while (box.children.length > 4) box.firstElementChild.remove();
  setTimeout(() => item.remove(), ms);
}

function coachText(b) {
  if (!b.practice) return "";
  if (b.stats.drops === 0) return "Press Drop wave, choose Scouts and Links, then land on the Hive beacon. Each pod carries up to 3 drones; the wave stays one squad.";
  if (!b.units.some(isDrone)) return "The pods are coming down under their parachutes. Drones release just above the ground; you can already select their squad and give an order.";
  if (!mission.selected.size) return "Left-click or touch-tap a squad card at the bottom (or one of your drones) to select it.";
  if (b.stats.zonesCaptured === 0) return "Right-click (or touch-tap) inside a white beacon ring: the squad flies there and captures it. Drag to move the view, scroll or pinch to zoom, right-drag or Q/E to turn.";
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
    card.querySelector("strong").textContent = `${squad.name} · ${members.length} ready${squad.inbound ? ` · ${squad.inboundPods} pods inbound` : ""}`;
    card.querySelector(".mix").textContent = [Object.entries(mix).map(([t, n]) => `${n} ${droneTypes[t].name}`).join(", "), squad.inboundDrones ? `${squad.inboundDrones} arriving` : ""].filter(Boolean).join(" · ");
    card.querySelector(".health i").style.width = `${Math.round(health * 100)}%`;
    card.setAttribute("aria-pressed", String(mission.selected.has(squad.id)));
  }
}

function updateHud() {
  if (!mission) return;
  const b = mission.battle, summary = battleSummary(b);
  // Collapse once per mission on a narrow screen, then respect manual reopening.
  // A resumed battle with captures gets the same compact starting layout.
  if (!mission.phoneHudCollapsed && b.stats.zonesCaptured > 0 && window.matchMedia("(max-width: 720px)").matches) {
    mission.phoneHudCollapsed = true;
    for (const id of ["objectives-box", "log-box"]) {
      const panel = $(id);
      if (panel.contains(document.activeElement)) panel.querySelector("summary").focus();
      panel.open = false;
    }
  }
  $("hud-planet").textContent = mission.planet.name;
  $("hud-zones").textContent = b.victoryAvailable ? `Victory available · ${summary.held}/${summary.total} held · ${summary.total - summary.held} remain` : `${summary.held}/${summary.required} zones held (${summary.total} in all)`;
  $("extract-button").hidden = !b.victoryAvailable || !!b.outcome;
  $("retreat-button").hidden = b.victoryAvailable || !!b.outcome;
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
  $("drop-button").textContent = wait > 0 ? `Drop wave (${Math.ceil(wait)} s)` : "Drop wave";
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
  updateDropPreview();
}

// ---- Overlay and minimap ----
function drawOverlay() {
  const { ctx, width, height } = fitCanvas(overlay);
  ctx.clearRect(0, 0, width, height);
  if (mission.cleanView) return;
  const b = mission.battle;
  ctx.font = "600 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  for (const zone of b.zones) {
    if (zone.scouted === false) continue;
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
      ctx.fillText("tap to preview courts", p.x, p.y + 22);
    }
  }
  const squadColor = new Map(b.squads.map(s => [s.id, s.color]));
  for (const [index, point] of (mission.dropPreview?.ok ? mission.dropPreview.landings : []).entries()) {
    const y = scene.heightAt(point.x, point.z) + 1;
    ctx.strokeStyle = swarmColor; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const angle = i / 24 * Math.PI * 2;
      const p = scene.project(point.x + Math.cos(angle) * podRadius, y, point.z + Math.sin(angle) * podRadius, width, height);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    const label = scene.project(point.x, y + 5, point.z, width, height);
    if (label.visible) { ctx.fillStyle = swarmColor; ctx.fillText(`Pod ${index + 1}`, label.x, label.y); }
  }
  const hidden = hiddenUnits(b), byId = new Map(b.units.map(u => [u.id, u])), noShot = new Set();
  for (const unit of b.units) {
    if (!unit.alive || hidden.has(unit.id)) continue;
    const selected = isDrone(unit) && mission.selected.has(unit.squad);
    // A selected drone's attack target: a faint line when it can fire, a dashed red one (and a
    // "No clear shot" note at the target) while a building or ridge is in the way.
    const aimed = selected && unit.order?.kind === "attack" ? byId.get(unit.order.target) : null;
    if (aimed?.alive && !hidden.has(aimed.id)) {
      const from = scene.project(unit.x, scene.unitTop(unit), unit.z, width, height), to = scene.project(aimed.x, scene.unitTop(aimed), aimed.z, width, height);
      if (from.visible && to.visible) {
        const blocked = shotBlocked(b, unit, aimed);
        if (blocked) noShot.add(aimed);
        ctx.save();
        ctx.strokeStyle = blocked ? "rgba(255, 90, 70, 0.85)" : "rgba(124, 231, 255, 0.35)";
        ctx.lineWidth = blocked ? 1.5 : 1;
        if (blocked) ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
        ctx.restore();
      }
    }
    const damaged = unit.hp < unit.maxHp - 0.5;
    if (!isDrone(unit) && !selected && !damaged) continue;
    const p = scene.project(unit.x, scene.unitTop(unit), unit.z, width, height);
    if (!p.visible || p.x < 0 || p.x > width || p.y < 0 || p.y > height) continue;
    const marker = isDrone(unit) ? tinyDroneMarker(p, scene.unitPixelSize(unit, height), width, height) : null;
    if (marker) {
      ctx.fillStyle = squadColor.get(unit.squad) || swarmColor;
      ctx.strokeStyle = "rgba(6, 8, 16, 0.95)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(marker.x, marker.y - marker.radius);
      ctx.lineTo(marker.x + marker.radius, marker.y);
      ctx.lineTo(marker.x, marker.y + marker.radius);
      ctx.lineTo(marker.x - marker.radius, marker.y);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
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
  drawNoShotNotes(ctx, noShot, width, height);
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
  // Frontier maps: shaded relief, so the valley and passes can be read before they are scouted.
  if (mission.terrain.landformSpec) {
    mission.reliefMap ||= reliefMap(mission.terrain, b.map);
    ctx.drawImage(mission.reliefMap, 0, 0, width, height);
  }
  // City buildings, from the same layout that blocks troops and lifts drones (once found).
  for (const building of cityFound(b) ? mission.terrain.city?.buildings || [] : []) {
    ctx.fillStyle = "rgba(160, 170, 185, 0.55)";
    ctx.fillRect(sx(building.x - building.w / 2), sz(building.z - building.d / 2), Math.max(1, building.w / (half * 2) * width), Math.max(1, building.d / (half * 2) * height));
  }
  for (const zone of b.zones) {
    if (zone.scouted === false) continue;
    ctx.strokeStyle = zone.captured ? swarmColor : zone.kind === "beacon" || zone.kind === "relic" || b.tier === 0 ? "#e8e2d0" : nativeColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx(zone.x), sz(zone.z), Math.max(3, zone.radius / (half * 2) * width), 0, Math.PI * 2);
    ctx.stroke();
  }
  const squadColor = new Map(b.squads.map(s => [s.id, s.color]));
  const hidden = hiddenUnits(b);
  for (const unit of b.units) {
    if (hidden.has(unit.id)) continue;
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
  // The newest alert (camera-assist.mjs) for 20 s: a red ring; J or the Alert button jumps there.
  if (mission.lastAlert && b.time - mission.lastAlert.at < 20) {
    ctx.strokeStyle = "#ff4a3a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sx(mission.lastAlert.x), sz(mission.lastAlert.z), 6, 0, Math.PI * 2); ctx.stroke();
  }
  if (mission.minimapPing) {
    const elapsed = performance.now() - mission.minimapPing.at;
    if (elapsed < 900) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - elapsed / 900);
      ctx.strokeStyle = swarmColor; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx(mission.minimapPing.x), sz(mission.minimapPing.z), 4 + elapsed / 130, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    } else mission.minimapPing = null;
  }
}

// Height shading for a frontier map's minimap: brighter and lit from the north-west where the
// ground rises, so mountains, passes and the valley floor read at a glance.
function reliefMap(terrain, { centerX, centerZ, half }) {
  const n = 96, heights = new Float32Array(n * n), canvas = document.createElement("canvas");
  canvas.width = canvas.height = n;
  let low = Infinity, high = -Infinity;
  for (let j = 0; j < n; j += 1) for (let i = 0; i < n; i += 1) {
    const h = terrain.heightAt(centerX - half + (i + 0.5) / n * half * 2, centerZ - half + (j + 0.5) / n * half * 2);
    heights[j * n + i] = h; low = Math.min(low, h); high = Math.max(high, h);
  }
  const context = canvas.getContext("2d"), image = context.createImageData(n, n), cell = half * 2 / n;
  for (let j = 0; j < n; j += 1) for (let i = 0; i < n; i += 1) {
    const h = heights[j * n + i], level = (h - low) / Math.max(1, high - low);
    const west = heights[j * n + Math.max(0, i - 1)], north = heights[Math.max(0, j - 1) * n + i];
    const light = Math.max(-1, Math.min(1, ((h - west) + (h - north)) / cell * 0.8));
    const shade = 34 + level * 120 + light * 40, k = (j * n + i) * 4;
    image.data[k] = shade * 0.82; image.data[k + 1] = shade * 0.92; image.data[k + 2] = shade + 18; image.data[k + 3] = 150;
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

function drawNoShotNotes(ctx, targets, width, height) {
  for (const target of targets) {
    const p = scene.project(target.x, scene.unitTop(target) + 6, target.z, width, height);
    if (!p.visible) continue;
    ctx.fillStyle = "rgba(6, 8, 16, 0.72)";
    ctx.fillRect(p.x - 52, p.y - 22, 104, 16);
    ctx.fillStyle = "#ff8a6a";
    ctx.fillText("No clear shot", p.x, p.y - 10);
  }
}

const minimap = $("minimap"), minimapPointers = new Map();
let minimapGesture = null;
function resetMinimapPointers() {
  const captured = [...minimapPointers.keys()];
  minimapPointers.clear(); minimapGesture = null;
  for (const id of captured) if (minimap.hasPointerCapture(id)) minimap.releasePointerCapture(id);
}
function setMinimapOrders(enabled) {
  if (!mission) return;
  resetMinimapPointers(); mission.minimapOrders = enabled;
  $("minimap-mode").textContent = enabled ? "Map: Orders" : "Map: View";
  $("minimap-mode").setAttribute("aria-pressed", String(enabled));
  $("minimap-mode").title = enabled ? "Minimap taps order selected squads. Switch back to move the view." : "Minimap taps move the view. Switch to Orders for touch commands; desktop right-click always orders.";
  minimap.setAttribute("aria-label", enabled ? "Minimap: tap to order selected squads" : "Minimap: tap to move the view; right-click to order selected squads");
}
$("minimap-mode").addEventListener("click", () => { if (battlefieldActive()) setMinimapOrders(!mission.minimapOrders); });
minimap.addEventListener("pointerdown", (event) => {
  if (!battlefieldActive() || mission.cleanView) return;
  const mouse = event.pointerType === "mouse" || !event.pointerType;
  if (event.button !== 0 && !(mouse && event.button === 2)) return;
  const expectedButtons = event.button === 2 ? 2 : 1;
  minimap.setPointerCapture(event.pointerId);
  minimapPointers.set(event.pointerId, true);
  if (minimapPointers.size === 1 && !minimapGesture) {
    minimapGesture = { x: event.clientX, y: event.clientY, order: event.button === 2 || mission.minimapOrders,
      buttons: expectedButtons, cancelled: event.altKey || event.ctrlKey || (event.buttons !== undefined && event.buttons !== expectedButtons) };
  } else if (minimapGesture) minimapGesture.cancelled = true;
});
minimap.addEventListener("pointermove", (event) => {
  if (!minimapPointers.has(event.pointerId)) return;
  if (!battlefieldActive()) { resetMinimapPointers(); return; }
  if (minimapGesture && (exceedsTapSlop(minimapGesture, event) || (event.buttons !== undefined && event.buttons !== minimapGesture.buttons))) minimapGesture.cancelled = true;
});
minimap.addEventListener("pointerup", (event) => {
  if (!minimapPointers.has(event.pointerId)) return;
  const finished = minimapGesture;
  minimapPointers.delete(event.pointerId);
  if (minimapPointers.size) { if (minimapGesture) minimapGesture.cancelled = true; return; }
  minimapGesture = null;
  if (!battlefieldActive() || mission.cleanView || !finished || finished.cancelled || exceedsTapSlop(finished, event) || (event.button === 2 ? 2 : 1) !== finished.buttons) return;
  const point = minimapWorldPoint(event.clientX, event.clientY, minimap.getBoundingClientRect(), mission.battle.map);
  if (!point) return;
  if (!finished.order) {
    mission.cam.focus.x = point.x; mission.cam.focus.z = point.z; clampCamera(); return;
  }
  if (mission.placing) { cancelPlacement(); return; }
  if (!mission.selected.size) { toast("Select a squad first, then give a minimap order.", "warn"); return; }
  const order = orderAt(mission.battle, [...mission.selected], point.x, point.z);
  if (order) mission.minimapPing = { x: order.x, z: order.z, at: performance.now() };
});
minimap.addEventListener("pointercancel", resetMinimapPointers);
minimap.addEventListener("lostpointercapture", (event) => { if (minimapPointers.has(event.pointerId)) resetMinimapPointers(); });
minimap.addEventListener("contextmenu", event => event.preventDefault());

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
    if (entry.tone === "warn" || entry.tone === "bad") toast(entry.text, entry.tone, 3600, mission.lastAlert ? jumpToAlert : null);
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
  if (!mission?.battle.outcome || mission.resultApplied) return;
  mission.ended = true;
  mission.resultApplied = true;
  setCleanView(false);
  closeDropPanel();
  mission.placing = false;
  $("placement-hint").hidden = true;
  const b = mission.battle, planet = mission.planet;
  const result = missionResult(b);
  const objectives = objectiveStatus(b);
  const applied = planet.frontier ? applyFrontierResult(progress, planet, result) : applyMissionResult(progress, planet, result);
  const earned = newAchievements(applied.progress, achievementContext(applied.progress, planet, result, false));
  progress = recordAchievements(applied.progress, earned);
  savedMission = null;
  resultSavePending = true;
  saveProgress();
  showSettlementSaveStatus();
  const titles = { won: `${planet.name} conquered`, lost: "The swarm was destroyed", retreated: "Swarm withdrawn" };
  $("debrief-title").textContent = titles[result.outcome];
  $("debrief-stars").textContent = result.outcome === "won" ? "★".repeat(result.stars) + "☆".repeat(3 - result.stars) : "";
  $("debrief-objectives").innerHTML = objectives.map(o => `<li>${o.done ? "✓" : o.failed || result.outcome !== "won" ? "✗" : "•"} ${escapeHtml(o.text)}${o.progress ? ` <small>(${escapeHtml(o.progress)})</small>` : ""}</li>`).join("");
  const s = result.stats;
  const rows = [
    ["Time", clock(result.time)], ["Drop waves", s.drops], ["Pods launched", s.podsLaunched || s.drops], ["Drones dropped", s.dronesDropped], ["Drones lost", s.dronesLost],
    ["Lost to hazards", s.hazardLosses], ["Zones captured", s.zonesCaptured], ["Defenses destroyed", s.defensesDestroyed],
    ["Matter gathered", Math.round(s.matterHarvested)], ["Hazards weathered", s.hazardEvents], ["Peak alarm", Math.round(s.alarmPeak)],
    ["Recall/cancelled cargo refund", `${b.refund} matter`], ["Matter in the bank", progress.matter],
  ];
  $("debrief-stats").innerHTML = rows.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join("");
  $("debrief-notes").innerHTML = [...applied.notes, ...earned.map(a => `Achievement: ${a.name}`)].map(n => `<li>${escapeHtml(n)}</li>`).join("");
  $("debrief-retry").textContent = result.outcome === "won" ? "Play again" : "Try again";
  resetPointers();
  $("debrief").showModal();
}

function showSettlementSaveStatus() {
  $("settlement-status").hidden = !resultSavePending;
  $("settlement-retry").hidden = !resultSavePending;
  $("settlement-status").textContent = resultSavePending
    ? `Result is in memory. ${recoveryFailureMessage(lastSaveError)} Keep this page open; Save files on the title screen can export this session. Retrying grants no extra reward.` : "";
}
function retrySettlementSave() {
  if (!resultSavePending) return;
  saveProgress();
  showSettlementSaveStatus();
}
$("settlement-retry").addEventListener("click", retrySettlementSave);

$("debrief-retry").addEventListener("click", () => { const planet = mission.planet; $("debrief").close(); startMission(planet); });
function returnToGalaxy() {
  $("debrief").close();
  quietSound();
  const frontier = mission?.planet.frontier;
  selectedPlanet = nextPlanet(progress).id;
  mission = null;
  scene?.unload();
  show(frontier ? "title" : "galaxy");
}
$("debrief-galaxy").addEventListener("click", returnToGalaxy);
$("debrief").addEventListener("cancel", event => { event.preventDefault(); returnToGalaxy(); });

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
  assistCamera(dt);
  const events = b.events.splice(0);
  mission.lastAlert = latestAlert(mission.lastAlert, events, b);
  for (const alert of zoneAlerts(mission.zoneWatch, b)) {
    mission.lastAlert = alert;
    toast(`${alert.text}. Tap to view (J).`, "bad", 6000, jumpToAlert);
  }
  handleEvents(events);
  offerVictoryChoice();
  if (mission.freeCam) syncFreeFocus();
  scene.frame(b, mission.freeCam ? { ...mission.cam, free: mission.freeCam } : mission.cam, events, mission.paused ? 0 : dt * mission.speed, now / 1000);
  drawOverlay();
  // Sound hears what the camera sees: around the view's focus, as far as the view reaches.
  const listener = mission.freeCam ? { x: mission.freeCam.x, z: mission.freeCam.z, radius: 150 + Math.max(0, mission.freeCam.y - groundAt(mission.freeCam.x, mission.freeCam.z)) * 1.2 }
    : { x: mission.cam.focus.x, z: mission.cam.focus.z, radius: 80 + mission.cam.distance * 0.9 };
  updateBattleSound(b, listener, mission.paused ? [] : events);
  if (now - mission.lastHud > 120) { updateHud(); mission.lastHud = now; }
  if (now - mission.lastMinimap > 150) { drawMinimap(); mission.lastMinimap = now; }
  if (now - mission.lastAchievements > 1000) { checkLiveAchievements(); mission.lastAchievements = now; }
  if (b.outcome && !mission.ended) {
    updateHud();
    finishMission();
  }
}

show("title");
requestAnimationFrame(frame);
if (["localhost", "127.0.0.1"].includes(location.hostname)) {
  window.swarmfall = { get progress() { return progress; }, get mission() { return mission; }, get scene() { return scene; }, startMission, planetById, tick, show };
}
