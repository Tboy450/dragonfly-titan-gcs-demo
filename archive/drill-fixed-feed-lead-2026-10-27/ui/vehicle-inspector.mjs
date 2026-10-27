import { $, chaseRenderer, flightCanvas, state } from "./context.mjs?v=dev";
import { commandFlight } from "../flight-model.mjs?v=dev";
import { samplingSequence } from "../science.mjs?v=dev";
import { focusInspector, inspectionAvailable, inspectionTarget, resetInspector, rotateInspector, panInspector, zoomInspector, wheelZoomInspector,
  inspectionSubassemblies, inspectionSubassembly, selectInspectionSubassembly } from "../vehicle-inspector.mjs?v=dev";
import { globalInspectionLayers, partInspectionLayers, inspectionLayerVisible, setInspectionLayer,
  restoreInspectionLayers, hiddenInspectionCount,applyInspectionAccessPreset,inspectionAccessPreset } from "../inspection-visibility.mjs?v=dev";

const numberedParts = Object.values(chaseRenderer?.subsystems ?? {}).filter(group => group.userData.label);
const parts = [...numberedParts, ...Object.values(chaseRenderer?.subsystems ?? {}).filter(group => group.userData.inspectionTitle && !group.userData.label)];
const partTitle = part => part.userData.label ?? part.userData.inspectionTitle;
const select = $("inspection-part");
const subassemblySelect = $("inspection-subassembly");
let subassemblyTarget;
for (const part of parts) {
  const option = document.createElement("option");
  option.value = part.name;
  option.textContent = partTitle(part);
  select.append(option);
}
const layerControls = [];
for (const [scope, definitions] of [["global", globalInspectionLayers], ["part", partInspectionLayers]]) {
  const parent = $(scope === "global" ? "inspection-global-layers" : "inspection-part-layers");
  for (const { id, label } of definitions) {
    const row = document.createElement("label"), input = document.createElement("input");
    input.type = "checkbox";
    input.id = `inspection-${scope}-${id}`;
    row.append(input, document.createTextNode(label)); parent.append(row);
    input.addEventListener("change", () => {
      const part = scope === "part" ? inspectionTarget(state) : null;
      if (scope === "part" && !part) return;
      setInspectionLayer(state.inspector, id, input.checked, part);
      updateInspectorUI();
    });
    layerControls.push({ input, id, scope });
  }
}
let pointer = null, dragMode = "rotate", moved = false, suppressClick = false, lastX = 0, lastY = 0, startX = 0, startY = 0;
const touches = new Map();
let touchCenter = null;
const centroid = () => {
  const [a,b] = [...touches.values()];
  return {x:(a.x+b.x)/2,y:(a.y+b.y)/2};
};
const available = () => !!chaseRenderer && inspectionAvailable(state);
const rotating = () => available() && state.inspector.rotate;
function releasePointer() {
  const ids = new Set(touches.keys());
  if (pointer !== null) ids.add(pointer);
  pointer = null; touches.clear(); touchCenter = null;
  for (const id of ids) if (flightCanvas.hasPointerCapture(id)) flightCanvas.releasePointerCapture(id);
}
function releaseTouch(id) {
  touches.delete(id); pointer = null; touchCenter = null;
  if (flightCanvas.hasPointerCapture(id)) flightCanvas.releasePointerCapture(id);
  if (touches.size === 1) {
    const [remaining,point] = [...touches][0];
    pointer = remaining; dragMode = "rotate";
    lastX = startX = point.x; lastY = startY = point.y;
    moved = true; suppressClick = true;
  }
}

export function updateInspectorUI() {
  const enabled = available();
  $("vehicle-inspector").hidden = !enabled;
  document.body.classList.toggle("inspection-rotate", enabled && state.inspector.rotate);
  flightCanvas.tabIndex = enabled ? 0 : -1;
  if (!enabled) { releasePointer(); return; }
  const i = state.inspector, target = inspectionTarget(state), job = samplingSequence(state);
  const group = chaseRenderer.subsystems[target], assemblies = inspectionSubassemblies(group);
  $("inspection-subassembly-label").hidden = assemblies.length < 2;
  if (subassemblyTarget !== target) {
    subassemblyTarget = target;
    const all = document.createElement("option"); all.value = ""; all.textContent = "All subassemblies";
    subassemblySelect.replaceChildren(all, ...assemblies.map(child => {
      const option = document.createElement("option"); option.value = child.name;
      option.textContent = child.userData.inspectionLabel; return option;
    }));
  }
  subassemblySelect.value = inspectionSubassembly(group, i)?.name ?? "";
  const hidden = hiddenInspectionCount(i);
  $("inspection-access-preset").value=inspectionAccessPreset(i);
  for (const option of select.options) {
    if (!option.value) continue;
    const part = parts.find(part => part.name === option.value);
    const count = i.hiddenPartLayers?.[option.value]?.length ?? 0;
    const text = `${partTitle(part)}${count ? ` / ${count} hidden` : ""}`;
    if (option.textContent !== text) option.textContent = text;
  }
  $("inspection-hidden-count").textContent = hidden ? `${hidden} hidden` : "All visible";
  $("inspection-restore-layers").disabled = !hidden;
  const partNumber = numberedParts.findIndex(part => part.name === target) + 1;
  $("inspection-part-layer-title").textContent = target
    ? partNumber ? `Component ${String(partNumber).padStart(2, "0")}` : group?.userData.inspectionTitle ?? "Component"
    : "Component (none selected)";
  for (const { input, id, scope } of layerControls) {
    const part = scope === "part" ? target : null;
    const exists = (scope !== "part" || !!target) && chaseRenderer.inspectionLayers.available(id, part);
    input.disabled = !exists;
    input.checked = inspectionLayerVisible(i, id, part);
    input.title = exists ? "" : "No separately modeled layer";
  }
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
$("inspection-access-preset").addEventListener("change",event=>{
  if(event.target.value==="open")focusInspector(state,null);
  applyInspectionAccessPreset(state.inspector,event.target.value);updateInspectorUI();
});
subassemblySelect.addEventListener("change", () => {
  selectInspectionSubassembly(state, chaseRenderer.subsystems[inspectionTarget(state)], subassemblySelect.value);
  updateInspectorUI();
});
$("inspection-focus").addEventListener("click", () => { focusInspector(state, state.selectedPart); updateInspectorUI(); });
$("inspection-reset").addEventListener("click", () => { resetInspector(state.inspector); state.selectedPart = null; releasePointer(); updateInspectorUI(); });
$("inspection-restore-layers").addEventListener("click", () => { restoreInspectionLayers(state.inspector); updateInspectorUI(); });
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
  state.inspector.subassembly = null;
  state.inspector.zoom = 1;
  state.inspector.panX = state.inspector.panY = 0;
  updateInspectorUI();
});
$("inspection-pause").addEventListener("click", () => { commandFlight(state, "hold"); updateInspectorUI(); });

