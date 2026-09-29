// Saved progress: which parts of the live state survive a page reload. Only landed states are
// saved, so a mission never resumes in mid-air. No DOM access here; ui/persistence.mjs stores it.
import { createPlan } from "./flight-plan.mjs?v=dev";

export const SAVE_VERSION = 1;
export const SAVE_KEY = "dragonfly-save-v1";

// Plain values and small arrays/objects that describe the mission, the vehicle and its settings.
const persistent = [
  // Where and when
  "positionX", "positionZ", "heading", "missionTime", "elapsed", "distance", "track",
  // Vehicle energy and thermal state, settings and faults
  "battery", "coreC", "batteryC", "rdeC", "twtaC", "noseElectronicsC", "trim", "trimClock", "trimIntegral",
  "thermalAuto", "fan", "fault", "arrivalElectricW", "wind", "payloadDelta",
  "motorsCold", "motorCoolClock", "preheatWh", "preheats",
  // Mission, scouting, science and data
  "mission", "scoutedSites", "scoutLog", "science", "dataStoredBits", "dataReturnedBits",
];

const copy = (value) => JSON.parse(JSON.stringify(value));

export function canSave(state) {
  return !state.edl && state.altitude <= 0.001 && Math.abs(state.verticalSpeed) < 0.05
    && !["uplinking", "executing"].includes(state.plan?.status);
}

export function snapshotState(state, savedAt = Date.now()) {
  const values = {};
  for (const key of persistent) if (state[key] !== undefined) values[key] = copy(state[key]);
  if (state.plan?.status === "draft") values.planDraft = { waypoints: copy(state.plan.waypoints), altitude: state.plan.altitude };
  return { version: SAVE_VERSION, savedAt, values };
}

// Applies a snapshot to a freshly created state. Returns false (and changes nothing) if the
// snapshot is from another version or malformed.
export function restoreState(state, snapshot) {
  if (!snapshot || snapshot.version !== SAVE_VERSION || typeof snapshot.values !== "object") return false;
  const { values } = snapshot;
  if (!Number.isFinite(values.positionX) || !Number.isFinite(values.battery)) return false;
  for (const key of persistent) if (values[key] !== undefined) state[key] = copy(values[key]);
  // Resume on the ground, idle, with nothing in progress.
  Object.assign(state, {
    altitude: 0, verticalSpeed: 0, speed: 0, auto: false, hold: false, altitudeHold: null,
    throttle: 0.18, pitch: 0, roll: 0, yaw: 0, pitchCmd: 0, rollCmd: 0, yawCmd: 0, mode: "Surface",
    hibernating: false, restSeconds: 0, downlinkActive: false, antennaDeploy: 0, timeWarp: 1, flightSeconds: 0,
  });
  state.mission.guidance = false;
  if (state.mission.phase === "sampling") { state.mission.phase = "sample"; state.mission.sampleSeconds = 0; }
  if (state.science) state.science.sampling = false;
  state.plan = createPlan();
  if (values.planDraft) Object.assign(state.plan, copy(values.planDraft));
  return true;
}
