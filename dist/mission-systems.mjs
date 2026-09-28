// Training geography and engineering limits, not an actual Dragonfly landing-site map.
export const surveySite = Object.freeze({ x: 145, z: -90, radius: 12, name: "Shore outcrop" });
export const pools = Object.freeze([{ x: 210, z: -110, rx: 43, rz: 29, level: 0.3 }]);
export function poolRadius(x, z, pool) {
  const u = (x - pool.x) / pool.rx, v = (z - pool.z) / pool.rz;
  const angle = Math.atan2(v, u);
  return Math.hypot(u, v) / (1 + 0.09 * Math.sin(angle * 3) + 0.05 * Math.cos(angle * 5));
}
export const overLiquid = (x, z) => pools.some(p => poolRadius(x, z, p) < 1);
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
export const systemsModel = Object.freeze({
  rtgElectricW: 110, rtgThermalW: 1800, ambientC: -179.15,
  coreCapacity: 60000, batteryCapacity: 30000, titanDaySeconds: 15.95 * 86400,
});

export function createSystemsState() {
  return {
    coreC: 15, batteryC: 12, trim: 0.15, thermalAuto: true, fan: 1,
    fault: "none", fanIntegrity: 1, insulationIntegrity: 1,
    generatedW: 110, netBatteryW: 0, heatInW: 0, heatOutW: 0,
    elapsed: 0, restSeconds: 0, restNotice: "", hibernating: false, guard: "",
    mission: { phase: "idle", sampleSeconds: 0, samples: 0, guidance: false, message: "Survey a fictional hydrocarbon shoreline from dry ground." },
  };
}

export function missionTarget(state) {
  return ["return", "complete"].includes(state.mission.phase) ? { x: 0, z: 0, radius: 12, name: "Base" } : surveySite;
}

export function targetDistance(state) {
  const target = missionTarget(state);
  return Math.hypot(target.x - state.positionX, target.z - state.positionZ);
}

export function flightRestriction(state) {
  if (state.battery <= 15) return "Battery reserve: land and recharge";
  if (state.coreC < -10 || state.coreC > 55 || state.batteryC < 0 || state.batteryC > 40) return "Temperature outside demo flight band";
  if (state.fanIntegrity < 0.5) return "Restricted circulation: service thermal loop";
  return "";
}

export function landed(state) {
  return state.altitude <= 0.001 && Math.abs(state.verticalSpeed) < 0.2 && state.speed < 0.3;
}

export function missionAction(state) {
  const m = state.mission;
  if (m.phase === "idle" || m.phase === "complete") {
    state.mission = { phase: "outbound", sampleSeconds: 0, samples: 0, guidance: false, message: "Reach the dry outcrop, land, and collect a sample." };
    return;
  }
  if (state.hold) { m.message = "Resume the simulation before issuing a mission command."; return; }
  if (m.phase === "sample") {
    if (!landed(state) || targetDistance(state) > surveySite.radius || overLiquid(state.positionX, state.positionZ)) {
      m.message = "Sampling requires a stationary touchdown inside the dry target."; return;
    }
    if (flightRestriction(state)) { m.message = "Restore energy and thermal margins before sampling."; return; }
    m.phase = "sampling";
    state.auto = false; state.throttle = 0; state.pitch = 0; state.roll = 0; state.yaw = 0;
    m.message = "DrACO / DraMS sample acquisition";
    return;
  }
  if (m.phase === "sampling") return;
  const blocked = flightRestriction(state);
  if (blocked) { m.message = blocked; return; }
  state.restSeconds = 0;
  state.hibernating = false;
  state.auto = false;
  m.guidance = !m.guidance;
  m.message = m.guidance ? `Guided approach to ${missionTarget(state).name}` : "Manual flight";
}

