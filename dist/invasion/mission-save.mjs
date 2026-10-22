// Versioned, JSON-safe battle checkpoints. Terrain functions and renderer state are rebuilt.
import { planetById } from "./campaign.mjs?v=dev";
import { droneTypes, defenderTypes } from "./units.mjs?v=dev";
import { hazardTypes } from "./hazards.mjs?v=dev";
import { validPayload, podStaggerS, dronesPerPod } from "./drop-waves.mjs?v=dev";
import { payloadCount, payloadSlots, dropDurationS } from "./units.mjs?v=dev";
import { legacyMissionId, validMissionId } from "./mission-id.mjs?v=dev";
import { commandCheckpoint, restoreCommandState } from './command-state.mjs?v=dev';
import { CITY_LAYOUT_VERSION } from "./city-layout.mjs?v=dev";
import { upgradeIds } from "./battle.mjs?v=dev";

export const MISSION_SAVE_VERSION = 3;
// Recovery bounds [EST], deliberately above current campaign sizes, not gameplay caps.
export const checkpointLimits = Object.freeze({ zones: 64, units: 5000, squads: 5000, pods: 150,
  strikes: 256, events: 1000, log: 200, specials: 32, objectives: 32, unlocks: Object.keys(droneTypes).length });
const finite = Number.isFinite;
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const fields = (value, keys, check = finite) => object(value) && keys.every(key => check(value[key]));
const jsonClone = value => JSON.parse(JSON.stringify(value));
const positiveId = value => Number.isSafeInteger(value) && value > 0;
const between = (value, min, max) => finite(value) && value >= min && value <= max;
const integer = (value, min, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && between(value, min, max);
const text = (value, max = 160) => typeof value === "string" && value.length > 0 && value.length <= max;
const nameId = value => typeof value === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
const known = (table, key) => typeof key === "string" && Object.hasOwn(table, key);
const point = value => fields(value, ["x", "z"], n => between(n, -1e6, 1e6));
const slot = value => fields(value, ["dx", "dz"], n => between(n, -1e4, 1e4));
const unique = values => new Set(values).size === values.length;

function boundedData(value) {
  if (!object(value) || !object(value.battle)) return false;
  for (const [key, limit] of Object.entries(checkpointLimits))
    if (!Array.isArray(value.battle[key]) || value.battle[key].length > limit) return false;
  // Check before legacy cloning/hashing: no cycles, non-JSON values, unbounded nesting or
  // hidden NaN/Infinity becoming null during migration. Iteration avoids recursive overflow.
  const pending = [[value, 0]], seen = new WeakSet(); let nodes = 0, characters = 0;
  while (pending.length) {
    const [entry, depth] = pending.pop();
    if (++nodes > 500000 || depth > 16) return false;
    if (entry === null || typeof entry === "boolean") continue;
    if (typeof entry === "number") { if (!finite(entry)) return false; continue; }
    if (typeof entry === "string") { characters += entry.length; if (entry.length > 4096 || characters > 8 * 1024 * 1024) return false; continue; }
    if (typeof entry !== "object" || seen.has(entry)) return false;
    seen.add(entry);
    const keys = Object.keys(entry);
    if (Array.isArray(entry) ? keys.length !== entry.length || keys.some((key, i) => key !== String(i))
      : ![null, Object.prototype].includes(Object.getPrototypeOf(entry))) return false;
    if (keys.length + pending.length + nodes > 500000) return false;
    for (const key of keys) {
      characters += key.length;
      if (key.length > 4096 || characters > 8 * 1024 * 1024) return false;
      pending.push([entry[key], depth + 1]);
    }
  }
  return true;
}

function validOrder(order, b, zones, squad = false) {
  if (!object(order) || !["hold", "move", "capture", "attack"].includes(order.kind)) return false;
  if (!(squad && order.kind === "hold" && order.x === undefined && order.z === undefined) && !point(order)) return false;
  if (order.pace !== undefined && !between(order.pace, .001, 1000)) return false;
  if (order.hunt !== undefined && typeof order.hunt !== "boolean") return false;
  // Fallen targets are pruned after combat. Keep their IDs for normal attack-move/retargeting.
  if (order.kind === "attack" && !(positiveId(order.target) && order.target < b.nextId)) return false;
  return (order.kind !== "capture" || zones.has(order.zone)) && (order.zone === undefined || zones.has(order.zone));
}

function validObjectives(objectives, zones) {
  return unique(objectives.map(o => o?.id)) && objectives.every(o => object(o) && nameId(o.id) && text(o.text, 512)
    && (o.kind === "captureZone" ? zones.has(o.zone)
      : o.kind === "destroyType" ? known(defenderTypes, o.type)
      : ["maxLosses", "alarmBelow", "timeUnder"].includes(o.kind) ? between(o.value, 0, 1e9)
      : o.kind === "noHazardLosses"));
}

function validHazards(h, b) {
  if (!object(h) || !Array.isArray(h.types) || h.types.length > Object.keys(hazardTypes).length
    || !unique(h.types) || !h.types.every(t => known(hazardTypes, t)) || !object(h.next)
    || Object.keys(h.next).length !== h.types.length || !h.types.every(t => Object.hasOwn(h.next, t) && between(h.next[t], 0, b.time + 1e6))
    || !Array.isArray(h.events) || h.events.length > h.types.length || !integer(h.serial, 0)
    || !between(h.calm, .01, 100) || !between(h.severity, 0, 100)
    || !unique(h.events.map(e => e?.id)) || !unique(h.events.map(e => e?.type))) return false;
  if (!h.events.every(e => object(e) && h.types.includes(e.type) && positiveId(e.id) && e.id <= h.serial
    && text(e.name) && e.kind === hazardTypes[e.type].kind && ["warning", "active"].includes(e.phase)
    && between(e.startedAt, 0, b.time) && between(e.activeAt, e.startedAt, b.time + 3600)
    && between(e.endsAt, e.activeAt + .001, b.time + 7200)
    && between(e.windAngle, -1e9, 1e9) && between(e.nextStrike, e.startedAt, e.endsAt + 120)
    && (e.kind !== "eruption" || point(e) && between(e.radius, .001, 1000)))) return false;
  const effects = h.effects;
  return fields(effects, ["speed", "sight", "range"], n => between(n, .001, 5))
    && between(effects.damage, 0, 1e6) && typeof effects.stun === "boolean"
    && fields(effects.wind, ["x", "z"], n => between(n, -1e4, 1e4))
    && Array.isArray(effects.zones) && effects.zones.length <= h.types.length
    && effects.zones.every(z => point(z) && between(z.radius, .001, 1000) && between(z.damage, 0, 1e6));
}

function validWaves(b, squads, entityIds) {
  const waves = new Map(), squadWaves = new Map();
  for (const pod of b.pods) {
    const count = payloadCount(pod.payload);
    if (!point(pod) || !positiveId(pod.id) || !squads.has(pod.squad) || !validPayload(pod.payload) || !count
      || !Object.keys(pod.payload).every(t => b.unlocks.includes(t))
      || !(pod.legacy === undefined || typeof pod.legacy === "boolean")
      || (pod.legacy === true ? count > 44 : count > dronesPerPod || pod.payload.dragonfly > 0 && count !== 1)
      || typeof pod.released !== "boolean" || pod.released !== (pod.t >= dropDurationS)
      || !positiveId(pod.waveId) || !integer(pod.waveCount, 1, 44) || !integer(pod.waveIndex, 0, pod.waveCount - 1)
      || !integer(pod.slotStart, 0, 43) || pod.slotStart + count > 44
      || !between(pod.stagger, 0, 10) || !between(pod.launchedAt, 0, b.time)
      || !between(pod.t, -pod.stagger, dropDurationS + 6)
      || Math.abs(pod.t - (b.time - pod.launchedAt - pod.stagger)) > 1e-6
      || (pod.legacy ? pod.waveId !== pod.id || pod.waveCount !== 1 || pod.waveIndex !== 0 || pod.slotStart !== 0 || pod.stagger !== 0
        : entityIds.has(pod.waveId) || Math.abs(pod.stagger - pod.waveIndex * podStaggerS) > 1e-9)
      || pod.pendingSlots !== undefined && (!Array.isArray(pod.pendingSlots) || pod.pendingSlots.length !== count || !pod.pendingSlots.every(slot))) return false;
    if (squadWaves.has(pod.squad) && squadWaves.get(pod.squad) !== pod.waveId) return false;
    squadWaves.set(pod.squad, pod.waveId);
    if (!waves.has(pod.waveId)) waves.set(pod.waveId, []);
    waves.get(pod.waveId).push(pod);
  }
  for (const pods of waves.values()) {
    pods.sort((a, c) => a.waveIndex - c.waveIndex);
    const first = pods[0];
    if (!unique(pods.map(p => p.waveIndex)) || pods.some(p => p.squad !== first.squad || p.waveCount !== first.waveCount
      || p.launchedAt !== first.launchedAt || !!p.legacy !== !!first.legacy)) return false;
    if (pods.reduce((sum, pod) => sum + payloadSlots(pod.payload), 0) > b.podSlots) return false;
    // Released backshells expire independently. A missing prefix is valid only after its
    // retention window; missing paid inbound siblings must not silently disappear on resume.
    for (let i = 0; i < first.waveCount; i++)
      if (!pods.some(p => p.waveIndex === i) && b.time - first.launchedAt - i * podStaggerS < dropDurationS + 6 - 1e-6) return false;
    if (first.slotStart < first.waveIndex || first.slotStart > first.waveIndex * dronesPerPod) return false;
    for (let i = 1; i < pods.length; i++)
      if (pods[i].waveIndex !== pods[i - 1].waveIndex + 1 || pods[i].slotStart !== pods[i - 1].slotStart + payloadCount(pods[i - 1].payload)) return false;
  }
  return true;
}

// Saves from the first city version (October 21, 2026, before Frontier mode) recorded only
// { version: 1, seed }; this is the city they were built on. See
// archive/swarmfall-corvan-city-2026-10-21/.
const firstCities = Object.freeze({
  corvan: Object.freeze({ style: "metropolis", x: 80, z: -120, blocks: 9, pitch: 100, street: 20, seed: 3109, peak: 150 }),
});
const firstCity = (b) => (b.city && b.city.x === undefined ? firstCities[b.planetId] || null : null);

// The world a battle was built on (battle.city, battle.landform): only shapes this version can
// rebuild exactly, within sizes that stay quick to generate. Changing CITY_LAYOUT_VERSION or the
// landform code needs a migration, or the old code kept, so older saves still resume.
function validWorld(b) {
  if (b.explore !== undefined && typeof b.explore !== "boolean") return false;
  if (!b.zones.every(z => z.scouted === undefined || typeof z.scouted === "boolean")) return false;
  const city = b.city ?? null, land = b.landform ?? null;
  if (city !== null && (city.x === undefined
    ? !(firstCity(b) && city.version === 1 && city.seed === firstCity(b).seed)
    : !(city.version === CITY_LAYOUT_VERSION && text(city.style, 40) && (city.name === undefined || text(city.name, 80))
      && point(city) && integer(city.blocks, 3, 21) && city.blocks % 2 === 1 && between(city.pitch, 30, 400)
      && between(city.street, 2, city.pitch / 2) && integer(city.seed, 0, 0xffffffff) && between(city.peak, 9, 1000)))) return false;
  return land === null || land.kind === "valley" && point(land) && between(land.length, 50, 1e5) && between(land.width, 50, 1e5)
    && between(land.angle ?? 0, -10, 10) && between(land.floor ?? 0, -1000, 1000) && between(land.rim ?? 500, 10, 1e4) && between(land.peak ?? 400, 0, 5000)
    && between(land.lava ?? 0, 0, 1) && between(land.rivers ?? 0, 0, 1) && integer(land.volcanoes ?? 0, 0, 8);
}

function migrateCheckpoint(value) {
  if (!object(value) || ![1, 2, MISSION_SAVE_VERSION].includes(value.version)) return null;
  if (value.version === MISSION_SAVE_VERSION) return value;
  const upgraded = jsonClone(value), b = upgraded.battle;
  // A paid legacy pod keeps its complete payload and descent: never repack or charge it again.
  const identity = legacyMissionId(b);
  if (value.version === 1) {
    for (const pod of b.pods) Object.assign(pod, {
      waveId: pod.id, waveIndex: 0, waveCount: 1, slotStart: 0, stagger: 0, legacy: true,
    });
    b.stats.podsLaunched = b.stats.drops;
  }
  b.missionId = identity;
  b.victoryAvailable = false;
  b.victoryAvailableAt = null;
  b.victoryChoiceMade = false;
  upgraded.version = MISSION_SAVE_VERSION;
  return upgraded;
}

export function missionCheckpoint(mission) {
  if (!mission || mission.battle.outcome) return null;
  const { isLand, heightAt, canDropAt, walkable, roofAt, lineBlocked, ...battle } = mission.battle;
  return jsonClone({ version: MISSION_SAVE_VERSION, battle, cam: mission.cam, command: commandCheckpoint(mission) });
}

export function validMissionCheckpoint(value) {
  try {
    // UI metadata is optional and independently normalized. Bad/future UI fields must
    // not discard an otherwise valid paid battle or enter the strict battle JSON clone.
    const command = value?.command;
    if (object(value)) { const { command: ignored, ...core } = value; value = core; }
    if (!boundedData(value)) return null;
    value = migrateCheckpoint(value);
    if (!value) return null;
    const b = value.battle, p = planetById(b?.planetId);
    if (!b || !validMissionId(b.missionId) || typeof b.victoryAvailable !== "boolean" || typeof b.victoryChoiceMade !== "boolean"
      || b.victoryAvailable && (!finite(b.victoryAvailableAt) || b.victoryAvailableAt < 0 || b.victoryAvailableAt > b.time)
      || !b.victoryAvailable && (b.victoryAvailableAt !== null || b.victoryChoiceMade)) return null;
    if (!p || b.outcome !== null || b.endTime !== null || typeof b.paused !== "boolean" || typeof b.practice !== "boolean"
      || !between(b.time, 0, 1e9) || !integer(b.rngState, 0, 0xffffffff) || !positiveId(b.nextId)
      || !integer(b.podSlots, 1, 44) || !integer(b.required, 1, b.zones.length - 1)
      || !between(b.matter, 0, 1e12) || !between(b.refund, 0, 1e12) || !between(b.alarm, 0, 100)
      || !integer(b.alarmStage, 0, 3) || !integer(b.tier, 0, 5) || !integer(b.threat, 0, 5)
      || !between(b.reinforceIn, -1, 1e6) || !between(b.strikeIn, -1, 1e6)) return null;
    if (b.lastDropAt !== null && !between(b.lastDropAt, 0, b.time)) return null;
    if (!point({ x: b.map?.centerX, z: b.map?.centerZ }) || !between(b.map.half, 1, 1e5)) return null;
    if (!validWorld(b)) return null;
    const statKeys = ["drops", "podsLaunched", "dronesDropped", "dronesLost", "hazardLosses", "zonesCaptured", "defensesDestroyed", "militiaDefeated", "matterHarvested", "hazardEvents", "maxAlive", "alarmPeak", "damageDealt"];
    if (!fields(b.stats, statKeys, n => between(n, 0, 1e12)) || !Object.values(b.stats).every(n => between(n, 0, 1e12))) return null;
    if (!statKeys.filter(key => !["matterHarvested", "alarmPeak", "damageDealt"].includes(key)).every(key => integer(b.stats[key], 0, 1e12))
      || b.stats.alarmPeak > 100 || (b.lastDropAt === null) !== (b.stats.drops === 0)) return null;
    if (!b.unlocks.length || !unique(b.unlocks) || !b.unlocks.every(t => known(droneTypes, t))
      || !unique(b.zones.map(z => z?.id)) || b.zones.filter(z => z?.kind === "beachhead").length !== 1) return null;
    const zones = new Set(b.zones.map(z => z.id));
    if (!b.zones.every(z => point(z) && nameId(z.id) && text(z.name) && ["beachhead", "beacon", "relic", "settlement", "mine", "capital"].includes(z.kind)
      && between(z.radius, .001, 1000) && between(z.control, 0, 100) && between(z.value, 0, 1e6) && integer(z.population, 0, 1e9)
      && typeof z.captured === "boolean" && typeof z.contested === "boolean"
      && (z.special === null || nameId(z.special)) && (z.drones === undefined || integer(z.drones, 0, checkpointLimits.units)))) return null;
    if (!validObjectives(b.objectives, zones) || !unique(b.specials) || !b.specials.every(s => nameId(s) && b.zones.some(z => z.special === s))) return null;
    if (!b.squads.every(s => positiveId(s.id) && text(s.name) && text(s.color, 128)
      && (s.order === undefined || validOrder(s.order, b, zones, true)))) return null;
    if (b.skyline !== undefined && b.skyline !== 1) return null;
    // Hive upgrades (ECON-01): known IDs only, levels 1-3.
    if (b.upgrades !== undefined && !(object(b.upgrades) && Object.entries(b.upgrades).every(([id, n]) => upgradeIds.includes(id) && integer(n, 1, 3)))) return null;
    // Waypoint queues and patrol (CTRL-03): at most 8 queued orders, each a full order.
    if (!b.squads.every(s => (s.queue === undefined || Array.isArray(s.queue) && s.queue.length <= 8 && s.queue.every(o => validOrder(o, b, zones)))
      && (s.patrol === undefined || typeof s.patrol === "boolean"))) return null;
    const squads = new Set(b.squads.map(s => s.id));
    if (squads.size !== b.squads.length) return null;
    if (!b.units.every(u => {
      const drone = known(droneTypes, u.type), def = drone ? droneTypes[u.type] : known(defenderTypes, u.type) ? defenderTypes[u.type] : null;
      return def && positiveId(u.id) && point(u) && between(u.hp, 0, u.maxHp) && between(u.maxHp, .001, 1e6)
        && between(u.alt, 0, 10000) && fields(u, ["vx", "vz"], n => between(n, -1e4, 1e4))
        && between(u.heading, -1e9, 1e9) && between(u.fireIn, -1, 60) && between(u.damageScale, .001, 1000)
        && typeof u.alive === "boolean" && u.alive === (u.hp > 0) && typeof u.landed === "boolean"
        && (!u.landed || u.type === "dragonfly") && u.structure === !!def.structure && typeof u.converted === "boolean"
        && (drone ? u.side === "swarm" && !u.converted && squads.has(u.squad) && b.unlocks.includes(u.type)
          : u.squad === null && (u.side === "native" && !u.converted || u.side === "swarm" && u.structure && u.converted))
        && validOrder(u.order, b, zones) && slot(u.slot)
        && (u.home === null || zones.has(u.home)) && (u.raid === null || zones.has(u.raid))
        && (u.target === null || positiveId(u.target) && u.target < b.nextId);
    })) return null;
    const entityIds = [...b.units, ...b.pods].map(e => e.id);
    if (!entityIds.every(positiveId) || new Set(entityIds).size !== entityIds.length
      || b.nextId <= Math.max(0, ...entityIds, ...b.pods.map(p => p.waveId))) return null;
    if (!validWaves(b, squads, new Set(entityIds))) return null;
    if (!b.strikes.every(s => point(s) && between(s.radius, .001, 1000) && between(s.damage, 0, 1e6)
      && between(s.markedAt, 0, b.time) && between(s.hitAt, s.markedAt, b.time + 60) && typeof s.hit === "boolean"
      && (s.hit ? s.hitAt <= b.time : s.hitAt >= b.time - 1e-6) && ["artillery", "lightning"].includes(s.source))) return null;
    if (!b.log.every(l => between(l.t, 0, b.time) && text(l.text, 2048) && ["info", "good", "warn", "bad"].includes(l.tone))) return null;
    if (!validHazards(b.hazards, b)) return null;
    if (!point(value.cam?.focus) || !between(value.cam.distance, .001, 1e5) || !between(value.cam.yaw, -1e9, 1e9) || !between(value.cam.pitch, -Math.PI, Math.PI)) return null;
    return { ...jsonClone(value), command: restoreCommandState(command, b) };
  } catch { return null; }
}

// The planet to rebuild a checkpoint's terrain from: the map, city and landform the battle was
// built on, whatever the planet uses today (a pre-city save has neither and gets its old ground).
export function checkpointPlanet(checkpoint) {
  const b = checkpoint?.battle, planet = planetById(b?.planetId);
  if (!planet) return null;
  // A city world saved before its skyline became solid (no battle.skyline) keeps its open ground.
  return { ...planet, map: b.map, city: firstCity(b) || b.city || null, landform: b.landform || null,
    ...(planet.biome === "city" && !b.skyline ? { skyline: false } : {}) };
}

export function restoreMissionCheckpoint(value, terrain) {
  const saved = validMissionCheckpoint(value);
  if (!saved) return null;
  const battle = saved.battle;
  // JSON turns the initial -Infinity cooldown into null; never turn it into time zero.
  if (battle.lastDropAt === null) battle.lastDropAt = -Infinity;
  battle.isLand = terrain.isLand;
  battle.heightAt = terrain.heightAt;
  battle.canDropAt = terrain.canDropAt;
  battle.walkable = terrain.walkable || terrain.isLand;
  battle.roofAt = terrain.roofAt;
  battle.lineBlocked = terrain.lineBlocked;
  battle.events = []; // One-frame effects must not replay after loading.
  terrain.setPads?.(battle.zones);
  return { planet: planetById(battle.planetId), battle, cam: saved.cam, command: saved.command };
}
