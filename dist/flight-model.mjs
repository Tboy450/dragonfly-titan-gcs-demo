import { createSystemsState, guidanceTarget, stepSystems, flightRestriction, overLiquid } from "./mission-systems.mjs";
// Environmental values: APL's TFAWS 2024 report. Performance values are demo assumptions.
export const model = Object.freeze({
  massKg: 875, titanG: 1.352, earthG: 9.80665,
  rhoTitan: 5.44, rhoEarth: 1.225, pressureKpa: 146, temperatureK: 94,
  rotorCount: 8, rotorStations: 4, bladesPerRotor: 3, rotorDiameterM: 1.35,
  figureOfMerit: 0.75, inducedLossFactor: 1.15, batteryEnergyKwh: 11.5,
  dragAreaM2: 0.65,
  pitchRadians: Math.PI / 10, rollRadians: 22 * Math.PI / 180,
});

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
const follow = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));

export function createFlightState() {
  return {
    ...createSystemsState(),
    mode: "Preflight", auto: true, hold: false, missionTime: 0,
    altitude: 0, verticalSpeed: 0, speed: 0, throttle: 0.52,
    yaw: 0, pitch: 0, roll: 0, heading: 84, positionX: 0, positionZ: 0,
    battery: 96, power: 0, wind: 0.8, payloadDelta: 0,
    distance: 0, chart: [], track: [{ x: 0, z: 0 }], sampleTime: -1,
    rotorRpm: Array(8).fill(0), rotorPhase: Array(8).fill(0),
  };
}

export function deriveFlight(state) {
  const mass = model.massKg + state.payloadDelta;
  // Coaxial pairs share one swept area; eight rotors do not make eight independent disks.
  const totalArea = Math.PI * (model.rotorDiameterM / 2) ** 2 * model.rotorStations;
  const scaleHeight = model.pressureKpa * 1000 / (model.rhoTitan * model.titanG);
  const pressureKpa = model.pressureKpa * Math.exp(-Math.max(0, state.altitude) / scaleHeight);
  const density = model.rhoTitan * pressureKpa / model.pressureKpa;
  const titanWeight = mass * model.titanG;
  const earthWeight = mass * model.earthG;
  const inducedTitan = Math.sqrt(titanWeight / (2 * density * totalArea));
  const idealTitan = titanWeight * inducedTitan;
  // Ground-relative flight-path proxy, not the rotor-shaft inflow measured in the tunnel.
  const descentSpeed = Math.max(0, -state.verticalSpeed);
  const descentRatio = descentSpeed / inducedTitan;
  const descentAngleDeg = Math.atan2(descentSpeed, Math.max(0, state.speed)) * 180 / Math.PI;
  const steepDescentCaution = state.altitude > 0.1 && descentAngleDeg > 60 && descentRatio > 0.75 && descentRatio < 1.25;
  return {
    mass, totalArea, titanWeight, pressureKpa, density, inducedTitan, idealTitan,
    descentRatio, descentAngleDeg, steepDescentCaution,
    realisticTitan: idealTitan * model.inducedLossFactor / model.figureOfMerit,
    idealEarth: earthWeight * Math.sqrt(earthWeight / (2 * model.rhoEarth * totalArea)),
    diskLoading: titanWeight / totalArea,
  };
}

export function profileAt(t) {
  const phase = t % 180;
  if (phase < 22) return {
    mode: "Takeoff", altitude: lerp(0, 46, phase / 22), verticalSpeed: 2.1,
    speed: lerp(0, 4, phase / 22), throttle: 0.66, pitch: 0.12, roll: Math.sin(t * 0.9) * 0.06,
  };
  if (phase < 55) return {
    mode: "Hover", altitude: 46 + Math.sin(t * 0.7) * 0.9, verticalSpeed: Math.cos(t * 0.7) * 0.2,
    speed: 1.3 + Math.sin(t * 0.4) * 0.5, throttle: 0.54, pitch: 0.03, roll: Math.sin(t * 0.5) * 0.08,
  };
  if (phase < 122) return {
    mode: "Traverse", altitude: 48 + Math.sin(t * 0.28) * 2.2, verticalSpeed: Math.cos(t * 0.28) * 0.42,
    speed: 10 + Math.sin(t * 0.35) * 1.2, throttle: 0.61,
    pitch: 0.3 + Math.sin(t * 0.23) * 0.08, roll: Math.sin(t * 0.42) * 0.2,
  };
  if (phase < 158) return {
    mode: "Descent", altitude: lerp(48, 7, (phase - 122) / 36), verticalSpeed: -1.15,
    speed: lerp(7, 2.2, (phase - 122) / 36), throttle: 0.45, pitch: 0.08, roll: Math.sin(t * 0.5) * 0.1,
  };
  return { mode: "Surface", altitude: 0, verticalSpeed: 0, speed: 0, throttle: 0.18, pitch: 0, roll: 0 };
}

