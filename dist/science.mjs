// Science payload behavior. Instrument roles follow RESEARCH-COMPENDIUM.md §2.3 [PUB]:
// DrACO drills (one on each skid) feed samples pneumatically to DraMS (laser-desorption and GC
// modes); DraGNS measures bulk elemental composition with its own neutron source; DraGMet logs
// temperature, pressure, wind and methane humidity and carries a seismometer; DragonCam images
// the surface and scouts landing sites. The data volumes, rates, event timing and every
// "result" below are illustrative examples [EST], not mission data or predictions.
import { overLiquid, dampGround, surveySite, candidateSites, landed, systemsModel, flightRestriction, targetDistance } from "./mission-systems.mjs?v=dev";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const MBIT = 1e6;

export const scienceModel = Object.freeze({
  cameraMbitPerSecond: 0.25, metMbitPerSecond: 0.0005, gnsMbitPerSecond: 0.001,
  sampleMbit: 40, seismicEventMbit: 2, initialStoredMbit: 20,
  sampleSeconds: 30, sampleW: 160, gnsBaseUncertainty: 30,
  // Surface methane humidity near the Huygens site was around half of saturation; shown as ~45%.
  methaneHumidityPercent: 45,
});

// Illustrative ground types for this training geography.
export const groundTypes = Object.freeze({
  outcrop: Object.freeze({ name: "ice-rich outcrop", ice: 60, organics: 40, sample: "Water ice with trapped organics; the GC mode would search the extract for amino acids and other prebiotic molecules." }),
  damp: Object.freeze({ name: "rain-dampened interdune sand", ice: 8, organics: 92, sample: "Organic sand wetted by methane rain: aliphatic and aromatic hydrocarbons with dissolved ethane residue." }),
  sand: Object.freeze({ name: "organic interdune sand", ice: 12, organics: 88, sample: "Organic sand grains: aromatic hydrocarbons and nitrile-rich material, with a little water ice." }),
});

export function groundTypeAt(x, z) {
  if (overLiquid(x, z)) return null;
  if (Math.hypot(x - surveySite.x, z - surveySite.z) <= surveySite.radius + 2) return groundTypes.outcrop;
  if (Math.hypot((x - dampGround.x) / dampGround.rx, (z - dampGround.z) / dampGround.rz) < 0.9) return groundTypes.damp;
  return groundTypes.sand;
}

export function createScienceState() {
  return {
    dataStoredBits: scienceModel.initialStoredMbit * MBIT, sciencePowerW: 0,
    science: {
      cameraFrames: 0, frameClock: 0,
      gnsSeconds: 0, gnsSite: null,
      sampleSeconds: 0, sampling: false, samples: [],
      seismicClock: 0, seismicEvents: 0,
      log: [],
    },
  };
}

function logScience(state, text) {
  state.science.log.unshift({ time: state.elapsed, text });
  state.science.log.length = Math.min(state.science.log.length, 8);
}

// DraGNS precision improves with counting time (1 / sqrt(hours)).
export function gnsUncertainty(state) {
  const hours = state.science.gnsSeconds / 3600;
  return clamp(scienceModel.gnsBaseUncertainty / Math.sqrt(Math.max(hours, 0.01)), 2, 99);
}

export function canSampleHere(state) {
  if (state.edl || state.hold) return "Resume the simulation after arrival first.";
  if (["uplinking", "executing"].includes(state.plan?.status)) return "Finish or stop the flight plan first.";
  if (!landed(state)) return "Land and stop first.";
  if (state.hold) return "Resume the simulation first.";
  if (state.hibernating) return "Wake the lander first.";
  if (state.science.sampling || state.mission.phase === "sampling") return "A sample is already being analyzed.";
  if (!groundTypeAt(state.positionX, state.positionZ)) return "No drilling in liquid.";
  const restricted = flightRestriction(state);
  if (restricted) return restricted;
  if (state.battery <= systemsModel.reservePercent + 5) return "Battery too low for DrACO and DraMS.";
  return "";
}

function beginSample(state) {
  state.science.sampling = true;
  state.science.sampleSeconds = 0;
  logScience(state, "DrACO drilling; sample moving pneumatically to DraMS");
}

