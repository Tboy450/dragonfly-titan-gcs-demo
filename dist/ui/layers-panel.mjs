// Mission-view Vehicle Layers panel: layer switch, thermal legend, parts list and selection.
import { systemsModel, thermalZoneTemps } from "../mission-systems.mjs?v=dev";
import { thermalCss, thermalGradientCss, thermalRanges } from "../thermal-scale.mjs?v=dev";
import { $, flightCanvas, state } from "./context.mjs?v=dev";
import { partMarkers } from "./flight-view.mjs?v=dev";
import { samplingSequence } from "../science.mjs?v=dev";
import { updateInspectorUI } from "./vehicle-inspector.mjs?v=dev";
import { focusInspector } from "../vehicle-inspector.mjs?v=dev";

const sources = {
  thermal: ["Thermal layout (ICES 2023)", "https://ttu-ir.tdl.org/server/api/core/bitstreams/0737a596-5ba9-488b-9cc6-0b2ed93e2cd5/content"],
  integration: ["NASA integration update", "https://science.nasa.gov/blogs/dragonfly/2026/03/10/nasas-dragonfly-mission-begins-rotorcraft-integration-testing-stage/"],
  payload: ["APL payload reference", "https://dragonfly.jhuapl.edu/What-Is-Dragonfly/Spacecraft-and-Science-Payload.php"],
  spacecraft: ["NASA spacecraft and instruments", "https://science.nasa.gov/mission/dragonfly/spacecraft-and-instruments/"],
  sampling: ["NASA sample-transfer design", "https://science.nasa.gov/science-research/science-enabling-technology/technology-highlights/playing-lacrosse-on-titan/"],
  carousel: ["NASA carousel integration", "https://science.nasa.gov/blogs/dragonfly/2026/04/23/nasas-dragonfly-rotorcraft-gets-decked-out-tested/"],
  carouselPhotos: ["Carousel photos: NASA/Mike Guinto", "https://svs.gsfc.nasa.gov/15003"],
  carouselDesign: ["NASA carousel thermal-interface design (2024)", "https://ntrs.nasa.gov/api/citations/20230017316/downloads/AIAA_SCITECH2024_final_proof.pdf"],
};
const componentInfo = {
  iem: ["Runs spacecraft commands and processes vehicle data. Its displayed temperature is the shared bay-air model, not a separately simulated processor sensor.", "integration"],
  "power-units": ["Two power switching units distribute electrical power. The readings below are for the whole vehicle; separate PSU currents are not modeled.", "integration"],
  "frontier-radio": ["Frontier provides the X-band communications link. Stored instrument data remain queued until the radio and antenna are ready.", "spacecraft"],
  twta: ["The traveling-wave tube amplifier supports the Earth downlink. Its temperature is an estimate linked to radio operation.", "spacecraft"],
  drills: ["DrACO grinds surface material with redundant drills. The reference places the drill/feed hardware beside the body, above the landing runners.", "sampling"],
  "sample-lines": ["Blowers carry loosened material in Titan gas through transfer tubes into a sample cup. The displayed tube route is illustrative.", "sampling"],
  "sample-carousel": ["Photo-referenced casing and cooling fins surround the sample cups; the drives sit below. The housing stays fixed. The indexing ring is a diagram cue, not visible flight hardware. Drum diameter (0.36 m), fittings and placement are estimates, not flight CAD. Thermal uses cold-attic temperature above and bay temperature for the drives; no separate sensor or fin-gradient simulation.", "carouselPhotos"],
  drams: ["DraMS analyzes material using laser desorption and gas chromatography. The simulator's shortened sampling job combines collection and analysis.", "carousel"],
  battery: ["The battery supplies flight power and recharges from the MMRTG. The thermal model includes a phase-change buffer and inhibits charging outside its permitted band.", "thermal"],
  fan: ["Circulates MMRTG-warmed, nitrogen-rich gas through the under-floor duct and equipment bay.", "thermal"],
  "underfloor-duct": ["Routes warmed gas forward below the floor before it returns through the equipment bay.", "thermal"],
  "trim-chimneys": ["Flaps divert a controlled fraction of the circulation through cold ducts to reject heat to Titan's atmosphere.", "thermal"],
};

