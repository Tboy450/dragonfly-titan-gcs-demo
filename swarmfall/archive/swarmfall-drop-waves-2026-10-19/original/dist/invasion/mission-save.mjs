// Versioned, JSON-safe battle checkpoints. Terrain functions and renderer state are rebuilt.
import { planetById } from "./campaign.mjs?v=dev";
import { droneTypes, defenderTypes } from "./units.mjs?v=dev";
import { hazardTypes } from "./hazards.mjs?v=dev";

export const MISSION_SAVE_VERSION = 1;
const finite = Number.isFinite;
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const fields = (value, keys, check = finite) => object(value) && keys.every(key => check(value[key]));
const jsonClone = value => JSON.parse(JSON.stringify(value));

export function missionCheckpoint(mission) {
  if (!mission || mission.battle.outcome) return null;
  const { isLand, ...battle } = mission.battle;
  return jsonClone({ version: MISSION_SAVE_VERSION, battle, cam: mission.cam });
}

export function validMissionCheckpoint(value) {
  try {
    if (!object(value) || value.version !== MISSION_SAVE_VERSION) return null;
    const b = value.battle, p = planetById(b?.planetId);
    if (!p || b.outcome !== null || !fields(b, ["time", "rngState", "matter", "nextId", "podSlots", "required", "alarm", "alarmStage", "reinforceIn", "strikeIn", "refund", "tier", "threat"]) || b.time < 0) return null;
    if (b.lastDropAt !== null && !finite(b.lastDropAt)) return null;
    if (!fields(b.map, ["centerX", "centerZ", "half"]) || b.map.half <= 0 || !object(b.stats) || !Object.values(b.stats).every(finite)) return null;
    for (const key of ["zones", "units", "squads", "pods", "strikes", "events", "log", "specials", "objectives", "unlocks"]) if (!Array.isArray(b[key])) return null;
    if (!b.unlocks.every(t => droneTypes[t]) || !b.zones.some(z => z.kind === "beachhead")) return null;
    if (!b.zones.every(z => fields(z, ["x", "z", "radius", "control", "value", "population"]) && typeof z.id === "string" && typeof z.name === "string")) return null;
    if (!b.squads.every(s => fields(s, ["id"]) && typeof s.name === "string" && typeof s.color === "string")) return null;
    if (!b.units.every(u => fields(u, ["id", "x", "z", "hp", "alt"]) && (droneTypes[u.type] || defenderTypes[u.type]) && ["swarm", "native"].includes(u.side) && typeof u.alive === "boolean" && object(u.order))) return null;
    if (!b.pods.every(pod => fields(pod, ["id", "x", "z", "t", "squad", "launchedAt"]) && object(pod.payload) && Object.entries(pod.payload).every(([t, n]) => droneTypes[t] && Number.isInteger(n) && n >= 0))) return null;
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
  battle.events = []; // One-frame effects must not replay after loading.
  terrain.setPads?.(battle.zones);
  return { planet: planetById(battle.planetId), battle, cam: saved.cam };
}