export function startSample(state) {
  const blocked = canSampleHere(state);
  if (blocked) return blocked;
  beginSample(state);
  if (state.mission.phase === "sample" && targetDistance(state) <= surveySite.radius) {
    state.mission.phase = "sampling";
    state.mission.sampleSeconds = 0;
    state.mission.message = "DrACO / DraMS sample acquisition";
  }
  return "";
}

// Advance the instruments by dt seconds. Sets sciencePowerW for the power budget.
export function stepScience(state, dt) {
  const s = state.science;
  const flying = state.altitude > 5;
  const isLanded = landed(state);
  let bits = 0;
  state.sciencePowerW = 0;
  if (!state.hibernating) bits += scienceModel.metMbitPerSecond * MBIT * dt;
  // DragonCam: navigation and scouting imagery in flight.
  if (flying) {
    bits += scienceModel.cameraMbitPerSecond * MBIT * dt;
    s.frameClock += dt;
    while (s.frameClock >= 2) { s.frameClock -= 2; s.cameraFrames += 1; }
  }
  // DraGNS counts while the lander sits on the ground; moving starts a new measurement.
  const ground = isLanded ? groundTypeAt(state.positionX, state.positionZ) : null;
  const siteKey = ground ? `${Math.round(state.positionX / 5)},${Math.round(state.positionZ / 5)}` : null;
  if (siteKey !== s.gnsSite) { s.gnsSite = siteKey; s.gnsSeconds = 0; }
  if (ground) {
    s.gnsSeconds += dt;
    bits += scienceModel.gnsMbitPerSecond * MBIT * dt;
  }
  // DraGMet seismometer: quiet ground (rotors stopped) lets it hear an occasional event.
  if (isLanded && state.throttle < 0.3) {
    s.seismicClock += dt;
    if (s.seismicClock >= 30 * 3600) {
      s.seismicClock = 0;
      s.seismicEvents += 1;
      bits += scienceModel.seismicEventMbit * MBIT;
      logScience(state, `DraGMet seismometer: event ${s.seismicEvents} recorded (illustrative)`);
    }
  }
  // DrACO + DraMS sample analysis.
  const surveying = state.mission.phase === "sampling";
  // The mission button requests the same instrument job as "Sample here".
  if (surveying && !s.sampling) beginSample(state);
  if (s.sampling) {
    // Stop if unsafe (asleep, thermal/energy restriction, or too little battery margin) or moved.
    const unsafe = state.hibernating || flightRestriction(state) || state.battery <= systemsModel.reservePercent + 5;
    const leftTarget = surveying && targetDistance(state) > surveySite.radius;
    if (!isLanded || !ground || unsafe || leftTarget) {
      s.sampling = false;
      s.sampleSeconds = 0;
      if (surveying) {
        state.mission.phase = "sample";
        state.mission.sampleSeconds = 0;
        state.mission.message = "Sampling interrupted: restore a safe, stationary landing.";
      }
      logScience(state, unsafe ? "Sample analysis interrupted: restore power and thermal conditions" : "Sample analysis interrupted: the lander moved");
    } else {
      const sampleDt = Math.min(dt, scienceModel.sampleSeconds - s.sampleSeconds);
      state.sciencePowerW += scienceModel.sampleW * sampleDt / dt;
      s.sampleSeconds = Math.min(scienceModel.sampleSeconds, s.sampleSeconds + sampleDt);
      if (surveying) state.mission.sampleSeconds = s.sampleSeconds;
      if (s.sampleSeconds >= scienceModel.sampleSeconds) {
        s.sampling = false;
        bits += scienceModel.sampleMbit * MBIT;
        const site = candidateSites.find(site => Math.hypot(site.x - state.positionX, site.z - state.positionZ) <= 10);
        s.samples.push({
          ground: ground.name, result: ground.sample, time: state.elapsed,
          siteId: site?.id ?? null, x: state.positionX, z: state.positionZ, ice: ground.ice, organics: ground.organics,
          // FIFO data boundary: previously returned bits cannot count as this sample's downlink.
          downlinkEndBits: state.dataReturnedBits + state.dataStoredBits + bits,
        });
        logScience(state, `DraMS: ${ground.name} analyzed`);
        if (surveying) {
          state.mission.samples = 1;
          state.mission.phase = "return";
          state.mission.message = "Sample secured. Return to base with energy reserve.";
        }
      }
    }
  }
  state.dataStoredBits += bits;
}