export function guidanceTarget(state, dt) {
  const target = missionTarget(state), distance = targetDistance(state);
  const bearing = (Math.atan2(target.x - state.positionX, -(target.z - state.positionZ)) * 180 / Math.PI + 360) % 360;
  const error = ((bearing - state.heading + 540) % 360) - 180;
  state.heading = (state.heading + clamp(error, -24 * dt, 24 * dt) + 360) % 360;
  const altitude = distance > 18 ? 18 : 0;
  const speed = distance < 3 || state.altitude < 3 && distance > 18 ? 0 : Math.min(5, distance * 0.18) * Math.max(0, Math.cos(error * Math.PI / 180));
  return { altitude, speed, throttle: altitude > state.altitude ? 0.62 : altitude < state.altitude ? 0.4 : 0.535 };
}

export function stepSystems(state, dt, batteryEnergyKwh) {
  state.elapsed += dt;
  state.fanIntegrity = state.fault === "fan" ? 0.35 : 1;
  state.insulationIntegrity = state.fault === "insulation" ? 0.45 : 1;
  const circulation = state.fan * state.fanIntegrity;
  state.generatedW = systemsModel.rtgElectricW;
  if (state.hibernating) state.power = 45 + 15 * state.fan ** 3;
  else state.power += 15 * state.fan ** 3 + (state.mission.phase === "sampling" ? 160 : 0);
  state.netBatteryW = state.generatedW - state.power;
  state.battery = clamp(state.battery + state.netBatteryW * dt / (batteryEnergyKwh * 36000), 0, 100);

  const delta = Math.max(0, state.coreC - systemsModel.ambientC);
  const leakUA = 1.25 / state.insulationIntegrity;
  // Lumped thermal network: retained RTG heat, equipment losses, duct rejection and battery coupling.
  state.heatInW = systemsModel.rtgThermalW * 0.24 * circulation + Math.min(600, state.power * 0.025);
  const convection = 0.6 + 0.3 * Math.sqrt(Math.max(0, state.wind)) + 0.15 * Math.sqrt(state.speed);
  const trimUA = 4 * circulation * convection;
  if (state.thermalAuto) {
    const target = clamp((state.heatInW - leakUA * delta + (state.coreC - 15) * 35) / Math.max(1, trimUA * delta), 0, 1);
    state.trim += (target - state.trim) * (1 - Math.exp(-dt / 8));
  }
  state.heatOutW = (leakUA + trimUA * state.trim) * delta;
  const batteryExchange = 8 * (state.coreC - state.batteryC);
  state.coreC += (state.heatInW - state.heatOutW - batteryExchange) * dt / systemsModel.coreCapacity;
  state.batteryC += (batteryExchange + Math.abs(state.netBatteryW) * 0.015 - 0.08 * (state.batteryC - systemsModel.ambientC)) * dt / systemsModel.batteryCapacity;
  state.guard = flightRestriction(state);

  const m = state.mission;
  if (m.phase === "idle" || m.phase === "complete") return;
  const atTarget = landed(state) && targetDistance(state) <= missionTarget(state).radius && !overLiquid(state.positionX, state.positionZ);
  if (m.phase === "outbound" && atTarget) {
    m.phase = "sample"; m.guidance = false; state.throttle = 0;
    m.message = "Dry outcrop reached. Sample acquisition ready.";
  } else if (m.phase === "sampling") {
    if (!atTarget || state.guard) {
      m.phase = "sample"; m.sampleSeconds = 0;
      m.message = "Sampling interrupted: restore a safe, stationary landing.";
    } else {
      m.sampleSeconds += dt;
      if (m.sampleSeconds >= 30) {
        m.samples = 1; m.phase = "return";
        m.message = "Sample secured. Return to base with energy reserve.";
      }
    }
  } else if (m.phase === "return" && atTarget) {
    m.phase = "complete"; m.guidance = false; state.throttle = 0;
    m.message = "Survey complete: one sample returned to base.";
  }
}

export function startRest(state, hours) {
  if (!landed(state) || state.hold || state.mission.phase === "sampling" || overLiquid(state.positionX, state.positionZ)) return false;
  state.auto = false; state.mission.guidance = false; state.throttle = 0;
  state.pitch = 0; state.roll = 0; state.yaw = 0;
  state.restSeconds = Math.max(0, hours * 3600);
  state.restNotice = "";
  state.hibernating = true;
  return true;
}
