// Titan day cycle: a time-scaled version of Dragonfly's operations rhythm. Published: about one
// flight per Titan day, flown in daylight when Earth is in view; flights and communications by
// day, battery recharging plus seismic and weather work at night [PUB, Lorenz 2018; Eos 2025;
// RESEARCH-COMPENDIUM.md section 3.5]. A Titan day is 382.7 h (about 16 Earth days). Here,
// flights, sampling and downlinks run in real time (sampling shortened to 30 s) and waiting is
// compressed: "Sleep until dawn" passes the rest of the day and the night in a few seconds.
// The operations day runs dawn (06:00 local) to dawn; the simulation starts at local noon.
import { startRest, systemsModel, titanLocalHour } from "./mission-systems.mjs?v=dev";

const dayLength = () => systemsModel.titanDaySeconds;
// Simulated seconds advanced per frame while sleeping until dawn (normal hibernation uses 600).
export const dawnSleepStepSeconds = 2400;

export function titanDayNumber(state) {
  return Math.floor(state.elapsed / dayLength() + 0.25) + 1;
}

export function hoursUntilDawn(state) {
  return ((titanDayNumber(state) - 0.25) * dayLength() - state.elapsed) / 3600;
}

export function dayPhase(state) {
  const hour = titanLocalHour(state);
  if (hour >= 6 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 18) return "Afternoon";
  return "Night";
}

// Fraction of the operations day gone (0 at dawn, 0.5 at dusk, 1 at the next dawn).
export function dayProgress(state) {
  return ((titanLocalHour(state) - 6 + 24) % 24) / 24;
}

// Today's operations log; starts fresh at each dawn.
export function updateDayLog(state) {
  const day = titanDayNumber(state);
  const returned = state.dataReturnedBits || 0, samples = state.science?.samples?.length || 0;
  let log = state.dayLog;
  if (!log || log.day !== day) {
    log = state.dayLog = { day, flights: 0, airborne: false, downlinked: false, sampled: false, returnedAtStart: returned, samplesAtStart: samples };
  }
  const airborne = state.altitude > 1;
  if (airborne && !log.airborne) log.flights += 1;
  log.airborne = airborne;
  if (returned > log.returnedAtStart) log.downlinked = true;
  if (samples > log.samplesAtStart) log.sampled = true;
  return log;
}

export function sleepUntilDawn(state) {
  if (!startRest(state, hoursUntilDawn(state))) return false;
  state.wakeAtDawn = true;
  state.nightStart = {
    battery: state.battery, seismic: state.science?.seismicEvents || 0, storedBits: state.dataStoredBits || 0,
  };
  return true;
}

// Called each frame: wakes the lander at dawn after "Sleep until dawn" and writes the morning
// report. Returns the report text when it wakes, otherwise "".
export function finishNight(state) {
  if (!state.wakeAtDawn) return "";
  if (!state.hibernating || state.restNotice) { state.wakeAtDawn = false; return ""; }
  if (state.restSeconds > 0) return "";
  state.wakeAtDawn = false;
  state.hibernating = false;
  const start = state.nightStart || {};
  const quakes = (state.science?.seismicEvents || 0) - (start.seismic || 0);
  const stored = (state.dataStoredBits || 0) / 1e6;
  const report = `Dawn, Titan day ${titanDayNumber(state)}: battery ${Math.round(start.battery ?? state.battery)}% to ${Math.round(state.battery)}%, `
    + `${quakes} seismic event${quakes === 1 ? "" : "s"} and the weather logged overnight, ${stored.toFixed(0)} Mbit waiting to send. Downlink, then plan today's flight.`;
  state.dayReport = report;
  state.mission.message = report;
  return report;
}
