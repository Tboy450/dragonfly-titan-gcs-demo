// Science Payload panel: instrument states, sampling, science log and data store.
import { landed, systemsModel } from "../mission-systems.mjs?v=dev";
import { canSampleHere, gnsUncertainty, groundTypeAt, scienceModel, startSample } from "../science.mjs?v=dev";
import { $, formatTime, state } from "./context.mjs?v=dev";

// ---- Science payload ----
export function updateScience(d) {
  const s = state.science;
  const ground = landed(state) ? groundTypeAt(state.positionX, state.positionZ) : null;
  $("drams-state").textContent = s.sampling ? `Analyzing ${Math.ceil(scienceModel.sampleSeconds - s.sampleSeconds)} s` : s.samples.length ? `${s.samples.length} sample${s.samples.length === 1 ? "" : "s"} analyzed` : "Ready";
  $("draco-state").textContent = s.sampling ? "Drilling / transfer" : ground ? "Ready to drill" : "Stowed";
  $("dragns-state").textContent = ground ? `${ground.name}: ice ~${ground.ice}% / organics ~${ground.organics}% (+/-${gnsUncertainty(state).toFixed(0)}%)` : "Standby (counts when landed)";
  $("camera-state").textContent = state.altitude > 5 ? `Imaging: ${s.cameraFrames} frames` : `Hazcam / ${s.cameraFrames} frames`;
  $("dragmet-state").textContent = `94 K / ${d.pressureKpa.toFixed(1)} kPa / ${state.wind.toFixed(1)} m/s / CH4 ~${scienceModel.methaneHumidityPercent}% / ${s.seismicEvents} quakes`;
  const blocked = canSampleHere(state);
  $("sample-here").disabled = !!blocked;
  $("sample-here").title = blocked || "Drill here and analyze the sample (about 160 W for 30 s)";
  const last = s.samples.at(-1);
  $("science-result").textContent = last ? `Latest DraMS result (${last.ground}): ${last.result}` : blocked ? `Sampling: ${blocked}` : "No samples analyzed yet.";
  const log = $("science-log");
  const text = s.log.map(entry => entry.text).join("|");
  if (log.dataset.text !== text) {
    log.dataset.text = text;
    log.replaceChildren(...s.log.slice(0, 5).map(entry => { const item = document.createElement("li"); item.textContent = entry.text; return item; }));
  }
  $("data-stored").textContent = `${(state.dataStoredBits / 1e6).toFixed(1)} Mbit`;
  const rate = systemsModel.downlinkW / (systemsModel.downlinkJoulesPerBitAu * systemsModel.earthRangeAu);
  $("data-eta").textContent = state.dataStoredBits > 0 ? formatTime(state.dataStoredBits / rate) : "--";
  $("downlink-warp").hidden = !state.downlinkActive;
}
$("sample-here").addEventListener("click", () => { startSample(state); });