flightCanvas.addEventListener("pointerdown", event => {
  if (!rotating()) return;
  if (event.pointerType === "touch") {
    if ((pointer !== null && !touches.size) || touches.size >= 2) return;
    touches.set(event.pointerId,{x:event.clientX,y:event.clientY});
    flightCanvas.setPointerCapture(event.pointerId);
    dragMode = "rotate";
    if (touches.size === 2) {
      pointer = null; touchCenter = centroid(); moved = true; suppressClick = true;
      return;
    }
  } else {
    if (pointer !== null || touches.size || (event.button !== 0 && !(event.pointerType === "mouse" && event.button === 2))) return;
    dragMode = event.button === 2 ? "pan" : "rotate";
    if (dragMode === "pan") event.preventDefault();
    flightCanvas.setPointerCapture(event.pointerId);
  }
  pointer = event.pointerId; moved = false; suppressClick = false;
  lastX = startX = event.clientX; lastY = startY = event.clientY;
});
flightCanvas.addEventListener("pointermove", event => {
  if (touches.has(event.pointerId)) {
    touches.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if (!rotating()) { releasePointer(); return; }
    if (touches.size === 2) {
      const center = centroid(), rect = flightCanvas.getBoundingClientRect();
      panInspector(state.inspector,center.x-touchCenter.x,center.y-touchCenter.y,rect.width,rect.height);
      touchCenter = center; moved = true; suppressClick = true;
      return;
    }
  }
  if (event.pointerId !== pointer) return;
  if (!rotating()) { releasePointer(); return; }
  if (event.pointerType === "mouse" && event.buttons !== (dragMode === "pan" ? 2 : 1)) { releasePointer(); return; }
  if (!moved && Math.hypot(event.clientX - startX, event.clientY - startY) < 4) return;
  moved = true;
  const rect = flightCanvas.getBoundingClientRect();
  const move = dragMode === "pan" ? panInspector : rotateInspector;
  move(state.inspector, event.clientX - lastX, event.clientY - lastY, rect.width, rect.height);
  lastX = event.clientX; lastY = event.clientY;
});
flightCanvas.addEventListener("pointerup", event => {
  if (touches.has(event.pointerId)) {
    suppressClick = moved || touches.size === 2;
    releaseTouch(event.pointerId);
    return;
  }
  if (event.pointerId !== pointer) return;
  suppressClick = moved;
  releasePointer();
});
flightCanvas.addEventListener("pointercancel", event => {
  if (touches.has(event.pointerId) || pointer === event.pointerId) releasePointer();
});
flightCanvas.addEventListener("lostpointercapture", event => {
  if (touches.has(event.pointerId)) releaseTouch(event.pointerId);
  else if (pointer === event.pointerId) pointer = null;
});
flightCanvas.addEventListener("contextmenu", event => {
  if (rotating()) event.preventDefault();
});
flightCanvas.addEventListener("wheel", event => {
  if (!available() || !wheelZoomInspector(state, event, flightCanvas.clientHeight)) return;
  event.preventDefault();
  updateInspectorUI();
}, { passive: false });
flightCanvas.addEventListener("click", event => {
  if (!suppressClick) return;
  suppressClick = false;
  event.preventDefault(); event.stopImmediatePropagation();
}, true);
flightCanvas.addEventListener("auxclick", event => {
  if (!suppressClick || event.button !== 2) return;
  suppressClick = false;
  event.preventDefault(); event.stopImmediatePropagation();
}, true);
flightCanvas.addEventListener("keydown", event => {
  if (!available() || event.ctrlKey || event.metaKey || event.altKey) return;
  const directions = { ArrowLeft: [-30,0], ArrowRight: [30,0], ArrowUp: [0,-30], ArrowDown: [0,30] };
  if (directions[event.key]) {
    if (event.shiftKey && !rotating()) return;
    const move = event.shiftKey ? panInspector : rotateInspector;
    move(state.inspector, ...directions[event.key], 600, 600);
  }
  else if (event.key === "+" || event.key === "=") zoomInspector(state.inspector, 1.2);
  else if (event.key === "-") zoomInspector(state.inspector, 1 / 1.2);
  else if (event.key === "Home") { resetInspector(state.inspector); state.selectedPart = null; releasePointer(); }
  else return;
  event.preventDefault(); event.stopPropagation(); updateInspectorUI();
});
