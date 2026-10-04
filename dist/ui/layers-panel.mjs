// Mission-view Vehicle Layers panel: layer switch, thermal legend, parts list and selection.
import { thermalZoneTemps } from "../mission-systems.mjs?v=dev";
import { thermalCss, thermalGradientCss, thermalRanges } from "../thermal-scale.mjs?v=dev";
import { $, flightCanvas, state } from "./context.mjs?v=dev";
import { partMarkers } from "./flight-view.mjs?v=dev";

// ---- Vehicle layers (Mission view) and the shared systems readouts ----
let partRows = "";
export function updateLayerPanel() {
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
  $("thermal-bar").style.background = thermalGradientCss(range);
  if (!layered) { $("part-detail").hidden = true; return; }
  const zones = thermalZoneTemps(state);
  const markers = partMarkers.length ? partMarkers : [];
  const rows = `${state.missionLayer}|${state.thermalRange}|` + markers.map(marker => `${marker.index}|${marker.name}|${marker.label}|${zones[marker.zone]?.c.toFixed(0)}|${marker.name === state.selectedPart}`).join(";");
  if (rows !== partRows) {
    partRows = rows;
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

function selectPart(name) {
  state.selectedPart = state.selectedPart === name ? null : name;
  if (state.selectedPart) $("component-temperatures").open = true;
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
