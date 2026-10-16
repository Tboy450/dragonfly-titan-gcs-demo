import { $, chaseRenderer, flightCanvas, state } from "./context.mjs?v=dev";
import { commandFlight } from "../flight-model.mjs?v=dev";
import { samplingSequence } from "../science.mjs?v=dev";
import { focusInspector, inspectionAvailable, inspectionTarget, resetInspector, rotateInspector, zoomInspector } from "../vehicle-inspector.mjs?v=dev";

const parts = Object.values(chaseRenderer?.subsystems ?? {}).filter(group => group.userData.label);
const select = $("inspection-part");
for (const part of parts) {
  const option = document.createElement("option");
  option.value = part.name;
  option.textContent = part.userData.label;
  select.append(option);
}
let pointer = null, moved = false, suppressClick = false, lastX = 0, lastY = 0, startX = 0, startY = 0;
const available = () => !!chaseRenderer && inspectionAvailable(state);
const rotating = () => available() && state.inspector.rotate;
function releasePointer() {
  if (pointer !== null && flightCanvas.hasPointerCapture(pointer)) flightCanvas.releasePointerCapture(pointer);
  pointer = null;
}

export function updateInspectorUI() {
  const enabled = available();
  $("vehicle-inspector").hidden = !enabled;
  document.body.classList.toggle("inspection-rotate", enabled && state.inspector.rotate);
  flightCanvas.tabIndex = enabled ? 0 : -1;
  if (!enabled) { releasePointer(); return; }
  const i = state.inspector, target = inspectionTarget(state), job = samplingSequence(state);
  if (i.followSampling && job.active) state.selectedPart = target;
  const chosen = parts.some(part => part.name === state.selectedPart) ? state.selectedPart : "";
  if (select.value !== chosen) select.value = chosen;
  $("inspection-rotate").setAttribute("aria-pressed", String(i.rotate));
  $("inspection-zoom-value").textContent = `${Math.round(i.zoom * 100)}%`;
  $("inspection-zoom-out").disabled = i.zoom <= 0.6;
  $("inspection-zoom-in").disabled = i.zoom >= 3;
  $("inspection-focus").disabled = !chosen;
  $("inspection-isolate").disabled = !target;
  $("inspection-isolate").checked = i.isolate;
  $("inspection-follow").checked = i.followSampling;
  const pause = $("inspection-pause");
  pause.disabled = !job.active;
  pause.setAttribute("aria-label", state.hold ? "Resume simulation and sampling" : "Pause simulation and sampling");
  pause.title = pause.getAttribute("aria-label");
  const icon = state.hold ? "play" : "pause";
  if (pause.dataset.icon !== icon) {
    pause.dataset.icon = icon;
    pause.querySelector("img").src = icon === "play" ? "./vendor/lucide/play.svg?v=dev" : "./vendor/lucide/pause.svg?v=dev";
  }
  const label = i.followSampling ? job.active ? `${job.label}${state.hold ? " / paused" : ""}` : "Waiting for sample" : target ? "Component inspection" : "Whole vehicle";
  if ($("inspection-status").textContent !== label) $("inspection-status").textContent = label;
}

select.addEventListener("change", () => { focusInspector(state, select.value || null); updateInspectorUI(); });
$("inspection-focus").addEventListener("click", () => { focusInspector(state, state.selectedPart); updateInspectorUI(); });
$("inspection-reset").addEventListener("click", () => { resetInspector(state.inspector); state.selectedPart = null; releasePointer(); updateInspectorUI(); });
$("inspection-rotate").addEventListener("click", () => {
  state.inspector.rotate = !state.inspector.rotate;
  if (!state.inspector.rotate) releasePointer();
  updateInspectorUI();
});
$("inspection-zoom-in").addEventListener("click", () => { zoomInspector(state.inspector, 1.2); updateInspectorUI(); });
$("inspection-zoom-out").addEventListener("click", () => { zoomInspector(state.inspector, 1 / 1.2); updateInspectorUI(); });
$("inspection-isolate").addEventListener("change", event => { state.inspector.isolate = event.target.checked; });
$("inspection-follow").addEventListener("change", event => {
  state.inspector.followSampling = event.target.checked;
  state.inspector.focusPart = null;
  state.inspector.zoom = 1;
  updateInspectorUI();
});
$("inspection-pause").addEventListener("click", () => { commandFlight(state, "hold"); updateInspectorUI(); });

flightCanvas.addEventListener("pointerdown", event => {
  if (!rotating() || pointer !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
  pointer = event.pointerId; moved = false; suppressClick = false;
  lastX = startX = event.clientX; lastY = startY = event.clientY;
  flightCanvas.setPointerCapture(pointer);
});
flightCanvas.addEventListener("pointermove", event => {
  if (event.pointerId !== pointer) return;
  if (!rotating()) { releasePointer(); return; }
  if (!moved && Math.hypot(event.clientX - startX, event.clientY - startY) < 4) return;
  moved = true;
  const rect = flightCanvas.getBoundingClientRect();
  rotateInspector(state.inspector, event.clientX - lastX, event.clientY - lastY, rect.width, rect.height);
  lastX = event.clientX; lastY = event.clientY;
});
flightCanvas.addEventListener("pointerup", event => {
  if (event.pointerId !== pointer) return;
  suppressClick = moved;
  releasePointer();
});
flightCanvas.addEventListener("pointercancel", releasePointer);
flightCanvas.addEventListener("lostpointercapture", () => { pointer = null; });
flightCanvas.addEventListener("click", event => {
  if (!suppressClick) return;
  suppressClick = false;
  event.preventDefault(); event.stopImmediatePropagation();
}, true);
flightCanvas.addEventListener("keydown", event => {
  if (!available() || event.ctrlKey || event.metaKey || event.altKey) return;
  const directions = { ArrowLeft: [-30,0], ArrowRight: [30,0], ArrowUp: [0,-30], ArrowDown: [0,30] };
  if (directions[event.key]) rotateInspector(state.inspector, ...directions[event.key], 600, 600);
  else if (event.key === "+" || event.key === "=") zoomInspector(state.inspector, 1.2);
  else if (event.key === "-") zoomInspector(state.inspector, 1 / 1.2);
  else if (event.key === "Home") { resetInspector(state.inspector); state.selectedPart = null; releasePointer(); }
  else return;
  event.preventDefault(); event.stopPropagation(); updateInspectorUI();
});