function liveComponentReading(name) {
  if (name === "iem") return `Vehicle mode: ${state.mode}. Flight plan: ${state.plan?.status ?? "none"}.`;
  if (name === "power-units") return `Vehicle load ${(state.power / 1000).toFixed(2)} kW; MMRTG generation ${state.generatedW.toFixed(0)} W. Modeled totals.`;
  if (["frontier-radio", "twta", "hga-actuators"].includes(name)) return `${state.downlinkW > 0 ? "Transmitting" : state.downlinkActive ? "Preparing antenna" : "Radio idle"}; ${(state.dataStoredBits / 1e6).toFixed(1)} Mbit queued. Downlink system load ${state.downlinkW.toFixed(0)} W (modeled).`;
  if (["drills", "sample-lines", "sample-carousel", "drams", "drill-blower"].includes(name)) return state.science.sampling
    ? `${samplingSequence(state).label}${state.hold ? " / paused" : ""}: ${(samplingSequence(state).progress * 100).toFixed(0)}% of the ${samplingSequence(state).duration} s training cycle; ${state.sciencePowerW.toFixed(0)} W instrument load (modeled).`
    : `Sampling idle; ${state.science.samples.length} completed sample records.`;
  if (["battery", "battery-sensor"].includes(name)) return `Charge ${state.battery.toFixed(1)}%; ${state.chargingBlocked ? "charging inhibited by temperature" : `${Math.abs(state.netBatteryW).toFixed(0)} W ${state.netBatteryW >= 0 ? "charging" : "discharging"}`} (modeled).`;
  if (["fan", "underfloor-duct", "trim-chimneys"].includes(name)) return `Gas flow ${state.gasFlow.toFixed(3)} kg/s; trim ${(state.effectiveTrim * 100).toFixed(0)}%; cold-duct heat rejection ${state.coldDuctW.toFixed(0)} W (modeled).`;
  return "";
}

