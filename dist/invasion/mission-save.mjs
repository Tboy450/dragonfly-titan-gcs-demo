// Versioned, JSON-safe battle checkpoints. Terrain functions and renderer state are rebuilt.
import { planetById } from "./campaign.mjs?v=dev";
import { droneTypes, defenderTypes } from "./units.mjs?v=dev";
import { hazardTypes } from "./hazards.mjs?v=dev";
import { validPayload } from "./drop-waves.mjs?v=dev";
import { payloadCount, dropDurationS } from "./units.mjs?v=dev";

export const MISSION_SAVE_VERSION = 2;
const finite = Number.isFinite;
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const fields = (value, keys, check = finite) => object(value) && keys.every(key => check(value[key]));
const jsonClone = value => JSON.parse(JSON.stringify(value));
const positiveId = value => Number.isSafeInteger(value) && value > 0;
const validOrder = order => object(order) && ["hold", "move", "capture", "attack"].includes(order.kind)
  && fields(order, ["x", "z"]) && (order.pace === undefined || finite(order.pace) && order.pace > 0)
  && (order.kind !== "attack" || positiveId(order.target))
  && (order.kind !== "capture" || typeof order.zone === "string");

function migrateCheckpoint(value) {
  if (!object(value) || ![1, MISSION_SAVE_VERSION].includes(value.version)) return null;
  if (value.version === MISSION_SAVE_VERSION) return value;
  const upgraded = jsonClone(value), b = upgraded.battle;
  // A paid legacy pod keeps its complete payload and descent: never repack or charge it again.
  for (const pod of b.pods) Object.assign(pod, {
    waveId: pod.id, waveIndex: 0, waveCount: 1, slotStart: 0, stagger: 0, legacy: true,
  });
  b.stats.podsLaunched = b.stats.drops;
  upgraded.version = MISSION_SAVE_VERSION;
  return upgraded;
}

export function missionCheckpoint(mission) {
  if (!mission || mission.battle.outcome) return null;
  const { isLand, heightAt, canDropAt, ...battle } = mission.battle;
  return jsonClone({ version: MISSION_SAVE_VERSION, battle, cam: mission.cam });
}

export function validMissionCheckpoint(value) {
  try {
    value = migrateCheckpoint(value);
    if (!value) return null;
    const b = value.battle, p = planetById(b?.planetId);
    if (!p || b.outcome !== null || !fields(b, ["time", "rngState", "matter", "nextId", "podSlots", "required", "alarm", "alarmStage", "reinforceIn", "strikeIn", "refund", "tier", "threat"]) || b.time < 0) return null;
    if (b.lastDropAt !== null && !finite(b.lastDropAt)) return null;
    if (!fields(b.map, ["centerX", "centerZ", "half"]) || b.map.half <= 0 || !object(b.stats) || !Object.values(b.stats).every(finite)) return null;
    for (const key of ["zones", "units", "squads", "pods", "strikes", "events", "log", "specials", "objectives", "unlocks"]) if (!Array.isArray(b[key])) return null;
    if (b.units.length > 5000 || b.pods.length > 150 || b.squads.length > 5000) return null;
    if (!b.unlocks.every(t => droneTypes[t]) || !b.zones.some(z => z.kind === "beachhead")) return null;
    if (!b.zones.every(z => fields(z, ["x", "z", "radius", "control", "value", "population"]) && typeof z.id === "string" && typeof z.name === "string")) return null;
    if (!b.squads.every(s => positiveId(s.id) && typeof s.name === "string" && typeof s.color === "string"
      && (!s.order || s.order.kind === "hold" || validOrder(s.order)))) return null;
    const squads = new Set(b.squads.map(s => s.id));
    if (squads.size !== b.squads.length) return null;
    if (!b.units.every(u => fields(u, ["id", "x", "z", "hp", "alt", "vx", "vz", "maxHp", "heading", "fireIn"])
      && (droneTypes[u.type] || defenderTypes[u.type]) && ["swarm", "native"].includes(u.side)
      && typeof u.alive === "boolean" && validOrder(u.order) && fields(u.slot, ["dx", "dz"])
      && (u.squad === null || squads.has(u.squad)))) return null;
    if (!b.pods.every(pod => fields(pod, ["id", "x", "z", "t", "squad", "launchedAt", "stagger"])
      && positiveId(pod.id) && squads.has(pod.squad) && validPayload(pod.payload) && payloadCount(pod.payload) > 0
      && (pod.legacy === true ? payloadCount(pod.payload) <= 44 : payloadCount(pod.payload) <= 3
        && (!(pod.payload.dragonfly > 0) || payloadCount(pod.payload) === 1))
      && typeof pod.released === "boolean" && pod.released === (pod.t >= dropDurationS)
      && positiveId(pod.waveId) && Number.isInteger(pod.waveCount) && pod.waveCount > 0 && pod.waveCount <= 44
      && Number.isInteger(pod.waveIndex) && pod.waveIndex >= 0 && pod.waveIndex < pod.waveCount
      && Number.isInteger(pod.slotStart) && pod.slotStart >= 0 && pod.slotStart < 44
      && pod.stagger >= 0 && pod.stagger <= 10 && pod.launchedAt >= 0 && pod.launchedAt <= b.time
      && Math.abs(pod.t - (b.time - pod.launchedAt - pod.stagger)) < 1e-6
      && (!pod.pendingSlots || Array.isArray(pod.pendingSlots) && pod.pendingSlots.length === payloadCount(pod.payload)
        && pod.pendingSlots.every(s => fields(s, ["dx", "dz"]))))) return null;
    const entityIds = [...b.units, ...b.pods].map(e => e.id);
    if (!entityIds.every(positiveId) || new Set(entityIds).size !== entityIds.length
      || b.nextId <= Math.max(0, ...entityIds, ...b.pods.map(p => p.waveId))) return null;
    const wavePods = new Set();
    for (const pod of b.pods) {
      const key = `${pod.waveId}:${pod.waveIndex}`;
      if (wavePods.has(key) || b.pods.some(p => p.waveId === pod.waveId && (p.squad !== pod.squad || p.waveCount !== pod.waveCount))) return null;
      wavePods.add(key);
    }
    if (!b.log.every(l => fields(l, ["t"]) && typeof l.text === "string" && typeof l.tone === "string")) return null;
    const h = b.hazards;
    if (!object(h) || !Array.isArray(h.types) || !h.types.every(t => hazardTypes[t]) || !object(h.next) || !h.types.every(t => finite(h.next[t])) || !Array.isArray(h.events) || !h.events.every(e => hazardTypes[e.type] && fields(e, ["id", "activeAt", "endsAt"]))) return null;
    if (!fields(h, ["calm", "severity", "serial"]) || !fields(h.effects, ["speed", "sight", "range", "damage"]) || !fields(h.effects.wind, ["x", "z"]) || !Array.isArray(h.effects.zones)) return null;
    if (!fields(value.cam, ["distance", "yaw", "pitch"]) || value.cam.distance <= 0 || !fields(value.cam.focus, ["x", "z"])) return null;
    return jsonClone(value);
  } catch { return null; }
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
  battle.events = []; // One-frame effects must not replay after loading.
  terrain.setPads?.(battle.zones);
  return { planet: planetById(battle.planetId), battle, cam: saved.cam };
}
