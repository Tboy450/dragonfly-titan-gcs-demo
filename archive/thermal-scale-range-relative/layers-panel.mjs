// Mission-view Vehicle Layers panel: layer switch, thermal legend, parts list and selection.
import { systemsModel, thermalZoneTemps } from "../mission-systems.mjs?v=dev";
import { thermalCss, thermalGradientCss, thermalRanges } from "../thermal-scale.mjs?v=dev";
import { $, flightCanvas, state } from "./context.mjs?v=dev";
import { partMarkers } from "./flight-view.mjs?v=dev";

// ---- Vehicle layers (Mission view) and the shared systems readouts ----
let partRows = "";
export function updateLayerPanel() {
  const layered = state.missionLayer !== "exterior";
  document.querySelectorAll("[data-layer]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.layer === state.missionLayer)));
  $("thermal-legend").hidden = state.missionLayer !== "thermal";
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
  if (!layered) { $("part-detail").hidden = true; return; }
  const zones = thermalZoneTemps(state);
  const markers = partMarkers.length ? partMarkers : [];
  const rows = markers.map(marker => `${marker.index}|${marker.name}|${zones[marker.zone]?.c.toFixed(0)}|${marker.name === state.selectedPart}`).join(";");
  if (rows !== partRows) {
    partRows = rows;
    $("part-list").replaceChildren(...markers.map(marker => {
      const item = document.createElement("li");
      item.dataset.part = marker.name;
      item.classList.toggle("active", marker.name === state.selectedPart);
      const zone = zones[marker.zone];
      const number = document.createElement("b");
      number.textContent = marker.index;
      const name = document.createElement("span");
      name.textContent = marker.label;
      const temp = document.createElement("em");
      temp.textContent = zone ? `${zone.c.toFixed(0)} C` : "";
      if (zone && state.missionLayer === "thermal") temp.style.color = thermalCss(zone.c, range);
      item.append(number, name, temp);
      return item;
    }));
  }
  const selected = markers.find(marker => marker.name === state.selectedPart);
  $("part-detail").hidden = !selected;
  if (selected) {
    const zone = zones[selected.zone];
    $("part-detail").textContent = `${selected.index}. ${selected.label}: ${zone ? `${zone.c.toFixed(1)} C (${zone.source})` : "no temperature"}. Placement: ${selected.source}.`;
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
  partRows = "";
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
$("thermal-bar").style.background = thermalGradientCss();
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
    return distance < 18 && (!best || distance < best.distance) ? { marker, distance } : best;
  }, null);
  if (hit) selectPart(hit.marker.name);
});
try {
  const savedLayer = localStorage.getItem("dragonfly-mission-layer");
  if (["exterior", "internal", "thermal"].includes(savedLayer)) state.missionLayer = savedLayer;
} catch { /* optional */ }