// ---- Vehicle layers (Mission view) and the shared systems readouts ----
let partRows = "";
let detailKey = "";
const rowElements = new Map();
export function updateLayerPanel() {
  updateInspectorUI();
  const layered = state.missionLayer !== "exterior";
  $("component-temperatures").hidden = !layered;
  document.querySelectorAll("[data-layer]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.layer === state.missionLayer)));
  $("thermal-legend").hidden = !layered;
  const mock = layered && state.vehicleModel === "original";
  $("part-list").hidden = !layered;
  $("mock-banner").hidden = !mock;
  $("layer-note").hidden = !layered || mock;
  const range = thermalRanges[state.thermalRange];
  $("thermal-min").textContent = `${range.min} C`;
  $("thermal-max").textContent = `${range.max} C`;
  $("thermal-range").textContent = `Scale: ${range.label.toLowerCase()}`;
  $("airflow-panel").hidden = state.missionLayer !== "internal" || mock;
  if (state.missionLayer === "internal" && !mock) updateAirflowPanel();
  $("thermal-bar").style.background = thermalGradientCss(range);
  if (!layered) { $("part-detail").hidden = true; return; }
  const zones = thermalZoneTemps(state);
  const markers = partMarkers.length ? partMarkers : [];
  const rows = markers.map(marker => `${marker.index}|${marker.name}|${marker.label}`).join(";");
  if (rows !== partRows) {
    partRows = rows;
    rowElements.clear();
    $("part-list").replaceChildren(...markers.map(marker => {
      const item = document.createElement("li");
      item.dataset.part = marker.name;
      item.classList.toggle("active", marker.name === state.selectedPart);
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-pressed", String(marker.name === state.selectedPart));
      const zone = zones[marker.zone];
      const number = document.createElement("b");
      number.textContent = marker.index;
      const name = document.createElement("span");
      name.textContent = marker.label;
      const temp = document.createElement("em");
      temp.textContent = zone ? `${zone.c.toFixed(0)} C` : "";
      if (zone) temp.style.color = thermalCss(zone.c);
      button.append(number, name, temp);
      item.append(button);
      rowElements.set(marker.name, { item, button, temp });
      return item;
    }));
  }
  // Update in place so live telemetry never removes a focused component button.
  for (const marker of markers) {
    const { item, button, temp } = rowElements.get(marker.name);
    const active = marker.name === state.selectedPart;
    item.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
    const zone = zones[marker.zone];
    temp.textContent = zone ? `${zone.c.toFixed(0)} C` : "";
    if (zone) temp.style.color = thermalCss(zone.c);
  }
  const selected = markers.find(marker => marker.name === state.selectedPart);
  $("part-detail").hidden = !selected;
  if (selected) {
    const zone = zones[selected.zone];
    $("part-title").textContent = `${selected.index}. ${selected.label}`;
    $("part-temperature").textContent = zone ? `${zone.c.toFixed(1)} C - ${zone.source}.` : "No temperature available.";
    $("part-placement").textContent = `Placement: ${selected.source}.`;
    const info = selected.mock ? null : componentInfo[selected.name];
    $("part-role").textContent = info?.[0] ?? "";
    $("part-role").hidden = !info;
    const reading = selected.mock ? "" : liveComponentReading(selected.name);
    $("part-live").textContent = reading;
    $("part-live").hidden = !reading;
    const key = `${selected.name}|${selected.mock}`;
    if (key !== detailKey) {
      detailKey = key;
      const entries = selected.mock ? [] : [...new Set([info?.[1] ?? "thermal", ...(selected.name === "sample-carousel" ? ["carouselDesign"] : []), "payload"])];
      $("part-sources").replaceChildren(...entries.map(id => {
        const link = document.createElement("a");
        [link.textContent, link.href] = sources[id];
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        return link;
      }));
    }
  }
}

// Live description of the warm-air loop: how it moves, how it is regulated, how it is measured.
function updateAirflowPanel() {
  const flow = state.gasFlow ?? systemsModel.gasMassFlow;
  const fan = Math.round((state.fan ?? 1) * 100);
  // Gas speed in the under-floor duct: density of the warm N2-rich gas at 146 kPa, divided into
  // the modeled duct's 16 x 4.5 cm section [EST].
  const density = 146000 * 0.028 / (8.314 * (273.15 + (state.coreC ?? 12)));
  const ductSpeed = flow / density / (0.16 * 0.045);
  const trim = Math.round((state.effectiveTrim ?? 0) * 100);
  const next = Math.max(0, state.trimClock ?? 0);
  const clock = `${Math.floor(next / 60)}:${String(Math.floor(next % 60)).padStart(2, "0")}`;
  $("air-moves").textContent = `The fan (${fan}%${state.fanIntegrity < 1 ? ", restricted" : ""}) moves ${flow.toFixed(3)} kg/s `
    + `(design 0.052 kg/s) of nitrogen-rich Titan gas, warmed to ${(state.warmGasC ?? 0).toFixed(0)} C by the MMRTG's waste heat, `
    + `forward through the under-floor duct (about ${ductSpeed.toFixed(1)} m/s, estimate) and back through the bay at ${(state.coreC ?? 0).toFixed(0)} C.`;
  $("air-regulated").textContent = `The trim flaps send ${trim}% of the flow through the exposed cold duct on each side (0-40% in 2% steps), `
    + `dumping ${(state.coldDuctW ?? 0).toFixed(0)} W to Titan. `
    + (state.trimFlightLocked ? "Held closed in flight. " : state.thermalAuto ? `Automatic; next adjustment in ${clock}. ` : "Manual setting. ")
    + "Dragonfly uses two controllers taking turns, on battery and MMRTG fin-root temperature, about every 10 minutes; this simulator uses one simplified loop on battery and bay temperature.";
  $("air-measured").textContent = `Battery ${(state.batteryC ?? 0).toFixed(1)} C and the MMRTG fin root (here, the modeled gas temperature) `
    + "are the controller inputs (green dots). The flow is the published design rate, not a live measurement. "
    + "NASA's full-scale ground test model carried 203 thermocouples and 15 air-velocity sensors.";
}

function selectPart(name) {
  state.selectedPart = state.selectedPart === name ? null : name;
  if (state.inspector.focusPart || state.inspector.followSampling || state.inspector.isolate) focusInspector(state, state.selectedPart);
  if (state.selectedPart) $("component-temperatures").open = true;
  updateLayerPanel();
}

document.querySelectorAll("[data-layer]").forEach(button => button.addEventListener("click", () => {
  state.missionLayer = button.dataset.layer;
  try { localStorage.setItem("dragonfly-mission-layer", state.missionLayer); } catch { /* optional */ }
  partRows = "";
  updateLayerPanel();
}));
$("thermal-range").addEventListener("click", () => {
  state.thermalRange = state.thermalRange === "full" ? "inside" : "full";
  partRows = "";
  updateLayerPanel();
});
$("part-list").addEventListener("click", (event) => {
  const row = event.target.closest("li[data-part]");
  if (row) selectPart(row.dataset.part);
});
flightCanvas.addEventListener("click", (event) => {
  if (state.view !== "mission" || !partMarkers.length) return;
  const rect = flightCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left, y = event.clientY - rect.top;
  const hit = partMarkers.reduce((best, marker) => {
    const distance = Math.hypot(marker.x - x, marker.y - y);
    return marker.drawn && distance < 18 && (!best || distance < best.distance) ? { marker, distance } : best;
  }, null);
  if (hit) selectPart(hit.marker.name);
});
try {
  const savedLayer = localStorage.getItem("dragonfly-mission-layer");
  if (["exterior", "internal", "thermal"].includes(savedLayer)) state.missionLayer = savedLayer;
} catch { /* optional */ }