export function flightPower(state) {
  const d = deriveFlight(state), speed = Math.max(0, state.speed);
  const ratio = speed / d.inducedTitan;
  // Forward inflow reduces induced power; profile and parasite terms restore the high-speed rise.
  const inflow = Math.sqrt(2 / (Math.sqrt(ratio ** 4 + 4) + ratio ** 2));
  const induced = d.idealTitan * model.inducedLossFactor * inflow;
  const profile = (d.realisticTitan - d.idealTitan * model.inducedLossFactor) * (1 + 3 * (speed / 55) ** 2);
  const parasite = 0.5 * d.density * model.dragAreaM2 * speed ** 3;
  const climb = d.titanWeight * Math.max(0, state.verticalSpeed);
  return (induced + profile + parasite + climb) * (1 + state.wind * 0.025);
}

export function stepFlight(state, dt) {
  if (state.hold || dt <= 0) return;
  state.missionTime += dt;
  const restricted = flightRestriction(state);
  if (state.hibernating) {
    state.altitude = 0; state.verticalSpeed = 0; state.speed = 0; state.throttle = 0;
    state.mode = "Hibernation";
  } else if (restricted) {
    state.auto = false; state.mission.guidance = false;
    state.speed = follow(state.speed, 0, 2, dt);
    state.verticalSpeed = state.altitude > 0 ? state.battery > 0 ? -0.7
      : state.verticalSpeed + (-model.titanG - 0.04 * state.verticalSpeed * Math.abs(state.verticalSpeed)) * dt : 0;
    state.altitude = Math.max(0, state.altitude + state.verticalSpeed * dt);
    state.throttle = state.altitude > 0 && state.battery > 0 ? 0.4 : 0;
    state.pitch = 0; state.roll = 0; state.yaw = 0;
    state.mode = state.altitude > 0 ? "Safety descent" : "Flight inhibited";
  } else if (state.mission.guidance) {
    const target = guidanceTarget(state, dt);
    const before = state.altitude;
    const climb = clamp(target.altitude - state.altitude, -0.8, 1.2);
    state.altitude = Math.max(0, state.altitude + climb * dt);
    if (state.altitude < 0.03 && target.altitude === 0) state.altitude = 0;
    state.verticalSpeed = (state.altitude - before) / dt;
    state.speed = follow(state.speed, target.speed, 1.5, dt);
    state.throttle = target.throttle;
    state.pitch = state.speed / 25; state.roll = 0; state.yaw = 0;
    state.mode = "Guided survey";
  } else if (state.auto) {
    const target = profileAt(state.missionTime);
    state.mode = target.mode;
    const previousAltitude = state.altitude;
    state.altitude = follow(state.altitude, target.altitude, 5, dt);
    if (target.mode === "Surface" && state.altitude < 0.03) state.altitude = 0;
    state.verticalSpeed = (state.altitude - previousAltitude) / dt;
    state.speed = follow(state.speed, target.speed + (target.mode === "Surface" ? 0 : state.wind * 0.12), 5.6, dt);
    state.throttle = follow(state.throttle, target.throttle, 5.6, dt);
    state.pitch = follow(state.pitch, target.pitch, 5, dt);
    state.roll = follow(state.roll, target.roll, 5, dt);
    state.yaw = target.mode === "Surface" ? 0 : Math.sin(state.missionTime * 0.22) * 0.17;
  } else {
    const thrustBalance = (state.throttle - 0.5) * 5.2;
    state.verticalSpeed = clamp(state.verticalSpeed + (thrustBalance - 0.18) * dt, -3.5, 4.2);
    state.altitude = Math.max(0, state.altitude + state.verticalSpeed * dt);
    if (state.altitude === 0) state.verticalSpeed = Math.max(0, state.verticalSpeed);
    // Analytic first-order drag response keeps handling stable across frame rates.
    const decay = Math.exp(-0.08 * dt);
    state.speed = clamp(state.speed * decay + state.pitch * 3 / 0.08 * (1 - decay), 0, 16);
    state.mode = state.altitude < 0.05 ? "Surface" : state.speed > 5 ? "Traverse" : "Manual";
  }
  // Liquid is a no-landing zone in this training scenario, not a buoyancy simulation.
  if (overLiquid(state.positionX, state.positionZ) && state.altitude < 2 && !state.hibernating) {
    state.altitude = 2; state.verticalSpeed = Math.max(0, state.verticalSpeed);
    state.mode = "Liquid avoidance";
    state.mission.message = "Liquid below: landing inhibited. Move to dry ground.";
  }
  if (state.altitude === 0 && state.verticalSpeed === 0) state.speed = 0;
  state.heading = (state.heading + state.yaw * 22 * dt + 360) % 360;
  const bearing = state.heading * Math.PI / 180;
  state.positionX += Math.sin(bearing) * state.speed * dt;
  state.positionZ -= Math.cos(bearing) * state.speed * dt;
  state.distance += state.speed * dt;

  const d = deriveFlight(state);
  const stopped = state.altitude === 0 && state.throttle < 0.3;
  const baseRpm = stopped ? 0 : 780 * Math.sqrt(state.throttle * 2);
  // Order matches the 3D model: left front/rear then right front/rear, lower/upper.
  state.rotorRpm.forEach((rpm, i) => {
    const side = i < 4 ? -1 : 1;
    const front = Math.floor(i / 2) % 2 === 0 ? -1 : 1;
    const spin = i % 2 === 0 ? 1 : -1;
    const mix = 1 + front * state.pitch * 0.07 - side * state.roll * 0.08 + spin * state.yaw * 0.04;
    state.rotorRpm[i] = follow(rpm, baseRpm * mix, 4, dt);
    state.rotorPhase[i] = (state.rotorPhase[i] + state.rotorRpm[i] * Math.PI / 30 * dt * spin) % (Math.PI * 2);
  });
  state.power = stopped ? 100 : flightPower(state);
  stepSystems(state, dt, model.batteryEnergyKwh);
  if (state.sampleTime < 0 || state.missionTime - state.sampleTime >= 0.5 - 1e-9) {
    state.sampleTime = state.missionTime;
    state.chart.push({ time: state.missionTime, altitude: state.altitude, powerKw: state.power / 1000, speed: state.speed });
    if (state.chart.length > 180) state.chart.shift();
    const last = state.track.at(-1);
    if (Math.hypot(last.x - state.positionX, last.z - state.positionZ) >= 1) {
      state.track.push({ x: state.positionX, z: state.positionZ });
      if (state.track.length > 600) state.track.shift();
    }
  }
}

export function commandFlight(state, mode) {
  if (mode === "hold") { state.hold = !state.hold; return; }
  state.restSeconds = 0;
  state.hibernating = false;
  state.mission.guidance = false;
  state.hold = false;
  state.auto = mode === "auto";
  if (mode === "takeoff") { state.throttle = 0.68; state.pitch = 0.08; }
  if (mode === "cruise") { state.throttle = 0.6; state.pitch = 0.34; }
  if (mode === "land") { state.throttle = 0.39; state.pitch = 0; state.roll = 0; state.yaw = 0; }
}

export function advanceRest(state, seconds = 600) {
  if (state.hold || !state.hibernating) return;
  let remaining = Math.min(seconds, state.restSeconds);
  while (remaining > 0) {
    const dt = Math.min(1, remaining);
    stepFlight(state, dt);
    state.restSeconds -= dt;
    remaining -= dt;
    // A low charge is a reason to recharge, not a reason to interrupt recharge.
    if (state.coreC > 40 || state.batteryC < 5 || state.batteryC > 35 || state.fanIntegrity < 0.5) {
      state.restSeconds = 0;
      state.restNotice = "Accelerated time stopped: thermal inspection required.";
      break;
    }
  }
}
